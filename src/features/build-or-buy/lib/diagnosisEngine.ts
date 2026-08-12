import type {
  Answers,
  ArchitecturePattern,
  ArchitecturePatternId,
  BuildOrBuyCategory,
  BuildOrBuyResult,
  CostEstimate,
  DiagnosisResult,
  RiskFinding,
  RuleOperator,
  StackProfile,
} from '../types'
import { appTypes } from '../data/appTypes'
import { architecturePatterns, getArchitecturePattern } from '../data/architecturePatterns'
import { findStackProfile } from '../data/stackProfiles'
import { existingSaasOptionToProductId, estimateSaasMonthlyCost, findSaasProducts, type SaasProduct } from '../data/saasProducts'
import { questions } from '../data/questions'
import { scoringRules } from '../data/scoringRules'
import { exclusionRules } from '../data/exclusionRules'
import { riskRules } from '../data/riskRules'
import { getAnswer, getNumber, getSingle, includesValue } from './answers'

const CATEGORY_LABEL: Record<BuildOrBuyCategory, string> = {
  A: '既存SaaS・パッケージ利用',
  B: 'SaaS設定・カスタマイズ',
  C: 'SaaS＋独自開発',
  D: 'AIコーディングによる独自開発',
  E: '開発非推奨',
}

const FEATURE_LABEL: Record<string, string> = {
  approval_flow: '承認ロジック',
  permissions: '権限管理',
  notifications: '通知処理',
  realtime: 'リアルタイム更新',
  offline: 'オフライン同期',
  batch: '定期バッチ処理',
  reporting: '帳票出力',
  external_integration: '外部システム連携',
}

const HORIZON_YEARS = 3
const HOSTING_COST_BY_COMPLEXITY: Record<number, [number, number]> = {
  1: [1000, 5000],
  2: [3000, 10000],
  3: [10000, 30000],
  4: [30000, 80000],
  5: [50000, 150000],
}
const DEV_WEEKS_BY_COMPLEXITY: Record<number, [number, number]> = {
  1: [1, 2],
  2: [2, 4],
  3: [4, 8],
  4: [8, 16],
  5: [16, 26],
}

