import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { isValidSlug } from '../lib/slug'
import type { RegistryCategory } from '../../../lib/registry/types'

export type CategoryFormPayload = { id?: string; title: string; sortOrder: number }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: RegistryCategory | null
  onSubmit: (payload: CategoryFormPayload) => Promise<void>
}

export function CategoryFormDialog({ open, onOpenChange, initial, onSubmit }: Props) {
  const isEdit = initial !== null
  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setId(initial?.id ?? '')
    setTitle(initial?.title ?? '')
    setSortOrder(initial?.sortOrder ?? 0)
    setState('idle')
    setErrorMessage(null)
  }, [open, initial])

  const idValid = isEdit || isValidSlug(id)
  const canSubmit = idValid && title.trim().length > 0 && state !== 'saving'

  const handleSubmit = async () => {
    if (!canSubmit) return
    setState('saving')
    try {
      await onSubmit({ id: isEdit ? undefined : id, title, sortOrder })
      onOpenChange(false)
    } catch (err) {
      setState('error')
      setErrorMessage(err instanceof Error ? err.message : '保存に失敗しました。')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'カテゴリを編集' : 'カテゴリを新規作成'}</DialogTitle>
          <DialogDescription>技術要素の分類カテゴリです。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="category-id" className="text-xs font-semibold text-muted-foreground">
              id（半角小文字英数字とハイフン）
            </label>
            <Input id="category-id" value={id} onChange={(e) => setId(e.target.value)} disabled={isEdit || state === 'saving'} placeholder="例: frontend" />
            {!isEdit && id.length > 0 && !idValid && <p className="text-xs text-destructive">半角小文字英数字とハイフンのみ使用できます。</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="category-title" className="text-xs font-semibold text-muted-foreground">
              タイトル
            </label>
            <Input id="category-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={state === 'saving'} placeholder="例: フロントエンド・Web画面" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="category-sort" className="text-xs font-semibold text-muted-foreground">
              表示順
            </label>
            <Input
              id="category-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              disabled={state === 'saving'}
            />
          </div>
          {state === 'error' && <p className="text-xs text-destructive">{errorMessage}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={state === 'saving'}>
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-[#3157E5] text-white hover:bg-[#2748C7] hover:opacity-100"
          >
            {state === 'saving' ? '保存中…' : '保存する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
