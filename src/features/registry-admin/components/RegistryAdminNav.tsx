import { NavLink } from 'react-router-dom'
import { cn } from '../../../lib/utils'

const TABS = [
  { to: '/app/registry/technologies', label: '技術要素' },
  { to: '/app/registry/categories', label: 'カテゴリ' },
  { to: '/app/registry/tags', label: 'タグ' },
  { to: '/app/registry/stacks', label: '構成パターン' },
  { to: '/app/registry/rules', label: 'ルール' },
]

/** Technologies/Categories/Tags/Stacks/Rules のタブ切り替え（DESIGN.md Tabs規則: 選択中はBlue文字＋Blue枠）。 */
export function RegistryAdminNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-[#E5E7EB]">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'border-[#3157E5] text-[#3157E5]' : 'border-transparent text-[#667085] hover:text-[#344054]',
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
