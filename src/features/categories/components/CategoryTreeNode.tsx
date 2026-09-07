import { ChevronRight, EyeOff } from 'lucide-react';
import { TreeItem } from '@/components/ui/tree';
import { cn } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import { formatCategoryCode, getCategoryDisplayName } from '../lib/categoryName';
import type { CategoryTreeNode as CategoryTreeNodeType } from '../types';

interface CategoryTreeNodeProps {
  node: CategoryTreeNodeType;
  depth: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  visibleIds: Set<string> | null;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export default function CategoryTreeNode({
  node,
  depth,
  selectedId,
  expandedIds,
  visibleIds,
  onSelect,
  onToggleExpand,
}: CategoryTreeNodeProps) {
  if (visibleIds && !visibleIds.has(node.id)) return null;

  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const displayName = getCategoryDisplayName(node);
  // 深い階層では横幅が逼迫し名称が読めなくなるため、コードは3階層目以降表示を省略する
  // （情報自体はtitleツールチップと詳細パネルで確認できる）。
  const showCode = depth < 3;

  return (
    <div role="group" className={depth > 0 ? 'ml-2.5 border-l border-[#E5E7EB] pl-1.5' : undefined}>
      <TreeItem selected={selectedId === node.id} onClick={() => onSelect(node.id)}>
        <span
          role="button"
          tabIndex={-1}
          aria-label={isExpanded ? '折りたたむ' : '展開する'}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleExpand(node.id);
          }}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded transition-transform',
            hasChildren ? 'hover:bg-[#E5E7EB]' : 'invisible',
            isExpanded && 'rotate-90',
          )}
        >
          {hasChildren && <ChevronRight size={14} />}
        </span>
        {showCode && <span className="shrink-0 font-mono text-xs text-[#667085]">{formatCategoryCode(node.code)}</span>}
        <span
          className={cn('min-w-[4ch] flex-1 truncate', !node.isActive && 'text-[#98A2B3]')}
          title={`${formatCategoryCode(node.code)}  ${displayName}`}
        >
          {displayName}
        </span>
        {!node.isActive && <EyeOff size={13} className="shrink-0 text-[#98A2B3]" aria-label="非公開" />}
        <CategoryBadge categoryType={node.categoryType} variant="dot" />
        <span className="shrink-0 text-xs tabular-nums text-[#98A2B3]">{node.productCount}</span>
      </TreeItem>

      {hasChildren && isExpanded && (
        <div role="group">
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              visibleIds={visibleIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
