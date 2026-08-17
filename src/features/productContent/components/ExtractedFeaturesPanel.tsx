import type { ExtractedFeature } from '../types';

interface ExtractedFeaturesPanelProps {
  features: ExtractedFeature[];
  editable?: boolean;
  onChangeValue?: (key: string, value: string) => void;
}

export default function ExtractedFeaturesPanel({ features, editable, onChangeValue }: ExtractedFeaturesPanelProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#111827]">AIが抽出した商品特徴</h3>
      <p className="mb-3 mt-0.5 text-xs text-[#98A2B3]">
        原文からAIが自動抽出した用法・対象・容量などの項目。プレビューの「特徴」欄やSEOの参考情報として使用します。
      </p>
      <dl className="overflow-hidden rounded-lg border border-[#EEF0F4]">
        {features.map((feature, idx) => (
          <div key={feature.key} className={`px-3 py-2 text-sm ${idx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}`}>
            <dt className="text-xs text-[#98A2B3]">{feature.label}</dt>
            {editable ? (
              <dd className="mt-0.5">
                <input
                  value={feature.value}
                  onChange={(e) => onChangeValue?.(feature.key, e.target.value)}
                  className="w-full rounded-md border border-[#D0D5DD] bg-white px-2 py-1 text-sm font-medium text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
                />
              </dd>
            ) : (
              <dd className="mt-0.5 break-words font-medium text-[#111827]">{feature.value}</dd>
            )}
          </div>
        ))}
        {features.length === 0 && <div className="px-3 py-2 text-sm text-[#98A2B3]">抽出された特徴はありません</div>}
      </dl>
    </div>
  );
}
