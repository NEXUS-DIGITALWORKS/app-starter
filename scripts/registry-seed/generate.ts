/**
 * `npm run registry:generate-seed` のエントリポイント。
 * data/*.seed.ts を単一ソースとして worker/migrations/0003_seed_release_v1_NNN.sql 群を再生成する。
 * SQLファイルは生成物のため直接編集せず、必ずこのコマンド経由で更新すること。
 * D1リモートAPIの1リクエストあたりのペイロードサイズ制限を避けるため、複数ファイルに分割して出力する。
 * 0002_add_technology_scores.sql（スキーマ変更）より後の番号にすること
 * （このseedのtechnology INSERT文がsecurity_score等の新列を参照するため）。
 */
import { readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { buildRegistryDataFromSource } from './fromSource'
import { buildSeedSqlFiles } from './toSql'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.resolve(__dirname, '../../worker/migrations')
const FILE_PREFIX = '0003_seed_release_v1_'

// 既存の分割ファイルを削除してから再生成する（チャンク数が変わっても古いファイルが残らないように）。
for (const name of readdirSync(migrationsDir)) {
  if (name.startsWith(FILE_PREFIX) && name.endsWith('.sql')) {
    unlinkSync(path.join(migrationsDir, name))
  }
}

const data = buildRegistryDataFromSource()
const files = buildSeedSqlFiles(data)

files.forEach((sql, index) => {
  const filename = `${FILE_PREFIX}${String(index + 1).padStart(3, '0')}.sql`
  writeFileSync(path.join(migrationsDir, filename), sql, 'utf-8')
})

console.log(`Generated ${files.length} seed file(s) under ${migrationsDir}`)
console.log(`  categories: ${data.categories.length}`)
console.log(`  technologies: ${data.technologies.length}`)
console.log(`  tags: ${data.tags.length}`)
console.log(`  stacks: ${data.stacks.length}`)
console.log(`  rules: ${data.rules.length}`)
