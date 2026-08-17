import type { ProductStats as ProductStatsType } from '../types';

interface ProductStatsProps {
  stats: ProductStatsType;
}

export default function ProductStats({ stats }: ProductStatsProps) {
  const items = [
    { label: '文字数', value: `約${stats.charCount}文字` },
    { label: '画像', value: `${stats.imageCount}点` },
    { label: '見出し', value: `${stats.headingCount}個` },
    { label: 'Store View', value: stats.storeViewCode },
  ];

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <p className="pb-2 text-xs font-semibold text-[#98A2B3]">全文情報</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-3 lg:grid-cols-1">
        {items.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-[#98A2B3]">{label}</dt>
            <dd className="text-sm font-semibold text-[#111827]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
