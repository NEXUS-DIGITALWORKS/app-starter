import { useState } from 'react';
import { cn } from '@/lib/utils';
import SeoQualityPanel from './SeoQualityPanel';
import SeoSuggestionPanel from './SeoSuggestionPanel';
import type { LocaleSeo, MissingField, ProductContentText, SeoSuggestion, TargetLocale } from '../types';

type MainTab = 'original' | TargetLocale;

const TABS: { key: MainTab; label: string }[] = [
  { key: 'original', label: '原文（日本語）' },
  { key: 'zhHant', label: '繁体字' },
  { key: 'en', label: '英語' },
];

interface SeoTabsProps {
  seo: { original: LocaleSeo; zhHant: LocaleSeo; en: LocaleSeo };
  missingFields: MissingField[];
  contentForRegeneration: { original: ProductContentText; zhHant: ProductContentText; en: ProductContentText };
  editable: boolean;
  onChangeSuggestion: (locale: MainTab, next: SeoSuggestion) => void;
  initialTab?: MainTab;
}

export default function SeoTabs({
  seo,
  missingFields,
  contentForRegeneration,
  editable,
  onChangeSuggestion,
  initialTab = 'zhHant',
}: SeoTabsProps) {
  const [tab, setTab] = useState<MainTab>(initialTab);
  const current = seo[tab];

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white">
      <div className="flex gap-1 overflow-x-auto border-b border-[#EEF0F4] px-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
              tab === key ? 'border-[#3157E5] text-[#3157E5]' : 'border-transparent text-[#667085] hover:text-[#111827]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-2">
        <SeoQualityPanel issues={current.issues} missingFields={missingFields} />
        <SeoSuggestionPanel
          suggestion={current.suggestion}
          contentForRegeneration={contentForRegeneration[tab]}
          editable={editable}
          onChange={(next) => onChangeSuggestion(tab, next)}
        />
      </div>
    </div>
  );
}
