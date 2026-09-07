import { AI_CAPABILITY_MAP } from '../data/aiCapabilities';
import type { CloudPreference, RequirementProfile, StackResolution, SystemMode } from '../types';
import { resolveAiCapabilityIds } from './modeEngine';
import { getStringValue, includesValue, resolveCloudPreference } from './requirementProfile';

// 技術要素idが特定クラウドに強く紐づく場合のみ記録する（未記載＝どのクラウドでも中立）。
const CLOUD_AFFINITY: Record<string, CloudPreference> = {
  firestore: 'gcp',
  'firebase-auth': 'gcp',
  'firebase-storage': 'gcp',
  'cloud-functions': 'gcp',
  'cloud-sql': 'gcp',
  'azure-sql': 'azure',
  'azure-blob': 'azure',
  'entra-id': 'azure',
  'aspnet-core': 'azure',
  dynamodb: 'aws',
  'aurora-serverless': 'aws',
  cognito: 'aws',
  s3: 'aws',
  'aws-lambda': 'aws',
  'sql-server': 'onpremise',
};

function pickFromCandidates(candidates: string[], profile: RequirementProfile): string | undefined {
  if (candidates.length === 0) return undefined;

  const cloudPref = resolveCloudPreference(profile);
  if (cloudPref) {
    const matched = candidates.find((id) => CLOUD_AFFINITY[id] === cloudPref);
    if (matched) return matched;
  }

  if (includesValue(profile, 'realtime', 'required')) {
    const realtimeFirst = candidates.find((id) => ['firestore', 'supabase-realtime', 'supabase-postgresql'].includes(id));
    if (realtimeFirst) return realtimeFirst;
  }

  if (getStringValue(profile, 'data_relations') === 'complex') {
    const relational = candidates.find((id) => id === 'postgresql');
    if (relational) return relational;
  }

  return candidates[0];
}

export function resolveStack(mode: SystemMode, profile: RequirementProfile): StackResolution {
  const frontend = pickFromCandidates(mode.structure.frontend, profile) ?? mode.structure.frontend[0] ?? '';
  const backend = pickFromCandidates(mode.structure.backend, profile);
  const database = pickFromCandidates(mode.structure.database, profile) ?? '';
  const auth = pickFromCandidates(mode.structure.auth, profile) ?? '';
  const storage = pickFromCandidates(mode.structure.storage, profile);

  const aiCapabilityIds = resolveAiCapabilityIds(profile);
  const ai = aiCapabilityIds.length > 0 ? AI_CAPABILITY_MAP[aiCapabilityIds[0]]?.elements[0] : undefined;

  return { frontend, backend, database, auth, storage, ai };
}
