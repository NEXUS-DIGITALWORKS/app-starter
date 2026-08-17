import { useState } from 'react';
import { ImageOff, Loader2, Sparkles } from 'lucide-react';
import type { ProductImageAsset } from '../types';

interface ImagePanelProps {
  images: ProductImageAsset[];
  productName: string;
}

export default function ImagePanel({ images, productName }: ImagePanelProps) {
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [failedKeys, setFailedKeys] = useState<Record<string, boolean>>({});

  const handleGenerateAlt = async (key: string) => {
    setLoadingKey(key);
    try {
      // TODO: image_alt_generation タスクのBackend呼び出しに置き換える
      await new Promise((resolve) => setTimeout(resolve, 400));
      setSuggestions((prev) => ({ ...prev, [key]: productName }));
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-semibold text-[#111827]">商品画像</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((image) => (
          <div key={image.key} className="rounded-lg border border-[#EEF0F4] p-3">
            {failedKeys[image.key] ? (
              <div className="mb-3 flex h-64 w-full items-center justify-center rounded-md border border-[#EEF0F4] bg-[#F8FAFC] text-[#98A2B3]">
                <ImageOff size={28} />
              </div>
            ) : (
              <img
                src={image.path}
                alt={image.alt ?? ''}
                onError={() => setFailedKeys((prev) => ({ ...prev, [image.key]: true }))}
                className="mb-3 h-64 w-full rounded-md border border-[#EEF0F4] bg-[#F8FAFC] object-contain"
              />
            )}
            <p className="text-xs font-semibold text-[#111827]">{image.label}</p>
            <p className="mt-1 truncate text-xs text-[#667085]">{image.path}</p>
            <p className="mt-1 text-xs text-[#98A2B3]">
              Alt: {image.alt ?? suggestions[image.key] ?? <span className="text-[#B45309]">未設定</span>}
            </p>
            <button
              type="button"
              onClick={() => handleGenerateAlt(image.key)}
              disabled={loadingKey === image.key}
              className="mt-2 inline-flex items-center gap-1 rounded-md border border-[#D0D5DD] px-2 py-1 text-xs font-medium text-[#475467] hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              {loadingKey === image.key ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Alt候補を生成
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
