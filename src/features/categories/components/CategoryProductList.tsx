import { useEffect, useState } from 'react';
import { fetchProductIdsByCategory } from '../api/productCategoriesApi';
import { fetchProductsBySkus } from '../../productContent/api/productListApi';
import CsvExportButton from './CsvExportButton';
import type { Category } from '../types';
import type { ProductListItem } from '../../productContent/types/product';

const PREVIEW_LIMIT = 8;

interface CategoryProductListProps {
  category: Category;
  categories: Category[];
}

// カテゴリ詳細パネルに埋め込む所属商品のプレビュー。全件は商品一覧側
// （CategoryProductCount経由の「商品を見る」導線）で確認する想定のため、
// ここでは先頭数件のみ表示し、CSV出力ボタンで全件を書き出せるようにする。
export default function CategoryProductList({ category, categories }: CategoryProductListProps) {
  const [products, setProducts] = useState<ProductListItem[] | null>(null);

  useEffect(() => {
    let ignore = false;
    setProducts(null);
    fetchProductIdsByCategory(category.id).then((skus) =>
      fetchProductsBySkus(skus).then((items) => {
        if (!ignore) setProducts(items);
      }),
    );
    return () => {
      ignore = true;
    };
  }, [category.id]);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#111827]">所属商品プレビュー</h2>
        <CsvExportButton category={category} categories={categories} />
      </div>

      {products === null ? (
        <p className="text-sm text-[#98A2B3]">読み込み中...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-[#98A2B3]">所属する商品はありません</p>
      ) : (
        <ul className="divide-y divide-[#EEF0F4]">
          {products.slice(0, PREVIEW_LIMIT).map((p) => (
            <li key={p.sku} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0 truncate text-[#344054]">{p.name}</span>
              <span className="shrink-0 font-mono text-xs text-[#98A2B3]">{p.sku}</span>
            </li>
          ))}
        </ul>
      )}
      {products && products.length > PREVIEW_LIMIT && (
        <p className="mt-2 text-xs text-[#98A2B3]">他 {products.length - PREVIEW_LIMIT} 件（CSV出力で全件確認できます）</p>
      )}
    </div>
  );
}
