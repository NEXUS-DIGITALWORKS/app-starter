import type { HostingRule } from '../types';

// 公開・実行基盤の選定ルール。favoredByElementIdsはSystemModeのfrontend/backend候補と
// 重なった場合に加点する（例: react-vite中心の構成ならCloudflare/Vercelが有利になる）。
// costCondition/cloudPreferenceは要件（RequirementProfile）からの補正に使う。
export const HOSTING_RULES: HostingRule[] = [
  {
    providerId: 'cloudflare-workers',
    applicableModes: ['P01', 'P02', 'P03', 'P06', 'P20'],
    favoredByElementIds: ['react-vite', 'vue-vite', 'sveltekit', 'astro', 'hono'],
    costCondition: ['free_tier_first', 'low_cost'],
    baseScore: 5,
  },
  {
    providerId: 'vercel',
    applicableModes: ['P04', 'P05', 'P09'],
    favoredByElementIds: ['nextjs'],
    costCondition: ['ops_ease'],
    baseScore: 5,
  },
  {
    providerId: 'firebase-hosting',
    applicableModes: ['P08', 'P12'],
    favoredByElementIds: ['pwa', 'flutter', 'capacitor'],
    cloudPreference: ['none', 'gcp'],
    baseScore: 3,
  },
  {
    providerId: 'firebase-app-hosting',
    applicableModes: ['P07', 'P11'],
    favoredByElementIds: ['nextjs', 'flutter', 'react-native-expo'],
    cloudPreference: ['none', 'gcp'],
    baseScore: 4,
  },
  {
    providerId: 'aws-amplify',
    applicableModes: ['P09', 'P21'],
    cloudPreference: ['aws'],
    baseScore: 4,
  },
  {
    providerId: 'railway',
    applicableModes: ['P04', 'P05', 'P09', 'P10'],
    favoredByElementIds: ['nestjs', 'fastapi'],
    costCondition: ['low_cost', 'ops_ease'],
    baseScore: 3,
  },
  {
    providerId: 'render',
    applicableModes: ['P04', 'P09', 'P10'],
    costCondition: ['low_cost', 'ops_ease'],
    baseScore: 3,
  },
  {
    providerId: 'cloud-run',
    applicableModes: ['P10', 'P20', 'P21', 'P22'],
    favoredByElementIds: ['fastapi', 'nestjs'],
    cloudPreference: ['gcp'],
    baseScore: 4,
  },
  {
    providerId: 'aws-app-runner',
    applicableModes: ['P09', 'P21'],
    cloudPreference: ['aws'],
    baseScore: 3,
  },
  {
    providerId: 'aws-ecs',
    applicableModes: ['P21', 'P22'],
    cloudPreference: ['aws'],
    costCondition: ['reliability_first'],
    baseScore: 4,
  },
  {
    providerId: 'azure-app-service',
    applicableModes: ['P09', 'P21', 'P23'],
    cloudPreference: ['azure'],
    baseScore: 4,
  },
  {
    providerId: 'azure-container-apps',
    applicableModes: ['P21', 'P22'],
    cloudPreference: ['azure'],
    baseScore: 3,
  },
  {
    providerId: 'vps',
    applicableModes: ['P20', 'P23'],
    costCondition: ['low_cost'],
    baseScore: 4,
  },
];
