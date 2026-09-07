import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthWidget from '../features/auth/AuthWidget';
import ToolsNav from '../components/ToolsNav';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import DiagnosisFreeTextInput from '../features/tech-stack-selector/components/DiagnosisFreeTextInput';
import DiagnosisFollowUpQuestions from '../features/tech-stack-selector/components/DiagnosisFollowUpQuestions';
import DiagnosisResultView from '../features/tech-stack-selector/components/DiagnosisResultView';
import { diagnoseTech } from '../features/tech-stack-selector/lib/diagnose';
import { saveTechDiagnosis } from '../features/tech-stack-selector/lib/diagnosisRepo';
import { resolveMissingQuestions } from '../features/tech-stack-selector/lib/missingQuestions';
import { extractRequirements, RequirementExtractionError } from '../features/tech-stack-selector/lib/requirementExtraction';
import { setConfirmed } from '../features/tech-stack-selector/lib/requirementProfile';
import type { RequirementKey, RequirementProfile } from '../features/tech-stack-selector/types';
import logo from '../assets/logo.png';
import '../App.css';
import '../features/tech-stack-selector/tech-stack-selector.css';

type Step = 'input' | 'extracting' | 'questions' | 'result';

export default function TechDiagnosis() {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>('input');
  const [freeText, setFreeText] = useState('');
  const [profile, setProfile] = useState<RequirementProfile>({});
  const [answers, setAnswers] = useState<Partial<Record<RequirementKey, string>>>({});
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const missingQuestions = useMemo(() => resolveMissingQuestions(profile), [profile]);

  const handleSubmitText = async () => {
    setErrorMessage(undefined);
    setStep('extracting');
    try {
      const extracted = await extractRequirements(freeText);
      setProfile(extracted);
      setAnswers({});
      const missing = resolveMissingQuestions(extracted);
      setStep(missing.length > 0 ? 'questions' : 'result');
    } catch (error) {
      setErrorMessage(
        error instanceof RequirementExtractionError ? error.message : 'AIによる要件抽出でエラーが発生しました。時間をおいて再度お試しください。',
      );
      setStep('input');
    }
  };

  const handleAnswer = (key: RequirementKey, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitQuestions = () => {
    let merged = profile;
    for (const [key, value] of Object.entries(answers)) {
      merged = setConfirmed(merged, key as RequirementKey, value);
    }
    setProfile(merged);
    setStep('result');
  };

  const result = useMemo(() => (step === 'result' ? diagnoseTech(profile) : null), [step, profile]);

  const supabaseConfigured = isSupabaseConfigured();
  const saveDisabledReason = !supabaseConfigured
    ? 'この環境では保存機能が未設定です（管理者にお問い合わせください）'
    : !isAuthenticated
      ? 'ログインすると診断結果を保存できます'
      : null;

  const handleSave = async (meta: { title: string; memo: string }) => {
    if (!result) return;
    await saveTechDiagnosis(freeText, profile, result, meta);
  };

  return (
    <div className="page tools-scope">
      <header className="site-header">
        <Link to="/" className="brand">
          <img src={logo} alt="BizTools" className="brand-logo" />
          <span className="brand-tagline">Tech診断</span>
        </Link>
        <ToolsNav />
        <AuthWidget />
      </header>

      {step === 'input' && (
        <main className="tss-hero">
          <span className="tss-eyebrow">Tech診断</span>
          <h1>作りたいものを書くだけで、最適な技術構成が分かる。</h1>
          <p>技術の知識がなくても大丈夫です。AIが文章から要件を読み取り、作り方と技術構成をまとめて提案します。</p>
        </main>
      )}

      <div className="mx-auto w-full max-w-7xl flex-1 px-6 pb-16 pt-8 lg:px-10">
        {step === 'input' && (
          <DiagnosisFreeTextInput
            value={freeText}
            onChange={setFreeText}
            onSubmit={handleSubmitText}
            isSubmitting={false}
            errorMessage={errorMessage}
          />
        )}

        {step === 'extracting' && (
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border border-[#D0D5DD] bg-white p-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold text-[#111827]">AIが文章を読み取っています…</p>
            <p className="text-xs text-[#667085]">数秒ほどお待ちください</p>
          </div>
        )}

        {step === 'questions' && (
          <DiagnosisFollowUpQuestions
            questions={missingQuestions}
            answers={answers}
            onAnswer={handleAnswer}
            onSubmit={handleSubmitQuestions}
            onBack={() => setStep('input')}
          />
        )}

        {step === 'result' && result && (
          <DiagnosisResultView result={result} onSave={handleSave} saveDisabledReason={saveDisabledReason} />
        )}
      </div>

      <footer className="site-footer">© 2026 App Starter</footer>
    </div>
  );
}
