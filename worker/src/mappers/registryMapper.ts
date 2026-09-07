import type { RegistrySnapshotRows } from '../repositories/registryRepository'
import type { TechnologyRow } from '../repositories/types'

/** API/フロント共有の RegistryData shape（src/lib/registry/types.ts と一致させること。Workerは独立パッケージのため型は複製） */
export type RegistryApiData = {
  version: { releaseId: number; versionLabel: string; publishedAt: string }
  categories: { id: string; title: string; sortOrder: number }[]
  technologies: RegistryApiTechnology[]
  tags: { id: string; tagType: string; label: string; description?: string }[]
  stacks: {
    id: string
    presetType: string
    presetKind?: string
    parentPatternId?: string
    name: string
    appTypeIds?: string[]
    detail?: Record<string, unknown>
    items: { technologyId?: string; role?: string; label?: string; sortOrder: number }[]
    sortOrder: number
  }[]
  rules: {
    id: string
    ruleType: string
    technologyId?: string
    tagId?: string
    presetId?: string
    conditionKey?: string
    conditionValue?: string
  }[]
}

export type RegistryApiTechnology = {
  id: string
  categoryId: string
  technologyKind: string
  name: string
  description: string
  detail?: Record<string, unknown>
  pricing?: { monthlyBaseFee: number; monthlyPricePerUser: number }
  scores?: { security?: number; cost?: number; developmentSpeed?: number; aiCoding?: number; scalability?: number }
  status: 'active' | 'deprecated'
  notes?: string
  tagIds: string[]
  sortOrder: number
}

/** TechnologyRow(+そのtagId一覧) → APIレスポンス形式。管理API（作成・更新のレスポンス）とも共有する。 */
export function mapTechnologyRow(t: TechnologyRow, tagIds: string[]): RegistryApiTechnology {
  const parsed = t.details_json ? (JSON.parse(t.details_json) as Record<string, unknown>) : undefined
  const { pricing, ...detail } = parsed ?? {}
  const scores: RegistryApiTechnology['scores'] = {
    security: t.security_score ?? undefined,
    cost: t.cost_score ?? undefined,
    developmentSpeed: t.development_speed_score ?? undefined,
    aiCoding: t.ai_coding_score ?? undefined,
    scalability: t.scalability_score ?? undefined,
  }
  const hasScore = Object.values(scores).some((v) => v !== undefined)
  return {
    id: t.id,
    categoryId: t.category_id,
    technologyKind: t.technology_kind,
    name: t.name,
    description: t.description,
    detail: Object.keys(detail).length > 0 ? detail : undefined,
    pricing: pricing as RegistryApiTechnology['pricing'],
    scores: hasScore ? scores : undefined,
    status: t.status,
    notes: t.notes ?? undefined,
    tagIds,
    sortOrder: t.sort_order,
  }
}

export function mapRowsToRegistryData(rows: RegistrySnapshotRows): RegistryApiData {
  const tagIdsByTechnology = new Map<string, string[]>()
  for (const tt of rows.technologyTags) {
    const list = tagIdsByTechnology.get(tt.technology_id) ?? []
    list.push(tt.tag_id)
    tagIdsByTechnology.set(tt.technology_id, list)
  }

  const itemsByPreset = new Map<string, RegistryApiData['stacks'][number]['items']>()
  for (const item of rows.stackItems) {
    const list = itemsByPreset.get(item.preset_id) ?? []
    list.push({
      technologyId: item.technology_id ?? undefined,
      role: item.role ?? undefined,
      label: item.label_override ?? undefined,
      sortOrder: item.sort_order,
    })
    itemsByPreset.set(item.preset_id, list)
  }

  const technologies: RegistryApiData['technologies'] = rows.technologies.map((t) =>
    mapTechnologyRow(t, tagIdsByTechnology.get(t.id) ?? []),
  )

  const stacks: RegistryApiData['stacks'] = rows.stacks.map((s) => ({
    id: s.id,
    presetType: s.preset_type,
    presetKind: s.preset_kind ?? undefined,
    parentPatternId: s.parent_pattern_id ?? undefined,
    name: s.name,
    appTypeIds: s.app_type_ids ? JSON.parse(s.app_type_ids) : undefined,
    detail: s.details_json ? JSON.parse(s.details_json) : undefined,
    items: (itemsByPreset.get(s.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
    sortOrder: s.sort_order,
  }))

  return {
    version: {
      releaseId: rows.release.id,
      versionLabel: rows.release.version_label,
      publishedAt: rows.release.published_at ?? rows.release.created_at,
    },
    categories: rows.categories.map((c) => ({ id: c.id, title: c.title, sortOrder: c.sort_order })),
    technologies,
    tags: rows.tags.map((t) => ({ id: t.id, tagType: t.tag_type, label: t.label, description: t.description ?? undefined })),
    stacks,
    rules: rows.rules.map((r) => ({
      id: r.id,
      ruleType: r.rule_type,
      technologyId: r.technology_id ?? undefined,
      tagId: r.tag_id ?? undefined,
      presetId: r.preset_id ?? undefined,
      conditionKey: r.condition_key ?? undefined,
      conditionValue: r.condition_value ?? undefined,
    })),
  }
}
