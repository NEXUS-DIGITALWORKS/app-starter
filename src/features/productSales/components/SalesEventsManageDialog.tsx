import { useEffect, useState } from 'react';
import { AlertTriangle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { createSalesEvent, deleteSalesEvent, fetchSalesEvents, updateSalesEvent } from '../api/salesEventsApi';
import type { SalesEvent, SalesEventInput } from '../types/salesEvents';

interface SalesEventsManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}

const EMPTY_FORM: SalesEventInput = { name: '', startDate: '', endDate: '' };

function formatRange(event: SalesEvent): string {
  return `${event.startDate} 〜 ${event.endDate}`;
}

export default function SalesEventsManageDialog({ open, onOpenChange, onChanged }: SalesEventsManageDialogProps) {
  const [events, setEvents] = useState<SalesEvent[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SalesEventInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadEvents = () => {
    fetchSalesEvents().then(setEvents);
  };

  useEffect(() => {
    if (open) loadEvents();
  }, [open]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleEdit = (event: SalesEvent) => {
    setEditingId(event.id);
    setForm({ name: event.name, startDate: event.startDate, endDate: event.endDate });
    setError(null);
  };

  const handleDelete = async (event: SalesEvent) => {
    if (!window.confirm(`「${event.name}」を削除します。よろしいですか？`)) return;
    await deleteSalesEvent(event.id);
    if (editingId === event.id) resetForm();
    loadEvents();
    onChanged?.();
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    if (!name) {
      setError('イベント名を入力してください');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError('開始日・終了日を入力してください');
      return;
    }
    if (form.endDate < form.startDate) {
      setError('終了日は開始日以降にしてください');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const input: SalesEventInput = { name, startDate: form.startDate, endDate: form.endDate };
      if (editingId) {
        await updateSalesEvent(editingId, input);
      } else {
        await createSalesEvent(input);
      }
      resetForm();
      loadEvents();
      onChanged?.();
    } catch (e) {
      setError(`保存に失敗しました: ${(e as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>イベント管理</DialogTitle>
          <DialogDescription>
            フェア・キャンペーン等の期間を登録すると、商品詳細の売上推移グラフに背景として重ねて表示されます（全商品共通）。
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle size={16} />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3">
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="イベント名（例: 栃木フェア）"
            aria-label="イベント名"
          />
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              aria-label="開始日"
              className="flex-1"
              min="1000-01-01"
              max="9999-12-31"
            />
            <span className="text-xs text-[#98A2B3]">〜</span>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              aria-label="終了日"
              className="flex-1"
              min="1000-01-01"
              max="9999-12-31"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="text-[#475467]">
                <X size={14} />
                キャンセル
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-[#3157E5] hover:bg-[#2748C7] hover:opacity-100"
            >
              <Plus size={14} />
              {editingId ? '更新する' : '追加する'}
            </Button>
          </div>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {events === null && <p className="text-sm text-[#667085]">読み込み中...</p>}
          {events !== null && events.length === 0 && <p className="text-sm text-[#667085]">登録済みのイベントはありません。</p>}
          {events?.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#E5E7EB] bg-white p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#111827]">{event.name}</p>
                <p className="text-xs text-[#98A2B3]">{formatRange(event)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#475467]"
                  onClick={() => handleEdit(event)}
                  aria-label="編集"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#B42318] hover:bg-[#FEF3F2] hover:text-[#B42318]"
                  onClick={() => handleDelete(event)}
                  aria-label="削除"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="border-[#D0D5DD] text-[#475467]">
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
