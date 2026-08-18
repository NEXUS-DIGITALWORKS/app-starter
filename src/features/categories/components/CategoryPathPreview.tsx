import { buildMagentoCategoryPaths } from '../lib/magentoPath';
import type { Category } from '../types';

const LOCALE_LABEL = { ja: '日本語', en: 'English', zhTw: '繁體中文' } as const;

interface CategoryPathPreviewProps {
  categories: Category[];
  categoryId: string;
}

export default function CategoryPathPreview({ categories, categoryId }: CategoryPathPreviewProps) {
  const paths = buildMagentoCategoryPaths(categories, categoryId);

  return (
    <div className="space-y-2.5 rounded-lg border border-[#EEF0F4] bg-[#F8FAFC] p-3">
      <p className="text-xs font-semibold text-[#667085]">Magento出力パス（生成値・プレビュー）</p>
      {(Object.keys(LOCALE_LABEL) as (keyof typeof LOCALE_LABEL)[]).map((locale) => (
        <div key={locale} className="text-xs">
          <span className="mr-2 inline-block w-16 shrink-0 text-[#98A2B3]">{LOCALE_LABEL[locale]}</span>
          <span className="break-all font-mono text-[#344054]">{paths[locale]}</span>
        </div>
      ))}
    </div>
  );
}
