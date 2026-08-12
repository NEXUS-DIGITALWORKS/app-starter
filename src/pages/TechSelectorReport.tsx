import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CircleAlert } from 'lucide-react';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import TechPatternReportHeader from '../features/tech-stack-selector/components/TechPatternReportHeader';
import PatternMatchSummary from '../features/tech-stack-selector/components/PatternMatchSummary';
import PatternOverview from '../features/tech-stack-selector/components/PatternOverview';
import PatternStrengths from '../features/tech-stack-selector/components/PatternStrengths';
import ExpectedFeatures from '../features/tech-stack-selector/components/ExpectedFeatures';
import SuitabilityComparison from '../features/tech-stack-selector/components/SuitabilityComparison';
import SelectedTechnologyList from '../features/tech-stack-selector/components/SelectedTechnologyList';
import ReportNextActions from '../features/tech-stack-selector/components/ReportNextActions';
import { PATTERN_DETAILS } from '../features/tech-stack-selector/data/patternDetails';
import { saveTechSelection } from '../features/tech-stack-selector/lib/resultsRepo';
import { computePatternMatches, getSelectedElements } from '../features/tech-stack-selector/lib/matchEngine';
import { encodeSelectionToParam, readSelectionFromLocation } from '../features/tech-stack-selector/lib/shareLink';
import logo from '../assets/logo.svg';
import '../App.css';
import '../features/tech-stack-selector/tech-stack-selector.css';

export default function TechSelectorReport() {
  const { isAuthenticated } = useAuth();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // selection はURLから一度読み取れば以降は不変。保存中/保存済みの状態遷移で
  // 再レンダリングされるたびにデコードやマッチ計算をやり直さないようメモ化する。
  const selection = useMemo(() => readSelectionFromLocation(), []);
  const selectedElements = useMemo(() => getSelectedElements(selection), [selection]);
  const perfectMatches = useMemo(
    () => computePatternMatches(selection).filter((m) => m.isPerfectMatch),
    [selection],
  );
  const backToSelectorUrl = useMemo(
    () => `/tools/tech-selector?s=${encodeSelectionToParam(selection)}`,
    [selection],
  );

  const supabaseConfigured = isSupabaseConfigured();
  const saveDisabledReason = !supabaseConfigured
    ? 'この環境では保存機能が未設定です（管理者にお問い合わせください）'
    : !isAuthenticated
      ? 'ログインすると選択内容を保存できます'
      : selectedElements.length === 0
        ? '技術要素を1つ以上選択してください'
        : null;

  const handleSave = async () => {
    setSaveState('saving');
    try {
      await saveTechSelection(selection);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  return (
    <div className="page tools-scope">
      <header className="site-header">
        <Link to="/" className="brand">
          <img src={logo} alt="BizTools" className="brand-logo" />
          <span className="brand-tagline">構成パターンレポート</span>
        </Link>
        <ToolsNav />
        <AuthWidget />
      </header>

      <nav aria-label="パンくずリスト" className="tools-breadcrumb">
        <Link to="/">ツール一覧</Link>
        <ChevronRight size={12} aria-hidden="true" className="tools-breadcrumb-sep" />
        <Link to={backToSelectorUrl}>技術要素セレクター</Link>
        <ChevronRight size={12} aria-hidden="true" className="tools-breadcrumb-sep" />
        <span className="tools-breadcrumb-current">構成レポート</span>
      </nav>

      <main className="tss-hero">
        <TechPatternReportHeader backToSelectorUrl={backToSelectorUrl} />
      </main>

      <div className="mx-auto w-full max-w-7xl flex-1 px-6 pb-8 pt-6 lg:px-10 xl:pb-10">
        {perfectMatches.length === 0 ? (
          <Alert>
            <CircleAlert className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              完全に一致する構成パターンがありません。技術要素セレクターで技術要素を選び直してください。
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_340px] xl:items-start">
            <div className="flex min-w-0 flex-col gap-8">
              {perfectMatches.map((m, index) => {
                const detail = PATTERN_DETAILS[m.pattern.id];
                if (!detail) return null;
                const isLast = index === perfectMatches.length - 1;
                return (
                  <article key={m.pattern.id} className="flex flex-col gap-8" aria-labelledby={`pattern-${m.pattern.id}-heading`}>
                    {index > 0 && <Separator />}

                    <PatternMatchSummary
                      patternId={m.pattern.id}
                      patternName={m.pattern.name}
                      detail={detail}
                      selectedCount={selectedElements.length}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
                      <PatternOverview detail={detail} />
                      <PatternStrengths detail={detail} />
                    </div>

                    <ExpectedFeatures features={detail.expectedFeatures} />

                    <SuitabilityComparison suitableCases={detail.suitableCases} unsuitableCases={detail.unsuitableCases} />

                    {isLast && (
                      <ReportNextActions
                        backToSelectorUrl={backToSelectorUrl}
                        saveState={saveState}
                        saveDisabledReason={saveDisabledReason}
                        onSave={handleSave}
                      />
                    )}
                  </article>
                );
              })}
            </div>

            <div className="xl:sticky xl:top-24">
              <SelectedTechnologyList selection={selection} selectedCount={selectedElements.length} />
            </div>
          </div>
        )}
      </div>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
