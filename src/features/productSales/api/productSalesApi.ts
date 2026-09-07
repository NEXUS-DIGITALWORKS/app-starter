import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import type { HomeSalesSummary, ProductSaleRecord } from '../types/productSales';

interface ProductSaleRow {
  sale_date: string;
  qty_ordered: number;
  sales_amount: number;
  discount_amount: number | null;
  unit_price: number | null;
  customer_type: string | null;
}

// SupabaseはPostgRESTのデフォルト上限により1クエリ最大1000行しか返さないため、
// 注文件数が1000件を超える商品は.range()でページングして全件取得する。
const PAGE_SIZE = 1000;

// 顧客区分（新規/既存/すべて）で切り替え表示するため、集計はクライアント側で
// 行う前提で生の注文明細（1SKU分）をそのまま返す。orderIdは表示に使わないため取得しない。
export async function fetchProductSaleRecords(sku: string): Promise<ProductSaleRecord[] | null> {
  if (!isSupabaseConfigured()) return null;

  const rows: ProductSaleRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('product_sales')
      .select('sale_date, qty_ordered, sales_amount, discount_amount, unit_price, customer_type')
      .eq('sku', sku)
      .range(from, from + PAGE_SIZE - 1);
    if (error || !data) return null;

    rows.push(...(data as ProductSaleRow[]));
    if (data.length < PAGE_SIZE) break;
  }

  return rows.map((row) => ({
    saleDate: row.sale_date,
    qtyOrdered: row.qty_ordered,
    salesAmount: row.sales_amount,
    discountAmount: row.discount_amount ?? 0,
    unitPrice: row.unit_price,
    customerType: row.customer_type,
  }));
}

interface HomeSalesSummaryRow {
  period_start: string;
  period_end: string;
  sales_total: number;
}

// Home画面の売上集計カード用。home_sales_summary ビューは常に1行を返す
// （対象期間に売上が1件もなくてもCOALESCEで0行が返る）。
export async function fetchHomeSalesSummary(): Promise<HomeSalesSummary | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase.from('home_sales_summary').select('period_start, period_end, sales_total').single();
  if (error || !data) return null;

  const row = data as HomeSalesSummaryRow;
  return {
    periodStart: row.period_start,
    periodEnd: row.period_end,
    totalSalesAmount: row.sales_total,
  };
}
