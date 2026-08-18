// Magentoエクスポート形式のJSON（商品オブジェクトの配列）をproductsテーブルへ取り込むための型。
// フィールド名はsupabase/migrations/setup_products.sqlの列名（DB書き込み時のキー）に合わせている。
// name/description/meta_title/meta_descriptionはDB側がname_ja/description_ja/meta_title_ja/
// meta_description_jaへ改名済みだが、エクスポートJSON側のキー名（Magento仕様、name等）とは
// 異なるため、対応関係はlib/parseProductImport.tsのマッピングを参照。

export interface ProductImportRow {
  sku: string;
  name_ja: string;
  name_zh_tw: string | null;
  name_en: string | null;
  brand: string | null;
  price: number | null;
  ec_status: 'enabled' | 'disabled' | null;
  ec_visibility: 'Catalog & Search' | 'Catalog' | 'Search' | 'Not Visible Individually' | null;
  short_description: string | null;
  description_ja: string | null;
  ingredients: string | null;
  usage_notes: string | null;
  magento_entity_id: string | null;
  store_id: string | null;
  store_view_code: string | null;
  store_view_name: string | null;
  locale: string | null;
  meta_title_ja: string | null;
  meta_description_ja: string | null;
  url_key: string | null;
  base_image: string | null;
  small_image: string | null;
  thumbnail: string | null;
  magento_created_at: string | null;
  magento_updated_at: string | null;
}

export interface ProductImportParseResult {
  rows: ProductImportRow[];
  errors: string[];
}

export interface ProductImportBatchError {
  skus: string[];
  message: string;
}

export interface ProductImportResult {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  parseErrors: string[];
  batchErrors: ProductImportBatchError[];
}
