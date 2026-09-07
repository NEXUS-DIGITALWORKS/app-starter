import { useMemo, useState } from 'react';
import { cn } from '../../../lib/utils';
import StackProfileArchitectureDiagram from './StackProfileArchitectureDiagram';
import type { ArchitecturePattern, StackProfile } from '../types';

const COMPLEXITY_LABELS: Record<number, string> = {
  1: '低（着手しやすい）',
  2: '中（標準的な体制が必要）',
  3: '高（専門知識・体制が必要）',
};

type Props = {
  pattern: ArchitecturePattern;
  profiles: StackProfile[];
};

export default function ArchitecturePatternBody({ pattern, profiles }: Props) {
  const [activeProfileId, setActiveProfileId] = useState<string | undefined>(profiles[0]?.id);
  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) ?? profiles[0],
    [profiles, activeProfileId],
  );

  if (!activeProfile) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-background px-3 py-4 text-[12px] text-muted-foreground">
        このパターンに対応する構成プロファイルは未登録です。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">
          実装の複雑さ：{COMPLEXITY_LABELS[pattern.complexityLevel] ?? `レベル${pattern.complexityLevel}`}
        </p>
        {profiles.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="構成バリエーション">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                role="tab"
                aria-selected={activeProfile.id === profile.id}
                onClick={() => setActiveProfileId(profile.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors',
                  activeProfile.id === profile.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                )}
              >
                {profile.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <StackProfileArchitectureDiagram
        profile={activeProfile}
        purpose={pattern.description}
        merits={pattern.suitableConditions}
        notes={pattern.candidates}
        cautions={pattern.unsuitableConditions}
      />
    </div>
  );
}
