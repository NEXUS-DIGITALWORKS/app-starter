import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import { parseProductSalesImportCsv } from '../lib/parseProductSalesImport';
import type {
  ProductSalesImportBatchError,
  ProductSalesImportParseResult,
  ProductSalesImportResult,
  ProductSalesImportRow,
} from '../types/productSalesImport';

// SQL Editorへの巨大なINSERT文貼り付けは「長すぎる」で失敗しやすいため、
// この件数単位でupsert/既存SKU取得リクエストを分割し、1リクエストのペイロードを小さく保つ。
const BATCH_SIZE = 200;

const MAX_SAMPLE_SKUS = 5;

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

// product_sales.skuはproducts(sku)へのFKのため、未登録SKUを含む行を混ぜたままupsertすると
// バッチ（BATCH_SIZE件）ごと丸ごと失敗してしまう。事前にproductsへ存在確認し、
// 未登録SKUの行だけを取り除いてから取り込むことで、それ以外の正常な行を守る。
async function fetchExistingSkus(skus: string[]): Promise<Set<string>> {
  const uniqueSkus = Array.from(new Set(skus));
  if (uniqueSkus.length === 0 || !isSupabaseConfigured()) return new Set();

  const results = await Promise.all(
    chunk(uniqueSkus, BATCH_SIZE).map((batch) => supabase.from('products').select('sku').in('sku', batch)),
  );
  const existing = new Set<string>();
  for (const { data } of results) {
    if (data) for (const row of data as { sku: string }[]) existing.add(row.sku);
  }
  return existing;
}

function splitByExistingSku(
  rows: ProductSalesImportRow[],
  existingSkus: Set<string>,
): { importableRows: ProductSalesImportRow[]; missingSkuError: string | null; missingSkus: string[] } {
  const missingSkuSet = new Set<string>();
  const importableRows = rows.filter((row) => {
    if (existingSkus.has(row.sku)) return true;
    missingSkuSet.add(row.sku);
    return false;
  });

  if (missingSkuSet.size === 0) return { importableRows, missingSkuError: null, missingSkus: [] };

  const missingSkus = Array.from(missingSkuSet).sort();
  const skippedRowCount = rows.length - importableRows.length;
  const sample = missingSkus.slice(0, MAX_SAMPLE_SKUS).join(', ');
  return {
    importableRows,
    missingSkuError: `商品マスタに未登録のSKUを含む行 ${skippedRowCount}件は取込対象外です（例: ${sample}）。先に商品データを取込んでください。`,
    missingSkus,
  };
}

export interface ImportProgress {
  processedRows: number;
  totalRows: number;
}

// ファイル選択直後のプレビュー表示用（DBへは書き込まない。未登録SKUの有無だけ確認する）。
export async function previewProductSalesImportFile(file: File): Promise<ProductSalesImportParseResult> {
  const text = await file.text();
  const parsed = parseProductSalesImportCsv(text);
  if (parsed.rows.length === 0) return parsed;

  const existingSkus = await fetchExistingSkus(parsed.rows.map((r) => r.sku));
  const { missingSkuError, missingSkus } = splitByExistingSku(parsed.rows, existingSkus);
  return missingSkuError
    ? { rows: parsed.rows, errors: [...parsed.errors, missingSkuError], missingSkus }
    : parsed;
}

export async function importProductSalesFromFile(
  file: File,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ProductSalesImportResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabaseが未設定のため取込できません（.envを確認してください）');
  }

  const text = await file.text();
  const { rows: parsedRows, errors: parseErrors } = parseProductSalesImportCsv(text);

  const existingSkus = await fetchExistingSkus(parsedRows.map((r) => r.sku));
  const { importableRows, missingSkuError, missingSkus } = splitByExistingSku(parsedRows, existingSkus);
  const allParseErrors = missingSkuError ? [...parseErrors, missingSkuError] : parseErrors;

  const batches = chunk(importableRows, BATCH_SIZE);
  const batchErrors: ProductSalesImportBatchError[] = [];
  let importedCount = 0;
  let processedRows = 0;

  for (const batch of batches) {
    const { error } = await supabase.from('product_sales').upsert(batch, { onConflict: 'order_id,sku' });
    if (error) {
      batchErrors.push({ orderIds: batch.map((r) => r.order_id), message: error.message });
    } else {
      importedCount += batch.length;
    }
    processedRows += batch.length;
    onProgress?.({ processedRows, totalRows: importableRows.length });
  }

  return {
    totalRows: parsedRows.length,
    importedCount,
    failedCount: parsedRows.length - importedCount,
    parseErrors: allParseErrors,
    batchErrors,
    missingSkus,
  };
}
