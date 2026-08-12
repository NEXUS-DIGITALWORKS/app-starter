# Build or Buy・技術構成診断 設計ドキュメント（レビュー用ドラフト v0.1）

本ドキュメントは開発指示書ステップ17「最初に実施する作業」に基づく設計ドラフトです。
コード実装前のレビュー対象であり、承認後に実装（Phase 0〜）へ進みます。

**前提の確認事項**：既存の StackFit 診断（[DiagnosisFlow.tsx](../src/pages/DiagnosisFlow.tsx) の A/B/C データ基盤スタック判定）は、本診断に**置き換え**られます。既存の「データ構造・同期・GCP統一・料金感・移行性」という5軸は、本診断の「アーキテクチャパターン選定」フェーズの一部（主にP1〜P5の判定材料）として吸収します。

---

## 1. アプリ種別一覧（app_types）

MVPでは指示書の全20種から、業務特性・アーキテクチャの幅がカバーできる8種を初期採用します。

| id | name | description | examples | enabled |
|---|---|---|---|---|
| `internal_ops` | 社内業務システム | 部門・全社の定常業務を電子化する汎用システム | 勤怠管理、経費精算補助、社内申請の入口 | true |
| `crm_deals` | 顧客・案件管理 | 顧客・商談・案件の進捗を一元管理 | 営業案件管理、代理店管理、顧客台帳 | true |
| `approval_workflow` | 申請・承認システム | 多段階承認・条件分岐のあるワークフロー | 稟議、休暇申請、発注承認 | true |
| `reservation` | 予約・受付システム | 日時・リソースに紐づく予約と受付管理 | 施設予約、面談予約、順番受付 | true |
| `inventory` | 在庫・受発注・商品管理 | 在庫数・入出庫・発注点管理 | 倉庫在庫、商品マスタ連携、発注アラート | true |
| `knowledge_ai_search` | 情報管理・ナレッジ管理／AI検索 | 社内文書・ノウハウの蓄積と検索（RAG含む） | 社内Wiki、問い合わせFAQ、AI文書検索 | true |
| `saas_integration` | SaaS間データ連携・業務自動化 | 複数SaaS/基幹システム間のデータ同期・自動化 | 会計⇄CRM連携、メール自動仕分け、定期集計 | true |
| `dashboard_analytics` | ダッシュボード・分析 | 複数データソースを集約した可視化 | 経営ダッシュボード、KPIモニタリング | true |

> 除外した種別（本格EC、汎用SNS、決済基盤、会計、POS、電子契約、動画配信、マッチング、コミュニティ、教育用ゲーム、モバイル/デスクトップ単独カテゴリ）は、MVP以降に `enabled=false` の状態でマスタへ追加し、段階的に有効化する想定です。これらの一部（本格EC等）は6章の判定ロジックにより自動的に「開発非推奨」または「SaaS優先」に倒れるため、種別として選ばれても暴走しません。

---

## 2. Build or Buy判定基準

### 2.1 指標の重み付け

指示書4.2の「自作価値が高い」11条件・「既存サービス優先」11条件を、それぞれ+1点／-1点の指標として合計します（`buildScore`、理論値 -11〜+11）。将来的にマスタで重み変更できるよう、`scoring_rules` の `target_type='build_or_buy'` として管理します（7章参照）。

### 2.2 強制フラグ（ハードルール）

以下は `buildScore` に関わらず優先判定します。

| フラグ | 条件 | 効果 |
|---|---|---|
| `hard_no_build` | 決済/金融取引、会計エンジン、医療判断、本格POS、本格EC基盤、大規模SNS、動画配信基盤、大規模ゲーム、自動運転・制御系、重大事故につながる制御 | 全面自作（D）を判定候補から除外。周辺業務（連携・可視化等）のみ C として許可 |
| `hard_prefer_saas` | 決済/金融処理、税計算・会計処理を含む、法令対応必須 | `buildScore` に -3 の追加補正（Aへ強く寄せる） |
| `hard_no_recommend` | `hard_no_build` に該当し、かつ利用規模・予算に対して開発コストが著しく不釣り合い（想定予算=小規模 かつ 高可用性必須 など） | E（開発非推奨）を最終候補の先頭に強制 |

