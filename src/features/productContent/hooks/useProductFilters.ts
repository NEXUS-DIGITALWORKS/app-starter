import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addTagToProducts, fetchAvailableTags, fetchProductListSummary, fetchProducts, removeTagFromProduct } from '../api/productListApi';
import { fetchCategories } from '../../categories/api/categoriesApi';
import type { Category } from '../../categories/types';
import type {
  NameLocale,
  ProductListFilters,
  ProductListItem,
  ProductListSummary,
  ProductSortBy,
  ProductStatus,
  UpdatedWithinFilter,
} from '../types/product';

const DEBOUNCE_MS = 350;
const DEFAULT_LIMIT = 20;

const INITIAL_FILTERS: ProductListFilters = {
  search: '',
  ingredient: '',
  skuList: [],
  status: [],
  categoryIds: [],
  tag: 'all',
  updatedWithin: 'all',
  shortDescriptionLengthMin: null,
  shortDescriptionLengthMax: null,
  descriptionLengthMin: null,
  descriptionLengthMax: null,
  sortBy: 'sales_total_1y',
  page: 1,
  limit: DEFAULT_LIMIT,
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [filters, setFilters] = useState<ProductListFilters>(INITIAL_FILTERS);

  // カテゴリ絞り込み（複数選択）はURLの ?category=<カンマ区切りカテゴリコード> と相互同期する
  // （/app/products?category=2510,2520 のようなディープリンクをカテゴリ管理画面等から使えるようにするため）。
  // filters.categoryIds はcategoryIdの配列、URLパラメータはcode(外部から読みやすい安定値)のカンマ区切りで持つ。
  // 一覧テーブルのカテゴリ列表示（categoryMap）にも同じ取得結果を流用する。
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategoryOptions);
  }, []);

  const categoryMap = useMemo(() => new Map(categoryOptions.map((c) => [c.id, c])), [categoryOptions]);

  useEffect(() => {
    const codes = searchParams.get('category');
    if (!codes || categoryOptions.length === 0) return;
    const ids = codes
      .split(',')
      .map((code) => categoryOptions.find((c) => c.code === code)?.id)
      .filter((id): id is string => Boolean(id));
    if (ids.length > 0 && ids.join(',') !== filters.categoryIds.join(',')) {
      setFilters((prev) => ({ ...prev, categoryIds: ids }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, categoryOptions]);

  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);
  const debouncedIngredient = useDebouncedValue(ingredientInput, DEBOUNCE_MS);

  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<ProductListSummary | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  // 商品名の表示言語（絞り込みではなく、取得済みの商品名のどの言語カラムを表示するかの表示専用状態）。
  const [nameLocale, setNameLocale] = useState<NameLocale>('ja');

  const queryFilters = useMemo<ProductListFilters>(
    () => ({ ...filters, search: debouncedSearch, ingredient: debouncedIngredient }),
    [filters, debouncedSearch, debouncedIngredient],
  );

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError(null);
    fetchProducts(queryFilters)
      .then((res) => {
        if (ignore) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        if (ignore) return;
        setError('商品情報を取得できませんでした');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [queryFilters, reloadKey]);

  useEffect(() => {
    fetchProductListSummary().then(setSummary);
  }, [reloadKey]);

  useEffect(() => {
    fetchAvailableTags().then(setAvailableTags);
  }, [reloadKey]);

  // 検索条件が変わったらページを1に戻す
  useEffect(() => {
    setFilters((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [
    debouncedSearch,
    debouncedIngredient,
    filters.skuList,
    filters.categoryIds,
    filters.tag,
    filters.updatedWithin,
    filters.status,
    filters.shortDescriptionLengthMin,
    filters.shortDescriptionLengthMax,
    filters.descriptionLengthMin,
    filters.descriptionLengthMax,
  ]);

  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }));
  const setLimit = (limit: number) => setFilters((prev) => ({ ...prev, limit, page: 1 }));

  const syncCategoryParam = (categoryIds: string[]) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const codes = categoryIds.map((id) => categoryOptions.find((c) => c.id === id)?.code).filter((c): c is string => Boolean(c));
        if (codes.length === 0) next.delete('category');
        else next.set('category', codes.join(','));
        return next;
      },
      { replace: true },
    );
  };

  const toggleCategory = (categoryId: string) =>
    setFilters((prev) => {
      const categoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      syncCategoryParam(categoryIds);
      return { ...prev, categoryIds };
    });

  const clearCategoryFilter = () => {
    setFilters((prev) => ({ ...prev, categoryIds: [] }));
    syncCategoryParam([]);
  };

  const setSkuList = (skuList: string[]) => setFilters((prev) => ({ ...prev, skuList }));
  const setTag = (tag: string) => setFilters((prev) => ({ ...prev, tag }));
  const setUpdatedWithin = (updatedWithin: UpdatedWithinFilter) => setFilters((prev) => ({ ...prev, updatedWithin }));
  const setShortDescriptionLengthMin = (value: number | null) => setFilters((prev) => ({ ...prev, shortDescriptionLengthMin: value }));
  const setShortDescriptionLengthMax = (value: number | null) => setFilters((prev) => ({ ...prev, shortDescriptionLengthMax: value }));
  const setDescriptionLengthMin = (value: number | null) => setFilters((prev) => ({ ...prev, descriptionLengthMin: value }));
  const setDescriptionLengthMax = (value: number | null) => setFilters((prev) => ({ ...prev, descriptionLengthMax: value }));
  const setSortBy = (sortBy: ProductSortBy) => setFilters((prev) => ({ ...prev, sortBy, page: 1 }));

  const setSingleStatus = (status: ProductStatus | 'all') => setFilters((prev) => ({ ...prev, status: status === 'all' ? [] : [status] }));

  const clearFilters = () => {
    setSearchInput('');
    setIngredientInput('');
    setFilters(INITIAL_FILTERS);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('category');
        return next;
      },
      { replace: true },
    );
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelectedIds((prev) => (prev.size === items.length ? new Set() : new Set(items.map((item) => item.id))));

  const clearSelection = () => setSelectedIds(new Set());

  const addTags = async (ids: string[], tag: string) => {
    await addTagToProducts(ids, tag);
    setReloadKey((n) => n + 1);
    clearSelection();
  };

  const removeTag = async (id: string, tag: string) => {
    await removeTagFromProduct(id, tag);
    setReloadKey((n) => n + 1);
  };

  const refresh = () => setReloadKey((n) => n + 1);

  return {
    searchInput,
    setSearchInput,
    ingredientInput,
    setIngredientInput,
    filters,
    setSkuList,
    toggleCategory,
    clearCategoryFilter,
    setTag,
    setUpdatedWithin,
    setSingleStatus,
    setShortDescriptionLengthMin,
    setShortDescriptionLengthMax,
    setDescriptionLengthMin,
    setDescriptionLengthMax,
    setSortBy,
    setPage,
    setLimit,
    nameLocale,
    setNameLocale,
    clearFilters,
    items,
    total,
    isLoading,
    error,
    summary,
    availableTags,
    categoryOptions,
    categoryMap,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    addTags,
    removeTag,
    refresh,
  };
}

export type UseProductFiltersReturn = ReturnType<typeof useProductFilters>;
