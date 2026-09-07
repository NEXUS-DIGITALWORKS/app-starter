import { beforeEach, describe, expect, it } from 'vitest'
import { AdminConflictError, AdminNotFoundError, AdminService, AdminValidationError } from './adminService'
import type { RegistryRepository, RegistrySnapshotRows } from '../repositories/registryRepository'
import type {
  AdminRepository,
  CategoryWriteInput,
  RuleWriteInput,
  StackPresetItemInput,
  StackPresetWriteInput,
  TagWriteInput,
  TechnologyWriteInput,
} from '../repositories/adminRepository'
import type { CategoryRow, ReleaseRow, StackPresetItemRow, StackPresetRow, TagRow, TechnologyRow } from '../repositories/types'

const RELEASE_ID = 1

class FakeRegistryRepository implements RegistryRepository {
  async findLatestPublishedRelease(): Promise<ReleaseRow | null> {
    return { id: RELEASE_ID, version_label: 'test', status: 'published', notes: null, created_at: '', published_at: '' }
  }
  async findReleaseByVersion(): Promise<ReleaseRow | null> {
    throw new Error('not used in tests')
  }
  async loadSnapshotRows(): Promise<RegistrySnapshotRows> {
    throw new Error('not used in tests')
  }
}

type RuleRecord = {
  id: string
  technology_id: string | null
  tag_id: string | null
  preset_id: string | null
}

class FakeAdminRepository implements AdminRepository {
  technologies = new Map<string, TechnologyRow>()
  technologyTags = new Map<string, Set<string>>()
  categories = new Map<string, CategoryRow>()
  tags = new Map<string, TagRow>()
  stackPresets = new Map<string, StackPresetRow>()
  stackPresetItems = new Map<string, StackPresetItemRow[]>()
  rules = new Map<string, RuleRecord>()

  async findTechnology(_releaseId: number, id: string) {
    return this.technologies.get(id) ?? null
  }
  async listTechnologyTagIds(_releaseId: number, technologyId: string) {
    return [...(this.technologyTags.get(technologyId) ?? [])]
  }
  async createTechnology(releaseId: number, id: string, input: TechnologyWriteInput, tagIds: string[]) {
    this.technologies.set(id, {
      id,
      release_id: releaseId,
      category_id: input.categoryId,
      technology_kind: input.technologyKind,
      name: input.name,
      description: input.description,
      details_json: input.detailsJson,
      security_score: input.securityScore,
      cost_score: input.costScore,
      development_speed_score: input.developmentSpeedScore,
      ai_coding_score: input.aiCodingScore,
      scalability_score: input.scalabilityScore,
      status: input.status,
      notes: input.notes,
      sort_order: 0,
    })
    this.technologyTags.set(id, new Set(tagIds))
  }
  async updateTechnology(_releaseId: number, id: string, input: TechnologyWriteInput, tagIds: string[]) {
    const existing = this.technologies.get(id)!
    this.technologies.set(id, {
      ...existing,
      category_id: input.categoryId,
      technology_kind: input.technologyKind,
      name: input.name,
      description: input.description,
      details_json: input.detailsJson,
      security_score: input.securityScore,
      cost_score: input.costScore,
      development_speed_score: input.developmentSpeedScore,
      ai_coding_score: input.aiCodingScore,
      scalability_score: input.scalabilityScore,
      status: input.status,
      notes: input.notes,
    })
    this.technologyTags.set(id, new Set(tagIds))
  }
  async countStackPresetItemsReferencingTechnology(_releaseId: number, technologyId: string) {
    let count = 0
    for (const items of this.stackPresetItems.values()) count += items.filter((i) => i.technology_id === technologyId).length
    return count
  }
  async deleteTechnologyCascade(_releaseId: number, id: string) {
    this.technologies.delete(id)
    this.technologyTags.delete(id)
    for (const [ruleId, rule] of this.rules) if (rule.technology_id === id) this.rules.delete(ruleId)
  }

