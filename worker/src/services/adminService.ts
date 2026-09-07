import type { RegistryRepository } from '../repositories/registryRepository'
import type {
  AdminRepository,
  CategoryWriteInput,
  RuleWriteInput,
  StackPresetItemInput,
  StackPresetWriteInput,
  TagWriteInput,
  TechnologyWriteInput,
} from '../repositories/adminRepository'

export class AdminValidationError extends Error {}
export class AdminNotFoundError extends Error {}
export class AdminConflictError extends Error {}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const STACK_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]*$/
const TECHNOLOGY_KINDS = ['framework', 'library', 'platform', 'saas', 'tool']
const TECHNOLOGY_STATUSES = ['active', 'deprecated']
const PRESET_TYPES = ['architecture_pattern', 'tech_pattern']
const PRESET_KINDS = ['pattern_definition', 'stack_profile']
const RULE_TYPES = ['preferred_for_preset', 'answer_option_alias']

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AdminValidationError(`${field} is required.`)
  }
  return value
}

function optionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') throw new AdminValidationError('Expected a string.')
  return value.trim().length > 0 ? value : null
}

function optionalScore(value: unknown, field: string): number | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) {
    throw new AdminValidationError(`${field} must be an integer between 1 and 5.`)
  }
  return value
}

function requireOneOf(value: unknown, allowed: string[], field: string): string {
  const str = requireString(value, field)
  if (!allowed.includes(str)) throw new AdminValidationError(`${field} must be one of: ${allowed.join(', ')}.`)
  return str
}

async function resolvePublishedReleaseId(registryRepo: RegistryRepository): Promise<number> {
  const release = await registryRepo.findLatestPublishedRelease()
  if (!release) throw new AdminNotFoundError('No published registry release found.')
  return release.id
}

/**
 * Registry管理API（作成・更新・削除）のバリデーション・整合性ルールを担う層。
 *
 * 既知のギャップ: このServiceおよび呼び出し元のWorkerルートには認証チェックがない
 * （ローカル開発限定・未デプロイのため）。本番相当のCloudflare Access統合はP7で対応する。
 */
export class AdminService {
  constructor(
    private readonly registryRepo: RegistryRepository,
    private readonly adminRepo: AdminRepository,
  ) {}

  // ---- Technology --------------------------------------------------------

  async createTechnology(payload: unknown): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    const body = payload as Record<string, unknown>
    const id = requireString(body.id, 'id')
    if (!SLUG_PATTERN.test(id)) throw new AdminValidationError('id must match ^[a-z0-9]+(-[a-z0-9]+)*$.')
    if (await this.adminRepo.findTechnology(releaseId, id)) throw new AdminConflictError(`Technology "${id}" already exists.`)

    const categoryId = requireString(body.categoryId, 'categoryId')
    if (!(await this.adminRepo.findCategory(releaseId, categoryId))) {
      throw new AdminValidationError(`categoryId "${categoryId}" does not exist.`)
    }

