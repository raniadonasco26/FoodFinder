import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Flame,
  Soup,
  Sparkles,
  CookingPot,
  Coffee,
  CakeSlice,
  Pizza,
  ArrowUpRight,
} from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const ICON_MAP = {
  UtensilsCrossed,
  Flame,
  Soup,
  Sparkles,
  CookingPot,
  Coffee,
  CakeSlice,
  Pizza,
};

export default function CategoryCard({ category, count }) {
  const IconComponent = ICON_MAP[category.icon] || UtensilsCrossed;

  return (
    <Link
      to={`/explore?category=${encodeURIComponent(category.id)}`}
      className="category-card gsap-category-card"
    >
      <div className="category-image-wrap">
        <ImageWithFallback src={category.image} alt={`${category.name} dining category`} />
        <span className="category-icon-badge" aria-hidden="true">
          <IconComponent size={19} strokeWidth={2} />
        </span>
        <span className="category-count-badge">
          {count} {count === 1 ? 'Spot' : 'Spots'}
        </span>
      </div>
      <div className="category-body">
        <div>
          <h3 className="category-name">{category.name}</h3>
          <p className="category-sub">{category.subtitle}</p>
        </div>
        <span className="category-arrow" aria-hidden="true">
          <ArrowUpRight size={17} />
        </span>
      </div>
    </Link>
  );
}