### 2.3 判定区分マッピング

| buildScore | 既存SaaS充足度（質問回答から算出） | 判定 |
|---|---|---|
| -11 〜 -6 | 高（大部分を満たす） | A：既存SaaS・パッケージ利用 |
| -5 〜 -2 | 中〜高（設定変更で対応可） | B：SaaS設定・カスタマイズ |
| -1 〜 +3 | 中（コア機能はSaaS、一部不足） | C：SaaS＋独自開発 |
| +4 〜 +11 | 低（業務固有性が高い） | D：独自システム開発 |
| （区分によらず） | `hard_no_recommend` 該当 | E：開発非推奨 |

既存SaaS充足度は、`app_type` ごとに「一般的なSaaSでカバーされる機能」との差分をQ11〜Q12（データ特性・業務要件の自由選択項目）の回答数から簡易算出します（一致率60%以上=高、30〜60%=中、30%未満=低）。

---

## 3. アーキテクチャパターン一覧（architecture_patterns）

指示書のP1〜P10をそのまま採用し、`complexity_level`（1=低〜5=高）と適用/非適用条件を明文化します。

| id | name | complexity_level | suitable_conditions | unsuitable_conditions |
|---|---|---|---|---|
| P1 | 統合型Webアプリ | 2 | 小中規模、開発者少数、単一チームで完結、納期優先 | 大規模同時アクセス、フロント/バックエンドを別チーム/別リリースサイクルで運用したい |
| P2 | フロント・API分離型 | 3 | モバイルアプリとAPI共有、外部公開SaaS、長期拡張前提 | MVP・小規模・開発速度最優先 |
| P3 | BaaS中心型 | 1 | MVP、少人数開発、AIコーディング中心、開発速度最優先 | 複雑なSQL集計、オンプレミス必須、厳密なトランザクション制御 |
| P4 | Microsoft統合型 | 3 | Microsoft 365利用、Entra ID必須、Windows/Azure統一 | Microsoft環境がない、脱Microsoftを志向 |
| P5 | Python業務・AI型 | 2 | AI/RAG、PDF・Excel処理、データ分析・自動化 | リッチなSPA UIが必須、リアルタイム性が極めて高い |
| P6 | SaaS連携・自動化型 | 1 | SaaS間データ同期、定期処理、通知の自動化が主目的 | 独自UIを持つ業務システム本体が必要 |
| P7 | モバイル中心型 | 3 | 現場入力、オフライン利用、位置情報・カメラ等端末機能が中核 | PC管理画面が主用途 |
| P8 | デスクトップ型 | 3 | 店舗端末・POS連携、Windows専用業務ツール、オフライン常時稼働 | 複数拠点からのWebアクセスが前提 |
| P9 | CMS・EC拡張型 | 1 | 一般的なEC・CMS機能が中心、独自機能は付加的 | 業務フロー全体が既存EC/CMSの概念に合わない |
| P10 | ゲームエンジン型 | 2〜4（規模による） | 教育用軽量ゲーム、簡易シミュレーション | 業務システム全般 |

---

## 4. 標準スタック候補一覧（stack_profiles）※MVP 17件

役割別（frontend/backend/database/auth/storage/search/ai/automation/hosting/monitoring）に構成した代表プロファイルです。「―」は原則不要（対象アーキテクチャでは採用しない）。

