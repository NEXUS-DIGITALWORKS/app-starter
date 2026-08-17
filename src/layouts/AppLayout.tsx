import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronLeft, FileText, Home, Menu, Wrench, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import RequireAuth from '../features/auth/RequireAuth';
import AccountMenu from '../features/auth/AccountMenu';
import logo from '../assets/logo.png';

const NAV_ITEMS = [{ to: '/app', label: 'ホーム', icon: Home, end: true }];

const HISTORY_ITEM = { to: '/app/history', label: '保存済み一覧', icon: FileText, end: false };

function AppLayoutContent() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const navContent = (onNavigate?: () => void) => (
    <>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#EEF0FE] text-[#3157E5]'
                  : 'text-[#475467] hover:bg-[#F8FAFC] hover:text-[#111827]',
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {(!collapsed || onNavigate) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-[#EEF0F4] px-3 py-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#475467] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827]"
        >
          <Wrench size={18} className="shrink-0" />
          {(!collapsed || onNavigate) && <span>Tech診断</span>}
        </Link>
        <NavLink
          to={HISTORY_ITEM.to}
          end={HISTORY_ITEM.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#EEF0FE] text-[#3157E5]'
                : 'text-[#475467] hover:bg-[#F8FAFC] hover:text-[#111827]',
            )
          }
        >
          <HISTORY_ITEM.icon size={18} className="shrink-0" />
          {(!collapsed || onNavigate) && <span>{HISTORY_ITEM.label}</span>}
        </NavLink>
      </div>
    </>
  );

  return (
    <div className="flex h-screen flex-col bg-[#F8FAFC]">
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#D0D5DD] bg-white px-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="-ml-1.5 flex h-11 w-11 shrink-0 appearance-none items-center justify-center rounded-lg border-0 bg-transparent text-[#475467] outline-none transition-colors hover:bg-[#F8FAFC] focus-visible:ring-2 focus-visible:ring-[#3157E5] md:hidden"
            aria-label="メニューを開く"
          >
            <Menu size={22} />
          </button>
          <Link to="/app" className="flex min-w-0 items-center gap-2">
            <img src={logo} alt="BizTools" className="h-8 w-auto shrink-0" />
          </Link>
        </div>
        <AccountMenu />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            'relative hidden shrink-0 flex-col border-r border-[#E5E7EB] bg-[#FBFBFC] transition-[width] duration-200 md:flex',
            collapsed ? 'w-[72px]' : 'w-[240px]',
          )}
        >
          {navContent()}

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 appearance-none items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] shadow-[0_2px_6px_rgba(16,24,40,0.12)] outline-none transition-all duration-200 hover:border-[#3157E5] hover:text-[#3157E5] focus-visible:ring-2 focus-visible:ring-[#3157E5]"
            aria-label={collapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'}
          >
            <ChevronLeft size={14} className={cn('transition-transform duration-200', collapsed && 'rotate-180')} />
          </button>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="メニューを閉じる"
              onClick={() => setMobileNavOpen(false)}
              className="absolute inset-0 appearance-none border-0 bg-black/40 p-0"
            />
            <aside className="absolute inset-y-0 left-0 flex w-[min(280px,84vw)] flex-col bg-[#FBFBFC] shadow-[0_0_24px_rgba(16,24,40,0.2)]">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4">
                <img src={logo} alt="BizTools" className="h-8 w-auto shrink-0" />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex h-11 w-11 shrink-0 appearance-none items-center justify-center rounded-lg border-0 bg-transparent text-[#475467] outline-none transition-colors hover:bg-[#F8FAFC] focus-visible:ring-2 focus-visible:ring-[#3157E5]"
                  aria-label="メニューを閉じる"
                >
                  <X size={20} />
                </button>
              </div>
              {navContent(() => setMobileNavOpen(false))}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <RequireAuth>
      <AppLayoutContent />
    </RequireAuth>
  );
}
