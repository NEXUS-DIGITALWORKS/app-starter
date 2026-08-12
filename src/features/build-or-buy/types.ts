import type { SaasProduct } from './data/saasProducts'

export type AnswerType = 'free_text' | 'single' | 'multi' | 'number'

export type QuestionOption = {
  value: string
  label: string
  description?: string
  /** 自作寄りなら正、購入(SaaS)寄りなら負。build_or_buyのbuildScoreに加算する */
  buildWeight?: number
  /** 強制ルールで参照するフラグ（決済領域など） */
  flags?: string[]
}

export type Question = {
  id: string
  order: number
  category: string
  question: string
  description?: string
  /** 専門知識が要る質問向けの「わからない場合はこれでOK」ガイド */
  notSureHint?: string
  answerType: AnswerType
  options?: QuestionOption[]
  required?: boolean
}

/** 全ての回答はUI側の既存パターンに合わせ string[] で保持する */
export type Answers = Record<string, string[]>

export type AppType = {
  id: string
  name: string
  description: string
  examples: string[]
  enabled: boolean
}

export type ArchitecturePatternId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9'

export type ArchitecturePattern = {
  id: ArchitecturePatternId
  name: string
  description: string
  complexityLevel: number
  suitableConditions: string[]
  unsuitableConditions: string[]
  candidates: string[]
}

export type TechRole =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'auth'
  | 'storage'
  | 'search'
  | 'ai'
  | 'automation'
  | 'hosting'
  | 'monitoring'

export type StackProfile = {
  id: string
  name: string
  appTypeIds: string[]
  patternId: ArchitecturePatternId
  roles: Partial<Record<TechRole, string>>
}

export type RuleOperator = '=' | '!=' | 'includes' | 'gte' | 'lte'

export type ScoringRule = {
  id: string
  conditionKey: string
  operator: RuleOperator
  conditionValue: string | number
  targetType: 'architecture_pattern'
  targetId: ArchitecturePatternId
  score: number
  reason: string
}

export type ExclusionRule = {
  id: string
  conditionKey: string
  operator: RuleOperator
  conditionValue: string | number
  targetType: 'architecture_pattern'
  targetId: ArchitecturePatternId
  reason: string
}

export type RiskSeverity = '低' | '中' | '高'

export type RiskRule = {
  id: string
  riskType: 'ロックイン' | 'セキュリティ' | '運用' | '保守性' | '費用' | 'データ移行' | '拡張性' | '障害時対応'
  severity: RiskSeverity
  message: string
  mitigation: string
  matches: (answers: Answers, ctx: { category: BuildOrBuyCategory; patternId: ArchitecturePatternId }) => boolean
}

export type BuildOrBuyCategory = 'A' | 'B' | 'C' | 'D' | 'E'

export type ScoreContribution = {
  label: string
  weight: number
}

export type BuildOrBuyResult = {
  category: BuildOrBuyCategory
  label: string
  buildScore: number
  hardFlags: string[]
  /** buildScoreの内訳。回答ごとの寄与を判定根拠として提示するために保持する */
  scoreBreakdown: ScoreContribution[]
}

export type ArchitectureScoreResult = {
  patternId: ArchitecturePatternId
  score: number
  excluded: boolean
}

export type RiskFinding = {
  riskType: RiskRule['riskType']
  severity: RiskSeverity
  message: string
  mitigation: string
}

export type FitScoreAxis = {
  label: string
  value: number
  color: string
}

export type FitScore = {
  overall: number
  axes: FitScoreAxis[]
}

export type RankedPattern = {
  pattern: ArchitecturePattern
  score: number
}

export type CostEstimate = {
  horizonYears: number
  /** 中心SaaSの月額費用目安（円）。SaaSを推奨していない場合はundefined */
  saasMonthlyCost?: number
  saasTotalOverHorizon?: number
  /** AIコーディング前提の初期開発期間の目安（週） */
  buildDevWeeksRange: [number, number]
  /** 自作した場合の運用（ホスティング等）月額費用の目安（円） */
  buildMonthlyHostingCostRange: [number, number]
  buildHostingTotalOverHorizon: [number, number]
  note: string
}

export type DiagnosisResult = {
  appTypeId: string
  buildOrBuy: BuildOrBuyResult
  /** 自由記述の課題（q_problem）をそのまま保持 */
  problemStatement: string
  /** この構成によって解決されること（回答に基づく具体的な効果） */
  solvedOutcomes: string[]
  /** category が A/B/C の場合の中心SaaS候補（最大2件、第1候補が本命） */
  recommendedSaas: SaasProduct[]
  /** 中心SaaSが既に利用中のものか、新規導入が必要かの区分 */
  saasAdoptionStatus?: 'existing' | 'new'
  /** category が E の場合の代替提案（例: 決済代行サービスの利用） */
  nonRecommendAlternative?: string
  costEstimate: CostEstimate
  buildRange: string[]
  externalRange: string[]
  primaryPattern: ArchitecturePattern
  alternativePattern?: ArchitecturePattern
  /** 上位3件のアーキテクチャパターン（代替案表示用） */
  rankedPatterns: RankedPattern[]
  /** 1位と2位のスコア差が僅かで、複数パターンが拮抗している場合true */
  isCloseCall: boolean
  /** 参考指標としての0-100スコア（表示専用、判定ロジックには影響しない） */
  fitScore: FitScore
  primaryStack?: StackProfile
  reasons: string[]
  notAdopted: { name: string; reason: string }[]
  aiCodingFit: 'high' | 'medium' | 'low'
  aiCodingScope: { aiCapable: string[]; expertReview: string[] }
  risks: RiskFinding[]
  nextSteps: string[]
  answeredAt: string
}
