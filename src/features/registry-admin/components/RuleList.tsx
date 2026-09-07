import { useMemo, useState } from 'react'
import { MoreVertical, Plus, Trash2 } from 'lucide-react'
import { useRegistry } from '../../../lib/registry/RegistryProvider'
import { AdminApiError, createEntity, deleteEntity } from '../../../lib/api/adminClient'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { RuleFormDialog, type RuleFormPayload } from './RuleFormDialog'
import type { RegistryRule } from '../../../lib/registry/types'

export function RuleList() {
  const registry = useRegistry()
  const rules = registry.status === 'ready' ? registry.data.rules : []
  const technologies = registry.status === 'ready' ? registry.data.technologies : []
  const stacks = registry.status === 'ready' ? registry.data.stacks : []
  const technologyNameById = useMemo(() => new Map(technologies.map((t) => [t.id, t.name])), [technologies])
  const stackNameById = useMemo(() => new Map(stacks.map((s) => [s.id, `${s.id} ${s.name}`])), [stacks])

  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RegistryRule | null>(null)
  const [deleteState, setDeleteState] = useState<'idle' | 'confirming' | 'error'>('idle')
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const handleSubmit = async (payload: RuleFormPayload) => {
    await createEntity('rules', payload)
    await registry.refresh()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteState('confirming')
    try {
      await deleteEntity('rules', deleteTarget.id)
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
        <p className="text-sm text-[#667085]">{rules.length}件のルール（編集は未対応、削除して作り直してください）</p>
        <Button type="button" onClick={() => setFormOpen(true)} className="bg-[#3157E5] text-white hover:bg-[#2748C7] hover:opacity-100">
          <Plus size={15} />
          新規作成
        </Button>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {rule.ruleType}
                </Badge>
                <span className="truncate text-sm font-semibold text-[#111827]">
                  {rule.technologyId ? technologyNameById.get(rule.technologyId) ?? rule.technologyId : '—'}
                </span>
              </div>
              <p className="truncate text-xs text-[#667085]">
                {rule.ruleType === 'preferred_for_preset'
                  ? rule.presetId
                    ? (stackNameById.get(rule.presetId) ?? rule.presetId)
                    : '—'
                  : `${rule.conditionKey ?? ''} = ${rule.conditionValue ?? ''}`}
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
                <DropdownMenuItem
                  onSelect={() => {
                    setDeleteTarget(rule)
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
        {rules.length === 0 && <p className="text-sm text-[#98A2B3]">ルールがありません。</p>}
      </div>

      <RuleFormDialog open={formOpen} onOpenChange={setFormOpen} technologies={technologies} stacks={stacks} onSubmit={handleSubmit} />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        heading="ルールを削除しますか？"
        onConfirm={handleDelete}
        state={deleteState}
        errorMessage={deleteError}
      />
    </div>
  )
}
