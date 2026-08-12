import type { TechCategory } from '../types';

type Props = {
  category: TechCategory;
  selectedElementIds: string[];
  onToggle: (categoryId: string, elementId: string) => void;
};

export default function CategorySection({ category, selectedElementIds, onToggle }: Props) {
  return (
    <section className="tss-category" id={`category-${category.id}`}>
      <div className="tss-category-head">
        <span className="tss-category-num">{String(category.order).padStart(2, '0')}</span>
        <h2>{category.title}</h2>
        <span className="tss-category-hint">複数選択可</span>
      </div>
      <div className="tss-element-grid">
        {category.elements.map((element) => {
          const isSelected = selectedElementIds.includes(element.id);
          return (
            <button
              key={element.id}
              type="button"
              className={`tss-element-card${isSelected ? ' is-selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => onToggle(category.id, element.id)}
            >
              <span className="tss-element-name">{element.name}</span>
              <span className="tss-element-desc">{element.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
