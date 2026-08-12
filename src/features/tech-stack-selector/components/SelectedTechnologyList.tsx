import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Database,
  FolderArchive,
  Layers3,
  Monitor,
  Palette,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { badgeVariants } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';
import { CATEGORIES } from '../data/categories';
import type { Selection } from '../types';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  frontend: Monitor,
  'mobile-desktop': Layers3,
  backend: Server,
  database: Database,
  orm: Wrench,
  auth: ShieldCheck,
  storage: FolderArchive,
  ai: Sparkles,
  hosting: Rocket,
  'dev-approach': Wrench,
  'ui-design': Palette,
};

type Props = {
  selection: Selection;
  selectedCount: number;
};

export default function SelectedTechnologyList({ selection, selectedCount }: Props) {
  const categoriesWithSelection = CATEGORIES.map((category) => {
    const elementIds = selection[category.id] ?? [];
    const elements = elementIds
      .map((id) => category.elements.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e));
    return { category, elements };
  }).filter(({ elements }) => elements.length > 0);

  return (
    <section
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
      aria-labelledby="selected-tech-heading"
    >
      <h2 id="selected-tech-heading" className="text-lg font-semibold text-foreground">
        選択した技術要素（{selectedCount}）
      </h2>
      <div className="flex flex-col">
        {categoriesWithSelection.map(({ category, elements }) => {
          const Icon = CATEGORY_ICONS[category.id] ?? Layers3;
          return (
            <div
              key={category.id}
              className="flex flex-col gap-2 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                {category.title}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {elements.map((element) => (
                  <Link
                    key={element.id}
                    to={`/tools/tech-guide#guide-element-${element.id}`}
                    title={element.description}
                    className={cn(badgeVariants({ variant: 'secondary' }), 'hover:opacity-80')}
                  >
                    {element.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
