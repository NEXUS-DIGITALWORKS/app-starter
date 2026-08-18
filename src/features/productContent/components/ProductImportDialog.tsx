import { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { countExistingSkus, importProductsFromFile, previewProductImportFile, type ImportProgress } from '../api/productsImportApi';
import type { ProductImportResult, ProductImportRow } from '../types/productImport';

type Step = 'select' | 'preview' | 'importing' | 'done';

const MAX_VISIBLE_ERRORS = 8;

interface ProductImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export default function ProductImportDialog({ open, onOpenChange, onImported }: ProductImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('select');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ProductImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [existingCount, setExistingCount] = useState<number | null>(null);
  const [isCountingExisting, setIsCountingExisting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ProductImportResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reset = () => {
    setStep('select');
    setFileName('');
    setFile(null);
    setRows([]);
    setParseErrors([]);
    setExistingCount(null);
    setIsCountingExisting(false);
    setProgress(null);
    setResult(null);
    setLoadError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFileSelect = async (selected: File | null) => {
    if (!selected) return;
    setFileName(selected.name);
    setFile(selected);
    setLoadError(null);
    setExistingCount(null);
    try {
      const parsed = await previewProductImportFile(selected);
      setRows(parsed.rows);
      setParseErrors(parsed.errors);
      setStep('preview');

      if (parsed.rows.length > 0) {
        setIsCountingExisting(true);
        try {
          setExistingCount(await countExistingSkus(parsed.rows.map((r) => r.sku)));
        } finally {
          setIsCountingExisting(false);
        }
      }
    } catch (e) {
      setLoadError(`ファイルを読み込めませんでした: ${(e as Error).message}`);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setStep('importing');
    setProgress({ processedRows: 0, totalRows: rows.length });
    try {
      const res = await importProductsFromFile(file, setProgress);
      setResult(res);
      setStep('done');
      if (res.importedCount > 0) onImported();
    } catch (e) {
      setLoadError(`取込に失敗しました: ${(e as Error).message}`);
      setStep('preview');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>商品データ取込</DialogTitle>
          <DialogDescription>
            Magentoエクスポート形式のJSON（商品オブジェクトの配列）またはCSV（1行目が見出し、sku・name列必須）ファイルを選択してください。SKUが一致する既存商品は値のある項目のみ更新され、ファイルに無い項目は既存の値を維持します。
          </DialogDescription>
        </DialogHeader>

        {loadError && (
          <Alert variant="destructive">
            <AlertTriangle size={16} />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {(step === 'select' || step === 'preview') && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,application/json,text/csv"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
            <Button
              variant="outline"
              className="w-full border-dashed border-[#D0D5DD] text-[#475467]"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} />
              {fileName || 'JSON / CSVファイルを選択'}
            </Button>

            {step === 'preview' && (
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-sm text-[#344054]">
                <p>
                  <span className="font-semibold text-[#111827]">{rows.length}件</span> の商品を読み込みました
                  {parseErrors.length > 0 && (
                    <span className="text-[#B54708]">（スキップ・警告 {parseErrors.length}件）</span>
                  )}
                  。
                </p>
                <p className="mt-1 text-xs text-[#667085]">
                  {isCountingExisting ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 size={11} className="animate-spin" />
                      既存SKUを確認中...
                    </span>
                  ) : (
                    existingCount !== null && (
                      <>
                        内訳: 新規 <span className="font-medium text-[#111827]">{rows.length - existingCount}件</span> /
                        更新 <span className="font-medium text-[#111827]">{existingCount}件</span>
                        （更新される商品は、取込ファイルに値が無い項目は既存の値を維持します）
                      </>
                    )
                  )}
                </p>
                {parseErrors.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-[#98A2B3]">
                    {parseErrors.slice(0, MAX_VISIBLE_ERRORS).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parseErrors.length > MAX_VISIBLE_ERRORS && <li>ほか {parseErrors.length - MAX_VISIBLE_ERRORS}件</li>}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-sm text-[#344054]">
              <Loader2 size={16} className="animate-spin text-[#3157E5]" />
              取込中... {progress?.processedRows ?? 0} / {progress?.totalRows ?? 0}件
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#F2F4F7]">
              <div
                className="h-full rounded-full bg-[#3157E5] transition-all"
                style={{
                  width: `${progress && progress.totalRows > 0 ? Math.round((progress.processedRows / progress.totalRows) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {step === 'done' && result && (
          <div className="space-y-3">
            <Alert variant={result.failedCount > 0 ? 'warning' : 'success'}>
              {result.failedCount > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              <AlertTitle>取込が完了しました</AlertTitle>
              <AlertDescription>
                {result.importedCount}件を登録・更新しました
                {result.failedCount > 0 && `（失敗 ${result.failedCount}件）`}。
              </AlertDescription>
            </Alert>
            {result.batchErrors.length > 0 && (
              <ul className="list-disc space-y-0.5 rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] p-3 pl-6 text-xs text-[#B42318]">
                {result.batchErrors.map((be, i) => (
                  <li key={i}>
                    {be.skus.length}件（例: {be.skus.slice(0, 3).join(', ')}）: {be.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="border-[#D0D5DD] text-[#475467]">
            {step === 'done' ? '閉じる' : 'キャンセル'}
          </Button>
          {step === 'preview' && (
            <Button
              onClick={handleImport}
              disabled={rows.length === 0}
              className="bg-[#3157E5] hover:bg-[#2748C7] hover:opacity-100"
            >
              {rows.length}件を取り込む
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
