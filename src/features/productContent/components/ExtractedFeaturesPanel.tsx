import type { ExtractedFeature } from '../types';

interface ExtractedFeaturesPanelProps {
  features: ExtractedFeature[];
}

export default function ExtractedFeaturesPanel({ features }: ExtractedFeaturesPanelProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#111827]">抽出Features</h3>
      <dl className="overflow-hidden rounded-lg border border-[#EEF0F4]">
        {features.map((feature, idx) => (
          <div
            key={feature.key}
            className={`flex items-center justify-between gap-3 px-3 py-2 text-sm ${idx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}`}
          >
            <dt className="shrink-0 text-[#667085]">{feature.label}</dt>
            <dd className="truncate text-right font-medium text-[#111827]">{feature.value}</dd>
          </div>
        ))}
        {features.length === 0 && <div className="px-3 py-2 text-sm text-[#98A2B3]">抽出された特徴はありません</div>}
      </dl>
    </div>
  );
}
