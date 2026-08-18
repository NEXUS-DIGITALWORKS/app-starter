import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_STATUS_OPTIONS } from './ProductStatusBadge';
import { useCategoryFilterOptions } from '../../categories/hooks/useCategoryFilterOptions';
import { getCategoryDisplayName } from '../../categories/lib/categoryName';
import type { ProductListFilters, ProductStatus, SeoIssueType, UpdatedWithinFilter } from '../types/product';

const SEO_ISSUE_OPTIONS: { value: SeoIssueType; label: string }[] = [
  { value: 'none', label: '課題なし' },
  { value: 'warning', label: 'SEO警告あり' },
  { value: 'missing', label: '不足情報あり' },
  { value: 'unrated', label: '未評価' },
];

const UPDATED_WITHIN_OPTIONS: { value: UpdatedWithinFilter; label: string }[] = [
  { value: 'all', label: 'すべての期間' },
  { value: 'today', label: '本日' },
  { value: '7d', label: '7日以内' },
  { value: '30d', label: '30日以内' },
];

interface ProductFilterSidebarProps {
  filters: ProductListFilters;
  onToggleStatus: (status: ProductStatus) => void;
  onToggleSeoIssue: (issue: SeoIssueType) => void;
  onClearStatus: () => void;
  onClearSeoIssue: () => void;
  onCategoryChange: (value: string) => void;
  onUpdatedWithinChange: (value: UpdatedWithinFilter) => void;
  onClear: () => void;
}

export default function ProductFilterSidebar({
  filters,
  onToggleStatus,
  onToggleSeoIssue,
  onClearStatus,
  onClearSeoIssue,
  onCategoryChange,
  onUpdatedWithinChange,
  onClear,
}: ProductFilterSidebarProps) {
  const { categories } = useCategoryFilterOptions();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 rounded-xl border border-[#E5E7EB] bg-white p-4 lg:w-[220px]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#111827]">絞り込み</h2>
        <button type="button" onClick={onClear} className="text-xs font-medium text-[#3157E5] hover:underline">
          すべてクリア
        </button>
      </div>

      <fieldset className="space-y-2.5">
        <legend className="mb-1 text-xs font-semibold text-[#667085]">ステータス</legend>
        <label className="flex items-center gap-2 text-sm text-[#344054]">
          <Checkbox checked={filters.status.length === 0} onChange={onClearStatus} />
          すべて
        </label>
        {PRODUCT_STATUS_OPTIONS.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm text-[#344054]">
            <Checkbox checked={filters.status.includes(opt.value)} onChange={() => onToggleStatus(opt.value)} />
            {opt.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2.5">
        <legend className="mb-1 text-xs font-semibold text-[#667085]">SEO課題</legend>
        <label className="flex items-center gap-2 text-sm text-[#344054]">
          <Checkbox checked={filters.seoIssue.length === 0} onChange={onClearSeoIssue} />
          すべて
        </label>
        {SEO_ISSUE_OPTIONS.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm text-[#344054]">
            <Checkbox checked={filters.seoIssue.includes(opt.value)} onChange={() => onToggleSeoIssue(opt.value)} />
            {opt.label}
          </label>
        ))}
      </fieldset>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#667085]" htmlFor="filter-category">
          カテゴリ
        </label>
        <Select value={filters.category} onValueChange={onCategoryChange}>
          <SelectTrigger id="filter-category" className="h-9 w-full">
            <SelectValue placeholder="すべて" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code} - {getCategoryDisplayName(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#667085]" htmlFor="filter-updated">
          更新日
        </label>
        <Select value={filters.updatedWithin} onValueChange={(v) => onUpdatedWithinChange(v as UpdatedWithinFilter)}>
          <SelectTrigger id="filter-updated" className="h-9 w-full">
            <SelectValue placeholder="すべての期間" />
          </SelectTrigger>
          <SelectContent>
            {UPDATED_WITHIN_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button className="w-full">絞り込む</Button>
    </aside>
  );
}
