import { parseCsv } from '../../../lib/csv';
import type { ProductImportParseResult, ProductImportRow } from '../types/productImport';

const EC_STATUS_VALUES = new Set(['enabled', 'disabled']);
const EC_VISIBILITY_VALUES = new Set(['Catalog & Search', 'Catalog', 'Search', 'Not Visible Individually']);

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toTimestampOrNull(value: unknown): string | null {
  const s = toStringOrNull(value);
  if (!s) return null;
  return Number.isNaN(Date.parse(s)) ? null : s;
}

// 一部のエクスポートでは日本語版が無印キー（name/description等）ではなく
// _jp付きキー（name_jp・namejpの表記ゆれ含む）に入っていることがあるため、
// 存在する場合はそちらを優先し、無ければ無印キーにフォールバックする。
function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    const s = toStringOrNull(value);
    if (s !== null) return s;
  }
  return null;
}

// JSON（オブジェクトの配列）・CSV（ヘッダー行からオブジェクト化した配列）共通の行バリデーション。
function buildImportRows(entries: unknown[]): ProductImportParseResult {
  const rows: ProductImportRow[] = [];
  const errors: string[] = [];
  const seenSkus = new Set<string>();

  entries.forEach((entry, index) => {
    if (typeof entry !== 'object' || entry === null) {
      errors.push(`${index + 1}件目: オブジェクトではありません`);
      return;
    }
    const obj = entry as Record<string, unknown>;
    const sku = toStringOrNull(obj.sku);
    const name = pickString(obj.namejp, obj.name_jp, obj.name);

    if (!sku) {
      errors.push(`${index + 1}件目: skuがありません（スキップ）`);
      return;
    }
    if (!name) {
      errors.push(`${index + 1}件目 (SKU: ${sku}): nameがありません（スキップ）`);
      return;
    }
    if (seenSkus.has(sku)) {
      errors.push(`${index + 1}件目 (SKU: ${sku}): ファイル内でSKUが重複しています（後の行で上書きされます）`);
    }
    seenSkus.add(sku);

    const ecStatusRaw = toStringOrNull(obj.ec_status);
    const ecVisibilityRaw = toStringOrNull(obj.ec_visibility);

    rows.push({
      sku,
      name_ja: name,
      name_zh_tw: toStringOrNull(obj.name_zh_tw),
      name_en: toStringOrNull(obj.name_en),
      brand: toStringOrNull(obj.brand),
      price: toNumberOrNull(obj.price),
      // 未指定/不正値はnullのまま返す（'enabled'既定値の適用は取込時のマージ処理側で行い、
      // 既存商品を更新する際にこの列を意図せず上書きしないようにする）
      ec_status: ecStatusRaw && EC_STATUS_VALUES.has(ecStatusRaw) ? (ecStatusRaw as 'enabled' | 'disabled') : null,
      ec_visibility:
        ecVisibilityRaw && EC_VISIBILITY_VALUES.has(ecVisibilityRaw)
          ? (ecVisibilityRaw as ProductImportRow['ec_visibility'])
          : null,
      short_description: pickString(obj.short_description_jp, obj.short_description),
      short_description_zh_tw: toStringOrNull(obj.short_description_zh_tw),
      short_description_en: toStringOrNull(obj.short_description_en),
      description_ja: pickString(obj.description_jp, obj.description),
      description_zh_tw: toStringOrNull(obj.description_zh_tw),
      description_en: toStringOrNull(obj.description_en),
      ingredients: toStringOrNull(obj.ingredients),
      ingredients_zh_tw: toStringOrNull(obj.ingredients_zh_tw),
      ingredients_en: toStringOrNull(obj.ingredients_en),
      usage_notes: toStringOrNull(obj.usage_notes),
      usage_notes_zh_tw: toStringOrNull(obj.usage_notes_zh_tw),
      usage_notes_en: toStringOrNull(obj.usage_notes_en),
      magento_entity_id: toStringOrNull(obj.entity_id ?? obj.magento_entity_id),
      store_id: toStringOrNull(obj.store_id),
      store_view_code: toStringOrNull(obj.store_view_code),
      store_view_name: toStringOrNull(obj.store_view_name),
      locale: toStringOrNull(obj.locale),
      meta_title_ja: pickString(obj.meta_title_jp, obj.meta_title),
      meta_title_zh_tw: toStringOrNull(obj.meta_title_zh_tw),
      meta_title_en: toStringOrNull(obj.meta_title_en),
      meta_description_ja: pickString(obj.meta_description_jp, obj.meta_description),
      meta_description_zh_tw: toStringOrNull(obj.meta_description_zh_tw),
      meta_description_en: toStringOrNull(obj.meta_description_en),
      url_key: pickString(obj.url_key_jp, obj.url_key),
      base_image: toStringOrNull(obj.base_image),
      small_image: toStringOrNull(obj.small_image),
      thumbnail: toStringOrNull(obj.thumbnail),
      magento_created_at: toTimestampOrNull(obj.magento_created_at),
      magento_updated_at: toTimestampOrNull(obj.magento_updated_at),
    });
  });

  return { rows, errors };
}

