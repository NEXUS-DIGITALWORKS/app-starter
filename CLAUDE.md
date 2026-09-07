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

`.env.example` を `.env` にコピーし、`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` を設定する。`.env` 未設定でもアプリは起動できる（[src/lib/supabaseClient.ts](src/lib/supabaseClient.ts) がプレースホルダー値でクライアントを生成する）。`isSupabaseConfigured()` で設定有無を判定し、未設定時は各 `resultsRepo.ts` の保存/取得系関数が早期returnで何もしない。

### Supabase セットアップ

Supabaseプロジェクトの SQL Editor で `supabase/migrations/` 配下のSQLを**番号なしなら以下の順**で実行する: `setup_user_profiles.sql` → `setup_diagnosis_results.sql` → `setup_tech_selections.sql`

テーブル定義は「Supabase スキーマ」章を参照。

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

**2. `tech-stack-selector`**（[src/features/tech-stack-selector/](src/features/tech-stack-selector/)） — 技術要素を選んでアーキテクチャパターンとの一致度を見る診断
- [lib/matchEngine.ts](src/features/tech-stack-selector/lib/matchEngine.ts) の `computePatternMatches(selection)` が中心。カテゴリごとに選択した技術要素（`TechElement`）の `patternIds` の出現回数でパターンをスコアリングし、全選択要素と一致する「完全一致」を上位表示する
- `buildSelectionForPattern(patternId)` は逆方向（パターンID→対応するSelection）の変換で、パターン詳細画面から選択状態を復元する用途
- 結果の永続化は [lib/resultsRepo.ts](src/features/tech-stack-selector/lib/resultsRepo.ts)（`tech_selections` テーブル）

両featureとも `ArchitecturePatternId`（P1〜P9/P10）を共有概念として扱うが、型定義・データはfeatureごとに独立している（`build-or-buy/types.ts` と `tech-stack-selector/types.ts` は別物）。

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
- `setup_tech_selections.sql` — `tech_selections` テーブル（tech-stack-selector診断結果）

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