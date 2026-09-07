import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  heading: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  state: 'idle' | 'confirming' | 'error'
  errorMessage?: string
}

/** 削除確認用の共有ダイアログ。SaveMetaDialog.tsxと同じDialog+Buttonパターン。 */
export function ConfirmDialog({
  open,
  onOpenChange,
  heading,
  description,
  confirmLabel = '削除する',
  onConfirm,
  state,
  errorMessage,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {state === 'error' && <p className="text-xs text-destructive">{errorMessage ?? '削除に失敗しました。もう一度お試しください。'}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={state === 'confirming'}>
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={state === 'confirming'}
            className="bg-[#B42318] text-white hover:bg-[#912018] hover:opacity-100"
          >
            {state === 'confirming' ? '削除中…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
