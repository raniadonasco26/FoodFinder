import { Sparkles, Plus, Check } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import { formatPeso } from '../utils/filters';

export default function MenuCard({ item, isSelected = false, onToggleEstimate }) {
  return (
    <article className="menu-card gsap-menu-card">
      <div className="menu-card-image">
        <ImageWithFallback src={item.image} alt={item.name} />
        <span className="menu-category-tag">{item.category}</span>
        {item.isBestSeller && (
          <span className="bestseller-tag">
            <Sparkles size={12} />
            <span>Best Seller</span>
          </span>
        )}
      </div>

      <div className="menu-card-body">
        <div className="menu-card-top">
          <h3 className="menu-item-name">{item.name}</h3>
          <span className="menu-item-price">{formatPeso(item.price)}</span>
        </div>

        <p className="menu-item-desc">{item.description}</p>

        <div className="menu-card-footer">
          <span style={{ fontSize: '0.77rem', color: 'var(--color-text-muted)' }}>
            Sample Dine-In Price
          </span>
          {onToggleEstimate && (
            <button
              type="button"
              onClick={() => onToggleEstimate(item)}
              className={`estimator-btn ${isSelected ? 'added' : ''}`}
              aria-pressed={isSelected}
            >
              {isSelected ? <Check size={14} /> : <Plus size={14} />}
              <span>{isSelected ? 'In Budget Tray' : 'Estimate Cost'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
