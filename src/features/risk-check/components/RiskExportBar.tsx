import { useState } from 'react';
import type { RiskStatus } from '../types';
import { buildJsonReport, buildMarkdownReport, downloadFile } from '../lib/exportReport';

type Props = {
  getStatus: (id: number) => RiskStatus;
  onReset: () => void;
};

export default function RiskExportBar({ getStatus, onReset }: Props) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  const handleCopyMd = async () => {
    const md = buildMarkdownReport(getStatus);
    try {
      await navigator.clipboard.writeText(md);
      showToast('Markdownをコピーしました');
    } catch {
      showToast('コピーに失敗しました');
    }
  };

  const handleDownloadMd = () => {
    downloadFile('risk-check-55-result.md', buildMarkdownReport(getStatus), 'text/markdown');
    showToast('Markdownをダウンロードしました');
  };

  const handleDownloadJson = () => {
    downloadFile('risk-check-55-result.json', buildJsonReport(getStatus), 'application/json');
    showToast('JSONをダウンロードしました');
  };

  const handleReset = () => {
    if (!window.confirm('すべてのチェック状態をリセットします。よろしいですか？')) return;
    onReset();
    showToast('チェック状態をリセットしました');
  };

  return (
    <>
      <div className="rc-export-bar">
        <div className="rc-export-inner">
          <button type="button" onClick={handleCopyMd}>
            Markdownをコピー
          </button>
          <button type="button" onClick={handleDownloadMd}>
            Markdownをダウンロード
          </button>
          <button type="button" className="rc-btn-primary" onClick={handleDownloadJson}>
            JSONをダウンロード
          </button>
          <span className="rc-export-divider" />
          <button type="button" className="rc-btn-danger" onClick={handleReset}>
            リセット
          </button>
        </div>
      </div>
      <div className={`rc-toast${toast ? ' is-show' : ''}`}>{toast}</div>
    </>
  );
}
