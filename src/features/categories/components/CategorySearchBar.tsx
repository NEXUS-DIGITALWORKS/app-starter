import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CategorySearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategorySearchBar({ value, onChange }: CategorySearchBarProps) {
  return (
    <div className="relative">
      <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="コード・名称で検索"
        className="h-9 pl-8 pr-8 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="検索をクリア"
          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[#98A2B3] hover:bg-[#F8FAFC]"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
