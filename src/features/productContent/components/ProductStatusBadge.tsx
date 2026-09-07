import type { ProductStatus } from '../types/product';

const STYLE: Record<ProductStatus, { bg: string; text: string; label: string }> = {
  published: { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', label: '公開中' },
  draft: { bg: 'bg-[#F2F4F7]', text: 'text-[#475467]', label: '下書き' },
  needs_review: { bg: 'bg-[#FFF3E6]', text: 'text-[#B54708]', label: '要確認' },
  approval_pending: { bg: 'bg-[#FFFBEB]', text: 'text-[#B45309]', label: '承認待ち' },
  private: { bg: 'bg-[#F2F4F7]', text: 'text-[#1D2939]', label: '非公開' },
};

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'published', label: '公開中' },
  { value: 'draft', label: '下書き' },
  { value: 'needs_review', label: '要確認' },
  { value: 'approval_pending', label: '承認待ち' },
  { value: 'private', label: '非公開' },
];

export default function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const style = STYLE[status];
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
