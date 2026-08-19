import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import { parseProductImportFile } from '../lib/parseProductImport';
import type { ProductImportBatchError, ProductImportParseResult, ProductImportResult, ProductImportRow } from '../types/productImport';

// SQL Editorへの巨大なINSERT文貼り付けは「長すぎる」で失敗しやすいため、
// この件数単位でupsert/既存行取得リクエストを分割し、1リクエストのペイロードを小さく保つ。
const BATCH_SIZE = 200;

// 取込ファイルにその列が無かった場合、新規追加(INSERT)時のみ適用する既定値。
// 既存商品の更新(UPDATE)時は、既存値を優先し上書きしない（mergeWithExisting参照）。
const INSERT_DEFAULTS: Record<string, unknown> = {
  ec_status: 'enabled',
  store_view_name: 'Japan Store View',
};

// sku・nameを除く全カラム。取込ファイルで値が空だった場合に、既存商品の値を維持するかどうかの判定対象。
const MERGEABLE_KEYS: (keyof ProductImportRow)[] = [
  'ec_status',
  'name_zh_tw',
  'name_en',
  'brand',
  'price',
  'ec_visibility',
  'short_description',
  'short_description_zh_tw',
  'short_description_en',
  'description_ja',
  'description_zh_tw',
  'description_en',
  'ingredients',
  'ingredients_zh_tw',
  'ingredients_en',
  'usage_notes',
  'usage_notes_zh_tw',
  'usage_notes_en',
  'magento_entity_id',
  'store_id',
  'store_view_code',
  'store_view_name',
  'locale',
  'meta_title_ja',
  'meta_title_zh_tw',
  'meta_title_en',
  'meta_description_ja',
  'meta_description_zh_tw',
  'meta_description_en',
  'url_key',
  'base_image',
  'small_image',
  'thumbnail',
  'magento_created_at',
  'magento_updated_at',
];

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

export interface ImportProgress {
  processedRows: number;
  totalRows: number;
}

// ファイル選択直後のプレビュー表示用（DBへは書き込まない）。
export async function previewProductImportFile(file: File): Promise<ProductImportParseResult> {
  const text = await file.text();
  return parseProductImportFile(text, file.name);
}

// プレビュー画面で「新規／更新」の内訳を表示するための既存SKU件数カウント。
export async function countExistingSkus(skus: string[]): Promise<number> {
  if (!isSupabaseConfigured() || skus.length === 0) return 0;

  const results = await Promise.all(
    chunk(skus, BATCH_SIZE).map((batch) =>
      supabase.from('products').select('sku', { count: 'exact', head: true }).in('sku', batch),
    ),
  );
  return results.reduce((sum, r) => sum + (r.count ?? 0), 0);
}

// 取込ファイルで値が空だった列は、既存商品の値をそのまま維持する（意図せずNULLで
// 上書きしてしまうのを防ぐ）。新規追加の商品でどちらの値も無い列はINSERT_DEFAULTSを使う。
function mergeWithExisting(row: ProductImportRow, existing: Record<string, unknown> | undefined): Record<string, unknown> {
  const merged: Record<string, unknown> = { sku: row.sku, name_ja: row.name_ja };

  for (const key of MERGEABLE_KEYS) {
    const value = row[key];
    if (value !== null && value !== undefined) {
      merged[key] = value;
    } else if (existing && existing[key] !== undefined && existing[key] !== null) {
      merged[key] = existing[key];
    } else {
      merged[key] = INSERT_DEFAULTS[key] ?? null;
    }
  }

  return merged;
}

async function fetchExistingBySku(skus: string[]): Promise<Record<string, Record<string, unknown>>> {
  if (skus.length === 0) return {};
  const { data, error } = await supabase.from('products').select('*').in('sku', skus);
  if (error || !data) return {};

  const map: Record<string, Record<string, unknown>> = {};
  for (const row of data as Record<string, unknown>[]) {
    map[row.sku as string] = row;
  }
  return map;
}

export async function importProductsFromFile(
  file: File,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ProductImportResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabaseが未設定のため取込できません（.envを確認してください）');
  }

  const text = await file.text();
  const { rows, errors: parseErrors } = parseProductImportFile(text, file.name);

  const batches = chunk(rows, BATCH_SIZE);
  const batchErrors: ProductImportBatchError[] = [];
  let importedCount = 0;
  let processedRows = 0;

  for (const batch of batches) {
    const existingBySku = await fetchExistingBySku(batch.map((r) => r.sku));
    const mergedBatch = batch.map((row) => mergeWithExisting(row, existingBySku[row.sku]));

    const { error } = await supabase.from('products').upsert(mergedBatch, { onConflict: 'sku' });
    if (error) {
      batchErrors.push({ skus: batch.map((r) => r.sku), message: error.message });
    } else {
      importedCount += batch.length;
    }
    processedRows += batch.length;
    onProgress?.({ processedRows, totalRows: rows.length });
  }

  return {
    totalRows: rows.length,
    importedCount,
    failedCount: rows.length - importedCount,
    parseErrors,
    batchErrors,
  };
}
