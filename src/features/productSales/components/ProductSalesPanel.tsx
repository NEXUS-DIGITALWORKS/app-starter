import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { aggregateSalesByGranularity } from '../lib/aggregateSales';
import { collectCustomerTypes, summarizeSalesRecords } from '../lib/summarizeSales';
import type { ProductSalePeriodSummary, ProductSaleRecord, SalesGranularity } from '../types/productSales';
import type { SalesEvent } from '../types/salesEvents';

const ROWS_PER_PAGE = 100;
// 折れ線に点を打つと日次の点数が多い商品では線が点だらけになるため、点数がこれを超えたら点を消して線のみにする。
const MAX_DOTS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;
// イベント帯のラベルが重ならないよう最大3段まで縦にずらす（4件目以降は3段目に重ねて表示）。
const MAX_EVENT_LANES = 3;
// dataviz向けカテゴリカラー8色のうち、売上グラフの折れ線が使う青（スロット1）を除いた7色。
// CVD分離・視認性ともに「隣接ペア」を検証済みの並び順のため、開始日順に隣り合うイベントへ
// この順番のまま割り当てる（validate_palette.js --pairs adjacent, 8割り当ての7スロットでPASS）。
const EVENT_COLORS = ['#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];

interface ProductSalesPanelProps {
  records: ProductSaleRecord[] | null | undefined;
  events?: SalesEvent[];
}

type ChartPoint = ProductSalePeriodSummary & { ts: number };

const GRANULARITY_OPTIONS: { value: SalesGranularity; label: string }[] = [
  { value: 'daily', label: '日次' },
  { value: 'monthly', label: '月次' },
  { value: 'yearly', label: '年次' },
];

// customer_typeの実データが"new"/"existing"以外の表記の場合はラベルなしでそのまま表示する。
const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  new: '新規',
  existing: '既存',
};

function customerTypeLabel(value: string): string {
  return CUSTOMER_TYPE_LABELS[value] ?? value;
}

function formatYen(value: number): string {
  return `¥${Math.round(value).toLocaleString('ja-JP')}`;
}

function formatPeriod(period: string, granularity: SalesGranularity): string {
  if (granularity === 'yearly') return `${period}年`;
  if (granularity === 'monthly') {
    const [year, month] = period.split('-');
    return `${year}年${Number(month)}月`;
  }
  return period;
}

