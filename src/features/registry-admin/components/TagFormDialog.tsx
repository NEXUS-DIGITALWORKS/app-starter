import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { isValidSlug } from '../lib/slug'
import type { RegistryTag } from '../../../lib/registry/types'

export type TagFormPayload = { id?: string; tagType: string; label: string; description: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: RegistryTag | null
  onSubmit: (payload: TagFormPayload) => Promise<void>
}

export function TagFormDialog({ open, onOpenChange, initial, onSubmit }: Props) {
  const isEdit = initial !== null
  const [id, setId] = useState('')
  const [tagType, setTagType] = useState('app_type')
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setId(initial?.id ?? '')
    setTagType(initial?.tagType ?? 'app_type')
    setLabel(initial?.label ?? '')
    setDescription(initial?.description ?? '')
    setState('idle')
    setErrorMessage(null)
  }, [open, initial])

  const idValid = isEdit || isValidSlug(id)
  const canSubmit = idValid && tagType.trim().length > 0 && label.trim().length > 0 && state !== 'saving'

  const handleSubmit = async () => {
    if (!canSubmit) return
    setState('saving')
    try {
      await onSubmit({ id: isEdit ? undefined : id, tagType, label, description })
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
          <DialogTitle>{isEdit ? 'タグを編集' : 'タグを新規作成'}</DialogTitle>
          <DialogDescription>技術・SaaS製品に付与する分類タグです。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="tag-id" className="text-xs font-semibold text-muted-foreground">
              id（半角小文字英数字とハイフン）
            </label>
            <Input id="tag-id" value={id} onChange={(e) => setId(e.target.value)} disabled={isEdit || state === 'saving'} placeholder="例: app_type:internal_ops" />
            {!isEdit && id.length > 0 && !idValid && <p className="text-xs text-destructive">半角小文字英数字とハイフンのみ使用できます。</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tag-type" className="text-xs font-semibold text-muted-foreground">
              種別（tagType）
            </label>
            <Input id="tag-type" value={tagType} onChange={(e) => setTagType(e.target.value)} disabled={state === 'saving'} placeholder="app_type" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tag-label" className="text-xs font-semibold text-muted-foreground">
              ラベル
            </label>
            <Input id="tag-label" value={label} onChange={(e) => setLabel(e.target.value)} disabled={state === 'saving'} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tag-description" className="text-xs font-semibold text-muted-foreground">
              説明（任意）
            </label>
            <Textarea id="tag-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} disabled={state === 'saving'} />
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
