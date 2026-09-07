import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SkuListFilterDialogProps {
  value: string[];
  onApply: (skus: string[]) => void;
}

// 改行・カンマ・スペース区切りで貼り付けたSKU群をパースする（Excel等からのコピペを想定）。
// SQL文やCSVからの貼り付けでは各値がシングル/ダブルクオートで囲まれていることがあるため、
// トークンの前後に残ったクオートは値の一部ではなく区切り由来のノイズとして取り除く。
function parseSkuList(text: string): string[] {
  const skus = text
    .split(/[\s,、]+/)
    .map((s) => s.trim().replace(/^['"]+|['"]+$/g, ''))
    .filter(Boolean);
  return [...new Set(skus)];
}

// 数十〜百件規模のSKUを一括指定して抽出したいケース向け。トリガーは指定件数を表示するボタン、
// ダイアログ内はテキストエリアへの貼り付け→「適用」で filters.skuList（完全一致・OR条件）を確定する。
export default function SkuListFilterDialog({ value, onApply }: SkuListFilterDialogProps) {
  const [draft, setDraft] = useState(() => value.join('\n'));

  const label = value.length === 0 ? 'SKU一括指定' : `${value.length}件指定中`;
  const parsedCount = parseSkuList(draft).length;

  return (
    <Dialog onOpenChange={(open) => open && setDraft(value.join('\n'))}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 w-[180px] justify-between border-[#D0D5DD] font-normal text-[#344054]">
          <span className="truncate">{label}</span>
          <ChevronDown size={14} className="shrink-0 text-[#98A2B3]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>SKUを一括指定して絞り込み</DialogTitle>
        </DialogHeader>

        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={'SKUを改行・カンマ・スペース区切りで貼り付け\n例:\nSKU00001\nSKU00002\nSKU00003'}
          className="h-48 resize-none font-mono text-sm"
          aria-label="SKUを一括指定"
        />
        <p className="text-xs text-[#98A2B3]">{parsedCount}件のSKUとして認識されています</p>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDraft('')}
            disabled={draft.length === 0}
            className="text-[#475467]"
          >
            クリア
          </Button>
          <DialogClose asChild>
            <Button type="button" size="sm" onClick={() => onApply(parseSkuList(draft))}>
              適用
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
