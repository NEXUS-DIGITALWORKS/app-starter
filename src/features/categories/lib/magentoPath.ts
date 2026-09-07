import type { Category } from '../types';
import { MAGENTO_ROOT_CATEGORY_NAME, type MagentoLocale } from '../config/magentoRootCategories';
import { getAncestors } from './categoryTree';
import { getCategoryLocaleName } from './categoryName';

// カテゴリの親子関係から、都度Magento出力用のカテゴリパス文字列を生成する。
// 生成値であり、DBには保存しない（categories/product_categoriesにはパス文字列カラムを持たせない）。
export function buildMagentoCategoryPath(categories: Category[], categoryId: string, locale: MagentoLocale): string {
  const chain = getAncestors(categories, categoryId);
  const segments = chain.map((c) => getCategoryLocaleName(c, locale)).filter((name): name is string => Boolean(name));
  return [MAGENTO_ROOT_CATEGORY_NAME[locale], ...segments].join('/');
}

export function buildMagentoCategoryPaths(categories: Category[], categoryId: string): Record<MagentoLocale, string> {
  return {
    ja: buildMagentoCategoryPath(categories, categoryId, 'ja'),
    en: buildMagentoCategoryPath(categories, categoryId, 'en'),
    zhTw: buildMagentoCategoryPath(categories, categoryId, 'zhTw'),
  };
}

// 商品に紐づく複数カテゴリから、Magento商品属性用のカンマ区切りパス文字列を生成する。
// 例: 「関西美克薬粧Main/化妝品,関西美克薬粧Main/化妝品/護膚品」
export function buildMagentoCategoryPathsCsv(categories: Category[], categoryIds: string[], locale: MagentoLocale): string {
  return categoryIds.map((id) => buildMagentoCategoryPath(categories, id, locale)).join(',');
}
