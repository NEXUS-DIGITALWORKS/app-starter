import type { ExtractedFeature, ProductContentText } from '../types';

interface ProductPreviewProps {
  productName: string;
  productImage: string;
  content: ProductContentText;
  features: ExtractedFeature[];
}

export default function ProductPreview({ productName, productImage, content, features }: ProductPreviewProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-[#E5E7EB] bg-white p-5 sm:p-8">
      <p className="mb-4 text-xs font-semibold text-[#98A2B3]">ECサイト掲載イメージ（プレビュー）</p>
      <div className="flex flex-col gap-6 sm:flex-row">
        <img
          src={productImage}
          alt={productName}
          className="h-40 w-40 shrink-0 self-center rounded-lg border border-[#EEF0F4] bg-[#F8FAFC] object-contain sm:self-start"
        />
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#111827]">{productName}</h2>
          <p className="mt-2 text-sm font-medium text-[#344054]">{content.shortDescription}</p>
        </div>
      </div>

      <div className="mt-6 space-y-5 border-t border-[#EEF0F4] pt-5">
        <section>
          <h3 className="mb-1 text-sm font-semibold text-[#111827]">商品説明</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#344054]">{content.description}</p>
        </section>

        {features.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-[#111827]">特徴</h3>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-[#344054] sm:grid-cols-2">
              {features.map((f) => (
                <li key={f.key} className="flex gap-1.5">
                  <span className="text-[#98A2B3]">・</span>
                  <span>
                    <span className="text-[#667085]">{f.label}: </span>
                    {f.value}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 className="mb-1 text-sm font-semibold text-[#111827]">成分</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#344054]">{content.ingredients}</p>
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-[#111827]">注意事項</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#344054]">{content.usageNotes}</p>
        </section>
      </div>
    </div>
  );
}
