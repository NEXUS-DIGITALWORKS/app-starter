import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import { computePatternMatches } from './matchEngine';
import type { Selection } from '../types';

export type SaveTechSelectionMeta = {
  title?: string;
  memo?: string;
};

export async function saveTechSelection(selection: Selection, meta?: SaveTechSelectionMeta): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return;

  const matches = computePatternMatches(selection);
  const perfectMatchPatternIds = matches.filter((m) => m.isPerfectMatch).map((m) => m.pattern.id);

  await supabase.from('tech_selections').insert({
    user_id: userId,
    selection,
    matched_pattern_ids: perfectMatchPatternIds,
    title: meta?.title?.trim() || null,
    memo: meta?.memo?.trim() || null,
  });
}
