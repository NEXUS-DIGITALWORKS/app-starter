import type { Category, CategoryType } from '../types';
import type { MagentoLocale } from '../config/magentoRootCategories';

// 一覧・ツリーでの表示名。name_ja が無いカテゴリ(90/91/92系統の一部)があるため、
// name_ja → name_en → name_zh_tw → code の順でフォールバックする。
export function getCategoryDisplayName(category: Pick<Category, 'nameJa' | 'nameEn' | 'nameZhTw' | 'code'>): string {
  return category.nameJa || category.nameEn || category.nameZhTw || category.code;
}

// codeは 'm'+MagentoカテゴリID（例: m607）で保存されているが、'm'自体は表示上意味を
// 持たずノイズになるため、一覧・詳細等の読み取り専用表示では取り除いた数字部分のみ見せる
// （カテゴリコード編集フォームの入力値など、実際の保存値を扱う箇所では変換しない）。
export function formatCategoryCode(code: string): string {
  return code.replace(/^m(?=\d)/, '');
}

export function getCategoryLocaleName(
  category: Pick<Category, 'nameJa' | 'nameEn' | 'nameZhTw'>,
  locale: MagentoLocale,
): string | null {
  if (locale === 'ja') return category.nameJa || category.nameEn || category.nameZhTw || null;
  if (locale === 'en') return category.nameEn || category.nameJa || category.nameZhTw || null;
  return category.nameZhTw || category.nameJa || category.nameEn || null;
}

export const CATEGORY_TYPE_LABEL: Record<CategoryType, string> = {
  standard: '通常分類',
  purpose: '効能・目的',
  feature: '新着・特集',
  campaign: 'キャンペーン',
  theme: 'テーマ・文化',
  special: 'その他特殊',
};
