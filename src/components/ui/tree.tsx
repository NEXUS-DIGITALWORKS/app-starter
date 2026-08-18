import * as React from 'react';
import { cn } from '@/lib/utils';

// Radix未導入のため依存追加を避け、role="tree"/"treeitem"を素朴なdiv/buttonで実装する
// 汎用プリミティブ。カテゴリツリー固有の見た目（コード・商品件数バッジ等）は呼び出し側
// （src/features/categories/components/CategoryTreeNode.tsx）で組み立てる。

const Tree = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} role="tree" className={cn('flex flex-col', className)} {...props} />
));
Tree.displayName = 'Tree';

export interface TreeItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  depth?: number;
  selected?: boolean;
}

const TreeItem = React.forwardRef<HTMLButtonElement, TreeItemProps>(
  ({ className, depth = 0, selected, style, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="treeitem"
      aria-selected={selected}
      style={{ paddingLeft: `${8 + depth * 16}px`, ...style }}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-sm transition-colors',
        selected ? 'bg-[#EEF0FE] text-[#3157E5] font-medium' : 'text-[#344054] hover:bg-[#F8FAFC]',
        className,
      )}
      {...props}
    />
  ),
);
TreeItem.displayName = 'TreeItem';

export { Tree, TreeItem };
