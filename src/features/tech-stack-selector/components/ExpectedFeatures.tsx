import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FileUp,
  History,
  LayoutDashboard,
  ListChecks,
  Plug,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';

type Props = {
  features: string[];
};

const FEATURE_ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/ログイン|ユーザー|シングルサインオン|Google/i, Users],
  [/権限|ロール|組織|招待/i, ShieldCheck],
  [/マスタ|商品|顧客|案件|カタログ|コンテンツ|属性/i, Database],
  [/一覧|登録|編集|詳細|データの/i, ListChecks],
  [/検索|絞り込み|並び替え/i, Search],
  [/ファイル|アップロード|文書|帳票処理/i, FileUp],
  [/履歴|監視|アラート|障害/i, History],
  [/通知|メール/i, Bell],
  [/ダッシュボード|可視化|分析|集計/i, LayoutDashboard],
  [/CSV|帳票出力|出力/i, FileSpreadsheet],
  [/外部|API|SaaS|連携|Webhook/i, Plug],
  [/バックグラウンド|自動|ワークフロー|振り分け|同期/i, RefreshCw],
];

function getFeatureIcon(feature: string): LucideIcon {
  const rule = FEATURE_ICON_RULES.find(([pattern]) => pattern.test(feature));
  return rule ? rule[1] : CheckCircle2;
}

export default function ExpectedFeatures({ features }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold text-foreground">想定される代表機能</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-3">
        {features.map((feature) => {
          const Icon = getFeatureIcon(feature);
          return (
            <div
              key={feature}
              className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-foreground">{feature}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
