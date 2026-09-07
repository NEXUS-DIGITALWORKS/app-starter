import { containsCjk, containsKana, looksEnglishOnly, normalizeForCompare } from '../../../lib/localeText';
import type { ProductIssueType } from '../types/productIssue';

// ショート/ディスクリプションが「極端に少ない」と判断する文字数の閾値。文字数0（未入力）もこの範囲に含む。
// 明確な基準がないため暫定値。運用しながら調整する想定。
export const SHORT_DESCRIPTION_MIN_LENGTH = 20;
export const DESCRIPTION_MIN_LENGTH = 100;

// 「Short Description文字数」等と同じ生成カラム由来のため、日本語原文（short_description/description_ja）のみを対象とする。

// 言語入れ替わりチェック（台湾版が英語になっている等）の対象とする最低文字数。
// 数文字程度の値（型番のみ等）まで拾うと誤検知が増えるため。
const LOCALE_SWAP_MIN_LENGTH = 10;

export interface ProductIssueRow {
  short_description: string | null;
  short_description_zh_tw: string | null;
  short_description_en: string | null;
  short_description_length: number | null;
  description_zh_tw: string | null;
  description_en: string | null;
  description_length: number | null;
  name_zh_tw: string | null;
  name_en: string | null;
  ec_status: 'enabled' | 'disabled';
  sales_total_2y: number | null;
}

export function evaluateProductIssues(row: ProductIssueRow): ProductIssueType[] {
  const issues: ProductIssueType[] = [];

  const nameEn = row.name_en?.trim() ?? '';
  const nameZhTw = row.name_zh_tw?.trim() ?? '';
  if (nameEn && containsCjk(nameEn)) issues.push('name_en_has_cjk');
  if (nameEn && nameZhTw && normalizeForCompare(nameEn) === normalizeForCompare(nameZhTw)) issues.push('name_zh_tw_same_as_en');

  // 「売れていない」は現在Magento上で販売中(ec_status=enabled)の商品のみを対象とする。
  // 未公開(disabled)の商品は売上0が当たり前のため対象外。
  if (row.ec_status === 'enabled' && (row.sales_total_2y ?? 0) === 0) issues.push('no_sales_2y');

  const shortZhTw = row.short_description_zh_tw?.trim() ?? '';
  const shortEn = row.short_description_en?.trim() ?? '';
  if (
    (shortZhTw.length >= LOCALE_SWAP_MIN_LENGTH && looksEnglishOnly(shortZhTw)) ||
    (shortEn.length >= LOCALE_SWAP_MIN_LENGTH && containsCjk(shortEn))
  ) {
    issues.push('short_description_locale_swap');
  }

  // 日本語版(short_description)自体が実は繁体字/英語になっているケース（zh_tw/en欄との
  // 入れ替わりではなく、日本語欄に直接誤った言語の文章が入っている場合）。
  // 通常の日本語文はひらがな・カタカナを含むため、仮名が一切なく漢字（CJK）または
  // 英字のみで構成されている場合を「日本語ではない」シグナルとする。
  const shortJa = row.short_description?.trim() ?? '';
  if (shortJa.length >= LOCALE_SWAP_MIN_LENGTH && !containsKana(shortJa) && (containsCjk(shortJa) || looksEnglishOnly(shortJa))) {
    issues.push('short_description_ja_locale_wrong');
  }

  const descZhTw = row.description_zh_tw?.trim() ?? '';
  const descEn = row.description_en?.trim() ?? '';
  if (
    (descZhTw.length >= LOCALE_SWAP_MIN_LENGTH && looksEnglishOnly(descZhTw)) ||
    (descEn.length >= LOCALE_SWAP_MIN_LENGTH && containsCjk(descEn))
  ) {
    issues.push('description_locale_swap');
  }

  if ((row.short_description_length ?? 0) < SHORT_DESCRIPTION_MIN_LENGTH) issues.push('short_description_too_short');
  if ((row.description_length ?? 0) < DESCRIPTION_MIN_LENGTH) issues.push('description_too_short');

  return issues;
}

export const PRODUCT_ISSUE_LABELS: Record<ProductIssueType, string> = {
  name_en_has_cjk: '英語商品名に繁体字/漢字が混入',
  name_zh_tw_same_as_en: '繁体字商品名が英語と同一',
  no_sales_2y: '直近2年売上0件',
  short_description_locale_swap: '台湾/英語版ショートディスクリプションの言語が逆',
  short_description_ja_locale_wrong: '日本語版ショートディスクリプションの言語が台湾/英語になっている',
  description_locale_swap: '台湾/英語版ディスクリプションの言語が逆',
  short_description_too_short: 'ショートディスクリプションが極端に少ない',
  description_too_short: 'ディスクリプションが極端に少ない',
};

export const PRODUCT_ISSUE_TYPES: ProductIssueType[] = [
  'name_en_has_cjk',
  'name_zh_tw_same_as_en',
  'no_sales_2y',
  'short_description_locale_swap',
  'short_description_ja_locale_wrong',
  'description_locale_swap',
  'short_description_too_short',
  'description_too_short',
];
