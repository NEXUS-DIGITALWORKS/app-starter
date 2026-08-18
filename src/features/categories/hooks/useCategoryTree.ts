import { useEffect, useMemo, useState } from 'react';
import { fetchCategories, fetchCategoryProductCounts } from '../api/categoriesApi';
import { buildCategoryTree } from '../lib/categoryTree';
import { DEFAULT_CATEGORY_FILTERS, getVisibleCategoryIds } from '../lib/categoryFilter';
import type { Category, CategoryFilters, CategoryTreeNode } from '../types';

const DEBOUNCE_MS = 300;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function useCategoryTree() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);
  const [filters, setFilters] = useState<CategoryFilters>(DEFAULT_CATEGORY_FILTERS);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    Promise.all([fetchCategories(), fetchCategoryProductCounts()]).then(([cats, counts]) => {
      if (ignore) return;
      setCategories(cats);
      setProductCounts(counts);
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const activeFilters = useMemo<CategoryFilters>(() => ({ ...filters, search: debouncedSearch }), [filters, debouncedSearch]);

  const tree = useMemo(() => buildCategoryTree(categories, productCounts), [categories, productCounts]);
  const visibleIds = useMemo(() => getVisibleCategoryIds(categories, activeFilters), [categories, activeFilters]);

  // 検索・絞り込みでヒットしたカテゴリがある場合は、その経路を自動的に開く。
  useEffect(() => {
    if (!visibleIds) return;
    setExpandedIds((prev) => new Set([...prev, ...visibleIds]));
  }, [visibleIds]);

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setCategoryType = (categoryType: CategoryFilters['categoryType']) => setFilters((prev) => ({ ...prev, categoryType }));
  const setIsActive = (isActive: CategoryFilters['isActive']) => setFilters((prev) => ({ ...prev, isActive }));
  const setParentId = (parentId: CategoryFilters['parentId']) => setFilters((prev) => ({ ...prev, parentId }));
  const clearFilters = () => {
    setSearchInput('');
    setFilters(DEFAULT_CATEGORY_FILTERS);
  };

  const reload = () => setReloadKey((n) => n + 1);

  return {
    categories,
    tree,
    productCounts,
    isLoading,
    reload,
    searchInput,
    setSearchInput,
    filters,
    setCategoryType,
    setIsActive,
    setParentId,
    clearFilters,
    visibleIds,
    expandedIds,
    toggleExpand,
  };
}

export type UseCategoryTreeReturn = ReturnType<typeof useCategoryTree>;
export type { CategoryTreeNode };
