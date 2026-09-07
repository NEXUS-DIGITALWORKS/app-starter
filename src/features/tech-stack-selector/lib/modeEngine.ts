import { MODE_EXCLUSION_RULES } from '../data/modeExclusionRules';
import { MODE_SCORING_RULES } from '../data/modeScoringRules';
import { SYSTEM_MODES } from '../data/systemModes';
import type { RequirementProfile, RequirementRuleOperator, SystemModeId, SystemModeMatch } from '../types';
import { getStringArrayValue, getValue, includesValue } from './requirementProfile';

function evaluateCondition(
  profile: RequirementProfile,
  operator: RequirementRuleOperator,
  conditionKey: Parameters<typeof includesValue>[1],
  conditionValue: string | number,
): boolean {
  switch (operator) {
    case '=': {
      const value = getValue(profile, conditionKey);
      return typeof value === 'string' && value === String(conditionValue);
    }
    case '!=': {
      const value = getValue(profile, conditionKey);
      return typeof value === 'string' && value !== String(conditionValue);
    }
    case 'includes':
      return includesValue(profile, conditionKey, String(conditionValue));
    case 'gte': {
      const value = getValue(profile, conditionKey);
      return typeof value === 'number' && value >= Number(conditionValue);
    }
    case 'lte': {
      const value = getValue(profile, conditionKey);
      return typeof value === 'number' && value <= Number(conditionValue);
    }
    default:
      return false;
  }
}

export type ModeDiagnosis = {
  primary: SystemModeMatch;
  alternatives: SystemModeMatch[];
  isCloseCall: boolean;
};

// build-or-buy側の computeArchitectureScores と同じ「除外→スコアリング→ランキング」の流れ。
// SystemModeは排他的な主方式1つを選ぶための軸であり、AiCapabilityは別途 resolveAiCapabilities で扱う。
export function diagnoseSystemMode(profile: RequirementProfile): ModeDiagnosis {
  const excludedIds = new Set<SystemModeId>();
  for (const rule of MODE_EXCLUSION_RULES) {
    if (evaluateCondition(profile, rule.operator, rule.conditionKey, rule.conditionValue)) {
      excludedIds.add(rule.targetId);
    }
  }

  const scores = new Map<SystemModeId, number>(SYSTEM_MODES.map((mode) => [mode.id, 0]));
  const reasonsByMode = new Map<SystemModeId, string[]>();

  for (const rule of MODE_SCORING_RULES) {
    if (excludedIds.has(rule.targetId)) continue;
    if (!evaluateCondition(profile, rule.operator, rule.conditionKey, rule.conditionValue)) continue;
    scores.set(rule.targetId, (scores.get(rule.targetId) ?? 0) + rule.score);
    reasonsByMode.set(rule.targetId, [...(reasonsByMode.get(rule.targetId) ?? []), rule.reason]);
  }

  const ranked = SYSTEM_MODES.filter((mode) => !excludedIds.has(mode.id))
    .map((mode) => ({
      mode,
      score: scores.get(mode.id) ?? 0,
      reasons: reasonsByMode.get(mode.id) ?? [],
    }))
    .sort((a, b) => b.score - a.score || a.mode.id.localeCompare(b.mode.id));

  const primary = ranked[0] ?? { mode: SYSTEM_MODES[0], score: 0, reasons: [] };
  const alternatives = ranked.slice(1, 3);
  const isCloseCall = alternatives.length > 0 && primary.score > 0 && primary.score - alternatives[0].score <= 2;

  return { primary, alternatives, isCloseCall };
}

// ai_usage は SystemModeとは独立した追加機能として扱う（排他にしない）。
export function resolveAiCapabilityIds(profile: RequirementProfile): string[] {
  const values = getStringArrayValue(profile, 'ai_usage');
  const map: Record<string, string> = {
    text_generation: 'ai-text',
    chat_rag: 'ai-chat-rag',
    agent: 'ai-agent',
    automation: 'ai-automation',
  };
  const ids = values.map((value) => map[value]).filter((id): id is string => Boolean(id));
  return [...new Set(ids)];
}
