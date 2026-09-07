import { AI_CAPABILITY_MAP } from '../data/aiCapabilities';
import { HOSTING_PROVIDER_MAP } from '../data/hostingProviders';
import type { RequirementProfile, TechDiagnosisResult } from '../types';
import { getElementName } from './elementLookup';
import { resolveHosting } from './hostingEngine';
import { diagnoseSystemMode, resolveAiCapabilityIds } from './modeEngine';
import { resolveStack } from './stackEngine';

// STEP5〜STEP6の統合エントリポイント。RequirementProfile（STEP2の抽出結果＋STEP4の回答を
// マージ済みのもの）から、システム方式・技術構成・公開基盤・初心者向け理由までをまとめて返す。
export function diagnoseTech(profile: RequirementProfile): TechDiagnosisResult {
  const modeDiagnosis = diagnoseSystemMode(profile);
  const primaryMode = modeDiagnosis.primary.mode;
  const alternativeModes = modeDiagnosis.alternatives.map((entry) => entry.mode);

  const stack = resolveStack(primaryMode, profile);
  const hosting = resolveHosting(primaryMode.id, stack, profile);

  const aiCapabilityIds = resolveAiCapabilityIds(profile);
  const aiCapabilities = aiCapabilityIds.map((id) => AI_CAPABILITY_MAP[id]).filter((c) => c !== undefined);

  const reasons = buildReasons({ profile, stack, hostingProviderId: hosting.primary, modeReasons: modeDiagnosis.primary.reasons });

  return {
    primaryMode,
    alternativeModes,
    aiCapabilities,
    stack,
    hosting,
    reasons,
    requirementProfile: profile,
  };
}

function buildReasons(params: {
  profile: RequirementProfile;
  stack: TechDiagnosisResult['stack'];
  hostingProviderId: TechDiagnosisResult['hosting']['primary'];
  modeReasons: string[];
}): string[] {
  const { stack, hostingProviderId, modeReasons } = params;
  const reasons: string[] = [...modeReasons];

  const frontendName = getElementName(stack.frontend);
  if (frontendName) reasons.push(`${frontendName} → 操作するWeb・アプリ画面を効率よく構築できる`);

  const authName = getElementName(stack.auth);
  const databaseName = getElementName(stack.database);
  if (authName && databaseName && authName === databaseName) {
    reasons.push(`${authName} → ログイン・データ保存をまとめて任せられる`);
  } else {
    if (authName) reasons.push(`${authName} → ログイン・ユーザー管理を任せられる`);
    if (databaseName) reasons.push(`${databaseName} → 保存したいデータを安全に管理できる`);
  }

  const hostingProvider = HOSTING_PROVIDER_MAP[hostingProviderId];
  if (hostingProvider) reasons.push(`${hostingProvider.name} → ${hostingProvider.summary}`);

  return reasons;
}
