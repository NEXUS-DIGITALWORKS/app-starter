import { useState } from 'react'
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRegistry } from '../../../lib/registry/RegistryProvider'
import { AdminApiError, createEntity, deleteEntity, updateEntity } from '../../../lib/api/adminClient'
import { Button } from '../../../components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { CategoryFormDialog, type CategoryFormPayload } from './CategoryFormDialog'
import type { RegistryCategory } from '../../../lib/registry/types'

export function CategoryList() {
  const registry = useRegistry()
  const categories = registry.status === 'ready' ? registry.data.categories : []

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RegistryCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RegistryCategory | null>(null)
  const [deleteState, setDeleteState] = useState<'idle' | 'confirming' | 'error'>('idle')
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (category: RegistryCategory) => {
    setEditing(category)
    setFormOpen(true)
  }

  const handleSubmit = async (payload: CategoryFormPayload) => {
    if (payload.id) {
      await createEntity('categories', payload)
    } else if (editing) {
      await updateEntity('categories', editing.id, { title: payload.title, sortOrder: payload.sortOrder })
    }
    await registry.refresh()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteState('confirming')
    try {
      await deleteEntity('categories', deleteTarget.id)
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
        <p className="text-sm text-[#667085]">{categories.length}件のカテゴリ</p>
        <Button type="button" onClick={openCreate} className="bg-[#3157E5] text-white hover:bg-[#2748C7] hover:opacity-100">
          <Plus size={15} />
          新規作成
        </Button>
      </div>

      <div className="space-y-2">
        {[...categories]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111827]">{category.title}</p>
                <p className="truncate text-xs text-[#98A2B3]">
                  {category.id} ・ 表示順 {category.sortOrder}
                </p>
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
                  <DropdownMenuItem onSelect={() => openEdit(category)}>
                    <Pencil size={14} />
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setDeleteTarget(category)
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
        {categories.length === 0 && <p className="text-sm text-[#98A2B3]">カテゴリがありません。</p>}
      </div>

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSubmit={handleSubmit} />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        heading="カテゴリを削除しますか？"
        description={deleteTarget ? `「${deleteTarget.title}」を削除します。この操作は取り消せません。` : undefined}
        onConfirm={handleDelete}
        state={deleteState}
        errorMessage={deleteError}
      />
    </div>
  )
}
