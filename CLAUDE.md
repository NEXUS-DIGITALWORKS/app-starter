# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Vite + React + TypeScript + Supabase Auth の「Build or Buy・技術構成診断（stack-fit-mvp）」アプリ。「自作すべきか／既存SaaSで足りるか／技術構成は何が最適か」をルールベースで診断する。設計の背景・判定ロジックの詳細は [docs/build-or-buy-diagnosis-spec.md](docs/build-or-buy-diagnosis-spec.md) にある（レビュー用ドラフトだが、実装の意図を理解する上で一次情報）。

UI・スタイルを実装／変更する際は [DESIGN.md](DESIGN.md) を必ず参照すること。

## セットアップ

### インストール・環境変数

```bash
npm install       # 依存関係のインストール
```

`.env.local.example` を `.env` にコピーし、`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` を設定する。`.env` 未設定でもアプリは起動できる（[src/lib/supabaseClient.ts](src/lib/supabaseClient.ts) がプレースホルダー値でクライアントを生成する）。`isSupabaseConfigured()` で設定有無を判定し、未設定時は各 `resultsRepo.ts` の保存/取得系関数が早期returnで何もしない。

### Supabase セットアップ

Supabaseプロジェクトの SQL Editor で `supabase/migrations/` 配下のSQLを**番号なしなら以下の順**で実行する: `setup_user_profiles.sql` → `setup_diagnosis_results.sql` → `setup_tech_selections.sql` → `setup_categories.sql` → `setup_product_categories.sql` → `setup_products.sql`（商品本体マスタ`products`・タグ`product_tags`。Magentoエクスポートから投入するDDLのみで、実データ投入用SQLは未作成）→ `add_locale_content_to_products.sql`（`products`に繁体字・英語版の本文＋メタタイトル/ディスクリプションのカラムを追加）→ `rename_content_columns_add_ja_suffix.sql`（`products`の`name`/`description`/`meta_title`/`meta_description`を`name_ja`/`description_ja`/`meta_title_ja`/`meta_description_ja`にリネームし、日本語カラムの命名を`_zh_tw`/`_en`と揃える。未使用の`meta_keyword`カラムも削除。実データ投入前提のRENAME COLUMNのため、再実行時は対象カラムが既に存在しなければ何もしない）→ `seed_categories_initial.sql`（カテゴリ初期データ、再実行しても`ON CONFLICT DO NOTHING`で安全）→ `set_categories_name_ja.sql`（`seed_categories_initial.sql` 投入時点でNULLだった `name_ja` を補完するUPDATE、再実行しても同じ値で上書きされるだけで安全）→ `import_product_categories_from_csv.sql`（Magento出力のSKU×カテゴリ紐づけCSVから`product_categories`へ投入。`categories`マスタに未登録のカテゴリコードを参照する組み合わせはJOINで自然に除外されるため、マスタ拡充後に再実行すると取り込みが増える。`ON CONFLICT DO NOTHING`で再実行安全）→ `add_content_length_columns_to_products.sql`（`products`に`short_description`/`description_ja`の文字数を保持する生成カラム`short_description_length`/`description_length`を追加。商品一覧の検索条件での文字数絞り込みに使用。`ADD COLUMN IF NOT EXISTS`のため再実行安全）→ `setup_product_sales.sql`（SKU別・日次の売上明細`product_sales`テーブル。注文番号＋SKUを一意キーとし、CSV再取込時の重複登録を防ぐ）→ `add_unit_price_to_product_sales.sql`（`product_sales`に商品行の単価`unit_price`を追加。`ADD COLUMN IF NOT EXISTS`のため再実行安全）→ `add_product_list_with_sales_view.sql`（`products`に直近1年の累積売上`sales_total_1y`を付与したビュー`product_list_with_sales`を追加。商品一覧の「累積売上（直近1年）順」ソートに使用。ビューは`p.*`で`products`の全カラムを展開するため、これより後に`products`へカラムを追加するマイグレーションを実行した場合は、このファイルを再実行してビュー定義を更新する必要がある。`DROP VIEW`→`CREATE VIEW`のため再実行安全）→ `setup_sales_events.sql`（フェア・キャンペーン等のイベント期間`sales_events`テーブル。特定SKU・カテゴリには紐付けない店舗全体共通のマスタで、商品詳細の売上推移グラフに背景として重ねて表示する）

テーブル定義は「Supabase スキーマ」章を参照。

### 開発用ログイン迂回

