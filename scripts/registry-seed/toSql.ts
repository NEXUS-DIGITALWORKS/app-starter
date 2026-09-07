/**
 * RegistryData → D1向け INSERT文（SQL文字列）を生成する。
 * 出力は `worker/migrations/0003_seed_release_v1_NNN.sql` に分割して書き込まれる
 * （D1リモートAPIの1リクエストあたりのペイロードサイズ制限のため、1ファイルを大きくしすぎない）。
 */
import type { RegistryData } from '../../src/lib/registry/types'

const MAX_CHUNK_BYTES = 40_000

function sqlString(value: string | undefined | null): string {
  if (value === undefined || value === null) return 'NULL'
  return `'${value.replace(/'/g, "''")}'`
}

function sqlNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'NULL'
  return String(value)
}

function sqlJson(value: unknown): string {
  if (value === undefined) return 'NULL'
  return sqlString(JSON.stringify(value))
}

function releaseStatement(data: RegistryData): string {
  const releaseId = data.version.releaseId
  return `INSERT INTO registry_releases (id, version_label, status, notes, created_at, published_at) VALUES (${releaseId}, ${sqlString(
    data.version.versionLabel,
  )}, 'published', ${sqlString('初期データ移行（Supabase未接続のためP4スコープ内で新規作成）')}, ${sqlString(
    data.version.publishedAt,
  )}, ${sqlString(data.version.publishedAt)});`
}

function categoryStatements(data: RegistryData): string[] {
  const releaseId = data.version.releaseId
  return data.categories.map(
    (category) =>
      `INSERT INTO registry_categories (id, release_id, title, sort_order) VALUES (${sqlString(category.id)}, ${releaseId}, ${sqlString(
        category.title,
      )}, ${sqlNumber(category.sortOrder)});`,
  )
}

function technologyStatements(data: RegistryData): string[] {
  const releaseId = data.version.releaseId
  return data.technologies.map(
    (tech) =>
      `INSERT INTO registry_technologies (id, release_id, category_id, technology_kind, name, description, details_json, security_score, cost_score, development_speed_score, ai_coding_score, scalability_score, status, notes, sort_order) VALUES (${sqlString(
        tech.id,
      )}, ${releaseId}, ${sqlString(tech.categoryId)}, ${sqlString(tech.technologyKind)}, ${sqlString(tech.name)}, ${sqlString(
        tech.description,
      )}, ${sqlJson(tech.detail ? { ...tech.detail, pricing: tech.pricing } : tech.pricing ? { pricing: tech.pricing } : undefined)}, ${sqlNumber(
        tech.scores?.security,
      )}, ${sqlNumber(tech.scores?.cost)}, ${sqlNumber(tech.scores?.developmentSpeed)}, ${sqlNumber(tech.scores?.aiCoding)}, ${sqlNumber(
        tech.scores?.scalability,
      )}, ${sqlString(tech.status)}, ${sqlString(tech.notes)}, ${sqlNumber(tech.sortOrder)});`,
  )
}

function tagStatements(data: RegistryData): string[] {
  const releaseId = data.version.releaseId
  return data.tags.map(
    (tag, index) =>
      `INSERT INTO registry_tags (id, release_id, tag_type, label, description, sort_order) VALUES (${sqlString(tag.id)}, ${releaseId}, ${sqlString(
        tag.tagType,
      )}, ${sqlString(tag.label)}, ${sqlString(tag.description)}, ${index});`,
  )
}

function technologyTagStatements(data: RegistryData): string[] {
  const releaseId = data.version.releaseId
  const statements: string[] = []
  for (const tech of data.technologies) {
    for (const tagId of tech.tagIds) {
      statements.push(
        `INSERT INTO registry_technology_tags (release_id, technology_id, tag_id) VALUES (${releaseId}, ${sqlString(tech.id)}, ${sqlString(
          tagId,
        )});`,
      )
    }
  }
  return statements
}

