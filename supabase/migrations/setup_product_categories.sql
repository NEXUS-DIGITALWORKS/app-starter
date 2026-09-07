-- =========================================================
-- product_categories テーブル（商品 ←→ カテゴリ の多対多関連）
-- 依存: setup_categories.sql（categories.id を参照するため先に実行）
--
-- 使い方:
--   Supabaseダッシュボード → SQL Editor に貼り付けて実行するか、
--   `supabase db push` でこのファイルを含むmigrationsを適用してください。
--
-- 設計方針:
--   実装時点で products テーブルはSupabase側に存在せず、商品情報は
--   フロントエンドのモックデータ（src/features/productContent/data/mockProducts.ts 等）
--   でSKUをキーに管理されている。そのため product_id はUUID FKではなく
--   商品SKU(TEXT)を直接保持する。存在しないSKUを指定してもDB側では検知できないため、
--   呼び出し元（src/features/categories/api/productCategoriesApi.ts）で実在する
--   SKUのみを渡す運用とする。将来 products テーブルが実装された際は、
--   SKUを橋渡しにFK化（もしくは product_id を products.id へ差し替え）を検討する。
--
--   商品⇔カテゴリの関連付けは全ログインユーザーが共同で編集する業務データのため、
--   categories 同様に所有者ベースではなく、ログイン済み(user_profilesに行がある)
--   authenticated ロール全体にSELECT/INSERT/UPDATE/DELETEを許可する。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   TEXT        NOT NULL,
  category_id  UUID        NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  is_primary   BOOLEAN     NOT NULL DEFAULT false,
  sort_order   INT         NOT NULL DEFAULT 0,
  source       TEXT        NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'magento', 'ai')),
  confidence   NUMERIC(5,4), -- 将来のAIカテゴリ推薦用（Phase3）。現時点では常にNULL。
  created_at   TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at   TIMESTAMPTZ DEFAULT timezone('utc', now()),
  UNIQUE (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS product_categories_product_id_idx ON public.product_categories (product_id);
CREATE INDEX IF NOT EXISTS product_categories_category_id_idx ON public.product_categories (category_id);

-- 1商品につき「メインカテゴリ」は1件までに制限する（部分UNIQUEインデックス）。
CREATE UNIQUE INDEX IF NOT EXISTS product_categories_one_primary_per_product_idx
  ON public.product_categories (product_id) WHERE is_primary = true;

DROP TRIGGER IF EXISTS product_categories_set_updated_at ON public.product_categories;
CREATE TRIGGER product_categories_set_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLSポリシーだけではテーブルへのアクセス権は付与されないため、
-- authenticatedロールへの明示的なGRANTが必要。
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'select_product_categories_for_logged_in_users'
  ) THEN
    CREATE POLICY "select_product_categories_for_logged_in_users" ON public.product_categories
      FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'insert_product_categories_for_logged_in_users'
  ) THEN
    CREATE POLICY "insert_product_categories_for_logged_in_users" ON public.product_categories
      FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'update_product_categories_for_logged_in_users'
  ) THEN
    CREATE POLICY "update_product_categories_for_logged_in_users" ON public.product_categories
      FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'delete_product_categories_for_logged_in_users'
  ) THEN
    CREATE POLICY "delete_product_categories_for_logged_in_users" ON public.product_categories
      FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;
END $$;

-- カテゴリ一覧画面での商品件数表示をN+1クエリなしで取得するための集計ビュー。
CREATE OR REPLACE VIEW public.category_product_counts AS
SELECT category_id, COUNT(*)::INT AS product_count
FROM public.product_categories
GROUP BY category_id;

GRANT SELECT ON public.category_product_counts TO authenticated;
