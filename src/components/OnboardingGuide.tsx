import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

type Step = {
  id: string;
  number: number;
  title: string;
  summary: string;
  badge?: { label: string; variant: 'success' | 'warning' };
  details: ReactNode;
};

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF0FE] text-sm font-semibold text-[#3157E5] transition-colors group-data-[state=open]:bg-[#3157E5] group-data-[state=open]:text-white">
      {n}
    </span>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative mt-3 rounded-lg border border-[#334155] bg-[#0F172A]">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="コードをコピー"
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-white"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <code className="block whitespace-pre px-3.5 py-3 pr-9 font-mono text-xs leading-[1.5] text-white">
        {code}
      </code>
    </div>
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-[#F1F5F9] px-[5px] py-[2px] font-mono text-[13px] text-[#334155]">{children}</code>
  );
}

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#475569]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}

function useSteps(): Step[] {
  const supabaseReady = isSupabaseConfigured();

  return [
    {
      id: 'dev-env',
      number: 1,
      title: '開発環境をセットアップする',
      summary: 'Node.jsとVS Code、Claude Codeを使ってこのプロジェクトをローカルで動かせるようにします。',
      details: (
        <div className="space-y-4">
          <StepList
            items={[
              'Node.js（LTS版）をインストールする',
              'VS Codeをインストールし、Claude Codeの拡張機能またはCLIを導入する',
              'このリポジトリをclone（または展開）する',
            ]}
          />
          <CodeBlock code={'npm install\nnpm run dev'} />
        </div>
      ),
    },
    {
      id: 'supabase',
      number: 2,
      title: 'Supabaseと連携し、本番同様のログインを有効にする',
      summary: '今はデモアカウントによるローカル完結のログインです。実際のSupabaseと連携すると、誰でも新規登録してログインできるようになります。',
      badge: supabaseReady
        ? { label: '連携済み', variant: 'success' }
        : { label: '未設定（次はここ）', variant: 'warning' },
      details: (
        <div className="space-y-4">
          <StepList
            items={[
              'supabase.com でアカウントを作成する',
              '「New Project」から新しいプロジェクトを作成する（リージョンとDBパスワードを設定）',
              'プロジェクトの Settings > API で「Project URL」と「anon public key」を確認する',
            ]}
          />
          <div>
            <p className="m-0 text-sm leading-relaxed text-[#475569]">
              取得した値を <InlineCode>.env.example</InlineCode> をコピーして作った <InlineCode>.env</InlineCode>{' '}
              に設定します。
            </p>
            <CodeBlock
              code={'VITE_SUPABASE_URL=https://xxxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=xxxxx'}
            />
          </div>
          <StepList
            items={[
              'SupabaseのSQL Editorで supabase/migrations/ 配下のSQLを番号なしなら setup_user_profiles.sql → setup_diagnosis_results.sql → setup_tech_selections.sql の順に実行する',
              'npm run dev を再起動する（.envが設定されると、デモアカウントでのログインは自動的に無効になり、Supabase認証に切り替わる）',
              '実際にサインアップし、自分のアカウントでログインできることを確認する',
            ]}
          />
        </div>
      ),
    },
    {
      id: 'ai-coding',
      number: 3,
      title: 'Claude Code（AIコーディング環境）で機能を作ってみる',
      summary: 'AIに指示を出しながら、実際に小さな機能を追加してみます。',
      details: (
        <StepList
          items={[
            'Claude CodeでこのプロジェクトのフォルダーとCLAUDE.mdを開く（プロジェクトの構成を理解させる）',
            '小さなお願いから試す（例:「アカウントページに一言メモを追加して」）',
            '/code-review-daily で変更内容をレビューしてもらう習慣をつける',
          ]}
        />
      ),
    },
    {
      id: 'design',
      number: 4,
      title: 'デザインを変えてみる',
      summary: '配色やロゴを差し替えて、このアプリを自分（またはクライアント）専用の見た目にします。',
      details: (
        <StepList
          items={[
            'src/index.css の配色トークン（--color-primary など）を変更する',
            'src/assets/logo.svg を自分のロゴファイルに差し替える',
          ]}
        />
      ),
    },
    {
      id: 'features',
      number: 5,
      title: '自分の機能を作る',
      summary: 'ここまでできたら、いよいよクライアント向けの機能を追加していく段階です。',
      details: (
        <StepList
          items={[
            'src/features/ に新しい機能フォルダーを作る（既存の build-or-buy を参考にすると構成がわかりやすい）',
            '不要な既存機能（診断ツールなど）は削除してよい',
            'CLAUDE.mdの「クライアント展開の進め方」を参照しながら進める',
          ]}
        />
      ),
    },
  ];
}

export default function OnboardingGuide() {
  const steps = useSteps();
  const defaultOpen = steps.find((s) => s.badge?.variant === 'warning')?.id ?? steps[0].id;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-7">
      <h2 className="m-0 text-lg font-semibold text-[#0F172A]">はじめてガイド</h2>
      <p className="m-0 mt-2 text-sm text-[#64748B]">
        このアプリをベースに、自分の機能を作れるようになるまでの手順です。上から順に進めてください。
      </p>

      <Accordion type="single" collapsible defaultValue={defaultOpen} className="mt-4 space-y-2">
        {steps.map((step) => (
          <AccordionItem
            key={step.id}
            value={step.id}
            className="overflow-hidden rounded-lg !border border-[#E2E8F0] bg-white transition-colors data-[state=open]:border-[#D6E0F0] data-[state=open]:bg-[#FBFCFF]"
          >
            <AccordionTrigger className="group bg-transparent px-4 py-3 text-sm text-[#0F172A] hover:bg-[#F8FAFC] hover:no-underline data-[state=open]:bg-[#F8FAFF] data-[state=open]:hover:bg-[#F8FAFF]">
              <span className="flex flex-1 items-center gap-3 text-left">
                <StepNumber n={step.number} />
                <span className="flex items-center gap-2">
                  <span>{step.title}</span>
                  {step.badge && (
                    <Badge
                      variant={step.badge.variant}
                      className="shrink-0 border-transparent px-2 py-0.5 text-[11px] font-medium"
                    >
                      {step.badge.label}
                    </Badge>
                  )}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 border-t border-[#EDF1F7] pt-5">
                <p className="m-0 text-sm leading-relaxed text-[#475569]">{step.summary}</p>
                {step.details}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
