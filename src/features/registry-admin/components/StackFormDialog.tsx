import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { isValidStackId } from '../lib/slug'
import { ChipToggleGroup } from './ChipToggleGroup'
import type {
  ArchitecturePatternDetail,
  RegistryPresetKind,
  RegistryPresetType,
  RegistryStackPreset,
  RegistryTag,
  RegistryTechnology,
  TechPatternDetail,
} from '../../../lib/registry/types'

const APP_TYPE_TAG_PREFIX = 'app_type:'

type RoleItem = { role: string; label: string }

export type StackFormPayload = {
  id?: string
  presetType: RegistryPresetType
  presetKind?: RegistryPresetKind
  parentPatternId?: string
  name: string
  appTypeIds?: string[]
  detail?: Record<string, unknown>
  items: { technologyId?: string; role?: string; label?: string }[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: RegistryStackPreset | null
  patternDefinitions: RegistryStackPreset[]
  technologies: RegistryTechnology[]
  appTypeTags: RegistryTag[]
  onSubmit: (payload: StackFormPayload) => Promise<void>
}

function linesToArray(value: string): string[] {
  return value
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)
}

export function StackFormDialog({ open, onOpenChange, initial, patternDefinitions, technologies, appTypeTags, onSubmit }: Props) {
  const isEdit = initial !== null
  const [id, setId] = useState('')
  const [presetType, setPresetType] = useState<RegistryPresetType>('architecture_pattern')
  const [presetKind, setPresetKind] = useState<RegistryPresetKind>('pattern_definition')
  const [parentPatternId, setParentPatternId] = useState('')
  const [name, setName] = useState('')
  const [appTypeIds, setAppTypeIds] = useState<string[]>([])
  const [items, setItems] = useState<RoleItem[]>([])
  const [techItemIds, setTechItemIds] = useState<string[]>([])

  // pattern_definition detail
  const [pdDescription, setPdDescription] = useState('')
  const [pdComplexityLevel, setPdComplexityLevel] = useState('2')
  const [pdSuitable, setPdSuitable] = useState('')
  const [pdUnsuitable, setPdUnsuitable] = useState('')
  const [pdCandidates, setPdCandidates] = useState('')

  // tech_pattern detail
  const [tpShortSummary, setTpShortSummary] = useState('')
  const [tpPrimaryUse, setTpPrimaryUse] = useState('')
  const [tpArchitectureType, setTpArchitectureType] = useState('')
  const [tpPrimaryLanguage, setTpPrimaryLanguage] = useState('')
  const [tpWhatYouCanBuild, setTpWhatYouCanBuild] = useState('')
  const [tpWhyRecommended, setTpWhyRecommended] = useState('')
  const [tpStrengths, setTpStrengths] = useState('')
  const [tpSuitableCases, setTpSuitableCases] = useState('')
  const [tpUnsuitableCases, setTpUnsuitableCases] = useState('')
  const [tpExpectedFeatures, setTpExpectedFeatures] = useState('')

  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setId(initial?.id ?? '')
    setPresetType(initial?.presetType ?? 'architecture_pattern')
    setPresetKind(initial?.presetKind ?? 'pattern_definition')
    setParentPatternId(initial?.parentPatternId ?? '')
    setName(initial?.name ?? '')
    setAppTypeIds(initial?.appTypeIds ?? [])
    setItems(initial?.presetKind === 'stack_profile' ? initial.items.map((i) => ({ role: i.role ?? '', label: i.label ?? '' })) : [])
    setTechItemIds(
      initial?.presetType === 'tech_pattern' ? initial.items.map((i) => i.technologyId).filter((v): v is string => Boolean(v)) : [],
    )

    const pd = initial?.presetKind === 'pattern_definition' ? (initial.detail as ArchitecturePatternDetail | undefined) : undefined
    setPdDescription(pd?.description ?? '')
    setPdComplexityLevel(pd ? String(pd.complexityLevel) : '2')
    setPdSuitable((pd?.suitableConditions ?? []).join('\n'))
    setPdUnsuitable((pd?.unsuitableConditions ?? []).join('\n'))
    setPdCandidates((pd?.candidates ?? []).join('\n'))

    const tp = initial?.presetType === 'tech_pattern' ? (initial.detail as TechPatternDetail | undefined) : undefined
    setTpShortSummary(tp?.shortSummary ?? '')
    setTpPrimaryUse(tp?.primaryUse ?? '')
    setTpArchitectureType(tp?.architectureType ?? '')
    setTpPrimaryLanguage(tp?.primaryLanguage ?? '')
    setTpWhatYouCanBuild(tp?.whatYouCanBuild ?? '')
    setTpWhyRecommended((tp?.whyRecommended ?? []).join('\n'))
    setTpStrengths((tp?.strengths ?? []).join('\n'))
    setTpSuitableCases((tp?.suitableCases ?? []).join('\n'))
    setTpUnsuitableCases((tp?.unsuitableCases ?? []).join('\n'))
    setTpExpectedFeatures((tp?.expectedFeatures ?? []).join('\n'))

    setState('idle')
    setErrorMessage(null)
  }, [open, initial])

  const idValid = isEdit || isValidStackId(id)
  const needsParent = presetType === 'architecture_pattern' && presetKind === 'stack_profile'
  const canSubmit = idValid && name.trim().length > 0 && (!needsParent || parentPatternId.length > 0) && state !== 'saving'

  const addRoleItem = () => setItems((prev) => [...prev, { role: '', label: '' }])
  const removeRoleItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index))
  const updateRoleItem = (index: number, patch: Partial<RoleItem>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  const toggleTechItem = (techId: string) =>
    setTechItemIds((prev) => (prev.includes(techId) ? prev.filter((t) => t !== techId) : [...prev, techId]))
  const toggleAppType = (tagId: string) => {
    const appTypeId = tagId.slice(APP_TYPE_TAG_PREFIX.length)
    setAppTypeIds((prev) => (prev.includes(appTypeId) ? prev.filter((t) => t !== appTypeId) : [...prev, appTypeId]))
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setState('saving')
    try {
      let detail: Record<string, unknown> | undefined
      let payloadItems: StackFormPayload['items'] = []

      if (presetType === 'architecture_pattern' && presetKind === 'pattern_definition') {
        detail = {
          description: pdDescription,
          complexityLevel: Number(pdComplexityLevel) || 1,
          suitableConditions: linesToArray(pdSuitable),
          unsuitableConditions: linesToArray(pdUnsuitable),
          candidates: linesToArray(pdCandidates),
        }
      } else if (presetType === 'architecture_pattern' && presetKind === 'stack_profile') {
        payloadItems = items.filter((i) => i.role.trim() || i.label.trim()).map((i) => ({ role: i.role, label: i.label }))
      } else if (presetType === 'tech_pattern') {
        detail = {
          shortSummary: tpShortSummary,
          primaryUse: tpPrimaryUse,
          architectureType: tpArchitectureType,
          primaryLanguage: tpPrimaryLanguage,
          whatYouCanBuild: tpWhatYouCanBuild,
          whyRecommended: linesToArray(tpWhyRecommended),
          strengths: linesToArray(tpStrengths),
          suitableCases: linesToArray(tpSuitableCases),
          unsuitableCases: linesToArray(tpUnsuitableCases),
          expectedFeatures: linesToArray(tpExpectedFeatures),
        }
        payloadItems = techItemIds.map((technologyId) => ({ technologyId }))
      }

      await onSubmit({
        id: isEdit ? undefined : id,
        presetType,
        presetKind: presetType === 'architecture_pattern' ? presetKind : undefined,
        parentPatternId: needsParent ? parentPatternId : undefined,
        name,
        appTypeIds: needsParent ? appTypeIds : undefined,
        detail,
        items: payloadItems,
      })
      onOpenChange(false)
    } catch (err) {
      setState('error')
      setErrorMessage(err instanceof Error ? err.message : '保存に失敗しました。')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? '構成パターンを編集' : '構成パターンを新規作成'}</DialogTitle>
          <DialogDescription>build-or-buy用のアーキテクチャパターン、または技術要素セレクター用の構成パターンです。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">id</label>
              <Input value={id} onChange={(e) => setId(e.target.value)} disabled={isEdit || state === 'saving'} placeholder="例: WEB-12 / SP-17" />
              {!isEdit && id.length > 0 && !idValid && <p className="text-xs text-destructive">半角英数字とハイフンのみ使用できます。</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">体系（preset type）</label>
              <Select value={presetType} onValueChange={(v) => setPresetType(v as RegistryPresetType)} disabled={isEdit || state === 'saving'}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="architecture_pattern">architecture_pattern（P1〜P9・SP系）</SelectItem>
                  <SelectItem value="tech_pattern">tech_pattern（WEB/MOB/DESK/BIZ/AI/INF系）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {presetType === 'architecture_pattern' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">種別（preset kind）</label>
              <Select value={presetKind} onValueChange={(v) => setPresetKind(v as RegistryPresetKind)} disabled={isEdit || state === 'saving'}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pattern_definition">pattern_definition（P1〜P9本体）</SelectItem>
                  <SelectItem value="stack_profile">stack_profile（具体的なスタック構成）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">名称</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={state === 'saving'} />
          </div>

          {needsParent && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">親パターン（P1〜P9）</label>
                <Select value={parentPatternId} onValueChange={setParentPatternId} disabled={state === 'saving'}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="親パターンを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {patternDefinitions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.id} {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">対象アプリ種別</label>
                <ChipToggleGroup
                  options={appTypeTags.map((t) => ({ id: t.id, label: t.label }))}
                  selectedIds={appTypeIds.map((a) => `${APP_TYPE_TAG_PREFIX}${a}`)}
                  onToggle={toggleAppType}
                  disabled={state === 'saving'}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">構成（役割・技術名）</label>
                  <Button type="button" variant="outline" size="sm" onClick={addRoleItem} disabled={state === 'saving'}>
                    <Plus size={13} />
                    行を追加
                  </Button>
                </div>
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="role（例: frontend）"
                      value={item.role}
                      onChange={(e) => updateRoleItem(index, { role: e.target.value })}
                      disabled={state === 'saving'}
                    />
                    <Input
                      placeholder="技術名（例: Next.js単体）"
                      value={item.label}
                      onChange={(e) => updateRoleItem(index, { label: e.target.value })}
                      disabled={state === 'saving'}
                    />
                    <button
                      type="button"
                      onClick={() => removeRoleItem(index)}
                      disabled={state === 'saving'}
                      className="shrink-0 rounded-lg p-2 text-[#98A2B3] hover:bg-[#FEF3F2] hover:text-[#B42318]"
                      aria-label="この行を削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {presetType === 'architecture_pattern' && presetKind === 'pattern_definition' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">説明</label>
                <Textarea value={pdDescription} onChange={(e) => setPdDescription(e.target.value)} rows={2} disabled={state === 'saving'} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">複雑度（1〜5）</label>
                <Input type="number" min={1} max={5} value={pdComplexityLevel} onChange={(e) => setPdComplexityLevel(e.target.value)} disabled={state === 'saving'} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">向いている条件（1行1項目）</label>
                  <Textarea value={pdSuitable} onChange={(e) => setPdSuitable(e.target.value)} rows={3} disabled={state === 'saving'} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">向いていない条件（1行1項目）</label>
                  <Textarea value={pdUnsuitable} onChange={(e) => setPdUnsuitable(e.target.value)} rows={3} disabled={state === 'saving'} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">候補技術（1行1項目）</label>
                <Textarea value={pdCandidates} onChange={(e) => setPdCandidates(e.target.value)} rows={3} disabled={state === 'saving'} />
              </div>
            </>
          )}

          {presetType === 'tech_pattern' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">一言要約</label>
                <Textarea value={tpShortSummary} onChange={(e) => setTpShortSummary(e.target.value)} rows={2} disabled={state === 'saving'} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="主な用途" value={tpPrimaryUse} onChange={(e) => setTpPrimaryUse(e.target.value)} disabled={state === 'saving'} />
                <Input placeholder="構成タイプ" value={tpArchitectureType} onChange={(e) => setTpArchitectureType(e.target.value)} disabled={state === 'saving'} />
                <Input placeholder="中心言語" value={tpPrimaryLanguage} onChange={(e) => setTpPrimaryLanguage(e.target.value)} disabled={state === 'saving'} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">作れるもの</label>
                <Textarea value={tpWhatYouCanBuild} onChange={(e) => setTpWhatYouCanBuild(e.target.value)} rows={2} disabled={state === 'saving'} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">推奨理由（1行1項目）</label>
                  <Textarea value={tpWhyRecommended} onChange={(e) => setTpWhyRecommended(e.target.value)} rows={3} disabled={state === 'saving'} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">強み（1行1項目）</label>
                  <Textarea value={tpStrengths} onChange={(e) => setTpStrengths(e.target.value)} rows={3} disabled={state === 'saving'} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">向いているケース（1行1項目）</label>
                  <Textarea value={tpSuitableCases} onChange={(e) => setTpSuitableCases(e.target.value)} rows={3} disabled={state === 'saving'} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">別構成が良いケース（1行1項目）</label>
                  <Textarea value={tpUnsuitableCases} onChange={(e) => setTpUnsuitableCases(e.target.value)} rows={3} disabled={state === 'saving'} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">想定される代表機能（1行1項目）</label>
                <Textarea value={tpExpectedFeatures} onChange={(e) => setTpExpectedFeatures(e.target.value)} rows={3} disabled={state === 'saving'} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">対応する技術要素</label>
                <ChipToggleGroup
                  options={technologies.map((t) => ({ id: t.id, label: t.name }))}
                  selectedIds={techItemIds}
                  onToggle={toggleTechItem}
                  disabled={state === 'saving'}
                />
              </div>
            </>
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
