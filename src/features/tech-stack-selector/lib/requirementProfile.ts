import type { CloudPreference, RequirementItem, RequirementKey, RequirementProfile, RequirementStatus } from '../types';

export function getItem(profile: RequirementProfile, key: RequirementKey): RequirementItem | undefined {
  return profile[key];
}

export function getValue(profile: RequirementProfile, key: RequirementKey): RequirementItem['value'] | undefined {
  return profile[key]?.value ?? undefined;
}

export function getStringValue(profile: RequirementProfile, key: RequirementKey): string | undefined {
  const value = getValue(profile, key);
  return typeof value === 'string' ? value : undefined;
}

export function getStringArrayValue(profile: RequirementProfile, key: RequirementKey): string[] {
  const value = getValue(profile, key);
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
}

export function includesValue(profile: RequirementProfile, key: RequirementKey, target: string): boolean {
  const value = getValue(profile, key);
  if (Array.isArray(value)) return value.includes(target);
  if (typeof value === 'string') return value === target;
  return false;
}

export function getStatus(profile: RequirementProfile, key: RequirementKey): RequirementStatus | undefined {
  return profile[key]?.status;
}

/** 自由文抽出・追加質問のいずれでも値が確定していない項目かどうか */
export function isUnresolved(profile: RequirementProfile, key: RequirementKey): boolean {
  const item = profile[key];
  if (!item) return true;
  if (item.status === 'unknown') return true;
  if (item.value === null || item.value === undefined) return true;
  if (Array.isArray(item.value) && item.value.length === 0) return true;
  return false;
}

// company_environment（会社指定）を cloud_preference（希望）より優先する。
// 「初心者にクラウドを選ばせない」方針のため、会社指定がある場合はそれを絶対条件として扱う。
export function resolveCloudPreference(profile: RequirementProfile): CloudPreference | undefined {
  const company = getStringValue(profile, 'company_environment') as CloudPreference | undefined;
  if (company && company !== 'none') return company;
  const explicit = getStringValue(profile, 'cloud_preference') as CloudPreference | undefined;
  if (explicit && explicit !== 'none') return explicit;
  return undefined;
}

export function setConfirmed(
  profile: RequirementProfile,
  key: RequirementKey,
  value: RequirementItem['value'],
): RequirementProfile {
  return { ...profile, [key]: { key, value, status: 'confirmed' } };
}
