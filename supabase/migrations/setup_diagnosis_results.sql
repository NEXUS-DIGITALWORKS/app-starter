-- =========================================================
-- diagnosis_results テーブル（Build or Buy・技術構成診断の結果保存）
-- 依存: setup_user_profiles.sql（auth.users を参照するため先に実行）
--
-- 使い方:
--   Supabaseダッシュボード → SQL Editor に貼り付けて実行するか、
--   `supabase db push` でこのファイルを含むmigrationsを適用してください。
--
-- 注記:
--   開発指示書13章のdiagnosis_resultsに対し、利用者ごとの履歴表示と
--   RLSによるアクセス制御のため user_id 列を追加しています。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.diagnosis_results (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_input               JSONB       NOT NULL,
  structured_requirements  JSONB,
  build_or_buy_result      JSONB       NOT NULL,
  recommended_stack        JSONB,
  alternative_stack        JSONB,
  score_details            JSONB,
  risks                    JSONB,
  created_at               TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS diagnosis_results_user_id_created_at_idx
  ON public.diagnosis_results (user_id, created_at DESC);

ALTER TABLE public.diagnosis_results ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'diagnosis_results' AND policyname = 'select_own_diagnosis_results'
  ) THEN
    CREATE POLICY "select_own_diagnosis_results" ON public.diagnosis_results
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'diagnosis_results' AND policyname = 'insert_own_diagnosis_results'
  ) THEN
    CREATE POLICY "insert_own_diagnosis_results" ON public.diagnosis_results
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'diagnosis_results' AND policyname = 'delete_own_diagnosis_results'
  ) THEN
    CREATE POLICY "delete_own_diagnosis_results" ON public.diagnosis_results
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
