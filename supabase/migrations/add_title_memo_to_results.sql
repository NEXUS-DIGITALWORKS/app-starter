-- =========================================================
-- diagnosis_results / tech_selections に title・memo 列とUPDATE権限を追加
-- 依存: setup_diagnosis_results.sql, setup_tech_selections.sql が先に実行済みであること
--
-- 使い方:
--   setup_diagnosis_results.sql / setup_tech_selections.sql を実行済みの
--   既存環境（title/memo列・UPDATE権限がまだ無い）に対して、このファイルを
--   Supabaseダッシュボード → SQL Editor で実行してください。
--   新規セットアップの場合は setup_*.sql に既に含まれているため不要です。
-- =========================================================

ALTER TABLE public.diagnosis_results
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS memo  TEXT;

ALTER TABLE public.tech_selections
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS memo  TEXT;

-- 一覧画面からのタイトル・メモ編集のためUPDATE権限を追加
GRANT UPDATE ON public.diagnosis_results TO authenticated;
GRANT UPDATE ON public.tech_selections TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'diagnosis_results' AND policyname = 'update_own_diagnosis_results'
  ) THEN
    CREATE POLICY "update_own_diagnosis_results" ON public.diagnosis_results
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tech_selections' AND policyname = 'update_own_tech_selections'
  ) THEN
    CREATE POLICY "update_own_tech_selections" ON public.tech_selections
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