  async findCategory(_releaseId: number, id: string) {
    return this.categories.get(id) ?? null
  }
  async createCategory(releaseId: number, id: string, input: CategoryWriteInput) {
    this.categories.set(id, { id, release_id: releaseId, title: input.title, sort_order: input.sortOrder })
  }
  async updateCategory(_releaseId: number, id: string, input: CategoryWriteInput) {
    const existing = this.categories.get(id)!
    this.categories.set(id, { ...existing, title: input.title, sort_order: input.sortOrder })
  }
  async countTechnologiesInCategory(_releaseId: number, categoryId: string) {
    return [...this.technologies.values()].filter((t) => t.category_id === categoryId).length
  }
  async deleteCategory(_releaseId: number, id: string) {
    this.categories.delete(id)
  }

  async findTag(_releaseId: number, id: string) {
    return this.tags.get(id) ?? null
  }
  async createTag(releaseId: number, id: string, input: TagWriteInput) {
    this.tags.set(id, { id, release_id: releaseId, tag_type: input.tagType, label: input.label, description: input.description, sort_order: 0 })
  }
  async updateTag(_releaseId: number, id: string, input: TagWriteInput) {
    const existing = this.tags.get(id)!
    this.tags.set(id, { ...existing, tag_type: input.tagType, label: input.label, description: input.description })
  }
  async deleteTagCascade(_releaseId: number, id: string) {
    this.tags.delete(id)
    for (const tagSet of this.technologyTags.values()) tagSet.delete(id)
    for (const [ruleId, rule] of this.rules) if (rule.tag_id === id) this.rules.delete(ruleId)
  }

  async findStackPreset(_releaseId: number, id: string) {
    return this.stackPresets.get(id) ?? null
  }
  async listStackPresetItems(_releaseId: number, presetId: string) {
    return this.stackPresetItems.get(presetId) ?? []
  }
  async createStackPreset(releaseId: number, id: string, input: StackPresetWriteInput, items: StackPresetItemInput[]) {
    this.stackPresets.set(id, {
      id,
      release_id: releaseId,
      preset_type: input.presetType,
      preset_kind: input.presetKind,
      parent_pattern_id: input.parentPatternId,
      name: input.name,
      app_type_ids: input.appTypeIdsJson,
      details_json: input.detailsJson,
      sort_order: 0,
    })
    this.stackPresetItems.set(
      id,
      items.map((item, i) => ({
        id: i,
        release_id: releaseId,
        preset_id: id,
        technology_id: item.technologyId,
        role: item.role,
        label_override: item.label,
        sort_order: item.sortOrder,
      })),
    )
  }
  async updateStackPreset(releaseId: number, id: string, input: StackPresetWriteInput, items: StackPresetItemInput[]) {
    const existing = this.stackPresets.get(id)!
    this.stackPresets.set(id, {
      ...existing,
      preset_type: input.presetType,
      preset_kind: input.presetKind,
      parent_pattern_id: input.parentPatternId,
      name: input.name,
      app_type_ids: input.appTypeIdsJson,
      details_json: input.detailsJson,
    })
    this.stackPresetItems.set(
      id,
      items.map((item, i) => ({
        id: i,
        release_id: releaseId,
        preset_id: id,
        technology_id: item.technologyId,
        role: item.role,
        label_override: item.label,
        sort_order: item.sortOrder,
      })),
    )
  }
  async countPresetsReferencingParent(_releaseId: number, parentPatternId: string) {
    return [...this.stackPresets.values()].filter((p) => p.parent_pattern_id === parentPatternId).length
  }
  async deleteStackPresetCascade(_releaseId: number, id: string) {
    this.stackPresets.delete(id)
    this.stackPresetItems.delete(id)
    for (const [ruleId, rule] of this.rules) if (rule.preset_id === id) this.rules.delete(ruleId)
  }

  async createRule(_releaseId: number, id: string, input: RuleWriteInput) {
    this.rules.set(id, { id, technology_id: input.technologyId, tag_id: input.tagId, preset_id: input.presetId })
  }
  async deleteRule(_releaseId: number, id: string) {
    return this.rules.delete(id)
  }
}

