import type { ProductContentText } from '../types';

export const CONTENT_FIELDS: { key: keyof ProductContentText; label: string; showFieldCharCount?: boolean }[] = [
  { key: 'shortDescription', label: 'Short Description', showFieldCharCount: true },
  { key: 'description', label: 'Description', showFieldCharCount: true },
  { key: 'ingredients', label: '成分' },
  { key: 'usageNotes', label: '注意事項' },
];

export function countChars(content: ProductContentText): number {
  return CONTENT_FIELDS.reduce((sum, { key }) => sum + content[key].length, 0);
}
