import { Link, useLocation } from 'react-router-dom';

export const TOOLS_NAV_ITEMS = [
  { id: 'diagnosis', label: '診断', to: '/tools/diagnosis', match: '/tools/diagnosis' },
  { id: 'tech-selector', label: '技術要素セレクター', to: '/tools/tech-selector', match: '/tools/tech-selector' },
  { id: 'tech-guide', label: 'テックガイド', to: '/tools/tech-guide', match: '/tools/tech-guide' },
  { id: 'patterns', label: 'パターンガイド', to: '/tools/patterns', match: '/tools/patterns' },
  { id: 'risk-check', label: 'リスクチェック55', to: '/tools/risk-check', match: '/tools/risk-check' },
] as const;

export function isToolsNavItemActive(pathname: string, match: string): boolean {
  return pathname === match || pathname.startsWith(`${match}/`);
}

export default function ToolsNav() {
  const location = useLocation();

  return (
    <nav className="tools-nav" aria-label="ツールナビゲーション">
      {TOOLS_NAV_ITEMS.map((item) => {
        const isActive = isToolsNavItemActive(location.pathname, item.match);
        return (
          <Link
            key={item.id}
            to={item.to}
            className="tools-nav-link"
            aria-current={isActive ? 'page' : undefined}
            data-active={isActive || undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