| id | name | app_type例 | pattern | frontend | backend | database | auth | hosting |
|---|---|---|---|---|---|---|---|---|
| SP-01 | 統合Web／中小業務システム | internal_ops | P1 | Next.js単体 | Next.js API Routes | PostgreSQL | Supabase Auth | Vercel |
| SP-02 | 統合Web／承認フロー | approval_workflow | P1 | Laravel Blade | Laravel | MySQL | Laravel標準認証 | さくら/AWS Lightsail |
| SP-03 | API分離／顧客案件管理 | crm_deals | P2 | React | NestJS | PostgreSQL | Auth0 or Supabase Auth | AWS/GCP |
| SP-04 | API分離／予約受付 | reservation | P2 | Next.js | FastAPI | PostgreSQL | Supabase Auth | Vercel＋Cloud Run |
| SP-05 | BaaS中心／MVP業務システム | internal_ops, crm_deals | P3 | React | ― | Supabase(Postgres) | Supabase Auth | Vercel |
| SP-06 | BaaS中心／モバイル同期重視 | reservation, saas_integration | P3 | Flutter | ― | Firestore | Firebase Auth | Firebase Hosting |
| SP-07 | Microsoft統合／M365企業業務 | internal_ops, approval_workflow | P4 | Blazor Server | ASP.NET Core | Azure SQL | Entra ID | Azure App Service |
| SP-08 | Microsoft統合／Power Platform連携 | approval_workflow | P4 | Power Apps | Power Automate | Dataverse/Azure SQL | Entra ID | Azure |
| SP-09 | Python業務AI／ナレッジ検索RAG | knowledge_ai_search | P5 | Next.js（軽量） | FastAPI | PostgreSQL＋pgvector | Supabase Auth | Cloud Run |
| SP-10 | Python業務AI／帳票・Excel自動化 | internal_ops | P5 | Streamlit | Django | PostgreSQL | Django標準 | オンプレ/Cloud Run |
| SP-11 | SaaS連携自動化／n8n中心 | saas_integration | P6 | ―（n8n管理画面） | n8n | n8n内蔵DB＋連携先 | n8n Basic Auth | Docker(自社/Cloud Run) |
| SP-12 | SaaS連携自動化／Power Automate | saas_integration | P6 | ―（Power Automate） | Power Automate | Dataverse | Entra ID | Microsoft 365 |
| SP-13 | モバイル中心／現場入力アプリ | inventory | P7 | Flutter | ― | Supabase(Postgres) | Supabase Auth | Firebase/Vercel |
| SP-14 | モバイル中心／軽量PWA | reservation | P7 | Expo(PWA) | Cloud Functions | Firestore | Firebase Auth | Firebase Hosting |
| SP-15 | デスクトップ型／店舗端末連携 | inventory | P8 | Tauri | Tauriバックエンド(Rust) | SQLite(ローカル)＋同期 | ローカル認証 | 店舗端末常駐 |
| SP-16 | CMS・EC拡張／EC受注連携 | saas_integration | P9 | Shopify管理画面 | Cloud Functions | Shopify＋自社DB(PostgreSQL) | Shopify Auth | Cloud Run |
| SP-17 | ゲームエンジン／教育用軽量ゲーム | ―(教育用) | P10 | Phaser | ―（静的） | ―（ローカルStorage） | ―（匿名） | Cloudflare Pages |

各プロファイルの `search`・`ai`・`automation`・`monitoring` 列は個別レコードで保持し、上表では割愛（実装時にフルカラム化）。

---

## 5. 質問一覧（questions）※MVP 21問

段階的表示（ステップ1〜7）に対応。`answer_type`: `free_text` / `single` / `multi` / `number`。

