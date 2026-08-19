import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { aggregateSalesByGranularity } from '../lib/aggregateSales';
import { collectCustomerTypes, summarizeSalesRecords } from '../lib/summarizeSales';
import type { ProductSaleRecord, SalesGranularity } from '../types/productSales';

interface ProductSalesPanelProps {
  records: ProductSaleRecord[] | null | undefined;
}

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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <p className="text-xs text-[#98A2B3]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

export default function ProductSalesPanel({ records }: ProductSalesPanelProps) {
  const [granularity, setGranularity] = useState<SalesGranularity>('daily');
  const [customerType, setCustomerType] = useState('all');

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
        <div className="overflow-x-auto">
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
              {periodSummaries.map((row) => (
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
      </div>
    </div>
  );
}
