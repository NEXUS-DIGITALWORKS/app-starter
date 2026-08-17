import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Copy, FileText, RotateCcw, Save, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../../../lib/supabaseClient';
import { useAuth } from '../../../hooks/useAuth';
import { SaveMetaDialog } from '../../../components/SaveMetaDialog';
import { CATEGORIES } from '../data/categories';
import { computePatternMatches, getSelectedElements } from '../lib/matchEngine';
import { buildShareUrl, encodeSelectionToParam } from '../lib/shareLink';
import { saveTechSelection } from '../lib/resultsRepo';
import type { Selection } from '../types';

type Props = {
  selection: Selection;
  onReset: () => void;
  onApplyPattern: (patternId: string) => void;
};

const PARTIAL_MATCH_LIMIT = 5;

export default function MatchSummaryPanel({ selection, onReset, onApplyPattern }: Props) {
  const { isAuthenticated } = useAuth();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');

  const selectedElements = getSelectedElements(selection);
  const matches = computePatternMatches(selection);
  const perfectMatches = matches.filter((m) => m.isPerfectMatch);
  const partialMatches = matches.filter((m) => !m.isPerfectMatch).slice(0, PARTIAL_MATCH_LIMIT);

  const supabaseConfigured = isSupabaseConfigured();
  const saveDisabledReason = !supabaseConfigured
    ? 'この環境では保存機能が未設定です（管理者にお問い合わせください）'
    : !isAuthenticated
      ? 'ログインすると選択内容を保存できます'
      : selectedElements.length === 0
        ? '技術要素を1つ以上選択してください'
        : null;

  const openSaveDialog = () => {
    setSaveState('idle');
    setDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    setSaveState('saving');
    try {
      await saveTechSelection(selection, { title, memo });
      setSaveState('saved');
      setDialogOpen(false);
    } catch {
      setSaveState('error');
    }
  };

  const handleShare = async () => {
    try {
      const url = buildShareUrl(selection);
      await navigator.clipboard.writeText(url);
      setShareState('copied');
    } catch {
      setShareState('error');
    }
  };

  return (
    <aside className="tss-summary">
      <div className="tss-summary-inner">
        <div className="tss-summary-block">
          <h3>
            <Sparkles size={16} />
            マッチするパターン
          </h3>
          {selectedElements.length === 0 ? (
            <p className="tss-summary-empty">左のカテゴリから技術要素を選ぶと、候補パターンが表示されます。</p>
          ) : (
            <>
              {perfectMatches.length > 0 ? (
                <ul className="tss-pattern-list">
                  {perfectMatches.map((m) => (
                    <li key={m.pattern.id}>
                      <button
                        type="button"
                        className="tss-pattern-item is-perfect is-clickable"
                        onClick={() => onApplyPattern(m.pattern.id)}
                        title="クリックしてこのパターンの構成を1〜10のパネルに反映する"
                      >
                        <CheckCircle2 size={15} />
                        <span className="tss-pattern-code">{m.pattern.id}</span>
                        <span className="tss-pattern-name">{m.pattern.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tss-summary-empty">完全に一致するパターンはありません。近いパターン候補です。</p>
              )}
              {partialMatches.length > 0 && (
                <ul className="tss-pattern-list">
                  {partialMatches.map((m) => (
                    <li key={m.pattern.id}>
                      <button
                        type="button"
                        className="tss-pattern-item is-clickable"
                        onClick={() => onApplyPattern(m.pattern.id)}
                        title="クリックしてこのパターンの構成を1〜10のパネルに反映する"
                      >
                        <span className="tss-pattern-code">{m.pattern.id}</span>
                        <span className="tss-pattern-name">{m.pattern.name}</span>
                        <span className="tss-pattern-score">
                          {m.matchedCount}/{m.totalSelected}要素が一致
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="tss-summary-block">
          <h3>選択した技術要素（{selectedElements.length}）</h3>
          {selectedElements.length === 0 ? (
            <p className="tss-summary-empty">まだ選択はありません。</p>
          ) : (
            <ul className="tss-selection-list">
              {CATEGORIES.map((category) => {
                const elementIds = selection[category.id] ?? [];
                if (elementIds.length === 0) return null;
                const names = elementIds
                  .map((id) => category.elements.find((e) => e.id === id)?.name)
                  .filter((name): name is string => Boolean(name));
                if (names.length === 0) return null;
                return (
                  <li key={category.id}>
                    <span className="tss-selection-cat">{category.title}</span>
                    <span className="tss-selection-name">{names.join('、')}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="tss-summary-actions">
          <Link to="/app/history" className="btn btn-secondary">
            保存したものを開く
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleShare}
            disabled={selectedElements.length === 0}
          >
            <Copy size={15} />
            {shareState === 'copied' ? 'リンクをコピーしました' : shareState === 'error' ? 'コピーに失敗しました' : '共有リンクをコピー'}
          </button>
          {perfectMatches.length > 0 ? (
            <Link
              to={`/tools/tech-selector/report?s=${encodeSelectionToParam(selection)}`}
              className="btn btn-secondary"
            >
              <FileText size={15} />
              構成パターンレポート
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              disabled
              title="完全に一致する構成パターンがあるときに利用できます"
            >
              <FileText size={15} />
              構成パターンレポート
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={openSaveDialog}
            disabled={Boolean(saveDisabledReason)}
            title={saveDisabledReason ?? undefined}
          >
            <Save size={15} />
            {saveState === 'saved' ? '保存しました' : '選択内容を保存'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            <RotateCcw size={15} />
            選択をリセット
          </button>
        </div>
        {saveDisabledReason && saveState === 'idle' && <p className="tss-save-hint">{saveDisabledReason}</p>}
      </div>

      <SaveMetaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        heading="選択内容を保存"
        description="後で見返しやすいように、タイトルとメモを付けられます。"
        confirmLabel="保存する"
        title={title}
        onTitleChange={setTitle}
        memo={memo}
        onMemoChange={setMemo}
        onConfirm={handleConfirmSave}
        confirmState={saveState}
      />
    </aside>
  );
}
