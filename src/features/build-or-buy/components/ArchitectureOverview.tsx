import type { ComponentType } from 'react'
import { AlertTriangle, Cloud, Database, Link2, Lock, Mail, MessageCircle, MessageSquare, ScrollText } from 'lucide-react'
import type { DiagnosisResult } from '../types'

type RowItem = { label: string; note?: string }

type Row = {
  title: string
  pillClassName: string
  boxClassName: string
  items: RowItem[]
  highlight?: boolean
}

function pickIcon(label: string): { Icon: ComponentType<{ size?: number; className?: string }>; className: string } {
  const lower = label.toLowerCase()
  if (lower.includes('line')) return { Icon: MessageCircle, className: 'text-emerald-500' }
  if (lower.includes('chatwork') || lower.includes('slack') || lower.includes('teams') || lower.includes('チャット'))
    return { Icon: MessageSquare, className: 'text-orange-500' }
  if (lower.includes('メール') || lower.includes('mail')) return { Icon: Mail, className: 'text-slate-400' }
  if (lower.includes('クラウド') || lower.includes('cloud')) return { Icon: Cloud, className: 'text-sky-500' }
  if (lower.includes('バックアップ')) return { Icon: Lock, className: 'text-slate-400' }
  if (lower.includes('監視') || lower.includes('ログ')) return { Icon: ScrollText, className: 'text-slate-400' }
  if (lower.includes('db') || lower.includes('データベース') || lower.includes('postgres') || lower.includes('supabase'))
    return { Icon: Database, className: 'text-emerald-500' }
  return { Icon: Link2, className: 'text-slate-400' }
}

export function ArchitectureOverview({ result }: { result: DiagnosisResult }) {
  const coreSaas = result.recommendedSaas[0]
  const isSaasCentric = result.buildOrBuy.category === 'A' || result.buildOrBuy.category === 'B' || result.buildOrBuy.category === 'C'
  const rows: Row[] = []

  const frontendLabel = result.primaryStack?.roles.frontend ?? (isSaasCentric ? 'Webブラウザ（レスポンシブ対応）' : undefined)
  if (frontendLabel) {
    rows.push({
      title: 'フロントエンド',
      pillClassName: 'bg-[#EAF1FF] text-[#3157E5]',
      boxClassName: 'border-[#BFD3FE] bg-[#EAF1FF]',
      items: [{ label: frontendLabel }],
    })
  }

  if (coreSaas) {
    rows.push({
      title: 'アプリ基盤',
      pillClassName: 'bg-[#FFF3E6] text-[#B45309]',
      boxClassName: 'border-[#FFD9A8] bg-[#FFF8EF]',
      items: [{ label: coreSaas.name, note: result.buildRange.length > 0 ? `独自開発部分（${result.buildRange.join('・')}）` : undefined }],
      highlight: true,
    })
  } else if (result.buildRange.length > 0) {
    rows.push({
      title: 'アプリ基盤',
      pillClassName: 'bg-[#FFF3E6] text-[#B45309]',
      boxClassName: 'border-[#FFD9A8] bg-[#FFF8EF]',
      items: [{ label: '独自開発（AIコーディング中心）', note: result.buildRange.join('・') }],
      highlight: true,
    })
  }

  const dataItems: RowItem[] = []
  if (coreSaas) dataItems.push({ label: `${coreSaas.name} DB（アプリデータ）` })
  if (result.primaryStack?.roles.database) {
    dataItems.push({
      label: coreSaas ? `外部DB（${result.primaryStack.roles.database}）` : result.primaryStack.roles.database,
      note: coreSaas ? '必要に応じて利用' : undefined,
    })
  }
  if (dataItems.length > 0) {
    rows.push({
      title: 'データ基盤',
      pillClassName: 'bg-[#EAFBF2] text-[#0F766E]',
      boxClassName: 'border-[#B7EBD2] bg-[#F3FDF8]',
      items: dataItems,
    })
  }

  const authItems: RowItem[] = []
  if (coreSaas) authItems.push({ label: `${coreSaas.name} ユーザー管理（SSO連携可）` })
  if (result.primaryStack?.roles.auth) authItems.push({ label: result.primaryStack.roles.auth })
  if (authItems.length > 0) {
    rows.push({
      title: '認証・ユーザー',
      pillClassName: 'bg-[#F3EEFF] text-[#6D28D9]',
      boxClassName: 'border-[#D9CCFF] bg-[#F8F5FF]',
      items: authItems,
    })
  }

  if (result.externalRange.length > 0) {
    rows.push({
      title: '外部連携・通知',
      pillClassName: 'bg-[#FFF3E6] text-[#B45309]',
      boxClassName: 'border-slate-200 bg-white',
      items: result.externalRange.map((label) => ({ label })),
    })
  }

  const infraItems: RowItem[] = []
  if (result.primaryStack?.roles.hosting) infraItems.push({ label: result.primaryStack.roles.hosting })
  if (result.primaryStack?.roles.monitoring) infraItems.push({ label: result.primaryStack.roles.monitoring })
  if (infraItems.length === 0 && isSaasCentric) {
    infraItems.push({ label: 'クラウド（SaaS基盤）' }, { label: 'バックアップ（ベンダー標準）' }, { label: '監視・ログ管理（管理画面）' })
  }
  if (infraItems.length > 0) {
    rows.push({
      title: 'インフラ・運用',
      pillClassName: 'bg-[#EAF1FF] text-[#3157E5]',
      boxClassName: 'border-slate-200 bg-white',
      items: infraItems,
    })
  }

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">回答が進むと構成図が表示されます。</p>
  }

  return (
    <div>
      {result.isCloseCall && result.alternativePattern && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            「{result.primaryPattern.name}」と「{result.alternativePattern.name}」が僅差の候補です。要件の優先順位によってはどちらも有力なので、下記の代替案もあわせてご確認ください。
          </span>
        </div>
      )}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.title} className="grid grid-cols-[110px_1fr] items-start gap-3 sm:grid-cols-[130px_1fr]">
            <span className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-bold ${row.pillClassName}`}>{row.title}</span>
            <div className="flex flex-wrap items-stretch gap-2">
              {row.items.map((item, index) => {
                const { Icon, className } = pickIcon(item.label)
                return (
                  <div key={item.label} className="flex items-stretch gap-2">
                    {index > 0 && <span className="flex items-center px-0.5 text-sm font-bold text-slate-300">+</span>}
                    <div
                      className={`min-w-[140px] flex-1 rounded-xl border px-3.5 py-2.5 ${row.boxClassName} ${
                        row.highlight ? 'border-2' : ''
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 font-bold text-slate-900 ${row.highlight ? 'text-base' : 'text-sm'}`}>
                        {row.title !== 'フロントエンド' && <Icon size={14} className={className} />}
                        {item.label}
                      </div>
                      {item.note && <p className="mt-1 text-xs text-slate-500">{item.note}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
