import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CATEGORY_TYPE_LABEL } from '../lib/categoryName';
import type { CategoryType } from '../types';

const CATEGORY_TYPE_CLASS: Record<CategoryType, string> = {
  standard: 'border-transparent bg-[#EEF0F4] text-[#475467]',
  purpose: 'border-transparent bg-[#ECFDF5] text-[#059669]',
  feature: 'border-transparent bg-[#EAF1FF] text-[#3157E5]',
  campaign: 'border-transparent bg-[#FEF3F2] text-[#B42318]',
  theme: 'border-transparent bg-[#FFFBEB] text-[#B45309]',
  special: 'border-transparent bg-[#F3EEFF] text-[#6941C6]',
};

const CATEGORY_TYPE_DOT_CLASS: Record<CategoryType, string> = {
  standard: 'bg-[#98A2B3]',
  purpose: 'bg-[#059669]',
  feature: 'bg-[#3157E5]',
  campaign: 'bg-[#B42318]',
  theme: 'bg-[#B45309]',
  special: 'bg-[#6941C6]',
};

interface CategoryBadgeProps {
  categoryType: CategoryType;
  variant?: 'pill' | 'dot';
}

// variant="dot": カテゴリツリーの子階層など横幅が限られる場所向けの省スペース表示。
// 色のみで種別を示し、ラベルはtitle属性のツールチップで確認できる。
export default function CategoryBadge({ categoryType, variant = 'pill' }: CategoryBadgeProps) {
  if (variant === 'dot') {
    return (
      <span
        className={cn('inline-block h-2 w-2 shrink-0 rounded-full', CATEGORY_TYPE_DOT_CLASS[categoryType])}
        title={CATEGORY_TYPE_LABEL[categoryType]}
        aria-label={CATEGORY_TYPE_LABEL[categoryType]}
      />
    );
  }
  return <Badge className={CATEGORY_TYPE_CLASS[categoryType]}>{CATEGORY_TYPE_LABEL[categoryType]}</Badge>;
}
