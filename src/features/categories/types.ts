// カテゴリ管理機能のドメイン型定義。
// categories / product_categories テーブル（supabase/migrations/setup_categories.sql,
// setup_product_categories.sql）に対応する。

export type CategoryType = 'standard' | 'purpose' | 'feature' | 'campaign' | 'theme' | 'special';

export const CATEGORY_TYPES: CategoryType[] = ['standard', 'purpose', 'feature', 'campaign', 'theme', 'special'];

export type CategorySource = 'manual' | 'import' | 'magento' | 'ai';

export interface Category {
  id: string;
  code: string;
  parentId: string | null;
  level: number;
  categoryType: CategoryType;
  nameJa: string | null;
  nameEn: string | null;
  nameZhTw: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  externalCategoryId: string | null;
  // Magentoはja/en共通ツリーとzhTwツリーを別category_idで管理しているため2列に分かれる。
  // src/features/categories/config/magentoRootCategories.ts の MagentoLocale 区分に対応。
  magentoCategoryId: string | null;
  magentoCategoryIdZhTw: string | null;
  createdAt: string;
  updatedAt: string;
}

// カテゴリツリー表示用にproductCount・childrenを付与したノード。
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  productCount: number;
}

export interface ProductCategoryLink {
  id: string;
  productId: string; // 商品SKU（products テーブルが存在しないためSKUをキーにする）
  categoryId: string;
  isPrimary: boolean;
  sortOrder: number;
  source: CategorySource;
  confidence: number | null;
  createdAt: string;
  updatedAt: string;
}

// 商品編集画面などで「カテゴリ＋関連情報」をまとめて扱うためのビュー用型。
export interface ProductCategoryWithDetail extends ProductCategoryLink {
  category: Category;
}

export type CategoryActiveFilter = 'all' | 'active' | 'inactive';
export type CategoryParentFilter = 'all' | 'root' | string;

export interface CategoryFilters {
  search: string; // code / name_ja / name_en / name_zh_tw 横断
  categoryType: CategoryType | 'all';
  isActive: CategoryActiveFilter;
  parentId: CategoryParentFilter;
}

export interface CreateCategoryInput {
  code: string;
  parentId: string | null;
  categoryType: CategoryType;
  nameJa?: string;
  nameEn?: string;
  nameZhTw?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  externalCategoryId?: string;
  magentoCategoryId?: string;
  magentoCategoryIdZhTw?: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export class CategoryCodeConflictError extends Error {
  constructor(code: string) {
    super(`カテゴリコード「${code}」は既に使用されています`);
    this.name = 'CategoryCodeConflictError';
  }
}
