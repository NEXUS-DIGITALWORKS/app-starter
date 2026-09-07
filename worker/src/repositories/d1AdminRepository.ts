import type {
  AdminRepository,
  CategoryWriteInput,
  RuleWriteInput,
  StackPresetItemInput,
  StackPresetWriteInput,
  TagWriteInput,
  TechnologyWriteInput,
} from './adminRepository'
import type { CategoryRow, StackPresetItemRow, StackPresetRow, TagRow, TechnologyRow } from './types'

async function nextSortOrder(db: D1Database, table: string, whereSql: string, bindings: unknown[]): Promise<number> {
  const row = await db
    .prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM ${table} WHERE ${whereSql}`)
    .bind(...bindings)
    .first<{ next: number }>()
  return row?.next ?? 0
}

export class D1AdminRepository implements AdminRepository {
  constructor(private readonly db: D1Database) {}

  // ---- Technology ----------------------------------------------------

  async findTechnology(releaseId: number, id: string): Promise<TechnologyRow | null> {
    const row = await this.db
      .prepare('SELECT * FROM registry_technologies WHERE release_id = ? AND id = ?')
      .bind(releaseId, id)
      .first<TechnologyRow>()
    return row ?? null
  }

  async listTechnologyTagIds(releaseId: number, technologyId: string): Promise<string[]> {
    const { results } = await this.db
      .prepare('SELECT tag_id FROM registry_technology_tags WHERE release_id = ? AND technology_id = ?')
      .bind(releaseId, technologyId)
      .all<{ tag_id: string }>()
    return results.map((r) => r.tag_id)
  }

  async createTechnology(releaseId: number, id: string, input: TechnologyWriteInput, tagIds: string[]): Promise<void> {
    const sortOrder = await nextSortOrder(this.db, 'registry_technologies', 'release_id = ? AND category_id = ?', [
      releaseId,
      input.categoryId,
    ])
    const statements = [
      this.db
        .prepare(
          `INSERT INTO registry_technologies
           (id, release_id, category_id, technology_kind, name, description, details_json,
            security_score, cost_score, development_speed_score, ai_coding_score, scalability_score, status, notes, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          releaseId,
          input.categoryId,
          input.technologyKind,
          input.name,
          input.description,
          input.detailsJson,
          input.securityScore,
          input.costScore,
          input.developmentSpeedScore,
          input.aiCodingScore,
          input.scalabilityScore,
          input.status,
          input.notes,
          sortOrder,
        ),
      ...tagIds.map((tagId) =>
        this.db
          .prepare('INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (?, ?, ?)')
          .bind(releaseId, id, tagId),
      ),
    ]
    await this.db.batch(statements)
  }

  async updateTechnology(releaseId: number, id: string, input: TechnologyWriteInput, tagIds: string[]): Promise<void> {
    const statements = [
      this.db
        .prepare(
          `UPDATE registry_technologies SET
             category_id = ?, technology_kind = ?, name = ?, description = ?, details_json = ?,
             security_score = ?, cost_score = ?, development_speed_score = ?, ai_coding_score = ?, scalability_score = ?,
             status = ?, notes = ?
           WHERE release_id = ? AND id = ?`,
        )
        .bind(
          input.categoryId,
          input.technologyKind,
          input.name,
          input.description,
          input.detailsJson,
          input.securityScore,
          input.costScore,
          input.developmentSpeedScore,
          input.aiCodingScore,
          input.scalabilityScore,
          input.status,
          input.notes,
          releaseId,
          id,
        ),
      this.db.prepare('DELETE FROM registry_technology_tags WHERE release_id = ? AND technology_id = ?').bind(releaseId, id),
      ...tagIds.map((tagId) =>
        this.db
          .prepare('INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (?, ?, ?)')
          .bind(releaseId, id, tagId),
      ),
    ]
    await this.db.batch(statements)
  }

  async countStackPresetItemsReferencingTechnology(releaseId: number, technologyId: string): Promise<number> {
    const row = await this.db
      .prepare('SELECT COUNT(*) AS cnt FROM registry_stack_preset_items WHERE release_id = ? AND technology_id = ?')
      .bind(releaseId, technologyId)
      .first<{ cnt: number }>()
    return row?.cnt ?? 0
  }

  async deleteTechnologyCascade(releaseId: number, id: string): Promise<void> {
    await this.db.batch([
      this.db.prepare('DELETE FROM registry_technology_tags WHERE release_id = ? AND technology_id = ?').bind(releaseId, id),
      this.db.prepare('DELETE FROM registry_rules WHERE release_id = ? AND technology_id = ?').bind(releaseId, id),
      this.db.prepare('DELETE FROM registry_technologies WHERE release_id = ? AND id = ?').bind(releaseId, id),
    ])
  }

  // ---- Category --------------------------------------------------------

  async findCategory(releaseId: number, id: string): Promise<CategoryRow | null> {
    const row = await this.db
      .prepare('SELECT * FROM registry_categories WHERE release_id = ? AND id = ?')
      .bind(releaseId, id)
      .first<CategoryRow>()
    return row ?? null
  }

  async createCategory(releaseId: number, id: string, input: CategoryWriteInput): Promise<void> {
    await this.db
      .prepare('INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES (?, ?, ?, ?)')
      .bind(id, releaseId, input.title, input.sortOrder)
      .run()
  }

  async updateCategory(releaseId: number, id: string, input: CategoryWriteInput): Promise<void> {
    await this.db
      .prepare('UPDATE registry_categories SET title = ?, sort_order = ? WHERE release_id = ? AND id = ?')
      .bind(input.title, input.sortOrder, releaseId, id)
      .run()
  }

  async countTechnologiesInCategory(releaseId: number, categoryId: string): Promise<number> {
    const row = await this.db
      .prepare('SELECT COUNT(*) AS cnt FROM registry_technologies WHERE release_id = ? AND category_id = ?')
      .bind(releaseId, categoryId)
      .first<{ cnt: number }>()
    return row?.cnt ?? 0
  }

  async deleteCategory(releaseId: number, id: string): Promise<void> {
    await this.db.prepare('DELETE FROM registry_categories WHERE release_id = ? AND id = ?').bind(releaseId, id).run()
  }

  // ---- Tag ---------------------------------------------------------------

  async findTag(releaseId: number, id: string): Promise<TagRow | null> {
    const row = await this.db.prepare('SELECT * FROM registry_tags WHERE release_id = ? AND id = ?').bind(releaseId, id).first<TagRow>()
    return row ?? null
  }

  async createTag(releaseId: number, id: string, input: TagWriteInput): Promise<void> {
    const sortOrder = await nextSortOrder(this.db, 'registry_tags', 'release_id = ?', [releaseId])
    await this.db
      .prepare('INSERT INTO registry_tags (id, release_id, tag_type, label, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, releaseId, input.tagType, input.label, input.description, sortOrder)
      .run()
  }

  async updateTag(releaseId: number, id: string, input: TagWriteInput): Promise<void> {
    await this.db
      .prepare('UPDATE registry_tags SET tag_type = ?, label = ?, description = ? WHERE release_id = ? AND id = ?')
      .bind(input.tagType, input.label, input.description, releaseId, id)
      .run()
  }

  async deleteTagCascade(releaseId: number, id: string): Promise<void> {
    await this.db.batch([
      this.db.prepare('DELETE FROM registry_technology_tags WHERE release_id = ? AND tag_id = ?').bind(releaseId, id),
      this.db.prepare('DELETE FROM registry_rules WHERE release_id = ? AND tag_id = ?').bind(releaseId, id),
      this.db.prepare('DELETE FROM registry_tags WHERE release_id = ? AND id = ?').bind(releaseId, id),
    ])
  }

  // ---- Stack Preset --------------------------------------------------------

  async findStackPreset(releaseId: number, id: string): Promise<StackPresetRow | null> {
    const row = await this.db
      .prepare('SELECT * FROM registry_stack_presets WHERE release_id = ? AND id = ?')
      .bind(releaseId, id)
      .first<StackPresetRow>()
    return row ?? null
  }

  async listStackPresetItems(releaseId: number, presetId: string): Promise<StackPresetItemRow[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM registry_stack_preset_items WHERE release_id = ? AND preset_id = ? ORDER BY sort_order')
      .bind(releaseId, presetId)
      .all<StackPresetItemRow>()
    return results
  }

  async createStackPreset(
    releaseId: number,
    id: string,
    input: StackPresetWriteInput,
    items: StackPresetItemInput[],
  ): Promise<void> {
    const sortOrder = await nextSortOrder(this.db, 'registry_stack_presets', 'release_id = ? AND preset_type = ?', [
      releaseId,
      input.presetType,
    ])
    const statements = [
      this.db
        .prepare(
          `INSERT INTO registry_stack_presets
           (id, release_id, preset_type, preset_kind, parent_pattern_id, name, app_type_ids, details_json, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          releaseId,
          input.presetType,
          input.presetKind,
          input.parentPatternId,
          input.name,
          input.appTypeIdsJson,
          input.detailsJson,
          sortOrder,
        ),
      ...items.map((item) =>
        this.db
          .prepare(
            'INSERT INTO registry_stack_preset_items (release_id, preset_id, technology_id, role, label_override, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          )
          .bind(releaseId, id, item.technologyId, item.role, item.label, item.sortOrder),
      ),
    ]
    await this.db.batch(statements)
  }

  async updateStackPreset(
    releaseId: number,
    id: string,
    input: StackPresetWriteInput,
    items: StackPresetItemInput[],
  ): Promise<void> {
    const statements = [
      this.db
        .prepare(
          `UPDATE registry_stack_presets SET
             preset_type = ?, preset_kind = ?, parent_pattern_id = ?, name = ?, app_type_ids = ?, details_json = ?
           WHERE release_id = ? AND id = ?`,
        )
        .bind(input.presetType, input.presetKind, input.parentPatternId, input.name, input.appTypeIdsJson, input.detailsJson, releaseId, id),
      this.db.prepare('DELETE FROM registry_stack_preset_items WHERE release_id = ? AND preset_id = ?').bind(releaseId, id),
      ...items.map((item) =>
        this.db
          .prepare(
            'INSERT INTO registry_stack_preset_items (release_id, preset_id, technology_id, role, label_override, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          )
          .bind(releaseId, id, item.technologyId, item.role, item.label, item.sortOrder),
      ),
    ]
    await this.db.batch(statements)
  }

  async countPresetsReferencingParent(releaseId: number, parentPatternId: string): Promise<number> {
    const row = await this.db
      .prepare('SELECT COUNT(*) AS cnt FROM registry_stack_presets WHERE release_id = ? AND parent_pattern_id = ?')
      .bind(releaseId, parentPatternId)
      .first<{ cnt: number }>()
    return row?.cnt ?? 0
  }

  async deleteStackPresetCascade(releaseId: number, id: string): Promise<void> {
    await this.db.batch([
      this.db.prepare('DELETE FROM registry_stack_preset_items WHERE release_id = ? AND preset_id = ?').bind(releaseId, id),
      this.db.prepare('DELETE FROM registry_rules WHERE release_id = ? AND preset_id = ?').bind(releaseId, id),
      this.db.prepare('DELETE FROM registry_stack_presets WHERE release_id = ? AND id = ?').bind(releaseId, id),
    ])
  }

  // ---- Rule ------------------------------------------------------------

  async createRule(releaseId: number, id: string, input: RuleWriteInput): Promise<void> {
    const sortOrder = await nextSortOrder(this.db, 'registry_rules', 'release_id = ?', [releaseId])
    await this.db
      .prepare(
        `INSERT INTO registry_rules (id, release_id, rule_type, technology_id, tag_id, preset_id, condition_key, condition_value, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, releaseId, input.ruleType, input.technologyId, input.tagId, input.presetId, input.conditionKey, input.conditionValue, sortOrder)
      .run()
  }

  async deleteRule(releaseId: number, id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM registry_rules WHERE release_id = ? AND id = ?').bind(releaseId, id).run()
    return (result.meta.changes ?? 0) > 0
  }
}
