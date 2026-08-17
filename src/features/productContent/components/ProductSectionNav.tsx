import { AlertTriangle, Database, FileText, Home, Image, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionKey } from './sectionKeys';

const SECTIONS: { key: SectionKey; label: string; icon: typeof Home }[] = [
  { key: 'overview', label: '商品概要', icon: Home },
  { key: 'features', label: '特徴', icon: Sparkles },
  { key: 'ingredients', label: '成分・原材料', icon: FileText },
  { key: 'usage', label: '使用上の注意', icon: AlertTriangle },
  { key: 'seo', label: 'SEO情報', icon: Search },
  { key: 'images', label: '画像', icon: Image },
  { key: 'metadata', label: '元データ', icon: Database },
];

interface ProductSectionNavProps {
  active: SectionKey;
  onChange: (key: SectionKey) => void;
}

export default function ProductSectionNav({ active, onChange }: ProductSectionNavProps) {
  return (
    <nav aria-label="セクションナビ" className="rounded-xl border border-[#E5E7EB] bg-white p-2">
      <p className="px-2.5 pb-1.5 pt-1 text-xs font-semibold text-[#98A2B3]">セクションナビ</p>
      <ul className="m-0 flex list-none flex-row gap-1 p-0 overflow-x-auto lg:flex-col lg:overflow-visible">
        {SECTIONS.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <li key={key} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  isActive ? 'bg-[#EEF0FE] text-[#3157E5]' : 'text-[#475467] hover:bg-[#F8FAFC] hover:text-[#111827]',
                )}
              >
                <Icon size={17} className="shrink-0" />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
