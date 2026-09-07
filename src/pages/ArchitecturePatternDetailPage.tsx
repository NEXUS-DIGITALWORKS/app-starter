import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import ArchitecturePatternBody from '../features/build-or-buy/components/ArchitecturePatternBody';
import { getArchitecturePattern } from '../features/build-or-buy/data/architecturePatterns';
import { getStackProfiles } from '../features/build-or-buy/data/stackProfiles';
import logo from '../assets/logo.svg';
import '../App.css';
import '../features/tech-stack-selector/tech-stack-selector.css';
import '../features/tech-stack-selector/pattern-guide.css';

export default function ArchitecturePatternDetailPage() {
  const { patternId } = useParams<{ patternId: string }>();
  const pattern = useMemo(() => (patternId ? getArchitecturePattern(patternId) : undefined), [patternId]);
  const profiles = useMemo(
    () => (patternId ? getStackProfiles().filter((p) => p.patternId === patternId) : []),
    [patternId],
  );

  if (!pattern) {
    return <Navigate to="/tools/architecture-patterns" replace />;
  }

  return (
    <div className="page tools-scope">
      <header className="site-header">
        <Link to="/" className="brand">
          <img src={logo} alt="BizTools" className="brand-logo" />
          <span className="brand-tagline">アーキテクチャパターン</span>
        </Link>
        <ToolsNav />
        <AuthWidget />
      </header>

      <main className="w-full max-w-[1680px] px-4 pb-16 pt-6 sm:px-6">
        <Link
          to="/tools/architecture-patterns"
          className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          アーキテクチャパターン一覧に戻る
        </Link>

        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="pg-pattern-code">{pattern.id}</span>
            <h1 className="mt-1.5 text-[28px] font-bold leading-tight text-foreground">{pattern.name} 構成図</h1>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{pattern.description}</p>
          </div>
          <Link
            to="/tools/diagnosis"
            className="flex shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[12.5px] font-bold text-primary hover:bg-primary/10"
          >
            <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
            Build or Buy診断で実際の適性を判定する
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <ArchitecturePatternBody pattern={pattern} profiles={profiles} />
      </main>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
