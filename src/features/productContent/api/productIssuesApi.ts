import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import { getProductImageUrl } from '../lib/productImage';
import { evaluateProductIssues, type ProductIssueRow } from '../lib/productIssueRules';
import type { ProductIssueItem } from '../types/productIssue';

interface ProductIssueQueryRow extends ProductIssueRow {
  sku: string;
  name_ja: string;
  brand: string | null;
  base_image: string | null;
}

const SELECT_COLUMNS =
  'sku, name_ja, name_zh_tw, name_en, brand, base_image, ec_status, ' +
  'short_description, short_description_zh_tw, short_description_en, short_description_length, ' +
  'description_zh_tw, description_en, description_length, sales_total_2y';

// PostgRESTのデフォルト上限(1000件)を超えて全件評価できるよう、明示的にrangeを広げて取得する。
// ルールがDB側では表現しにくい（言語判定・複合条件）ため、全件取得してクライアント側で評価する。
const MAX_ROWS = 20000;

export async function fetchProductIssues(): Promise<ProductIssueItem[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase.from('product_list_with_sales').select(SELECT_COLUMNS).range(0, MAX_ROWS - 1);
  if (error) {
    // 取得失敗時に黙って空配列を返すと「該当0件」と区別が付かないため、フックのエラー表示に委ねる。
    console.error('[fetchProductIssues]', error);
    throw error;
  }
  if (!data) return [];

  const rows = data as unknown as ProductIssueQueryRow[];

  const items: ProductIssueItem[] = rows.map((row) => ({
    sku: row.sku,
    imageUrl: row.base_image ? getProductImageUrl(row.base_image) : undefined,
    nameJa: row.name_ja,
    nameZhTw: row.name_zh_tw ?? undefined,
    nameEn: row.name_en ?? undefined,
    brand: row.brand ?? '',
    shortDescriptionLength: row.short_description_length ?? 0,
    descriptionLength: row.description_length ?? 0,
    salesTotal2y: row.sales_total_2y ?? 0,
    issues: evaluateProductIssues(row),
  }));

  return items.filter((item) => item.issues.length > 0);
}
