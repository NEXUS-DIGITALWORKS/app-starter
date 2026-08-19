// 商品情報の「改善候補」抽出機能（改善候補ページ）専用の型。
// products テーブルの内容をルールベースで検査し、整備が必要そうな商品を機械的に洗い出す。

export type ProductIssueType =
  | 'name_en_has_cjk'
  | 'name_zh_tw_same_as_en'
  | 'no_sales_1y'
  | 'short_description_locale_swap'
  | 'description_locale_swap'
  | 'short_description_too_short'
  | 'description_too_short';

export interface ProductIssueItem {
  sku: string;
  imageUrl?: string;
  nameJa: string;
  nameZhTw?: string;
  nameEn?: string;
  brand: string;
  shortDescriptionLength: number;
  descriptionLength: number;
  salesTotal1y: number;
  issues: ProductIssueType[];
}
