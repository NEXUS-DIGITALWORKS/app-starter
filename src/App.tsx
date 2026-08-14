import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import './App.css';

// ページ単位でJSを分割し、初回アクセス時に他ページ分のコードまで読み込まれないようにする。
const ToolsHome = lazy(() => import('./pages/ToolsHome'));
const DiagnosisIntro = lazy(() => import('./pages/DiagnosisIntro'));
const DiagnosisFlow = lazy(() => import('./pages/DiagnosisFlow'));
const TechStackSelector = lazy(() => import('./pages/TechStackSelector'));
const TechGuide = lazy(() => import('./pages/TechGuide'));
const PatternGuide = lazy(() => import('./pages/PatternGuide'));
const TechSelectorReport = lazy(() => import('./pages/TechSelectorReport'));
const RiskCheck = lazy(() => import('./pages/RiskCheck'));
const AppHome = lazy(() => import('./pages/AppHome'));
const AppHistory = lazy(() => import('./pages/AppHistory'));
const Account = lazy(() => import('./pages/Account'));

// 旧URL（/tools, /diagnosis, /tech-selector, /tech-guide）のブックマーク・共有リンクの
// 互換性維持のため、クエリ・ハッシュを保持したままリダイレクトする。
function RedirectTo({ path }: { path: string }) {
  const location = useLocation();
  return <Navigate to={`${path}${location.search}${location.hash}`} replace />;
}

function PageFallback() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-[#667085]">読み込み中...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<ToolsHome />} />

        <Route path="/app" element={<AppLayout />}>
          <Route index element={<AppHome />} />
          <Route path="history" element={<AppHistory />} />
          <Route path="account" element={<Account />} />
        </Route>

        <Route path="/tools/diagnosis" element={<DiagnosisIntro />} />
        <Route path="/tools/diagnosis/start" element={<DiagnosisFlow />} />
        <Route path="/tools/tech-selector" element={<TechStackSelector />} />
        <Route path="/tools/tech-selector/report" element={<TechSelectorReport />} />
        <Route path="/tools/tech-guide" element={<TechGuide />} />
        <Route path="/tools/patterns" element={<PatternGuide />} />
        <Route path="/tools/risk-check" element={<RiskCheck />} />

        <Route path="/tools" element={<RedirectTo path="/" />} />
        <Route path="/diagnosis" element={<RedirectTo path="/tools/diagnosis" />} />
        <Route path="/diagnosis/start" element={<RedirectTo path="/tools/diagnosis/start" />} />
        <Route path="/tech-selector" element={<RedirectTo path="/tools/tech-selector" />} />
        <Route path="/tech-selector/report" element={<RedirectTo path="/tools/tech-selector/report" />} />
        <Route path="/tech-guide" element={<RedirectTo path="/tools/tech-guide" />} />
      </Routes>
    </Suspense>
  );
}
