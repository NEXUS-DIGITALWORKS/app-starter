import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, LayoutDashboard, LogOut, User } from 'lucide-react';
import { signOut, useAuth } from '../../hooks/useAuth';

export default function AccountMenu() {
  const { session, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isInApp = location.pathname.startsWith('/app');

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const name = profile?.display_name || session?.user.email || '';
  const email = session?.user.email ?? '';

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 appearance-none items-center gap-1.5 rounded-full border-0 bg-transparent pl-0 pr-1 outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#3157E5]/30 focus-visible:ring-offset-2"
        aria-label="アカウントメニュー"
        aria-expanded={open}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3157E5] to-[#6D8CF5] text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <User size={18} />
        </span>
        <ChevronDown size={16} className="shrink-0 text-[#667085]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-30 w-[min(320px,88vw)] overflow-hidden rounded-2xl border border-[#D0D5DD] bg-white shadow-[0_16px_40px_rgba(16,24,40,0.16)]"
        >
          <div className="relative h-20 bg-gradient-to-br from-[#3157E5] to-[#6D8CF5]">
            <svg
              className="absolute bottom-0 left-0 h-6 w-full text-white"
              viewBox="0 0 320 24"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0,10 C60,26 100,26 160,10 C220,-6 260,-6 320,10 L320,24 L0,24 Z" fill="currentColor" />
            </svg>
          </div>

          <div className="flex flex-col items-center px-5 pb-4 pt-0 text-center">
            <div className="relative z-10 -mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#3157E5] to-[#6D8CF5] text-white shadow-md">
              <User size={26} />
            </div>
            <p className="mt-2 truncate text-base font-semibold text-[#111827]">{name}</p>
            {email && email !== name && <p className="truncate text-sm text-[#667085]">{email}</p>}
          </div>

          <div className="border-t border-[#EEF0F4] px-2 py-2">
            {!isInApp && (
              <Link
                to="/app"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#344054] outline-none transition-colors hover:bg-[#F8FAFC] focus-visible:ring-2 focus-visible:ring-[#3157E5] focus-visible:ring-inset"
                role="menuitem"
              >
                <LayoutDashboard size={17} className="shrink-0 text-[#667085]" />
                <span className="flex-1">アプリを開く</span>
                <ChevronRight size={16} className="shrink-0 text-[#98A2B3]" />
              </Link>
            )}
            <Link
              to="/app/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#344054] outline-none transition-colors hover:bg-[#F8FAFC] focus-visible:ring-2 focus-visible:ring-[#3157E5] focus-visible:ring-inset"
              role="menuitem"
            >
              <User size={17} className="shrink-0 text-[#667085]" />
              <span className="flex-1">アカウント</span>
              <ChevronRight size={16} className="shrink-0 text-[#98A2B3]" />
            </Link>
          </div>

          <div className="border-t border-[#EEF0F4] px-2 py-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full appearance-none items-center gap-3 rounded-lg border-0 px-3 py-2.5 text-left text-sm font-medium text-[#B42318] outline-none transition-colors hover:bg-[#FEF3F2] focus-visible:ring-2 focus-visible:ring-[#B42318] focus-visible:ring-inset"
              role="menuitem"
            >
              <LogOut size={17} className="shrink-0" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
