-- =========================================================
-- product_sales に unit_price（商品行の単価）を追加
-- 依存: setup_product_sales.sql（対象テーブルのため先に実行）
--
-- 使い方:
--   Supabaseダッシュボード → SQL Editor に貼り付けて実行するか、
--   `supabase db push` でこのファイルを含むmigrationsを適用してください。
--
-- 設計方針:
--   sales_amount/qty_orderedから単価は算出できるが、取込元CSVにunit_price列が
--   存在するため、丸め誤差を持ち込まずCSVの値をそのまま保持する。
--   NULL許容（未取込のCSVや旧データはNULLのままとし、表示側でsales_amount/qty_orderedから
--   算出した値にフォールバックする）。
--   ADD COLUMN IF NOT EXISTSのため再実行安全。
-- =========================================================

ALTER TABLE public.product_sales ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2);