function stackPresetStatements(data: RegistryData): string[] {
  const releaseId = data.version.releaseId
  return data.stacks.map(
    (stack) =>
      `INSERT INTO registry_stack_presets (id, release_id, preset_type, preset_kind, parent_pattern_id, name, app_type_ids, details_json, sort_order) VALUES (${sqlString(
        stack.id,
      )}, ${releaseId}, ${sqlString(stack.presetType)}, ${sqlString(stack.presetKind)}, ${sqlString(stack.parentPatternId)}, ${sqlString(
        stack.name,
      )}, ${sqlJson(stack.appTypeIds)}, ${sqlJson(stack.detail)}, ${sqlNumber(stack.sortOrder)});`,
  )
}

function stackPresetItemStatements(data: RegistryData): string[] {
  const releaseId = data.version.releaseId
  const statements: string[] = []
  for (const stack of data.stacks) {
    for (const item of stack.items) {
      statements.push(
        `INSERT INTO registry_stack_preset_items (release_id, preset_id, technology_id, role, label_override, sort_order) VALUES (${releaseId}, ${sqlString(
          stack.id,
        )}, ${sqlString(item.technologyId)}, ${sqlString(item.role)}, ${sqlString(item.label)}, ${sqlNumber(item.sortOrder)});`,
      )
    }
  }
  return statements
}

function ruleStatements(data: RegistryData): string[] {
  const releaseId = data.version.releaseId
  return data.rules.map(
    (rule, index) =>
      `INSERT INTO registry_rules (id, release_id, rule_type, technology_id, tag_id, preset_id, condition_key, condition_value, sort_order) VALUES (${sqlString(
        rule.id,
      )}, ${releaseId}, ${sqlString(rule.ruleType)}, ${sqlString(rule.technologyId)}, ${sqlString(rule.tagId)}, ${sqlString(
        rule.presetId,
      )}, ${sqlString(rule.conditionKey)}, ${sqlString(rule.conditionValue)}, ${index});`,
  )
}

/** 文の配列を、1チャンクがおおよそmaxBytesを超えないようバイト数ベースで分割する。 */
function chunkStatements(statements: string[], maxBytes: number): string[][] {
  const chunks: string[][] = []
  let current: string[] = []
  let currentBytes = 0
  for (const statement of statements) {
    const bytes = Buffer.byteLength(statement, 'utf-8')
    if (current.length > 0 && currentBytes + bytes > maxBytes) {
      chunks.push(current)
      current = []
      currentBytes = 0
    }
    current.push(statement)
    currentBytes += bytes
  }
  if (current.length > 0) chunks.push(current)
  return chunks
}

// D1リモートAPIは明示的な BEGIN TRANSACTION / COMMIT / SAVEPOINT を許可しない
// （Durable Objects上のstate.storage.transaction()で内部的に扱われるため）。
// そのため各migrationファイルは素のINSERT文の並びとする。
function wrapStatements(statements: string[]): string {
  return [
    '-- 自動生成ファイル。手編集禁止。',
    '-- 再生成: npm run registry:generate-seed （data/*.seed.ts を編集してから実行すること）',
    '',
    ...statements,
    '',
  ].join('\n')
}

/**
 * D1リモートAPIの1リクエストあたりのペイロードサイズ制限を避けるため、
 * テーブルごとにバイト数ベースでチャンク分割した複数のSQLファイル内容を返す。
 */
export function buildSeedSqlFiles(data: RegistryData): string[] {
  const groups: string[][] = [
    [releaseStatement(data), ...categoryStatements(data)],
    ...chunkStatements(technologyStatements(data), MAX_CHUNK_BYTES),
    [...tagStatements(data), ...technologyTagStatements(data)],
    ...chunkStatements(stackPresetStatements(data), MAX_CHUNK_BYTES),
    ...chunkStatements(stackPresetItemStatements(data), MAX_CHUNK_BYTES),
    ruleStatements(data),
  ]
  return groups.filter((g) => g.length > 0).map(wrapStatements)
}
