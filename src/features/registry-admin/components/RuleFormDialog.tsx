import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import type { RegistryRuleType, RegistryStackPreset, RegistryTechnology } from '../../../lib/registry/types'

export type RuleFormPayload = {
  ruleType: RegistryRuleType
  technologyId: string
  presetId?: string
  conditionKey?: string
  conditionValue?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  technologies: RegistryTechnology[]
  stacks: RegistryStackPreset[]
  onSubmit: (payload: RuleFormPayload) => Promise<void>
}

export function RuleFormDialog({ open, onOpenChange, technologies, stacks, onSubmit }: Props) {
  const [ruleType, setRuleType] = useState<RegistryRuleType>('preferred_for_preset')
  const [technologyId, setTechnologyId] = useState('')
  const [presetId, setPresetId] = useState('')
  const [conditionKey, setConditionKey] = useState('')
  const [conditionValue, setConditionValue] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setRuleType('preferred_for_preset')
    setTechnologyId(technologies[0]?.id ?? '')
    setPresetId(stacks[0]?.id ?? '')
    setConditionKey('')
    setConditionValue('')
    setState('idle')
    setErrorMessage(null)
  }, [open, technologies, stacks])

  const canSubmit =
    technologyId.length > 0 &&
    (ruleType === 'preferred_for_preset' ? presetId.length > 0 : conditionKey.trim().length > 0 && conditionValue.trim().length > 0) &&
    state !== 'saving'

  const handleSubmit = async () => {
    if (!canSubmit) return
    setState('saving')
    try {
      await onSubmit({
        ruleType,
        technologyId,
        presetId: ruleType === 'preferred_for_preset' ? presetId : undefined,
        conditionKey: ruleType === 'answer_option_alias' ? conditionKey : undefined,
        conditionValue: ruleType === 'answer_option_alias' ? conditionValue : undefined,
      })
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
          <DialogTitle>ルールを新規作成</DialogTitle>
          <DialogDescription>技術とプリセット・回答選択肢を結びつける互換性ルールです。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">種別</label>
            <Select value={ruleType} onValueChange={(v) => setRuleType(v as RegistryRuleType)} disabled={state === 'saving'}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preferred_for_preset">preferred_for_preset（このパターンでは優先表示）</SelectItem>
                <SelectItem value="answer_option_alias">answer_option_alias（質問の選択肢との対応）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">技術要素</label>
            <Select value={technologyId} onValueChange={setTechnologyId} disabled={state === 'saving'}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="技術要素を選択" />
              </SelectTrigger>
              <SelectContent>
                {technologies.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {ruleType === 'preferred_for_preset' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">構成パターン</label>
              <Select value={presetId} onValueChange={setPresetId} disabled={state === 'saving'}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="構成パターンを選択" />
                </SelectTrigger>
                <SelectContent>
                  {stacks.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.id} {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">質問のid（conditionKey）</label>
                <Input value={conditionKey} onChange={(e) => setConditionKey(e.target.value)} disabled={state === 'saving'} placeholder="例: q_existing_saas" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">選択肢の値（conditionValue）</label>
                <Input value={conditionValue} onChange={(e) => setConditionValue(e.target.value)} disabled={state === 'saving'} placeholder="例: kintone" />
              </div>
            </div>
          )}

          {state === 'error' && <p className="text-xs text-destructive">{errorMessage}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={state === 'saving'}>
            キャンセル
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit} className="bg-[#3157E5] text-white hover:bg-[#2748C7] hover:opacity-100">
            {state === 'saving' ? '保存中…' : '保存する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
