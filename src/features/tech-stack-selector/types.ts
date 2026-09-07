export type PatternId = string;

export type Pattern = {
  id: PatternId;
  name: string;
};

export type TechElement = {
  id: string;
  name: string;
  description: string;
  patternIds: PatternId[];
};

export type TechCategory = {
  id: string;
  order: number;
  title: string;
  elements: TechElement[];
};

// カテゴリID -> 選択した要素IDの配列（同一カテゴリ内でも複数選択可）
export type Selection = Record<string, string[]>;

export type PatternMatch = {
  pattern: Pattern;
  matchedCount: number;
  totalSelected: number;
  isPerfectMatch: boolean;
};

// =========================================================
// Tech診断（自由文からの要件抽出→システム方式・技術構成診断）
// 上記 Pattern/TechElement/Selection 系は既存の技術者向け手動選択機能用として維持し、
// 以下は新しい診断フロー専用の型として独立させる。
// =========================================================

export type RequirementKey =
  | 'purpose'
  | 'primary_users'
  | 'user_count'
  | 'primary_device'
  | 'usage_location'
  | 'public_access'
  | 'login_required'
  | 'stored_data'
  | 'data_relations'
  | 'file_usage'
  | 'search_aggregation'
  | 'external_integration'
  | 'ai_usage'
  | 'automation'
  | 'realtime'
  | 'offline_usage'
  | 'notifications'
  | 'scheduled_jobs'
  | 'processing_volume'
  | 'expected_scale'
  | 'security_requirement'
  | 'company_environment'
  | 'cloud_preference'
  | 'cost_condition'
  | 'ops_tolerance'
  | 'future_expansion';

export type RequirementStatus = 'confirmed' | 'inferred' | 'unknown';

export type RequirementItem = {
  key: RequirementKey;
  /** 単一値・複数値どちらも許容する（項目により意味が異なる） */
  value: string | string[] | number | boolean | null;
  status: RequirementStatus;
  /** inferred時のみ想定。0〜1 */
  confidence?: number;
};

// キーが存在しない項目は「未取得」を表す（unknownと区別: そもそも抽出処理が触れていない）
export type RequirementProfile = Partial<Record<RequirementKey, RequirementItem>>;

export type SystemModeId =
  | 'P01' | 'P02' | 'P03' | 'P04' | 'P05' | 'P06' | 'P07' | 'P08'
  | 'P09' | 'P10'
  | 'P11' | 'P12'
  | 'P13' | 'P14' | 'P15'
  | 'P20' | 'P21' | 'P22' | 'P23';

export type TechStackRoles = {
  frontend: string[];
  backend: string[];
  database: string[];
  auth: string[];
  storage: string[];
};

export type SystemMode = {
  id: SystemModeId;
  name: string;
  groupLabel: string;
  summary: string;
  /** 各役割の候補技術要素id（ELEMENT_DETAILSのキーと対応、優先順） */
  structure: TechStackRoles;
  /** 移行元の旧パターンid（表示には使わない、回帰確認用の記録） */
  legacyPatternIds: string[];
};

export type AiCapabilityId = 'ai-text' | 'ai-chat-rag' | 'ai-agent' | 'ai-automation';

export type AiCapability = {
  id: AiCapabilityId;
  name: string;
  summary: string;
  /** 追加技術要素id（ELEMENT_DETAILSのキーと対応） */
  elements: string[];
  legacyPatternIds: string[];
};

export type HostingCategory = 'web-hosting' | 'cloud-infra';

export type HostingProviderId =
  | 'cloudflare-workers'
  | 'vercel'
  | 'firebase-hosting'
  | 'firebase-app-hosting'
  | 'aws-amplify'
  | 'railway'
  | 'render'
  | 'cloud-run'
  | 'aws-app-runner'
  | 'aws-ecs'
  | 'azure-app-service'
  | 'azure-container-apps'
  | 'vps';

export type HostingProvider = {
  id: HostingProviderId;
  name: string;
  category: HostingCategory;
  summary: string;
  url?: string;
};

export type CostCondition = 'free_tier_first' | 'low_cost' | 'ops_ease' | 'reliability_first';
export type CloudPreference = 'none' | 'aws' | 'gcp' | 'azure' | 'onpremise';

export type HostingRule = {
  providerId: HostingProviderId;
  applicableModes: SystemModeId[];
  /** フロントエンド/バックエンド技術要素idによる加点条件（いずれか一致で加点） */
  favoredByElementIds?: string[];
  costCondition?: CostCondition[];
  cloudPreference?: CloudPreference[];
  baseScore: number;
};

export type FollowUpQuestionOption = {
  value: string;
  label: string;
};

export type FollowUpQuestion = {
  key: RequirementKey;
  question: string;
  options: FollowUpQuestionOption[];
};

export type StackResolution = {
  frontend: string;
  backend?: string;
  database: string;
  auth: string;
  storage?: string;
  ai?: string;
};

export type HostingResolution = {
  primary: HostingProviderId;
  alternatives: HostingProviderId[];
  futureNote?: string;
};

export type SystemModeMatch = {
  mode: SystemMode;
  score: number;
  reasons: string[];
};

export type RequirementRuleOperator = '=' | '!=' | 'includes' | 'gte' | 'lte';

export type ModeScoringRule = {
  id: string;
  conditionKey: RequirementKey;
  operator: RequirementRuleOperator;
  conditionValue: string | number;
  targetId: SystemModeId;
  score: number;
  reason: string;
};

export type ModeExclusionRule = {
  id: string;
  conditionKey: RequirementKey;
  operator: RequirementRuleOperator;
  conditionValue: string | number;
  targetId: SystemModeId;
  reason: string;
};

export type TechDiagnosisResult = {
  primaryMode: SystemMode;
  alternativeModes: SystemMode[];
  aiCapabilities: AiCapability[];
  stack: StackResolution;
  hosting: HostingResolution;
  reasons: string[];
  requirementProfile: RequirementProfile;
};
