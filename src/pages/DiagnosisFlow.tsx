import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { DiagnosisHeader } from '../features/build-or-buy/components/DiagnosisHeader';
import { DiagnosisStepper } from '../features/build-or-buy/components/DiagnosisStepper';
import { QuestionPanel } from '../features/build-or-buy/components/QuestionPanel';
import { StepReview } from '../features/build-or-buy/components/StepReview';
import { DiagnosisSummary } from '../features/build-or-buy/components/DiagnosisSummary';
import { DiagnosisActions } from '../features/build-or-buy/components/DiagnosisActions';
import { diagnosisSteps, getStep } from '../features/build-or-buy/data/steps';
import { getQuestion } from '../features/build-or-buy/data/questions';
import { diagnose } from '../features/build-or-buy/lib/diagnosisEngine';
import type { Answers } from '../features/build-or-buy/types';
import '../App.css';
import '../features/build-or-buy/build-or-buy.css';

const STORAGE_KEY = 'build-or-buy-flow-v1';
const LAST_QUESTION_STEP = diagnosisSteps.filter((step) => step.questionIds.length > 0).length;
const REVIEW_STEP = diagnosisSteps.length;

function loadAnswers(): Answers {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function isStepComplete(step: { questionIds: string[] }, answers: Answers): boolean {
  return step.questionIds.every((id) => {
    const question = getQuestion(id);
    if (!question?.required) return true;
    return (answers[id] ?? []).some((value) => value.trim().length > 0);
  });
}

type Tab = 'question' | 'result';

export default function DiagnosisFlow() {
  const [answers, setAnswers] = useState<Answers>(loadAnswers);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('question');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const currentStepData = getStep(currentStep) ?? diagnosisSteps[0];

  const completedSteps = useMemo(() => {
    const done = new Set<number>();
    for (const step of diagnosisSteps) {
      if (step.questionIds.length > 0 && isStepComplete(step, answers)) done.add(step.id);
    }
    return done;
  }, [answers]);

  const canContinue = isStepComplete(currentStepData, answers);

  const setAnswer = (questionId: string, value: string[]) => {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    if (!canContinue) return;
    goToStep(Math.min(currentStep + 1, REVIEW_STEP));
  };

  const back = () => {
    goToStep(Math.max(currentStep - 1, 1));
  };

  const reset = () => {
    setAnswers({});
    setCurrentStep(1);
    setActiveTab('question');
    localStorage.removeItem(STORAGE_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const liveResult = useMemo(() => diagnose(answers), [answers]);

  return (
    <div className="min-h-screen">
      <DiagnosisHeader />

      <nav aria-label="パンくずリスト" className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 pt-4 text-xs text-[#667085] sm:px-6 lg:px-8">
        <Link to="/" className="hover:text-[#111827] hover:underline">
          ツール一覧
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <Link to="/tools/diagnosis" className="hover:text-[#111827] hover:underline">
          技術構成診断
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className="font-medium text-[#344054]">診断実行</span>
      </nav>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:items-start lg:px-8">
        <aside>
          <DiagnosisStepper currentStep={currentStep} completedSteps={completedSteps} onSelectStep={goToStep} />
        </aside>

        <div>
          <div
            role="tablist"
            aria-label="診断画面切り替え"
            className="mb-4 flex items-center gap-2 border-b border-[#E5E7EB]"
          >
            <button
              type="button"
              role="tab"
              id="question-tab"
              aria-selected={activeTab === 'question'}
              aria-controls="question-panel"
              tabIndex={activeTab === 'question' ? 0 : -1}
              onClick={() => setActiveTab('question')}
              className={`relative inline-flex h-11 shrink-0 appearance-none items-center border-0 bg-transparent px-4 text-sm font-semibold shadow-none outline-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5] focus-visible:ring-offset-2 ${
                activeTab === 'question' ? 'text-[#3157E5]' : 'text-[#667085] hover:text-[#111827]'
              }`}
            >
              質問
              {activeTab === 'question' && (
                <span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#3157E5]" />
              )}
            </button>
            <button
              type="button"
              role="tab"
              id="result-tab"
              aria-selected={activeTab === 'result'}
              aria-controls="result-panel"
              tabIndex={activeTab === 'result' ? 0 : -1}
              onClick={() => setActiveTab('result')}
              className={`relative inline-flex h-11 shrink-0 appearance-none items-center border-0 bg-transparent px-4 text-sm font-semibold shadow-none outline-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5] focus-visible:ring-offset-2 ${
                activeTab === 'result' ? 'text-[#3157E5]' : 'text-[#667085] hover:text-[#111827]'
              }`}
            >
              診断結果
              {activeTab === 'result' && (
                <span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#3157E5]" />
              )}
            </button>
          </div>

          <div id="question-panel" role="tabpanel" aria-labelledby="question-tab" hidden={activeTab !== 'question'}>
            {currentStep === REVIEW_STEP ? (
              <div className="space-y-4">
                <StepReview answers={answers} onEditStep={goToStep} onViewResult={() => setActiveTab('result')} />
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#F8FAFC]"
                >
                  <ArrowLeft size={16} />
                  戻る
                </button>
              </div>
            ) : (
              <QuestionPanel
                step={currentStepData}
                answers={answers}
                onAnswerChange={setAnswer}
                onBack={back}
                onNext={next}
                canGoBack={currentStep > 1}
                canContinue={canContinue}
                isLastStep={currentStep === LAST_QUESTION_STEP}
              />
            )}
          </div>

          <div id="result-panel" role="tabpanel" aria-labelledby="result-tab" hidden={activeTab !== 'result'}>
            <DiagnosisSummary result={liveResult} answers={answers} />
          </div>
        </div>
      </main>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <DiagnosisActions answers={answers} result={liveResult} onReset={reset} />
      </div>
    </div>
  );
}
