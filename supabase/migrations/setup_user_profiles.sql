-- =========================================================
-- user_profiles テーブル + サインアップ時の自動作成トリガー
-- 依存: なし（最初に実行）
--
-- 使い方:
--   Supabaseダッシュボード → SQL Editor に貼り付けて実行するか、
--   `supabase db push` でこのファイルを含むmigrationsを適用してください。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT        NOT NULL,
  avatar_url   TEXT,
  email        TEXT,
  created_at   TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLSポリシーだけではテーブルへのアクセス権は付与されないため、
-- authenticatedロールへの明示的なGRANTが必要（INSERTはトリガー経由のみのため付与しない）。
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'select_own_profile'
  ) THEN
    CREATE POLICY "select_own_profile" ON public.user_profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'update_own_profile'
  ) THEN
    CREATE POLICY "update_own_profile" ON public.user_profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- サインアップ完了時にauth.usersへのINSERTをトリガーにしてprofileを自動作成する。
-- display_nameはsignUp()のoptions.data.display_nameがあればそれを使い、
-- 無ければメールアドレスの@より前を使う。
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(btrim(NEW.raw_user_meta_data->>'display_name'), ''), split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user_signup() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
