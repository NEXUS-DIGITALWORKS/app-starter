import { Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductBreadcrumb from './ProductBreadcrumb';

interface ProductHeaderProps {
  sku: string;
  mode: 'view' | 'edit';
  isDirty: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onClose: () => void;
}

export default function ProductHeader({ sku, mode, isDirty, isSaving, onEdit, onSave, onClose }: ProductHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <ProductBreadcrumb sku={sku} />
        <span
          className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${
            mode === 'edit' ? 'bg-[#EEF0FE] text-[#3157E5]' : 'bg-[#F8FAFC] text-[#667085]'
          }`}
        >
          {mode === 'edit' ? '編集モード' : '閲覧モード'}
        </span>
        {isDirty && (
          <span className="hidden shrink-0 items-center gap-1 rounded-full bg-[#FFFBEB] px-2.5 py-1 text-xs font-medium text-[#B45309] sm:inline-flex">
            未保存の変更あり
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {mode === 'view' ? (
          <Button size="sm" onClick={onEdit} className="bg-[#3157E5] hover:bg-[#2748C7] hover:opacity-100">
            <Pencil size={14} />
            編集
          </Button>
        ) : (
          <Button size="sm" onClick={onSave} disabled={isSaving} className="bg-[#3157E5] hover:bg-[#2748C7] hover:opacity-100">
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            保存
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={onClose} className="border-[#D0D5DD] text-[#475467]">
          閉じる
        </Button>
      </div>
    </div>
  );
}
