import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  BarChart3,
  Check,
  Database,
  FileText,
  FolderArchive,
  Layers3,
  Monitor,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { StackProfile, TechRole } from '../types';

const ROLE_ICONS: Record<TechRole, LucideIcon> = {
  frontend: Monitor,
  backend: Server,
  database: Database,
  auth: ShieldCheck,
  storage: FolderArchive,
  search: Search,
  ai: Sparkles,
  automation: Workflow,
  hosting: Rocket,
  monitoring: Activity,
};

type LayerConfig = {
  key: string;
  name: string;
  jp: string;
  description: string;
  primaryRole?: TechRole;
  supportingRole?: TechRole;
  emptyNote: string;
  highlights: string[];
};

const LAYERS: LayerConfig[] = [
  {
    key: 'client',
    name: 'CLIENT',
    jp: 'クライアント層',
    description: 'ユーザーがサービスに触れる入口',
    emptyNote: 'ユーザー / ブラウザ',
    highlights: ['Webブラウザでアクセス', 'マルチデバイス対応'],
  },
  {
    key: 'frontend',
    name: 'FRONTEND',
    jp: 'フロントエンド層',
    description: 'UI表示・画面遷移・操作の受け付け',
    primaryRole: 'frontend',
    emptyNote: '専用のフロントエンド技術は定義されていません',
    highlights: ['画面表示・UI描画', '画面遷移・状態管理', 'APIとの通信'],
  },
  {
    key: 'backend',
    name: 'BACKEND',
    jp: 'バックエンド層',
    description: 'ビジネスロジックの実行とデータ処理',
    primaryRole: 'backend',
    emptyNote: '専用APIサーバーを持たない構成です',
    highlights: ['認証・認可', '業務ロジックの実行', 'データの読み書き'],
  },
  {
    key: 'data',
    name: 'DATA',
    jp: 'データ層',
    description: 'データ・ファイルの保存と永続化',
    primaryRole: 'database',
    supportingRole: 'search',
    emptyNote: '専用のデータベース技術は定義されていません',
    highlights: ['データの永続化', 'ユーザー情報の管理', 'ファイルの保管'],
  },
];

const LAYER_THEME = [
  { badge: 'bg-[#2563EB]', text: 'text-[#2563EB]', soft: 'bg-[#EFF6FF]', border: 'border-[#DBEAFE]' },
  { badge: 'bg-[#F59E0B]', text: 'text-[#B45309]', soft: 'bg-[#FFF7ED]', border: 'border-[#FDE7C7]' },
  { badge: 'bg-[#10B981]', text: 'text-[#047857]', soft: 'bg-[#ECFDF5]', border: 'border-[#CFF3E4]' },
  { badge: 'bg-[#8B5CF6]', text: 'text-[#6D28D9]', soft: 'bg-[#F5F3FF]', border: 'border-[#E6DFFC]' },
];

const CONNECTOR_LABELS = ['HTTPS', 'APIリクエスト（HTTPS）', 'データ保存・取得'];

const CROSS_CUTTING_ROLES: { role: TechRole; label: string }[] = [
  { role: 'auth', label: '認証・認可' },
  { role: 'storage', label: 'ストレージ' },
  { role: 'ai', label: 'AI・自動化' },
  { role: 'automation', label: '業務自動化連携' },
  { role: 'hosting', label: '公開・実行基盤' },
  { role: 'monitoring', label: 'モニタリング' },
];

