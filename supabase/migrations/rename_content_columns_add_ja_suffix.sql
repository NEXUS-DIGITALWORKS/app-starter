-- =========================================================
-- products テーブルの日本語コンテンツカラムに _ja サフィックスを付与する
-- 依存: setup_products.sql, add_locale_content_to_products.sql
--
-- name/description/meta_title/meta_description は繁体字・英語版が
-- name_zh_tw・name_en のように _zh_tw/_en サフィックス付きで存在する一方、
-- 日本語（原文）側だけサフィックスが無く非対称だったため、name_ja/
-- description_ja/meta_title_ja/meta_description_ja に統一する。
--
-- 実データ投入前のため単純なRENAME COLUMNで対応する（値の移行は不要）。
-- 併せて、使用予定のない meta_keyword カラムを削除する。
-- =========================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN name TO name_ja;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'description'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN description TO description_ja;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN meta_title TO meta_title_ja;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN meta_description TO meta_description_ja;
  END IF;
END $$;

ALTER TABLE public.products DROP COLUMN IF EXISTS meta_keyword;