// sale_date/イベントの開始日・終了日はタイムゾーンを持たないカレンダー日付のため、
// ローカルタイムゾーンの影響を受けないようUTC基準のタイムスタンプに変換して扱う。
function dateStringToUtcMs(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function periodToUtcMs(period: string, granularity: SalesGranularity): number {
  if (granularity === 'yearly') return Date.UTC(Number(period), 0, 1);
  if (granularity === 'monthly') {
    const [y, m] = period.split('-').map(Number);
    return Date.UTC(y, m - 1, 1);
  }
  return dateStringToUtcMs(period);
}

// グラフの横軸は連続した時間軸（数値）のため、目盛りは軸の数値から日付文字列を組み立て直す。
function formatTimestampTick(ts: number, granularity: SalesGranularity): string {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  if (granularity === 'yearly') return `${y}年`;
  const m = d.getUTCMonth() + 1;
  if (granularity === 'monthly') return `${y}年${m}月`;
  return `${y}-${String(m).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

interface EventLayout {
  lane: number;
  color: string;
  number: number;
}

// 凡例をコンパクトにするため、開始日と終了日で重複する年・月は終了日側を省略する
// （例: 2025-01-24〜03-12、同月なら2025-01-24〜28）。年をまたぐ場合はどちらも略さない。
function formatEventRange(event: SalesEvent): string {
  const [startYear, startMonth] = event.startDate.split('-');
  const [endYear, endMonth, endDay] = event.endDate.split('-');
  if (startYear !== endYear) return `${event.startDate}〜${event.endDate}`;
  if (startMonth !== endMonth) return `${event.startDate}〜${endMonth}-${endDay}`;
  return `${event.startDate}〜${endDay}`;
}

// イベント帯が時期的に重なる場合は番号バッジが重ならないよう区間スケジューリングで段（レーン）を
// 割り当て、開始日順に連番と色（隣り合うイベントほど隣接した色になる並び）を割り振る。
// 名前を直接文字で置かず番号バッジのみをグラフ上に置くことで、帯が狭いイベントが密集していても
// 文字が重なって判読不能になることがない（名称・期間はグラフ下の凡例側で確認する）。
function assignEventLayout(ranges: { start: number; end: number }[]): EventLayout[] {
  const laneEndByIndex: number[] = [];
  const layout = new Array<EventLayout>(ranges.length);
  const order = ranges.map((_, i) => i).sort((a, b) => ranges[a].start - ranges[b].start);

  order.forEach((i, rank) => {
    const range = ranges[i];
    let lane = laneEndByIndex.findIndex((end) => end <= range.start);
    if (lane === -1) {
      lane = laneEndByIndex.length;
      laneEndByIndex.push(range.end);
    } else {
      laneEndByIndex[lane] = range.end;
    }
    layout[i] = { lane: lane % MAX_EVENT_LANES, color: EVENT_COLORS[rank % EVENT_COLORS.length], number: rank + 1 };
  });
  return layout;
}

function QtyTrendTooltip({ active, payload }: TooltipContentProps, granularity: SalesGranularity) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm">
      <p className="text-xs text-[#98A2B3]">{formatPeriod(point.period, granularity)}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#111827]">{point.qtyOrdered.toLocaleString('ja-JP')}個</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <p className="text-xs text-[#98A2B3]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

export default function ProductSalesPanel({ records, events = [] }: ProductSalesPanelProps) {
  const [granularity, setGranularity] = useState<SalesGranularity>('daily');
  const [customerType, setCustomerType] = useState('all');
  const [page, setPage] = useState(1);
  const [showEvents, setShowEvents] = useState(true);

  const customerTypeOptions = useMemo(() => (records ? collectCustomerTypes(records) : []), [records]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return customerType === 'all' ? records : records.filter((r) => r.customerType === customerType);
  }, [records, customerType]);

  const summary = useMemo(() => summarizeSalesRecords(filteredRecords), [filteredRecords]);

  const periodSummaries = useMemo(
    () => aggregateSalesByGranularity(summary.dailySummaries, granularity),
    [summary, granularity],
  );

  // periodSummariesは表用に新しい期間が先頭（降順）のため、グラフは時系列順（古い→新しい）に並べ替える。
  const chartData: ChartPoint[] = useMemo(
    () => [...periodSummaries].reverse().map((row) => ({ ...row, ts: periodToUtcMs(row.period, granularity) })),
    [periodSummaries, granularity],
  );

  // 表示中の期間に重なるイベントだけを対象に、開始日昇順で帯を重ねる位置（レーン）を割り当てる。
  const visibleEvents = useMemo(() => {
    if (chartData.length === 0 || events.length === 0) return [];
    const minTs = chartData[0].ts;
    const maxTs = chartData[chartData.length - 1].ts;
    return events
      .map((event) => ({
        event,
        start: dateStringToUtcMs(event.startDate),
        end: dateStringToUtcMs(event.endDate) + DAY_MS,
      }))
      .filter(({ start, end }) => end >= minTs && start <= maxTs);
  }, [events, chartData]);

  const eventLayout = useMemo(
    () => assignEventLayout(visibleEvents.map(({ start, end }) => ({ start, end }))),
    [visibleEvents],
  );

  const pageCount = Math.max(1, Math.ceil(periodSummaries.length / ROWS_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [granularity, customerType]);

  const pagedSummaries = useMemo(
    () => periodSummaries.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
    [periodSummaries, page],
  );

  if (records === undefined) {
    return <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#667085]">売上データを読み込み中...</div>;
  }

  if (records === null || records.length === 0) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#667085]">
        この商品の売上データはまだ取り込まれていません。商品一覧の「売上データ取込」からCSVを取り込んでください。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[#667085]">顧客区分</span>
        <Select value={customerType} onValueChange={setCustomerType}>
          <SelectTrigger className="h-8 w-[140px] text-xs" aria-label="顧客区分">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {customerTypeOptions.map((value) => (
              <SelectItem key={value} value={value}>
                {customerTypeLabel(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="累計販売数量" value={`${summary.totalQtyOrdered.toLocaleString('ja-JP')}個`} />
        <StatCard label="累計売上金額" value={formatYen(summary.totalSalesAmount)} />
        <StatCard label="注文件数" value={`${summary.orderCount.toLocaleString('ja-JP')}件`} />
        <StatCard label="平均単価" value={summary.averageUnitPrice != null ? formatYen(summary.averageUnitPrice) : '-'} />
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#111827]">売上推移</h3>
          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 border-[#D0D5DD] px-2 text-xs text-[#475467]"
                onClick={() => setShowEvents((v) => !v)}
              >
                {showEvents ? <Eye size={13} /> : <EyeOff size={13} />}
                イベント
              </Button>
            )}
            <div className="inline-flex rounded-lg border border-[#D0D5DD] p-0.5">
              {GRANULARITY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={granularity === opt.value ? 'default' : 'ghost'}
                  className={
                    granularity === opt.value
                      ? 'h-7 bg-[#3157E5] px-3 text-xs hover:bg-[#2748C7] hover:opacity-100'
                      : 'h-7 px-3 text-xs text-[#475467]'
                  }
                  onClick={() => setGranularity(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <p className="mb-2 text-xs text-[#667085]">数量（個）の推移</p>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EEF0F4" />
              {showEvents &&
                visibleEvents.map(({ event, start, end }, i) => {
                  const { lane, color, number } = eventLayout[i];
                  return (
                    <ReferenceArea
                      key={event.id}
                      x1={start}
                      x2={end}
                      ifOverflow="hidden"
                      fill={color}
                      fillOpacity={0.14}
                      stroke={color}
                      strokeOpacity={0.5}
                      strokeWidth={1}
                      label={(props: { viewBox?: { x: number; y: number; width: number } }) => {
                        const viewBox = props.viewBox;
                        if (!viewBox) return <g />;
                        const cx = viewBox.x + viewBox.width / 2;
                        const cy = viewBox.y + 10 + lane * 20;
                        return (
                          <g>
                            <circle cx={cx} cy={cy} r={9} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />
                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="#FFFFFF">
                              {number}
                            </text>
                          </g>
                        );
                      }}
                    />
                  );
                })}
              <XAxis
                dataKey="ts"
                type="number"
                domain={['dataMin', 'dataMax']}
                scale="time"
                tickFormatter={(value) => formatTimestampTick(Number(value), granularity)}
                tick={{ fontSize: 11, fill: '#98A2B3' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#98A2B3' }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(value) => Number(value).toLocaleString('ja-JP')}
              />
              <Tooltip
                cursor={{ stroke: '#D0D5DD', strokeWidth: 1 }}
                content={(props) => QtyTrendTooltip(props, granularity)}
              />
              <Line
                type="monotone"
                dataKey="qtyOrdered"
                stroke="#3157E5"
                strokeWidth={2}
                isAnimationActive={false}
                dot={chartData.length <= MAX_DOTS ? { r: 4, fill: '#3157E5', stroke: '#FFFFFF', strokeWidth: 2 } : false}
                activeDot={{ r: 5, fill: '#3157E5', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {showEvents && visibleEvents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#EEF0F4] pt-3">
            {visibleEvents.map(({ event }, i) => (
              <div
                key={event.id}
                className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] py-1 pl-1 pr-2.5 text-xs"
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: eventLayout[i].color }}
                >
                  {eventLayout[i].number}
                </span>
                <span className="font-medium text-[#344054]">{event.name}</span>
                <span className="whitespace-nowrap text-[#98A2B3]">{formatEventRange(event)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#EEF0F4] text-left text-xs text-[#98A2B3]">
                <th className="py-2 pr-4 font-medium">期間</th>
                <th className="py-2 pr-4 font-medium">数量</th>
                <th className="py-2 pr-4 font-medium">単価</th>
                <th className="py-2 pr-4 font-medium">売上金額</th>
                <th className="py-2 pr-4 font-medium">割引額</th>
                <th className="py-2 pr-4 font-medium">注文件数</th>
              </tr>
            </thead>
            <tbody>
              {pagedSummaries.map((row) => (
                <tr key={row.period} className="border-b border-[#EEF0F4] last:border-0">
                  <td className="py-2 pr-4 font-medium text-[#344054]">{formatPeriod(row.period, granularity)}</td>
                  <td className="py-2 pr-4 text-[#344054]">{row.qtyOrdered.toLocaleString('ja-JP')}</td>
                  <td className="py-2 pr-4 text-[#344054]">{row.unitPrice != null ? formatYen(row.unitPrice) : '-'}</td>
                  <td className="py-2 pr-4 text-[#344054]">{formatYen(row.salesAmount)}</td>
                  <td className="py-2 pr-4 text-[#344054]">{row.discountAmount > 0 ? formatYen(row.discountAmount) : '-'}</td>
                  <td className="py-2 pr-4 text-[#344054]">{row.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-7 border-[#D0D5DD] p-0 text-[#475467]"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="text-xs text-[#667085]">
              {page} / {pageCount}ページ
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-7 border-[#D0D5DD] p-0 text-[#475467]"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
