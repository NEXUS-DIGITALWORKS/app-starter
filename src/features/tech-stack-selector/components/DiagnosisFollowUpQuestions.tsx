import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { FollowUpQuestion, RequirementKey } from '../types';

type Props = {
  questions: FollowUpQuestion[];
  answers: Partial<Record<RequirementKey, string>>;
  onAnswer: (key: RequirementKey, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export default function DiagnosisFollowUpQuestions({ questions, answers, onAnswer, onSubmit, onBack }: Props) {
  const allAnswered = questions.every((question) => Boolean(answers[question.key]));

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-[#D0D5DD] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#3157E5]">あと少しだけ確認させてください</p>
        <p className="mb-6 text-sm text-[#667085]">
          文章から読み取れなかった項目のみ質問しています（{questions.length}問）。
        </p>

        <div className="flex flex-col gap-6">
          {questions.map((question) => (
            <div key={question.key} className="border-b border-[#EEF0F4] pb-6 last:border-b-0 last:pb-0">
              <h3 className="mb-3 text-base font-bold tracking-tight text-[#111827]">{question.question}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => {
                  const selected = answers[question.key] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onAnswer(question.key, option.value)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        selected
                          ? 'border-[#3157E5] bg-[#EEF1FE] text-[#111827]'
                          : 'border-[#D0D5DD] bg-white text-[#111827] hover:border-[#98A2B3] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected ? 'border-[#3157E5] bg-[#3157E5] text-white' : 'border-[#D0D5DD]'
                        }`}
                      >
                        {selected && <Check size={13} strokeWidth={3} />}
                      </span>
                      <span className="text-sm font-semibold">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#EEF0F4] pt-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054]"
          >
            <ArrowLeft size={16} />
            戻る
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3157E5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2646c4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            診断結果を見る
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