// Magentoエクスポートは文字列値中に生の改行・タブなどの制御文字がエスケープされずに
// 含まれていることがあり、そのままではJSON.parseが「Bad control character」で失敗する。
// 文字列リテラル内（エスケープ済みの\"は除く）に現れた制御文字だけをJSONエスケープに変換する。
function sanitizeJsonControlChars(text: string): string {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const code = text.charCodeAt(i);

    if (!inString) {
      result += ch;
      if (ch === '"') inString = true;
      continue;
    }

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      result += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      result += ch;
      inString = false;
      continue;
    }
    if (code < 0x20) {
      switch (ch) {
        case '\n': result += '\\n'; break;
        case '\r': result += '\\r'; break;
        case '\t': result += '\\t'; break;
        case '\b': result += '\\b'; break;
        case '\f': result += '\\f'; break;
        default: result += `\\u${code.toString(16).padStart(4, '0')}`;
      }
      continue;
    }
    result += ch;
  }

  return result;
}

export function parseProductImportJson(text: string): ProductImportParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(sanitizeJsonControlChars(text));
  } catch (e) {
    return { rows: [], errors: [`JSONとして読み込めませんでした: ${(e as Error).message}`] };
  }

  if (!Array.isArray(raw)) {
    return { rows: [], errors: ['JSONの最上位は商品オブジェクトの配列である必要があります'] };
  }

  return buildImportRows(raw);
}

export function parseProductImportCsv(text: string): ProductImportParseResult {
  const table = parseCsv(text);
  if (table.length === 0) {
    return { rows: [], errors: ['CSVにデータがありません'] };
  }

  const headers = table[0].map((h) => h.trim().toLowerCase());
  if (!headers.includes('sku') || !headers.includes('name')) {
    return { rows: [], errors: ['CSVのヘッダー行にsku列・name列が必要です（1行目を見出し行として扱います）'] };
  }

  const entries: Record<string, unknown>[] = table.slice(1).map((cells) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      if (header) obj[header] = cells[index] ?? '';
    });
    return obj;
  });

  return buildImportRows(entries);
}

// 拡張子で判別できないファイルのための簡易フォールバック（先頭文字がJSON配列らしければJSON扱い）。
export function parseProductImportFile(text: string, fileName?: string): ProductImportParseResult {
  const lowerName = fileName?.toLowerCase() ?? '';
  if (lowerName.endsWith('.csv')) return parseProductImportCsv(text);
  if (lowerName.endsWith('.json')) return parseProductImportJson(text);
  return text.trimStart().startsWith('[') ? parseProductImportJson(text) : parseProductImportCsv(text);
}
