import { HOSTING_RULES } from '../data/hostingRules';
import type { CostCondition, HostingResolution, RequirementProfile, StackResolution, SystemModeId } from '../types';
import { getStringValue, resolveCloudPreference } from './requirementProfile';

const CLOUD_MATCH_BONUS = 6;
const COST_MATCH_BONUS = 3;
const FAVORED_ELEMENT_BONUS = 2;

// Cloudflare/Vercel/Firebase/AWS/GCP/Azure/VPSを初心者に選ばせず、SystemMode・技術構成・
// コスト条件・会社指定環境から第一候補1つ＋代替候補（最大2件）を決める。
export function resolveHosting(modeId: SystemModeId, stack: StackResolution, profile: RequirementProfile): HostingResolution {
  const costCondition = getStringValue(profile, 'cost_condition') as CostCondition | undefined;
  const cloudPreference = resolveCloudPreference(profile);
  const selectedElementIds = [stack.frontend, stack.backend].filter((id): id is string => Boolean(id));

  const scored = HOSTING_RULES.filter((rule) => rule.applicableModes.includes(modeId)).map((rule) => {
    let score = rule.baseScore;
    if (cloudPreference && rule.cloudPreference?.includes(cloudPreference)) score += CLOUD_MATCH_BONUS;
    if (costCondition && rule.costCondition?.includes(costCondition)) score += COST_MATCH_BONUS;
    if (rule.favoredByElementIds?.some((id) => selectedElementIds.includes(id))) score += FAVORED_ELEMENT_BONUS;
    return { providerId: rule.providerId, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const primary = scored[0]?.providerId;
  const alternatives = scored.slice(1, 3).map((entry) => entry.providerId);

  if (!primary) {
    // このSystemModeに紐づくホスティングルールが無いのは設定漏れ。安全側にvpsへ倒す。
    return { primary: 'vps', alternatives: [] };
  }

  return { primary, alternatives };
}
