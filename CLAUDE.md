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

Supabaseプロジェクトの SQL Editor で `supabase/migrations/` 配下のSQLを**番号なしなら以下の順**で実行する: `setup_user_profiles.sql` → `setup_diagnosis_results.sql` → `setup_tech_selections.sql` → `setup_categories.sql` → `setup_product_categories.sql` → `setup_products.sql`（商品本体マスタ`products`・タグ`product_tags`。Magentoエクスポートから投入するDDLのみで、実データ投入用SQLは未作成）→ `add_locale_content_to_products.sql`（`products`に繁体字・英語版の本文＋メタタイトル/ディスクリプションのカラムを追加）→ `rename_content_columns_add_ja_suffix.sql`（`products`の`name`/`description`/`meta_title`/`meta_description`を`name_ja`/`description_ja`/`meta_title_ja`/`meta_description_ja`にリネームし、日本語カラムの命名を`_zh_tw`/`_en`と揃える。未使用の`meta_keyword`カラムも削除。実データ投入前提のRENAME COLUMNのため、再実行時は対象カラムが既に存在しなければ何もしない）→ `seed_categories_initial.sql`（カテゴリ初期データ、再実行しても`ON CONFLICT DO NOTHING`で安全）→ `set_categories_name_ja.sql`（`seed_categories_initial.sql` 投入時点でNULLだった `name_ja` を補完するUPDATE、再実行しても同じ値で上書きされるだけで安全）→ `import_product_categories_from_csv.sql`（Magento出力のSKU×カテゴリ紐づけCSVから`product_categories`へ投入。`categories`マスタに未登録のカテゴリコードを参照する組み合わせはJOINで自然に除外されるため、マスタ拡充後に再実行すると取り込みが増える。`ON CONFLICT DO NOTHING`で再実行安全）→ `add_content_length_columns_to_products.sql`（`products`に`short_description`/`description_ja`の文字数を保持する生成カラム`short_description_length`/`description_length`を追加。商品一覧の検索条件での文字数絞り込みに使用。`ADD COLUMN IF NOT EXISTS`のため再実行安全）→ `setup_product_sales.sql`（SKU別・日次の売上明細`product_sales`テーブル。注文番号＋SKUを一意キーとし、CSV再取込時の重複登録を防ぐ）→ `add_unit_price_to_product_sales.sql`（`product_sales`に商品行の単価`unit_price`を追加。`ADD COLUMN IF NOT EXISTS`のため再実行安全）→ `add_product_list_with_sales_view.sql`（`products`に直近2年の累積売上`sales_total_2y`を付与したビュー`product_list_with_sales`を追加。商品一覧の「累積売上（直近2年）順」ソートに使用。ビューは`p.*`で`products`の全カラムを展開するため、これより後に`products`へカラムを追加するマイグレーションを実行した場合は、このファイルを再実行してビュー定義を更新する必要がある。`DROP VIEW ... CASCADE`→`CREATE VIEW`のため再実行安全だが、**CASCADEで依存先の`category_sales_summary`ビューも一緒に削除されるため、このファイルを再実行した直後は必ず`add_category_sales_summary_view.sql`を続けて再実行すること**）→ `setup_sales_events.sql`（フェア・キャンペーン等のイベント期間`sales_events`テーブル。特定SKU・カテゴリには紐付けない店舗全体共通のマスタで、商品詳細の売上推移グラフに背景として重ねて表示する）→ `add_category_actual_product_counts_view.sql`（既存の`category_product_counts`は`product_categories`の紐づけ行を単純カウントするため`products`に実在しないSKUへの紐づけも含んでしまう。`products`に実在し、かつ`ec_status = 'enabled'`（非公開でない）SKUのみをJOINしてカウントするビュー`category_actual_product_counts`を追加し、カテゴリ管理画面の商品数表示切り替えに使う。`DROP VIEW`不要の`CREATE OR REPLACE VIEW`のため再実行安全）→ `add_category_sales_summary_view.sql`（`product_list_with_sales`の`sales_total_2y`を`product_categories`経由でカテゴリ単位に合算するビュー`category_sales_summary`を追加。`category_actual_product_counts`と同様、実在し`ec_status = 'enabled'`のSKUのみが対象。カテゴリ改善候補ページ（所属商品数が少ない／直近売上が低いカテゴリの抽出）に使用。1商品が複数カテゴリに属す場合は各カテゴリの合計に重複計上される。`CREATE OR REPLACE VIEW`のため再実行安全）→ `add_home_sales_summary_view.sql`（`product_sales`のうち2023/08/19〜2026/08/18の期間に絞った累積売上合計を1行で返すビュー`home_sales_summary`を追加。Home画面の「売上集計」カードに使用。対象期間は固定で、他のビューのような「現在時点からN年以内」の可変ウィンドウではない。`CREATE OR REPLACE VIEW`のため再実行安全）→ `setup_tech_diagnoses.sql`（Tech診断＝自由文からのシステム方式・技術構成診断の保存結果`tech_diagnoses`テーブル。旧`tech_selections`＝技術者向け手動選択機能とは独立）

