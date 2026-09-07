import type { Category } from '../types';
import { getAncestors } from './categoryTree';

// カテゴリ編集フォームでの事前検証（UX目的）。最終的な整合性はDB制約・トリガーが担保する。

export function wouldCreateCycle(categories: Category[], categoryId: string | null, candidateParentId: string | null): boolean {
  if (!categoryId || !candidateParentId) return false;
  if (categoryId === candidateParentId) return true;
  const ancestors = getAncestors(categories, candidateParentId);
  return ancestors.some((c) => c.id === categoryId);
}

export function isCodeDuplicate(categories: Category[], code: string, excludingId?: string): boolean {
  const normalized = code.trim();
  if (!normalized) return false;
  return categories.some((c) => c.code === normalized && c.id !== excludingId);
}
