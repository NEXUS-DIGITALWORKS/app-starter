// カテゴリの「改善候補」抽出機能（カテゴリ改善候補ページ）専用の型。
// categories テーブルの内容と商品数・売上実績をルールベースで検査し、整備が必要そうな
// カテゴリを機械的に洗い出す。src/features/productContent/types/productIssue.ts の
// カテゴリ版に相当する。

import type { CategoryType } from '../types';

export type CategoryIssueType =
  | 'low_product_count'
  | 'low_sales_1y'
  | 'missing_locale_name'
  | 'missing_description'
  | 'orphaned_active_child';

export interface CategoryIssueItem {
  id: string;
  code: string;
  nameJa: string | null;
  nameEn: string | null;
  nameZhTw: string | null;
  categoryType: CategoryType;
  parentNameJa: string | null;
  productCount: number;
  salesTotal1y: number;
  issues: CategoryIssueType[];
}
