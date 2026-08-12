import { CheckCircle2 } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import type { PatternDetail } from '../data/patternDetails';

type Props = {
  patternId: string;
  patternName: string;
  detail: PatternDetail;
  selectedCount: number;
};

export default function PatternMatchSummary({ patternId, patternName, detail, selectedCount }: Props) {
  const summaryRows: Array<[string, string, boolean?]> = [
    ['技術要素数', String(selectedCount), true],
    ['主な用途', detail.primaryUse],
    ['構成タイプ', detail.architectureType],
    ['開発言語', detail.primaryLanguage],
  ];

  return (
    <Card className="rounded-2xl border-l-4 border-l-primary shadow-sm">
      <CardContent className="flex flex-col gap-6 p-7 lg:p-8">
        <div>
          <Badge variant="success" className="w-fit">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            選択技術と一致
          </Badge>
          <p className="mt-4 text-xs font-semibold text-muted-foreground">選択された構成パターン</p>
          <p className="mt-1 text-xs font-bold tracking-wide text-primary">{patternId}</p>
          <h2 id={`pattern-${patternId}-heading`} className="mt-1 text-2xl font-bold text-foreground lg:text-3xl">
            {patternName}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground lg:text-base">{detail.shortSummary}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-muted/60 p-5 sm:grid-cols-4">
          {summaryRows.map(([label, value, emphasize]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className={emphasize ? 'text-sm font-semibold text-primary' : 'text-sm font-semibold text-foreground'}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
