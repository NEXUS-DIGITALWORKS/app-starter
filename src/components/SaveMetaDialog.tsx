import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

export type SaveMetaState = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  heading: string
  description?: string
  confirmLabel?: string
  title: string
  onTitleChange: (value: string) => void
  memo: string
  onMemoChange: (value: string) => void
  onConfirm: () => void
  confirmState: SaveMetaState
}

export function SaveMetaDialog({
  open,
  onOpenChange,
  heading,
  description,
  confirmLabel = '保存する',
  title,
  onTitleChange,
  memo,
  onMemoChange,
  onConfirm,
  confirmState,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="save-meta-dialog-title" className="text-xs font-semibold text-muted-foreground">
              タイトル（任意）
            </label>
            <Input
              id="save-meta-dialog-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="例: A社向けMVP構成"
              maxLength={80}
              disabled={confirmState === 'saving'}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="save-meta-dialog-memo" className="text-xs font-semibold text-muted-foreground">
              メモ（任意）
            </label>
            <Textarea
              id="save-meta-dialog-memo"
              value={memo}
              onChange={(e) => onMemoChange(e.target.value)}
              placeholder="この構成を選んだ背景など"
              rows={3}
              disabled={confirmState === 'saving'}
            />
          </div>
          {confirmState === 'error' && (
            <p className="text-xs text-destructive">保存に失敗しました。もう一度お試しください。</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={confirmState === 'saving'}>
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={confirmState === 'saving'}
            className="bg-[#3157E5] text-white hover:bg-[#2748C7] hover:opacity-100"
          >
            {confirmState === 'saving' ? '保存中…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
