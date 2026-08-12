import { useEffect, useState } from 'react';
import type { TransitionEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthWidget from '../features/auth/AuthWidget';
import logo from '../assets/logo.svg';
import '../App.css';
import './Home.css';

const HERO_IMAGE_SRC = '/hero-illustration.webp';

type CaseCategory = '業務効率化' | 'EC・販売' | '顧客管理' | 'AI活用' | '社内DX';

const CATEGORIES: Array<'すべて' | CaseCategory> = ['すべて', '業務効率化', 'EC・販売', '顧客管理', 'AI活用', '社内DX'];

type CaseStudy = {
  id: string;
  category: CaseCategory;
  title: string;
  headline: string[];
  description: string;
  highlights: { title: string; desc: string }[];
  impact: string;
  gradient: string;
};

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'inventory',
    category: '業務効率化',
    title: '在庫・発注管理',
    headline: ['在庫確認から発注までを、', 'ひとつの画面に。'],
    description:
      'Excelやメールで行っていた在庫管理を、リアルタイムで共有できるシステムへ。業務のムダとミスを大幅に削減します。',
    highlights: [
      { title: '在庫状況の可視化', desc: 'リアルタイムで在庫数を把握' },
      { title: '発注アラート', desc: '在庫不足を自動でお知らせ' },
      { title: 'スマートフォン対応', desc: '外出先からも操作が可能' },
    ],
    impact: '毎日60分かかっていた確認作業を、約10分に短縮',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
  },
  {
    id: 'ec',
    category: 'EC・販売',
    title: 'ECサイト構築',
    headline: ['実店舗の販売力を、', 'オンラインでも。'],
    description:
      '電話・FAXで受けていた注文をオンライン化。決済や在庫連携までワンストップで管理できる仕組みに変えます。',
    highlights: [
      { title: '商品管理・カート機能', desc: '決済まで一気通貫で対応' },
      { title: '複数決済手段に対応', desc: 'クレカ・後払い・コンビニ払い' },
      { title: '在庫連携で売り越し防止', desc: '実店舗の在庫と自動同期' },
    ],
    impact: '電話・FAXでの受注対応を、月120時間から30時間に削減',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
  },
  {
    id: 'crm',
    category: '顧客管理',
    title: '顧客管理CRM',
    headline: ['商談も顧客情報も、', 'ひとつにまとめて。'],
    description: '案件の進捗が属人化していた状態から、チーム全員が同じ情報を見て動ける仕組みへ変えます。',
    highlights: [
      { title: '顧客情報の一元管理', desc: '対応履歴も自動で蓄積' },
      { title: '商談ステータスの可視化', desc: '案件の抜け漏れを防止' },
      { title: 'チームでの情報共有', desc: '引き継ぎもスムーズに' },
    ],
    impact: '引き継ぎ資料の作成時間を、週5時間からほぼゼロに',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
  },
  {
    id: 'ai-chat',
    category: 'AI活用',
    title: 'AIチャットサポート',
    headline: ['よくある質問対応を、', 'AIにおまかせ。'],
    description: '同じ質問への回答に追われていたサポート業務をAIが一次対応。人は複雑な相談だけに集中できます。',
    highlights: [
      { title: 'AIによる自動一次対応', desc: '24時間365日対応可能' },
      { title: 'FAQ・マニュアル連携', desc: '回答精度を継続的に改善' },
      { title: '有人対応への引き継ぎ', desc: '複雑な相談だけ人が対応' },
    ],
    impact: '問い合わせ対応時間を、1件あたり8分から2分に短縮',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
  },
  {
    id: 'portal',
    category: '社内DX',
    title: '社内申請ポータル',
    headline: ['紙とハンコの申請を、', 'オンラインに。'],
    description: '経費精算や休暇申請などの社内手続きをオンライン化。承認状況もリアルタイムに確認できます。',
    highlights: [
      { title: '申請書のオンライン化', desc: 'スマホからも申請が可能' },
      { title: '承認フローの自動化', desc: '承認状況を可視化' },
      { title: '過去申請の検索・集計', desc: '監査対応も効率化' },
    ],
    impact: '申請から承認までの日数を、平均5日から1日に短縮',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)',
  },
];

function CaseCardContent({ study, badgeNumber }: { study: CaseStudy; badgeNumber: number }) {
  return (
    <div className="case-card">
      <div className="case-card-banner" style={{ background: study.gradient }}>
        <span className="case-card-banner-title">{study.title}</span>
      </div>

      <div className="case-card-copy">
        <div className="case-badges">
          <span className="case-badge-num">CASE {String(badgeNumber).padStart(2, '0')}</span>
          <span className="case-badge-cat">{study.category}</span>
        </div>
        <h3>
          {study.headline.map((line, i) => (
            <span key={i}>
              {line}
              {i < study.headline.length - 1 && <br />}
            </span>
          ))}
        </h3>
        <p className="case-desc">{study.description}</p>

        <div className="case-highlights">
          {study.highlights.map((h) => (
            <div className="case-highlight" key={h.title}>
              <strong>{h.title}</strong>
              <span>{h.desc}</span>
            </div>
          ))}
        </div>

        <div className="case-impact">
          <span className="case-impact-label">導入後の変化（想定）</span>
          <p>{study.impact}</p>
        </div>

        <Link className="case-detail-link" to="/tools/diagnosis">
          この実例を見る →
        </Link>
      </div>
    </div>
  );
}

const PEEK_BREAKPOINT = '(min-width: 761px)';

function useIsPeekMode() {
  const [isPeekMode, setIsPeekMode] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PEEK_BREAKPOINT).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(PEEK_BREAKPOINT);
    const handler = () => setIsPeekMode(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isPeekMode;
}

