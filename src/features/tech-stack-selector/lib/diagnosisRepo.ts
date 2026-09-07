import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import type { RequirementProfile, TechDiagnosisResult } from '../types';

export type SaveTechDiagnosisMeta = {
  title?: string;
  memo?: string;
};

export async function saveTechDiagnosis(
  freeText: string,
  profile: RequirementProfile,
  result: TechDiagnosisResult,
  meta?: SaveTechDiagnosisMeta,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return;

  await supabase.from('tech_diagnoses').insert({
    user_id: userId,
    free_text: freeText,
    requirement_profile: profile,
    diagnosis_result: result,
    title: meta?.title?.trim() || null,
    memo: meta?.memo?.trim() || null,
  });
}
