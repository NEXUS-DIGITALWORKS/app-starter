import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getCategoryDisplayName } from '../lib/categoryName';
import type { Category } from '../types';

interface DeactivateCategoryDialogProps {
  category: Category | null;
  productCount: number;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeactivateCategoryDialog({ category, productCount, isSaving, onClose, onConfirm }: DeactivateCategoryDialogProps) {
  return (
    <Dialog open={Boolean(category)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>カテゴリを無効化しますか？</DialogTitle>
          <DialogDescription>
            {category && (
              <>
                <span className="font-mono text-xs text-[#98A2B3]">{category.code}</span> {getCategoryDisplayName(category)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {productCount > 0 && (
          <p className="rounded-md bg-[#FFFBEB] px-3 py-2 text-xs text-[#B45309]">
            このカテゴリには{productCount}商品が登録されています。無効化すると商品カテゴリとして新規選択できなくなります（既存の関連付けは残ります）。
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isSaving}>
            {isSaving ? '処理中...' : '無効化する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
