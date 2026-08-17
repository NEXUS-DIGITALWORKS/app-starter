import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTENT_FIELDS } from '../lib/contentFields';
import type { ProductContentText } from '../types';
import AiRegenerateButton from './AiRegenerateButton';

function ContentBlocks({ content }: { content: ProductContentText }) {
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

interface AiPanelProps {
  title: string;
  content: ProductContentText;
  productImage?: string;
  productName?: string;
  onRegenerate: () => Promise<ProductContentText>;
  onAdopt: (next: ProductContentText) => void;
}

function AiPanel({ title, content, productImage, productName, onRegenerate, onAdopt }: AiPanelProps) {
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
        <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
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

      {productImage && (
        <div className="mb-4 flex items-start gap-3 rounded-lg bg-[#F8FAFC] p-3">
          <img src={productImage} alt="" className="h-16 w-16 shrink-0 rounded-md border border-[#EEF0F4] bg-white object-contain" />
          <div className="min-w-0 text-xs text-[#667085]">
            <p className="font-medium text-[#475467]">画像（プレビュー）</p>
            <p className="mt-1 truncate">Alt（プレビュー）: {productName}</p>
          </div>
        </div>
      )}

      <ContentBlocks content={content} />
    </div>
  );
}

export type ComparisonMode = 'original-translation' | 'original-improved' | 'translation-improved';

interface ComparisonPanelProps {
  mode: ComparisonMode;
  original: ProductContentText;
  translationJa: ProductContentText;
  improvedJa: ProductContentText;
  productImage: string;
  productName: string;
  onRegenerateTranslation: () => Promise<ProductContentText>;
  onRegenerateImproved: () => Promise<ProductContentText>;
  onAdoptTranslation: (next: ProductContentText) => void;
  onAdoptImproved: (next: ProductContentText) => void;
}

export default function ComparisonPanel({
  mode,
  original,
  translationJa,
  improvedJa,
  productImage,
  productName,
  onRegenerateTranslation,
  onRegenerateImproved,
  onAdoptTranslation,
  onAdoptImproved,
}: ComparisonPanelProps) {
  const leftIsOriginal = mode !== 'translation-improved';
  const leftLabel = leftIsOriginal ? '原文（繁体字）' : '日本語翻訳';
  const leftContent = leftIsOriginal ? original : translationJa;
  const rightIsImproved = mode !== 'original-translation';
  const rightLabel = rightIsImproved ? '改善案（日本語）' : '日本語翻訳（AIプレビュー）';

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex-1 rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-[#111827]">{leftLabel}</h3>
        <ContentBlocks content={leftContent} />
      </div>

      {rightIsImproved ? (
        <AiPanel
          title={rightLabel}
          content={improvedJa}
          productImage={productImage}
          productName={productName}
          onRegenerate={onRegenerateImproved}
          onAdopt={onAdoptImproved}
        />
      ) : (
        <AiPanel
          title={rightLabel}
          content={translationJa}
          productImage={productImage}
          productName={productName}
          onRegenerate={onRegenerateTranslation}
          onAdopt={onAdoptTranslation}
        />
      )}
    </div>
  );
}
