import type { CategoryRow, StackPresetItemRow, StackPresetRow, TagRow, TechnologyRow } from './types'

export type TechnologyWriteInput = {
  categoryId: string
  technologyKind: string
  name: string
  description: string
  detailsJson: string | null
  securityScore: number | null
  costScore: number | null
  developmentSpeedScore: number | null
  aiCodingScore: number | null
  scalabilityScore: number | null
  status: 'active' | 'deprecated'
  notes: string | null
}

export type CategoryWriteInput = {
  title: string
  sortOrder: number
}

export type TagWriteInput = {
  tagType: string
  label: string
  description: string | null
}

export type StackPresetWriteInput = {
  presetType: string
  presetKind: string | null
  parentPatternId: string | null
  name: string
  appTypeIdsJson: string | null
  detailsJson: string | null
}

export type StackPresetItemInput = {
  technologyId: string | null
  role: string | null
  label: string | null
  sortOrder: number
}

export type RuleWriteInput = {
  ruleType: string
  technologyId: string | null
  tagId: string | null
  presetId: string | null
  conditionKey: string | null
  conditionValue: string | null
}

/**
 * 管理API（作成・更新・削除）専用のRepositoryインターフェース。
 * 読み取り専用のRegistryRepositoryとは責務を分離する（既存の読み取りパスに影響を与えないため）。
 * D1依存はd1AdminRepository.tsに閉じ込める。
 */
export interface AdminRepository {
  // Technology
  findTechnology(releaseId: number, id: string): Promise<TechnologyRow | null>
  listTechnologyTagIds(releaseId: number, technologyId: string): Promise<string[]>
  createTechnology(releaseId: number, id: string, input: TechnologyWriteInput, tagIds: string[]): Promise<void>
  updateTechnology(releaseId: number, id: string, input: TechnologyWriteInput, tagIds: string[]): Promise<void>
  countStackPresetItemsReferencingTechnology(releaseId: number, technologyId: string): Promise<number>
  deleteTechnologyCascade(releaseId: number, id: string): Promise<void>

  // Category
  findCategory(releaseId: number, id: string): Promise<CategoryRow | null>
  createCategory(releaseId: number, id: string, input: CategoryWriteInput): Promise<void>
  updateCategory(releaseId: number, id: string, input: CategoryWriteInput): Promise<void>
  countTechnologiesInCategory(releaseId: number, categoryId: string): Promise<number>
  deleteCategory(releaseId: number, id: string): Promise<void>

  // Tag
  findTag(releaseId: number, id: string): Promise<TagRow | null>
  createTag(releaseId: number, id: string, input: TagWriteInput): Promise<void>
  updateTag(releaseId: number, id: string, input: TagWriteInput): Promise<void>
  deleteTagCascade(releaseId: number, id: string): Promise<void>

  // Stack Preset
  findStackPreset(releaseId: number, id: string): Promise<StackPresetRow | null>
  listStackPresetItems(releaseId: number, presetId: string): Promise<StackPresetItemRow[]>
  createStackPreset(releaseId: number, id: string, input: StackPresetWriteInput, items: StackPresetItemInput[]): Promise<void>
  updateStackPreset(releaseId: number, id: string, input: StackPresetWriteInput, items: StackPresetItemInput[]): Promise<void>
  countPresetsReferencingParent(releaseId: number, parentPatternId: string): Promise<number>
  deleteStackPresetCascade(releaseId: number, id: string): Promise<void>

  // Rule
  createRule(releaseId: number, id: string, input: RuleWriteInput): Promise<void>
  /** 削除した行が実際にあったかどうかを返す（呼び出し元がNotFoundを判定するため） */
  deleteRule(releaseId: number, id: string): Promise<boolean>
}
