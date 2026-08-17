import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, Clock, Globe2, Package, ShieldAlert } from 'lucide-react';
import type { ProductListSummary } from '../types/product';

interface KpiCardDef {
  key: keyof ProductListSummary;
  label: string;
  icon: LucideIcon;
  accent: string;
  delta: string;
}

// deltaはMVP1では固定表示（実データ接続時は前月比などの実値に置き換える）
const CARD_DEFS: KpiCardDef[] = [
  { key: 'total', label: '全商品数', icon: Package, accent: 'text-[#3157E5] bg-[#EEF0FE]', delta: '+12 今月' },
  { key: 'needsReview', label: '要確認', icon: AlertTriangle, accent: 'text-[#B54708] bg-[#FFF3E6]', delta: '+8' },
  { key: 'seoIssues', label: 'SEO課題あり', icon: ShieldAlert, accent: 'text-[#B42318] bg-[#FEF3F2]', delta: '+24' },
  { key: 'published', label: '公開中', icon: CheckCircle2, accent: 'text-[#059669] bg-[#ECFDF5]', delta: '+16' },
  { key: 'untranslated', label: '未翻訳', icon: Globe2, accent: 'text-[#6941C6] bg-[#F9F5FF]', delta: '-5' },
  { key: 'approvalPending', label: '承認待ち', icon: Clock, accent: 'text-[#B45309] bg-[#FFFBEB]', delta: '+3' },
];

interface ProductSummaryCardsProps {
  summary: ProductListSummary | null;
}

export default function ProductSummaryCards({ summary }: ProductSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {CARD_DEFS.map(({ key, label, icon: Icon, accent, delta }) => {
        const value = summary ? summary[key] : null;
        const isPositive = !delta.startsWith('-');
        return (
          <div key={key} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                <Icon size={16} />
              </span>
              <span className="truncate text-xs font-medium text-[#667085]">{label}</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#111827]">{value ?? '—'}</span>
              <span className={`text-xs font-medium ${isPositive ? 'text-[#059669]' : 'text-[#B42318]'}`}>{delta}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
