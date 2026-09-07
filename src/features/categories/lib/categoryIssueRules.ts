import { containsCjk, normalizeForCompare } from '../../../lib/localeText';
import type { CategoryIssueType } from '../types/categoryIssue';

// 「所属商品数が少ない」と判断する件数の閾値（この件数以下が対象）。ユーザー指定の基準。
export const LOW_PRODUCT_COUNT_MAX = 3;

// 「直近2年の売上が非常に低い」と判断する金額の閾値（円、この金額未満が対象）。
// 明確な基準がないため暫定値。運用しながら調整する想定。
export const LOW_SALES_2Y_MAX = 10000;

export interface CategoryIssueRow {
  isActive: boolean;
  productCount: number;
  salesTotal2y: number;
  nameJa: string | null;
  nameEn: string | null;
  nameZhTw: string | null;
  description: string | null;
  // 親カテゴリの有効状態。ルートカテゴリ（親なし）は null。
  parentIsActive: boolean | null;
}

// 無効化済み(is_active=false)のカテゴリは運用上すでに整理済みとみなし、検査対象から除外する。
export function evaluateCategoryIssues(row: CategoryIssueRow): CategoryIssueType[] {
  const issues: CategoryIssueType[] = [];
  if (!row.isActive) return issues;

  if (row.productCount <= LOW_PRODUCT_COUNT_MAX) issues.push('low_product_count');

  // 商品が0件の場合はlow_product_countと意味が重複するため、1件以上ある場合のみ検査する。
  if (row.productCount > 0 && row.salesTotal2y < LOW_SALES_2Y_MAX) issues.push('low_sales_2y');

  if (!row.nameJa?.trim() || !row.nameEn?.trim() || !row.nameZhTw?.trim()) issues.push('missing_locale_name');

  if (!row.description?.trim()) issues.push('missing_description');

  // 英語名に漢字/繁体字が混入している、または繁体字名が英語名と同一（未翻訳のコピペ）の場合、
  // 翻訳作業自体が誤っている・未実施であるシグナルとみなす（products側の同種チェックに相当）。
  const nameEn = row.nameEn?.trim() ?? '';
  const nameZhTw = row.nameZhTw?.trim() ?? '';
  if ((nameEn && containsCjk(nameEn)) || (nameEn && nameZhTw && normalizeForCompare(nameEn) === normalizeForCompare(nameZhTw))) {
    issues.push('wrong_translation');
  }

  // 親が無効化されていると、有効なはずのこのカテゴリにツリー上から辿り着けなくなる。
  if (row.parentIsActive === false) issues.push('orphaned_active_child');

  return issues;
}

export const CATEGORY_ISSUE_LABELS: Record<CategoryIssueType, string> = {
  low_product_count: `所属商品数が${LOW_PRODUCT_COUNT_MAX}件以下`,
  low_sales_2y: '直近2年の売上が非常に低い',
  missing_locale_name: '多言語名（日本語/英語/繁体字）のいずれかが未設定',
  missing_description: '説明文が未設定',
  wrong_translation: '翻訳がまちがっている',
  orphaned_active_child: '親カテゴリが無効化されている',
};

export const CATEGORY_ISSUE_TYPES: CategoryIssueType[] = [
  'low_product_count',
  'low_sales_2y',
  'missing_locale_name',
  'missing_description',
  'wrong_translation',
  'orphaned_active_child',
];