| order | id | category | question | answer_type | required |
|---|---|---|---|---|---|
| 1 | q_problem | 作りたいもの | 解決したい業務・課題は何ですか | free_text | ○ |
| 2 | q_users | 作りたいもの | 誰が使いますか | free_text | ○ |
| 3 | q_current | 作りたいもの | 現在の代替手段は何ですか（自作/Excel・紙/一般SaaS/専用パッケージ/特になし） | single | ○ |
| 4 | q_scope | 利用範囲 | 利用範囲は（社内限定/社内＋取引先/一般ユーザー公開） | single | ○ |
| 5 | q_users_count | 利用範囲 | 想定利用人数（概算） | number | ○ |
| 6 | q_concurrent | 利用範囲 | 想定同時利用人数（概算） | number | - |
| 7 | q_global | 利用範囲 | 海外利用の有無（国内のみ/将来的に海外/既に海外あり） | single | - |
| 8 | q_devices | 利用端末 | 想定端末（PCブラウザ/スマホブラウザ/iOS・Androidアプリ/Windowsデスクトップ/店舗POS端末/バーコードリーダー 等・複数選択） | multi | ○ |
| 9 | q_data_complexity | データ | データ同士の関連の複雑さ（単純/中程度/複雑な多対多） | single | ○ |
| 10 | q_data_volume | データ | 想定データ件数規模（〜1万/1万〜10万/10万〜100万/100万以上） | single | - |
| 11 | q_data_traits | データ | データ特性（添付ファイル/画像・動画/履歴保存/監査ログ必須/全文検索必要/AI検索必要・複数選択） | multi | - |
| 12 | q_biz_features | 業務要件 | 必要な業務機能（承認フロー/権限管理/通知/リアルタイム更新/オフライン利用/定期バッチ処理/帳票出力/外部システム連携・複数選択） | multi | - |
| 13 | q_env | 既存環境 | 既存で利用中の環境（Microsoft365/Google Workspace/AWS/Azure/Google Cloud/社内サーバー/基幹システム/POS/EC/CRM/会計・複数選択） | multi | - |
| 14 | q_entra | 既存環境 | Entra ID／Microsoft認証への統一は必須ですか | single | - |
| 15 | q_dev_team | 運用条件 | 開発体制（自社エンジニアがいる/外部委託/AIコーディング中心の少人数） | single | ○ |
| 16 | q_ops_team | 運用条件 | 運用担当者はいますか | single | ○ |
| 17 | q_budget | 運用条件 | 想定予算感（小規模/中規模/大規模） | single | ○ |
| 18 | q_deadline | 運用条件 | 希望納期 | single | - |
| 19 | q_hosting_pref | 運用条件 | クラウド利用可否／オンプレミス要件 | single | ○ |
| 20 | q_pii | 運用条件 | 個人情報・機密情報を扱いますか | single | ○ |
| 21 | q_security_level | 運用条件 | セキュリティ要件レベル（一般/高/決済金融相当） | single | ○ |

---

## 6. スコアリングルール（scoring_rules）※代表例

`condition_key` は質問回答またはフラグ（`flags`）、`target_type` は `architecture_pattern` / `technology` / `build_or_buy`。全件はマスタ投入時にCSV/シードで管理し、ここでは代表パターンのみ提示します。

| condition_key | operator | condition_value | target_type | target_id | score | reason |
|---|---|---|---|---|---|---|
| q_entra | `=` | 必須 | architecture_pattern | P4 | +8 | Entra ID必須はMicrosoft統合型が最適合 |
| q_entra | `=` | 必須 | technology | firebase | -8 | Firebase系はEntra ID非対応 |
| q_data_complexity | `=` | 複雑な多対多 | technology | postgresql | +5 | RDBのリレーション・集計適性が高い |
| q_data_complexity | `=` | 複雑な多対多 | technology | firestore | -5 | ドキュメントDBは複雑な結合集計に不向き |
| q_biz_features | `includes` | オフライン利用 | architecture_pattern | P7 | +6 | モバイルオフライン同期が要件の中核 |
| q_data_traits | `includes` | AI検索必要 | architecture_pattern | P5 | +6 | pgvector/RAG構築に適合 |
| q_dev_team | `=` | AIコーディング中心の少人数 | architecture_pattern | P3 | +5 | BaaS中心型は開発速度・AI適性が高い |
| q_dev_team | `=` | AIコーディング中心の少人数 | architecture_pattern | P2 | -3 | フロント/バックエンド分離は少人数開発に負荷が高い |
| q_budget | `=` | 小規模 | technology | azure_sql | -4 | ライセンス/運用コストが小規模予算に合わない |
| q_env | `includes` | Microsoft365 | architecture_pattern | P4 | +4 | 既存M365資産との親和性 |
| q_devices | `includes` | 店舗POS端末 | architecture_pattern | P8 | +5 | 店舗端末常駐・オフライン耐性が必要 |
| q_pii | `=` | 扱う | technology | supabase | +2 | RLSによるアクセス制御が実装しやすい |
| q_security_level | `=` | 決済金融相当 | build_or_buy | D | -6 | 独自開発のリスクが過大（Eまたは既存決済SaaS利用へ誘導） |

---

## 7. 除外ルール（exclusion_rules）※代表例

