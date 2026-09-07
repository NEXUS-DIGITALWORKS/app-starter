// 商品情報の「改善候補」抽出機能（改善候補ページ）専用の型。
// products テーブルの内容をルールベースで検査し、整備が必要そうな商品を機械的に洗い出す。

export type ProductIssueType =
  | 'name_en_has_cjk'
  | 'name_zh_tw_same_as_en'
  | 'no_sales_2y'
  | 'short_description_locale_swap'
  | 'short_description_ja_locale_wrong'
  | 'description_locale_swap'
  | 'short_description_too_short'
  | 'description_too_short';

// 「課題の種類」複数選択時の絞り込み方式。'or'=いずれか1つでも該当（従来の挙動）、
// 'and'=選択したすべての種類に該当。
export type IssueMatchMode = 'and' | 'or';

export interface ProductIssueItem {
  sku: string;
  imageUrl?: string;
  nameJa: string;
  nameZhTw?: string;
  nameEn?: string;
  brand: string;
  shortDescriptionLength: number;
  descriptionLength: number;
  salesTotal2y: number;
  issues: ProductIssueType[];
}
