-- =========================================================
-- products の short_description / description_ja に文字数の生成カラムを追加する
-- 依存: setup_products.sql, rename_content_columns_add_ja_suffix.sql
--
-- 商品一覧の検索条件で「文字数で絞り込む」をSupabase(PostgREST)の
-- gte/lte フィルタだけで実現できるよう、char_length()の結果を
-- GENERATED ALWAYS AS ... STORED で保持する（本文更新のたびに自動再計算される）。
-- ingredientの検索条件が原文（日本語）のみを対象としているのと同じ考え方で、
-- short_description/description_ja（原文）のみを対象とし、繁体字・英語版は対象外。
-- =========================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_description_length INTEGER GENERATED ALWAYS AS (char_length(short_description)) STORED,
  ADD COLUMN IF NOT EXISTS description_length        INTEGER GENERATED ALWAYS AS (char_length(description_ja)) STORED;