[src/hooks/useAuth.ts](src/hooks/useAuth.ts) には `.env` 未設定時のみ有効なローカル専用ログイン（`devSignIn`, `DEV_LOGIN_EMAIL`/`DEV_LOGIN_PASSWORD`）がある。Supabase接続情報が設定された瞬間に `isDevLoginAvailable()` が false になり機能しなくなる、バックエンドなしで `/app` 配下を検証するための迂回であり、本番の認証経路には影響しない。

## コマンド

```bash
npm run dev       # 開発サーバー起動（vite.config.ts で host: '0.0.0.0', port: 5173 を指定。同一LAN内の他端末からもアクセス可能）
npm run build     # tsc -b && vite build（型チェック→ビルド）
npm run preview   # ビルド成果物のプレビュー
```

テスト・lintのスクリプトは現状 package.json に定義されていない。型エラーの確認は `npm run build`（内部で `tsc -b` が走る）で行う。

## アーキテクチャ

### ルーティング構成（[src/App.tsx](src/App.tsx)）

- `/` — ツール一覧トップページ（[ToolsHome.tsx](src/pages/ToolsHome.tsx)、認証不要）
- `/app` — ログイン後アプリ画面。`AppLayout`（[src/layouts/AppLayout.tsx](src/layouts/AppLayout.tsx)）配下で `RequireAuth` によりセッション必須
- `/tools/*` — 診断ツール群（認証不要）。旧URL（`/tools`, `/diagnosis`, `/tech-selector`, `/tech-guide`）は `RedirectTo` で query/hash を保持したままリダイレクトされる後方互換ルート

### 2つの診断feature（`src/features/`）

このリポジトリの中核ロジックは2つの独立したfeatureに分かれている。両方とも「data（マスタデータ・ルール定義）→ lib（純粋関数のエンジン）→ pages/components（表示）」という同じ構造を踏襲している。

**1. `build-or-buy`**（[src/features/build-or-buy/](src/features/build-or-buy/)） — 「自作すべきか／SaaSで足りるか」の診断
- [lib/diagnosisEngine.ts](src/features/build-or-buy/lib/diagnosisEngine.ts) の `diagnose(answers)` がエントリポイント。質問への回答（`Answers = Record<string, string[]>`）から以下を算出する:
  - `buildScore`（自作寄り=正／SaaS寄り=負、`data/questions.ts` の各選択肢が持つ `buildWeight` の合計＋動的補正）→ `categorize()` で A〜E の5区分に分類
  - `computeArchitectureScores()`：`data/scoringRules.ts` / `data/exclusionRules.ts`（`data/architecturePatterns.ts` のP1〜P9に対する加点・除外ルール）でパターンをランキング
  - `fitScore`（0-100の表示専用参考指標。**判定ロジック（category/buildScore）には一切影響しない**）
- カテゴリA〜E判定やスコアリングの閾値・重み付けを変更する際は、まず [docs/build-or-buy-diagnosis-spec.md](docs/build-or-buy-diagnosis-spec.md) の該当セクション（2章 Build or Buy判定基準、3章 アーキテクチャパターン一覧）を参照し、ドキュメントとコードの乖離に注意する
- `hardFlags`（例: `hard_no_build`）は質問オプションの `flags` から集約され、buildScoreによらず優先判定される
- 結果の永続化は [lib/resultsRepo.ts](src/features/build-or-buy/lib/resultsRepo.ts)（`diagnosis_results` テーブル）

**2. `tech-stack-selector`**（[src/features/tech-stack-selector/](src/features/tech-stack-selector/)） — 技術要素を選んでアーキテクチャパターンとの一致度を見る診断
- [lib/matchEngine.ts](src/features/tech-stack-selector/lib/matchEngine.ts) の `computePatternMatches(selection)` が中心。カテゴリごとに選択した技術要素（`TechElement`）の `patternIds` の出現回数でパターンをスコアリングし、全選択要素と一致する「完全一致」を上位表示する
- `buildSelectionForPattern(patternId)` は逆方向（パターンID→対応するSelection）の変換で、パターン詳細画面から選択状態を復元する用途
- 結果の永続化は [lib/resultsRepo.ts](src/features/tech-stack-selector/lib/resultsRepo.ts)（`tech_selections` テーブル）

両featureとも `ArchitecturePatternId`（P1〜P9/P10）を共有概念として扱うが、型定義・データはfeatureごとに独立している（`build-or-buy/types.ts` と `tech-stack-selector/types.ts` は別物）。

### 認証（[src/hooks/useAuth.ts](src/hooks/useAuth.ts)）

`useAuth()` は複数コンポーネントから呼ばれる想定のため、セッション監視をモジュール単位のシングルトン（`state` + `listeners` Set）に持たせ、各コンポーネントは購読のみ行う設計。Supabaseの `onAuthStateChange` とdevログインの両方がこの同じ `state` を更新する。

