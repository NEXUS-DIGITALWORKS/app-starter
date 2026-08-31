import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Save } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { SaveMetaDialog, type SaveMetaState } from '../../../components/SaveMetaDialog';
import { ELEMENT_DETAILS } from '../data/elementDetails';
import { HOSTING_PROVIDER_MAP } from '../data/hostingProviders';
import { getElementName } from '../lib/elementLookup';
import type { StackResolution, TechDiagnosisResult } from '../types';

type Props = {
  result: TechDiagnosisResult;
  onSave: (meta: { title: string; memo: string }) => Promise<void>;
  saveDisabledReason: string | null;
};

type StackRoleEntry = { label: string; elementId: string | undefined };

function buildStackRoleEntries(stack: StackResolution): StackRoleEntry[] {
  return [
    { label: '画面', elementId: stack.frontend },
    { label: 'サーバー処理', elementId: stack.backend },
    { label: 'ログイン・データ保存', elementId: stack.database },
    { label: '認証', elementId: stack.auth },
    { label: 'ファイル保存', elementId: stack.storage },
    { label: 'AI処理', elementId: stack.ai },
  ].filter((entry): entry is StackRoleEntry => Boolean(entry.elementId));
}

export default function DiagnosisResultView({ result, onSave, saveDisabledReason }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [saveState, setSaveState] = useState<SaveMetaState>('idle');

  const stackRoles = buildStackRoleEntries(result.stack);
  const hostingProvider = HOSTING_PROVIDER_MAP[result.hosting.primary];

  const handleConfirmSave = async () => {
    setSaveState('saving');
    try {
      await onSave({ title, memo });
      setSaveState('saved');
      setDialogOpen(false);
    } catch {
      setSaveState('error');
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="rounded-2xl border border-[#D0D5DD] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#3157E5]">おすすめの作り方</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{result.primaryMode.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#344054]">{result.primaryMode.summary}</p>

        {result.aiCapabilities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {result.aiCapabilities.map((capability) => (
              <span
                key={capability.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#3157E5] bg-[#EAF1FF] px-3 py-1 text-xs font-semibold text-[#2748C7]"
              >
                ＋ {capability.name}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-[#D0D5DD] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
        <p className="mb-4 text-xs font-bold uppercase tracking-wide text-[#3157E5]">おすすめ技術構成</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          {stackRoles.map((entry) => (
            <div key={entry.label} className="rounded-xl border border-[#EEF0F4] bg-[#F8FAFC] p-3.5">
              <dt className="text-xs font-semibold text-[#667085]">{entry.label}</dt>
              <dd className="mt-1 text-sm font-bold text-[#111827]">{getElementName(entry.elementId)}</dd>
            </div>
          ))}
          {hostingProvider && (
            <div className="rounded-xl border border-[#EEF0F4] bg-[#F8FAFC] p-3.5">
              <dt className="text-xs font-semibold text-[#667085]">Web公開</dt>
              <dd className="mt-1 text-sm font-bold text-[#111827]">{hostingProvider.name}</dd>
            </div>
          )}
        </dl>
      </section>

      {result.reasons.length > 0 && (
        <section className="mt-6 rounded-2xl border border-[#D0D5DD] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-[#3157E5]">なぜこの構成なのか</p>
          <ul className="flex flex-col gap-2.5">
            {result.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm leading-relaxed text-[#344054]">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#3157E5]" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(result.alternativeModes.length > 0 || result.hosting.alternatives.length > 0) && (
        <section className="mt-6 rounded-2xl border border-[#D0D5DD] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-[#667085]">代替候補</p>
          <div className="flex flex-col gap-3 text-sm text-[#344054]">
            {result.alternativeModes.map((mode) => (
              <p key={mode.id}>
                <span className="font-semibold text-[#111827]">{mode.name}</span> という作り方も検討できます。
              </p>
            ))}
            {result.hosting.alternatives.map((providerId) => {
              const provider = HOSTING_PROVIDER_MAP[providerId];
              if (!provider) return null;
              return (
                <p key={providerId}>
                  公開先として <span className="font-semibold text-[#111827]">{provider.name}</span> も候補です。
                </p>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="tech-detail" className="rounded-2xl border border-[#D0D5DD] bg-white px-6 sm:px-8">
            <AccordionTrigger className="text-sm font-bold text-[#111827]">技術者向け詳細を見る</AccordionTrigger>
            <AccordionContent>
              <dl className="flex flex-col gap-3 pb-2">
                {stackRoles.map((entry) => {
                  const detail = entry.elementId ? ELEMENT_DETAILS[entry.elementId] : undefined;
                  return (
                    <div key={entry.label} className="border-b border-[#EEF0F4] pb-3 last:border-b-0">
                      <dt className="text-xs font-semibold text-[#667085]">
                        {entry.label} — {getElementName(entry.elementId)}
                      </dt>
                      {detail && <dd className="mt-1 text-xs leading-relaxed text-[#344054]">{detail.overview}</dd>}
                    </div>
                  );
                })}
                {hostingProvider && (
                  <div className="border-b border-[#EEF0F4] pb-3 last:border-b-0">
                    <dt className="text-xs font-semibold text-[#667085]">Hosting / Runtime — {hostingProvider.name}</dt>
                    <dd className="mt-1 text-xs leading-relaxed text-[#344054]">{hostingProvider.summary}</dd>
                  </div>
                )}
              </dl>
              <Link
                to="/tools/tech-selector"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#3157E5] hover:underline"
              >
                技術要素セレクターで手動調整する
                <ChevronRight size={14} />
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {saveDisabledReason && (
        <Alert className="mt-6">
          <AlertDescription>{saveDisabledReason}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSaveState('idle');
            setDialogOpen(true);
          }}
          disabled={Boolean(saveDisabledReason)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3157E5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2646c4] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save size={16} />
          {saveState === 'saved' ? '保存しました' : 'この診断結果を保存'}
        </button>
      </div>

      <SaveMetaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        heading="診断結果を保存"
        description="後で見返しやすいように、タイトルとメモを付けられます。"
        confirmLabel="保存する"
        title={title}
        onTitleChange={setTitle}
        memo={memo}
        onMemoChange={setMemo}
        onConfirm={handleConfirmSave}
        confirmState={saveState}
      />
    </div>
  );
}
