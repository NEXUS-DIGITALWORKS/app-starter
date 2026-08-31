import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Layers, ShieldCheck, Sparkles } from 'lucide-react'
import AuthWidget from '../../auth/AuthWidget'
import logo from '../../../assets/logo.png'

const NAV_ITEMS = [
  { id: 'diagnosis', label: '診断', to: '/tools/diagnosis', match: '/tools/diagnosis', icon: Sparkles },
  { id: 'tech-selector', label: 'セレクター', to: '/tools/tech-selector', match: '/tools/tech-selector', icon: Layers },
  { id: 'tech-guide', label: 'テックガイド', to: '/tools/tech-guide', match: '/tools/tech-guide', icon: BookOpen },
  { id: 'risk-check', label: 'リスク', to: '/tools/risk-check', match: '/tools/risk-check', icon: ShieldCheck },
] as const

export function DiagnosisHeader() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white/75 px-4 backdrop-blur-[8px] sm:px-8 print:hidden">
      <div className="flex shrink-0 items-center gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src={logo} alt="BizTools" className="brand-logo" />
        </Link>
        <span className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] sm:block" />
        <span className="hidden shrink-0 text-sm font-semibold text-[#344054] sm:block">Build or Buy 技術構成診断</span>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.match || location.pathname.startsWith(`${item.match}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                to={item.to}
                aria-label={`${item.label}を開く`}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex h-10 shrink-0 appearance-none items-center gap-1.5 rounded-xl border px-2.5 text-sm font-medium shadow-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5] focus-visible:ring-offset-2 sm:px-3.5 ${
                  isActive
                    ? 'border-[#3157E5] bg-[#EAF1FF] text-[#2748C7]'
                    : 'border-[#D0D5DD] bg-white text-[#475467] hover:border-[#98A2B3] hover:bg-[#F8FAFC] hover:text-[#111827]'
                }`}
              >
                <Icon size={17} aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>
        <div className="shrink-0">
          <AuthWidget />
        </div>
      </div>
    </header>
  )
}
