import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_TYPE_LABEL } from '../lib/categoryName';
import { CATEGORY_TYPES } from '../types';
import type { CategoryActiveFilter, CategoryType } from '../types';

interface CategoryFiltersProps {
  categoryType: CategoryType | 'all';
  onCategoryTypeChange: (value: CategoryType | 'all') => void;
  isActive: CategoryActiveFilter;
  onIsActiveChange: (value: CategoryActiveFilter) => void;
}

export default function CategoryFilters({ categoryType, onCategoryTypeChange, isActive, onIsActiveChange }: CategoryFiltersProps) {
  return (
    <div className="flex gap-2">
      <Select value={categoryType} onValueChange={(v) => onCategoryTypeChange(v as CategoryType | 'all')}>
        <SelectTrigger className="h-9 flex-1 text-xs">
          <SelectValue placeholder="種別" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべての種別</SelectItem>
          {CATEGORY_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {CATEGORY_TYPE_LABEL[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={isActive} onValueChange={(v) => onIsActiveChange(v as CategoryActiveFilter)}>
        <SelectTrigger className="h-9 flex-1 text-xs">
          <SelectValue placeholder="状態" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべての状態</SelectItem>
          <SelectItem value="active">有効のみ</SelectItem>
          <SelectItem value="inactive">無効のみ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
