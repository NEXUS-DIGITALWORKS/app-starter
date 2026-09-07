import type { Category, CategoryFilters } from '../types';
import { getAncestors } from './categoryTree';

export const DEFAULT_CATEGORY_FILTERS: CategoryFilters = {
  search: '',
  categoryType: 'all',
  isActive: 'all',
  parentId: 'all',
};

function matchesCategory(category: Category, filters: CategoryFilters): boolean {
  if (filters.categoryType !== 'all' && category.categoryType !== filters.categoryType) return false;
  if (filters.isActive === 'active' && !category.isActive) return false;
  if (filters.isActive === 'inactive' && category.isActive) return false;
  if (filters.parentId === 'root' && category.parentId !== null) return false;
  if (filters.parentId !== 'all' && filters.parentId !== 'root' && category.parentId !== filters.parentId) return false;

  const search = filters.search.trim().toLowerCase();
  if (search) {
    const haystack = [category.code, category.nameJa, category.nameEn, category.nameZhTw]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  return true;
}

// ツリー表示では、検索・絞り込みに一致したカテゴリとその祖先だけを表示対象として残す
// （子がヒットしても親カテゴリまでの経路が見えなくならないようにするため）。
export function getVisibleCategoryIds(categories: Category[], filters: CategoryFilters): Set<string> | null {
  const isDefault =
    !filters.search.trim() && filters.categoryType === 'all' && filters.isActive === 'all' && filters.parentId === 'all';
  if (isDefault) return null; // フィルタ未適用時は全件表示（呼び出し側でnullを「制限なし」として扱う）

  const visible = new Set<string>();
  for (const category of categories) {
    if (!matchesCategory(category, filters)) continue;
    visible.add(category.id);
    for (const ancestor of getAncestors(categories, category.id)) visible.add(ancestor.id);
  }
  return visible;
}
