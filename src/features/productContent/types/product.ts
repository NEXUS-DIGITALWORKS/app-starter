// 商品一覧画面（/app/products）専用の型。
// 詳細画面用の Product（../types.ts）とは目的が異なるため分離するが、
// sku 等の意味は共通データモデルと揃える。

export type ProductStatus = 'published' | 'draft' | 'needs_review' | 'approval_pending' | 'private';

export type SeoIssueType = 'none' | 'warning' | 'missing' | 'unrated';

export type StoreView = 'Japan Store View' | 'Taiwan Store View' | 'English Store View';

export type ProductCategory = 'ヘアケア' | 'スキンケア' | '医薬品' | '健康食品' | '日用品';

// 一覧の「商品名の言語」表示切替用。絞り込み(filters)ではなく、取得済み商品名のどの言語カラムを
// 表示するかだけを切り替える表示専用の状態（NameLocale参照）。
export type NameLocale = 'ja' | 'zh_tw' | 'en';

export interface ProductListItem {
  id: string;
  sku: string;
  imageUrl?: string;
  name: string;
  nameZhTw?: string;
  nameEn?: string;
  shortDescription?: string;
  shortDescriptionLength?: number;
  descriptionLength?: number;
  ingredients?: string;
  brand: string;
  storeView: StoreView;
  category: ProductCategory; // レガシー: 5値固定ラベル。カテゴリマスタ(categoryIds)とは無関係、削除せず放置
  status: ProductStatus;
  seoScore: number | null;
  seoIssue: SeoIssueType;
  updatedAt: string;
  updatedBy: string;
  tags?: string[];
  categoryIds?: string[]; // features/categories の categories.id 群（多対多）
  primaryCategoryId?: string | null;
}

export type UpdatedWithinFilter = 'all' | 'today' | '7d' | '30d';

export interface ProductListFilters {
  search: string; // 商品名・説明・SKUを横断検索（SKU単独の検索欄は持たず、これに統合する）
  ingredient: string;
  status: ProductStatus[];
  categoryIds: string[]; // categories.id の配列（複数選択・OR条件、空配列で絞り込みなし）。features/categories 側のマスタを参照する
  tag: string;
  updatedWithin: UpdatedWithinFilter;
  shortDescriptionLengthMin: number | null; // ショートディスクリプション（原文）の文字数の下限（未指定はnull）
  shortDescriptionLengthMax: number | null;
  descriptionLengthMin: number | null; // ディスクリプション（原文）の文字数の下限（未指定はnull）
  descriptionLengthMax: number | null;
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
