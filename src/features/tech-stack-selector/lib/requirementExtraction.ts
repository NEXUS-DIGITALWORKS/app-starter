import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import type { RequirementKey, RequirementProfile, RequirementStatus } from '../types';

type RawField = {
  status: RequirementStatus;
  value: string | string[] | null;
  confidence: number | null;
};

type RawProfile = Record<string, RawField>;

export class RequirementExtractionError extends Error {}

// STEP2: 自由文をSupabase Edge Function（extract-requirements）へ送り、
// サーバーサイドで実行されるClaude API呼び出しの結果をRequirementProfileへ変換する。
// APIキーはEdge Function側のみが保持し、フロントには一切渡らない。
export async function extractRequirements(text: string): Promise<RequirementProfile> {
  if (!isSupabaseConfigured()) {
    throw new RequirementExtractionError('この環境ではAI診断機能が未設定です（管理者にお問い合わせください）');
  }

  const { data, error } = await supabase.functions.invoke<{ profile?: RawProfile; error?: string }>(
    'extract-requirements',
    { body: { text } },
  );

  if (error) {
    throw new RequirementExtractionError('AIによる要件抽出でエラーが発生しました。時間をおいて再度お試しください。');
  }
  if (!data?.profile) {
    throw new RequirementExtractionError(data?.error ?? 'AIによる要件抽出でエラーが発生しました');
  }

  const profile: RequirementProfile = {};
  for (const [key, field] of Object.entries(data.profile)) {
    profile[key as RequirementKey] = {
      key: key as RequirementKey,
      value: field.value,
      status: field.status,
      confidence: field.confidence ?? undefined,
    };
  }
  return profile;
}
