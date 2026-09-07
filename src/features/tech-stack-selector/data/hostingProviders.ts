import type { HostingProvider } from '../types';

// 「Web公開・アプリ実行」と「クラウド・インフラ基盤」を役割で分離したもの。
// 既存 data/categories.ts の hosting カテゴリでは両者が同じ粒度で並んでいたため、
// 診断エンジンではこちらを一次情報として使う（要素説明自体は elementDetails.ts と重複可）。
export const HOSTING_PROVIDERS: HostingProvider[] = [
  {
    id: 'cloudflare-workers',
    name: 'Cloudflare Workers',
    category: 'web-hosting',
    summary: '世界各地のエッジ環境でAPI・Webアプリを低価格・低遅延に実行できるサーバーレス基盤',
    url: 'https://developers.cloudflare.com/workers/',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'web-hosting',
    summary: 'Next.jsなどのフロントエンドを、プレビュー環境つきで簡単に公開できるホスティングサービス',
    url: 'https://vercel.com/',
  },
  {
    id: 'firebase-hosting',
    name: 'Firebase Hosting',
    category: 'web-hosting',
    summary: '静的サイト・SPAをCDN配信で公開する、Firebase標準のホスティングサービス',
    url: 'https://firebase.google.com/docs/hosting',
  },
  {
    id: 'firebase-app-hosting',
    name: 'Firebase App Hosting',
    category: 'web-hosting',
    summary: 'Next.jsなど動的なWebアプリを、Firebase中心の構成のまま公開できるサービス',
    url: 'https://firebase.google.com/docs/app-hosting',
  },
  {
    id: 'aws-amplify',
    name: 'AWS Amplify Hosting',
    category: 'web-hosting',
    summary: 'AWS環境と連携した認証・API・ホスティングを一体で構築できるフロントエンド公開サービス',
    url: 'https://aws.amazon.com/amplify/hosting/',
  },
  {
    id: 'railway',
    name: 'Railway',
    category: 'web-hosting',
    summary: 'APIサーバーやDBを含む構成を、比較的簡単な設定でまとめて公開できるホスティングサービス',
    url: 'https://railway.app/',
  },
  {
    id: 'render',
    name: 'Render',
    category: 'web-hosting',
    summary: 'Web・API・定期処理・DBをまとめて運用できる、設定のシンプルなクラウドホスティング',
    url: 'https://render.com/',
  },
  {
    id: 'cloud-run',
    name: 'Cloud Run',
    category: 'web-hosting',
    summary: 'Dockerコンテナ化したアプリをGoogle Cloud上でサーバーレスに実行できるサービス',
    url: 'https://cloud.google.com/run',
  },
  {
    id: 'aws-app-runner',
    name: 'AWS App Runner',
    category: 'web-hosting',
    summary: 'コンテナ・ソースコードから、AWS上でWebアプリ・APIを簡単な設定で公開できるサービス',
    url: 'https://aws.amazon.com/apprunner/',
  },
  {
    id: 'aws-ecs',
    name: 'AWS ECS / Fargate',
    category: 'web-hosting',
    summary: '本格的なコンテナ運用をAWS上で行う、拡張性・制御性を重視したサービス',
    url: 'https://aws.amazon.com/ecs/',
  },
  {
    id: 'azure-app-service',
    name: 'Azure App Service',
    category: 'web-hosting',
    summary: 'Azure上でWebアプリ・APIを公開・運用できるマネージドサービス',
    url: 'https://azure.microsoft.com/en-us/products/app-service',
  },
  {
    id: 'azure-container-apps',
    name: 'Azure Container Apps',
    category: 'web-hosting',
    summary: 'Azure上でコンテナ化したアプリをサーバーレスに実行できるサービス',
    url: 'https://azure.microsoft.com/en-us/products/container-apps',
  },
  {
    id: 'vps',
    name: 'VPS / クラウドVM',
    category: 'cloud-infra',
    summary: '常時稼働させたいプロセスを自分で配置・管理する仮想専用サーバー',
    url: undefined,
  },
];

export const HOSTING_PROVIDER_MAP: Record<string, HostingProvider> = Object.fromEntries(
  HOSTING_PROVIDERS.map((provider) => [provider.id, provider]),
);
