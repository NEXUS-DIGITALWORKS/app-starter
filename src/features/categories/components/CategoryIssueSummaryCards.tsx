import { AlertTriangle, FileText, Languages, Package, TrendingDown, Unlink } from 'lucide-react';
import { CATEGORY_ISSUE_LABELS } from '../lib/categoryIssueRules';
import type { CategoryIssueType } from '../types/categoryIssue';

const ICON_BY_TYPE: Record<CategoryIssueType, typeof AlertTriangle> = {
  low_product_count: Package,
  low_sales_1y: TrendingDown,
  missing_locale_name: Languages,
  missing_description: FileText,
  orphaned_active_child: Unlink,
};

interface CategoryIssueSummaryCardsProps {
  totalIssueCategories: number;
  issueCounts: Record<CategoryIssueType, number>;
  isLoading: boolean;
}

export default function CategoryIssueSummaryCards({ totalIssueCategories, issueCounts, isLoading }: CategoryIssueSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
      <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FEF3F2] text-[#B42318]">
            <AlertTriangle size={13} />
          </span>
          <span className="truncate text-xs font-medium text-[#667085]">改善候補カテゴリ数</span>
        </div>
        <div className="mt-1.5 text-lg font-bold text-[#111827]">{isLoading ? '—' : totalIssueCategories.toLocaleString()}</div>
      </div>

      {(Object.entries(CATEGORY_ISSUE_LABELS) as [CategoryIssueType, string][]).map(([type, label]) => {
        const Icon = ICON_BY_TYPE[type];
        return (
          <div key={type} className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#667085]">
                <Icon size={13} />
              </span>
              <span className="truncate text-xs font-medium text-[#667085]" title={label}>
                {label}
              </span>
            </div>
            <div className="mt-1.5 text-lg font-bold text-[#111827]">{isLoading ? '—' : issueCounts[type].toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
}
