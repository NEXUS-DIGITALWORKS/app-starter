import { useState } from 'react'
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRegistry } from '../../../lib/registry/RegistryProvider'
import { AdminApiError, createEntity, deleteEntity, updateEntity } from '../../../lib/api/adminClient'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { TagFormDialog, type TagFormPayload } from './TagFormDialog'
import type { RegistryTag } from '../../../lib/registry/types'

export function TagList() {
  const registry = useRegistry()
  const tags = registry.status === 'ready' ? registry.data.tags : []

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RegistryTag | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RegistryTag | null>(null)
  const [deleteState, setDeleteState] = useState<'idle' | 'confirming' | 'error'>('idle')
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (tag: RegistryTag) => {
    setEditing(tag)
    setFormOpen(true)
  }

  const handleSubmit = async (payload: TagFormPayload) => {
    if (payload.id) {
      await createEntity('tags', payload)
    } else if (editing) {
      await updateEntity('tags', editing.id, { tagType: payload.tagType, label: payload.label, description: payload.description })
    }
    await registry.refresh()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteState('confirming')
    try {
      await deleteEntity('tags', deleteTarget.id)
      await registry.refresh()
      setDeleteTarget(null)
      setDeleteState('idle')
    } catch (err) {
      setDeleteState('error')
      setDeleteError(err instanceof AdminApiError ? err.message : '削除に失敗しました。')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#667085]">{tags.length}件のタグ</p>
        <Button type="button" onClick={openCreate} className="bg-[#3157E5] text-white hover:bg-[#2748C7] hover:opacity-100">
          <Plus size={15} />
          新規作成
        </Button>
      </div>

      <div className="space-y-2">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge className="shrink-0 border-transparent bg-[#EAF1FF] text-[#2748C7] hover:bg-[#EAF1FF]">{tag.tagType}</Badge>
                <span className="truncate text-sm font-semibold text-[#111827]">{tag.label}</span>
              </div>
              <p className="truncate text-xs text-[#98A2B3]">{tag.id}</p>
              {tag.description && <p className="truncate text-xs text-[#667085]">{tag.description}</p>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F2F4F7]"
                  aria-label="その他の操作"
                >
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => openEdit(tag)}>
                  <Pencil size={14} />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setDeleteTarget(tag)
                    setDeleteState('idle')
                  }}
                  className="text-destructive"
                >
                  <Trash2 size={14} />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        {tags.length === 0 && <p className="text-sm text-[#98A2B3]">タグがありません。</p>}
      </div>

      <TagFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSubmit={handleSubmit} />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        heading="タグを削除しますか？"
        description={deleteTarget ? `「${deleteTarget.label}」を削除します。関連付けられた技術・ルールからも自動的に外れます。` : undefined}
        onConfirm={handleDelete}
        state={deleteState}
        errorMessage={deleteError}
      />
    </div>
  )
}
