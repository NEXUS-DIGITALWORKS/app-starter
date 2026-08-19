import { useEffect, useMemo, useState } from 'react';
import { fetchCategoryIssues } from '../api/categoryIssuesApi';
import { CATEGORY_ISSUE_TYPES } from '../lib/categoryIssueRules';
import type { CategoryIssueItem, CategoryIssueType } from '../types/categoryIssue';

const DEFAULT_LIMIT = 20;

export function useCategoryIssues() {
  const [allItems, setAllItems] = useState<CategoryIssueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [issueTypes, setIssueTypes] = useState<CategoryIssueType[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError(null);
    fetchCategoryIssues()
      .then((items) => {
        if (ignore) return;
        setAllItems(items);
      })
      .catch(() => {
        if (ignore) return;
        setError('改善候補カテゴリを取得できませんでした');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const issueCounts = useMemo(() => {
    const counts = Object.fromEntries(CATEGORY_ISSUE_TYPES.map((t) => [t, 0])) as Record<CategoryIssueType, number>;
    for (const item of allItems) {
      for (const issue of item.issues) counts[issue]++;
    }
    return counts;
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return allItems.filter((item) => {
      if (issueTypes.length > 0 && !issueTypes.some((t) => item.issues.includes(t))) return false;
      if (!keyword) return true;
      return (
        item.code.toLowerCase().includes(keyword) ||
        (item.nameJa ?? '').toLowerCase().includes(keyword) ||
        (item.nameZhTw ?? '').toLowerCase().includes(keyword) ||
        (item.nameEn ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [allItems, search, issueTypes]);

  useEffect(() => {
    setPage(1);
  }, [search, issueTypes]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredItems.slice(start, start + limit);
  }, [filteredItems, page, limit]);

  const toggleIssueType = (type: CategoryIssueType) =>
    setIssueTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));

  const clearFilters = () => {
    setSearch('');
    setIssueTypes([]);
  };

  const refresh = () => setReloadKey((n) => n + 1);

  return {
    items: pagedItems,
    total: filteredItems.length,
    totalIssueCategories: allItems.length,
    issueCounts,
    isLoading,
    error,
    search,
    setSearch,
    issueTypes,
    toggleIssueType,
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

export type UseCategoryIssuesReturn = ReturnType<typeof useCategoryIssues>;