テーブル定義は「Supabase スキーマ」章を参照。

### Supabase Edge Functions

`supabase/functions/` にDeno製のEdge Functionを配置（マイグレーション同様、CLIプロジェクト連携はせず手動デプロイ運用）:
- `extract-requirements` — Tech診断のSTEP2（自由文からの要件抽出）。サーバーサイドでClaude APIをtool useで呼び出す。APIキーはフロントに一切渡さない
- デプロイ: `supabase functions deploy extract-requirements`（Supabase CLI要）
- 環境変数: Supabaseダッシュボードの Edge Functions → Secrets で `ANTHROPIC_API_KEY` を設定

### 開発用ログイン迂回

[src/hooks/useAuth.ts](src/hooks/useAuth.ts) には `.env` 未設定時のみ有効なローカル専用ログイン（`devSignIn`, `DEV_LOGIN_EMAIL`/`DEV_LOGIN_PASSWORD`）がある。Supabase接続情報が設定された瞬間に `isDevLoginAvailable()` が false になり機能しなくなる、バックエンドなしで `/app` 配下を検証するための迂回であり、本番の認証経路には影響しない。

### Supabase Edge Functionsのセットアップ（AI Workflow Platform化・Phase1）

`supabase/functions/` にClaude Message Batches API連携用のEdge Functions（Deno）がある。Claude API Keyはフロントエンドに一切置かず、Edge Function側のシークレットとしてのみ扱う。

- `supabase/functions/_shared/anthropicClient.ts` — Batches APIへの薄いクライアント（`createBatch`/`retrieveBatch`/`fetchBatchResults`、raw fetch、Anthropic SDK未使用）
- `supabase/functions/ai-batch-debug/index.ts` — 疎通確認専用エンドポイント（`batchId`クエリなしでバッチ作成、ありでステータス確認・結果取得）

