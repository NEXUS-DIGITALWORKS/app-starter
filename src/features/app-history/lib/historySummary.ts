type DiagnosisHistoryRow = {
  build_or_buy_result?: { category?: string; label?: string } | null
  recommended_stack?: { patternId?: string } | null
  score_details?: { buildScore?: number } | null
  structured_requirements?: { appTypeId?: string } | null
}

export function countSelectedTechItems(selection: Record<string, string[] | undefined>): number {
  return Object.values(selection).reduce((sum, ids) => sum + (ids?.length ?? 0), 0)
}

export function buildDiagnosisSummary(entry: DiagnosisHistoryRow) {
  return {
    title: entry.build_or_buy_result?.label ?? '診断結果',
    category: entry.build_or_buy_result?.category ?? '不明',
    patternId: entry.recommended_stack?.patternId ?? '不明',
    buildScore: entry.score_details?.buildScore ?? 0,
    appTypeId: entry.structured_requirements?.appTypeId ?? '不明',
  }
}