    const { input, tagIds } = this.buildTechnologyInput(body, categoryId)
    await this.adminRepo.createTechnology(releaseId, id, input, tagIds)
    return { id }
  }

  async updateTechnology(id: string, payload: unknown): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    if (!(await this.adminRepo.findTechnology(releaseId, id))) throw new AdminNotFoundError(`Technology "${id}" not found.`)

    const body = payload as Record<string, unknown>
    const categoryId = requireString(body.categoryId, 'categoryId')
    if (!(await this.adminRepo.findCategory(releaseId, categoryId))) {
      throw new AdminValidationError(`categoryId "${categoryId}" does not exist.`)
    }

    const { input, tagIds } = this.buildTechnologyInput(body, categoryId)
    await this.adminRepo.updateTechnology(releaseId, id, input, tagIds)
    return { id }
  }

  async deleteTechnology(id: string): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    if (!(await this.adminRepo.findTechnology(releaseId, id))) throw new AdminNotFoundError(`Technology "${id}" not found.`)

    const refCount = await this.adminRepo.countStackPresetItemsReferencingTechnology(releaseId, id)
    if (refCount > 0) {
      throw new AdminConflictError(`Technology "${id}" is referenced by ${refCount} stack preset item(s). Remove it from those first.`)
    }
    await this.adminRepo.deleteTechnologyCascade(releaseId, id)
    return { id }
  }

  private buildTechnologyInput(
    body: Record<string, unknown>,
    categoryId: string,
  ): { input: TechnologyWriteInput; tagIds: string[] } {
    const technologyKind = requireOneOf(body.technologyKind, TECHNOLOGY_KINDS, 'technologyKind')
    const name = requireString(body.name, 'name')
    const description = requireString(body.description, 'description')
    const status = body.status === undefined ? 'active' : requireOneOf(body.status, TECHNOLOGY_STATUSES, 'status')
    const notes = optionalString(body.notes)

    const detail = (body.detail ?? undefined) as Record<string, unknown> | undefined
    const pricing = (body.pricing ?? undefined) as Record<string, unknown> | undefined
    const detailsPayload = detail || pricing ? { ...(detail ?? {}), ...(pricing ? { pricing } : {}) } : undefined
    const detailsJson = detailsPayload ? JSON.stringify(detailsPayload) : null

    const scores = (body.scores ?? {}) as Record<string, unknown>
    const tagIds = Array.isArray(body.tagIds) ? body.tagIds.filter((t): t is string => typeof t === 'string') : []

    void categoryId
    return {
      input: {
        categoryId,
        technologyKind,
        name,
        description,
        detailsJson,
        securityScore: optionalScore(scores.security, 'scores.security'),
        costScore: optionalScore(scores.cost, 'scores.cost'),
        developmentSpeedScore: optionalScore(scores.developmentSpeed, 'scores.developmentSpeed'),
        aiCodingScore: optionalScore(scores.aiCoding, 'scores.aiCoding'),
        scalabilityScore: optionalScore(scores.scalability, 'scores.scalability'),
        status: status as 'active' | 'deprecated',
        notes,
      },
      tagIds,
    }
  }

  // ---- Category --------------------------------------------------------

  async createCategory(payload: unknown): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    const body = payload as Record<string, unknown>
    const id = requireString(body.id, 'id')
    if (!SLUG_PATTERN.test(id)) throw new AdminValidationError('id must match ^[a-z0-9]+(-[a-z0-9]+)*$.')
    if (await this.adminRepo.findCategory(releaseId, id)) throw new AdminConflictError(`Category "${id}" already exists.`)

    const input = this.buildCategoryInput(body)
    await this.adminRepo.createCategory(releaseId, id, input)
    return { id }
  }

  async updateCategory(id: string, payload: unknown): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    if (!(await this.adminRepo.findCategory(releaseId, id))) throw new AdminNotFoundError(`Category "${id}" not found.`)
    const input = this.buildCategoryInput(payload as Record<string, unknown>)
    await this.adminRepo.updateCategory(releaseId, id, input)
    return { id }
  }

  async deleteCategory(id: string): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    if (!(await this.adminRepo.findCategory(releaseId, id))) throw new AdminNotFoundError(`Category "${id}" not found.`)
    const refCount = await this.adminRepo.countTechnologiesInCategory(releaseId, id)
    if (refCount > 0) {
      throw new AdminConflictError(`Category "${id}" is used by ${refCount} technology(ies). Move or delete them first.`)
    }
    await this.adminRepo.deleteCategory(releaseId, id)
    return { id }
  }

  private buildCategoryInput(body: Record<string, unknown>): CategoryWriteInput {
    const title = requireString(body.title, 'title')
    const sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : 0
    return { title, sortOrder }
  }

  // ---- Tag ---------------------------------------------------------------

  async createTag(payload: unknown): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    const body = payload as Record<string, unknown>
    const id = requireString(body.id, 'id')
    if (!SLUG_PATTERN.test(id)) throw new AdminValidationError('id must match ^[a-z0-9]+(-[a-z0-9]+)*$.')
    if (await this.adminRepo.findTag(releaseId, id)) throw new AdminConflictError(`Tag "${id}" already exists.`)

    const input = this.buildTagInput(body)
    await this.adminRepo.createTag(releaseId, id, input)
    return { id }
  }

  async updateTag(id: string, payload: unknown): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    if (!(await this.adminRepo.findTag(releaseId, id))) throw new AdminNotFoundError(`Tag "${id}" not found.`)
    const input = this.buildTagInput(payload as Record<string, unknown>)
    await this.adminRepo.updateTag(releaseId, id, input)
    return { id }
  }

  async deleteTag(id: string): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    if (!(await this.adminRepo.findTag(releaseId, id))) throw new AdminNotFoundError(`Tag "${id}" not found.`)
    await this.adminRepo.deleteTagCascade(releaseId, id)
    return { id }
  }

  private buildTagInput(body: Record<string, unknown>): TagWriteInput {
    const tagType = requireString(body.tagType, 'tagType')
    const label = requireString(body.label, 'label')
    const description = optionalString(body.description)
    return { tagType, label, description }
  }

  // ---- Stack Preset --------------------------------------------------------

  async createStackPreset(payload: unknown): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    const body = payload as Record<string, unknown>
    const id = requireString(body.id, 'id')
    if (!STACK_ID_PATTERN.test(id)) throw new AdminValidationError('id must match ^[A-Za-z0-9][A-Za-z0-9-]*$.')
    if (await this.adminRepo.findStackPreset(releaseId, id)) throw new AdminConflictError(`Stack preset "${id}" already exists.`)

    const { input, items } = await this.buildStackPresetInput(releaseId, body)
    await this.adminRepo.createStackPreset(releaseId, id, input, items)
    return { id }
  }

  async updateStackPreset(id: string, payload: unknown): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    if (!(await this.adminRepo.findStackPreset(releaseId, id))) throw new AdminNotFoundError(`Stack preset "${id}" not found.`)
    const { input, items } = await this.buildStackPresetInput(releaseId, payload as Record<string, unknown>)
    await this.adminRepo.updateStackPreset(releaseId, id, input, items)
    return { id }
  }

  async deleteStackPreset(id: string): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    if (!(await this.adminRepo.findStackPreset(releaseId, id))) throw new AdminNotFoundError(`Stack preset "${id}" not found.`)
    const refCount = await this.adminRepo.countPresetsReferencingParent(releaseId, id)
    if (refCount > 0) {
      throw new AdminConflictError(`Stack preset "${id}" is referenced as the parent pattern of ${refCount} preset(s). Remove those first.`)
    }
    await this.adminRepo.deleteStackPresetCascade(releaseId, id)
    return { id }
  }

  private async buildStackPresetInput(
    releaseId: number,
    body: Record<string, unknown>,
  ): Promise<{ input: StackPresetWriteInput; items: StackPresetItemInput[] }> {
    const presetType = requireOneOf(body.presetType, PRESET_TYPES, 'presetType')
    const name = requireString(body.name, 'name')

    let presetKind: string | null = null
    let parentPatternId: string | null = null
    let appTypeIdsJson: string | null = null

    if (presetType === 'architecture_pattern') {
      presetKind = requireOneOf(body.presetKind, PRESET_KINDS, 'presetKind')
      if (presetKind === 'stack_profile') {
        parentPatternId = requireString(body.parentPatternId, 'parentPatternId')
        const parent = await this.adminRepo.findStackPreset(releaseId, parentPatternId)
        if (!parent || parent.preset_kind !== 'pattern_definition') {
          throw new AdminValidationError(`parentPatternId "${parentPatternId}" must reference an existing pattern_definition preset.`)
        }
        const appTypeIds = Array.isArray(body.appTypeIds) ? body.appTypeIds.filter((v): v is string => typeof v === 'string') : []
        appTypeIdsJson = appTypeIds.length > 0 ? JSON.stringify(appTypeIds) : null
      }
    }

    const detail = body.detail
    const detailsJson = detail && typeof detail === 'object' ? JSON.stringify(detail) : null

    const rawItems = Array.isArray(body.items) ? body.items : []
    const items: StackPresetItemInput[] = rawItems.map((raw, index) => {
      const item = raw as Record<string, unknown>
      return {
        technologyId: typeof item.technologyId === 'string' ? item.technologyId : null,
        role: typeof item.role === 'string' ? item.role : null,
        label: typeof item.label === 'string' ? item.label : null,
        sortOrder: index,
      }
    })

    return {
      input: { presetType, presetKind, parentPatternId, name, appTypeIdsJson, detailsJson },
      items,
    }
  }

  // ---- Rule ------------------------------------------------------------

  async createRule(payload: unknown): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    const body = payload as Record<string, unknown>
    const ruleType = requireOneOf(body.ruleType, RULE_TYPES, 'ruleType')
    const technologyId = requireString(body.technologyId, 'technologyId')
    if (!(await this.adminRepo.findTechnology(releaseId, technologyId))) {
      throw new AdminValidationError(`technologyId "${technologyId}" does not exist.`)
    }

    let presetId: string | null = null
    let conditionKey: string | null = null
    let conditionValue: string | null = null

    if (ruleType === 'preferred_for_preset') {
      presetId = requireString(body.presetId, 'presetId')
      if (!(await this.adminRepo.findStackPreset(releaseId, presetId))) {
        throw new AdminValidationError(`presetId "${presetId}" does not exist.`)
      }
    } else {
      conditionKey = requireString(body.conditionKey, 'conditionKey')
      conditionValue = requireString(body.conditionValue, 'conditionValue')
    }

    const input: RuleWriteInput = { ruleType, technologyId, tagId: null, presetId, conditionKey, conditionValue }
    const id = crypto.randomUUID()
    await this.adminRepo.createRule(releaseId, id, input)
    return { id }
  }

  async deleteRule(id: string): Promise<{ id: string }> {
    const releaseId = await resolvePublishedReleaseId(this.registryRepo)
    const deleted = await this.adminRepo.deleteRule(releaseId, id)
    if (!deleted) throw new AdminNotFoundError(`Rule "${id}" not found.`)
    return { id }
  }
}
