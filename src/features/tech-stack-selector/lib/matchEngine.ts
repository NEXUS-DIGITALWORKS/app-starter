import { CATEGORIES } from '../data/categories';
import { PATTERN_MAP } from '../data/patterns';
import type { PatternMatch, Selection, TechElement } from '../types';

export function getSelectedElements(selection: Selection): TechElement[] {
  const elements: TechElement[] = [];
  for (const category of CATEGORIES) {
    const elementIds = selection[category.id] ?? [];
    for (const elementId of elementIds) {
      const element = category.elements.find((e) => e.id === elementId);
      if (element) elements.push(element);
    }
  }
  return elements;
}

// 選択済み要素すべてのpatternIdsに登場する回数でパターンをスコアリングし、
// 全選択要素と一致する「完全一致」を上位に、それ以外は一致数の多い順に並べる。
export function computePatternMatches(selection: Selection): PatternMatch[] {
  const selectedElements = getSelectedElements(selection);
  const totalSelected = selectedElements.length;
  if (totalSelected === 0) return [];

  const countByPatternId = new Map<string, number>();
  for (const element of selectedElements) {
    for (const patternId of element.patternIds) {
      countByPatternId.set(patternId, (countByPatternId.get(patternId) ?? 0) + 1);
    }
  }

  const matches: PatternMatch[] = [];
  for (const [patternId, matchedCount] of countByPatternId) {
    const pattern = PATTERN_MAP[patternId];
    if (!pattern) continue;
    matches.push({
      pattern,
      matchedCount,
      totalSelected,
      isPerfectMatch: matchedCount === totalSelected,
    });
  }

  matches.sort((a, b) => b.matchedCount - a.matchedCount || a.pattern.id.localeCompare(b.pattern.id));
  return matches;
}

export function countSelectedElements(selection: Selection): number {
  return Object.values(selection).reduce((sum, ids) => sum + (ids?.length ?? 0), 0);
}

// 指定パターンに対応する要素を各カテゴリから拾い、1〜10のパネル選択状態を組み立てる。
// そのパターンに関係しないカテゴリは未選択（空配列）になる。
export function buildSelectionForPattern(patternId: string): Selection {
  const selection: Selection = {};
  for (const category of CATEGORIES) {
    selection[category.id] = category.elements
      .filter((element) => element.patternIds.includes(patternId))
      .map((element) => element.id);
  }
  return selection;
}
