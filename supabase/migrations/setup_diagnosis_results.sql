-- =========================================================
-- diagnosis_results テーブル（Build or Buy・技術構成診断の結果保存）
-- 依存: setup_user_profiles.sql（auth.users を参照するため先に実行）
--
-- 現行ベースライン:
--   - 後続追加された title / memo / UPDATEポリシーを初期定義へ統合済み
--   - 旧環境への再実行でも title / memo を補えるよう ALTER ... IF NOT EXISTS を追加
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
  title                    TEXT,
  memo                     TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 旧版テーブルを作成済みの環境で再実行した場合にも不足列を補完する。
ALTER TABLE public.diagnosis_results
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS memo  TEXT;

CREATE INDEX IF NOT EXISTS diagnosis_results_user_id_created_at_idx
  ON public.diagnosis_results (user_id, created_at DESC);

ALTER TABLE public.diagnosis_results ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnosis_results TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'diagnosis_results'
      AND policyname = 'select_own_diagnosis_results'
  ) THEN
    CREATE POLICY "select_own_diagnosis_results" ON public.diagnosis_results
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'diagnosis_results'
      AND policyname = 'insert_own_diagnosis_results'
  ) THEN
    CREATE POLICY "insert_own_diagnosis_results" ON public.diagnosis_results
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'diagnosis_results'
      AND policyname = 'update_own_diagnosis_results'
  ) THEN
    CREATE POLICY "update_own_diagnosis_results" ON public.diagnosis_results
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'diagnosis_results'
      AND policyname = 'delete_own_diagnosis_results'
  ) THEN
    CREATE POLICY "delete_own_diagnosis_results" ON public.diagnosis_results
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
