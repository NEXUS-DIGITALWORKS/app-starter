-- =========================================================
-- category_sales_summary ビュー
-- 依存: setup_product_categories.sql, add_product_list_with_sales_view.sql
--
-- カテゴリ改善候補ページ（実件数が少ない／直近売上が低いカテゴリの抽出）で使う、
-- カテゴリ単位に集計した直近1年の売上合計。product_list_with_sales の sales_total_1y
-- （SKU単位、products起点）を product_categories 経由でカテゴリ単位に合算する。
-- category_actual_product_counts と同様、products に実在し ec_status = 'enabled'
-- （非公開でない）SKUのみを対象とする。
--
-- 1商品が複数カテゴリに属す場合、それぞれの所属カテゴリの売上合計に重複計上される
-- （カテゴリ横断で商品の売上を配分する仕組みは持たないため、カテゴリ間の合計は
-- 商品全体の売上合計とは一致しない）。
--
-- DROP VIEW不要のCREATE OR REPLACE VIEWのため再実行安全。
-- =========================================================

CREATE OR REPLACE VIEW public.category_sales_summary AS
SELECT
  pc.category_id,
  COALESCE(SUM(pls.sales_total_1y), 0)::NUMERIC AS sales_total_1y
FROM public.product_categories pc
JOIN public.product_list_with_sales pls ON pls.sku = pc.product_id
WHERE pls.ec_status = 'enabled'
GROUP BY pc.category_id;

GRANT SELECT ON public.category_sales_summary TO authenticated;
