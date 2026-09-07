export type ReleaseRow = {
  id: number
  version_label: string
  status: 'draft' | 'published' | 'archived'
  notes: string | null
  created_at: string
  published_at: string | null
}

export type CategoryRow = {
  id: string
  release_id: number
  title: string
  sort_order: number
}

export type TechnologyRow = {
  id: string
  release_id: number
  category_id: string
  technology_kind: string
  name: string
  description: string
  details_json: string | null
  security_score: number | null
  cost_score: number | null
  development_speed_score: number | null
  ai_coding_score: number | null
  scalability_score: number | null
  status: 'active' | 'deprecated'
  notes: string | null
  sort_order: number
}

export type TagRow = {
  id: string
  release_id: number
  tag_type: string
  label: string
  description: string | null
  sort_order: number
}

export type TechnologyTagRow = {
  release_id: number
  technology_id: string
  tag_id: string
}

export type StackPresetRow = {
  id: string
  release_id: number
  preset_type: string
  preset_kind: string | null
  parent_pattern_id: string | null
  name: string
  app_type_ids: string | null
  details_json: string | null
  sort_order: number
}

export type StackPresetItemRow = {
  id: number
  release_id: number
  preset_id: string
  technology_id: string | null
  role: string | null
  label_override: string | null
  sort_order: number
}

export type RuleRow = {
  id: string
  release_id: number
  rule_type: string
  technology_id: string | null
  tag_id: string | null
  preset_id: string | null
  condition_key: string | null
  condition_value: string | null
  sort_order: number
}
