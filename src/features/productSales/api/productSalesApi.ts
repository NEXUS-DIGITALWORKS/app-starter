import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import type { ProductSaleRecord } from '../types/productSales';

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
