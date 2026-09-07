-- =========================================================
-- products テーブル（商品本体マスタ）
-- 依存: setup_user_profiles.sql（RLSでログイン判定にuser_profilesを参照するため先に実行）、
--       setup_categories.sql（updated_at自動更新の共通関数 set_updated_at() を再利用するため先に実行）
--
-- 使い方:
--   Supabaseダッシュボード → SQL Editor に貼り付けて実行するか、
--   `supabase db push` でこのファイルを含むmigrationsを適用してください。
--
-- 設計方針:
--   商品情報整備AI（Product Content Studio）の商品一覧・詳細画面が必要とする項目のうち、
--   Magentoエクスポートで取得できる「原本データ」と、人が確定させた繁体字・英語版の
--   本文・メタタイトル/ディスクリプション（name_zh_tw/_en等と同様の位置づけ。
--   add_locale_content_to_products.sql参照）を持つ。AI翻訳の下書き（人が確定する前の提案）・
--   改善案・SEO診断issues・抽出特徴量（src/features/productContent/types.ts の
--   ExtractedFeature/SeoIssue相当）は本テーブルの対象外で、別途生成結果を保存する
--   テーブルを設ける想定（未実装）。
--
--   主キーはMagentoのentity_id（数値）ではなくSKU(TEXT)とする。
--   product_categories.product_id が既にSKUをキーにしている（setup_product_categories.sql参照）ため、
--   一貫性を優先した。product_categories側は投入順序の都合上まだFK化していないが、
--   products投入完了後に ALTER TABLE product_categories ADD CONSTRAINT ... REFERENCES products(sku)
--   を検討する。
--
--   商品データは全ログインユーザーが共同で編集する業務データのため、categories/product_categories
--   同様に所有者ベースではなく、ログイン済み(user_profilesに行がある)authenticated ロール全体に
--   SELECT/INSERT/UPDATE/DELETEを許可する。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.products (
  sku                 TEXT        PRIMARY KEY,
  brand               TEXT,

  -- 商品名（日本語=原文/マスターデータ、繁体字・英語はMagento側に既存訳があれば投入、
  -- 無ければNULLのままAI翻訳のベースとする）
  name                TEXT        NOT NULL,
  name_zh_tw          TEXT,
  name_en             TEXT,

  price               NUMERIC(12,2),
  ec_status           TEXT        NOT NULL DEFAULT 'enabled' CHECK (ec_status IN ('enabled', 'disabled')),
  ec_visibility       TEXT        CHECK (ec_visibility IN ('Catalog & Search', 'Catalog', 'Search', 'Not Visible Individually')),

  -- Magentoにはない、アプリ内でのみ管理する整備ワークフロー状態
  workflow_status     TEXT        NOT NULL DEFAULT 'draft'
                                   CHECK (workflow_status IN ('draft', 'editing', 'review_requested', 'approved', 'applied')),

  -- 原文コンテンツ（日本語・マスターデータ）。繁体字/英語の翻訳・改善案はAI生成のため別テーブル想定。
  short_description   TEXT,
  description         TEXT,
  ingredients         TEXT,
  usage_notes         TEXT,

  -- Magento側メタデータ（store view単位の値だが、MVP1では商品につき1件のみ保持）
  magento_entity_id   TEXT,
  store_id            TEXT,
  store_view_code     TEXT,
  store_view_name     TEXT,
  locale              TEXT,
  meta_title          TEXT,
  meta_description    TEXT,
  meta_keyword        TEXT,
  url_key             TEXT,

  -- 画像パス（Magentoの base_image / small_image / thumbnail 属性）
  base_image          TEXT,
  small_image         TEXT,
  thumbnail           TEXT,

  -- Magento側の作成日時・更新日時（このテーブルへの投入日時とは別に保持）
  magento_created_at  TIMESTAMPTZ,
  magento_updated_at  TIMESTAMPTZ,

  created_at          TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at          TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products (brand);
CREATE INDEX IF NOT EXISTS products_ec_status_idx ON public.products (ec_status);
CREATE INDEX IF NOT EXISTS products_workflow_status_idx ON public.products (workflow_status);

-- set_updated_at() は setup_categories.sql で定義済みの共通関数を再利用する
DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLSポリシーだけではテーブルへのアクセス権は付与されないため、
-- authenticatedロールへの明示的なGRANTが必要。
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'select_products_for_logged_in_users'
  ) THEN
    CREATE POLICY "select_products_for_logged_in_users" ON public.products
      FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'insert_products_for_logged_in_users'
  ) THEN
    CREATE POLICY "insert_products_for_logged_in_users" ON public.products
      FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'update_products_for_logged_in_users'
  ) THEN
    CREATE POLICY "update_products_for_logged_in_users" ON public.products
      FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'delete_products_for_logged_in_users'
  ) THEN
    CREATE POLICY "delete_products_for_logged_in_users" ON public.products
      FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;
END $$;

-- =========================================================
-- product_tags テーブル（商品タグ、多対多ではなく1商品Nタグのフラット構造）
-- Magentoの商品タグ属性由来（source='magento'）と、アプリ内での手動追加（source='manual'）を区別する。
-- src/features/productContent/data/mockTagsStore.ts のコメント「実データ接続時は不要
-- （Magento側の商品タグ属性等に置き換える）」に対応する永続化先。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.product_tags (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   TEXT        NOT NULL REFERENCES public.products(sku) ON DELETE CASCADE,
  tag          TEXT        NOT NULL,
  source       TEXT        NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'magento')),
  created_at   TIMESTAMPTZ DEFAULT timezone('utc', now()),
  UNIQUE (product_id, tag)
);

CREATE INDEX IF NOT EXISTS product_tags_product_id_idx ON public.product_tags (product_id);

ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_tags TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_tags' AND policyname = 'select_product_tags_for_logged_in_users'
  ) THEN
    CREATE POLICY "select_product_tags_for_logged_in_users" ON public.product_tags
      FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_tags' AND policyname = 'insert_product_tags_for_logged_in_users'
  ) THEN
    CREATE POLICY "insert_product_tags_for_logged_in_users" ON public.product_tags
      FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_tags' AND policyname = 'update_product_tags_for_logged_in_users'
  ) THEN
    CREATE POLICY "update_product_tags_for_logged_in_users" ON public.product_tags
      FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_tags' AND policyname = 'delete_product_tags_for_logged_in_users'
  ) THEN
    CREATE POLICY "delete_product_tags_for_logged_in_users" ON public.product_tags
      FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;
END $$;