ローカル検証手順:
1. [Supabase CLI](https://supabase.com/docs/guides/cli) をインストールし `supabase login` → `supabase link` でプロジェクトに接続
2. `supabase/functions/.env.example` を同じディレクトリに `.env` としてコピーし、`ANTHROPIC_API_KEY` に実キーを設定（`.env` は `.gitignore` 済み）
3. プロジェクトルートで `supabase functions serve` を起動
4. 別ターミナルから疎通確認:
   ```bash
   curl -i -X POST 'http://localhost:54321/functions/v1/ai-batch-debug' \
     --header "Authorization: Bearer <anon key>"
   # → { "batch_id": "...", "processing_status": "in_progress" } が返る

   curl "http://localhost:54321/functions/v1/ai-batch-debug?batchId=<batch_id>" \
     --header "Authorization: Bearer <anon key>"
   # → processing_status が ended になったら結果本文まで返る
   ```

本番デプロイ時は `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...` でシークレット登録後、`supabase functions deploy ai-batch-debug` を実行する。

## コマンド

```bash
npm run dev       # 開発サーバー起動（vite.config.ts で host: '0.0.0.0', port: 5173 を指定。同一LAN内の他端末からもアクセス可能）
npm run build     # tsc -b && vite build（型チェック→ビルド）
npm run preview   # ビルド成果物のプレビュー
npm test          # vitest run

npm run registry:generate-seed   # data/*.seed.ts から worker/migrations/0002_seed_release_v1.sql を再生成
npm run worker:dev               # worker/ 配下で wrangler dev を起動（Registry API、http://localhost:8787）
npm run worker:db:migrate:local  # D1ローカルにmigrationを適用
```

lintのスクリプトは現状 package.json に定義されていない。型エラーの確認は `npm run build`（内部で `tsc -b` が走る）で行う。

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

**2. `tech-stack-selector`**（[src/features/tech-stack-selector/](src/features/tech-stack-selector/)） — Tech診断。旧「技術要素を選んで一致パターンを見る」方式から、**自由文の要件からAIがシステム方式・技術構成を診断する**方式へ再設計済み（[src/pages/TechDiagnosis.tsx](src/pages/TechDiagnosis.tsx)、`/tools/tech-diagnosis`）
  - STEP2（自由文→要件抽出）: [lib/requirementExtraction.ts](src/features/tech-stack-selector/lib/requirementExtraction.ts) がSupabase Edge Function `extract-requirements`（Claude API呼び出し）を叩き、24項目の `RequirementProfile`（各項目 `confirmed`/`inferred`/`unknown` の状態を持つ）を返す
  - STEP4（不足質問）: [lib/missingQuestions.ts](src/features/tech-stack-selector/lib/missingQuestions.ts) が `unknown` の項目だけ `data/followUpQuestions.ts` から質問を組み立てる（最大5問）
  - STEP5（方式診断）: [lib/modeEngine.ts](src/features/tech-stack-selector/lib/modeEngine.ts) の `diagnoseSystemMode()` が `data/modeScoringRules.ts` / `data/modeExclusionRules.ts` で19種の `SystemMode`（`data/systemModes.ts`）をスコアリング。AI利用は `AiCapability`（`data/aiCapabilities.ts`）として独立軸で重ねる（排他にしない）
  - STEP6（技術・基盤選定）: [lib/stackEngine.ts](src/features/tech-stack-selector/lib/stackEngine.ts) がSystemModeごとの候補技術から要件（クラウド指定等）に応じて1件を確定、[lib/hostingEngine.ts](src/features/tech-stack-selector/lib/hostingEngine.ts) が `data/hostingRules.ts` でCloudflare/Vercel/Firebase/AWS/GCP/Azure/VPS等の公開基盤を選定
  - 統合エントリポイントは [lib/diagnose.ts](src/features/tech-stack-selector/lib/diagnose.ts) の `diagnoseTech(profile)`
  - 結果の永続化は [lib/diagnosisRepo.ts](src/features/tech-stack-selector/lib/diagnosisRepo.ts)（`tech_diagnoses` テーブル）
  - 旧方式（[lib/matchEngine.ts](src/features/tech-stack-selector/lib/matchEngine.ts) の `computePatternMatches(selection)`、41パターン `data/patterns.ts`）は**技術者向け詳細**として維持（`/tools/tech-selector` 等）。診断結果画面の「技術者向け詳細を見る」から導線。結果の永続化は [lib/resultsRepo.ts](src/features/tech-stack-selector/lib/resultsRepo.ts)（`tech_selections` テーブル、tech_diagnosesとは別）
  - `data/elementDetails.ts`（100技術要素の説明・URL）は新旧両方から参照される共通の一次情報

build-or-buyの `ArchitecturePatternId`（P1〜P9/P10）とtech-stack-selectorの `SystemModeId`（P01〜P23）は名前が似ているが無関係。型定義・データはfeatureごとに独立している（`build-or-buy/types.ts` と `tech-stack-selector/types.ts` は別物）。

両featureの `data/architecturePatterns.ts` / `stackProfiles.ts` / `saasProducts.ts` / `categories.ts` / `patterns.ts` / `patternDetails.ts` / `elementDetails.ts` は、静的配列を直接exportする形から **Stack Registry（後述）から取得したデータを返すgetter関数**（`getArchitecturePatterns()` 等）に置き換わっている。診断アルゴリズム自体（`diagnosisEngine.ts` / `matchEngine.ts`）は変更していない。

### Stack Registry（`worker/` + `src/lib/registry/`）

技術スタック・カテゴリ・タグ・推奨構成（Stack Preset）・互換性ルールは、Cloudflare D1を中央DBとするStack Registryへ集約されている。診断アルゴリズム・スコアリング・画面ロジックはコード側（`data/questions.ts` 等）に残したまま、**マスターデータのみ**をRegistry参照に切り替える設計。

- `worker/` — Registry API用のCloudflare Worker（独立npmパッケージ、`cd worker && npm test`でvitest実行）。`src/index.ts` → `routes/` → `services/registryService.ts`（読み取り専用） / `services/adminService.ts`（管理API） → `repositories/`(D1依存を隔離) → `mappers/` の構成。`GET /api/v1/registry` が最重要API（Registry全体をversion付きで返す）
- `worker/migrations/0001_init_schema.sql` — D1スキーマ本体。`0002_add_technology_scores.sql` は評価値（security/cost/development_speed/ai_coding/scalability_score）・status・notes列の追加。`0003_seed_release_v1_NNN.sql`（複数ファイル）は自動生成物（**手編集禁止**、`npm run registry:generate-seed` で再生成する）。D1リモートAPIは1リクエストのペイロードサイズに上限があり明示的な`BEGIN TRANSACTION`/`COMMIT`も使えないため、テーブルごと・バイト数ベースで複数ファイルに分割している（`scripts/registry-seed/toSql.ts`）。スキーマ変更（0002）はseed（0003）より前の番号にすること（seedのINSERT文が新列を参照するため）
- 本番Worker: `stack-registry-worker`（アカウント `yoshinori.nakamura@nexus-digitalworks.com`）としてデプロイ済み。URL: `https://stack-registry-worker.stack-registry-worker.workers.dev`。D1データベース`stack-registry-db`（database_id: `723dea5f-1033-489e-b516-06c8ec3a45fe`、`worker/wrangler.jsonc`に記載）にmigration適用済み。再デプロイは`cd worker && npx wrangler deploy`、リモートDBへのmigration適用は`npx wrangler d1 migrations apply stack-registry-db --remote`。`ALLOWED_ORIGIN`（`wrangler.jsonc`の`vars`）は現状`http://localhost:5173`固定（フロントエンド未デプロイのため）。フロントを実際にデプロイする際はここを更新すること
- `POST/PATCH/DELETE /api/v1/admin/{technologies,categories,tags,stacks,rules}` — Registry管理画面（`/app/registry/*`、`src/features/registry-admin/`）用のCRUD API。現在唯一のpublished releaseを直接編集する（Draft/Publish運用は未実装）。削除時はTechnology/Category/Stack Presetが他から参照されていればブロックし、Technology/Tag/Stack Preset自身が持つ子レコード（タグ付け・items・関連ルール）はcascade削除する（詳細は`worker/src/services/adminService.ts`）。**認証チェックなし**（ローカル開発限定・未デプロイのため。Cloudflare Access統合は未実装）
- 管理画面での変更後は `useRegistry().refresh()`（`RegistryProvider.tsx`）を呼び、Registryキャッシュを再取得する。これにより診断ページ側の表示も同時に最新化される
- `scripts/registry-seed/fromSource.ts` — 各featureの `data/*.seed.ts`（Registry化前の元データをリネームして温存したもの）から `RegistryData` を組み立てる純粋関数。D1 seed生成（`toSql.ts`）とvitestのフィクスチャ（`src/test/registryFixture.ts`）の両方がこれを単一ソースとして参照し、シードとテストのドリフトを防ぐ
- `src/lib/registry/registryCache.ts` — アプリ起動時に `GET /api/v1/registry` を1回fetchしてモジュール単位に保持するキャッシュ。`getRegistrySync()` で同期取得できるため、既存の `diagnose()` / `computePatternMatches()` 等の同期関数シグネチャは変更していない
- `src/lib/registry/RegistryProvider.tsx` / `RegistryGate.tsx` — Registry依存ページ（`/tools/diagnosis/start`, `/tools/tech-selector`, `/tools/tech-selector/report`, `/tools/tech-guide`, `/tools/patterns`, `/app/history`）のみ `<RegistryGate>` でラップし、ロード完了後にmountする
- `src/lib/registry/selectors.ts` — `RegistryData` → 各featureの既存ドメイン型（`ArchitecturePattern` / `StackProfile` / `TechCategory` 等）への変換
- ローカル開発: `npm run worker:dev`（別ターミナル）→ `npm run dev`。`.env.local` に `VITE_REGISTRY_API_BASE_URL=http://localhost:8787` を設定する（`.env.local.example` 参照）
- `build-or-buy` 用の「P1〜P9」アーキテクチャパターン体系と、`tech-stack-selector` 用の「WEB-01等」技術構成パターン体系は統合せず、`registry_stack_presets.preset_type`（`architecture_pattern` / `tech_pattern`）で区別したまま共存させている

現状はSupabase・Cloudflare Registryの両方が並行して存在する（Supabaseは未接続のまま、認証・診断結果の保存にのみ使用）。Supabase撤去は別フェーズ。

### 認証（[src/hooks/useAuth.ts](src/hooks/useAuth.ts)）

`useAuth()` は複数コンポーネントから呼ばれる想定のため、セッション監視をモジュール単位のシングルトン（`state` + `listeners` Set）に持たせ、各コンポーネントは購読のみ行う設計。Supabaseの `onAuthStateChange` とdevログインの両方がこの同じ `state` を更新する。

### UIコンポーネント・デザイン

[components.json](components.json) の設定通り shadcn/ui（style: new-york, baseColor: neutral）を使用。`@/components/ui/` 配下が shadcn由来の基礎コンポーネント、`@/lib/utils.ts` の `cn()` でクラス結合。パスエイリアス `@/*` は `vite.config.ts` で `src/` に解決される。

配色・余白・タイポグラフィ・コンポーネントごとの実装ルールは [DESIGN.md](DESIGN.md) にまとめている。UIを新規追加・変更する際は必ず先に参照すること。

## Supabase スキーマ

`supabase/migrations/` にSQLファイルとして管理（マイグレーションツールは未使用、SQL Editorで手動実行する運用）:
- `setup_user_profiles.sql` — `user_profiles` テーブルとサインアップ時の自動プロフィール作成トリガー
- `setup_diagnosis_results.sql` — `diagnosis_results` テーブル（build-or-buy診断結果、RLSでログインユーザー本人のみ閲覧・削除可）
- `setup_tech_selections.sql` — `tech_selections` テーブル（技術要素セレクター＝技術者向け手動選択機能の保存結果）
- `setup_tech_diagnoses.sql` — `tech_diagnoses` テーブル（Tech診断＝自由文からのAI要件抽出・システム方式・技術構成診断の保存結果。`tech_selections`とは独立）
- `setup_products.sql` — `products`（商品本体マスタ、SKUを主キーとしMagentoエクスポート由来の原本データを保持）・`product_tags`（商品タグ）テーブル
- `add_locale_content_to_products.sql` — `products`に繁体字/英語版の本文（`short_description_zh_tw`/`_en` 等）・メタタイトル/ディスクリプション（`meta_title_zh_tw`/`_en`, `meta_description_zh_tw`/`_en`）を追加。AI翻訳の下書き（人が確定する前の提案）・抽出特徴量・SEO診断issuesは生成結果を保存するテーブルが未実装のため対象外
- `rename_content_columns_add_ja_suffix.sql` — `products`の`name`/`description`/`meta_title`/`meta_description`を`name_ja`/`description_ja`/`meta_title_ja`/`meta_description_ja`にリネームし、繁体字・英語カラムと同じ`_ja`/`_zh_tw`/`_en`の命名規則に統一。未使用の`meta_keyword`カラムを削除
- `add_content_length_columns_to_products.sql` — `products`に`short_description_length`/`description_length`（`short_description`/`description_ja`の文字数、`GENERATED ALWAYS AS ... STORED`）を追加。商品一覧の検索条件で文字数の範囲絞り込みに使用
- `setup_product_sales.sql` — `product_sales` テーブル（SKU別・日次の購入明細。注文番号＋SKUの組で一意。数量・売上金額・割引額・購入ストア・出荷国・購入者Email・顧客区分（customer_type、新規/既存）を保持し、CSVで取り込む）
- `add_unit_price_to_product_sales.sql` — `product_sales`に商品行の単価`unit_price`を追加
- `add_product_list_with_sales_view.sql` — `products`の全カラムに直近2年の累積売上`sales_total_2y`（`product_sales`をSKU単位で集計、売上なしは0）を付与したビュー`product_list_with_sales`。商品一覧はこのビュー経由で取得し、「累積売上（直近2年）順」ソートに使用する。`DROP VIEW ... CASCADE`で作り直すため、再実行すると依存する`category_sales_summary`ビューも一緒に削除される点に注意（直後に`add_category_sales_summary_view.sql`の再実行が必須）
- `setup_sales_events.sql` — `sales_events` テーブル（フェア・キャンペーン等のイベント期間。`name`/`start_date`/`end_date`）。特定のSKU・カテゴリには紐付けない店舗全体共通のマスタで、商品詳細の売上推移グラフに期間を帯として重ねて表示する用途
- `add_category_actual_product_counts_view.sql` — `product_categories`のうち`products`に実在し`ec_status = 'enabled'`（非公開でない）SKUのみを対象にカテゴリごとの商品件数を集計するビュー`category_actual_product_counts`。既存の`category_product_counts`（単純カウント、実在しないSKUへの紐づけ・非公開商品も含む）との差分から、カテゴリ管理画面で「紐づけ件数」と「実件数（非公開を除く）」を切り替え表示するために使う
- `add_category_sales_summary_view.sql` — `product_list_with_sales`の`sales_total_2y`（実在し`ec_status = 'enabled'`のSKUのみ）を`product_categories`経由でカテゴリ単位に合算するビュー`category_sales_summary`。カテゴリ改善候補ページ（[src/features/categories/pages/CategoryImprovementsPage.tsx](src/features/categories/pages/CategoryImprovementsPage.tsx)）で、所属商品数が少ない・直近売上が低いカテゴリの抽出に使う。1商品が複数カテゴリに属す場合は各カテゴリの合計に重複計上される
- `add_home_sales_summary_view.sql` — `product_sales`のうち2023/08/19〜2026/08/18の期間に絞った累積売上合計を1行で返すビュー`home_sales_summary`。対象期間は固定（他のビューのような可変ウィンドウではない）。Home画面（[src/pages/AppHome.tsx](src/pages/AppHome.tsx)）の「売上集計」カードに使う

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