import { CONTENT_FIELDS } from '../lib/contentFields';
import { diffText } from '../lib/diff';
import type { ProductContentText } from '../types';

interface DiffViewerProps {
  before: ProductContentText;
  after: ProductContentText;
  beforeLabel: string;
  afterLabel: string;
}

export default function DiffViewer({ before, after, beforeLabel, afterLabel }: DiffViewerProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[#667085]">
        <span>
          {beforeLabel} <span className="rounded bg-[#FEF3F2] px-1.5 py-0.5 text-[#B42318] line-through">削除</span>
        </span>
        <span>
          → {afterLabel} <span className="rounded bg-[#ECFDF5] px-1.5 py-0.5 text-[#059669]">追加</span>
        </span>
      </div>
      <div className="space-y-5">
        {CONTENT_FIELDS.map(({ key, label }) => {
          const tokens = diffText(before[key], after[key]);
          const changed = tokens.some((t) => t.type !== 'equal');
          return (
            <div key={key}>
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                {label}
                {!changed && <span className="text-xs font-normal text-[#98A2B3]">（変更なし）</span>}
              </p>
              <p className="whitespace-pre-line break-words text-sm leading-relaxed">
                {tokens.map((token, idx) => {
                  if (token.type === 'equal') {
                    return (
                      <span key={idx} className="text-[#344054]">
                        {token.value}
                      </span>
                    );
                  }
                  if (token.type === 'remove') {
                    return (
                      <span key={idx} className="bg-[#FEF3F2] text-[#B42318] line-through">
                        {token.value}
                      </span>
                    );
                  }
                  return (
                    <span key={idx} className="bg-[#ECFDF5] text-[#059669]">
                      {token.value}
                    </span>
                  );
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
