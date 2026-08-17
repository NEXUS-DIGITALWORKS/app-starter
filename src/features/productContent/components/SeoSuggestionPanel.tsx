import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import type { ProductContentText, SeoSuggestion } from '../types';
import { generateProductSeo } from '../api/aiStub';

interface SeoSuggestionPanelProps {
  suggestion: SeoSuggestion;
  contentForRegeneration: ProductContentText;
}

export default function SeoSuggestionPanel({ suggestion, contentForRegeneration }: SeoSuggestionPanelProps) {
  const [current, setCurrent] = useState(suggestion);
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const next = await generateProductSeo(contentForRegeneration);
      setCurrent((prev) => ({ ...prev, ...next, metaDescription: prev.metaDescription, urlKey: prev.urlKey }));
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
          <p className="text-xs font-medium text-[#98A2B3]">Meta Title</p>
          <p className="mt-0.5 text-[#344054]">{current.metaTitle}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#98A2B3]">Meta Description</p>
          <p className="mt-0.5 text-[#344054]">{current.metaDescription}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#98A2B3]">URL Key</p>
          <p className="mt-0.5 break-all text-[#344054]">{current.urlKey}</p>
        </div>
      </div>
    </div>
  );
}
