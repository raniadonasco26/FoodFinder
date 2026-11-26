import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, BookOpen, ArrowRight, Utensils } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import { formatPeso } from '../utils/filters';

export default function RestaurantCard({
  restaurant,
  viewMode = 'grid',
  isSaved = false,
  onToggleSave,
}) {
  return (
    <article
      className={`restaurant-card gsap-restaurant-card ${
        viewMode === 'list' ? 'list-mode' : ''
      }`}
    >
      <div className="restaurant-card-media">
        <ImageWithFallback
          src={restaurant.coverImage}
          alt={`${restaurant.name} — ${restaurant.cuisine}`}
        />

        <div className="card-badges-top">
          <span className="cuisine-badge">{restaurant.category}</span>
          {onToggleSave && (
            <button
              type="button"
              className={`fav-toggle-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => onToggleSave(restaurant.id, restaurant.name)}
              aria-label={
                isSaved
                  ? `Remove ${restaurant.name} from saved restaurants`
                  : `Save ${restaurant.name} to favorites`
              }
              aria-pressed={isSaved}
            >
              <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <div className="card-badges-bottom">
          <span className="rating-pill" aria-label={`Sample rating ${restaurant.rating} out of 5`}>
            <Star size={14} className="rating-star" />
            <span>{restaurant.rating.toFixed(1)}</span>
            <span style={{ opacity: 0.75, fontWeight: 400 }}>({restaurant.reviewCount})</span>
          </span>
          <span className="distance-pill">{restaurant.distanceKm} km away</span>
        </div>
      </div>

      <div className="restaurant-card-body">
        <div className="restaurant-card-header">
          <h3 className="restaurant-card-title">
            <Link to={`/restaurant/${restaurant.id}`}>{restaurant.name}</Link>
          </h3>
          <span className="price-tier-badge" title="Price Tier">
            {restaurant.priceTier}
          </span>
        </div>

        <div className="restaurant-card-meta">
          <div className="meta-row">
            <Utensils size={15} />
            <span>{restaurant.cuisine}</span>
          </div>
          <div className="meta-row">
            <MapPin size={15} />
            <span>{restaurant.location} · {restaurant.landmark}</span>
          </div>
        </div>

        {restaurant.matchedDish && (
          <div className="matched-dish-note">
            Menu Match: <strong>{restaurant.matchedDish.name}</strong> (
            {formatPeso(restaurant.matchedDish.price)})
          </div>
        )}

        <div className="price-highlight-box">
          <span className="price-highlight-label">Menu Price Range</span>
          <span className="price-highlight-value">{restaurant.priceRangeLabel}</span>
        </div>

        <div className="restaurant-card-actions">
          <Link
            to={`/restaurant/${restaurant.id}#menu`}
            className="btn btn-secondary btn-sm"
          >
            <BookOpen size={15} />
            <span>View Menu</span>
          </Link>
          <Link to={`/restaurant/${restaurant.id}`} className="btn btn-primary btn-sm">
            <span>View Details</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
