// 商品一覧画面（/app/products）専用の型。
// 詳細画面用の Product（../types.ts）とは目的が異なるため分離するが、
// sku 等の意味は共通データモデルと揃える。

export type ProductStatus = 'published' | 'draft' | 'needs_review' | 'approval_pending' | 'private';

export type SeoIssueType = 'none' | 'warning' | 'missing' | 'unrated';

export type StoreView = 'Japan Store View' | 'Taiwan Store View' | 'English Store View';

export type ProductCategory = 'ヘアケア' | 'スキンケア' | '医薬品' | '健康食品' | '日用品';

export interface ProductListItem {
  id: string;
  sku: string;
  imageUrl?: string;
  name: string;
  shortDescription?: string;
  brand: string;
  storeView: StoreView;
  category: ProductCategory;
  status: ProductStatus;
  seoScore: number | null;
  seoIssue: SeoIssueType;
  updatedAt: string;
  updatedBy: string;
}

export type UpdatedWithinFilter = 'all' | 'today' | '7d' | '30d';

export interface ProductListFilters {
  search: string;
  sku: string;
  storeView: string;
  brand: string;
  status: ProductStatus[];
  seoIssue: SeoIssueType[];
  category: string;
  updatedWithin: UpdatedWithinFilter;
  page: number;
  limit: number;
}

export interface ProductListResult {
  items: ProductListItem[];
  total: number;
}

export interface ProductListSummary {
  total: number;
  needsReview: number;
  seoIssues: number;
  published: number;
  untranslated: number;
  approvalPending: number;
}
