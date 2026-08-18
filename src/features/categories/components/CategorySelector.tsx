import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryDisplayName } from '../lib/categoryName';
import type { Category } from '../types';

interface CategorySelectorProps {
  categories: Category[];
  excludeIds?: string[];
  onSelect: (category: Category) => void;
  placeholder?: string;
}

// カテゴリ検索コンボボックス。Radix Popover/Command等の新規依存を増やさず、
// Input + ローカル開閉stateで実装する（select.tsx等既存のフローティングUIと見た目を揃える）。
export default function CategorySelector({ categories, excludeIds = [], onSelect, placeholder }: CategorySelectorProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const results = useMemo(() => {
    const excluded = new Set(excludeIds);
    const q = query.trim().toLowerCase();
    return categories
      .filter((c) => c.isActive && !excluded.has(c.id))
      .filter((c) => {
        if (!q) return true;
        const haystack = [c.code, c.nameJa, c.nameEn, c.nameZhTw].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 30);
  }, [categories, excludeIds, query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder ?? 'コード・名称でカテゴリを検索'}
          className="h-9 w-full rounded-md border border-[#D0D5DD] bg-white pl-8 pr-3 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157E5]"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-64 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-[0_4px_16px_rgba(16,24,40,0.12)]">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[#98A2B3]">該当するカテゴリがありません</p>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c);
                  setQuery('');
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-[#344054] hover:bg-[#F8FAFC]',
                )}
              >
                <span className="shrink-0 font-mono text-xs text-[#98A2B3]">{c.code}</span>
                <span className="min-w-0 flex-1 truncate">{getCategoryDisplayName(c)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
