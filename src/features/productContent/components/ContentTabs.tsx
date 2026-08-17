import { useState } from 'react';
import { cn } from '@/lib/utils';
import ComparisonPanel, { type ComparisonMode } from './ComparisonPanel';
import DiffViewer from './DiffViewer';
import ProductPreview from './ProductPreview';
import type { ExtractedFeature, ProductContentText } from '../types';

type ContentTab = 'original' | 'translation' | 'improved' | 'diff' | 'preview';

const TABS: { key: ContentTab; label: string }[] = [
  { key: 'original', label: '原文（繁体字）' },
  { key: 'translation', label: '日本語翻訳' },
  { key: 'improved', label: '改善案' },
  { key: 'diff', label: '差分' },
  { key: 'preview', label: 'プレビュー' },
];

const COMPARISON_MODES: { key: ComparisonMode; label: string }[] = [
  { key: 'original-translation', label: '原文 ↔ 日本語翻訳' },
  { key: 'original-improved', label: '原文 ↔ 改善案' },
  { key: 'translation-improved', label: '日本語翻訳 ↔ 改善案' },
];

const DEFAULT_MODE_BY_TAB: Record<ContentTab, ComparisonMode> = {
  original: 'original-translation',
  translation: 'original-translation',
  improved: 'translation-improved',
  diff: 'translation-improved',
  preview: 'translation-improved',
};

interface ContentTabsProps {
  productName: string;
  productImage: string;
  original: ProductContentText;
  translationJa: ProductContentText;
  improvedJa: ProductContentText;
  features: ExtractedFeature[];
  onRegenerateTranslation: () => Promise<ProductContentText>;
  onRegenerateImproved: () => Promise<ProductContentText>;
  onAdoptTranslation: (next: ProductContentText) => void;
  onAdoptImproved: (next: ProductContentText) => void;
  initialTab?: ContentTab;
}

export default function ContentTabs({
  productName,
  productImage,
  original,
  translationJa,
  improvedJa,
  features,
  onRegenerateTranslation,
  onRegenerateImproved,
  onAdoptTranslation,
  onAdoptImproved,
  initialTab = 'translation',
}: ContentTabsProps) {
  const [tab, setTab] = useState<ContentTab>(initialTab);
  const [mode, setMode] = useState<ComparisonMode>(DEFAULT_MODE_BY_TAB[initialTab]);

  const handleTabChange = (next: ContentTab) => {
    setTab(next);
    setMode(DEFAULT_MODE_BY_TAB[next]);
  };

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white">
      <div className="flex gap-1 overflow-x-auto border-b border-[#EEF0F4] px-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTabChange(key)}
            className={cn(
              'shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
              tab === key ? 'border-[#3157E5] text-[#3157E5]' : 'border-transparent text-[#667085] hover:text-[#111827]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        {(tab === 'original' || tab === 'translation' || tab === 'improved') && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {COMPARISON_MODES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    mode === key
                      ? 'border-[#3157E5] bg-[#3157E5] text-white'
                      : 'border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F8FAFC]',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <ComparisonPanel
              mode={mode}
              original={original}
              translationJa={translationJa}
              improvedJa={improvedJa}
              productImage={productImage}
              productName={productName}
              onRegenerateTranslation={onRegenerateTranslation}
              onRegenerateImproved={onRegenerateImproved}
              onAdoptTranslation={onAdoptTranslation}
              onAdoptImproved={onAdoptImproved}
            />
          </>
        )}

        {tab === 'diff' && (
          <DiffViewer before={translationJa} after={improvedJa} beforeLabel="日本語翻訳" afterLabel="改善案" />
        )}

        {tab === 'preview' && (
          <ProductPreview productName={productName} productImage={productImage} content={improvedJa} features={features} />
        )}
      </div>
    </div>
  );
}
