import type { ArchitecturePattern, ArchitecturePatternId, StackProfile, TechRole } from '../../features/build-or-buy/types'
import type { SaasProduct } from '../../features/build-or-buy/data/saasProducts.seed'
import type { Pattern, TechCategory, TechElement } from '../../features/tech-stack-selector/types'
import type { PatternDetail } from '../../features/tech-stack-selector/data/patternDetails.seed'
import type { ElementDetail } from '../../features/tech-stack-selector/data/elementDetails.seed'
import type { ArchitecturePatternDetail, RegistryData, TechPatternDetail } from './types'

const APP_TYPE_TAG_PREFIX = 'app_type:'
const SAAS_CATEGORY_ID = 'saas-product'

function sortBySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function selectArchitecturePatterns(data: RegistryData): ArchitecturePattern[] {
  return sortBySortOrder(
    data.stacks.filter((s) => s.presetType === 'architecture_pattern' && s.presetKind === 'pattern_definition'),
  ).map((s) => {
    const detail = s.detail as ArchitecturePatternDetail
    return {
      id: s.id as ArchitecturePatternId,
      name: s.name,
      description: detail.description,
      complexityLevel: detail.complexityLevel,
      suitableConditions: detail.suitableConditions,
      unsuitableConditions: detail.unsuitableConditions,
      candidates: detail.candidates,
    }
  })
}

export function selectStackProfiles(data: RegistryData): StackProfile[] {
  return sortBySortOrder(data.stacks.filter((s) => s.presetType === 'architecture_pattern' && s.presetKind === 'stack_profile')).map(
    (s) => ({
      id: s.id,
      name: s.name,
      appTypeIds: s.appTypeIds ?? [],
      patternId: s.parentPatternId as ArchitecturePatternId,
      roles: Object.fromEntries(
        s.items.filter((item) => item.role && item.label).map((item) => [item.role as TechRole, item.label as string]),
      ) as Partial<Record<TechRole, string>>,
    }),
  )
}

export function selectSaasProducts(data: RegistryData): SaasProduct[] {
  return data.technologies
    .filter((t) => t.technologyKind === 'saas')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((t) => {
      const appTypeIds = t.tagIds.filter((id) => id.startsWith(APP_TYPE_TAG_PREFIX)).map((id) => id.slice(APP_TYPE_TAG_PREFIX.length))
      const preferWhenPatternIds = data.rules
        .filter((r) => r.ruleType === 'preferred_for_preset' && r.technologyId === t.id)
        .map((r) => r.presetId!)
      return {
        id: t.id,
        name: t.name,
        appTypeIds,
        preferWhenPatternIds: preferWhenPatternIds.length > 0 ? preferWhenPatternIds : undefined,
        description: t.description,
        strengths: t.detail?.strengths ?? [],
        monthlyBaseFee: t.pricing?.monthlyBaseFee ?? 0,
        monthlyPricePerUser: t.pricing?.monthlyPricePerUser ?? 0,
      }
    })
}

export function selectExistingSaasOptionToProductId(data: RegistryData): Record<string, string> {
  const result: Record<string, string> = {}
  for (const rule of data.rules) {
    if (rule.ruleType === 'answer_option_alias' && rule.conditionKey === 'q_existing_saas' && rule.conditionValue && rule.technologyId) {
      result[rule.conditionValue] = rule.technologyId
    }
  }
  return result
}

export function selectPatterns(data: RegistryData): Pattern[] {
  return sortBySortOrder(data.stacks.filter((s) => s.presetType === 'tech_pattern')).map((s) => ({ id: s.id, name: s.name }))
}

export function selectPatternMap(data: RegistryData): Record<string, Pattern> {
  return Object.fromEntries(selectPatterns(data).map((p) => [p.id, p]))
}

export function selectAllPatternIds(data: RegistryData): string[] {
  return selectPatterns(data).map((p) => p.id)
}

export function selectPatternDetails(data: RegistryData): Record<string, PatternDetail> {
  const entries = data.stacks
    .filter((s) => s.presetType === 'tech_pattern' && s.detail)
    .map((s) => [s.id, s.detail as TechPatternDetail] as const)
  return Object.fromEntries(entries)
}

export function selectElementDetails(data: RegistryData): Record<string, ElementDetail> {
  const entries = data.technologies
    .filter((t) => t.categoryId !== SAAS_CATEGORY_ID && t.detail?.overview && t.detail?.fit && t.detail?.caution)
    .map((t) => {
      const detail = t.detail!
      return [t.id, { overview: detail.overview!, fit: detail.fit!, caution: detail.caution!, url: detail.url }] as const
    })
  return Object.fromEntries(entries)
}

export function selectTechCategories(data: RegistryData): TechCategory[] {
  const patternIdsByTechnology = new Map<string, string[]>()
  for (const stack of data.stacks) {
    if (stack.presetType !== 'tech_pattern') continue
    for (const item of stack.items) {
      if (!item.technologyId) continue
      const list = patternIdsByTechnology.get(item.technologyId) ?? []
      list.push(stack.id)
      patternIdsByTechnology.set(item.technologyId, list)
    }
  }

  return sortBySortOrder(data.categories.filter((c) => c.id !== SAAS_CATEGORY_ID)).map((category) => {
    const elements: TechElement[] = sortBySortOrder(data.technologies.filter((t) => t.categoryId === category.id)).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      patternIds: patternIdsByTechnology.get(t.id) ?? [],
    }))
    return { id: category.id, order: category.sortOrder, title: category.title, elements }
  })
}
