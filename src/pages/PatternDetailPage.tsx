import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import PatternArchitectureDiagram from '../features/tech-stack-selector/components/PatternArchitectureDiagram';
import { getPatternMap } from '../features/tech-stack-selector/data/patterns';
import { getPatternDetails } from '../features/tech-stack-selector/data/patternDetails';
import { buildSelectionForPattern } from '../features/tech-stack-selector/lib/matchEngine';
import { encodeSelectionToParam } from '../features/tech-stack-selector/lib/shareLink';
import logo from '../assets/logo.svg';
import '../App.css';
import '../features/tech-stack-selector/tech-stack-selector.css';
import '../features/tech-stack-selector/pattern-guide.css';

export default function PatternDetailPage() {
  const { patternId } = useParams<{ patternId: string }>();
  const patternMap = useMemo(() => getPatternMap(), []);
  const patternDetails = useMemo(() => getPatternDetails(), []);
  const pattern = patternId ? patternMap[patternId] : undefined;
  const detail = patternId ? patternDetails[patternId] : undefined;
  const selection = useMemo(() => (patternId ? buildSelectionForPattern(patternId) : {}), [patternId]);

  if (!pattern || !detail) {
    return <Navigate to="/tools/patterns" replace />;
  }

  const tryUrl = `/tools/tech-selector?s=${encodeSelectionToParam(selection)}`;

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

      <main className="w-full max-w-[1680px] px-4 pb-16 pt-6 sm:px-6">
        <Link
          to="/tools/patterns"
          className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          パターンガイドに戻る
        </Link>

        <div className="mb-4">
          <span className="pg-pattern-code">{pattern.id}</span>
          <h1 className="mt-1.5 text-[28px] font-bold leading-tight text-foreground">{pattern.name} 構成図</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{detail.shortSummary}</p>
        </div>

        <PatternArchitectureDiagram
          selection={selection}
          purpose={detail.whatYouCanBuild}
          merits={detail.strengths}
          notes={detail.expectedFeatures}
          cautions={detail.unsuitableCases}
          ctaLabel="この構成の技術要素を見る"
          ctaHref={tryUrl}
        />
      </main>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
