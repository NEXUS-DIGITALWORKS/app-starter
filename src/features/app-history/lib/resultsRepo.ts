import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient'

export type AppHistoryDiagnosisEntry = {
  id: string
  created_at: string
  build_or_buy_result: { category?: string; label?: string } | null
  structured_requirements: { appTypeId?: string } | null
  recommended_stack: { patternId?: string } | null
  score_details: { buildScore?: number } | null
}

export type AppHistorySelectionEntry = {
  id: string
  created_at: string
  selection: Record<string, string[]>
  matched_pattern_ids: string[] | null
}

export async function fetchSavedDiagnosisHistory(limit = 10): Promise<AppHistoryDiagnosisEntry[]> {
  if (!isSupabaseConfigured()) return []

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('diagnosis_results')
    .select('id, created_at, build_or_buy_result, structured_requirements, recommended_stack, score_details')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data ?? []
}

export async function fetchSavedSelectionHistory(limit = 10): Promise<AppHistorySelectionEntry[]> {
  if (!isSupabaseConfigured()) return []

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('tech_selections')
    .select('id, created_at, selection, matched_pattern_ids')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data ?? []
}
