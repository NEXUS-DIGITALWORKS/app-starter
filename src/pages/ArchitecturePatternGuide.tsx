import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import { getArchitecturePatterns } from '../features/build-or-buy/data/architecturePatterns';
import logo from '../assets/logo.png';
import '../App.css';
import '../features/tech-stack-selector/tech-stack-selector.css';
import '../features/tech-stack-selector/pattern-guide.css';

export default function ArchitecturePatternGuide() {
  const patterns = useMemo(() => getArchitecturePatterns(), []);

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

      <main className="tss-hero">
        <span className="tss-eyebrow">リファレンス</span>
        <h1>アーキテクチャパターン</h1>
        <p>
          Build or Buy診断が判定に使う、全{patterns.length}件のアーキテクチャパターン（P1〜P9）を一覧で解説します。
          <br />
          パターンを選ぶと、構成イメージ（レイヤー別技術構成）を含む詳細ページが開きます。
          <Link to="/tools/diagnosis" className="tss-inline-link">
            Build or Buy診断
            <ArrowRight size={13} />
          </Link>
          で実際にどのパターンが向いているか判定することもできます。
        </p>
      </main>

      <div className="mx-auto w-full max-w-[820px] px-4 pb-12 sm:px-8">
        <div className="pg-item-list">
          {patterns.map((pattern) => (
            <Link key={pattern.id} to={`/tools/architecture-patterns/${pattern.id}`} className="pg-item pg-link-row">
              <span className="pg-trigger-body">
                <span className="pg-trigger-head">
                  <span className="pg-pattern-code">{pattern.id}</span>
                  <span className="pg-pattern-name">{pattern.name}</span>
                </span>
                <span className="pg-trigger-summary">{pattern.description}</span>
              </span>
              <ChevronRight className="pg-link-row-chevron" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
