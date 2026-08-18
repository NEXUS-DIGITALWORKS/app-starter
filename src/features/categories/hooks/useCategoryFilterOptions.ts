import { useEffect, useState } from 'react';
import { fetchCategories } from '../api/categoriesApi';
import type { Category } from '../types';

// 商品一覧のカテゴリ絞り込みSelect用の軽量フック（ツリー構築やproductCountは不要なため分離）。
export function useCategoryFilterOptions() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetchCategories().then((cats) => {
      if (ignore) return;
      setCategories(cats.filter((c) => c.isActive));
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return { categories, isLoading };
}
