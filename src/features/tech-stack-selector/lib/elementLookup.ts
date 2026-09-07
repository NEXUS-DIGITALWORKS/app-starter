import { getCategories } from '../data/categories';
import type { TechCategory, TechElement } from '../types';

// data/categories.ts の11カテゴリを平坦化し、要素idから名前・説明を引けるようにする。
// 新診断エンジン（stack/hostingの解決結果表示）と技術者向け詳細の両方から参照する共通ルックアップ。
function buildElementNameMap(): Record<string, string> {
  return Object.fromEntries(
    getCategories().flatMap((category: TechCategory) =>
      category.elements.map((element: TechElement) => [element.id, element.name]),
    ),
  );
}

export function getElementName(id: string | undefined): string | undefined {
  if (!id) return undefined;
  return buildElementNameMap()[id] ?? id;
}
