import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ListTree, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import CategoryTree from '../components/CategoryTree';
import CategoryDetailPanel from '../components/CategoryDetailPanel';
import CategoryEditor from '../components/CategoryEditor';
import { useCategoryManagement } from '../hooks/useCategoryManagement';
import { isSupabaseConfigured } from '../../../lib/supabaseClient';

export default function CategoryManagementPage() {
  const state = useCategoryManagement();
  const [treeSheetOpen, setTreeSheetOpen] = useState(false);
  const [editorSheetOpen, setEditorSheetOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // カテゴリ改善候補ページ（/app/categories/improvements）などから
  // ?code=<カテゴリコード> でこの画面に来た場合、該当カテゴリを自動選択する。
  const appliedCodeParam = useRef(false);
  useEffect(() => {
    if (appliedCodeParam.current) return;
    const code = searchParams.get('code');
    if (!code || state.categories.length === 0) return;
    const target = state.categories.find((c) => c.code === code);
    if (target) {
      state.select(target.id);
      appliedCodeParam.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, state.categories]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center text-sm text-[#667085]">
        <p className="font-medium text-[#111827]">Supabaseが未設定です</p>
        <p>カテゴリ管理機能を利用するには .env に VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY を設定してください。</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111827]">カテゴリ管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 border-[#D0D5DD] text-[#475467]" asChild>
            <Link to="/app/categories/improvements">
              <Sparkles size={14} />
              改善候補
            </Link>
          </Button>
          <div className="flex gap-2 lg:hidden">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTreeSheetOpen(true)}>
              <ListTree size={14} />
              カテゴリを選ぶ
            </Button>
            {state.selectedCategory && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditorSheetOpen(true)}>
                <SlidersHorizontal size={14} />
                編集
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="hidden w-[280px] shrink-0 rounded-xl border border-[#E5E7EB] bg-white p-3 lg:block">
          <CategoryTree state={state} />
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto pb-4">
          <CategoryDetailPanel state={state} />
        </div>

        <div className="hidden w-[320px] shrink-0 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-4 lg:block">
          <CategoryEditor state={state} />
        </div>
      </div>

      <Sheet open={treeSheetOpen} onOpenChange={setTreeSheetOpen}>
        <SheetContent side="left" className="w-[min(320px,88vw)] p-3">
          <SheetHeader className="sr-only">
            <SheetTitle>カテゴリツリー</SheetTitle>
          </SheetHeader>
          <div className="h-full pt-8">
            <CategoryTree state={state} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={editorSheetOpen} onOpenChange={setEditorSheetOpen}>
        <SheetContent side="right" className="w-[min(360px,90vw)] overflow-y-auto p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>カテゴリ編集</SheetTitle>
          </SheetHeader>
          <div className="pt-8">
            <CategoryEditor state={state} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
