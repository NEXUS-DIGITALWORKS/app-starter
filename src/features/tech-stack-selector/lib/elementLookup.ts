import { CATEGORIES } from '../data/categories';

// data/categories.ts の11カテゴリを平坦化し、要素idから名前・説明を引けるようにする。
// 新診断エンジン（stack/hostingの解決結果表示）と技術者向け詳細の両方から参照する共通ルックアップ。
export const ELEMENT_NAME_MAP: Record<string, string> = Object.fromEntries(
  CATEGORIES.flatMap((category) => category.elements.map((element) => [element.id, element.name])),
);

export function getElementName(id: string | undefined): string | undefined {
  if (!id) return undefined;
  return ELEMENT_NAME_MAP[id] ?? id;
}
