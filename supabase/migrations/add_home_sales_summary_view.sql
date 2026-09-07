-- =========================================================
-- home_sales_summary ビュー（Home画面の売上集計カード用）
-- 依存: setup_product_sales.sql
--
-- Home画面の「売上集計」カードで表示する、2023/08/19〜2026/08/18の期間に
-- 絞った累積売上合計を1行で返す。対象期間は固定（他の集計のような
-- 「現在時点からN年以内」の可変ウィンドウではない）。
--
-- PostgRESTの集計関数(sum()等)のサポートに依存せず、サーバー側で
-- あらかじめ1行にSUMしておくことで、大量の注文明細行をクライアント側へ
-- ページングして合算する必要をなくす（他の *_sales_summary ビューと同じ設計方針）。
--
-- security_invoker=true とし、product_salesのRLSをビュー越しでも
-- 呼び出し元ロールの権限で評価させる。
--
-- CREATE OR REPLACE VIEWのため再実行安全。
-- =========================================================

CREATE OR REPLACE VIEW public.home_sales_summary
WITH (security_invoker = true) AS
SELECT
  DATE '2023-08-19' AS period_start,
  DATE '2026-08-18' AS period_end,
  COALESCE(SUM(sales_amount), 0)::NUMERIC AS sales_total
FROM public.product_sales
WHERE sale_date BETWEEN DATE '2023-08-19' AND DATE '2026-08-18';

GRANT SELECT ON public.home_sales_summary TO authenticated;
