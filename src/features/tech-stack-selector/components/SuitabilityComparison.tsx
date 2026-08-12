import { CheckCircle2, CircleAlert } from 'lucide-react';
import { Card } from '../../../components/ui/card';

type Props = {
  suitableCases: string[];
  unsuitableCases: string[];
};

export default function SuitabilityComparison({ suitableCases, unsuitableCases }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="rounded-2xl border-success/30 bg-success/5 p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-base font-semibold text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          向いているケース
        </h3>
        <ul className="flex list-disc flex-col gap-1 pl-4 marker:text-success">
          {suitableCases.map((item) => (
            <li key={item} className="text-sm leading-7 text-foreground">
              {item}
            </li>
          ))}
        </ul>
      </Card>
      <Card className="rounded-2xl border-warning/30 bg-warning/5 p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-base font-semibold text-warning">
          <CircleAlert className="h-4 w-4" aria-hidden="true" />
          別構成も検討したいケース
        </h3>
        <ul className="flex list-disc flex-col gap-1 pl-4 marker:text-warning">
          {unsuitableCases.map((item) => (
            <li key={item} className="text-sm leading-7 text-foreground">
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
