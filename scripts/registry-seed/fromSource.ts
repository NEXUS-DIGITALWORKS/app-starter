/**
 * data/*.seed.ts 群（既存の技術マスターデータ）から RegistryData を組み立てる純粋関数。
 *
 * ネットワークやDBアクセスは一切行わない。D1向けseed生成（toSql.ts）と
 * vitestのRegistryフィクスチャ（src/test/registryFixture.ts）の両方が
 * この関数を単一ソースとして参照することで、シードデータとテストデータのドリフトを防ぐ。
 */
import { appTypes } from '../../src/features/build-or-buy/data/appTypes'
import { architecturePatterns } from '../../src/features/build-or-buy/data/architecturePatterns.seed'
import { stackProfiles } from '../../src/features/build-or-buy/data/stackProfiles.seed'
import { saasProducts, existingSaasOptionToProductId } from '../../src/features/build-or-buy/data/saasProducts.seed'
import { CATEGORIES } from '../../src/features/tech-stack-selector/data/categories.seed'
import { PATTERNS } from '../../src/features/tech-stack-selector/data/patterns.seed'
import { PATTERN_DETAILS } from '../../src/features/tech-stack-selector/data/patternDetails.seed'
import { ELEMENT_DETAILS } from '../../src/features/tech-stack-selector/data/elementDetails.seed'
import type {
  RegistryCategory,
  RegistryData,
  RegistryRule,
  RegistryStackPreset,
  RegistryTag,
  RegistryTechnology,
} from '../../src/lib/registry/types'

const RELEASE_ID = 1
const VERSION_LABEL = '2026.09.1'
const SAAS_CATEGORY_ID = 'saas-product'
const APP_TYPE_TAG_PREFIX = 'app_type:'

function buildCategories(): RegistryCategory[] {
  const fromTechSelector = CATEGORIES.map((category) => ({
    id: category.id,
    title: category.title,
    sortOrder: category.order,
  }))
  return [...fromTechSelector, { id: SAAS_CATEGORY_ID, title: 'SaaS製品', sortOrder: fromTechSelector.length + 1 }]
}

function buildTags(): RegistryTag[] {
  return appTypes.map((appType) => ({
    id: `${APP_TYPE_TAG_PREFIX}${appType.id}`,
    tagType: 'app_type',
    label: appType.name,
    description: appType.description,
  }))
}

function buildTechnologies(): RegistryTechnology[] {
  const fromTechSelector: RegistryTechnology[] = []
  for (const category of CATEGORIES) {
    category.elements.forEach((element, index) => {
      const detail = ELEMENT_DETAILS[element.id]
      fromTechSelector.push({
        id: element.id,
        categoryId: category.id,
        technologyKind: 'tool',
        name: element.name,
        description: element.description,
        detail: detail ? { overview: detail.overview, fit: detail.fit, caution: detail.caution, url: detail.url } : undefined,
        status: 'active',
        tagIds: [],
        sortOrder: index,
      })
    })
  }

  const fromSaas: RegistryTechnology[] = saasProducts.map((product, index) => ({
    id: product.id,
    categoryId: SAAS_CATEGORY_ID,
    technologyKind: 'saas',
    name: product.name,
    description: product.description,
    detail: { strengths: product.strengths },
    pricing: { monthlyBaseFee: product.monthlyBaseFee, monthlyPricePerUser: product.monthlyPricePerUser },
    status: 'active',
    tagIds: product.appTypeIds.map((appTypeId) => `${APP_TYPE_TAG_PREFIX}${appTypeId}`),
    sortOrder: index,
  }))

  return [...fromTechSelector, ...fromSaas]
}

function buildArchitectureStacks(): RegistryStackPreset[] {
  const patternDefinitions: RegistryStackPreset[] = architecturePatterns.map((pattern, index) => ({
    id: pattern.id,
    presetType: 'architecture_pattern',
    presetKind: 'pattern_definition',
    name: pattern.name,
    detail: {
      description: pattern.description,
      complexityLevel: pattern.complexityLevel,
      suitableConditions: pattern.suitableConditions,
      unsuitableConditions: pattern.unsuitableConditions,
      candidates: pattern.candidates,
    },
    items: [],
    sortOrder: index,
  }))

  const stackProfilePresets: RegistryStackPreset[] = stackProfiles.map((profile, index) => ({
    id: profile.id,
    presetType: 'architecture_pattern',
    presetKind: 'stack_profile',
    parentPatternId: profile.patternId,
    name: profile.name,
    appTypeIds: profile.appTypeIds,
    items: Object.entries(profile.roles).map(([role, label], itemIndex) => ({
      role,
      label,
      sortOrder: itemIndex,
    })),
    sortOrder: index,
  }))

  return [...patternDefinitions, ...stackProfilePresets]
}

function buildTechPatternStacks(): RegistryStackPreset[] {
  return PATTERNS.map((pattern, index) => {
    const items: RegistryStackPreset['items'] = []
    for (const category of CATEGORIES) {
      for (const element of category.elements) {
        if (element.patternIds.includes(pattern.id)) {
          items.push({ technologyId: element.id, sortOrder: items.length })
        }
      }
    }
    return {
      id: pattern.id,
      presetType: 'tech_pattern',
      name: pattern.name,
      detail: PATTERN_DETAILS[pattern.id],
      items,
      sortOrder: index,
    }
  })
}

function buildRules(): RegistryRule[] {
  const preferredForPreset: RegistryRule[] = saasProducts.flatMap((product) =>
    (product.preferWhenPatternIds ?? []).map((patternId) => ({
      id: `preferred_for_preset:${product.id}:${patternId}`,
      ruleType: 'preferred_for_preset' as const,
      technologyId: product.id,
      presetId: patternId,
    })),
  )

  const answerOptionAlias: RegistryRule[] = Object.entries(existingSaasOptionToProductId).map(([optionValue, productId]) => ({
    id: `answer_option_alias:q_existing_saas:${optionValue}`,
    ruleType: 'answer_option_alias' as const,
    technologyId: productId,
    conditionKey: 'q_existing_saas',
    conditionValue: optionValue,
  }))

  return [...preferredForPreset, ...answerOptionAlias]
}

export function buildRegistryDataFromSource(): RegistryData {
  return {
    version: { releaseId: RELEASE_ID, versionLabel: VERSION_LABEL, publishedAt: new Date(0).toISOString() },
    categories: buildCategories(),
    technologies: buildTechnologies(),
    tags: buildTags(),
    stacks: [...buildArchitectureStacks(), ...buildTechPatternStacks()],
    rules: buildRules(),
  }
}
