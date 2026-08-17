import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import CategorySection from '../features/tech-stack-selector/components/CategorySection';
import MatchSummaryPanel from '../features/tech-stack-selector/components/MatchSummaryPanel';
import { CATEGORIES } from '../features/tech-stack-selector/data/categories';
import { buildSelectionForPattern } from '../features/tech-stack-selector/lib/matchEngine';
import { readSelectionFromLocation } from '../features/tech-stack-selector/lib/shareLink';
import type { Selection } from '../features/tech-stack-selector/types';
import logo from '../assets/logo.png';
import '../App.css';
import '../features/tech-stack-selector/tech-stack-selector.css';

export default function TechStackSelector() {
  const [selection, setSelection] = useState<Selection>(() => readSelectionFromLocation());

  const handleToggle = (categoryId: string, elementId: string) => {
    setSelection((prev) => {
      const current = prev[categoryId] ?? [];
      const next = current.includes(elementId)
        ? current.filter((id) => id !== elementId)
        : [...current, elementId];
      return { ...prev, [categoryId]: next };
    });
  };

  const handleReset = () => setSelection({});

  const handleApplyPattern = (patternId: string) => setSelection(buildSelectionForPattern(patternId));

  return (
    <div className="page tools-scope">
      <header className="site-header">
        <Link to="/" className="brand">
          <img src={logo} alt="BizTools" className="brand-logo" />
          <span className="brand-tagline">技術要素セレクター</span>
        </Link>
        <ToolsNav />
        <AuthWidget />
      </header>

      <main className="tss-hero">
        <span className="tss-eyebrow">技術要素セレクター</span>
        <h1>使いたい技術を選んで、最適な構成パターンを見つける。</h1>
        <p>
          フロントエンドからホスティングまで10カテゴリの技術要素から気になるものを選ぶと、一致・近似する構成パターンをリアルタイムに表示します。
          <br />
          各要素の詳しい解説は
          <Link to="/tools/tech-guide" className="tss-inline-link">
            技術要素ガイド
            <ArrowRight size={13} />
          </Link>
          で確認できます。
        </p>
      </main>

      <div className="tss-layout">
        <div className="tss-categories">
          {CATEGORIES.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              selectedElementIds={selection[category.id] ?? []}
              onToggle={handleToggle}
            />
          ))}
        </div>

        <MatchSummaryPanel selection={selection} onReset={handleReset} onApplyPattern={handleApplyPattern} />
      </div>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
