-- =========================================================
-- products テーブルに繁体字・英語版の本文・メタ情報カラムを追加
-- 依存: setup_products.sql
--
-- name_zh_tw/name_en（商品名）と同じ考え方で、short_description/description/
-- ingredients/usage_notes/meta_title/meta_description それぞれに繁体字・英語版の
-- カラムを追加する。日本語カラム（原文）は引き続きマスターデータ、_zh_tw/_en は
-- 人による確定後の最終テキストを保持する。
--
-- AI翻訳の下書き（人が確定する前の提案）自体を保存する仕組みはまだ無く、
-- 都度AI生成し直す運用のまま。url_key/meta_keywordは今回の対象外（日本語のみ）。
-- =========================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_description_zh_tw TEXT,
  ADD COLUMN IF NOT EXISTS short_description_en    TEXT,
  ADD COLUMN IF NOT EXISTS description_zh_tw        TEXT,
  ADD COLUMN IF NOT EXISTS description_en           TEXT,
  ADD COLUMN IF NOT EXISTS ingredients_zh_tw         TEXT,
  ADD COLUMN IF NOT EXISTS ingredients_en            TEXT,
  ADD COLUMN IF NOT EXISTS usage_notes_zh_tw          TEXT,
  ADD COLUMN IF NOT EXISTS usage_notes_en             TEXT,
  ADD COLUMN IF NOT EXISTS meta_title_zh_tw           TEXT,
  ADD COLUMN IF NOT EXISTS meta_title_en              TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_zh_tw     TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_en        TEXT;