| condition_key | operator | condition_value | target_type | target_id | reason |
|---|---|---|---|---|---|
| q_hosting_pref | `=` | オンプレミス必須 | architecture_pattern | P3 | BaaS中心型はクラウド専有サービス前提のため不可 |
| q_hosting_pref | `=` | オンプレミス必須 | technology | firebase | クラウド専用サービスのためオンプレ不可 |
| q_entra | `=` | 必須 | technology | firebase | Microsoft認証基盤に非対応 |
| q_data_complexity | `=` | 複雑な多対多 | technology | firestore | SQL集計必須要件との不適合（単独構成として除外） |
| q_biz_features | `includes` | オフライン利用 | technology | google_sheets_backend的な非同期非対応構成 | オフライン同期非対応 |
| app_type | `=` | ゲーム（本格3D） | architecture_pattern | P1,P2,P3 | 一般Web構成では3Dゲーム要件を満たせない |
| build_or_buy_flag | `=` | hard_no_build | build_or_buy_result | D | 決済・会計・医療判断等の対象領域は全面自作を除外 |

---

## 8. リスクルール（risk_rules）※代表例

| condition_key | risk_type | severity | message | mitigation |
|---|---|---|---|---|
| recommend=A or B (SaaS採用) かつ SaaSのAPI/CSVエクスポート不可 | ロックイン | 高 | 契約終了時にデータを自社側へ持ち出せない可能性 | 日次バックアップ・API同期・共通ID管理の導入 |
| q_pii=扱う かつ 海外リージョンのSaaS | セキュリティ | 高 | 個人情報の越境移転リスク | 国内リージョン提供SaaSへの変更、DPA確認 |
| q_ops_team=いない かつ recommend=D | 運用 | 高 | 独自開発は運用担当不在だと障害対応が困難 | 保守委託契約、監視・アラートの自動化 |
| q_dev_team=AIコーディング中心の少人数 かつ pattern=P2以上の複雑度 | 保守性 | 中 | 少人数体制では複雑構成の保守が追いつかない可能性 | よりシンプルなP1/P3への変更を検討 |
| q_budget=小規模 かつ recommend=D | 費用 | 中 | 初期開発費用が予算を超過するリスク | MVP範囲の絞り込み、SaaS＋独自開発(C)への切替検討 |
| recommend=C かつ 連携先SaaSのWebhook非対応 | データ移行 | 中 | リアルタイム連携ができずポーリング実装が必要 | バッチ同期設計への変更、許容遅延の合意 |

---

## 9. 診断結果の出力例

**入力シナリオ**：中小企業の営業部門向け「顧客・案件管理」。社内＋取引先が利用、Microsoft 365環境でEntra ID必須、独自の見積承認ロジックあり、SQL集計必要、予算は中規模、開発は自社に少人数のAIコーディング担当者。

