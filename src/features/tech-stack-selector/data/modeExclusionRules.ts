import type { ModeExclusionRule } from '../types';

// クラウド前提の構成とオンプレミス指定など、明確に両立しない組み合わせのみを除外する。
// 迷わせないための最小限のルールに留め、過度な除外で診断が破綻しないようにする。
export const MODE_EXCLUSION_RULES: ModeExclusionRule[] = [
  {
    id: 'mx-01',
    conditionKey: 'company_environment',
    operator: '=',
    conditionValue: 'onpremise',
    targetId: 'P01',
    reason: 'かんたんWebアプリはSupabase等の外部クラウド前提のため、オンプレミス指定と両立しない',
  },
  {
    id: 'mx-02',
    conditionKey: 'company_environment',
    operator: '=',
    conditionValue: 'onpremise',
    targetId: 'P07',
    reason: 'リアルタイムWebアプリはFirebase/Supabase等の外部クラウド前提のため、オンプレミス指定と両立しない',
  },
  {
    id: 'mx-03',
    conditionKey: 'company_environment',
    operator: '=',
    conditionValue: 'onpremise',
    targetId: 'P08',
    reason: 'オフライン対応WebアプリはFirebase前提のため、オンプレミス指定と両立しない',
  },
  {
    id: 'mx-04',
    conditionKey: 'offline_usage',
    operator: '=',
    conditionValue: 'required',
    targetId: 'P06',
    reason: '公開Webサイト・ブログはオンライン閲覧前提のため、オフライン利用が必須の要件とは両立しない',
  },
  {
    id: 'mx-05',
    conditionKey: 'primary_device',
    operator: '=',
    conditionValue: 'desktop_app',
    targetId: 'P06',
    reason: '公開Webサイト・ブログは不特定多数への公開が前提のため、PC専用アプリ利用の要件とは噛み合わない',
  },
];
