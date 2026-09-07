import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Sparkles } from 'lucide-react';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import RiskCategorySection from '../features/risk-check/components/RiskCategorySection';
import RiskControls from '../features/risk-check/components/RiskControls';
import RiskExportBar from '../features/risk-check/components/RiskExportBar';
import RiskStatCards from '../features/risk-check/components/RiskStatCards';
import { RISK_CATEGORIES, RISK_ITEMS } from '../features/risk-check/data/riskItems';
import { useRiskStatuses } from '../features/risk-check/lib/useRiskStatuses';
import type { RiskCategory, RiskLevel } from '../features/risk-check/types';
import logo from '../assets/logo.png';
import '../App.css';
import '../features/risk-check/risk-check.css';

export default function RiskCheck() {
  const { getStatus, setStatus, resetAll } = useRiskStatuses();
  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<RiskCategory>>(new Set());
  const [activeLevels, setActiveLevels] = useState<Set<RiskLevel>>(new Set());
  const [interviewMode, setInterviewMode] = useState(false);

  const toggleCategory = (category: RiskCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const toggleLevel = (level: RiskLevel) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const clearFilters = () => {
    setActiveCategories(new Set());
    setActiveLevels(new Set());
    setSearch('');
  };

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return RISK_ITEMS.filter((item) => {
      if (interviewMode && item.level !== '手動') return false;
      if (activeCategories.size && !activeCategories.has(item.category)) return false;
      if (!interviewMode && activeLevels.size && !activeLevels.has(item.level)) return false;
      if (keyword) {
        const haystack = `${item.name} ${item.tool} ${item.logic} ${item.description} ${item.category} ${item.level}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [search, activeCategories, activeLevels, interviewMode]);

  const groupedCategories = RISK_CATEGORIES.map((category) => ({
    category,
    items: filteredItems.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="page rc-page tools-scope">
      <header className="site-header">
        <Link to="/" className="brand">
          <img src={logo} alt="BizTools" className="brand-logo" />
          <span className="brand-tagline">リスクチェック55</span>
        </Link>
        <ToolsNav />
        <AuthWidget />
      </header>

      <main className="rc-main">
        <div className="rc-hero">
          <span className="rc-eyebrow">SYSTEM RISK AUDIT ・ 55 CHECKS</span>
          <h1>システム構築の55のリスクを、8分類でチェックする。</h1>
          <p>
            外部依存・セキュリティ・データ・AI開発品質・インフラ・コスト・運用・事業継続の8分類、計55項目でリスクを洗い出すチェックシートです。
            各項目は「完全自動」「AI半自動」「手動」いずれかの判定方式に整理されており、状態を記録しながら適合率を確認できます。
          </p>
        </div>

        <RiskStatCards getStatus={getStatus} />

        <RiskControls
          search={search}
          onSearchChange={setSearch}
          activeCategories={activeCategories}
          onToggleCategory={toggleCategory}
          activeLevels={activeLevels}
          onToggleLevel={toggleLevel}
          interviewMode={interviewMode}
          onToggleInterview={() => setInterviewMode((v) => !v)}
          onClearFilters={clearFilters}
        />

        <div className="rc-result-count">
          <b>{filteredItems.length}</b> / {RISK_ITEMS.length} 項目を表示中
        </div>

        {groupedCategories.length ? (
          groupedCategories.map(({ category, items }) => (
            <RiskCategorySection
              category={category}
              items={items}
              getStatus={getStatus}
              onChangeStatus={setStatus}
              key={category}
            />
          ))
        ) : (
          <div className="rc-empty-state">条件に一致するリスク項目がありません。検索語やフィルターを見直してください。</div>
        )}

        <section className="rc-next-tools">
          <h2>他のツールも見てみる</h2>
          <div className="rc-next-tools-grid">
            <Link className="rc-next-tool-card" to="/tools/diagnosis">
              <Sparkles size={18} aria-hidden="true" />
              <span>
                <strong>Build or Buy診断</strong>
                <small>自作すべきか、既存SaaSで足りるかを判定します</small>
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="rc-next-tool-card" to="/tools/tech-selector">
              <Layers size={18} aria-hidden="true" />
              <span>
                <strong>技術要素セレクター</strong>
                <small>使いたい技術から、最適な構成パターンを探します</small>
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <RiskExportBar getStatus={getStatus} onReset={resetAll} />
      </main>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
