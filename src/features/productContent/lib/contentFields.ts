import type { ProductContentText } from '../types';

export const CONTENT_FIELDS: { key: keyof ProductContentText; label: string }[] = [
  { key: 'shortDescription', label: 'Short Description' },
  { key: 'description', label: 'Description' },
  { key: 'ingredients', label: '成分' },
  { key: 'usageNotes', label: '注意事項' },
];

export function countChars(content: ProductContentText): number {
  return CONTENT_FIELDS.reduce((sum, { key }) => sum + content[key].length, 0);
}
