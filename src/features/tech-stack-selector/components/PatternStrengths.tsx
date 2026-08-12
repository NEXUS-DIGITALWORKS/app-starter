import { CheckCircle2 } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import type { PatternDetail } from '../data/patternDetails';

type Props = {
  detail: PatternDetail;
};

export default function PatternStrengths({ detail }: Props) {
  return (
    <Card className="rounded-2xl p-6 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-secondary-foreground">この構成の強み</h3>
      <ul className="flex flex-col gap-2.5">
        {detail.strengths.map((strength) => (
          <li key={strength} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <span>{strength}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
