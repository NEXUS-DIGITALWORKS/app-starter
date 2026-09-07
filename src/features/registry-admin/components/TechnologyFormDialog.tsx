import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { isValidSlug } from '../lib/slug'
import { ChipToggleGroup } from './ChipToggleGroup'
import type { RegistryCategory, RegistryTag, RegistryTechnology, RegistryTechnologyKind, RegistryTechnologyStatus } from '../../../lib/registry/types'

const TECHNOLOGY_KINDS: { value: RegistryTechnologyKind; label: string }[] = [
  { value: 'framework', label: 'framework' },
  { value: 'library', label: 'library' },
  { value: 'platform', label: 'platform' },
  { value: 'saas', label: 'saas' },
  { value: 'tool', label: 'tool' },
]

const SCORE_FIELDS: { key: keyof ScoreState; label: string }[] = [
  { key: 'security', label: 'セキュリティ' },
  { key: 'cost', label: 'コスト' },
  { key: 'developmentSpeed', label: '開発速度' },
  { key: 'aiCoding', label: 'AIコーディング適性' },
  { key: 'scalability', label: '拡張性' },
]

type ScoreState = { security: string; cost: string; developmentSpeed: string; aiCoding: string; scalability: string }

export type TechnologyFormPayload = {
  id?: string
  categoryId: string
  technologyKind: RegistryTechnologyKind
  name: string
  description: string
  detail?: { overview?: string; fit?: string; caution?: string; url?: string; strengths?: string[] }
  pricing?: { monthlyBaseFee: number; monthlyPricePerUser: number }
  scores?: { security?: number; cost?: number; developmentSpeed?: number; aiCoding?: number; scalability?: number }
  status: RegistryTechnologyStatus
  notes?: string
  tagIds: string[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: RegistryTechnology | null
  categories: RegistryCategory[]
  tags: RegistryTag[]
  onSubmit: (payload: TechnologyFormPayload) => Promise<void>
}

function scoreToInput(value: number | undefined): string {
  return value === undefined ? '' : String(value)
}

function inputToScore(value: string): number | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

export function TechnologyFormDialog({ open, onOpenChange, initial, categories, tags, onSubmit }: Props) {
  const isEdit = initial !== null
  const [id, setId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [technologyKind, setTechnologyKind] = useState<RegistryTechnologyKind>('tool')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [overview, setOverview] = useState('')
  const [fit, setFit] = useState('')
  const [caution, setCaution] = useState('')
  const [url, setUrl] = useState('')
  const [strengths, setStrengths] = useState('')
  const [monthlyBaseFee, setMonthlyBaseFee] = useState('')
  const [monthlyPricePerUser, setMonthlyPricePerUser] = useState('')
  const [scores, setScores] = useState<ScoreState>({ security: '', cost: '', developmentSpeed: '', aiCoding: '', scalability: '' })
  const [status, setStatus] = useState<RegistryTechnologyStatus>('active')
  const [notes, setNotes] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setId(initial?.id ?? '')
    setCategoryId(initial?.categoryId ?? categories[0]?.id ?? '')
    setTechnologyKind(initial?.technologyKind ?? 'tool')
    setName(initial?.name ?? '')
    setDescription(initial?.description ?? '')
    setOverview(initial?.detail?.overview ?? '')
    setFit(initial?.detail?.fit ?? '')
    setCaution(initial?.detail?.caution ?? '')
    setUrl(initial?.detail?.url ?? '')
    setStrengths((initial?.detail?.strengths ?? []).join('\n'))
    setMonthlyBaseFee(initial?.pricing ? String(initial.pricing.monthlyBaseFee) : '')
    setMonthlyPricePerUser(initial?.pricing ? String(initial.pricing.monthlyPricePerUser) : '')
    setScores({
      security: scoreToInput(initial?.scores?.security),
      cost: scoreToInput(initial?.scores?.cost),
      developmentSpeed: scoreToInput(initial?.scores?.developmentSpeed),
      aiCoding: scoreToInput(initial?.scores?.aiCoding),
      scalability: scoreToInput(initial?.scores?.scalability),
    })
    setStatus(initial?.status ?? 'active')
    setNotes(initial?.notes ?? '')
    setTagIds(initial?.tagIds ?? [])
    setState('idle')
    setErrorMessage(null)
  }, [open, initial, categories])

  const idValid = isEdit || isValidSlug(id)
  const canSubmit = idValid && categoryId.length > 0 && name.trim().length > 0 && description.trim().length > 0 && state !== 'saving'

  const toggleTag = (tagId: string) => {
    setTagIds((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]))
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setState('saving')
    try {
      const strengthList = strengths
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      const detail =
        overview || fit || caution || url || strengthList.length > 0
          ? { overview: overview || undefined, fit: fit || undefined, caution: caution || undefined, url: url || undefined, strengths: strengthList.length > 0 ? strengthList : undefined }
          : undefined
      const pricing =
        technologyKind === 'saas' && (monthlyBaseFee.trim() || monthlyPricePerUser.trim())
          ? { monthlyBaseFee: Number(monthlyBaseFee) || 0, monthlyPricePerUser: Number(monthlyPricePerUser) || 0 }
          : undefined
      const scoresPayload = {
        security: inputToScore(scores.security),
        cost: inputToScore(scores.cost),
        developmentSpeed: inputToScore(scores.developmentSpeed),
        aiCoding: inputToScore(scores.aiCoding),
        scalability: inputToScore(scores.scalability),
      }
      const hasScore = Object.values(scoresPayload).some((v) => v !== undefined)

      await onSubmit({
        id: isEdit ? undefined : id,
        categoryId,
        technologyKind,
        name,
        description,
        detail,
        pricing,
        scores: hasScore ? scoresPayload : undefined,
        status,
        notes: notes || undefined,
        tagIds,
      })
      onOpenChange(false)
    } catch (err) {
      setState('error')
      setErrorMessage(err instanceof Error ? err.message : '保存に失敗しました。')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? '技術要素を編集' : '技術要素を新規作成'}</DialogTitle>
          <DialogDescription>Stack Registryに登録する技術・SaaS製品の情報です。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="tech-id" className="text-xs font-semibold text-muted-foreground">
                id（半角英数字とハイフン）
              </label>
              <Input id="tech-id" value={id} onChange={(e) => setId(e.target.value)} disabled={isEdit || state === 'saving'} placeholder="例: react-vite" />
              {!isEdit && id.length > 0 && !idValid && <p className="text-xs text-destructive">半角小文字英数字とハイフンのみ使用できます。</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">種別</label>
              <Select value={technologyKind} onValueChange={(v) => setTechnologyKind(v as RegistryTechnologyKind)} disabled={state === 'saving'}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TECHNOLOGY_KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">カテゴリ</label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={state === 'saving'}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tech-name" className="text-xs font-semibold text-muted-foreground">
              名称
            </label>
            <Input id="tech-name" value={name} onChange={(e) => setName(e.target.value)} disabled={state === 'saving'} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tech-description" className="text-xs font-semibold text-muted-foreground">
              説明（一覧に表示される要約）
            </label>
            <Textarea id="tech-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} disabled={state === 'saving'} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">概要</label>
              <Textarea value={overview} onChange={(e) => setOverview(e.target.value)} rows={2} disabled={state === 'saving'} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">向いているケース</label>
              <Textarea value={fit} onChange={(e) => setFit(e.target.value)} rows={2} disabled={state === 'saving'} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">検討ポイント</label>
              <Textarea value={caution} onChange={(e) => setCaution(e.target.value)} rows={2} disabled={state === 'saving'} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">公式URL</label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} disabled={state === 'saving'} placeholder="https://" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">強み（1行1項目、主にSaaS製品で使用）</label>
            <Textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={3} disabled={state === 'saving'} />
          </div>

          {technologyKind === 'saas' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">月額基本料金（円）</label>
                <Input type="number" value={monthlyBaseFee} onChange={(e) => setMonthlyBaseFee(e.target.value)} disabled={state === 'saving'} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">1ユーザーあたり月額（円）</label>
                <Input type="number" value={monthlyPricePerUser} onChange={(e) => setMonthlyPricePerUser(e.target.value)} disabled={state === 'saving'} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">評価値（1〜5、任意）</label>
            <div className="grid grid-cols-5 gap-2">
              {SCORE_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-[10px] text-[#98A2B3]">{field.label}</label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={scores[field.key]}
                    onChange={(e) => setScores((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    disabled={state === 'saving'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">ステータス</label>
              <Select value={status} onValueChange={(v) => setStatus(v as RegistryTechnologyStatus)} disabled={state === 'saving'}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="deprecated">deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">メモ（任意）</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} disabled={state === 'saving'} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">タグ</label>
            <ChipToggleGroup
              options={tags.map((t) => ({ id: t.id, label: t.label }))}
              selectedIds={tagIds}
              onToggle={toggleTag}
              disabled={state === 'saving'}
              emptyLabel="タグがありません。先にタグを作成してください。"
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
