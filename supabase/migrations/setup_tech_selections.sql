-- =========================================================
-- tech_selections テーブル（技術要素選択機能の保存結果）
-- 依存: setup_user_profiles.sql（auth.users を参照するため先に実行）
--
-- 使い方:
--   Supabaseダッシュボード → SQL Editor に貼り付けて実行するか、
--   `supabase db push` でこのファイルを含むmigrationsを適用してください。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.tech_selections (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selection             JSONB       NOT NULL,
  matched_pattern_ids   JSONB,
  created_at            TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS tech_selections_user_id_created_at_idx
  ON public.tech_selections (user_id, created_at DESC);

ALTER TABLE public.tech_selections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tech_selections' AND policyname = 'select_own_tech_selections'
  ) THEN
    CREATE POLICY "select_own_tech_selections" ON public.tech_selections
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tech_selections' AND policyname = 'insert_own_tech_selections'
  ) THEN
    CREATE POLICY "insert_own_tech_selections" ON public.tech_selections
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tech_selections' AND policyname = 'delete_own_tech_selections'
  ) THEN
    CREATE POLICY "delete_own_tech_selections" ON public.tech_selections
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
