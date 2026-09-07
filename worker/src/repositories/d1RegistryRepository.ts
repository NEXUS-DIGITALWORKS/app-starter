import type { RegistryRepository, RegistrySnapshotRows } from './registryRepository'
import type {
  CategoryRow,
  ReleaseRow,
  RuleRow,
  StackPresetItemRow,
  StackPresetRow,
  TagRow,
  TechnologyRow,
  TechnologyTagRow,
} from './types'

export class D1RegistryRepository implements RegistryRepository {
  constructor(private readonly db: D1Database) {}

  async findLatestPublishedRelease(): Promise<ReleaseRow | null> {
    const row = await this.db
      .prepare(`SELECT * FROM registry_releases WHERE status = 'published' ORDER BY published_at DESC LIMIT 1`)
      .first<ReleaseRow>()
    return row ?? null
  }

  async findReleaseByVersion(versionLabel: string): Promise<ReleaseRow | null> {
    const row = await this.db
      .prepare(`SELECT * FROM registry_releases WHERE version_label = ?`)
      .bind(versionLabel)
      .first<ReleaseRow>()
    return row ?? null
  }

  async loadSnapshotRows(releaseId: number): Promise<RegistrySnapshotRows> {
    const [release, categories, technologies, tags, technologyTags, stacks, stackItems, rules] = await Promise.all([
      this.db.prepare('SELECT * FROM registry_releases WHERE id = ?').bind(releaseId).first<ReleaseRow>(),
      this.db.prepare('SELECT * FROM registry_categories WHERE release_id = ? ORDER BY sort_order').bind(releaseId).all<CategoryRow>(),
      this.db
        .prepare('SELECT * FROM registry_technologies WHERE release_id = ? ORDER BY sort_order')
        .bind(releaseId)
        .all<TechnologyRow>(),
      this.db.prepare('SELECT * FROM registry_tags WHERE release_id = ? ORDER BY sort_order').bind(releaseId).all<TagRow>(),
      this.db.prepare('SELECT * FROM registry_technology_tags WHERE release_id = ?').bind(releaseId).all<TechnologyTagRow>(),
      this.db
        .prepare('SELECT * FROM registry_stack_presets WHERE release_id = ? ORDER BY sort_order')
        .bind(releaseId)
        .all<StackPresetRow>(),
      this.db
        .prepare('SELECT * FROM registry_stack_preset_items WHERE release_id = ? ORDER BY sort_order')
        .bind(releaseId)
        .all<StackPresetItemRow>(),
      this.db.prepare('SELECT * FROM registry_rules WHERE release_id = ? ORDER BY sort_order').bind(releaseId).all<RuleRow>(),
    ])

    if (!release) throw new Error(`release ${releaseId} not found`)

    return {
      release,
      categories: categories.results,
      technologies: technologies.results,
      tags: tags.results,
      technologyTags: technologyTags.results,
      stacks: stacks.results,
      stackItems: stackItems.results,
      rules: rules.results,
    }
  }
}
