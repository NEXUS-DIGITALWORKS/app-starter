import { Link } from 'react-router-dom';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import logo from '../assets/logo.png';
import '../App.css';
import './DiagnosisIntro.css';

type Step = {
  number: string;
  title: string;
  desc: string;
  gradient: string;
};

const STEPS: Step[] = [
  {
    number: '01',
    title: '質問に回答',
    desc: '作りたいものや利用範囲、既存環境、運用体制など、業務要件に答えます。',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
  },
  {
    number: '02',
    title: 'Build or Buy診断',
    desc: '自作すべきか、既存SaaSで足りるか、組み合わせるべきかをルールベースで判定します。',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
  },
  {
    number: '03',
    title: '結果を確認',
    desc: '推奨構成・技術スタック・選定理由・リスクをレポートとして表示します。',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
  },
];

export default function DiagnosisIntro() {
  return (
    <div className="page diagnosis-page tools-scope">
      <header className="site-header">
        <Link to="/" className="brand">
          <img src={logo} alt="BizTools" className="brand-logo" />
          <span className="brand-tagline">Build or Buy・技術構成診断</span>
        </Link>
        <ToolsNav />
        <AuthWidget />
      </header>

      <main className="diagnosis-main">
        <section className="diagnosis-hero-band">
          <div className="diagnosis-hero">
            <div className="diagnosis-hero-copy">
              <Link to="/" className="hero-back">
                ← ツール一覧に戻る
              </Link>
              <span className="diagnosis-eyebrow">無料診断</span>
              <h1>
                作るべきか、買うべきか。
                <br />
                <span className="accent">技術構成まで、迷わずシンプルに。</span>
              </h1>
              <p>
                業務要件にいくつか答えるだけで、自作すべきか既存SaaSで足りるかを判定し、最適な技術構成まで診断します。
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" to="/tools/diagnosis/start">
                  診断をはじめる →
                </Link>
              </div>
            </div>

            <div className="diagnosis-hero-flow" aria-hidden="true">
              {STEPS.map((step, i) => (
                <div className="flow-item" key={step.number}>
                  <span className="flow-node" style={{ background: step.gradient }}>
                    {step.number}
                  </span>
                  <span className="flow-label">{step.title}</span>
                  {i < STEPS.length - 1 && <span className="flow-connector" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="diagnosis-content">
          <div className="step-grid">
            {STEPS.map((step) => (
              <div className="step-card" key={step.number}>
                <div className="step-card-banner" style={{ background: step.gradient }}>
                  <span className="step-card-num">{step.number}</span>
                </div>
                <div className="step-card-body">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
