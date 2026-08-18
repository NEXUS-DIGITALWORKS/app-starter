import { parseCsv } from './parseCsv';
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
    const name = toStringOrNull(obj.name);

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
      name,
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
      short_description: toStringOrNull(obj.short_description),
      description: toStringOrNull(obj.description),
      ingredients: toStringOrNull(obj.ingredients),
      usage_notes: toStringOrNull(obj.usage_notes),
      magento_entity_id: toStringOrNull(obj.entity_id ?? obj.magento_entity_id),
      store_id: toStringOrNull(obj.store_id),
      store_view_code: toStringOrNull(obj.store_view_code),
      store_view_name: toStringOrNull(obj.store_view_name),
      locale: toStringOrNull(obj.locale),
      meta_title: toStringOrNull(obj.meta_title),
      meta_description: toStringOrNull(obj.meta_description),
      meta_keyword: toStringOrNull(obj.meta_keyword),
      url_key: toStringOrNull(obj.url_key),
      base_image: toStringOrNull(obj.base_image),
      small_image: toStringOrNull(obj.small_image),
      thumbnail: toStringOrNull(obj.thumbnail),
      magento_created_at: toTimestampOrNull(obj.magento_created_at),
      magento_updated_at: toTimestampOrNull(obj.magento_updated_at),
    });
  });

  return { rows, errors };
}

export function parseProductImportJson(text: string): ProductImportParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
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