function FlowRow({
  layer,
  themeIndex,
  index,
  roles,
  isLast,
}: {
  layer: LayerConfig;
  themeIndex: number;
  index: number;
  roles: StackProfile['roles'];
  isLast: boolean;
}) {
  const value = layer.primaryRole ? roles[layer.primaryRole] : undefined;
  const Icon: LucideIcon | null = layer.primaryRole ? ROLE_ICONS[layer.primaryRole] : null;
  const theme = LAYER_THEME[themeIndex];

  return (
    <div>
      <section className={cn('grid grid-cols-[190px_1fr] gap-3 rounded-2xl border p-3.5', theme.soft, theme.border)}>
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
              theme.badge,
            )}
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className={cn('text-[13.5px] font-bold leading-tight', theme.text)}>{layer.jp}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{layer.name}</p>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{layer.description}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white/80 p-3">
          {value ? (
            <div className="flex items-start gap-3">
              {Icon && (
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white', theme.text)}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[14.5px] font-bold leading-snug text-foreground">{value}</p>
                <ul className="mt-1.5 flex flex-col gap-0.5">
                  {layer.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-1.5 text-[11px] text-foreground/80">
                      <Check className={cn('h-3 w-3 shrink-0', theme.text)} aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-[12.5px] font-bold text-foreground">{layer.emptyNote}</p>
              <div className="flex flex-wrap gap-1.5">
                {layer.highlights.map((h) => (
                  <span key={h} className={cn('rounded-full bg-white px-2 py-0.5 text-[10.5px] font-semibold', theme.text)}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {!isLast && (
        <div className="flex items-center gap-2 py-1.5 pl-[15px]">
          <ArrowDown className={cn('h-4 w-4', theme.text)} aria-hidden="true" />
          <span className={cn('text-[11px] font-bold', theme.text)}>{CONNECTOR_LABELS[index]}</span>
        </div>
      )}
    </div>
  );
}

function TechPanel({ roles }: { roles: StackProfile['roles'] }) {
  const crossItems = CROSS_CUTTING_ROLES.map(({ role, label }) => {
    const value = roles[role];
    return value ? { role, label, value } : null;
  }).filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <aside className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Layers3 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <div>
          <h3 className="text-[12px] font-bold text-foreground">各レイヤーの技術</h3>
          <p className="text-[10px] text-muted-foreground">この構成で使用する主な技術</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {LAYERS.map((layer, index) => {
          const primaryValue = layer.primaryRole ? roles[layer.primaryRole] : undefined;
          const supportingValue = layer.supportingRole ? roles[layer.supportingRole] : undefined;
          if (!primaryValue && !supportingValue) return null;
          const theme = LAYER_THEME[index];
          const Icon = layer.primaryRole ? ROLE_ICONS[layer.primaryRole] : Layers3;
          return (
            <div key={layer.key}>
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white',
                    theme.badge,
                  )}
                >
                  {index + 1}
                </span>
                <span className="text-[11px] font-bold text-foreground">{layer.jp}の技術</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {primaryValue && (
                  <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[10.5px] font-semibold leading-snug text-foreground">{primaryValue}</span>
                  </div>
                )}
                {supportingValue && (
                  <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5">
                    <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[10.5px] font-semibold leading-snug text-foreground">{supportingValue}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {crossItems.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/60 text-[10px] font-bold text-white">
                +
              </span>
              <span className="text-[11px] font-bold text-foreground">共通・横断機能</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {crossItems.map((item) => {
                const Icon = ROLE_ICONS[item.role];
                return (
                  <div
                    key={item.role}
                    className="flex min-w-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[10.5px] font-semibold leading-snug text-foreground">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function InfoCards({
  purpose,
  merits,
  notes,
  cautions,
}: {
  purpose: string;
  merits: string[];
  notes: string[];
  cautions: string[];
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="rounded-2xl border border-[#FFD9D6] bg-[#FFF1F0] p-4">
        <p className="mb-2 flex items-center gap-1.5 text-[14px] font-bold text-[#DC2626]">
          <Target className="h-4 w-4" aria-hidden="true" />
          目的
        </p>
        <p className="text-[13px] leading-relaxed text-foreground">{purpose}</p>
      </div>

      <div className="rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-4">
        <p className="mb-2 flex items-center gap-1.5 text-[14px] font-bold text-[#2563EB]">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          この構成のメリット
        </p>
        <ul className="flex list-none flex-col gap-1.5 pl-0">
          {merits.map((item) => (
            <li key={item} className="text-[13px] leading-relaxed text-foreground">
              <Check className="mr-1.5 inline h-3.5 w-3.5 shrink-0 -translate-y-px text-[#2563EB]" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#E6DFFC] bg-[#F5F3FF] p-4">
        <p className="mb-2 flex items-center gap-1.5 text-[14px] font-bold text-[#7C3AED]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          補足
        </p>
        <ul className="flex list-none flex-col gap-1.5 pl-0">
          {notes.map((item) => (
            <li key={item} className="text-[13px] leading-relaxed text-foreground">
              <Check className="mr-1.5 inline h-3.5 w-3.5 shrink-0 -translate-y-px text-[#7C3AED]" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {cautions.length > 0 && (
        <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[14px] font-bold text-[#B45309]">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            別構成も検討したいケース
          </p>
          <ul className="flex list-none flex-col gap-1.5 pl-0">
            {cautions.map((item) => (
              <li key={item} className="text-[13px] leading-relaxed text-foreground">
                <span className="mr-1.5 text-[#B45309]">・</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

type Props = {
  profile: StackProfile;
  purpose: string;
  merits: string[];
  notes: string[];
  cautions: string[];
};

export default function StackProfileArchitectureDiagram({ profile, purpose, merits, notes, cautions }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2.1fr_1fr_1fr]">
      <div className="flex flex-col gap-0.5">
        {LAYERS.map((layer, index) => (
          <FlowRow
            key={layer.key}
            layer={layer}
            themeIndex={index}
            index={index}
            roles={profile.roles}
            isLast={index === LAYERS.length - 1}
          />
        ))}
      </div>

      <TechPanel roles={profile.roles} />
      <InfoCards purpose={purpose} merits={merits} notes={notes} cautions={cautions} />
    </div>
  );
}
