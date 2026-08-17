import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTENT_FIELDS, countChars } from '../lib/contentFields';
import type { ProductContentText } from '../types';
import AiRegenerateButton from './AiRegenerateButton';

function CharCount({ content }: { content: ProductContentText }) {
  return <span className="ml-1.5 text-xs font-normal text-[#98A2B3]">（約{countChars(content)}文字）</span>;
}

export function ContentBlocks({ content }: { content: ProductContentText }) {
  return (
    <div className="space-y-4">
      {CONTENT_FIELDS.map(({ key, label }) => (
        <div key={key}>
          <p className="mb-1 text-sm font-semibold text-[#111827]">{label}</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#344054]">{content[key]}</p>
        </div>
      ))}
    </div>
  );
}

export function EditableContentBlocks({
  content,
  onChange,
}: {
  content: ProductContentText;
  onChange: (next: ProductContentText) => void;
}) {
  return (
    <div className="space-y-4">
      {CONTENT_FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label className="mb-1 block text-sm font-semibold text-[#111827]" htmlFor={`field-${key}`}>
            {label}
          </label>
          <textarea
            id={`field-${key}`}
            value={content[key]}
            onChange={(e) => onChange({ ...content, [key]: e.target.value })}
            rows={key === 'shortDescription' ? 2 : 4}
            className="w-full resize-y rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm leading-relaxed text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
          />
        </div>
      ))}
    </div>
  );
}

interface AiPanelProps {
  title: string;
  content: ProductContentText;
  editable?: boolean;
  onRegenerate: () => Promise<ProductContentText>;
  onAdopt: (next: ProductContentText) => void;
}

function AiPanel({ title, content, editable, onRegenerate, onAdopt }: AiPanelProps) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<ProductContentText | null>(null);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const suggestion = await onRegenerate();
      setPending(suggestion);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#111827]">
          {title}
          <CharCount content={content} />
        </h3>
        <AiRegenerateButton onClick={handleRegenerate} loading={loading} />
      </div>

      {pending && (
        <div className="mb-4 rounded-lg border border-[#D6BBFB] bg-[#F9F5FF] p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#6941C6]">
            <Sparkles size={13} />
            AI提案ができました（現在値はまだ変更されていません）
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onAdopt(pending);
                setPending(null);
              }}
              className="bg-[#3157E5] hover:bg-[#2748C7] hover:opacity-100"
            >
              採用する
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPending(null)} className="border-[#D0D5DD] text-[#475467]">
              破棄
            </Button>
          </div>
        </div>
      )}

      {editable ? <EditableContentBlocks content={content} onChange={onAdopt} /> : <ContentBlocks content={content} />}
    </div>
  );
}

export type ComparisonMode = 'original-translation' | 'original-improved' | 'translation-improved';

interface ComparisonPanelProps {
  mode: ComparisonMode;
  editable: boolean;
  original: ProductContentText;
  originalLabel: string;
  translation: ProductContentText;
  translationLabel: string;
  improved: ProductContentText;
  improvedLabel: string;
  onRegenerateTranslation: () => Promise<ProductContentText>;
  onRegenerateImproved: () => Promise<ProductContentText>;
  onAdoptTranslation: (next: ProductContentText) => void;
  onAdoptImproved: (next: ProductContentText) => void;
}

export default function ComparisonPanel({
  mode,
  editable,
  original,
  originalLabel,
  translation,
  translationLabel,
  improved,
  improvedLabel,
  onRegenerateTranslation,
  onRegenerateImproved,
  onAdoptTranslation,
  onAdoptImproved,
}: ComparisonPanelProps) {
  const leftIsOriginal = mode !== 'translation-improved';
  const leftLabel = leftIsOriginal ? originalLabel : translationLabel;
  const leftContent = leftIsOriginal ? original : translation;
  const rightIsImproved = mode !== 'original-translation';
  const rightLabel = rightIsImproved ? improvedLabel : `${translationLabel}（AIプレビュー）`;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex-1 rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-[#111827]">
          {leftLabel}
          <CharCount content={leftContent} />
        </h3>
        <ContentBlocks content={leftContent} />
      </div>

      {rightIsImproved ? (
        <AiPanel
          title={rightLabel}
          content={improved}
          editable={editable}
          onRegenerate={onRegenerateImproved}
          onAdopt={onAdoptImproved}
        />
      ) : (
        <AiPanel title={rightLabel} content={translation} onRegenerate={onRegenerateTranslation} onAdopt={onAdoptTranslation} />
      )}
    </div>
  );
}
