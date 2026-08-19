import type { ExtractedFeature, ProductContentText } from '../types';

interface ProductPreviewProps {
  productName: string;
  productImage: string;
  content: ProductContentText;
  features: ExtractedFeature[];
}

const htmlBlockClass =
  'min-w-0 break-words text-sm leading-relaxed text-[#344054] [&_img]:h-auto [&_img]:max-w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto';

// インポート元のデータが「&lt;div&gt;」のようにHTMLエンティティとしてエスケープされたまま
// 保存されているケースがあり、そのままdangerouslySetInnerHTMLに渡すとタグ文字列が
// そのまま画面に表示されてしまう。textareaのRCDATA解釈（実タグは作らずエンティティだけ
// デコードする）を利用して、既に生のHTMLが入っているデータには影響を与えずデコードする。
let decoderEl: HTMLTextAreaElement | null = null;
function decodeHtmlEntities(html: string): string {
  if (!decoderEl) decoderEl = document.createElement('textarea');
  decoderEl.innerHTML = html;
  return decoderEl.value;
}

function HtmlBlock({ html, className = '' }: { html: string; className?: string }) {
  return <div className={`${htmlBlockClass} ${className}`} dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(html) }} />;
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
          <HtmlBlock html={content.shortDescription} className="mt-2 font-medium" />
        </div>
      </div>

      <div className="mt-6 space-y-5 border-t border-[#EEF0F4] pt-5">
        <section>
          <h3 className="mb-1 text-sm font-semibold text-[#111827]">商品説明</h3>
          <HtmlBlock html={content.description} />
        </section>

        {features.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-[#111827]">特徴</h3>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-[#344054] sm:grid-cols-2">
              {features.map((f) => (
                <li key={f.key}>
                  <span className="text-[#667085]">{f.label}: </span>
                  {f.value}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 className="mb-1 text-sm font-semibold text-[#111827]">成分</h3>
          <HtmlBlock html={content.ingredients} />
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-[#111827]">注意事項</h3>
          <HtmlBlock html={content.usageNotes} />
        </section>
      </div>
    </div>
  );
}
