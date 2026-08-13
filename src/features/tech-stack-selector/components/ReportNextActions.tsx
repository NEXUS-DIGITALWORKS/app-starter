import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Save, ShieldCheck } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  backToSelectorUrl: string;
  saveState: SaveState;
  saveDisabledReason: string | null;
  onSave: () => void;
};

export default function ReportNextActions({ backToSelectorUrl, saveState, saveDisabledReason, onSave }: Props) {
  const saveButtonLabel =
    saveState === 'saved'
      ? '保存しました'
      : saveState === 'saving'
        ? '保存中…'
        : saveState === 'error'
          ? '保存に失敗しました'
          : 'この構成を保存する';

  return (
    <section aria-labelledby="next-action-heading">
      <Card className="flex flex-col gap-5 rounded-2xl bg-muted/40 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground sm:flex"
            aria-hidden="true"
          >
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="next-action-heading" className="text-lg font-semibold text-foreground">
              この構成を、目的に合わせて調整する
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              必要な機能や運用条件に合わせて技術要素を変更し、別の構成パターンと比較できます。
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <Button asChild>
            <Link to={backToSelectorUrl}>
              構成を調整する
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/tools/risk-check">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              リスクをチェックする
            </Link>
          </Button>

          <div className="flex flex-col gap-1.5">
            <Button
              variant="outline"
              onClick={onSave}
              disabled={Boolean(saveDisabledReason) || saveState === 'saving'}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saveButtonLabel}
            </Button>
            {saveDisabledReason && <p className="text-xs text-muted-foreground">{saveDisabledReason}</p>}
          </div>
        </div>
      </Card>
    </section>
  );
}
