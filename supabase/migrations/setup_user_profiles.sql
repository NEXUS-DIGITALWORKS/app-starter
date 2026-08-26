-- =========================================================
-- user_profiles テーブル + サインアップ時の自動作成トリガー
-- 依存: なし（最初に実行）
--
-- 現行ベースライン:
--   - 管理者招待機能用の is_admin を初期定義に統合
--   - Edge Function(service_role) が is_admin を参照できるよう SELECT を付与
--   - 一般ユーザーは is_admin / email を直接更新できないよう、UPDATE権限を
--     display_name / avatar_url のみに限定
--
-- 注意:
--   email の変更は public.user_profiles を直接UPDATEせず、Supabase Auth側で行うこと。
--   is_admin の付与・解除は管理者処理（SQL Editor / service_role側）で行うこと。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT        NOT NULL,
  avatar_url   TEXT,
  email        TEXT,
  is_admin     BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- CREATE TABLE IF NOT EXISTS は既存テーブルへ列を追加しないため、
-- 旧セットアップ済み環境でこのファイルを再実行した場合にも不足列を補えるようにする。
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------
-- 権限
-- -----------------------------------------------------------------
-- authenticated は自分のプロフィールを参照できる。
GRANT SELECT ON public.user_profiles TO authenticated;

-- 旧版で付与していた「テーブル全体のUPDATE」を明示的に取り消す。
-- is_admin を本人が true に変更できる状態を防ぐため、更新可能列を限定する。
REVOKE UPDATE ON public.user_profiles FROM authenticated;
REVOKE INSERT, DELETE ON public.user_profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url) ON public.user_profiles TO authenticated;

-- 管理者招待Edge Functionが呼び出し元の is_admin を確認するために必要。
GRANT SELECT ON public.user_profiles TO service_role;

-- -----------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'select_own_profile'
  ) THEN
    CREATE POLICY "select_own_profile" ON public.user_profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'update_own_profile'
  ) THEN
    CREATE POLICY "update_own_profile" ON public.user_profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- -----------------------------------------------------------------
-- サインアップ時のプロフィール自動作成
-- -----------------------------------------------------------------
-- display_name は signUp() の options.data.display_name を優先し、
-- 無ければメールアドレスの @ より前を使用する。
-- メールも無い認証方式で実行された場合に NOT NULL 違反にならないよう 'User' を最後の候補とする。
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(btrim(NEW.raw_user_meta_data->>'display_name'), ''),
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'User'
    ),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- この関数はauth.usersのトリガーからだけ実行し、APIから直接呼ばせない。
REVOKE ALL ON FUNCTION public.handle_new_user_signup() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- 最初の管理者は、Supabase SQL Editor等の管理者権限で明示的に設定する。
-- 例:
-- UPDATE public.user_profiles
-- SET is_admin = true
-- WHERE email = 'admin@example.com';
