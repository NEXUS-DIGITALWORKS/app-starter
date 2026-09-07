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

export type RegistrySnapshotRows = {
  release: ReleaseRow
  categories: CategoryRow[]
  technologies: TechnologyRow[]
  tags: TagRow[]
  technologyTags: TechnologyTagRow[]
  stacks: StackPresetRow[]
  stackItems: StackPresetItemRow[]
  rules: RuleRow[]
}

/**
 * D1依存を隔離するためのインターフェース。将来のDB差し替え（例: Neon/PostgreSQL）に備え、
 * Service層はこのインターフェースのみに依存し、D1固有コードは d1RegistryRepository.ts に閉じ込める。
 */
export interface RegistryRepository {
  findLatestPublishedRelease(): Promise<ReleaseRow | null>
  findReleaseByVersion(versionLabel: string): Promise<ReleaseRow | null>
  loadSnapshotRows(releaseId: number): Promise<RegistrySnapshotRows>
}
