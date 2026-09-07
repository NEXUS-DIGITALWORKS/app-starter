-- =========================================================
-- Stack Registry D1スキーマ（初期定義）
--
-- 設計方針:
--   - 技術情報・カテゴリ・タグ・推奨構成（Stack Preset）・互換性ルールのみを
--     中央DB化し、診断アルゴリズム・スコアリング・画面ロジックはコード側に残す。
--   - 全マスタ表に release_id を持たせ、Draft/Publish/Version固定の運用に
--     スキーマ変更なしで対応できるようにする。
--   - build-or-buy用の「P1〜P9」アーキテクチャパターン体系と、
--     tech-stack-selector用の「WEB-01等」技術構成パターン体系は統合せず、
--     registry_stack_presets.preset_type で区別したまま共存させる。
-- =========================================================

CREATE TABLE registry_releases (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  version_label TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  notes        TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT
);

CREATE TABLE registry_categories (
  id         TEXT NOT NULL,
  release_id INTEGER NOT NULL REFERENCES registry_releases(id),
  title      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (id, release_id)
);

-- technology_kind: 'framework' | 'library' | 'platform' | 'saas' | 'tool'
CREATE TABLE registry_technologies (
  id              TEXT NOT NULL,
  release_id      INTEGER NOT NULL REFERENCES registry_releases(id),
  category_id     TEXT NOT NULL,
  technology_kind TEXT NOT NULL CHECK (technology_kind IN ('framework', 'library', 'platform', 'saas', 'tool')) DEFAULT 'framework',
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  details_json    TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (id, release_id),
  FOREIGN KEY (category_id, release_id) REFERENCES registry_categories(id, release_id)
);

-- tag_type: 'app_type'（将来拡張可）
CREATE TABLE registry_tags (
  id         TEXT NOT NULL,
  release_id INTEGER NOT NULL REFERENCES registry_releases(id),
  tag_type   TEXT NOT NULL,
  label      TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (id, release_id)
);

CREATE TABLE registry_technology_tags (
  release_id    INTEGER NOT NULL REFERENCES registry_releases(id),
  technology_id TEXT NOT NULL,
  tag_id        TEXT NOT NULL,
  PRIMARY KEY (release_id, technology_id, tag_id),
  FOREIGN KEY (technology_id, release_id) REFERENCES registry_technologies(id, release_id),
  FOREIGN KEY (tag_id, release_id) REFERENCES registry_tags(id, release_id)
);

-- preset_type: 'architecture_pattern'（build-or-buy／P1〜P9・SP-01〜16） | 'tech_pattern'（tech-stack-selector／WEB-01等）
-- preset_kind: preset_type='architecture_pattern' のときのみ使用。
--   'pattern_definition' = P1〜P9本体 / 'stack_profile' = SP-01〜16（parent_pattern_idでP1〜P9に紐付け）
CREATE TABLE registry_stack_presets (
  id                TEXT NOT NULL,
  release_id        INTEGER NOT NULL REFERENCES registry_releases(id),
  preset_type       TEXT NOT NULL CHECK (preset_type IN ('architecture_pattern', 'tech_pattern')),
  preset_kind       TEXT CHECK (preset_kind IN ('pattern_definition', 'stack_profile')),
  parent_pattern_id TEXT,
  name              TEXT NOT NULL,
  app_type_ids      TEXT,
  details_json      TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (id, release_id)
);

CREATE TABLE registry_stack_preset_items (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  release_id     INTEGER NOT NULL REFERENCES registry_releases(id),
  preset_id      TEXT NOT NULL,
  technology_id  TEXT,
  role           TEXT,
  label_override TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (preset_id, release_id) REFERENCES registry_stack_presets(id, release_id)
);

-- rule_type: 'recommended_for_app_type' | 'preferred_for_preset' | 'answer_option_alias'
CREATE TABLE registry_rules (
  id              TEXT NOT NULL,
  release_id      INTEGER NOT NULL REFERENCES registry_releases(id),
  rule_type       TEXT NOT NULL,
  technology_id   TEXT,
  tag_id          TEXT,
  preset_id       TEXT,
  condition_key   TEXT,
  condition_value TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (id, release_id)
);

CREATE INDEX idx_tech_category ON registry_technologies(release_id, category_id);
CREATE INDEX idx_preset_type ON registry_stack_presets(release_id, preset_type, preset_kind);
CREATE INDEX idx_preset_parent ON registry_stack_presets(release_id, parent_pattern_id);
CREATE INDEX idx_items_preset ON registry_stack_preset_items(release_id, preset_id);
CREATE INDEX idx_items_tech ON registry_stack_preset_items(release_id, technology_id);
CREATE INDEX idx_rules_release ON registry_rules(release_id, rule_type);
CREATE INDEX idx_tech_tags_tech ON registry_technology_tags(release_id, technology_id);
