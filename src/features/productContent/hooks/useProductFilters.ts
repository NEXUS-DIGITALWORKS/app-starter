import { useEffect, useMemo, useState } from 'react';
import { fetchProductListSummary, fetchProducts } from '../api/productListApi';
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
  storeView: 'all',
  brand: 'all',
  status: [],
  seoIssue: [],
  category: 'all',
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
  const [searchInput, setSearchInput] = useState('');
  const [skuInput, setSkuInput] = useState('');
  const [filters, setFilters] = useState<ProductListFilters>(INITIAL_FILTERS);

  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_MS);
  const debouncedSku = useDebouncedValue(skuInput, DEBOUNCE_MS);

  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<ProductListSummary | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const queryFilters = useMemo<ProductListFilters>(
    () => ({ ...filters, search: debouncedSearch, sku: debouncedSku }),
    [filters, debouncedSearch, debouncedSku],
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
  }, [queryFilters]);

  useEffect(() => {
    fetchProductListSummary().then(setSummary);
  }, []);

  // 検索条件が変わったらページを1に戻す
  useEffect(() => {
    setFilters((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [debouncedSearch, debouncedSku, filters.storeView, filters.brand, filters.category, filters.updatedWithin, filters.status, filters.seoIssue]);

  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }));

  const setStoreView = (storeView: string) => setFilters((prev) => ({ ...prev, storeView }));
  const setBrand = (brand: string) => setFilters((prev) => ({ ...prev, brand }));
  const setCategory = (category: string) => setFilters((prev) => ({ ...prev, category }));
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
    setFilters(INITIAL_FILTERS);
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

  return {
    searchInput,
    setSearchInput,
    skuInput,
    setSkuInput,
    filters,
    setStoreView,
    setBrand,
    setCategory,
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
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  };
}

export type UseProductFiltersReturn = ReturnType<typeof useProductFilters>;