```text
【1. 結論】
推奨方式：SaaS＋独自開発（C）

【2. 自作する範囲】
自作：
- 独自の見積承認ロジック（多段階承認・金額閾値判定）
- 案件データの社内システム向けダッシュボード連携

外部サービス利用：
- 認証（Entra ID）
- メール通知（Microsoft 365）
- ファイル保管（SharePoint）

【3. 推奨アーキテクチャ】
構成パターン：Microsoft統合型（P4）

【4. 推奨技術構成】
- フロントエンド：Blazor Server
- バックエンド：ASP.NET Core
- DB：Azure SQL
- 認証：Entra ID
- ファイルストレージ：SharePoint / Azure Blob Storage
- 検索：Azure SQL全文検索（将来的にAzure AI Searchへ拡張可）
- AI：なし（MVP範囲外）
- 自動化：Power Automate（承認通知）
- インフラ：Azure App Service
- CI/CD：GitHub Actions → Azure App Service
- 監視：Azure Monitor
- バックアップ：Azure SQL自動バックアップ（日次）

【5. 推奨理由】
Entra ID必須という強制条件によりMicrosoft統合型（P4）が唯一の高適合パターンとなりました。
独自の見積承認ロジックは一般的なCRM/SFAでは対応できない業務固有ルールであり、SQL集計要件も
あることから、Azure SQLを中心としたRDB構成を採用しています。既存M365環境との親和性が高く、
少人数開発でも運用負荷を抑えられる構成です。

【6. 代替案】
第二候補：フロント・API分離型（P2）＋ React／NestJS／PostgreSQL
Entra ID連携はMicrosoft認証ライブラリ経由で対応可能ですが、Blazor構成より実装工数が増加します。
将来的にモバイルアプリを別途提供する計画がある場合はこちらを推奨します。

【7. 採用しなかった構成】
BaaS中心型（Supabase/Firebase）を採用しなかった理由：
Entra ID必須という強制条件に非対応のため。

一般的なSaaS型CRMをそのまま採用しなかった理由：
多段階の見積承認ロジックが業務固有であり、既存SaaSの標準機能でカバーできないため。

【8. AIコーディング適性】
AIコーディング適性：中
実装可能範囲：CRUD画面、案件一覧・検索、通知処理、帳票出力
専門家確認範囲：Entra ID権限設計、承認ロジックの例外処理、Azure SQLのパフォーマンスチューニング

【9. リスク】
- セキュリティ：Entra IDの権限設計を誤ると過剰権限が発生しうる
- 運用：運用担当者の体制次第でAzureコスト最適化が後回しになりやすい
- データ移行：将来的な脱Microsoft移行はコストが大きい（ロックイン中程度）
- SaaSロックイン：本構成は自作中心のため低い
- 費用増加：Azure SQL/App Serviceの従量課金が利用増加で膨らむ可能性
- 拡張性：モバイル対応時はP2への構成変更が必要になる可能性

【10. 次の作業】
- 要件定義（見積承認ロジックの詳細ヒアリング）
- 画面一覧作成
- データモデル設計（案件・見積・承認テーブル）
- MVP範囲の確定
- 構成図作成
- 開発計画（マイルストーン設定）
```

---

## 10. MVP実装計画

既存の StackFit（A/B/C判定）を置き換える前提のフェーズ分割です。既存の [QuestionCard.tsx](../src/features/diagnosis/components/QuestionCard.tsx) / [ProgressBar.tsx](../src/features/diagnosis/components/ProgressBar.tsx) / [AnsweredSummary.tsx](../src/features/diagnosis/components/AnsweredSummary.tsx) はUI部品として流用可能です。

| Phase | 内容 | 主な成果物 |
|---|---|---|
| 0 | DBスキーマ設計・マイグレーション | Supabaseマイグレーション（13章のテーブル群） |
| 1 | マスタデータ投入 | 本ドキュメント1〜8章の内容をシード化（SQL or Seedスクリプト） |
| 2 | 診断エンジン実装 | スコアリング・除外・複雑性ペナルティを行う純粋関数群（`diagnosisEngine.ts`）＋ユニットテスト |
| 3 | 質問フローUI刷新 | `DiagnosisFlow.tsx` をDB駆動の質問取得に対応させ、既存UI部品を流用 |
| 4 | 結果画面実装 | 9章の出力形式に合わせて `ResultView.tsx` を刷新（結論/自作範囲/構成/理由/代替案/不採用理由/リスク/AI適性/次の作業） |
| 5 | 診断結果保存・再表示 | `diagnosis_results` への保存、ログインユーザーのマイページで過去診断一覧・再表示 |
| 6 | 管理画面（最小構成） | 質問・技術マスタ・スコアリングルールの一覧表示＋簡易編集（初期は編集不可の閲覧のみでも可） |
| 7 | 結合確認・レビュー | 代表シナリオ（9章含む複数パターン）での動作確認、本ドキュメントとの整合性チェック |

**MVPで意図的に含めないもの**：全技術サービスの網羅、`compatibility_rules` の本格運用（当面は目視レビューで代替）、管理画面での削除・権限管理。

---

## レビューポイント（ご確認ください）

1. アプリ種別8種・質問21問・アーキテクチャパターン10種・標準スタック17件の初期セットで過不足がないか
2. 2章の判定区分マッピング（buildScoreの閾値）が実態に対して妥当か
3. 9章の出力例のトーン・粒度がイメージと合っているか
4. 10章のフェーズ順序・スコープ（特にPhase 6管理画面を最小構成にする点）で問題ないか

ご確認いただけましたら、Phase 0（DBスキーマ）から実装に着手します。
