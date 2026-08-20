import { PRODUCT_ISSUE_LABELS } from '../lib/productIssueRules';
import type { ProductIssueType } from '../types/productIssue';

// 課題の性質ごとに配色を分け、表内で種類を目視しやすくする（DESIGN.mdの既存配色パレットを踏襲）。
const STYLE: Record<ProductIssueType, string> = {
  name_en_has_cjk: 'text-[#6941C6] bg-[#F9F5FF]',
  name_zh_tw_same_as_en: 'text-[#6941C6] bg-[#F9F5FF]',
  no_sales_2y: 'text-[#B54708] bg-[#FFF3E6]',
  short_description_locale_swap: 'text-[#B42318] bg-[#FEF3F2]',
  short_description_ja_locale_wrong: 'text-[#B42318] bg-[#FEF3F2]',
  description_locale_swap: 'text-[#B42318] bg-[#FEF3F2]',
  short_description_too_short: 'text-[#B45309] bg-[#FFFBEB]',
  description_too_short: 'text-[#B45309] bg-[#FFFBEB]',
};

export default function ProductIssueBadge({ type }: { type: ProductIssueType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STYLE[type]}`}>
      {PRODUCT_ISSUE_LABELS[type]}
    </span>
  );
}
