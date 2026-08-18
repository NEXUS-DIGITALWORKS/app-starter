import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_STATUS_OPTIONS } from './ProductStatusBadge';
import { fetchAvailableBrands } from '../api/productListApi';
import type { ProductListFilters, ProductStatus, SeoIssueType } from '../types/product';

const STORE_VIEW_OPTIONS = ['Japan Store View', 'Taiwan Store View', 'English Store View'];
const SEO_ISSUE_OPTIONS: { value: SeoIssueType; label: string }[] = [
  { value: 'none', label: '課題なし' },
  { value: 'warning', label: 'SEO警告あり' },
  { value: 'missing', label: '不足情報あり' },
  { value: 'unrated', label: '未評価' },
];

interface ProductListToolbarProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  skuInput: string;
  onSkuInputChange: (value: string) => void;
  ingredientInput: string;
  onIngredientInputChange: (value: string) => void;
  filters: ProductListFilters;
  availableTags: string[];
  onStoreViewChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onSingleStatusChange: (value: ProductStatus | 'all') => void;
  onSingleSeoIssueChange: (value: SeoIssueType | 'all') => void;
  onTagChange: (value: string) => void;
  onClear: () => void;
}

export default function ProductListToolbar({
  searchInput,
  onSearchInputChange,
  skuInput,
  onSkuInputChange,
  ingredientInput,
  onIngredientInputChange,
  filters,
  availableTags,
  onStoreViewChange,
  onBrandChange,
  onSingleStatusChange,
  onSingleSeoIssueChange,
  onTagChange,
  onClear,
}: ProductListToolbarProps) {
  const [brandOptions, setBrandOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchAvailableBrands().then(setBrandOptions);
  }, []);

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
            value={skuInput}
            onChange={(e) => onSkuInputChange(e.target.value)}
            placeholder="SKUで検索"
            className="h-10 pl-9"
            aria-label="SKUで検索"
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

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.storeView} onValueChange={onStoreViewChange}>
          <SelectTrigger className="h-9 w-[168px]" aria-label="Store View">
            <SelectValue placeholder="Store View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {STORE_VIEW_OPTIONS.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.brand} onValueChange={onBrandChange}>
          <SelectTrigger className="h-9 w-[140px]" aria-label="ブランド">
            <SelectValue placeholder="ブランド" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {brandOptions.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status[0] ?? 'all'} onValueChange={(v) => onSingleStatusChange(v as ProductStatus | 'all')}>
          <SelectTrigger className="h-9 w-[140px]" aria-label="ステータス">
            <SelectValue placeholder="ステータス" />
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

        <Select value={filters.seoIssue[0] ?? 'all'} onValueChange={(v) => onSingleSeoIssueChange(v as SeoIssueType | 'all')}>
          <SelectTrigger className="h-9 w-[150px]" aria-label="SEO課題">
            <SelectValue placeholder="SEO課題" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {SEO_ISSUE_OPTIONS.map((v) => (
              <SelectItem key={v.value} value={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.tag} onValueChange={onTagChange}>
          <SelectTrigger className="h-9 w-[140px]" aria-label="タグ">
            <SelectValue placeholder="タグ" />
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

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClear} className="text-[#475467]">
            <X size={14} />
            検索条件をクリア
          </Button>
          <Button variant="outline" size="sm" className="border-[#D0D5DD] text-[#475467]">
            <SlidersHorizontal size={14} />
            詳細検索
          </Button>
        </div>
      </div>
    </div>
  );
}
