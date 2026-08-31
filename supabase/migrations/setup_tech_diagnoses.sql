-- =========================================================
-- tech_diagnoses テーブル（Tech診断：自由文からのシステム方式・技術構成診断の保存結果）
-- 依存: setup_user_profiles.sql（auth.users を参照するため先に実行）
--
-- 旧 tech_selections（技術者向け・手動選択機能の保存結果）とは独立したテーブル。
-- STEP2のAI要件抽出結果（requirement_profile）、追加質問への回答、
-- 最終的な診断結果（diagnosis_result）を一式で保存する。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.tech_diagnoses (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  free_text             TEXT        NOT NULL,
  requirement_profile   JSONB       NOT NULL,
  diagnosis_result      JSONB       NOT NULL,
  title                 TEXT,
  memo                  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS tech_diagnoses_user_id_created_at_idx
  ON public.tech_diagnoses (user_id, created_at DESC);

ALTER TABLE public.tech_diagnoses ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tech_diagnoses TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tech_diagnoses'
      AND policyname = 'select_own_tech_diagnoses'
  ) THEN
    CREATE POLICY "select_own_tech_diagnoses" ON public.tech_diagnoses
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tech_diagnoses'
      AND policyname = 'insert_own_tech_diagnoses'
  ) THEN
    CREATE POLICY "insert_own_tech_diagnoses" ON public.tech_diagnoses
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tech_diagnoses'
      AND policyname = 'update_own_tech_diagnoses'
  ) THEN
    CREATE POLICY "update_own_tech_diagnoses" ON public.tech_diagnoses
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tech_diagnoses'
      AND policyname = 'delete_own_tech_diagnoses'
  ) THEN
    CREATE POLICY "delete_own_tech_diagnoses" ON public.tech_diagnoses
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
