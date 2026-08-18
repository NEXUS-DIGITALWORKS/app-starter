import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_STATUS_OPTIONS } from './ProductStatusBadge';
import CategoryFilterDialog from './CategoryFilterDialog';
import type { Category } from '../../categories/types';
import type { NameLocale, ProductListFilters, ProductStatus, UpdatedWithinFilter } from '../types/product';

const NAME_LOCALE_OPTIONS: { value: NameLocale; label: string }[] = [
  { value: 'ja', label: '日本語' },
  { value: 'zh_tw', label: '繁体字' },
  { value: 'en', label: '英語' },
];
const UPDATED_WITHIN_OPTIONS: { value: UpdatedWithinFilter; label: string }[] = [
  { value: 'today', label: '本日' },
  { value: '7d', label: '7日以内' },
  { value: '30d', label: '30日以内' },
];

interface ProductListToolbarProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  ingredientInput: string;
  onIngredientInputChange: (value: string) => void;
  filters: ProductListFilters;
  availableTags: string[];
  categoryOptions: Category[];
  nameLocale: NameLocale;
  onNameLocaleChange: (value: NameLocale) => void;
  onSingleStatusChange: (value: ProductStatus | 'all') => void;
  onTagChange: (value: string) => void;
  onToggleCategory: (categoryId: string) => void;
  onClearCategory: () => void;
  onUpdatedWithinChange: (value: UpdatedWithinFilter) => void;
  onShortDescriptionLengthMinChange: (value: number | null) => void;
  onShortDescriptionLengthMaxChange: (value: number | null) => void;
  onDescriptionLengthMinChange: (value: number | null) => void;
  onDescriptionLengthMaxChange: (value: number | null) => void;
  onClear: () => void;
}

function parseLengthInput(value: string): number | null {
  return value === '' ? null : Number(value);
}

function LengthRangeField({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  min: number | null;
  max: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
}) {
  return (
    <FilterField label={label}>
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={0}
          value={min ?? ''}
          onChange={(e) => onMinChange(parseLengthInput(e.target.value))}
          placeholder="最小"
          className="h-9 w-20"
          aria-label={`${label}の最小値`}
        />
        <span className="text-xs text-[#98A2B3]">〜</span>
        <Input
          type="number"
          min={0}
          value={max ?? ''}
          onChange={(e) => onMaxChange(parseLengthInput(e.target.value))}
          placeholder="最大"
          className="h-9 w-20"
          aria-label={`${label}の最大値`}
        />
      </div>
    </FilterField>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[#667085]">{label}</span>
      {children}
    </div>
  );
}

export default function ProductListToolbar({
  searchInput,
  onSearchInputChange,
  ingredientInput,
  onIngredientInputChange,
  filters,
  availableTags,
  categoryOptions,
  nameLocale,
  onNameLocaleChange,
  onSingleStatusChange,
  onTagChange,
  onToggleCategory,
  onClearCategory,
  onUpdatedWithinChange,
  onShortDescriptionLengthMinChange,
  onShortDescriptionLengthMaxChange,
  onDescriptionLengthMinChange,
  onDescriptionLengthMaxChange,
  onClear,
}: ProductListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <Input
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="商品名・説明・SKUで検索"
            className="h-10 pl-9"
            aria-label="商品名・説明・SKUで検索"
          />
        </div>
        <div className="relative w-full lg:w-60">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <Input
            value={ingredientInput}
            onChange={(e) => onIngredientInputChange(e.target.value)}
            placeholder="成分で検索（例: グリチルリチン酸2K）"
            className="h-10 pl-9"
            aria-label="成分で検索"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <FilterField label="商品名の言語">
          <Select value={nameLocale} onValueChange={(v) => onNameLocaleChange(v as NameLocale)}>
            <SelectTrigger className="h-9 w-[120px]" aria-label="商品名の言語">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NAME_LOCALE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="ステータス">
          <Select value={filters.status[0] ?? 'all'} onValueChange={(v) => onSingleStatusChange(v as ProductStatus | 'all')}>
            <SelectTrigger className="h-9 w-[140px]" aria-label="ステータス">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {PRODUCT_STATUS_OPTIONS.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="タグ">
          <Select value={filters.tag} onValueChange={onTagChange}>
            <SelectTrigger className="h-9 w-[140px]" aria-label="タグ">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="カテゴリ（複数選択可）">
          <CategoryFilterDialog
            categoryOptions={categoryOptions}
            selectedIds={filters.categoryIds}
            onToggle={onToggleCategory}
            onClear={onClearCategory}
          />
        </FilterField>

        <FilterField label="更新日">
          <Select value={filters.updatedWithin} onValueChange={(v) => onUpdatedWithinChange(v as UpdatedWithinFilter)}>
            <SelectTrigger className="h-9 w-[140px]" aria-label="更新日">
              <SelectValue placeholder="すべての期間" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての期間</SelectItem>
              {UPDATED_WITHIN_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <LengthRangeField
          label="Short Description文字数"
          min={filters.shortDescriptionLengthMin}
          max={filters.shortDescriptionLengthMax}
          onMinChange={onShortDescriptionLengthMinChange}
          onMaxChange={onShortDescriptionLengthMaxChange}
        />

        <LengthRangeField
          label="Description文字数"
          min={filters.descriptionLengthMin}
          max={filters.descriptionLengthMax}
          onMinChange={onDescriptionLengthMinChange}
          onMaxChange={onDescriptionLengthMaxChange}
        />

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClear} className="text-[#475467]">
            <X size={14} />
            検索条件をクリア
          </Button>
        </div>
      </div>
    </div>
  );
}
