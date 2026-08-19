import { CATEGORY_ISSUE_LABELS } from '../lib/categoryIssueRules';
import type { CategoryIssueType } from '../types/categoryIssue';

// 課題の性質ごとに配色を分け、表内で種類を目視しやすくする（DESIGN.mdの既存配色パレットを踏襲）。
const STYLE: Record<CategoryIssueType, string> = {
  low_product_count: 'text-[#B45309] bg-[#FFFBEB]',
  low_sales_1y: 'text-[#B54708] bg-[#FFF3E6]',
  missing_locale_name: 'text-[#6941C6] bg-[#F9F5FF]',
  missing_description: 'text-[#6941C6] bg-[#F9F5FF]',
  orphaned_active_child: 'text-[#B42318] bg-[#FEF3F2]',
};

export default function CategoryIssueBadge({ type }: { type: CategoryIssueType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STYLE[type]}`}>
      {CATEGORY_ISSUE_LABELS[type]}
    </span>
  );
}
