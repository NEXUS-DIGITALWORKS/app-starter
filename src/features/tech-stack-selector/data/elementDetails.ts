export type ElementDetail = {
  overview: string;
  fit: string;
  caution: string;
  url?: string;
};

// キーは data/categories.ts の要素idと対応
export const ELEMENT_DETAILS: Record<string, ElementDetail> = {
  // 1. フロントエンド・Web画面
  'react-vite': {
    url: 'https://vite.dev/',
    overview: 'ReactをViteで動かす構成。Viteの高速な開発サーバーとHMRにより、コーディング中の変更が即座に画面へ反映される。',
    fit: 'SPA（シングルページアプリ）として管理画面や業務システムを素早く立ち上げたい場合に向く。エコシステムが豊富でライブラリ選定の自由度が高い。',
    caution:
      'SSRやSEO対応ができないわけではないが、標準的なSPA構成では追加設計が必要。検索流入を重視する公開サイトでは、Next.jsやAstroなどの構成と比較して選定する。',
  },
  nextjs: {
    url: 'https://nextjs.org/',
    overview: 'Reactベースのフルスタックフレームワーク。ページ生成方式（SSR・SSG・ISR）を切り替えられ、サーバー処理もアプリ内に統合できる。',
    fit: 'SEOが重要な公開サービスや、フロントとバックエンドを一つのコードベースで開発したいSaaSに向く。',
    caution: '設定項目やレンダリング方式の選択肢が多く、React単体の構成に比べて学習コストがやや高い。',
  },
  'vue-vite': {
    url: 'https://vuejs.org/',
    overview: 'VueをViteで動かす構成。Reactに比べテンプレート構文が直感的で、学習コストを抑えやすい。',
    fit: '管理画面や小規模なWebアプリを、少人数・短期間で構築したい場合に向く。',
    caution:
      'Reactと比べると、利用できるライブラリや採用人材の選択肢が少ない分野もある。長期運用する場合は、チーム内のVue経験者や保守体制を確認する。',
  },
  nuxt: {
    url: 'https://nuxt.com/',
    overview: 'VueをベースにしたフルスタックWebフレームワーク。SSR・SSG・サーバーAPIなどを一つのプロジェクト内で構築できる。',
    fit: 'SEOを重視するWebサービスをVueで作りたい場合に適する。',
    caution: 'Nuxt特有のディレクトリ規約やモジュールエコシステムを理解する必要がある。',
  },
  sveltekit: {
    url: 'https://svelte.dev/docs/kit',
    overview: 'Svelteをベースにしたフレームワーク。コンパイル時に処理を最適化するため、ランタイムが軽量。',
    fit: 'パフォーマンスを重視した軽量なWebサービスに向く。コード量も少なく済む。',
    caution: 'React・Vueに比べエコシステムや求人市場が小さく、長期保守での人材調達リスクがある。',
  },
  angular: {
    url: 'https://angular.dev/',
    overview: 'Googleが開発するフルスタック指向のフロントエンドフレームワーク。TypeScript前提で、DIやルーティングが標準装備。',
    fit: '大規模な企業向けシステムなど、厳格な設計規約とチーム開発の統制が必要な場面に向く。',
    caution: '学習コストが高く、小規模プロジェクトにはオーバースペックになりやすい。',
  },
  blazor: {
    url: 'https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor',
    overview: 'C#でフロントエンドを記述できるMicrosoftのフレームワーク。WebAssemblyまたはサーバー側処理で動作する。',
    fit: '.NET・C#の資産やスキルセットを持つ企業向けシステムに向く。',
    caution: 'JS系フレームワークに比べエコシステムが小さく、非Microsoft環境との親和性は低め。',
  },
  pwa: {
    url: 'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps',
    overview:
      'Webアプリをホーム画面への追加やオフライン動作、プッシュ通知などネイティブアプリに近い形で使える技術。特定のフレームワークではなく、既存のWeb画面に追加する機能。',
    fit: 'アプリストア審査を経ずに、スマートフォンでアプリのような操作感を提供したい場合に向く。',
    caution:
      'iOSでもホーム画面に追加したWebアプリでプッシュ通知を利用できるが、インストール導線、バックグラウンド処理、BluetoothやNFCなど、一部機能はOS・ブラウザによって対応状況が異なる。',
  },
  astro: {
    url: 'https://astro.build/',
    overview:
      'コンテンツ中心のWebサイトに適したフレームワーク。基本部分を静的HTMLとして生成し、必要な箇所だけにReactやVueなどのJavaScriptを読み込む「アイランド構成」を採用できる。',
    fit: 'コーポレートサイト、オウンドメディア、技術ドキュメント、ランディングページなど、表示速度とSEOを重視するWebサイトに向く。',
    caution: '画面全体が頻繁に変化する管理画面や、複雑な状態管理を持つSaaSでは、Next.jsやReact SPAの方が設計しやすい場合がある。',
  },

  // 2. モバイル・デスクトップアプリ
  flutter: {
    url: 'https://flutter.dev/',
    overview: 'Googleが開発するUIフレームワーク。単一のコードベースでiOS・Android・Webの画面を構築できる。',
    fit: '複数プラットフォームを同時にリリースしたい場合や、デザインの統一性を重視する場合に向く。',
    caution: 'Dartという専用言語の習得が必要で、ネイティブ機能を深く使う場合はプラグインの対応状況を確認する必要がある。',
  },
  'react-native-expo': {
    url: 'https://reactnative.dev/',
    overview: 'Reactの知識でネイティブアプリを開発できるフレームワーク。Expoを使うとビルド・配布の設定が簡略化される。',
    fit: 'Web版で既にReactを使っているチームが、モバイルアプリも同じ技術で開発したい場合に向く。',
    caution: '高度なネイティブ機能を使う場合はExpoの管理外（Bare workflow）に切り替える必要が出ることがある。',
  },
  'swift-kotlin': {
    overview: 'iOS（Swift）・Android（Kotlin）それぞれの公式言語でアプリを個別に開発する方式。',
    fit: 'OS標準機能への即応性や描画パフォーマンスを最優先したいアプリに向く。',
    caution: 'iOS・Androidを別々に実装するため、開発・保守コストが最も高くなりやすい。',
  },
  'react-tauri': {
    url: 'https://tauri.app/',
    overview: 'ReactなどのWeb技術でUIを作り、Rust製の軽量ランタイム（Tauri）でデスクトップアプリとして動かす構成。',
    fit: 'Electronより軽量・省メモリなデスクトップアプリを作りたい場合に向く。',
    caution: 'OS固有機能を使う際は、Rustコマンド側の実装が必要になる場面がある。',
  },
  'react-electron': {
    url: 'https://www.electronjs.org/',
    overview: 'ReactなどのWeb技術とNode.jsでデスクトップアプリを構築するフレームワーク。ブラウザエンジンを内包する。',
    fit: 'Node.jsのAPIをフル活用した高機能な業務アプリを、Web技術のまま作りたい場合に向く。',
    caution: 'アプリのサイズやメモリ使用量が大きくなりやすい。',
  },
  flet: {
    url: 'https://flet.dev/',
    overview: 'Pythonで画面や処理を記述し、Web・Windows・macOS・モバイル向けに展開できるUIフレームワーク。',
    fit: 'Pythonによるデータ処理や業務処理に、比較的短期間で操作画面を追加したい場合に向く。',
    caution: '複雑な画面デザインや高度なネイティブ機能では、React、Flutter、PySideなどに比べて調整が必要になることがある。',
  },
  pyside: {
    url: 'https://doc.qt.io/qtforpython/',
    overview: 'Qtの公式Pythonバインディング。ネイティブに近いデスクトップUIや、ファイル・端末機能を扱うアプリを構築できる。',
    fit: '画面数が多い業務アプリや、端末内で完結する高機能なデスクトップツールに向く。',
    caution: 'Qt固有の設計やイベント処理を理解する必要があり、Fletより学習コストが高い。',
  },
  capacitor: {
    url: 'https://capacitorjs.com/',
    overview: 'Webアプリをネイティブアプリのコンテナ内で動かし、カメラ、通知、位置情報などの端末機能へアクセスできるクロスプラットフォームランタイム。',
    fit: 'すでにWebアプリがあり、そのコードを活かしてモバイルアプリとしてストア配布したい場合に向く。',
    caution: '高度な描画性能や複雑なネイティブ機能を必要とするアプリでは、Flutter、React Native、Swift・Kotlinの方が適する場合がある。',
  },

  // 3. バックエンド・API・リアルタイム
  'supabase-data-api': {
    url: 'https://supabase.com/docs/guides/api',
    overview: 'SupabaseのPostgreSQLに対して、自動生成されるREST APIやクライアントSDKを使ってデータを読み書きする仕組み。GraphQL APIも利用できる。',
    fit: '独自のAPIサーバーを持たず、フロント・アプリから直接データ操作をしたいMVP開発に向く。',
    caution:
      'クライアントから直接データを操作する場合は、Row Level Securityによるアクセス制御が必須。複雑な業務処理はEdge Functionsや独立したAPIと組み合わせる。',
  },
  'supabase-edge-functions': {
    url: 'https://supabase.com/docs/guides/functions',
    overview: 'Supabase上で動くサーバーレス関数（Deno）。APIキーなど秘密情報を扱う処理や外部API連携を実行できる。',
    fit: '決済処理や通知送信など、クライアントに公開できない処理を安全に実行したい場合に向く。',
    caution: '常時稼働のバッチ処理や長時間処理には向かず、実行時間の制限がある。',
  },
  'nextjs-server-actions': {
    url: 'https://nextjs.org/docs',
    overview: 'Next.jsアプリ内でサーバー側の処理（フォーム送信、DB操作など）を関数として直接呼び出せる機能。',
    fit: '別途APIサーバーを構築せず、Next.js単体でフルスタックに完結させたい場合に向く。',
    caution: 'Next.jsのバージョンやレンダリング方式への依存が強く、他フレームワークへの移植性は低い。',
  },
  nestjs: {
    url: 'https://nestjs.com/',
    overview: 'TypeScript製のサーバーフレームワーク。モジュール・DIなどAngularに近い設計思想で、大規模なAPIを構造化しやすい。',
    fit: '複数の業務ロジックや外部連携が絡む、規模の大きい業務システムのAPIに向く。',
    caution: '小規模なAPIには記述量が多く、オーバースペックになりやすい。',
  },
  fastapi: {
    url: 'https://fastapi.tiangolo.com/',
    overview: 'Python製の高速なAPIフレームワーク。型ヒントを活用した自動バリデーションやAPIドキュメント生成が特徴。',
    fit: 'AI・データ処理系のライブラリ（Python資産）を活かしたAPIやRAG基盤の構築に向く。',
    caution: 'TypeScript系フロントとの型共有がしづらく、フロント・バック間でスキーマ管理の工夫が必要。',
  },
  'cloud-functions': {
    url: 'https://cloud.google.com/functions',
    overview: 'FirebaseやGoogle Cloud上で動くサーバーレス関数。認証イベントやデータ更新をトリガーに処理を実行できる。',
    fit: 'Firebase・Firestoreと連携した通知処理や定期バッチ処理に向く。',
    caution: 'コールドスタートによる遅延や、関数間の処理の見通しにくさに注意が必要。',
  },
  'aspnet-core': {
    url: 'https://dotnet.microsoft.com/en-us/apps/aspnet',
    overview: 'MicrosoftのC#製サーバーフレームワーク。高いパフォーマンスとエンタープライズ向け機能を備える。',
    fit: '既存のMicrosoft環境（Active Directory、SQL Server等）と密に連携する企業システムに向く。',
    caution: '.NETエコシステム前提のため、非Microsoft環境のチームには習得コストがかかる。',
  },
  'aws-lambda': {
    url: 'https://aws.amazon.com/lambda/',
    overview: 'AWSのサーバーレス関数実行環境。API Gatewayと組み合わせてHTTP APIを構築できる。',
    fit: 'アクセス量が変動する処理や、使った分だけ課金したいAPIに向く。',
    caution: '実行時間やメモリの制限があり、常時接続が必要な処理には不向き。',
  },
  'azure-functions': {
    url: 'https://azure.microsoft.com/en-us/products/functions',
    overview: 'Azure上のサーバーレス関数実行環境。Azure内の各種サービスとのトリガー連携が豊富。',
    fit: 'Microsoft 365やAzure ADなど、既存のAzure環境と連携する処理に向く。',
    caution: 'AWS Lambdaと同様に実行時間の制限があり、長時間処理には工夫が必要。',
  },
  'rust-command': {
    url: 'https://www.rust-lang.org/',
    overview: 'Tauriアプリからネイティブの処理（ファイル操作やOS機能）を呼び出すためのRust実装部分。',
    fit: 'Tauriアプリでファイルシステムや高速な演算処理を安全に扱いたい場合に向く。',
    caution: 'Rustの学習コストがあり、Web技術のみのチームには追加のスキルセットが必要。',
  },
  nodejs: {
    url: 'https://nodejs.org/',
    overview: 'Electronアプリのメインプロセスとして、ファイル操作や外部API連携、OS機能へのアクセスを担うランタイム。',
    fit: 'Web技術の知識のまま、デスクトップアプリのバックエンド処理を実装したい場合に向く。',
    caution: 'メインプロセスの処理が重いとアプリ全体の応答性に影響するため、非同期処理の設計が重要。',
  },
  hono: {
    url: 'https://hono.dev/',
    overview: 'Web標準を基盤とした軽量なTypeScript向けWebフレームワーク。Cloudflare Workers、Node.js、Deno、Bun、AWS Lambdaなど複数の実行環境に対応する。',
    fit: '小規模API、Webhook受信、フロントエンド向けBFF、エッジ環境で動くAPIを素早く構築したい場合に向く。',
    caution: '大規模な業務システムでは、NestJSのようなモジュール構造が標準化されたフレームワークの方が管理しやすい場合がある。',
  },
  'supabase-realtime': {
    url: 'https://supabase.com/docs/guides/realtime',
    overview: 'Supabaseが提供するリアルタイム通信機能。Broadcast、Presence、PostgreSQLの変更通知などを利用できる。',
    fit: 'チャット、通知、ユーザーのオンライン状態、複数ユーザー間のリアルタイム更新が必要なWeb・モバイルアプリに向く。',
    caution: '同時接続数、メッセージ数、通信量、再接続、イベントの重複、処理順序を考慮した設計が必要。',
  },

  // 4. データベース・キャッシュ・データ基盤
  'supabase-postgresql': {
    url: 'https://supabase.com/docs/guides/database',
    overview: 'SupabaseがマネージドでホスティングするPostgreSQL。認証・API・ストレージなどSupabaseの他機能と統合されている。',
    fit: '顧客・案件・商品などリレーショナルなデータを、他のSupabase機能と併せて手早く管理したい場合に向く。',
    caution: '大規模な負荷対策やチューニングの自由度は、自前運用のPostgreSQLより制限される。',
  },
  postgresql: {
    url: 'https://www.postgresql.org/',
    overview: 'オープンソースのリレーショナルデータベース。トランザクション・複雑な検索・拡張機能に強い。',
    fit: '複雑な業務データや集計処理、将来的な拡張（pgvector等）を見据えた基盤として向く。',
    caution: '自前で運用する場合はバックアップ・スケーリングなどの運用設計が別途必要。',
  },
  firestore: {
    url: 'https://firebase.google.com/docs/firestore',
    overview: 'Firebaseが提供するNoSQL型データベース。クライアントからのリアルタイム同期とオフラインキャッシュに強い。',
    fit: 'モバイル・Web間でデータをリアルタイムに同期したいアプリや、オフライン対応が必要なアプリに向く。',
    caution: '複雑な集計やJOINに近い操作は不得意で、リレーショナルなデータ設計には工夫が必要。',
  },
  'cloud-sql': {
    url: 'https://cloud.google.com/sql',
    overview: 'Google CloudのマネージドリレーショナルDBサービス。PostgreSQL・MySQLを選んで運用できる。',
    fit: 'Google Cloud上でPostgreSQL・MySQLを本格運用したい場合に向く。',
    caution: 'サーバーレスではないため、インスタンスサイズ選定などの運用管理が必要。',
  },
  'azure-sql': {
    url: 'https://azure.microsoft.com/en-us/products/azure-sql',
    overview: 'AzureのマネージドリレーショナルDBサービス。SQL Server互換のエンジンをクラウドで利用できる。',
    fit: 'Azure環境で企業向けのリレーショナルデータを管理したい場合に向く。',
    caution: 'SQL Server固有の機能を使う場合は、互換性の違いを事前に確認する必要がある。',
  },
  'sql-server': {
    url: 'https://www.microsoft.com/en-us/sql-server',
    overview: 'Microsoft製のリレーショナルデータベース。Windows Server環境や.NETとの親和性が高い。',
    fit: '既存の社内システムやMicrosoft系業務システムのデータ管理に向く。',
    caution: 'ライセンスコストがかかる場合があり、オープンソースDBに比べ導入コストが高くなりやすい。',
  },
  sqlite: {
    url: 'https://www.sqlite.org/',
    overview: 'サーバー不要でファイル一つとして動作する軽量なリレーショナルデータベース。',
    fit: 'デスクトップアプリなど、端末内で完結するデータ保存に向く。',
    caution: '同時書き込みや大量データ・高負荷アクセスには不向き。',
  },
  dynamodb: {
    url: 'https://aws.amazon.com/dynamodb/',
    overview: 'AWSのフルマネージドNoSQLデータベース。キーバリュー・ドキュメント型で、大規模アクセスにも自動でスケールする。',
    fit: 'アクセス量が大きく変動するサービスや、柔軟なデータ構造を扱いたい場合に向く。',
    caution: 'リレーショナルな検索やJOINが不得意なため、データ設計をアクセスパターンに合わせて事前に決める必要がある。',
  },
  'aurora-serverless': {
    url: 'https://aws.amazon.com/rds/aurora/serverless/',
    overview: 'AWSのリレーショナルDBサービス（Aurora）のサーバーレス版。利用量に応じて自動でスケールする。',
    fit: 'アクセス量の増減が大きいサービスで、リレーショナルDBの機能を維持したまま運用コストを抑えたい場合に向く。',
    caution:
      '最小容量を0にして自動停止を利用する場合は、停止状態からの再開に時間がかかることがある。常時応答が必要なシステムでは、最小容量を確保した構成も検討する。',
  },
  pgvector: {
    url: 'https://github.com/pgvector/pgvector',
    overview: 'PostgreSQLの拡張機能。文章や画像をベクトル化して保存し、類似度検索を可能にする。',
    fit: '既存のPostgreSQLをそのまま使い、RAGや意味検索の機能を追加したい場合に向く。',
    caution: '大規模なベクトルデータでは、専用のベクトルDBに比べ検索速度で劣る場合がある。',
  },
  pinecone: {
    url: 'https://www.pinecone.io/',
    overview: 'ベクトル検索に特化したマネージドサービス。大量の文章・埋め込みデータを高速に検索できる。',
    fit: '大量の文書データを扱うAI検索基盤で、検索速度とスケーラビリティを重視する場合に向く。',
    caution: 'PostgreSQLとは別にデータベースを一つ増やすことになり、運用対象が増える。',
  },
  weaviate: {
    url: 'https://weaviate.io/',
    overview: 'ベクトル検索とメタデータによるフィルタ検索を組み合わせられる、オープンソースのベクトルデータベース。',
    fit: '検索条件が複雑な高度なAI検索基盤を構築したい場合に向く。',
    caution: '自前でホスティングする場合は運用の手間が増え、学習コストもやや高い。',
  },
  redis: {
    url: 'https://redis.io/',
    overview: '主にメモリ上でデータを処理する高速なデータストア。キャッシュ、セッション、Pub/Sub、Streams、ジョブキューなどに利用できる。',
    fit: 'データベースへの負荷軽減、ログインセッション、レート制限、非同期処理、リアルタイム通知に向く。',
    caution: '永続データの主保存先として使うか、消えても復元できるキャッシュとして使うかを明確にする。メモリ上限、削除ポリシー、永続化、冗長化の設計が必要。',
  },
  mongodb: {
    url: 'https://www.mongodb.com/',
    overview: 'データをBSONドキュメントとして保存するNoSQLデータベース。レコードごとに異なるフィールドを持たせやすい。',
    fit: 'コンテンツ、ログ、イベント、商品属性など、データ構造が頻繁に変化するサービスに向く。',
    caution:
      '顧客、契約、請求など関係性が複雑な業務データでは、PostgreSQLなどのリレーショナルDBの方が扱いやすい場合がある。アクセス方法を先に決めてデータ構造を設計する必要がある。',
  },

  // 5. ORM・データ操作
  prisma: {
    url: 'https://www.prisma.io/',
    overview: 'TypeScript向けのORM。スキーマ定義から型安全なクエリコードを自動生成する。',
    fit: 'TypeScriptプロジェクトでPostgreSQLなどのDB操作を型安全に行いたい場合に向く。',
    caution: '複雑な集計クエリでは生SQLの方が書きやすい場合もあり、使い分けが必要。',
  },
  sqlalchemy: {
    url: 'https://www.sqlalchemy.org/',
    overview: 'PythonのORM兼SQLツールキット。柔軟なクエリ構築とマイグレーション管理ができる。',
    fit: 'PythonでDBを構造的に扱う業務システムやデータ処理基盤に向く。',
    caution: '機能が豊富な分、学習コストがやや高く、シンプルな用途にはオーバースペックになりやすい。',
  },
  'drizzle-orm': {
    url: 'https://orm.drizzle.team/',
    overview: 'TypeScript向けの軽量なORM兼クエリビルダー。PostgreSQL、MySQL、SQLiteなどを型安全に操作できる。',
    fit: 'SQLの構造を意識しながら、TypeScriptの型安全性も活かしたいNext.jsやHonoのプロジェクトに向く。',
    caution: 'PrismaよりSQLに近い知識が求められる。利用するデータベースやドライバーによる対応機能の違いも確認する。',
  },
  'ef-core': {
    url: 'https://learn.microsoft.com/en-us/ef/core/',
    overview: 'Microsoftが提供する、オープンソースかつクロスプラットフォームの.NET向けORM。LINQによる検索やマイグレーションに対応する。',
    fit: 'ASP.NET Core、Blazor、SQL Serverなどを使ったMicrosoft系業務システムに向く。',
    caution: '複雑なクエリでは、生成されるSQLと実行性能を確認する必要がある。マイグレーションを本番環境へ適用する手順も設計する。',
  },

  // 6. 認証・認可・ユーザー管理
  'supabase-auth': {
    url: 'https://supabase.com/docs/guides/auth',
    overview: 'Supabaseが提供する認証サービス。メール・パスワード・SNSログインなどをまとめて実装できる。',
    fit: 'Supabaseを使うプロジェクトで、追加費用や別サービスなしに認証機能を実装したい場合に向く。',
    caution: '高度な組織管理・SSOなど企業向け機能は、ClerkやAuth0に比べ限定的。',
  },
  'firebase-auth': {
    url: 'https://firebase.google.com/docs/auth',
    overview: 'Firebaseが提供する認証サービス。Google・電話番号など多様なログイン方法に対応する。',
    fit: 'Firebase・Firestoreを使うモバイル・Webアプリの認証に向く。',
    caution: 'Firebase以外のバックエンドと組み合わせる場合は、トークン検証の実装を別途行う必要がある。',
  },
  clerk: {
    url: 'https://clerk.com/',
    overview: 'SaaS向けに特化した認証・ユーザー管理サービス。組織（チーム）管理やプロフィールUIをすぐ使える形で提供する。',
    fit: 'BtoB SaaSで、招待・権限管理を含むユーザー管理を短期間で実装したい場合に向く。',
    caution: '利用ユーザー数に応じた従量課金があり、規模拡大時のコスト試算が必要。',
  },
  auth0: {
    url: 'https://auth0.com/',
    overview: 'Auth0社が提供する認証プラットフォーム。多様なプロトコル（OAuth、SAML等）や企業向け認証に対応する。',
    fit: '複数サービス間のシングルサインオンや、企業向けの認証要件がある場合に向く。',
    caution: '設定項目が多く、要件によっては構築・運用にAuth0の専門知識が必要。',
  },
  'entra-id': {
    url: 'https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id',
    overview: '旧Azure AD。Microsoft 365や社内アカウントを使った認証・アクセス管理を行うサービス。',
    fit: '社内システムでMicrosoft 365アカウントによるログインを求める場合に向く。',
    caution: 'Microsoftエコシステム外のサービスとの連携には、追加設定が必要になることがある。',
  },
  cognito: {
    url: 'https://aws.amazon.com/cognito/',
    overview: 'AWSが提供するユーザー認証・管理サービス。AWSの他サービスとのアクセス権限管理とも連携する。',
    fit: 'AWS上でシステムを構築し、認証もAWS内で完結させたい場合に向く。',
    caution: 'UIのカスタマイズ性がやや低く、独自デザインの認証画面を作る場合は追加実装が必要。',
  },
  keycloak: {
    url: 'https://www.keycloak.org/',
    overview: 'オープンソースの認証基盤。自社サーバーに設置して、ユーザー・権限・SSOを一元管理できる。',
    fit: '外部SaaSに認証情報を預けたくない、セルフホスト前提のシステムに向く。',
    caution: 'サーバーの構築・運用・アップデートを自社で担う必要があり、運用負荷が高い。',
  },
  'jwt-custom': {
    url: 'https://jwt.io/',
    overview: 'ユーザー情報やアクセス権限を自社で管理し、ログイン後の情報をJWTなどのトークンとしてクライアントとAPIの間で受け渡す方式。',
    fit: '既存の社内認証との統合など、一般的な認証サービスでは対応できない独自要件がある場合に向く。',
    caution:
      'パスワード保存、メール認証、MFA、トークン失効、アカウントロック、攻撃対策まで自社で実装・保守する必要がある。特別な理由がなければ、実績のある認証サービスを優先する。',
  },
  'local-auth': {
    overview: 'サーバーを介さず、アプリを利用する端末内だけでログイン・利用制限を行う方式。',
    fit: 'オフラインで動作するデスクトップツールなど、外部通信を前提としないアプリに向く。',
    caution: '複数端末間でのアカウント共有や不正コピー対策は別途検討が必要。',
  },
  oauth: {
    url: 'https://oauth.net/2/',
    overview: 'Gmail・Google Drive・Slackなど外部サービスに対して、ユーザーの許可のもと安全にアクセスするための認可の仕組み。',
    fit: '外部SaaSのデータやAPIを、ユーザーに代わって操作する自動化・連携機能に向く。',
    caution:
      '連携先ごとにスコープ設定やトークンの更新処理を実装する必要がある。ログイン用途で使う場合は、OAuth 2.0を基盤にしたOpenID Connectを併用する。',
  },

  // 7. ファイル・画像・文書管理
  'supabase-storage': {
    url: 'https://supabase.com/docs/guides/storage',
    overview: 'Supabaseが提供するファイルストレージ。バケット単位でRow Level Securityによるアクセス制御ができる。',
    fit: 'Supabaseの認証・DBと連携して、ユーザーごとにアクセス制御されたファイル管理をしたい場合に向く。',
    caution: '大容量・高頻度なファイル配信では、CDNとの組み合わせなど追加の検討が必要になることがある。',
  },
  'firebase-storage': {
    url: 'https://firebase.google.com/docs/storage',
    overview: 'Firebaseが提供するファイルストレージ。モバイル・Web SDKからの直接アップロードに対応する。',
    fit: 'Firebaseを使うモバイル・Webアプリで、写真や動画を扱いたい場合に向く。',
    caution: 'Firebase以外のバックエンドと組み合わせる場合、アクセス制御ルールの設計を別途行う必要がある。',
  },
  s3: {
    url: 'https://aws.amazon.com/s3/',
    overview: 'AWSが提供するオブジェクトストレージ。高い耐久性とスケーラビリティを持ち、業界標準的に使われる。',
    fit: '大量の画像・PDF・バックアップデータを長期的かつ安全に保存したい場合に向く。',
    caution: 'アクセス権限設定（バケットポリシー）を誤ると情報漏えいにつながるため、設定の確認が重要。',
  },
  'azure-blob': {
    url: 'https://azure.microsoft.com/en-us/products/storage/blobs',
    overview: 'Azureが提供するオブジェクトストレージ。Azureの他サービスとの連携がしやすい。',
    fit: 'Azure環境で画像・文書・バックアップを保存したい企業システムに向く。',
    caution: 'AWS S3とはAPI・料金体系が異なるため、他クラウドからの移行時は設計の見直しが必要。',
  },
  minio: {
    url: 'https://min.io/',
    overview: 'S3互換のAPIを持つオープンソースのオブジェクトストレージ。自社サーバーに構築できる。',
    fit: '外部クラウドを使わず、S3と同じ操作感でファイル保存基盤を自社運用したい場合に向く。',
    caution: 'サーバーの冗長化やバックアップなど、可用性の担保を自社で設計する必要がある。',
  },
  'nas-local': {
    overview: '社内ネットワークのNASや、アプリを利用する端末内にファイルを保存する方式。',
    fit: '外部にデータを出せない社内環境や、オフライン前提のデスクトップアプリに向く。',
    caution: '遠隔地からのアクセスや冗長化が難しく、災害時のデータ保全対策が別途必要。',
  },

  // 8. AI・検索・自動化
  'openai-api': {
    url: 'https://platform.openai.com/docs',
    overview:
      'OpenAIが提供するAIモデルと開発API。テキスト生成、画像・音声入力、構造化データ出力、ツール呼び出し、ファイル検索などを利用できる。',
    fit: 'チャット、文章生成、分類、データ抽出、文書検索、外部ツールを操作するAIエージェントを短期間で実装したい場合に向く。',
    caution:
      'モデルごとに性能、速度、料金、入力上限が異なる。新規のエージェント実装ではResponses APIまたはAgents SDKを基準にし、モデル名を固定しすぎない設計にする。',
  },
  'claude-api': {
    url: 'https://www.anthropic.com/api',
    overview: 'Anthropicが提供するAIモデルのAPI。長文の読解や要約、文書に基づく応答に強みを持つ。',
    fit: '長い社内文書やマニュアルを読み込ませて、要約や問い合わせ対応をさせたい場合に向く。',
    caution: 'OpenAI APIと同様に従量課金であり、扱う文書量に応じたコスト設計が必要。',
  },
  langgraph: {
    url: 'https://www.langchain.com/langgraph',
    overview: 'AI処理を「状態を持つグラフ」として組み立てられるフレームワーク。分岐や再試行を含む複数ステップの処理を管理できる。',
    fit: '単純な一問一答ではなく、複数ステップで判断しながら動くAIエージェントを構築したい場合に向く。',
    caution: '処理フローが複雑になりやすく、設計・デバッグにAIエージェント特有のノウハウが必要。',
  },
  langchainjs: {
    url: 'https://js.langchain.com/',
    overview: 'TypeScript・JavaScript向けのAI開発フレームワーク。AIモデルと検索・外部ツールの連携を組み立てやすくする。',
    fit: 'フロントからバックエンドまでTypeScriptで統一したAI SaaSを構築したい場合に向く。',
    caution: 'アップデートが頻繁で、バージョン間の破壊的変更に注意が必要。',
  },
  n8n: {
    url: 'https://n8n.io/',
    overview: 'ノーコード・ローコードで業務フローを自動化できるワークフローツール。多数の外部SaaSとの連携ノードを持つ。',
    fit: 'Gmailやスプレッドシート、チャットツールなどをつないだ定型業務の自動化に向く。',
    caution: '複雑な条件分岐やカスタム処理が多い場合は、コードでの実装の方が保守しやすいことがある。',
  },
  rag: {
    overview: '検索（Retrieval）と生成（Generation）を組み合わせ、社内資料などの根拠文書をもとにAIが回答する構成。特定の製品ではなく設計パターン。',
    fit: 'PDFや社内資料への問い合わせに対し、出典を示しながら正確に回答させたい場合に向く。',
    caution: '検索精度が回答品質に直結するため、文書の分割方法や埋め込みモデルの選定が重要になる。',
  },
  'gemini-api': {
    url: 'https://ai.google.dev/',
    overview: 'Googleが提供する生成AIモデルのAPI。テキスト生成、画像・音声・動画入力、ストリーミング、リアルタイム処理などに対応する。',
    fit: 'Google CloudやFirebaseとの親和性を重視するAIアプリや、画像・動画などを含むマルチモーダル処理に向く。',
    caution: 'モデルごとに性能、料金、提供状態、レート制限が異なる。プレビュー版と安定版を区別し、モデル変更に対応できる構成にする。',
  },
  'vercel-ai-sdk': {
    url: 'https://ai-sdk.dev/',
    overview: '複数のAIプロバイダーを共通的なインターフェースで扱うためのTypeScript向けツールキット。React、Next.js、Vue、Svelte、Node.jsなどに対応する。',
    fit: 'Next.jsやReactを使って、AIチャット画面やツール実行型AIを短期間で構築したい場合に向く。',
    caution: 'プロバイダー固有の最新機能が、共通インターフェースへ反映されるまで時間差が生じることがある。特定モデルへの依存部分を分離して設計する。',
  },
  mcp: {
    url: 'https://modelcontextprotocol.io/',
    overview: 'AIアプリケーションと外部システムを接続するためのオープンな標準プロトコル。サーバー側から、データ、ツール、プロンプトなどをAIへ提供できる。',
    fit: '複数のAIクライアントから、社内システム、データベース、外部APIを共通方式で利用したい場合に向く。',
    caution: 'ツールへ与える権限、ユーザー認証、承認操作、入力値検証、監査ログが重要。仕様更新にも追従できるよう、プロトコル部分を分離して実装する。',
  },
  opensearch: {
    url: 'https://opensearch.org/',
    overview: '全文検索、ログ分析、フィルタ検索、ベクトル検索に対応するオープンソースの検索基盤。',
    fit: '商品検索、社内文書検索、ログ分析など、キーワード一致と意味検索の両方が必要なシステムに向く。',
    caution: 'インデックス、シャード、メモリ、検索クエリなどの設計が必要。小規模な検索ではPostgreSQLやpgvectorの方が運用しやすい場合がある。',
  },

  // 9. 公開・実行基盤・インフラ
  vercel: {
    url: 'https://vercel.com/',
    overview: 'Next.jsの開発元が提供するホスティングサービス。Gitと連携したプレビュー環境の自動生成に強みを持つ。',
    fit: 'React・Next.js・Vueなどのフロントエンドを素早く公開し、レビュー用のプレビューURLを共有したい場合に向く。',
    caution: 'サーバー処理を多く含む構成では、実行時間や料金プランの制限を事前に確認する必要がある。',
  },
  railway: {
    url: 'https://railway.app/',
    overview: 'NestJSなどのAPIサーバーやPostgreSQLを、比較的簡単な設定でデプロイできるホスティングサービス。',
    fit: 'Vercelだけでは完結しないAPI・DB込みの構成を、シンプルな手順で公開したい場合に向く。',
    caution: '大規模トラフィックへの対応やインフラの細かい制御は、AWS等の主要クラウドに比べ制限がある。',
  },
  'firebase-hosting': {
    url: 'https://firebase.google.com/docs/hosting',
    overview: 'Firebaseが提供する静的サイト・SPA向けのホスティングサービス。CDN配信とSSLが標準で付く。',
    fit: 'Flutter WebやSPAなど、静的ビルド成果物を配信したい場合に向く。',
    caution: 'サーバーサイドの動的処理が必要な場合はFirebase App HostingやCloud Functionsとの併用が必要。',
  },
  'firebase-app-hosting': {
    url: 'https://firebase.google.com/docs/app-hosting',
    overview: 'Next.jsなど動的なWebアプリを、Firebase中心の構成で公開できるホスティングサービス。',
    fit: '認証・DBなどをFirebaseで揃え、Webアプリの公開までFirebaseに寄せたい場合に向く。',
    caution:
      '利用するフレームワーク、リージョン、ビルド方式、サーバー実行機能が対応範囲に含まれるか確認する。Firebase HostingやCloud Runとの役割分担も事前に整理する。',
  },
  'cloud-run': {
    url: 'https://cloud.google.com/run',
    overview: 'Dockerコンテナ化したアプリケーションを、Google Cloud上でサーバーレスに実行できるサービス。',
    fit: 'FastAPIなどのPython APIをコンテナとして公開し、アクセス量に応じて自動でスケールさせたい場合に向く。',
    caution: 'コンテナのビルド・管理が必要なため、PaaS的なサービスに比べ最初の設定はやや手間がかかる。',
  },
  'azure-app-service': {
    url: 'https://azure.microsoft.com/en-us/products/app-service',
    overview: 'Azure上でWebアプリやAPIを公開・運用できるマネージドサービス。',
    fit: 'Azure環境で.NETやMicrosoft系の技術を使ったシステムを公開したい場合に向く。',
    caution: '他クラウドに比べ、Azure独自の設定・料金体系への理解が必要。',
  },
  'aws-cloudfront': {
    url: 'https://aws.amazon.com/cloudfront/',
    overview: 'Amazon S3、API Gateway、ロードバランサーなどを配信元として、WebコンテンツやAPIを世界各地のエッジ拠点から配信するCDN。',
    fit: '画像・動画・静的ファイルなどを、世界中のユーザーへ高速に配信したい場合に向く。',
    caution: 'キャッシュ設定を誤ると更新内容が反映されないことがあり、キャッシュ無効化の運用ルールが必要。',
  },
  'docker-compose': {
    url: 'https://docs.docker.com/compose/',
    overview: '複数のコンテナ（アプリ・DB・ストレージなど）をまとめて定義・起動できるツール。',
    fit: '1台のサーバー上でアプリ一式を低コストにセルフホストしたい場合に向く。',
    caution: '複数サーバーへのスケールや自動復旧には対応しておらず、大規模運用にはKubernetes等の検討が必要。',
  },
  caddy: {
    url: 'https://caddyserver.com/',
    overview: 'HTTPS化（証明書の自動取得・更新）とリバースプロキシ設定を簡単に行えるWebサーバー。',
    fit: 'セルフホスト環境で、手間をかけずにSSL対応した公開URLを用意したい場合に向く。',
    caution: 'Nginx等に比べ情報量・実績はやや少なく、高度なチューニングが必要な場合は情報収集に工夫が要る。',
  },
  kubernetes: {
    url: 'https://kubernetes.io/',
    overview: '複数サーバー上でコンテナを自動配置・スケール・障害復旧させる基盤。大規模システムの運用標準の一つ。',
    fit: 'アクセス規模が大きく、高可用性が求められるシステムの本番運用に向く。',
    caution: '構築・運用の学習コストが高く、小〜中規模のシステムにはオーバースペックになりやすい。',
  },
  vps: {
    overview: '仮想専用サーバー。n8nや独自APIなど、常時稼働させたいプロセスを配置する基盤として使う。',
    fit: 'サーバーレスでは実現しにくい常駐プロセス（ワークフローツールのサーバーなど）を動かしたい場合に向く。',
    caution: 'OSやミドルウェアのアップデート・セキュリティ対応を自社で継続的に行う必要がある。',
  },
  'app-store-google-play': {
    overview: 'iOS・Androidアプリをユーザーへ配布するための公式ストア。',
    fit: 'モバイルアプリを一般ユーザー向けに正式配布したい場合には必須の経路。',
    caution: '審査基準への対応やリリースサイクルの管理が必要で、公開までに一定の期間がかかる。',
  },
  eas: {
    url: 'https://docs.expo.dev/eas/',
    overview: 'Expo製のReact Nativeアプリを、クラウド上でビルドしてストアへ配布できるサービス（Expo Application Services）。',
    fit: '手元でネイティブビルド環境を用意せず、React Nativeアプリをストア配布したい場合に向く。',
    caution: 'ビルドの実行回数や時間に応じたプランの確認が必要。',
  },
  'onpremise-server': {
    overview: '外部のクラウドサービスを使わず、社内設備内に設置したサーバーでシステムを運用する形態。',
    fit: 'データを外部に出せない規制や、既存の社内インフラを活用したい場合に向く。',
    caution: 'サーバーの調達・保守・災害対策を自社で担う必要があり、運用負荷とコストが大きい。',
  },
  'cloudflare-workers': {
    url: 'https://developers.cloudflare.com/workers/',
    overview: 'Cloudflareのグローバルネットワーク上で、JavaScript、TypeScriptなどの処理を実行できるサーバーレス基盤。',
    fit: '低遅延なAPI、Webhook、認証処理、画像変換、キャッシュ制御、軽量なフルスタックアプリに向く。',
    caution: '一般的なNode.jsサーバーとは実行環境や制限が異なる。利用するライブラリの互換性、CPU時間、メモリ、外部通信などの制限を確認する。',
  },

  // 10. 開発方式・品質・監視
  'custom-dev': {
    overview: '既存パッケージに頼らず、業務要件に合わせて管理画面・データ構造・処理ルールを個別に設計・実装する開発方式。',
    fit: '業務フローの独自性が高く、既存SaaSでは業務に合わせきれない場合に向く。',
    caution: '開発・保守の工数が大きくなりやすく、要件の見極めと段階的な開発計画が重要。',
  },
  'ai-coding': {
    overview: 'AIにコードの生成・修正・テストなどを支援させながら開発を進める方式。特定の製品ではなく開発スタイル。',
    fit: '限られた人員・期間でMVPや初期構築を素早く進めたい場合に向く。',
    caution:
      'AIが生成したコードであっても、最終的な品質と権利は開発側が管理する。コードレビュー、テスト、依存ライブラリ確認、秘密情報の混入防止、セキュリティ診断を開発工程に組み込む必要がある。',
  },
  'existing-saas': {
    overview: '認証・決済・メール配信・ファイル保管といった機能を、自前実装せず既存の外部SaaSで補う方式。',
    fit: '開発リソースを独自の価値提供部分に集中させ、周辺機能は実績あるSaaSに任せたい場合に向く。',
    caution: '外部SaaSの障害・仕様変更・料金改定の影響を受けるため、利用規約や可用性の確認が必要。',
  },
  'github-actions': {
    url: 'https://docs.github.com/en/actions',
    overview: 'GitHubリポジトリ内でCI/CDや各種自動処理を実行できるワークフロー機能。',
    fit: 'コードの更新時にテストやビルドを実行し、Vercel、AWS、VPSなどへ自動デプロイしたい場合に向く。',
    caution: '秘密情報はGitHub Secretsなどで管理し、外部から取得したActionのバージョンを固定する。実行時間や同時実行数による料金も確認する。',
  },
  sentry: {
    url: 'https://sentry.io/',
    overview: 'フロントエンド、バックエンド、モバイルアプリなどのエラー情報やパフォーマンス情報を収集・分析する監視サービス。',
    fit: '利用者の環境で発生したエラーを再現しにくいWebサービス、SaaS、モバイルアプリに向く。',
    caution: '個人情報や入力内容が意図せず送信されないよう、収集対象を設定する。イベント数が多い場合はサンプリングと料金管理も必要。',
  },

  // 11. UI・デザイン基盤
  'shadcn-ui': {
    url: 'https://ui.shadcn.com/',
    overview:
      'Radix UIをベースにした、あらかじめスタイリングされたコンポーネント集。npmパッケージとしてではなく、ソースコードを直接プロジェクトへコピーして使う点が特徴。',
    fit: 'デザインを自由にカスタマイズしたい、Tailwind CSSを使ったReactプロジェクトに向く。',
    caution: '通常のnpmパッケージと異なりコンポーネントのアップデートは手動反映が必要。Tailwind CSS前提のため、他のCSS設計との併用にはひと手間かかる。',
  },
  mui: {
    url: 'https://mui.com/',
    overview: 'Googleが提唱するMaterial Designに基づいたReact向けUIライブラリ。フォーム、テーブル、ダイアログなど業務画面に必要な部品がほぼ揃っている。',
    fit: 'デザインを一から作り込む時間がなく、統一感のある管理画面を素早く構築したい業務システムに向く。',
    caution: 'Material Design特有の見た目になりやすく、独自ブランドの世界観を強く出したい場合はカスタマイズの手間が増える。',
  },
  'chakra-ui': {
    url: 'https://www.chakra-ui.com/',
    overview: 'アクセシビリティ対応とスタイルの組み合わせやすさを重視したReact UIライブラリ。propsベースで見た目を柔軟に調整できる。',
    fit: 'アクセシビリティ品質を確保しつつ、独自のデザインにも寄せたいプロジェクトに向く。',
    caution: 'MUIほど業務向けの高機能コンポーネント（高度なテーブル等）は揃っておらず、複雑な部品は自作が必要になることがある。',
  },
  'ant-design': {
    url: 'https://ant.design/',
    overview: '中国Alibabaが開発する、エンタープライズ業務システム向けのReact UIライブラリ。高機能なテーブルやフォームバリデーションが標準で揃う。',
    fit: '管理画面・業務システムなど、複雑な一覧表示や入力フォームを多く扱うシステムに向く。',
    caution: 'デザインの独自性を出しにくく、コンポーネントの見た目のカスタマイズ自由度はMUIやChakra UIよりも低め。',
  },
  'radix-ui': {
    url: 'https://www.radix-ui.com/',
    overview:
      'ダイアログやドロップダウンなど、操作・アクセシビリティのロジックだけを提供し、見た目は一切持たないUIプリミティブ集。shadcn/uiの内部でも採用されている。',
    fit: '独自デザインシステムをゼロから構築したいプロジェクトで、複雑な操作ロジック（フォーカス管理等）だけを任せたい場合に向く。',
    caution: '見た目のスタイリングはすべて自前で行う必要があり、MUIやAnt Designのようにすぐ使える完成品ではない。',
  },
  vuetify: {
    url: 'https://vuetifyjs.com/',
    overview: 'Vue.js向けのMaterial Design UIライブラリ。フォーム、ナビゲーション、レイアウトなど画面部品が豊富に揃う。',
    fit: 'Vueを採用したプロジェクトで、デザインを作り込まずに統一感のある画面を構築したい場合に向く。',
    caution: 'Material Designの見た目が前面に出やすく、独自ブランドを強く出したい場合はカスタマイズが必要。',
  },
  'angular-material': {
    url: 'https://material.angular.io/',
    overview: 'Angularチームが公式にメンテナンスするUIコンポーネントライブラリ。Angularのフォーム機能やアクセシビリティ機能と統合されている。',
    fit: 'Angularを採用した企業システムで、公式サポートのある安定したUI部品を使いたい場合に向く。',
    caution: 'Angular専用のため、他のフレームワークへの移植や流用はできない。',
  },
  'tailwind-css': {
    url: 'https://tailwindcss.com/',
    overview:
      'コンポーネント集ではなく、余白・色・文字サイズなどをクラス名の組み合わせで指定するユーティリティファーストのCSSフレームワーク。',
    fit: '既製のデザインに縛られず、独自のデザインシステムを効率的にコーディングしたい、ほぼすべてのフロントエンド構成に向く。',
    caution: 'コンポーネントの機能（操作ロジック）自体は提供しないため、複雑な部品はshadcn/uiやRadix UIなど別のライブラリと組み合わせるのが一般的。',
  },
  bootstrap: {
    url: 'https://getbootstrap.com/',
    overview: '古くから使われている定番のUIフレームワーク。CSSクラスとJavaScriptで構成され、特定のJSフレームワークに依存せず利用できる。',
    fit: '特定のJSフレームワークに縛られない社内ツールや、素早く見た目を整えたい小規模なシステムに向く。',
    caution: '近年のReact/Vue中心の開発では、コンポーネント志向の他ライブラリに比べて設計思想がやや古く感じられることがある。',
  },
};
