import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import type { ProductContentText, SeoSuggestion } from '../types';
import { generateProductSeo } from '../api/aiStub';

interface SeoSuggestionPanelProps {
  suggestion: SeoSuggestion;
  contentForRegeneration: ProductContentText;
  editable?: boolean;
  onChange?: (next: SeoSuggestion) => void;
}

const fieldClass =
  'mt-0.5 w-full rounded-md border border-[#D0D5DD] bg-white px-2 py-1 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]';

export default function SeoSuggestionPanel({ suggestion, contentForRegeneration, editable, onChange }: SeoSuggestionPanelProps) {
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const next = await generateProductSeo(contentForRegeneration);
      onChange?.({ ...suggestion, metaTitle: next.metaTitle });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#111827]">SEO改善案</h3>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-[#3157E5] hover:bg-[#EEF0FE] disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          AI再生成
        </button>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-medium text-[#98A2B3]">Meta Title（{suggestion.metaTitle.length}文字）</p>
          {editable ? (
            <input
              value={suggestion.metaTitle}
              onChange={(e) => onChange?.({ ...suggestion, metaTitle: e.target.value })}
              className={fieldClass}
            />
          ) : (
            <p className="mt-0.5 text-[#344054]">{suggestion.metaTitle}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-[#98A2B3]">Meta Description（{suggestion.metaDescription.length}文字）</p>
          {editable ? (
            <textarea
              value={suggestion.metaDescription}
              onChange={(e) => onChange?.({ ...suggestion, metaDescription: e.target.value })}
              rows={3}
              className={`${fieldClass} resize-y`}
            />
          ) : (
            <p className="mt-0.5 text-[#344054]">{suggestion.metaDescription}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-[#98A2B3]">URL Key（{suggestion.urlKey.length}文字）</p>
          {editable ? (
            <input
              value={suggestion.urlKey}
              onChange={(e) => onChange?.({ ...suggestion, urlKey: e.target.value })}
              className={fieldClass}
            />
          ) : (
            <p className="mt-0.5 break-all text-[#344054]">{suggestion.urlKey}</p>
          )}
        </div>
      </div>
    </div>
  );
}
