import { AlertTriangle, Languages, Repeat, ShoppingCart, Type } from 'lucide-react';
import { PRODUCT_ISSUE_LABELS } from '../lib/productIssueRules';
import type { ProductIssueType } from '../types/productIssue';

const ICON_BY_TYPE: Record<ProductIssueType, typeof AlertTriangle> = {
  name_en_has_cjk: Languages,
  name_zh_tw_same_as_en: Languages,
  no_sales_2y: ShoppingCart,
  short_description_locale_swap: Repeat,
  short_description_ja_locale_wrong: Repeat,
  description_locale_swap: Repeat,
  short_description_too_short: Type,
  description_too_short: Type,
};

interface ProductIssueSummaryCardsProps {
  totalIssueProducts: number;
  issueCounts: Record<ProductIssueType, number>;
  isLoading: boolean;
}

export default function ProductIssueSummaryCards({ totalIssueProducts, issueCounts, isLoading }: ProductIssueSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FEF3F2] text-[#B42318]">
            <AlertTriangle size={13} />
          </span>
          <span className="truncate text-xs font-medium text-[#667085]">改善候補商品数</span>
        </div>
        <div className="mt-1.5 text-lg font-bold text-[#111827]">{isLoading ? '—' : totalIssueProducts.toLocaleString()}</div>
      </div>

      {(Object.entries(PRODUCT_ISSUE_LABELS) as [ProductIssueType, string][]).map(([type, label]) => {
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