function formatYen(value: number): string {
  return `${Math.round(value / 1000) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '円'
}

const BUDGET_LABEL: Record<string, string> = { small: '小規模', medium: '中規模', large: '大規模' }

function computeCostEstimate(usersCount: number, complexityLevel: number, coreSaas?: SaasProduct, budget?: string): CostEstimate {
  const hostingRange = HOSTING_COST_BY_COMPLEXITY[complexityLevel] ?? [10000, 30000]
  const devWeeksRange = DEV_WEEKS_BY_COMPLEXITY[complexityLevel] ?? [4, 8]
  const saasMonthlyCost = coreSaas ? estimateSaasMonthlyCost(coreSaas, usersCount) : undefined

  let note = '費用は公開情報等をもとにした概算の目安です。実際の料金・工数は各サービスの最新情報や見積もりでご確認ください。'
  if (budget === 'small' && complexityLevel >= 4) {
    note += ` 想定予算（${BUDGET_LABEL[budget]}）に対して開発期間・インフラ構成の規模が大きめです。MVP範囲を絞り込む、またはSaaS活用度を上げる方向を検討してください。`
  }

  return {
    horizonYears: HORIZON_YEARS,
    saasMonthlyCost,
    saasTotalOverHorizon: saasMonthlyCost !== undefined ? saasMonthlyCost * 12 * HORIZON_YEARS : undefined,
    buildDevWeeksRange: devWeeksRange,
    buildMonthlyHostingCostRange: hostingRange,
    buildHostingTotalOverHorizon: [hostingRange[0] * 12 * HORIZON_YEARS, hostingRange[1] * 12 * HORIZON_YEARS],
    note,
  }
}

/** アーキテクチャパターン確定前に使う、複雑度のおおまかな目安 */
function estimateComplexityProxy(answers: Answers): number {
  let level = 2
  const dataComplexity = getSingle(answers, 'q_data_complexity')
  if (dataComplexity === 'simple') level = 1
  if (dataComplexity === 'complex_relational') level = 3
  if (includesValue(answers, 'q_devices', 'native_app') || includesValue(answers, 'q_devices', 'pos_terminal')) level += 1
  if (includesValue(answers, 'q_biz_features', 'offline')) level += 1
  const concurrent = getNumber(answers, 'q_concurrent')
  if (concurrent !== undefined && concurrent >= 50) level += 1
  if (getSingle(answers, 'q_data_volume') === 'over_1m') level += 1
  return Math.min(Math.max(level, 1), 5)
}

function evaluateCondition(
  answers: Answers,
  operator: RuleOperator,
  conditionKey: string,
  conditionValue: string | number,
): boolean {
  switch (operator) {
    case '=':
      return getSingle(answers, conditionKey) === String(conditionValue)
    case '!=':
      return getSingle(answers, conditionKey) !== String(conditionValue)
    case 'includes':
      return includesValue(answers, conditionKey, String(conditionValue))
    case 'gte':
      return (getNumber(answers, conditionKey) ?? -Infinity) >= Number(conditionValue)
    case 'lte':
      return (getNumber(answers, conditionKey) ?? Infinity) <= Number(conditionValue)
    default:
      return false
  }
}

// AIコーディング前提のため、自作コストが下がっている分だけ既定を独自開発寄りにしている。
// 明確な「買う理由」が積み上がった場合のみ、SaaS側（A/B/C）に倒れる設計。
// 質問側の負荷重の合計は理論上-8が下限、基礎補正+2適用後の実質下限は-9前後。
// 旧閾値(-10)はこの下限を下回るためカテゴリAに構造的に到達できなかった点を修正。
export function categorize(buildScore: number, hardNoBuild: boolean): BuildOrBuyCategory {
  if (hardNoBuild) return 'E'
  if (buildScore <= -7) return 'A'
  if (buildScore <= -4) return 'B'
  if (buildScore <= -1) return 'C'
  return 'D'
}

export function computeBuildOrBuy(
  answers: Answers,
  appTypeId: string,
): BuildOrBuyResult & { dynamicNotes: string[]; costFavors: 'build' | 'buy' | 'neutral' } {
  let buildScore = 0
  const hardFlags = new Set<string>()
  const scoreBreakdown: { label: string; weight: number }[] = []

  for (const question of questions) {
    if (!question.options) continue
    const selected = getAnswer(answers, question.id)
    for (const option of question.options) {
      if (!selected.includes(option.value)) continue
      const weight = option.buildWeight ?? 0
      buildScore += weight
      if (weight !== 0) scoreBreakdown.push({ label: `${question.question}：${option.label}`, weight })
      option.flags?.forEach((flag) => hardFlags.add(flag))
    }
  }

  const dynamicNotes: string[] = []

  // AIコーディングの活用により自作コストが下がっていることを前提とした基礎補正
  buildScore += 2
  dynamicNotes.push('AIコーディングの活用により自作の開発コストが下がっていることを前提に補正している')
  scoreBreakdown.push({ label: 'AIコーディング前提の基礎補正', weight: 2 })

  const envSelected = getAnswer(answers, 'q_env')
  if (envSelected.length >= 3) {
    buildScore += 1
    dynamicNotes.push('複数の既存環境・システムを横断する必要がある')
    scoreBreakdown.push({ label: '複数の既存環境・システムを横断する必要がある', weight: 1 })
  }

  const externalPartnerCount = ['pos', 'ec', 'crm', 'accounting'].filter((v) => envSelected.includes(v)).length
  if (externalPartnerCount >= 3) {
    buildScore -= 1
    dynamicNotes.push('多数の外部事業者との標準連携が必要')
    scoreBreakdown.push({ label: '多数の外部事業者との標準連携が必要', weight: -1 })
  }

  const usersCount = getNumber(answers, 'q_users_count') ?? 10
  if (usersCount >= 50 && getSingle(answers, 'q_budget') === 'small') {
    buildScore += 1
    dynamicNotes.push('利用規模に対して既存SaaSの人数課金が重くなりやすい')
    scoreBreakdown.push({ label: '利用規模に対して既存SaaSの人数課金が重くなりやすい', weight: 1 })
  }

  // 費用概算による補正（3年間のSaaS費用 vs 自作の運用費用目安を比較）
  const complexityProxy = estimateComplexityProxy(answers)
  const prelimSaas = findSaasProducts(appTypeId)[0]
  const prelimCost = computeCostEstimate(usersCount, complexityProxy, prelimSaas)
  let costFavors: 'build' | 'buy' | 'neutral' = 'neutral'
  if (prelimCost.saasTotalOverHorizon !== undefined) {
    const [buildMin, buildMax] = prelimCost.buildHostingTotalOverHorizon
    if (prelimCost.saasTotalOverHorizon > buildMax * 1.5) {
      buildScore += 2
      costFavors = 'build'
      dynamicNotes.push(
        `SaaS費用は${HORIZON_YEARS}年で約${formatYen(prelimCost.saasTotalOverHorizon)}となり、自作の運用費用目安（約${formatYen(buildMin)}〜${formatYen(buildMax)}）を上回る`,
      )
      scoreBreakdown.push({ label: 'SaaS費用が自作の運用費用目安を上回る', weight: 2 })
    } else if (prelimCost.saasTotalOverHorizon < buildMin * 0.5) {
      buildScore -= 2
      costFavors = 'buy'
      dynamicNotes.push(
        `SaaS費用は${HORIZON_YEARS}年で約${formatYen(prelimCost.saasTotalOverHorizon)}と、自作の運用費用目安より明確に安い`,
      )
      scoreBreakdown.push({ label: 'SaaS費用が自作の運用費用目安より明確に安い', weight: -2 })
    }
  }

  const category = categorize(buildScore, hardFlags.has('hard_no_build'))

  return {
    category,
    scoreBreakdown,
    label: CATEGORY_LABEL[category],
    buildScore,
    hardFlags: [...hardFlags],
    dynamicNotes,
    costFavors,
  }
}

type BuildOrBuyComputed = ReturnType<typeof computeBuildOrBuy>

export function computeArchitectureScores(answers: Answers) {
  const excludedIds = new Set<ArchitecturePatternId>()
  const exclusionReasons: { patternId: ArchitecturePatternId; reason: string }[] = []

  for (const rule of exclusionRules) {
    if (evaluateCondition(answers, rule.operator, rule.conditionKey, rule.conditionValue)) {
      excludedIds.add(rule.targetId)
      exclusionReasons.push({ patternId: rule.targetId, reason: rule.reason })
    }
  }

  const scores = new Map<ArchitecturePatternId, number>(architecturePatterns.map((p) => [p.id, 0]))
  const matchedReasons = new Map<ArchitecturePatternId, string[]>()

  for (const rule of scoringRules) {
    if (excludedIds.has(rule.targetId)) continue
    if (!evaluateCondition(answers, rule.operator, rule.conditionKey, rule.conditionValue)) continue
    scores.set(rule.targetId, (scores.get(rule.targetId) ?? 0) + rule.score)
    matchedReasons.set(rule.targetId, [...(matchedReasons.get(rule.targetId) ?? []), rule.reason])
  }

  // 複雑性ペナルティ（開発指示書9.3）：小規模・運用担当不在なのに複雑度の高い構成は減点する
  const usersCount = getNumber(answers, 'q_users_count') ?? 0
  const opsNone = getSingle(answers, 'q_ops_team') === 'none'
  if (usersCount > 0 && usersCount < 20 && opsNone) {
    for (const pattern of architecturePatterns) {
      if (excludedIds.has(pattern.id) || pattern.complexityLevel < 3) continue
      scores.set(pattern.id, (scores.get(pattern.id) ?? 0) - 2)
    }
  }

  const ranked = architecturePatterns
    .filter((p) => !excludedIds.has(p.id))
    .map((pattern) => ({ pattern, score: scores.get(pattern.id) ?? 0 }))
    .sort((a, b) => b.score - a.score)

  return { ranked, excludedIds, exclusionReasons, matchedReasons }
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

// 表示専用の参考指標。判定ロジック（buildScore/category）には一切影響しない。
function computeFitScore(params: {
  primaryEntryScore: number
  aiCodingFit: DiagnosisResult['aiCodingFit']
  complexityLevel: number
  category: BuildOrBuyCategory
  costFavors: 'build' | 'buy' | 'neutral'
  risks: DiagnosisResult['risks']
}): DiagnosisResult['fitScore'] {
  const requirementFit = clampScore((Math.max(0, params.primaryEntryScore) / 20) * 100)

  const aiFitBase = params.aiCodingFit === 'high' ? 90 : params.aiCodingFit === 'medium' ? 65 : 30
  const feasibility = clampScore(aiFitBase - (params.complexityLevel >= 4 ? 10 : 0))

  const extensibilityByCategory: Record<BuildOrBuyCategory, number> = { D: 80, C: 80, B: 55, A: 35, E: 10 }
  const extensibility = clampScore(extensibilityByCategory[params.category])

  const categoryLeansBuy = params.category === 'C' || params.category === 'D'
  const costAligned =
    (categoryLeansBuy && params.costFavors !== 'buy') || (!categoryLeansBuy && params.costFavors !== 'build')
  const costPenalty = params.risks.filter((r) => (r.riskType === '費用' || r.riskType === '運用') && r.severity === '高').length * 10
  const costOps = clampScore(60 + (costAligned ? 15 : 0) - costPenalty)

  const axes = [
    { label: '要件適合', value: requirementFit, color: '#3157E5' },
    { label: '実現のしやすさ', value: feasibility, color: '#16A36A' },
    { label: '拡張性', value: extensibility, color: '#8B5CF6' },
    { label: 'コスト・運用', value: costOps, color: '#F59E0B' },
  ]
  const overall = clampScore(axes.reduce((sum, axis) => sum + axis.value, 0) / axes.length)

  return { overall, axes }
}

// 既にお使いのSaaSがあれば、それを本命候補として優先する（乗り換えではなく活用の方向）
function resolveSaasSelection(
  appTypeId: string,
  primaryPattern: ArchitecturePattern,
  buildOrBuy: BuildOrBuyComputed,
  answers: Answers,
): {
  recommendedSaas: SaasProduct[]
  saasAdoptionStatus: 'existing' | 'new' | undefined
  coreSaas: SaasProduct | undefined
  unmatchedExistingNames: string[]
} {
  const isSaasCentric = buildOrBuy.category === 'A' || buildOrBuy.category === 'B' || buildOrBuy.category === 'C'
  const recommendedSaas = isSaasCentric ? [...findSaasProducts(appTypeId, primaryPattern.id)] : []

  const existingSaasSelected = getAnswer(answers, 'q_existing_saas').filter((value) => value !== 'none')
  const existingSaasOtherText = getSingle(answers, 'q_existing_saas_other')?.trim()
  const existingProductIds = new Set(
    existingSaasSelected.map((value) => existingSaasOptionToProductId[value]).filter((id): id is string => Boolean(id)),
  )

  let saasAdoptionStatus: 'existing' | 'new' | undefined
  if (isSaasCentric) {
    const existingIndex = recommendedSaas.findIndex((product) => existingProductIds.has(product.id))
    if (existingIndex > 0) {
      const [matched] = recommendedSaas.splice(existingIndex, 1)
      recommendedSaas.unshift(matched)
    }
    saasAdoptionStatus = existingIndex >= 0 ? 'existing' : 'new'
  }

  const unmatchedExistingNames: string[] = []
  const existingSaasQuestion = questions.find((question) => question.id === 'q_existing_saas')
  for (const value of existingSaasSelected) {
    if (existingSaasOptionToProductId[value]) continue
    const label = existingSaasQuestion?.options?.find((option) => option.value === value)?.label
    if (label) unmatchedExistingNames.push(label)
  }
  if (existingSaasOtherText) unmatchedExistingNames.push(existingSaasOtherText)

  return { recommendedSaas, saasAdoptionStatus, coreSaas: recommendedSaas[0], unmatchedExistingNames }
}

function buildNonRecommendAlternative(hardFlags: Set<string>): string {
  return hardFlags.has('hard_no_build')
    ? '決済代行サービス（Stripe、Square等）や会計SaaS（freee、マネーフォワード等）など、専門領域に特化した既存サービスの利用を検討してください。自作は避け、連携部分のみの開発にとどめることを推奨します。'
    : '既存の専門サービスの利用を検討してください。開発・運用コストとリスクに対して、自作のメリットが小さい領域です。'
}

// 課題の要約・この構成で解決できること
function buildSolvedOutcomes(
  answers: Answers,
  selectedFeatures: string[],
  hardFlags: Set<string>,
  unmatchedExistingNames: string[],
): string[] {
  const solvedOutcomes: string[] = []
  if (getSingle(answers, 'q_current') === 'manual_excel') {
    solvedOutcomes.push('Excel・紙での手作業や転記の手間をなくせる')
  }
  if (selectedFeatures.includes('approval_flow')) {
    solvedOutcomes.push('自社独自の承認ルール・条件判定を、システム上で自動的に処理できる')
  }
  if (selectedFeatures.includes('offline')) {
    solvedOutcomes.push('オフラインでも入力・記録ができ、あとで自動的に同期される')
  }
  if (selectedFeatures.includes('external_integration') || unmatchedExistingNames.length > 0) {
    solvedOutcomes.push('既存システムとのデータ連携により、手作業での転記・二重入力を減らせる')
  }
  if (getSingle(answers, 'q_entra') === 'required') {
    solvedOutcomes.push('既存のMicrosoftアカウントでそのままログインでき、IDを増やさずに済む')
  }
  if (hardFlags.has('ai_search')) {
    solvedOutcomes.push('必要な情報をAI検索で素早く見つけられるようになる')
  }
  if (selectedFeatures.includes('reporting')) {
    solvedOutcomes.push('帳票作成を自動化し、作成の手間とミスを減らせる')
  }
  if (selectedFeatures.includes('realtime')) {
    solvedOutcomes.push('関係者間の情報をリアルタイムに共有できる')
  }
  if (solvedOutcomes.length === 0) {
    solvedOutcomes.push('業務の属人化を減らし、誰が対応しても同じ手順で進められるようになる')
  }
  return solvedOutcomes
}

// 推奨理由
function buildReasons(params: {
  problemStatement: string
  coreSaas: SaasProduct | undefined
  saasAdoptionStatus: 'existing' | 'new' | undefined
  buildOrBuy: BuildOrBuyComputed
  matchedReasons: Map<ArchitecturePatternId, string[]>
  primaryPattern: ArchitecturePattern
  appTypeName: string
}): string[] {
  const { problemStatement, coreSaas, saasAdoptionStatus, buildOrBuy, matchedReasons, primaryPattern, appTypeName } = params
  const reasons: string[] = []
  if (coreSaas) {
    const adoptionNote = saasAdoptionStatus === 'existing' ? '既にお使いの' : '新規導入する'
    reasons.push(`${adoptionNote}${coreSaas.name}は${appTypeName}領域で${coreSaas.strengths[0]}という強みがある`)
  }
  if (buildOrBuy.category === 'D') {
    reasons.push('AIコーディングを前提とすると自作の開発コストが下がっており、業務に合わせた独自開発の方が最終的に合理的と判定')
  }
  if (buildOrBuy.category === 'D' || buildOrBuy.category === 'C') {
    const patternReasons = matchedReasons.get(primaryPattern.id) ?? []
    reasons.push(...patternReasons.slice(0, 3))
  }
  reasons.push(...buildOrBuy.dynamicNotes.filter((note) => !note.startsWith('AIコーディングの活用')))
  reasons.push(`Build or Buyスコア(${buildOrBuy.buildScore})に基づき「${buildOrBuy.label}」が最も合理的と判定`)
  if (problemStatement) {
    reasons.unshift(
      `「${problemStatement}」という課題に対しては、${buildOrBuy.category === 'D' ? 'AIコーディングによる独自開発' : coreSaas ? coreSaas.name : buildOrBuy.label}が最も合理的`,
    )
  }
  return reasons
}

// 採用しなかった構成
function buildNotAdopted(params: {
  exclusionReasons: { patternId: ArchitecturePatternId; reason: string }[]
  primaryPatternId: ArchitecturePatternId
  alternativePatternId: ArchitecturePatternId | undefined
  buildOrBuy: BuildOrBuyComputed
  costEstimate: CostEstimate
  appTypeId: string
  coreSaas: SaasProduct | undefined
}): { name: string; reason: string }[] {
  const { exclusionReasons, primaryPatternId, alternativePatternId, buildOrBuy, costEstimate, appTypeId, coreSaas } = params
  const notAdopted: { name: string; reason: string }[] = []
  const seenPatternIds = new Set<string>([primaryPatternId, alternativePatternId ?? ''])
  for (const { patternId, reason } of exclusionReasons) {
    if (seenPatternIds.has(patternId)) continue
    const pattern = getArchitecturePattern(patternId)
    if (!pattern) continue
    notAdopted.push({ name: pattern.name, reason })
    seenPatternIds.add(patternId)
    if (notAdopted.length >= 3) break
  }
  if (buildOrBuy.category === 'D' && buildOrBuy.costFavors === 'build' && costEstimate.saasTotalOverHorizon !== undefined) {
    notAdopted.push({
      name: `SaaS（${findSaasProducts(appTypeId)[0]?.name ?? '既存SaaS'}）のみでの運用`,
      reason: `${HORIZON_YEARS}年間のSaaS費用試算（約${formatYen(costEstimate.saasTotalOverHorizon)}）が、自作の運用費用目安を上回るため`,
    })
  }
  if (buildOrBuy.category !== 'A' && notAdopted.length < 4) {
    notAdopted.push({
      name: coreSaas ? `${coreSaas.name}をそのまま利用（カスタマイズなし）` : '既存SaaSをそのまま採用（改修なし）',
      reason: '業務固有の処理や既存SaaSでは満たせない要件があり、標準機能だけでは不足するため',
    })
  }
  return notAdopted
}

// AIコーディング適性
function resolveAiCodingFit(
  buildOrBuy: BuildOrBuyComputed,
  hardFlags: Set<string>,
  primaryPattern: ArchitecturePattern,
): DiagnosisResult['aiCodingFit'] {
  return buildOrBuy.category === 'E'
    ? 'low'
    : buildOrBuy.category === 'A' || buildOrBuy.category === 'B'
      ? 'high'
      : hardFlags.has('hard_no_build') || primaryPattern.complexityLevel >= 4
        ? 'low'
        : primaryPattern.complexityLevel >= 3
          ? 'medium'
          : 'high'
}

function buildAiCodingScope(params: {
  hardFlags: Set<string>
  answers: Answers
  buildOrBuy: BuildOrBuyComputed
  primaryPattern: ArchitecturePattern
}): DiagnosisResult['aiCodingScope'] {
  const { hardFlags, answers, buildOrBuy, primaryPattern } = params
  const aiCapable = ['CRUD画面・一覧・検索', '通知・メール自動化', '基本的な帳票出力', 'データ集計・簡易ダッシュボード']
  if (hardFlags.has('ai_search')) aiCapable.push('AI要約・文書検索（RAGの基本部分）')

  const expertReview: string[] = []
  if (buildOrBuy.category === 'A' || buildOrBuy.category === 'B') {
    expertReview.push('SaaS側の権限設定・アクセス制御の最終確認')
  } else {
    if (getSingle(answers, 'q_entra') === 'required') expertReview.push('Entra IDの権限設計')
    if (hardFlags.has('offline')) expertReview.push('オフライン同期の競合解決・整合性設計')
    if (hardFlags.has('approval_flow') && includesValue(answers, 'q_biz_features', 'permissions')) {
      expertReview.push('複雑な権限管理を伴う承認ロジックの例外処理')
    }
    if (primaryPattern.complexityLevel >= 3) expertReview.push('インフラ構成・パフォーマンスチューニング')
  }
  if (hardFlags.has('hard_no_build')) expertReview.push('決済・会計・金融関連ロジック全般（専門家必須）')
  if (expertReview.length === 0) expertReview.push('特になし（標準的なCRUD中心の構成）')

  return { aiCapable, expertReview }
}

// 自作する範囲 / 外部サービス利用範囲
function buildScopeRanges(params: {
  buildOrBuy: BuildOrBuyComputed
  coreSaas: SaasProduct | undefined
  saasAdoptionStatus: 'existing' | 'new' | undefined
  selectedFeatures: string[]
  integrationNote: string | undefined
  primaryStack: StackProfile | undefined
  answers: Answers
  nonRecommendAlternative: string | undefined
}): { buildRange: string[]; externalRange: string[] } {
  const { buildOrBuy, coreSaas, saasAdoptionStatus, selectedFeatures, integrationNote, primaryStack, answers, nonRecommendAlternative } =
    params
  const buildRange: string[] = []
  const externalRange: string[] = []

  if (buildOrBuy.category === 'E') {
    buildRange.push('自作は非推奨（下記の代替サービスをご検討ください）')
    externalRange.push(nonRecommendAlternative ?? '専門サービスの利用を推奨')
  } else if (buildOrBuy.category === 'A') {
    const label = coreSaas ? `${coreSaas.name}の標準機能（業務のほぼ全体）` : '既存SaaSの標準機能（業務のほぼ全体）'
    externalRange.push(saasAdoptionStatus === 'new' && coreSaas ? `${label}（新規導入が必要）` : label)
    buildRange.push('特になし（標準機能でカバー可能）')
  } else if (buildOrBuy.category === 'B') {
    const label = coreSaas ? `${coreSaas.name}の標準機能` : '既存SaaSの標準機能'
    externalRange.push(saasAdoptionStatus === 'new' && coreSaas ? `${label}（新規導入が必要）` : label)
    buildRange.push(coreSaas ? `${coreSaas.name}上での項目追加・画面カスタマイズ・権限設定` : 'SaaS標準機能のカスタマイズ・項目追加・権限設定')
  } else if (buildOrBuy.category === 'C') {
    const label = coreSaas ? `${coreSaas.name}の標準機能（業務の中心部分）` : '既存SaaSの標準機能'
    externalRange.push(saasAdoptionStatus === 'new' && coreSaas ? `${label}（新規導入が必要）` : label)
    buildRange.push(coreSaas ? `${coreSaas.name}だけでは満たせない下記機能の独自開発` : '既存SaaSでは満たせない機能の独自開発')
    for (const feature of selectedFeatures) {
      if (['approval_flow', 'realtime', 'offline', 'external_integration'].includes(feature)) {
        buildRange.push(FEATURE_LABEL[feature] ?? feature)
      }
    }
    if (integrationNote) buildRange.push(integrationNote)
  } else {
    buildRange.push('独自の管理画面・業務ロジック（AIコーディングによる開発）')
    for (const feature of selectedFeatures) {
      if (['approval_flow', 'realtime', 'offline'].includes(feature)) {
        buildRange.push(FEATURE_LABEL[feature] ?? feature)
      }
    }
    if (integrationNote) buildRange.push(integrationNote)
    if (primaryStack?.roles.auth) externalRange.push(`認証（${primaryStack.roles.auth}）`)
    if (includesValue(answers, 'q_data_traits', 'attachments') || includesValue(answers, 'q_data_traits', 'media')) {
      externalRange.push(`ファイル保管（${primaryStack?.roles.storage ?? '外部ストレージ'}）`)
    }
    if (selectedFeatures.includes('notifications')) externalRange.push('メール・通知配信')
    if (externalRange.length === 0) externalRange.push('特になし（大部分を自作）')
  }

  return { buildRange, externalRange }
}

// リスク
function buildRisks(params: {
  answers: Answers
  buildOrBuy: BuildOrBuyComputed
  primaryPatternId: ArchitecturePatternId
  unmatchedExistingNames: string[]
}): RiskFinding[] {
  const { answers, buildOrBuy, primaryPatternId, unmatchedExistingNames } = params
  const risks = riskRules
    .filter((rule) => rule.matches(answers, { category: buildOrBuy.category, patternId: primaryPatternId }))
    .map((rule) => ({ riskType: rule.riskType, severity: rule.severity, message: rule.message, mitigation: rule.mitigation }))

  if (unmatchedExistingNames.length > 0 && (buildOrBuy.category === 'C' || buildOrBuy.category === 'D')) {
    risks.push({
      riskType: 'データ移行',
      severity: '中',
      message: `既存の${unmatchedExistingNames.join('・')}との連携方式（API有無・データ形式）を事前に確認していないと、想定より連携工数が膨らむ可能性がある`,
      mitigation: '連携先のAPI・Webhook・エクスポート機能の有無を早期に確認する',
    })
  }
  return risks
}

// 次の作業
function buildNextSteps(answers: Answers, hardFlags: Set<string>, unmatchedExistingNames: string[]): string[] {
  const nextSteps = [
    '要件定義（自由記述内容の詳細ヒアリング）',
    '画面一覧の作成',
    'データモデル設計',
    'MVP範囲の確定',
    '構成図の作成',
    '開発計画（マイルストーン設定）',
  ]
  if (getSingle(answers, 'q_entra') === 'required') nextSteps.push('Entra IDのテナント・アプリ登録方針を確認する')
  if (hardFlags.has('offline')) nextSteps.push('オフライン時の同期・競合解決ルールを先に決める')
  if (unmatchedExistingNames.length > 0) nextSteps.push(`既存の${unmatchedExistingNames.join('・')}との連携方式を確認する`)
  return nextSteps
}

export function diagnose(answers: Answers): DiagnosisResult {
  const appTypeId = getSingle(answers, 'q_app_type') ?? appTypes[0].id
  const appTypeName = appTypes.find((type) => type.id === appTypeId)?.name ?? 'このシステム'
  const buildOrBuy = computeBuildOrBuy(answers, appTypeId)
  const { ranked, exclusionReasons, matchedReasons } = computeArchitectureScores(answers)

  const primaryEntry = ranked[0]
  const primaryPattern = primaryEntry?.pattern ?? getArchitecturePattern('P1')!
  const alternativePattern = ranked[1]?.pattern
  const primaryStack = findStackProfile(appTypeId, primaryPattern.id)

  const selectedFeatures = getAnswer(answers, 'q_biz_features')
  const hardFlags = new Set(buildOrBuy.hardFlags)
  const usersCount = getNumber(answers, 'q_users_count') ?? 10

  const { recommendedSaas, saasAdoptionStatus, coreSaas, unmatchedExistingNames } = resolveSaasSelection(
    appTypeId,
    primaryPattern,
    buildOrBuy,
    answers,
  )

  const nonRecommendAlternative = buildOrBuy.category === 'E' ? buildNonRecommendAlternative(hardFlags) : undefined

  // 費用の目安（表示用。実際に確定したパターン・SaaSで再計算する）
  const costEstimate = computeCostEstimate(usersCount, primaryPattern.complexityLevel, coreSaas, getSingle(answers, 'q_budget'))

  const problemStatement = getSingle(answers, 'q_problem') ?? ''
  const solvedOutcomes = buildSolvedOutcomes(answers, selectedFeatures, hardFlags, unmatchedExistingNames)

  const reasons = buildReasons({
    problemStatement,
    coreSaas,
    saasAdoptionStatus,
    buildOrBuy,
    matchedReasons,
    primaryPattern,
    appTypeName,
  })

  const notAdopted = buildNotAdopted({
    exclusionReasons,
    primaryPatternId: primaryPattern.id,
    alternativePatternId: alternativePattern?.id,
    buildOrBuy,
    costEstimate,
    appTypeId,
    coreSaas,
  })

  const aiCodingFit = resolveAiCodingFit(buildOrBuy, hardFlags, primaryPattern)
  const aiCodingScope = buildAiCodingScope({ hardFlags, answers, buildOrBuy, primaryPattern })

  const integrationNote = unmatchedExistingNames.length > 0 ? `既存の${unmatchedExistingNames.join('・')}との連携` : undefined
  const { buildRange, externalRange } = buildScopeRanges({
    buildOrBuy,
    coreSaas,
    saasAdoptionStatus,
    selectedFeatures,
    integrationNote,
    primaryStack,
    answers,
    nonRecommendAlternative,
  })

  const risks = buildRisks({ answers, buildOrBuy, primaryPatternId: primaryPattern.id, unmatchedExistingNames })

  const nextSteps = buildNextSteps(answers, hardFlags, unmatchedExistingNames)

  const rankedPatterns = ranked.slice(0, 3)
  const isCloseCall = ranked.length >= 2 && ranked[0].score > 0 && ranked[0].score - ranked[1].score <= 2
  const fitScore = computeFitScore({
    primaryEntryScore: primaryEntry?.score ?? 0,
    aiCodingFit,
    complexityLevel: primaryPattern.complexityLevel,
    category: buildOrBuy.category,
    costFavors: buildOrBuy.costFavors,
    risks,
  })

  return {
    appTypeId,
    buildOrBuy,
    problemStatement,
    solvedOutcomes,
    recommendedSaas,
    saasAdoptionStatus,
    nonRecommendAlternative,
    costEstimate,
    rankedPatterns,
    isCloseCall,
    fitScore,
    buildRange,
    externalRange,
    primaryPattern,
    alternativePattern,
    primaryStack,
    reasons: reasons.slice(0, 6),
    notAdopted: notAdopted.slice(0, 4),
    aiCodingFit,
    aiCodingScope,
    risks,
    nextSteps: nextSteps.slice(0, 8),
    answeredAt: new Date().toISOString(),
  }
}