export default function Home() {
  const [heroImageOk, setHeroImageOk] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'すべて' | CaseCategory>('すべて');
  const [caseIndex, setCaseIndex] = useState(0);
  // visualIndex is the position within the extended (cloned) track used for the
  // infinite-loop slide animation; it stays one step ahead/behind caseIndex while
  // wrapping past either end, then snaps back without a transition.
  const [visualIndex, setVisualIndex] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const isPeekMode = useIsPeekMode();

  const visibleCases =
    activeCategory === 'すべて' ? CASE_STUDIES : CASE_STUDIES.filter((c) => c.category === activeCategory);
  const length = visibleCases.length;
  const current = visibleCases[Math.min(caseIndex, Math.max(0, length - 1))];

  const trackItems = length > 1 ? [visibleCases[length - 1], ...visibleCases, visibleCases[0]] : visibleCases;
  const badgeForPosition = (pos: number) => (((pos - 1) % length) + length) % length;

  useEffect(() => {
    if (!withTransition) {
      const raf = requestAnimationFrame(() => setWithTransition(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [withTransition]);

  const selectCategory = (c: 'すべて' | CaseCategory) => {
    setActiveCategory(c);
    setCaseIndex(0);
    setVisualIndex(1);
    setWithTransition(false);
  };

  const goPrev = () => {
    if (length <= 1) return;
    setWithTransition(true);
    if (caseIndex === 0) {
      setCaseIndex(length - 1);
      setVisualIndex(0);
    } else {
      setCaseIndex((i) => i - 1);
      setVisualIndex((v) => v - 1);
    }
  };

  const goNext = () => {
    if (length <= 1) return;
    setWithTransition(true);
    if (caseIndex === length - 1) {
      setCaseIndex(0);
      setVisualIndex(length + 1);
    } else {
      setCaseIndex((i) => i + 1);
      setVisualIndex((v) => v + 1);
    }
  };

  const handleTrackTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    if (visualIndex === length + 1) {
      setWithTransition(false);
      setVisualIndex(1);
    } else if (visualIndex === 0) {
      setWithTransition(false);
      setVisualIndex(length);
    }
  };

  const slideWidth = isPeekMode ? 72 : 100;
  const peek = isPeekMode ? 14 : 0;
  const trackTransform = `translateX(calc(${-(visualIndex * slideWidth)}% + ${peek}%))`;

  return (
    <div className="page home-page">
      <header className="site-header">
        <div className="brand">
          <img src={logo} alt="BizTools" className="brand-logo" />
          <span className="brand-tagline">Build or Buy・技術構成診断</span>
        </div>
        <AuthWidget />
      </header>

      <main className="home-main">
        <section className="hero-band">
          <div className="top-hero">
            <div className="top-hero-copy">
              <h1>
                アイデアを、
                <br />
                最適な技術でカタチに。
              </h1>
              <p>
                アイデアを答えるだけで、あなたに合う技術スタックが見つかる。
                <br />
                そこから作れるものは、ECサイトも業務システムも、どこまでも広がっていきます。
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" to="/tools/diagnosis">
                  診断をはじめる →
                </Link>
                <a className="btn btn-secondary" href="#samples">
                  🔧 作れるものを見る
                </a>
              </div>
              <p className="hero-note">
                💡 まだ作るものが決まっていなくても大丈夫です。
                <br />
                実現したいことから、必要な機能と技術を一緒に整理します。
              </p>
            </div>
            <div className="top-hero-art">
              {heroImageOk ? (
                <img
                  src={HERO_IMAGE_SRC}
                  alt="小さな一歩から可能性がどこまでも広がっていく3Dアイソメトリックイラスト"
                  className="hero-illustration"
                  onError={() => setHeroImageOk(false)}
                />
              ) : (
                <div className="hero-illustration-placeholder">
                  <p>
                    ここに画像を配置してください
                    <br />
                    <code>public/hero-illustration.webp</code>
                  </p>
                  <p>推奨サイズ: 1200×1200px（透過WebP）</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="samples" id="samples">
          <div className="samples-head">
            <div className="samples-head-text">
              <h2>あなたのアイデアは、こんな仕組みに変わります。</h2>
              <p>業務の悩みや実現したいことから、最適な技術と機能を組み合わせた開発例をご紹介します。</p>
            </div>
            <div className="category-tabs">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`category-tab${activeCategory === c ? ' is-active' : ''}`}
                  onClick={() => selectCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {current ? (
            <div className="case-carousel">
              {length > 1 && (
                <button type="button" className="case-nav case-nav-prev" onClick={goPrev} aria-label="前の事例">
                  ‹
                </button>
              )}

              <div className="case-carousel-viewport">
                <div
                  className={`case-track${withTransition ? '' : ' no-transition'}`}
                  style={{ transform: length > 1 ? trackTransform : undefined }}
                  onTransitionEnd={handleTrackTransitionEnd}
                >
                  {trackItems.map((study, pos) => (
                    <div
                      className={`case-slide${length <= 1 || pos === visualIndex ? ' is-active' : ''}`}
                      key={`${study.id}-${pos}`}
                    >
                      <CaseCardContent study={study} badgeNumber={badgeForPosition(pos) + 1} />
                    </div>
                  ))}
                </div>
              </div>

              {length > 1 && (
                <button type="button" className="case-nav case-nav-next" onClick={goNext} aria-label="次の事例">
                  ›
                </button>
              )}
            </div>
          ) : (
            <div className="case-empty">このカテゴリの事例は準備中です。</div>
          )}

          <div className="samples-cta">
            <Link className="samples-cta-btn" to="/tools/diagnosis">
              すべての事例を見る →
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">© 2026 Build or Buy診断</footer>
    </div>
  );
}
