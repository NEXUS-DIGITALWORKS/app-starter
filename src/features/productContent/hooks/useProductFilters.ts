import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addTagToProducts, fetchAvailableTags, fetchProductListSummary, fetchProducts, removeTagFromProduct } from '../api/productListApi';
import { fetchCategories } from '../../categories/api/categoriesApi';
import type {
  ProductListFilters,
  ProductListItem,
  ProductListSummary,
  ProductStatus,
  SeoIssueType,
  UpdatedWithinFilter,
} from '../types/product';

const DEBOUNCE_MS = 350;
const DEFAULT_LIMIT = 20;

const INITIAL_FILTERS: ProductListFilters = {
  search: '',
  sku: '',
  ingredient: '',
  storeView: 'all',
  brand: 'all',
  status: [],
  seoIssue: [],
  category: 'all',
  tag: 'all',
  updatedWithin: 'all',
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
  const [skuInput, setSkuInput] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [filters, setFilters] = useState<ProductListFilters>(INITIAL_FILTERS);

  // カテゴリ絞り込みはURLの ?category=<カテゴリコード> と相互同期する
  // （/app/products?category=2510 のようなディープリンクをカテゴリ管理画面等から使えるようにするため）。
  // filters.category はcategoryId、URLパラメータはcode(外部から読みやすい安定値)で持つ。
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; code: string }[]>([]);

  useEffect(() => {
    fetchCategories().then((cats) => setCategoryOptions(cats.map((c) => ({ id: c.id, code: c.code }))));
  }, []);

  useEffect(() => {
    const code = searchParams.get('category');
    if (!code || categoryOptions.length === 0) return;
    const match = categoryOptions.find((c) => c.code === code);
    if (match && filters.category !== match.id) {
      setFilters((prev) => ({ ...prev, category: match.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, categoryOptions]);

  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);
  const debouncedSku = useDebouncedValue(skuInput, DEBOUNCE_MS);
  const debouncedIngredient = useDebouncedValue(ingredientInput, DEBOUNCE_MS);

  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<ProductListSummary | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  const queryFilters = useMemo<ProductListFilters>(
    () => ({ ...filters, search: debouncedSearch, sku: debouncedSku, ingredient: debouncedIngredient }),
    [filters, debouncedSearch, debouncedSku, debouncedIngredient],
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
    debouncedSku,
    debouncedIngredient,
    filters.storeView,
    filters.brand,
    filters.category,
    filters.tag,
    filters.updatedWithin,
    filters.status,
    filters.seoIssue,
  ]);

  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }));

  const setStoreView = (storeView: string) => setFilters((prev) => ({ ...prev, storeView }));
  const setBrand = (brand: string) => setFilters((prev) => ({ ...prev, brand }));
  const setCategory = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const code = categoryOptions.find((c) => c.id === category)?.code;
        if (category === 'all' || !code) next.delete('category');
        else next.set('category', code);
        return next;
      },
      { replace: true },
    );
  };
  const setTag = (tag: string) => setFilters((prev) => ({ ...prev, tag }));
  const setUpdatedWithin = (updatedWithin: UpdatedWithinFilter) => setFilters((prev) => ({ ...prev, updatedWithin }));

  const toggleStatus = (status: ProductStatus) =>
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status) ? prev.status.filter((s) => s !== status) : [...prev.status, status],
    }));

  const toggleSeoIssue = (issue: SeoIssueType) =>
    setFilters((prev) => ({
      ...prev,
      seoIssue: prev.seoIssue.includes(issue) ? prev.seoIssue.filter((s) => s !== issue) : [...prev.seoIssue, issue],
    }));

  const clearStatusFilter = () => setFilters((prev) => ({ ...prev, status: [] }));
  const clearSeoIssueFilter = () => setFilters((prev) => ({ ...prev, seoIssue: [] }));

  const setSingleStatus = (status: ProductStatus | 'all') => setFilters((prev) => ({ ...prev, status: status === 'all' ? [] : [status] }));
  const setSingleSeoIssue = (issue: SeoIssueType | 'all') => setFilters((prev) => ({ ...prev, seoIssue: issue === 'all' ? [] : [issue] }));

  const clearFilters = () => {
    setSearchInput('');
    setSkuInput('');
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
    skuInput,
    setSkuInput,
    ingredientInput,
    setIngredientInput,
    filters,
    setStoreView,
    setBrand,
    setCategory,
    setTag,
    setUpdatedWithin,
    toggleStatus,
    toggleSeoIssue,
    clearStatusFilter,
    clearSeoIssueFilter,
    setSingleStatus,
    setSingleSeoIssue,
    setPage,
    clearFilters,
    items,
    total,
    isLoading,
    error,
    summary,
    availableTags,
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
