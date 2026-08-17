import { useState } from 'react';
import { cn } from '@/lib/utils';
import ComparisonPanel, { ContentBlocks, EditableContentBlocks, type ComparisonMode } from './ComparisonPanel';
import DiffViewer from './DiffViewer';
import ProductPreview from './ProductPreview';
import { countChars } from '../lib/contentFields';
import type { ExtractedFeature, LocaleContent, ProductContentText, TargetLocale } from '../types';

type MainTab = 'original' | TargetLocale;
type LocaleView = 'compare' | 'diff' | 'preview';

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'original', label: '原文（日本語）' },
  { key: 'zhHant', label: '繁体字' },
  { key: 'en', label: '英語' },
];

const LOCALE_VIEWS: { key: LocaleView; label: string }[] = [
  { key: 'compare', label: '比較' },
  { key: 'diff', label: '差分' },
  { key: 'preview', label: 'プレビュー' },
];

const COMPARISON_MODES: { key: ComparisonMode; label: string }[] = [
  { key: 'original-translation', label: '原文 ↔ AI翻訳' },
  { key: 'original-improved', label: '原文 ↔ 改善案' },
  { key: 'translation-improved', label: 'AI翻訳 ↔ 改善案' },
];

const LOCALE_LABEL: Record<TargetLocale, string> = { zhHant: '繁体字', en: '英語' };

interface ContentTabsProps {
  productName: string;
  productImage: string;
  original: ProductContentText;
  onChangeOriginal: (next: ProductContentText) => void;
  zhHant: LocaleContent;
  en: LocaleContent;
  features: ExtractedFeature[];
  editable: boolean;
  onRegenerateTranslation: (locale: TargetLocale) => Promise<ProductContentText>;
  onRegenerateImproved: (locale: TargetLocale) => Promise<ProductContentText>;
  onAdoptTranslation: (locale: TargetLocale, next: ProductContentText) => void;
  onAdoptImproved: (locale: TargetLocale, next: ProductContentText) => void;
  initialTab?: MainTab;
}

export default function ContentTabs({
  productName,
  productImage,
  original,
  onChangeOriginal,
  zhHant,
  en,
  features,
  editable,
  onRegenerateTranslation,
  onRegenerateImproved,
  onAdoptTranslation,
  onAdoptImproved,
  initialTab = 'zhHant',
}: ContentTabsProps) {
  const [tab, setTab] = useState<MainTab>(initialTab);
  const [view, setView] = useState<LocaleView>('compare');
  const [mode, setMode] = useState<ComparisonMode>('original-improved');

  const locale: TargetLocale | null = tab === 'original' ? null : tab;
  const localeContent: LocaleContent | null = locale === 'en' ? en : locale === 'zhHant' ? zhHant : null;

  const handleTabChange = (next: MainTab) => {
    setTab(next);
    setView('compare');
    setMode('original-improved');
  };

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white">
      <div className="flex gap-1 overflow-x-auto border-b border-[#EEF0F4] px-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MAIN_TABS.map(({ key, label }) => (
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
        {tab === 'original' && (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 sm:p-5">
            <p className="mb-4 text-xs font-medium text-[#98A2B3]">
              マスターデータです（約{countChars(original)}文字）。繁体字・英語タブでAI翻訳と編集を行います。
              {editable && '編集モードのため、この原文（日本語）も直接編集できます。'}
            </p>
            {editable ? (
              <EditableContentBlocks content={original} onChange={onChangeOriginal} />
            ) : (
              <ContentBlocks content={original} />
            )}
          </div>
        )}

        {locale && localeContent && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {LOCALE_VIEWS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    view === key
                      ? 'border-[#3157E5] bg-[#3157E5] text-white'
                      : 'border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F8FAFC]',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {view === 'compare' && (
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
                  editable={editable}
                  original={original}
                  originalLabel="原文（日本語）"
                  translation={localeContent.aiTranslation}
                  translationLabel={`${LOCALE_LABEL[locale]}（AI翻訳）`}
                  improved={localeContent.edited}
                  improvedLabel={`${LOCALE_LABEL[locale]}（改善案）`}
                  onRegenerateTranslation={() => onRegenerateTranslation(locale)}
                  onRegenerateImproved={() => onRegenerateImproved(locale)}
                  onAdoptTranslation={(next) => onAdoptTranslation(locale, next)}
                  onAdoptImproved={(next) => onAdoptImproved(locale, next)}
                />
              </>
            )}

            {view === 'diff' && (
              <DiffViewer
                before={localeContent.aiTranslation}
                after={localeContent.edited}
                beforeLabel={`${LOCALE_LABEL[locale]}（AI翻訳）`}
                afterLabel={`${LOCALE_LABEL[locale]}（改善案）`}
              />
            )}

            {view === 'preview' && (
              <ProductPreview productName={productName} productImage={productImage} content={localeContent.edited} features={features} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
