import { useEffect, useState } from 'react';
import {
  addProductCategory,
  fetchProductCategories,
  removeProductCategory,
  setPrimaryCategory,
} from '../api/productCategoriesApi';
import { fetchCategories } from '../api/categoriesApi';
import { findCategory } from '../lib/categoryTree';
import type { Category, ProductCategoryWithDetail } from '../types';

// 商品編集画面用。子カテゴリ追加時に親カテゴリも自動追加するかはUIから切替可能にする
// （既存Magento運用との整合性を優先し、デフォルトはOFF＝強制しない）。
export function useProductCategoryEditor(sku: string) {
  const [links, setLinks] = useState<ProductCategoryWithDetail[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoAddParent, setAutoAddParent] = useState(false);

  const reload = () => {
    setIsLoading(true);
    Promise.all([fetchProductCategories(sku), fetchCategories()]).then(([l, cats]) => {
      setLinks(l);
      setAllCategories(cats);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku]);

  const addCategory = async (categoryId: string) => {
    const alreadyLinked = links.some((l) => l.categoryId === categoryId);
    if (!alreadyLinked) {
      await addProductCategory(sku, categoryId, { isPrimary: links.length === 0 });
    }

    if (autoAddParent) {
      const category = findCategory(allCategories, categoryId);
      if (category?.parentId && !links.some((l) => l.categoryId === category.parentId)) {
        await addProductCategory(sku, category.parentId);
      }
    }

    reload();
  };

  const removeCategory = async (categoryId: string) => {
    await removeProductCategory(sku, categoryId);
    reload();
  };

  const setPrimary = async (categoryId: string) => {
    await setPrimaryCategory(sku, categoryId);
    reload();
  };

  return { links, allCategories, isLoading, addCategory, removeCategory, setPrimary, autoAddParent, setAutoAddParent, reload };
}

export type UseProductCategoryEditorReturn = ReturnType<typeof useProductCategoryEditor>;
