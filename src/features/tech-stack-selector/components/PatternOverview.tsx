import { Card } from '../../../components/ui/card';
import type { PatternDetail } from '../data/patternDetails';

type Props = {
  detail: PatternDetail;
};

export default function PatternOverview({ detail }: Props) {
  return (
    <>
      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-secondary-foreground">この構成で作れるもの</h3>
        <p className="text-sm leading-relaxed text-foreground">{detail.whatYouCanBuild}</p>
      </Card>
      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-secondary-foreground">なぜこの構成が向いているか</h3>
        {detail.whyRecommended.map((paragraph) => (
          <p key={paragraph} className="mb-3 text-sm leading-relaxed text-foreground last:mb-0">
            {paragraph}
          </p>
        ))}
      </Card>
    </>
  );
}
