import { mockProducts } from '../data/mockProducts';
import { addTag, getAllTags, getTags, removeTag } from '../data/mockTagsStore';
import { fetchProductCategoryLinksMap } from '../../categories/api/productCategoriesApi';
import type { ProductListFilters, ProductListItem, ProductListResult, ProductListSummary } from '../types/product';

// Component から直接 mockProducts を参照しない。実データ接続時はこのファイルの中身だけを
// GET /api/products 相当の呼び出しに差し替える（呼び出し側のシグネチャは変えない）。

const MOCK_DELAY_MS = 250;

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function withinUpdatedRange(updatedAt: string, range: ProductListFilters['updatedWithin']): boolean {
  if (range === 'all') return true;
  const days = range === 'today' ? 1 : range === '7d' ? 7 : 30;
  const diffMs = Date.now() - new Date(updatedAt).getTime();
  return diffMs <= days * 24 * 60 * 60 * 1000;
}

export async function fetchProducts(filters: ProductListFilters): Promise<ProductListResult> {
  // TODO: 実データ接続時は GET /api/products?search=&sku=&storeView=&brand=&status=&seoIssue=&category=&updatedFrom=&page=&limit= に置き換える
  const search = filters.search.trim().toLowerCase();
  const sku = filters.sku.trim().toLowerCase();
  const ingredient = filters.ingredient.trim().toLowerCase();

  // カテゴリ絞り込み用に、対象となりうる全商品分の関連付けを1回のバッチ取得でまとめて解決する
  // （商品ごとに個別クエリを投げるN+1を避けるため）。
  const categoryLinksMap = await fetchProductCategoryLinksMap(mockProducts.map((p) => p.sku));

  const filtered = mockProducts.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search) && !(item.shortDescription ?? '').toLowerCase().includes(search) && !item.sku.includes(search)) {
      return false;
    }
    if (sku && !item.sku.toLowerCase().includes(sku)) return false;
    if (ingredient && !(item.ingredients ?? '').toLowerCase().includes(ingredient)) return false;
    if (filters.storeView !== 'all' && item.storeView !== filters.storeView) return false;
    if (filters.brand !== 'all' && item.brand !== filters.brand) return false;
    if (filters.category !== 'all') {
      const categoryIds = (categoryLinksMap[item.sku] ?? []).map((l) => l.categoryId);
      if (!categoryIds.includes(filters.category)) return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(item.status)) return false;
    if (filters.seoIssue.length > 0 && !filters.seoIssue.includes(item.seoIssue)) return false;
    if (filters.tag !== 'all' && !getTags(item.sku).includes(filters.tag)) return false;
    if (!withinUpdatedRange(item.updatedAt, filters.updatedWithin)) return false;
    return true;
  });

  const start = (filters.page - 1) * filters.limit;
  const items: ProductListItem[] = filtered.slice(start, start + filters.limit).map((item) => {
    const links = categoryLinksMap[item.sku] ?? [];
    return {
      ...item,
      tags: getTags(item.sku),
      categoryIds: links.map((l) => l.categoryId),
      primaryCategoryId: links.find((l) => l.isPrimary)?.categoryId ?? null,
    };
  });

  return delay({ items, total: filtered.length });
}

export async function addTagToProducts(ids: string[], tag: string): Promise<void> {
  // TODO: 実データ接続時は POST /api/products/tags 相当（一括タグ付与）に置き換える
  const idSet = new Set(ids);
  for (const item of mockProducts) {
    if (idSet.has(item.id)) addTag(item.sku, tag);
  }
  return delay(undefined);
}

export async function removeTagFromProduct(id: string, tag: string): Promise<void> {
  // TODO: 実データ接続時は DELETE /api/products/:id/tags/:tag 相当に置き換える
  const item = mockProducts.find((p) => p.id === id);
  if (item) removeTag(item.sku, tag);
  return delay(undefined);
}

export async function fetchAvailableTags(): Promise<string[]> {
  return delay(getAllTags());
}

// カテゴリ単位のCSV出力（src/features/categories）向け。指定SKU群の商品情報をまとめて取得する。
export async function fetchProductsBySkus(skus: string[]): Promise<ProductListItem[]> {
  const skuSet = new Set(skus);
  const items = mockProducts.filter((item) => skuSet.has(item.sku)).map((item) => ({ ...item, tags: getTags(item.sku) }));
  return delay(items);
}

export async function fetchProductListSummary(): Promise<ProductListSummary> {
  const total = mockProducts.length;
  const needsReview = mockProducts.filter((p) => p.status === 'needs_review').length;
  const seoIssues = mockProducts.filter((p) => p.seoIssue === 'warning' || p.seoIssue === 'missing').length;
  const published = mockProducts.filter((p) => p.status === 'published').length;
  const untranslated = mockProducts.filter((p) => p.storeView !== 'Japan Store View').length;
  const approvalPending = mockProducts.filter((p) => p.status === 'approval_pending').length;

  return delay({ total, needsReview, seoIssues, published, untranslated, approvalPending });
}
