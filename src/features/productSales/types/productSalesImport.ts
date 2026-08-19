// 注文明細（Sales Order Items）エクスポート形式のCSVをproduct_salesテーブルへ取り込むための型。
// フィールド名はsupabase/migrations/setup_product_sales.sqlの列名（DB書き込み時のキー）に合わせている。
// order_id + skuの組でproduct_sales.UNIQUE(order_id, sku)と対応し、再取込時の重複登録を防ぐ。

export interface ProductSalesImportRow {
  order_id: string;
  sku: string;
  sale_date: string;
  unit_price: number | null;
  qty_ordered: number;
  sales_amount: number;
  discount_amount: number | null;
  store: string | null;
  shipping_country: string | null;
  customer_email: string | null;
  customer_type: string | null;
}

export interface ProductSalesImportParseResult {
  rows: ProductSalesImportRow[];
  errors: string[];
}

export interface ProductSalesImportBatchError {
  orderIds: string[];
  message: string;
}

export interface ProductSalesImportResult {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  parseErrors: string[];
  batchErrors: ProductSalesImportBatchError[];
}
