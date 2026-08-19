-- =========================================================
-- product_list_with_sales ビュー（productsに直近1年の累積売上を付与）
-- 依存: setup_products.sql, setup_product_sales.sql
--
-- 商品一覧の「累積売上（直近1年）順」ソートのため、products の全カラムに
-- product_sales（sale_date が現在時点から1年以内の行）をSKU単位で集計した
-- sales_total_1y（NUMERIC、対象期間に売上がない商品は0）を付与したビュー。
-- PostgRESTの.order()は問い合わせ対象のリソース自身のカラムしか指定できず
-- 集計列でのソートができないため、集計済みのこのビューを商品一覧の取得元とする
-- （src/features/productContent/api/productListApi.ts 参照）。
--
-- security_invoker=true とし、products/product_sales のRLSをビュー越しでも
-- 呼び出し元ロールの権限で評価させる（両テーブルとも「ログイン済みユーザー全体に
-- 許可」のポリシーのため実質的な挙動差はないが、他テーブルと同じ安全側の設計に揃える）。
-- =========================================================

CREATE OR REPLACE VIEW public.product_list_with_sales
WITH (security_invoker = true) AS
SELECT
  p.*,
  COALESCE(s.sales_total_1y, 0) AS sales_total_1y
FROM public.products p
LEFT JOIN (
  SELECT sku, SUM(sales_amount) AS sales_total_1y
  FROM public.product_sales
  WHERE sale_date >= (CURRENT_DATE - INTERVAL '1 year')
  GROUP BY sku
) s ON s.sku = p.sku;

GRANT SELECT ON public.product_list_with_sales TO authenticated;
