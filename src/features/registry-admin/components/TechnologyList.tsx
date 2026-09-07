import { useMemo, useState } from 'react'
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRegistry } from '../../../lib/registry/RegistryProvider'
import { AdminApiError, createEntity, deleteEntity, updateEntity } from '../../../lib/api/adminClient'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { TechnologyFormDialog, type TechnologyFormPayload } from './TechnologyFormDialog'
import type { RegistryTechnology } from '../../../lib/registry/types'

export function TechnologyList() {
  const registry = useRegistry()
  const technologies = registry.status === 'ready' ? registry.data.technologies : []
  const categories = registry.status === 'ready' ? registry.data.categories : []
  const tags = registry.status === 'ready' ? registry.data.tags : []
  const categoryTitleById = useMemo(() => new Map(categories.map((c) => [c.id, c.title])), [categories])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RegistryTechnology | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RegistryTechnology | null>(null)
  const [deleteState, setDeleteState] = useState<'idle' | 'confirming' | 'error'>('idle')
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (tech: RegistryTechnology) => {
    setEditing(tech)
    setFormOpen(true)
  }

  const handleSubmit = async (payload: TechnologyFormPayload) => {
    if (payload.id) {
      await createEntity('technologies', payload)
    } else if (editing) {
      const { id: _omit, ...rest } = payload
      void _omit
      await updateEntity('technologies', editing.id, rest)
    }
    await registry.refresh()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteState('confirming')
    try {
      await deleteEntity('technologies', deleteTarget.id)
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
        <p className="text-sm text-[#667085]">{technologies.length}件の技術要素</p>
        <Button type="button" onClick={openCreate} className="bg-[#3157E5] text-white hover:bg-[#2748C7] hover:opacity-100">
          <Plus size={15} />
          新規作成
        </Button>
      </div>

      <div className="space-y-2">
        {technologies.map((tech) => (
          <div key={tech.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold text-[#111827]">{tech.name}</span>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {categoryTitleById.get(tech.categoryId) ?? tech.categoryId}
                </Badge>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {tech.technologyKind}
                </Badge>
                {tech.status === 'deprecated' && (
                  <Badge className="shrink-0 border-transparent bg-[#FEF3F2] text-[#B42318] hover:bg-[#FEF3F2]">deprecated</Badge>
                )}
              </div>
              <p className="truncate text-xs text-[#98A2B3]">{tech.id}</p>
              <p className="truncate text-xs text-[#667085]">{tech.description}</p>
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
                <DropdownMenuItem onSelect={() => openEdit(tech)}>
                  <Pencil size={14} />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setDeleteTarget(tech)
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
        {technologies.length === 0 && <p className="text-sm text-[#98A2B3]">技術要素がありません。</p>}
      </div>

      <TechnologyFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} categories={categories} tags={tags} onSubmit={handleSubmit} />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        heading="技術要素を削除しますか？"
        description={deleteTarget ? `「${deleteTarget.name}」を削除します。構成パターンから参照されている場合は削除できません。` : undefined}
        onConfirm={handleDelete}
        state={deleteState}
        errorMessage={deleteError}
      />
    </div>
  )
}
