import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import { CATEGORIES } from '../features/tech-stack-selector/data/categories';
import { ELEMENT_DETAILS } from '../features/tech-stack-selector/data/elementDetails';
import { ALL_PATTERN_IDS, PATTERN_MAP } from '../features/tech-stack-selector/data/patterns';
import { encodeSelectionToParam } from '../features/tech-stack-selector/lib/shareLink';
import logo from '../assets/logo.png';
import '../App.css';
import '../features/tech-stack-selector/tech-stack-selector.css';
import '../features/tech-stack-selector/tech-guide.css';

export default function TechGuide() {
  return (
    <div className="page tools-scope">
      <header className="site-header">
        <Link to="/" className="brand">
          <img src={logo} alt="BizTools" className="brand-logo" />
          <span className="brand-tagline">技術要素ガイド</span>
        </Link>
        <ToolsNav />
        <AuthWidget />
      </header>

      <main className="tss-hero">
        <span className="tss-eyebrow">リファレンス</span>
        <h1>技術要素ガイド</h1>
        <p>
          技術要素セレクターで扱う、システム開発の主要な技術要素（全{Object.keys(ELEMENT_DETAILS).length}要素）を解説します。
          <br />
          フロントエンド、バックエンド、データベース、認証、AI、ホスティングなど、10カテゴリの技術について、「何ができるか」「どのようなケースに向いているか」「導入前に確認すべきこと」をまとめています。
          <br />
          気になる技術が見つかったら、その技術を選択した状態で
          <Link to="/tools/tech-selector" className="tss-inline-link">
            技術要素セレクター
            <ArrowRight size={13} />
          </Link>
          を開き、対応する構成パターンを確認できます。構成パターンそのものを一覧で見たい場合は
          <Link to="/tools/patterns" className="tss-inline-link">
            構成パターンガイド
            <ArrowRight size={13} />
          </Link>
          をご覧ください。
        </p>
      </main>

      <div className="tg-layout">
        <nav className="tg-toc" aria-label="カテゴリ目次">
          {CATEGORIES.map((category) => (
            <a key={category.id} href={`#guide-${category.id}`}>
              {String(category.order).padStart(2, '0')}. {category.title}
            </a>
          ))}
        </nav>

        <div className="tg-content">
          {CATEGORIES.map((category) => (
            <section key={category.id}>
              <div className="tg-category-head" id={`guide-${category.id}`}>
                <span className="tg-category-num">{String(category.order).padStart(2, '0')}</span>
                <h2>{category.title}</h2>
              </div>

              <div className="tg-element-list">
                {category.elements.map((element) => {
                  const detail = ELEMENT_DETAILS[element.id];
                  const isAllPatterns = element.patternIds.length === ALL_PATTERN_IDS.length;
                  const shareParam = encodeSelectionToParam({ [category.id]: [element.id] });

                  return (
                    <article className="tg-element" id={`guide-element-${element.id}`} key={element.id}>
                      <div className="tg-element-head">
                        <h3>{element.name}</h3>
                        <div className="tg-element-actions">
                          {detail?.url && (
                            <a
                              className="tg-official-link"
                              href={detail.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              公式サイト
                              <ExternalLink size={12} />
                            </a>
                          )}
                          <Link className="tg-try-link" to={`/tools/tech-selector?s=${shareParam}`}>
                            この技術を選んで構成を診断
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                      <p className="tg-element-summary">{element.description}</p>

                      {detail && (
                        <dl className="tg-element-detail">
                          <dt>概要</dt>
                          <dd>{detail.overview}</dd>
                          <dt>向いているケース</dt>
                          <dd>{detail.fit}</dd>
                          <dt>検討ポイント</dt>
                          <dd>{detail.caution}</dd>
                        </dl>
                      )}

                      <div className="tg-pattern-tags">
                        {isAllPatterns ? (
                          <span className="tg-pattern-tag is-all">すべての構成パターンに対応可能</span>
                        ) : (
                          element.patternIds.map((patternId) => {
                            const pattern = PATTERN_MAP[patternId];
                            if (!pattern) return null;
                            return (
                              <span className="tg-pattern-tag" key={patternId}>
                                {pattern.id} {pattern.name}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
