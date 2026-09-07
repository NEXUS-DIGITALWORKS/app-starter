import { FOLLOW_UP_QUESTIONS } from '../data/followUpQuestions';
import type { FollowUpQuestion, RequirementProfile } from '../types';
import { isUnresolved } from './requirementProfile';

// STEP4: 自由文抽出・既存回答で確定できなかった項目だけを質問として返す（候補プール全問を聞くわけではない）。
export function resolveMissingQuestions(profile: RequirementProfile): FollowUpQuestion[] {
  return FOLLOW_UP_QUESTIONS.filter((question) => isUnresolved(profile, question.key));
}
