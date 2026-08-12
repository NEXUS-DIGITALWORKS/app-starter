import RiskItemRow from './RiskItemRow';
import type { RiskCategory, RiskItem, RiskStatus } from '../types';

type Props = {
  category: RiskCategory;
  items: RiskItem[];
  getStatus: (id: number) => RiskStatus;
  onChangeStatus: (id: number, status: RiskStatus) => void;
};

export default function RiskCategorySection({ category, items, getStatus, onChangeStatus }: Props) {
  const passCount = items.filter((item) => getStatus(item.id) === 'pass').length;

  return (
    <section className="rc-category-group">
      <div className="rc-category-head">
        <h2>{category}</h2>
        <span className="rc-cat-count">{items.length} 項目</span>
        <span className="rc-cat-rate">
          適合 {passCount} / {items.length}
        </span>
      </div>
      <div className="rc-items">
        {items.map((item) => (
          <RiskItemRow item={item} status={getStatus(item.id)} onChangeStatus={onChangeStatus} key={item.id} />
        ))}
      </div>
    </section>
  );
}