describe('AdminService', () => {
  let adminRepo: FakeAdminRepository
  let service: AdminService

  beforeEach(() => {
    adminRepo = new FakeAdminRepository()
    service = new AdminService(new FakeRegistryRepository(), adminRepo)
    adminRepo.categories.set('frontend', { id: 'frontend', release_id: RELEASE_ID, title: 'フロントエンド', sort_order: 0 })
    adminRepo.tags.set('app_type:internal_ops', {
      id: 'app_type:internal_ops',
      release_id: RELEASE_ID,
      tag_type: 'app_type',
      label: '社内業務システム',
      description: null,
      sort_order: 0,
    })
  })

  describe('Technology', () => {
    it('creates a technology with valid input', async () => {
      const result = await service.createTechnology({
        id: 'react-vite',
        categoryId: 'frontend',
        technologyKind: 'framework',
        name: 'React+Vite',
        description: 'desc',
        tagIds: ['app_type:internal_ops'],
      })
      expect(result.id).toBe('react-vite')
      expect(adminRepo.technologies.get('react-vite')?.name).toBe('React+Vite')
      expect(adminRepo.technologyTags.get('react-vite')).toEqual(new Set(['app_type:internal_ops']))
    })

    it('rejects invalid id format', async () => {
      await expect(
        service.createTechnology({ id: 'React Vite', categoryId: 'frontend', technologyKind: 'framework', name: 'x', description: 'x' }),
      ).rejects.toThrow(AdminValidationError)
    })

    it('rejects duplicate id', async () => {
      await service.createTechnology({ id: 'react-vite', categoryId: 'frontend', technologyKind: 'framework', name: 'x', description: 'x' })
      await expect(
        service.createTechnology({ id: 'react-vite', categoryId: 'frontend', technologyKind: 'framework', name: 'y', description: 'y' }),
      ).rejects.toThrow(AdminConflictError)
    })

    it('rejects unknown categoryId', async () => {
      await expect(
        service.createTechnology({ id: 'react-vite', categoryId: 'nope', technologyKind: 'framework', name: 'x', description: 'x' }),
      ).rejects.toThrow(AdminValidationError)
    })

    it('rejects out-of-range scores', async () => {
      await expect(
        service.createTechnology({
          id: 'react-vite',
          categoryId: 'frontend',
          technologyKind: 'framework',
          name: 'x',
          description: 'x',
          scores: { security: 6 },
        }),
      ).rejects.toThrow(AdminValidationError)
    })

    it('updateTechnology throws NotFound for missing id', async () => {
      await expect(service.updateTechnology('missing', { categoryId: 'frontend', technologyKind: 'framework', name: 'x', description: 'x' })).rejects.toThrow(
        AdminNotFoundError,
      )
    })

    it('deleteTechnology cascades own tag assignments', async () => {
      await service.createTechnology({
        id: 'react-vite',
        categoryId: 'frontend',
        technologyKind: 'framework',
        name: 'x',
        description: 'x',
        tagIds: ['app_type:internal_ops'],
      })
      await service.deleteTechnology('react-vite')
      expect(adminRepo.technologies.has('react-vite')).toBe(false)
      expect(adminRepo.technologyTags.has('react-vite')).toBe(false)
    })

    it('deleteTechnology blocks when referenced by a stack preset item', async () => {
      await service.createTechnology({ id: 'react-vite', categoryId: 'frontend', technologyKind: 'framework', name: 'x', description: 'x' })
      adminRepo.stackPresetItems.set('WEB-01', [
        { id: 1, release_id: RELEASE_ID, preset_id: 'WEB-01', technology_id: 'react-vite', role: null, label_override: null, sort_order: 0 },
      ])
      await expect(service.deleteTechnology('react-vite')).rejects.toThrow(AdminConflictError)
      expect(adminRepo.technologies.has('react-vite')).toBe(true)
    })
  })

  describe('Category', () => {
    it('blocks deletion when technologies reference it', async () => {
      await service.createTechnology({ id: 'react-vite', categoryId: 'frontend', technologyKind: 'framework', name: 'x', description: 'x' })
      await expect(service.deleteCategory('frontend')).rejects.toThrow(AdminConflictError)
    })

    it('deletes when unreferenced', async () => {
      await service.createCategory({ id: 'backend', title: 'バックエンド' })
      await service.deleteCategory('backend')
      expect(adminRepo.categories.has('backend')).toBe(false)
    })
  })

  describe('Tag', () => {
    it('cascades technology_tags on delete', async () => {
      await service.createTechnology({
        id: 'react-vite',
        categoryId: 'frontend',
        technologyKind: 'framework',
        name: 'x',
        description: 'x',
        tagIds: ['app_type:internal_ops'],
      })
      await service.deleteTag('app_type:internal_ops')
      expect(adminRepo.tags.has('app_type:internal_ops')).toBe(false)
      expect(adminRepo.technologyTags.get('react-vite')?.has('app_type:internal_ops')).toBe(false)
    })
  })

  describe('Stack Preset', () => {
    beforeEach(() => {
      adminRepo.stackPresets.set('P1', {
        id: 'P1',
        release_id: RELEASE_ID,
        preset_type: 'architecture_pattern',
        preset_kind: 'pattern_definition',
        parent_pattern_id: null,
        name: '統合型Webアプリ',
        app_type_ids: null,
        details_json: null,
        sort_order: 0,
      })
    })

    it('creates a stack_profile referencing an existing pattern_definition parent', async () => {
      const result = await service.createStackPreset({
        id: 'SP-01',
        presetType: 'architecture_pattern',
        presetKind: 'stack_profile',
        parentPatternId: 'P1',
        name: 'テスト構成',
        appTypeIds: ['internal_ops'],
        items: [{ role: 'frontend', label: 'Next.js' }],
      })
      expect(result.id).toBe('SP-01')
      expect(adminRepo.stackPresetItems.get('SP-01')).toHaveLength(1)
    })

    it('rejects stack_profile with a non-existent parentPatternId', async () => {
      await expect(
        service.createStackPreset({
          id: 'SP-01',
          presetType: 'architecture_pattern',
          presetKind: 'stack_profile',
          parentPatternId: 'P999',
          name: 'x',
          items: [],
        }),
      ).rejects.toThrow(AdminValidationError)
    })

    it('blocks deleting a pattern_definition still referenced as a parent', async () => {
      await service.createStackPreset({
        id: 'SP-01',
        presetType: 'architecture_pattern',
        presetKind: 'stack_profile',
        parentPatternId: 'P1',
        name: 'x',
        items: [],
      })
      await expect(service.deleteStackPreset('P1')).rejects.toThrow(AdminConflictError)
    })

    it('cascades own items and rules on delete', async () => {
      await service.createStackPreset({
        id: 'SP-01',
        presetType: 'architecture_pattern',
        presetKind: 'stack_profile',
        parentPatternId: 'P1',
        name: 'x',
        items: [{ role: 'frontend', label: 'Next.js' }],
      })
      await service.deleteStackPreset('SP-01')
      expect(adminRepo.stackPresets.has('SP-01')).toBe(false)
      expect(adminRepo.stackPresetItems.has('SP-01')).toBe(false)
    })
  })

  describe('Rule', () => {
    beforeEach(async () => {
      await service.createTechnology({ id: 'kintone', categoryId: 'frontend', technologyKind: 'saas', name: 'kintone', description: 'x' })
      adminRepo.stackPresets.set('P4', {
        id: 'P4',
        release_id: RELEASE_ID,
        preset_type: 'architecture_pattern',
        preset_kind: 'pattern_definition',
        parent_pattern_id: null,
        name: 'Microsoft統合型',
        app_type_ids: null,
        details_json: null,
        sort_order: 0,
      })
    })

    it('creates a preferred_for_preset rule', async () => {
      const result = await service.createRule({ ruleType: 'preferred_for_preset', technologyId: 'kintone', presetId: 'P4' })
      expect(adminRepo.rules.get(result.id)?.preset_id).toBe('P4')
    })

    it('rejects unknown technologyId', async () => {
      await expect(service.createRule({ ruleType: 'preferred_for_preset', technologyId: 'nope', presetId: 'P4' })).rejects.toThrow(
        AdminValidationError,
      )
    })

    it('deleteRule throws NotFound for missing id', async () => {
      await expect(service.deleteRule('missing-id')).rejects.toThrow(AdminNotFoundError)
    })
  })
})
