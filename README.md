# 業務診断ツール集（app-starter）

Vite + React + TypeScript + Supabase Auth をベースにした、業務効率化・技術選定まわりの診断ツールをまとめたアプリです。
トップページ（`/`）はツール一覧で、ログイン不要で以下の各ツールにアクセスできます。

- **Build or Buy診断** — 自作すべきか、既存SaaSで足りるかを判定
- **技術要素セレクター** — 使いたい技術を選んで最適な構成パターンを探す
- **テックガイド** — 主要な技術要素の特徴と向いているケースを解説
- **リスクチェック55** — 8分類・55項目でシステムのリスクを洗い出す

`/app` 配下はログイン後のマイページ（診断結果の閲覧などを想定）で、Supabase Authによるセッション認証が必要です。
GitHub / Vercel / Supabase いずれも未リンクの状態から始められます。

Build or Buy診断のロジック設計ドキュメントは [docs/build-or-buy-diagnosis-spec.md](docs/build-or-buy-diagnosis-spec.md) を参照してください。

## 必要アカウント

- GitHub（リポジトリ管理・Vercelとの連携用） https://github.com/
- Vercel（デプロイ先。必須ではなく他の静的ホスティングでも代替可） https://vercel.com/
- Supabase（認証・DB） https://supabase.com/

## セットアップ

1. GitHubからリポジトリをclone

   ```bash
   git clone <このリポジトリのURL>
   cd app-starter
   ```

2. ライブラリの準備

   package.json に書かれている React や Supabase などのパーツをインターネットからまとめて読み込み、プロジェクトの中に準備します。

   ```bash
   npm install
   ```

3. Supabaseプロジェクトを作成し、SQL Editorで以下を順番に実行する

   1. [supabase/migrations/setup_user_profiles.sql](supabase/migrations/setup_user_profiles.sql)
      `user_profiles` テーブルと、サインアップ時にプロフィール行を自動作成するトリガーが作られます。
   2. [supabase/migrations/setup_diagnosis_results.sql](supabase/migrations/setup_diagnosis_results.sql)
      Build or Buy診断の結果を保存する `diagnosis_results` テーブルが作られます（ログイン済みユーザーの診断結果のみ、本人だけが閲覧・削除できます）。
   3. [supabase/migrations/setup_tech_selections.sql](supabase/migrations/setup_tech_selections.sql)
      技術要素セレクターの結果を保存する `tech_selections` テーブルが作られます（同様に本人のみ閲覧・削除可）。

4. `.env.example` を `.env` にコピーし、`.env` にSupabaseの Settings > API にある値を設定する

   ```bash
   cp .env.example .env
   ```

   > VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY は、WebアプリからSupabaseに接続するための情報です。ブラウザ上で使われることを前提としているため、利用者から見える状態になっても基本的には問題ありません。
   >
   > ただし、データを安全に守るために、Supabase側でRLSを設定し、「誰がどのデータを見たり変更したりできるか」を制限しておく必要があります。
   >
   > 一方、service_role キーは、管理者だけが使う特別なキーです。このキーを使うとRLSの制限を受けずにデータを操作できるため、フロントエンドやVITE_で始まる環境変数には設定しません。また、GitHubなどにも公開しないようにします。

5. 開発サーバーを起動

   ```bash
   npm run dev
   ```

   `vite.config.ts` で `host: '0.0.0.0'` を指定しているため、自PCだけでなく同一LAN内の他端末からも `http://<自PCのIPアドレス>:5173` でアクセスできます（Windowsファイアウォールでポート5173の許可が必要な場合があります）。インターネット越し（LAN外）からは別途ポート開放やトンネルツールが必要です。

これでメール/パスワードによる自由サインアップ・ログイン・ログアウトが動作します。招待コード制限や有料プラン連携などは含まれていない最小構成です。

## デプロイ（Vercelなど）

`npm run build` で生成される `dist/` は静的ファイル一式なので、Vercel以外の静的ホスティング（Netlify、Cloudflare Pagesなど）でも動作します。Vercelは必須ではなく、GitHub連携での自動デプロイやゼロコンフィグ対応が主な採用理由です。

`.env` は `.gitignore` 対象でリポジトリに含まれないため、デプロイ先にはローカルとは別に環境変数を設定する必要があります。Vercelの場合は Project Settings > Environment Variables で `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を登録してください。
