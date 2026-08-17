import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product, ProductStoreView } from '../types';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

interface ProductSummaryCardProps {
  product: Product;
  storeView: ProductStoreView;
  onOpenPreview: () => void;
}

export default function ProductSummaryCard({ product, storeView, onOpenPreview }: ProductSummaryCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <img
            src={product.imagePath}
            alt={product.name}
            className="h-24 w-24 shrink-0 rounded-lg border border-[#EEF0F4] bg-[#F8FAFC] object-contain"
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden';
            }}
          />
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-[#667085]">SKU:</dt>
            <dd className="font-medium text-[#111827]">{product.sku}</dd>
            <dt className="text-[#667085]">Store View:</dt>
            <dd className="text-[#344054]">{storeView.storeViewName}</dd>
            <dt className="text-[#667085]">商品名:</dt>
            <dd className="text-[#344054]">{product.name}</dd>
            <dt className="text-[#667085]">ブランド:</dt>
            <dd className="text-[#344054]">{product.brand}</dd>
          </dl>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-[#667085]">Status:</dt>
            <dd>
              <Badge variant="success" className="rounded-md">
                {product.ecStatusLabel}
              </Badge>
            </dd>
            <dt className="text-[#667085]">Visibility:</dt>
            <dd className="font-medium text-[#3157E5]">{product.ecVisibility}</dd>
            <dt className="text-[#667085]">Created At:</dt>
            <dd className="text-[#344054]">{formatDateTime(product.createdAt)}</dd>
            <dt className="text-[#667085]">Updated At:</dt>
            <dd className="text-[#344054]">{formatDateTime(product.updatedAt)}</dd>
            <dt className="text-[#667085]">Image:</dt>
            <dd className="truncate text-[#344054]">{product.imagePath}</dd>
          </dl>

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenPreview}
            className="shrink-0 self-start border-[#D6BBFB] text-[#6941C6] hover:bg-[#F9F5FF]"
          >
            <Eye size={14} />
            翻訳プレビュー
          </Button>
        </div>
      </div>
    </div>
  );
}