### UIコンポーネント・デザイン

[components.json](components.json) の設定通り shadcn/ui（style: new-york, baseColor: neutral）を使用。`@/components/ui/` 配下が shadcn由来の基礎コンポーネント、`@/lib/utils.ts` の `cn()` でクラス結合。パスエイリアス `@/*` は `vite.config.ts` で `src/` に解決される。

配色・余白・タイポグラフィ・コンポーネントごとの実装ルールは [DESIGN.md](DESIGN.md) にまとめている。UIを新規追加・変更する際は必ず先に参照すること。

## Supabase スキーマ

`supabase/migrations/` にSQLファイルとして管理（マイグレーションツールは未使用、SQL Editorで手動実行する運用）:
- `setup_user_profiles.sql` — `user_profiles` テーブルとサインアップ時の自動プロフィール作成トリガー
- `setup_diagnosis_results.sql` — `diagnosis_results` テーブル（build-or-buy診断結果、RLSでログインユーザー本人のみ閲覧・削除可）
- `setup_tech_selections.sql` — `tech_selections` テーブル（tech-stack-selector診断結果）
- `setup_products.sql` — `products`（商品本体マスタ、SKUを主キーとしMagentoエクスポート由来の原本データを保持）・`product_tags`（商品タグ）テーブル
- `add_locale_content_to_products.sql` — `products`に繁体字/英語版の本文（`short_description_zh_tw`/`_en` 等）・メタタイトル/ディスクリプション（`meta_title_zh_tw`/`_en`, `meta_description_zh_tw`/`_en`）を追加。AI翻訳の下書き（人が確定する前の提案）・抽出特徴量・SEO診断issuesは生成結果を保存するテーブルが未実装のため対象外
- `rename_content_columns_add_ja_suffix.sql` — `products`の`name`/`description`/`meta_title`/`meta_description`を`name_ja`/`description_ja`/`meta_title_ja`/`meta_description_ja`にリネームし、繁体字・英語カラムと同じ`_ja`/`_zh_tw`/`_en`の命名規則に統一。未使用の`meta_keyword`カラムを削除
- `add_content_length_columns_to_products.sql` — `products`に`short_description_length`/`description_length`（`short_description`/`description_ja`の文字数、`GENERATED ALWAYS AS ... STORED`）を追加。商品一覧の検索条件で文字数の範囲絞り込みに使用
- `setup_product_sales.sql` — `product_sales` テーブル（SKU別・日次の購入明細。注文番号＋SKUの組で一意。数量・売上金額・割引額・購入ストア・出荷国・購入者Email・顧客区分（customer_type、新規/既存）を保持し、CSVで取り込む）
- `add_unit_price_to_product_sales.sql` — `product_sales`に商品行の単価`unit_price`を追加
- `add_product_list_with_sales_view.sql` — `products`の全カラムに直近1年の累積売上`sales_total_1y`（`product_sales`をSKU単位で集計、売上なしは0）を付与したビュー`product_list_with_sales`。商品一覧はこのビュー経由で取得し、「累積売上（直近1年）順」ソートに使用する
- `setup_sales_events.sql` — `sales_events` テーブル（フェア・キャンペーン等のイベント期間。`name`/`start_date`/`end_date`）。特定のSKU・カテゴリには紐付けない店舗全体共通のマスタで、商品詳細の売上推移グラフに期間を帯として重ねて表示する用途

フロントエンドで使う `VITE_SUPABASE_PUBLISHABLE_KEY` はRLS前提で公開されて問題ない設計。`service_role` キーはフロントエンド・`VITE_`環境変数には設定しない。

## クライアント展開の進め方

このリポジトリはクライアントごとに機能を追加していくベース（1クライアント=1リポジトリのフォーク運用）。新規クライアント着手時の標準手順:

1. リポジトリをフォーク／複製してクライアント用リポジトリを作成
2. クライアント用のSupabaseプロジェクトを作成し `.env` を設定（ログイン機能・`user_profiles` は設定するだけでそのまま使える）
3. ロゴ・配色・[ToolsHome.tsx](src/pages/ToolsHome.tsx) の文言などブランディングをクライアント向けに調整
4. `src/features/` 配下にクライアント固有の機能を追加（`build-or-buy` / `tech-stack-selector` が不要なら削除）
5. 追加した機能に対応するSupabaseマイグレーションを `supabase/migrations/` に追加
6. 動作確認後デプロイ

## Code Review

コードレビューには以下のSkillを使用する。

- 日常・差分レビュー: `/code-review-daily`
- リリース前フルレビュー: `/code-review-full`

原則として、レビュー結果を提示してユーザーの承認を得るまでコードを修正しない。