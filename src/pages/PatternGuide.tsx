import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import { getPatterns } from '../features/tech-stack-selector/data/patterns';
import { getPatternDetails } from '../features/tech-stack-selector/data/patternDetails';
import type { Pattern } from '../features/tech-stack-selector/types';
import logo from '../assets/logo.svg';
import '../App.css';
import '../features/tech-stack-selector/tech-stack-selector.css';
import '../features/tech-stack-selector/pattern-guide.css';

// パターンidの接頭辞（WEB-01 なら WEB）を大分類として画面をグルーピングする。
const CATEGORY_LABELS: Record<string, string> = {
  WEB: 'Web',
  MOB: 'モバイル',
  DESK: 'デスクトップ',
  BIZ: '業務システム',
  AI: 'AI活用',
  INF: 'インフラ・ホスティング',
};

type PatternGroup = { prefix: string; label: string; patterns: Pattern[] };

function groupPatterns(patterns: Pattern[]): PatternGroup[] {
  const order: string[] = [];
  const groups = new Map<string, Pattern[]>();
  for (const pattern of patterns) {
    const prefix = pattern.id.split('-')[0];
    if (!groups.has(prefix)) {
      groups.set(prefix, []);
      order.push(prefix);
    }
    groups.get(prefix)!.push(pattern);
  }
  return order.map((prefix) => ({ prefix, label: CATEGORY_LABELS[prefix] ?? prefix, patterns: groups.get(prefix)! }));
}

export default function PatternGuide() {
  const patterns = useMemo(() => getPatterns(), []);
  const patternDetails = useMemo(() => getPatternDetails(), []);
  const groups = useMemo(() => groupPatterns(patterns), [patterns]);

  return (
    <div className="page tools-scope">
      <header className="site-header">
        <Link to="/" className="brand">
          <img src={logo} alt="BizTools" className="brand-logo" />
          <span className="brand-tagline">構成パターンガイド</span>
        </Link>
        <ToolsNav />
        <AuthWidget />
      </header>

      <main className="tss-hero">
        <span className="tss-eyebrow">リファレンス</span>
        <h1>構成パターンガイド</h1>
        <p>
          技術要素セレクターが判定する、全{patterns.length}件の構成パターン（WEB / MOB / DESK / BIZ / AI / INF）を一覧で解説します。
          <br />
          パターンを選ぶと、構成イメージ（レイヤー別技術構成）を含む詳細ページが開きます。
          <Link to="/tools/tech-selector" className="tss-inline-link">
            技術要素セレクター
            <ArrowRight size={13} />
          </Link>
          で実際に組み合わせを選ぶこともできます。
        </p>
      </main>

      <div className="mx-auto w-full max-w-[820px] px-4 pb-12 sm:px-8">
        <nav className="pg-category-nav" aria-label="カテゴリ目次">
          {groups.map((group) => (
            <a key={group.prefix} href={`#pattern-group-${group.prefix}`}>
              {group.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-7">
          {groups.map((group) => (
            <section key={group.prefix} className="pg-group" id={`pattern-group-${group.prefix}`}>
              <h2 className="pg-group-title">{group.label}</h2>

              <div className="pg-item-list">
                {group.patterns.map((pattern) => {
                  const detail = patternDetails[pattern.id];
                  if (!detail) return null;

                  return (
                    <Link key={pattern.id} to={`/tools/patterns/${pattern.id}`} className="pg-item pg-link-row">
                      <span className="pg-trigger-body">
                        <span className="pg-trigger-head">
                          <span className="pg-pattern-code">{pattern.id}</span>
                          <span className="pg-pattern-name">{pattern.name}</span>
                        </span>
                        <span className="pg-trigger-summary">{detail.shortSummary}</span>
                      </span>
                      <ChevronRight className="pg-link-row-chevron" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
