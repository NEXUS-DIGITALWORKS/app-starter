/**
 * Stack Registry Worker API（GET /api/v1/registry）のレスポンスと同一shape。
 * scripts/registry-seed/fromSource.ts が生成するseedデータもこの型に従う。
 */

export type RegistryCategory = {
  id: string
  title: string
  sortOrder: number
}

export type RegistryTechnologyDetail = {
  overview?: string
  fit?: string
  caution?: string
  url?: string
  strengths?: string[]
}

export type RegistryTechnologyPricing = {
  monthlyBaseFee: number
  monthlyPricePerUser: number
}

export type RegistryTechnologyKind = 'framework' | 'library' | 'platform' | 'saas' | 'tool'
export type RegistryTechnologyStatus = 'active' | 'deprecated'

export type RegistryTechnologyScores = {
  security?: number
  cost?: number
  developmentSpeed?: number
  aiCoding?: number
  scalability?: number
}

export type RegistryTechnology = {
  id: string
  categoryId: string
  technologyKind: RegistryTechnologyKind
  name: string
  description: string
  detail?: RegistryTechnologyDetail
  pricing?: RegistryTechnologyPricing
  scores?: RegistryTechnologyScores
  status: RegistryTechnologyStatus
  notes?: string
  tagIds: string[]
  sortOrder: number
}

export type RegistryTag = {
  id: string
  tagType: string
  label: string
  description?: string
}

export type RegistryStackPresetItem = {
  technologyId?: string
  role?: string
  label?: string
  sortOrder: number
}

export type ArchitecturePatternDetail = {
  description: string
  complexityLevel: number
  suitableConditions: string[]
  unsuitableConditions: string[]
  candidates: string[]
}

export type TechPatternDetail = {
  shortSummary: string
  primaryUse: string
  architectureType: string
  primaryLanguage: string
  whatYouCanBuild: string
  whyRecommended: string[]
  strengths: string[]
  suitableCases: string[]
  unsuitableCases: string[]
  expectedFeatures: string[]
}

export type RegistryPresetType = 'architecture_pattern' | 'tech_pattern'
export type RegistryPresetKind = 'pattern_definition' | 'stack_profile'

export type RegistryStackPreset = {
  id: string
  presetType: RegistryPresetType
  presetKind?: RegistryPresetKind
  parentPatternId?: string
  name: string
  appTypeIds?: string[]
  detail?: ArchitecturePatternDetail | TechPatternDetail
  items: RegistryStackPresetItem[]
  sortOrder: number
}

export type RegistryRuleType = 'preferred_for_preset' | 'answer_option_alias'

export type RegistryRule = {
  id: string
  ruleType: RegistryRuleType
  technologyId?: string
  tagId?: string
  presetId?: string
  conditionKey?: string
  conditionValue?: string
}

export type RegistryVersion = {
  releaseId: number
  versionLabel: string
  publishedAt: string
}

export type RegistryData = {
  version: RegistryVersion
  categories: RegistryCategory[]
  technologies: RegistryTechnology[]
  tags: RegistryTag[]
  stacks: RegistryStackPreset[]
  rules: RegistryRule[]
}
