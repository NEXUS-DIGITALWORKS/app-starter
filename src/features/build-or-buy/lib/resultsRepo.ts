import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient'
import type { Answers, DiagnosisResult } from '../types'

export async function saveDiagnosisResult(answers: Answers, result: DiagnosisResult): Promise<void> {
  if (!isSupabaseConfigured()) return

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return

  await supabase.from('diagnosis_results').insert({
    user_id: userId,
    user_input: answers,
    structured_requirements: { appTypeId: result.appTypeId },
    build_or_buy_result: result.buildOrBuy,
    recommended_stack: { patternId: result.primaryPattern.id, stackProfileId: result.primaryStack?.id ?? null },
    alternative_stack: result.alternativePattern ? { patternId: result.alternativePattern.id } : null,
    score_details: { buildScore: result.buildOrBuy.buildScore },
    risks: result.risks,
  })
}

export type DiagnosisHistoryEntry = {
  id: string
  user_input?: Answers
  structured_requirements: { appTypeId?: string } | null
  build_or_buy_result: { category?: string; label?: string } | null
  recommended_stack?: { patternId?: string } | null
  score_details?: { buildScore?: number } | null
  created_at: string
}

export async function fetchDiagnosisHistory(limit = 10): Promise<DiagnosisHistoryEntry[]> {
  if (!isSupabaseConfigured()) return []

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('diagnosis_results')
    .select('id, user_input, structured_requirements, build_or_buy_result, recommended_stack, score_details, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data ?? []
}

export async function fetchDiagnosisById(id: string): Promise<DiagnosisHistoryEntry | null> {
  if (!isSupabaseConfigured()) return null

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return null

  const { data, error } = await supabase
    .from('diagnosis_results')
    .select('id, user_input, structured_requirements, build_or_buy_result, recommended_stack, score_details, created_at')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data as DiagnosisHistoryEntry
}
