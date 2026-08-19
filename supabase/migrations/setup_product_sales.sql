-- =========================================================
-- product_sales テーブル（SKU別・日次の購入明細）
-- 依存: setup_user_profiles.sql（RLSでログイン判定にuser_profilesを参照するため先に実行）、
--       setup_categories.sql（updated_at自動更新の共通関数 set_updated_at() を再利用するため先に実行）、
--       setup_products.sql（sku列へのFKのため先に実行）
--
-- 使い方:
--   Supabaseダッシュボード → SQL Editor に貼り付けて実行するか、
--   `supabase db push` でこのファイルを含むmigrationsを適用してください。
--
-- 設計方針:
--   顧客Email等、SKU×日付単位の集計では表現できない項目（購入者・購入ストア・出荷国）を
--   含めたいという要件のため、集計テーブルではなく「注文の商品行（注文明細）単位」で1行とする。
--   Magento等のECサイト側でエクスポートされる注文明細（Sales Order Items）を想定し、
--   注文番号（order_id、MagentoのincrementId等）とSKUの組で一意とすることで、
--   CSV再取込時に同じ注文が重複登録されるのを防ぐ。
--
--   sales_amountはその商品行にかかった割引適用後の実売上金額、discount_amountはその商品行に
--   かかった値引き分（注文全体の割引を商品行に按分した値も許容）を保持する。
--
--   customer_email等の個人情報を含むが、商品データ（products/product_categories）と同様に
--   業務データとして扱い、ログイン済み(user_profilesに行がある)authenticatedロール全体に
--   SELECT/INSERT/UPDATE/DELETEを許可する。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.product_sales (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id           TEXT        NOT NULL,
  sku                TEXT        NOT NULL REFERENCES public.products(sku),
  sale_date          DATE        NOT NULL,

  qty_ordered        INTEGER     NOT NULL,
  sales_amount       NUMERIC(12,2) NOT NULL,
  discount_amount    NUMERIC(12,2),

  store              TEXT,
  shipping_country   TEXT,
  customer_email     TEXT,
  customer_type      TEXT,

  created_at         TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at         TIMESTAMPTZ DEFAULT timezone('utc', now()),

  UNIQUE (order_id, sku)
);

CREATE INDEX IF NOT EXISTS product_sales_sku_idx ON public.product_sales (sku);
CREATE INDEX IF NOT EXISTS product_sales_sale_date_idx ON public.product_sales (sale_date);

-- set_updated_at() は setup_categories.sql で定義済みの共通関数を再利用する
DROP TRIGGER IF EXISTS product_sales_set_updated_at ON public.product_sales;
CREATE TRIGGER product_sales_set_updated_at
  BEFORE UPDATE ON public.product_sales
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;

-- RLSポリシーだけではテーブルへのアクセス権は付与されないため、
-- authenticatedロールへの明示的なGRANTが必要。
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_sales TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_sales' AND policyname = 'select_product_sales_for_logged_in_users'
  ) THEN
    CREATE POLICY "select_product_sales_for_logged_in_users" ON public.product_sales
      FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_sales' AND policyname = 'insert_product_sales_for_logged_in_users'
  ) THEN
    CREATE POLICY "insert_product_sales_for_logged_in_users" ON public.product_sales
      FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_sales' AND policyname = 'update_product_sales_for_logged_in_users'
  ) THEN
    CREATE POLICY "update_product_sales_for_logged_in_users" ON public.product_sales
      FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_sales' AND policyname = 'delete_product_sales_for_logged_in_users'
  ) THEN
    CREATE POLICY "delete_product_sales_for_logged_in_users" ON public.product_sales
      FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;
END $$;
