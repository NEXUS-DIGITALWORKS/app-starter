import { Badge } from '@/components/ui/badge';
import { formatDateTimeParts } from '../lib/formatDateTime';
import type { Product, ProductStats as ProductStatsType } from '../types';

interface ProductStatsProps {
  stats: ProductStatsType;
  product: Product;
}

export default function ProductStats({ stats, product }: ProductStatsProps) {
  const createdAt = formatDateTimeParts(product.createdAt);
  const updatedAt = formatDateTimeParts(product.updatedAt);
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <p className="pb-2 text-xs font-semibold text-[#98A2B3]">商品ステータス</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-3 [&_dd]:ml-0 lg:grid-cols-1">
        <div>
          <dt className="text-xs text-[#98A2B3]">Status</dt>
          <dd>
            <Badge variant="success" className="rounded-md">
              {product.ecStatusLabel}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#98A2B3]">Visibility</dt>
          <dd className="text-sm font-semibold text-[#3157E5]">{product.ecVisibility}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#98A2B3]">Created At</dt>
          <dd className="whitespace-nowrap text-sm font-semibold text-[#111827]">
            {createdAt.date} {createdAt.time}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#98A2B3]">Updated At</dt>
          <dd className="whitespace-nowrap text-sm font-semibold text-[#111827]">
            {updatedAt.date} {updatedAt.time}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#98A2B3]">画像</dt>
          <dd className="text-sm font-semibold text-[#111827]">{stats.imageCount}点</dd>
        </div>
      </dl>
    </div>
  );
}
