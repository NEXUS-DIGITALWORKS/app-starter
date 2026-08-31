// 24項目のRequirementProfileをClaudeのstrict tool useで抽出するための入力スキーマ。
// フロント側の src/features/tech-stack-selector/types.ts の RequirementKey と一対一対応する。
// enumValues を指定した項目は列挙値、指定しない項目は自由記述として扱う。

type FieldDef = {
  key: string;
  description: string;
  enumValues?: string[];
  isArray?: boolean;
};

const ENUM_FIELDS: FieldDef[] = [
  { key: 'primary_device', description: '主に使う端末', enumValues: ['pc_browser', 'smartphone', 'tablet', 'desktop_app', 'multiple'] },
  { key: 'public_access', description: '外部公開の範囲', enumValues: ['internal_only', 'remote_staff', 'external_customers', 'public'] },
  { key: 'login_required', description: 'ログインの要否', enumValues: ['required', 'not_required'] },
  { key: 'data_relations', description: 'データ同士の関係性の複雑さ', enumValues: ['simple', 'relational', 'complex'] },
  { key: 'file_usage', description: '画像・PDF・ファイル利用の要否', enumValues: ['required', 'not_required'] },
  { key: 'search_aggregation', description: '検索・集計機能の要否', enumValues: ['required', 'not_required'] },
  { key: 'external_integration', description: '外部サービス連携の要否', enumValues: ['required', 'not_required'] },
  { key: 'ai_usage', description: 'AIを使いたい用途（複数可）', enumValues: ['text_generation', 'chat_rag', 'agent', 'automation'], isArray: true },
  { key: 'automation', description: '処理を自動実行したい頻度', enumValues: ['manual', 'on_action', 'scheduled'] },
  { key: 'realtime', description: '複数人同時利用・即時反映の要否', enumValues: ['required', 'not_required'] },
  { key: 'offline_usage', description: 'オフライン利用の要否', enumValues: ['required', 'not_required'] },
  { key: 'notifications', description: 'メール・プッシュ通知の要否', enumValues: ['required', 'not_required'] },
  { key: 'scheduled_jobs', description: '定期処理（日次・時次等）の要否', enumValues: ['required', 'not_required'] },
  { key: 'processing_volume', description: '処理するデータ量・アクセス量の規模感', enumValues: ['small', 'medium', 'large'] },
  { key: 'expected_scale', description: '将来的な想定利用規模', enumValues: ['small', 'medium', 'large'] },
  { key: 'security_requirement', description: 'セキュリティ要求の高さ', enumValues: ['standard', 'high'] },
  { key: 'company_environment', description: '会社から指定されているクラウド・システム環境', enumValues: ['none', 'aws', 'gcp', 'azure', 'onpremise'] },
  { key: 'cloud_preference', description: '利用したいクラウドの希望（会社指定とは別の希望があれば）', enumValues: ['none', 'aws', 'gcp', 'azure', 'onpremise'] },
  { key: 'cost_condition', description: '費用面で優先したいこと', enumValues: ['free_tier_first', 'low_cost', 'ops_ease', 'reliability_first'] },
  { key: 'ops_tolerance', description: 'サーバー運用にかけられる手間', enumValues: ['none', 'light', 'dedicated'] },
];

const FREE_TEXT_FIELDS: FieldDef[] = [
  { key: 'purpose', description: '目的・解決したい課題（要約）' },
  { key: 'primary_users', description: '主な利用者' },
  { key: 'user_count', description: 'おおよその利用人数' },
  { key: 'usage_location', description: '利用場所' },
  { key: 'stored_data', description: '保存したいデータ' },
  { key: 'future_expansion', description: '将来の拡張予定' },
];

function fieldSchema(field: FieldDef) {
  const valueSchema = field.isArray
    ? { type: ['array', 'null'], items: { type: 'string', enum: field.enumValues } }
    : field.enumValues
      ? { type: ['string', 'null'], enum: [...field.enumValues, null] }
      : { type: ['string', 'null'] };

  return {
    type: 'object',
    description: field.description,
    properties: {
      status: { type: 'string', enum: ['confirmed', 'inferred', 'unknown'] },
      value: valueSchema,
      confidence: { type: ['number', 'null'], description: 'statusがinferredの場合の確信度(0〜1)' },
    },
    required: ['status', 'value', 'confidence'],
    additionalProperties: false,
  };
}

const ALL_FIELDS = [...ENUM_FIELDS, ...FREE_TEXT_FIELDS];

export const EXTRACT_REQUIREMENTS_TOOL = {
  name: 'extract_requirements',
  description:
    '自由文からTech診断に必要な要件項目を抽出する。文章から明確に読み取れる項目はstatus=confirmed、推測できる項目はstatus=inferred（confidenceも設定）、読み取れない項目はstatus=unknown・value=nullとする。',
  input_schema: {
    type: 'object',
    properties: Object.fromEntries(ALL_FIELDS.map((field) => [field.key, fieldSchema(field)])),
    required: ALL_FIELDS.map((field) => field.key),
    additionalProperties: false,
  },
  strict: true,
};
