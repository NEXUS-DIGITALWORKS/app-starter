import type { RequirementKey } from '../types';

export type RequirementKeyDef = {
  key: RequirementKey;
  label: string;
  /** 自由文からの抽出結果を人間向けに表示する際の短い説明 */
  description: string;
};

// STEP2（自由文からの要件抽出）が埋めようとする24項目。
// 各項目の実際の値は RequirementProfile 側（confirmed/inferred/unknown）で管理する。
export const REQUIREMENT_KEY_DEFS: RequirementKeyDef[] = [
  { key: 'purpose', label: '目的・解決したい課題', description: '何のために作るか、どんな課題を解決したいか' },
  { key: 'primary_users', label: '主な利用者', description: '誰が主に使うか（社員・顧客・特定の担当者など）' },
  { key: 'user_count', label: '利用人数', description: 'おおよその利用人数' },
  { key: 'primary_device', label: '利用端末', description: 'PCブラウザ・スマホ・タブレット・専用端末など' },
  { key: 'usage_location', label: '利用場所', description: '社内・自宅外出先・現場など' },
  { key: 'public_access', label: '外部公開の有無', description: '社内限定か、社外の人も使うか' },
  { key: 'login_required', label: 'ログインの必要性', description: 'ログイン・会員管理が必要か' },
  { key: 'stored_data', label: '保存するデータ', description: '何のデータを保存・管理したいか' },
  { key: 'data_relations', label: 'データ同士の関係性', description: 'データ同士が複雑に関連するか、単純な記録中心か' },
  { key: 'file_usage', label: '画像・PDF・ファイル利用', description: '画像やファイルの保存・添付が必要か' },
  { key: 'search_aggregation', label: '検索・集計', description: '検索や集計・レポート機能が必要か' },
  { key: 'external_integration', label: '外部サービス連携', description: '既存の他システム・SaaSと連携するか' },
  { key: 'ai_usage', label: 'AI利用', description: '文章生成・チャット・自動処理など、AIを使いたいか' },
  { key: 'automation', label: '自動処理', description: '操作なしで自動的に処理を実行したいか' },
  { key: 'realtime', label: 'リアルタイム性', description: '複数人での同時利用・即時反映が必要か' },
  { key: 'offline_usage', label: 'オフライン利用', description: '電波のない環境でも使いたいか' },
  { key: 'notifications', label: '通知', description: 'メール・プッシュ通知が必要か' },
  { key: 'scheduled_jobs', label: '定期処理', description: '毎日・毎時間などの定期実行が必要か' },
  { key: 'processing_volume', label: '処理量', description: '扱うデータ量・アクセス量の規模感' },
  { key: 'expected_scale', label: '想定利用規模', description: '将来的にどこまで規模が大きくなりそうか' },
  { key: 'security_requirement', label: 'セキュリティ要求', description: '特別なセキュリティ・監査要件があるか' },
  { key: 'company_environment', label: '会社指定環境', description: '会社で既に指定されているクラウド・システム環境' },
  { key: 'cloud_preference', label: 'クラウド指定', description: '利用したい・避けたいクラウドの希望' },
  { key: 'cost_condition', label: 'コスト条件', description: '費用面で優先したいこと' },
  { key: 'ops_tolerance', label: 'サーバー運用許容度', description: '運用・保守にどこまで手間をかけられるか' },
  { key: 'future_expansion', label: '将来の拡張予定', description: '将来的な機能追加・規模拡大の見込み' },
];

export const REQUIREMENT_KEY_DEF_MAP: Record<RequirementKey, RequirementKeyDef> = Object.fromEntries(
  REQUIREMENT_KEY_DEFS.map((def) => [def.key, def]),
) as Record<RequirementKey, RequirementKeyDef>;
