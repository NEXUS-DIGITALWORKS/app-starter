import { Sparkles } from 'lucide-react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errorMessage?: string;
};

const PLACEHOLDER =
  '例：社内の在庫確認と発注を今はExcelでやっていて、担当者しか状況が分からず困っています。パートさんも含めて誰でもスマホで在庫を確認・発注できるようにしたいです。';

export default function DiagnosisFreeTextInput({ value, onChange, onSubmit, isSubmitting, errorMessage }: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-[#D0D5DD] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
        <label htmlFor="diagnosis-free-text" className="mb-2 block text-sm font-bold text-[#111827]">
          作りたいもの・困っていることを自由に書いてください
        </label>
        <p className="mb-4 text-xs text-[#667085]">
          専門用語は不要です。「誰が」「何に困っていて」「何ができるようになりたいか」を書くほど、診断の精度が上がります。
        </p>
        <textarea
          id="diagnosis-free-text"
          className="w-full rounded-xl border border-[#D0D5DD] p-3 text-sm text-[#111827] focus:border-[#3157E5] focus:outline-none focus:ring-1 focus:ring-[#3157E5]"
          rows={8}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={PLACEHOLDER}
          disabled={isSubmitting}
        />

        {errorMessage && <p className="mt-3 text-sm text-[#B42318]">{errorMessage}</p>}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || value.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3157E5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2646c4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles size={16} />
            {isSubmitting ? 'AIが読み取っています…' : 'この内容で診断する'}
          </button>
        </div>
      </div>
    </div>
  );
}
