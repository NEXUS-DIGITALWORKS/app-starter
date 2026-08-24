import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProductIssues } from '../api/productIssuesApi';
import { PRODUCT_ISSUE_TYPES } from '../lib/productIssueRules';
import type { IssueMatchMode, ProductIssueType } from '../types/productIssue';

const DEFAULT_LIMIT = 20;

export function useProductIssues() {
  const [search, setSearch] = useState('');
  const [issueTypes, setIssueTypes] = useState<ProductIssueType[]>([]);
  const [issueMatchMode, setIssueMatchMode] = useState<IssueMatchMode>('or');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const { data: allItems = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['productIssues'],
    queryFn: fetchProductIssues,
  });
  const error = isError ? '改善候補商品を取得できませんでした' : null;

  const issueCounts = useMemo(() => {
    const counts = Object.fromEntries(PRODUCT_ISSUE_TYPES.map((t) => [t, 0])) as Record<ProductIssueType, number>;
    for (const item of allItems) {
      for (const issue of item.issues) counts[issue]++;
    }
    return counts;
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return allItems.filter((item) => {
      if (issueTypes.length > 0) {
        const matches =
          issueMatchMode === 'and' ? issueTypes.every((t) => item.issues.includes(t)) : issueTypes.some((t) => item.issues.includes(t));
        if (!matches) return false;
      }
      if (!keyword) return true;
      return (
        item.sku.toLowerCase().includes(keyword) ||
        item.nameJa.toLowerCase().includes(keyword) ||
        (item.nameZhTw ?? '').toLowerCase().includes(keyword) ||
        (item.nameEn ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [allItems, search, issueTypes, issueMatchMode]);

  useEffect(() => {
    setPage(1);
  }, [search, issueTypes, issueMatchMode]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredItems.slice(start, start + limit);
  }, [filteredItems, page, limit]);

  const toggleIssueType = (type: ProductIssueType) =>
    setIssueTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));

  const clearFilters = () => {
    setSearch('');
    setIssueTypes([]);
    setIssueMatchMode('or');
  };

  const refresh = () => refetch();

  return {
    items: pagedItems,
    total: filteredItems.length,
    totalIssueProducts: allItems.length,
    issueCounts,
    isLoading,
    error,
    search,
    setSearch,
    issueTypes,
    toggleIssueType,
    issueMatchMode,
    setIssueMatchMode,
    clearFilters,
    page,
    limit,
    setPage,
    setLimit: (value: number) => {
      setLimit(value);
      setPage(1);
    },
    refresh,
  };
}

export type UseProductIssuesReturn = ReturnType<typeof useProductIssues>;
