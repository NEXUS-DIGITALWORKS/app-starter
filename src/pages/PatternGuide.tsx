import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import SelectedTechnologyList from '../features/tech-stack-selector/components/SelectedTechnologyList';
import { PATTERNS, PATTERN_MAP } from '../features/tech-stack-selector/data/patterns';
import { PATTERN_DETAILS, type PatternDetail } from '../features/tech-stack-selector/data/patternDetails';
import { buildSelectionForPattern, countSelectedElements } from '../features/tech-stack-selector/lib/matchEngine';
import { encodeSelectionToParam } from '../features/tech-stack-selector/lib/shareLink';
import type { Pattern } from '../features/tech-stack-selector/types';
import logo from '../assets/logo.png';
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

function groupPatterns(): PatternGroup[] {
  const order: string[] = [];
  const groups = new Map<string, Pattern[]>();
  for (const pattern of PATTERNS) {
    const prefix = pattern.id.split('-')[0];
    if (!groups.has(prefix)) {
      groups.set(prefix, []);
      order.push(prefix);
    }
    groups.get(prefix)!.push(pattern);
  }
  return order.map((prefix) => ({ prefix, label: CATEGORY_LABELS[prefix] ?? prefix, patterns: groups.get(prefix)! }));
}

function PatternDetailBody({ pattern, detail }: { pattern: Pattern; detail: PatternDetail }) {
  const tryUrl = `/tools/tech-selector?s=${encodeSelectionToParam(buildSelectionForPattern(pattern.id))}`;

  return (
    <div className="pg-body">
      <p className="pg-body-meta">
        {detail.primaryUse} ・ {detail.architectureType} ・ {detail.primaryLanguage}
      </p>
      <p className="pg-body-desc">{detail.whatYouCanBuild}</p>

      <div className="pg-body-grid">
        <div>
          <h4>強み</h4>
          <ul className="pg-list">
            {detail.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>想定される代表機能</h4>
          <div className="pg-chips">
            {detail.expectedFeatures.map((item) => (
              <span className="pg-chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pg-body-grid">
        <div>
          <h4 className="pg-heading-suitable">向いているケース</h4>
          <ul className="pg-list pg-list-suitable">
            {detail.suitableCases.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="pg-heading-unsuitable">別構成も検討したいケース</h4>
          <ul className="pg-list pg-list-unsuitable">
            {detail.unsuitableCases.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <Link className="pg-try-link" to={tryUrl}>
        <CheckCircle2 size={13} />
        この構成の技術要素を見る
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}

export default function PatternGuide() {
  const groups = useMemo(groupPatterns, []);
  const [openPatternId, setOpenPatternId] = useState<string | null>(null);

  const activePattern = openPatternId ? PATTERN_MAP[openPatternId] : null;
  const activeSelection = useMemo(
    () => (openPatternId ? buildSelectionForPattern(openPatternId) : {}),
    [openPatternId],
  );
  const activeCount = useMemo(() => countSelectedElements(activeSelection), [activeSelection]);

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
          技術要素セレクターが判定する、全{PATTERNS.length}件の構成パターン（WEB / MOB / DESK / BIZ / AI / INF）を一覧で解説します。
          <br />
          パターンを開くと、右側にそのパターンで使う技術要素が表示されます。
          <Link to="/tools/tech-selector" className="tss-inline-link">
            技術要素セレクター
            <ArrowRight size={13} />
          </Link>
          で実際に組み合わせを選ぶこともできます。
        </p>
      </main>

      <div className="pg-layout">
        <div className="pg-main">
          <nav className="pg-category-nav" aria-label="カテゴリ目次">
            {groups.map((group) => (
              <a key={group.prefix} href={`#pattern-group-${group.prefix}`}>
                {group.label}
              </a>
            ))}
          </nav>

          <Accordion
            type="single"
            collapsible
            className="pg-accordion-root"
            value={openPatternId ?? ''}
            onValueChange={(value) => setOpenPatternId(value || null)}
          >
            {groups.map((group) => (
              <section key={group.prefix} className="pg-group" id={`pattern-group-${group.prefix}`}>
                <h2 className="pg-group-title">{group.label}</h2>

                <div className="pg-item-list">
                  {group.patterns.map((pattern) => {
                    const detail = PATTERN_DETAILS[pattern.id];
                    if (!detail) return null;

                    return (
                      <AccordionItem key={pattern.id} value={pattern.id} className="pg-item border-b-0">
                        <AccordionTrigger className="pg-trigger">
                          <span className="pg-trigger-body">
                            <span className="pg-trigger-head">
                              <span className="pg-pattern-code">{pattern.id}</span>
                              <span className="pg-pattern-name">{pattern.name}</span>
                            </span>
                            <span className="pg-trigger-summary">{detail.shortSummary}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pg-content">
                          <PatternDetailBody pattern={pattern} detail={detail} />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </div>
              </section>
            ))}
          </Accordion>
        </div>

        <aside className="pg-sidebar">
          {activePattern ? (
            <>
              <div className="pg-sidebar-head">
                <span className="pg-pattern-code">{activePattern.id}</span>
                <h3>{activePattern.name}</h3>
              </div>
              <SelectedTechnologyList selection={activeSelection} selectedCount={activeCount} />
            </>
          ) : (
            <div className="pg-sidebar-empty">パターンを開くと、対応する技術要素がここに表示されます。</div>
          )}
        </aside>
      </div>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
