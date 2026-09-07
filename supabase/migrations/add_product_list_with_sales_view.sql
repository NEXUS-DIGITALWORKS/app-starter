-- =========================================================
-- product_list_with_sales ビュー（productsに直近2年の累積売上を付与）
-- 依存: setup_products.sql, setup_product_sales.sql
--
-- 商品一覧の「累積売上（直近2年）順」ソートのため、products の全カラムに
-- product_sales（sale_date が現在時点から2年以内の行）をSKU単位で集計した
-- sales_total_2y（NUMERIC、対象期間に売上がない商品は0）を付与したビュー。
-- PostgRESTの.order()は問い合わせ対象のリソース自身のカラムしか指定できず
-- 集計列でのソートができないため、集計済みのこのビューを商品一覧の取得元とする
-- （src/features/productContent/api/productListApi.ts 参照）。
--
-- security_invoker=true とし、products/product_sales のRLSをビュー越しでも
-- 呼び出し元ロールの権限で評価させる（両テーブルとも「ログイン済みユーザー全体に
-- 許可」のポリシーのため実質的な挙動差はないが、他テーブルと同じ安全側の設計に揃える）。
--
-- 「p.*」はビュー作成時点のproductsのカラム一覧に固定されるため、このビュー作成後に
-- productsへカラムを追加しても自動反映されない（PostgRESTからは追加したカラムが
-- 「存在しない」扱いになる）。CREATE OR REPLACE VIEWは列の追加・末尾への挿入はできても
-- 既存列の間に割り込む形の変更（p.*の途中に新カラムが増える）はエラーになるため、
-- DROP→CREATEで作り直す。productsにカラムを追加するマイグレーションを新設した際は、
-- このファイルを再実行してビューを最新のカラム一覧に更新すること。
--
-- 【重要・実行順】category_sales_summary（add_category_sales_summary_view.sql）は
-- このビューをJOINで参照しているため、素のDROP VIEWは依存エラーで失敗する。
-- そのためCASCADEで依存ビューごと落とす。CASCADEはcategory_sales_summaryも
-- 道連れに削除するので、このファイルを再実行した後は必ず
-- add_category_sales_summary_view.sql を続けて再実行し、依存ビューを作り直すこと。
-- =========================================================

DROP VIEW IF EXISTS public.product_list_with_sales CASCADE;

CREATE VIEW public.product_list_with_sales
WITH (security_invoker = true) AS
SELECT
  p.*,
  COALESCE(s.sales_total_2y, 0) AS sales_total_2y
FROM public.products p
LEFT JOIN (
  SELECT sku, SUM(sales_amount) AS sales_total_2y
  FROM public.product_sales
  WHERE sale_date >= (CURRENT_DATE - INTERVAL '2 years')
  GROUP BY sku
) s ON s.sku = p.sku;

GRANT SELECT ON public.product_list_with_sales TO authenticated;
