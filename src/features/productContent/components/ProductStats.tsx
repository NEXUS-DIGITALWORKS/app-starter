import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '../lib/formatDateTime';
import type { Product, ProductStats as ProductStatsType } from '../types';

interface ProductStatsProps {
  stats: ProductStatsType;
  product: Product;
}

export default function ProductStats({ stats, product }: ProductStatsProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <p className="pb-2 text-xs font-semibold text-[#98A2B3]">商品ステータス</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-3 lg:grid-cols-1">
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
          <dd className="text-sm font-semibold text-[#111827]">{formatDateTime(product.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#98A2B3]">Updated At</dt>
          <dd className="text-sm font-semibold text-[#111827]">{formatDateTime(product.updatedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#98A2B3]">画像</dt>
          <dd className="text-sm font-semibold text-[#111827]">{stats.imageCount}点</dd>
        </div>
        <div>
          <dt className="text-xs text-[#98A2B3]">見出し</dt>
          <dd className="text-sm font-semibold text-[#111827]">{stats.headingCount}個</dd>
        </div>
      </dl>
    </div>
  );
}
