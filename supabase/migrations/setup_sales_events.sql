-- =========================================================
-- sales_events テーブル（フェア・キャンペーン等のイベント期間）
-- 依存: setup_user_profiles.sql（RLSでログイン判定にuser_profilesを参照するため先に実行）、
--       setup_categories.sql（updated_at自動更新の共通関数 set_updated_at() を再利用するため先に実行）
--
-- 使い方:
--   Supabaseダッシュボード → SQL Editor に貼り付けて実行するか、
--   `supabase db push` でこのファイルを含むmigrationsを適用してください。
--
-- 設計方針:
--   商品別の売上推移グラフに「この期間は◯◯フェアだった」という背景情報を重ねて
--   表示するための店舗全体共通のイベント期間マスタ。特定のSKU・カテゴリには紐付けず、
--   登録した期間はどの商品の売上グラフにも同じように表示される（対象商品を絞る要件が
--   出てきた場合は別途中間テーブルで対応する）。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.sales_events (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  name               TEXT        NOT NULL,
  start_date         DATE        NOT NULL,
  end_date           DATE        NOT NULL,

  created_at         TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at         TIMESTAMPTZ DEFAULT timezone('utc', now()),

  CONSTRAINT sales_events_date_range_check CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS sales_events_date_range_idx ON public.sales_events (start_date, end_date);

-- set_updated_at() は setup_categories.sql で定義済みの共通関数を再利用する
DROP TRIGGER IF EXISTS sales_events_set_updated_at ON public.sales_events;
CREATE TRIGGER sales_events_set_updated_at
  BEFORE UPDATE ON public.sales_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.sales_events ENABLE ROW LEVEL SECURITY;

-- RLSポリシーだけではテーブルへのアクセス権は付与されないため、
-- authenticatedロールへの明示的なGRANTが必要。
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_events TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sales_events' AND policyname = 'select_sales_events_for_logged_in_users'
  ) THEN
    CREATE POLICY "select_sales_events_for_logged_in_users" ON public.sales_events
      FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sales_events' AND policyname = 'insert_sales_events_for_logged_in_users'
  ) THEN
    CREATE POLICY "insert_sales_events_for_logged_in_users" ON public.sales_events
      FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sales_events' AND policyname = 'update_sales_events_for_logged_in_users'
  ) THEN
    CREATE POLICY "update_sales_events_for_logged_in_users" ON public.sales_events
      FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sales_events' AND policyname = 'delete_sales_events_for_logged_in_users'
  ) THEN
    CREATE POLICY "delete_sales_events_for_logged_in_users" ON public.sales_events
      FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;
END $$;
