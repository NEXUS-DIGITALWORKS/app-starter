// 商品一覧（mockProducts.ts）と商品詳細（mockProduct.ts）は別々のMockデータだが、
// 同一SKUの商品は同じタグを持つべきなので、SKUをキーにしたこのストアで一元管理する。
// 実データ接続時は不要（Magento側の商品タグ属性等に置き換える）。
const tagsBySku = new Map<string, string[]>([['4901301276070', ['セール対象']]]);

export function getTags(sku: string): string[] {
  return tagsBySku.get(sku) ?? [];
}

export function addTag(sku: string, tag: string): void {
  const trimmed = tag.trim();
  if (!trimmed) return;
  const current = tagsBySku.get(sku) ?? [];
  if (!current.includes(trimmed)) tagsBySku.set(sku, [...current, trimmed]);
}

export function removeTag(sku: string, tag: string): void {
  const current = tagsBySku.get(sku);
  if (!current) return;
  tagsBySku.set(
    sku,
    current.filter((t) => t !== tag),
  );
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const tags of tagsBySku.values()) {
    for (const tag of tags) tagSet.add(tag);
  }
  return [...tagSet].sort((a, b) => a.localeCompare(b, 'ja'));
}
