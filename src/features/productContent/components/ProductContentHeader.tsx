import { Link } from 'react-router-dom';
import { Globe2, ShieldCheck, Sparkles } from 'lucide-react';
import AccountMenu from '../../auth/AccountMenu';

const NAV_BADGES = [
  { icon: Sparkles, label: 'AIで商品情報を改善' },
  { icon: Globe2, label: '多言語対応' },
  { icon: ShieldCheck, label: '高い信頼性' },
];

export default function ProductContentHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[#D0D5DD] bg-white px-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] sm:px-6">
      <Link to="/app" className="flex min-w-0 shrink-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3157E5] text-sm font-bold text-white">
          P
        </span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-[15px] font-bold text-[#111827]">商品情報整備AI</span>
          <span className="truncate text-xs text-[#667085]">Product Content Studio</span>
        </span>
      </Link>

      <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex">
        {NAV_BADGES.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#475467]"
          >
            <Icon size={14} className="shrink-0 text-[#3157E5]" />
            {label}
          </span>
        ))}
      </div>

      <div className="shrink-0">
        <AccountMenu />
      </div>
    </header>
  );
}
