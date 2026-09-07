-- =========================================================
-- categories テーブル（カテゴリマスタ）
-- 依存: setup_user_profiles.sql（RLSでログイン判定にuser_profilesを参照するため先に実行）
--
-- 使い方:
--   Supabaseダッシュボード → SQL Editor に貼り付けて実行するか、
--   `supabase db push` でこのファイルを含むmigrationsを適用してください。
--
-- 設計方針:
--   Magento用カテゴリ文字列（例: 関西美克薬粧Main/化妝品/護膚品）を直接保存せず、
--   コード・親子階層・多言語名称を持つ構造化マスタとして管理する。
--   Magento出力用のパス文字列は保存せず、都度 categories の親子関係から生成する
--   （フロントエンド側 src/features/categories/lib/magentoPath.ts を参照）。
--   全ログインユーザーが共有する業務マスタのため、diagnosis_results等と異なり
--   user_id による所有者ベースのRLSではなく、ログイン済み(user_profilesに行がある)
--   authenticated ロール全体にSELECT/INSERT/UPDATEを許可する。
--   物理削除は行わず is_active=false による無効化を基本とするため、DELETE権限は付与しない。
-- =========================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code                  TEXT        NOT NULL UNIQUE,
  parent_id             UUID        REFERENCES public.categories(id) ON DELETE RESTRICT,
  level                 INT         NOT NULL DEFAULT 1,
  category_type         TEXT        NOT NULL DEFAULT 'standard'
                                     CHECK (category_type IN ('standard', 'purpose', 'feature', 'campaign', 'theme', 'special')),
  -- name_ja は初期データ(90/91/92系の一部カテゴリ)で日本語名が存在しないため
  -- NOT NULL にはしない。表示名の解決は name_ja → name_en → name_zh_tw → code の
  -- フォールバックチェーンで行う（src/features/categories/lib/categoryName.ts）。
  name_ja               TEXT,
  name_en               TEXT,
  name_zh_tw            TEXT,
  description           TEXT,
  sort_order            INT         NOT NULL DEFAULT 0,
  is_active             BOOLEAN     NOT NULL DEFAULT true,
  external_category_id  TEXT,
  -- Magento側カテゴリID。id(マスタの内部主キー)とは別に、Magento連携時の紐付け先として保持する。
  -- Magentoは日本語/英語ストアビューと繁體中文ストアビューを別カテゴリツリー（別category_id）として
  -- 管理しているため、ツリーごとに列を分ける（src/features/categories/config/magentoRootCategories.ts の
  -- MagentoLocale区分「ja/en」「zhTw」に対応）。
  magento_category_id        TEXT,
  magento_category_id_zh_tw  TEXT,
  created_at            TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at            TIMESTAMPTZ DEFAULT timezone('utc', now()),
  CONSTRAINT categories_not_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

-- CREATE TABLE IF NOT EXISTS は既存テーブルには列を追加しないため、
-- 過去にこのテーブルを作成済みの環境向けに不足列を個別に追加する（再実行しても安全）。
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS external_category_id TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS magento_category_id TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS magento_category_id_zh_tw TEXT;

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories (parent_id);
CREATE INDEX IF NOT EXISTS categories_category_type_idx ON public.categories (category_type);
CREATE INDEX IF NOT EXISTS categories_is_active_idx ON public.categories (is_active);

-- updated_at自動更新（product_categories等、他テーブルでも共用する）
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS categories_set_updated_at ON public.categories;
CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 循環参照防止 + level自動計算（parent_id指定/変更時のみ実行）
-- 「自分自身の子孫を親に設定する」形の循環参照はUNIQUE/CHECK制約では防げないため、
-- 祖先チェーンをたどって検証するトリガーで防止する。
CREATE OR REPLACE FUNCTION public.categories_prevent_cycle_and_set_level()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  ancestor_id UUID;
  computed_level INT;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'category cannot be its own parent';
    END IF;

    ancestor_id := NEW.parent_id;
    WHILE ancestor_id IS NOT NULL LOOP
      IF ancestor_id = NEW.id THEN
        RAISE EXCEPTION 'circular category reference detected';
      END IF;
      SELECT parent_id INTO ancestor_id FROM public.categories WHERE id = ancestor_id;
    END LOOP;

    SELECT level + 1 INTO computed_level FROM public.categories WHERE id = NEW.parent_id;
    NEW.level := COALESCE(computed_level, 1);
  ELSE
    NEW.level := 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS categories_cycle_guard ON public.categories;
CREATE TRIGGER categories_cycle_guard
  BEFORE INSERT OR UPDATE OF parent_id ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.categories_prevent_cycle_and_set_level();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLSポリシーだけではテーブルへのアクセス権は付与されないため、
-- authenticatedロールへの明示的なGRANTが必要。
GRANT SELECT, INSERT, UPDATE ON public.categories TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'select_categories_for_logged_in_users'
  ) THEN
    CREATE POLICY "select_categories_for_logged_in_users" ON public.categories
      FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'insert_categories_for_logged_in_users'
  ) THEN
    CREATE POLICY "insert_categories_for_logged_in_users" ON public.categories
      FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'update_categories_for_logged_in_users'
  ) THEN
    CREATE POLICY "update_categories_for_logged_in_users" ON public.categories
      FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid()));
  END IF;
END $$;
