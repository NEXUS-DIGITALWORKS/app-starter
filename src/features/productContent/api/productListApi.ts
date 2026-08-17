import { mockProducts } from '../data/mockProducts';
import type { ProductListFilters, ProductListResult, ProductListSummary } from '../types/product';

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

  const filtered = mockProducts.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search) && !(item.shortDescription ?? '').toLowerCase().includes(search) && !item.sku.includes(search)) {
      return false;
    }
    if (sku && !item.sku.toLowerCase().includes(sku)) return false;
    if (filters.storeView !== 'all' && item.storeView !== filters.storeView) return false;
    if (filters.brand !== 'all' && item.brand !== filters.brand) return false;
    if (filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.status.length > 0 && !filters.status.includes(item.status)) return false;
    if (filters.seoIssue.length > 0 && !filters.seoIssue.includes(item.seoIssue)) return false;
    if (!withinUpdatedRange(item.updatedAt, filters.updatedWithin)) return false;
    return true;
  });

  const start = (filters.page - 1) * filters.limit;
  const items = filtered.slice(start, start + filters.limit);

  return delay({ items, total: filtered.length });
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
