import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductBreadcrumb from './ProductBreadcrumb';

interface ProductHeaderProps {
  sku: string;
  isDirty: boolean;
  isSaving: boolean;
  isRequestingApproval: boolean;
  onSave: () => void;
  onRequestApproval: () => void;
  onClose: () => void;
}

export default function ProductHeader({
  sku,
  isDirty,
  isSaving,
  isRequestingApproval,
  onSave,
  onRequestApproval,
  onClose,
}: ProductHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F4] bg-white px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <ProductBreadcrumb sku={sku} />
        {isDirty && (
          <span className="hidden shrink-0 items-center gap-1 rounded-full bg-[#FFFBEB] px-2.5 py-1 text-xs font-medium text-[#B45309] sm:inline-flex">
            未保存の変更あり
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" onClick={onSave} disabled={isSaving} className="bg-[#3157E5] hover:bg-[#2748C7] hover:opacity-100">
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          保存
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onRequestApproval}
          disabled={isRequestingApproval}
          className="border-[#3157E5] text-[#3157E5] hover:bg-[#EAF1FF] hover:text-[#2748C7]"
        >
          {isRequestingApproval && <Loader2 size={14} className="animate-spin" />}
          承認申請
        </Button>
        <Button size="sm" variant="outline" onClick={onClose} className="border-[#D0D5DD] text-[#475467]">
          閉じる
        </Button>
      </div>
    </div>
  );
}
