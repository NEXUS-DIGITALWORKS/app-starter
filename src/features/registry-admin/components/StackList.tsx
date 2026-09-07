import { useMemo, useState } from 'react'
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRegistry } from '../../../lib/registry/RegistryProvider'
import { AdminApiError, createEntity, deleteEntity, updateEntity } from '../../../lib/api/adminClient'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { StackFormDialog, type StackFormPayload } from './StackFormDialog'
import type { RegistryStackPreset } from '../../../lib/registry/types'

export function StackList() {
  const registry = useRegistry()
  const stacks = registry.status === 'ready' ? registry.data.stacks : []
  const technologies = registry.status === 'ready' ? registry.data.technologies : []
  const tags = registry.status === 'ready' ? registry.data.tags : []
  const patternDefinitions = useMemo(
    () => stacks.filter((s) => s.presetType === 'architecture_pattern' && s.presetKind === 'pattern_definition'),
    [stacks],
  )
  const appTypeTags = useMemo(() => tags.filter((t) => t.tagType === 'app_type'), [tags])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RegistryStackPreset | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RegistryStackPreset | null>(null)
  const [deleteState, setDeleteState] = useState<'idle' | 'confirming' | 'error'>('idle')
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (stack: RegistryStackPreset) => {
    setEditing(stack)
    setFormOpen(true)
  }

  const handleSubmit = async (payload: StackFormPayload) => {
    if (payload.id) {
      await createEntity('stacks', payload)
    } else if (editing) {
      const { id: _omit, ...rest } = payload
      void _omit
      await updateEntity('stacks', editing.id, rest)
    }
    await registry.refresh()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteState('confirming')
    try {
      await deleteEntity('stacks', deleteTarget.id)
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
        <p className="text-sm text-[#667085]">{stacks.length}件の構成パターン</p>
        <Button type="button" onClick={openCreate} className="bg-[#3157E5] text-white hover:bg-[#2748C7] hover:opacity-100">
          <Plus size={15} />
          新規作成
        </Button>
      </div>

      <div className="space-y-2">
        {stacks.map((stack) => (
          <div key={stack.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="shrink-0 text-xs font-semibold text-[#2748C7]">{stack.id}</span>
                <span className="truncate text-sm font-semibold text-[#111827]">{stack.name}</span>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {stack.presetType === 'architecture_pattern' ? stack.presetKind ?? 'architecture_pattern' : 'tech_pattern'}
                </Badge>
              </div>
              {stack.parentPatternId && <p className="truncate text-xs text-[#98A2B3]">親: {stack.parentPatternId}</p>}
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
                <DropdownMenuItem onSelect={() => openEdit(stack)}>
                  <Pencil size={14} />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setDeleteTarget(stack)
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
        {stacks.length === 0 && <p className="text-sm text-[#98A2B3]">構成パターンがありません。</p>}
      </div>

      <StackFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        patternDefinitions={patternDefinitions}
        technologies={technologies}
        appTypeTags={appTypeTags}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        heading="構成パターンを削除しますか？"
        description={deleteTarget ? `「${deleteTarget.name}」を削除します。他のパターンの親として参照されている場合は削除できません。` : undefined}
        onConfirm={handleDelete}
        state={deleteState}
        errorMessage={deleteError}
      />
    </div>
  )
}
