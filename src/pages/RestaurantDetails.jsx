import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Wallet,
  Navigation,
  Heart,
  Search,
  Info,
  X,
  Utensils,
  Calculator,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { gsap, prefersReducedMotion } from '../hooks/useGsapSetup';
import { RESTAURANTS } from '../data/restaurants';
import { MENU_CATEGORIES, getMenuByRestaurantId } from '../data/menus';
import { filterMenuItems, formatPeso } from '../utils/filters';
import ImageWithFallback from '../components/ImageWithFallback';
import MenuCard from '../components/MenuCard';
import DirectionsModal from '../components/DirectionsModal';
import { fetchOsmRestaurant, isOsmRestaurantId } from '../services/restaurantApi';
import { isInCebuCity } from '../data/cebuCity';

export default function RestaurantDetails({ savedIds, onToggleSave }) {
  const { id } = useParams();
  const location = useLocation();
  const pageRef = useRef(null);
  const menuGridRef = useRef(null);

  const isLive = isOsmRestaurantId(id);
  const fromMap = location.state?.osmRestaurant;
  const markerRestaurant = isLive && fromMap?.id === id && isInCebuCity(fromMap.lat, fromMap.lon)
    ? fromMap : null;
  const [lookup, setLookup] = useState(null);
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const currentLookup = lookup?.id === id && lookup?.attempt === lookupAttempt ? lookup : null;
  const restaurant = isLive
    ? markerRestaurant || currentLookup?.restaurant
    : RESTAURANTS.find((item) => item.id === id);
  const menuLink = isLive && (restaurant?.menuUrl || restaurant?.website);

  useEffect(() => {
    if (!isLive || markerRestaurant) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const restaurant = await fetchOsmRestaurant(id, controller.signal);
        if (!controller.signal.aborted) setLookup({ id, attempt: lookupAttempt, restaurant });
      } catch {
        if (!controller.signal.aborted) setLookup({ id, attempt: lookupAttempt, error: true });
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [id, isLive, markerRestaurant, lookupAttempt]);
  const allMenuItems = useMemo(() => getMenuByRestaurantId(id), [id]);

  const [menuCategory, setMenuCategory] = useState('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [showDirections, setShowDirections] = useState(false);
  const [estimatedItems, setEstimatedItems] = useState([]);

  useEffect(() => {
    setMenuCategory('All');
    setMenuSearch('');
    setEstimatedItems([]);
  }, [id]);

  useEffect(() => {
    if (location.hash === '#menu') {
      const timer = setTimeout(() => {
        const el = document.getElementById('menu');
        if (el) {
          el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash, id, restaurant]);

  const filteredMenu = useMemo(
    () =>
      filterMenuItems(allMenuItems, {
        category: menuCategory,
        searchQuery: menuSearch,
      }),
    [allMenuItems, menuCategory, menuSearch]
  );

  const priceStats = useMemo(() => {
    if (!allMenuItems.length) return { min: 0, max: 0 };
    const prices = allMenuItems.map((m) => m.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [allMenuItems]);

  useLayoutEffect(() => {
    if (!restaurant || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.gsap-details-reveal', {
        y: 22,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, pageRef);
    return () => ctx.revert();
  }, [restaurant]);

  useLayoutEffect(() => {
    if (!restaurant || prefersReducedMotion() || !menuGridRef.current) return;
    const ctx = gsap.context(() => {
      const cards = menuGridRef.current.querySelectorAll('.gsap-menu-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.045,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          }
        );
      }
    }, menuGridRef);
    return () => ctx.revert();
  }, [restaurant, menuCategory]);

  if (!restaurant) {
    return (
      <section className="section">
        <div className="container">
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Utensils size={28} />
            </div>
            <h1 className="editorial-serif" style={{ fontSize: '1.8rem', marginBottom: '10px' }}>
              {isLive && !currentLookup ? 'Loading restaurant…'
                : currentLookup?.error ? 'Couldn’t load restaurant' : 'Restaurant Not Found'}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '22px' }}>
              {isLive
                ? currentLookup?.error ? 'The OpenStreetMap restaurant request failed.'
                  : currentLookup ? 'No matching OpenStreetMap restaurant was found.' : 'Retrieving the OpenStreetMap profile.'
                : "We couldn't locate that demonstration restaurant profile."}
            </p>
            {currentLookup?.error && (
              <button type="button" className="btn btn-secondary" onClick={() => setLookupAttempt(value => value + 1)}>
                Retry
              </button>
            )}{' '}
            <Link to="/explore" className="btn btn-primary">
              <ArrowLeft size={16} />
              <span>Back to Explore Restaurants</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const isSaved = savedIds.includes(restaurant.id);

  const handleToggleEstimate = (menuItem) => {
    setEstimatedItems((prev) => {
      const exists = prev.some((entry) => entry.id === menuItem.id);
      if (exists) {
        return prev.filter((entry) => entry.id !== menuItem.id);
      }
      return [...prev, menuItem];
    });
  };

  const estimatedTotal = estimatedItems.reduce((sum, item) => sum + item.price, 0);

  const getCategoryCount = (cat) => {
    if (cat === 'All') return allMenuItems.length;
    if (cat === 'Best Sellers') {
      return allMenuItems.filter((i) => i.isBestSeller).length;
    }
    return allMenuItems.filter((i) => i.category === cat).length;
  };

  return (
    <div ref={pageRef}>
      {/* DEMONSTRATION NOTICE BANNER */}
      <div className="demo-disclaimer-banner">
        <div className="container demo-disclaimer-inner">
          <Info size={15} />
          {isLive ? <span>Restaurant information from OpenStreetMap</span> : (
            <span>
              <strong>Demonstration Data:</strong> Restaurant details, opening hours, and
              Philippine Peso (₱) menu prices shown below are simulated samples, not
              verified live information.
            </span>
          )}
        </div>
      </div>

      {/* RESTAURANT PROFILE HEADER */}
      <section className="details-hero">
        <div className="container">
          <div className="breadcrumb-row gsap-details-reveal">
            <Link to="/explore" className="back-link">
              <ArrowLeft size={17} />
              <span>Back to Explore Restaurants</span>
            </Link>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {restaurant.tags.map((tag) => (
                <span key={tag} className="quick-tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="details-header-grid">
            <div className="details-cover-wrap gsap-details-reveal">
              <ImageWithFallback
                src={restaurant.coverImage}
                alt={isLive ? `Photo unavailable for ${restaurant.name}` : `${restaurant.name} dining room and signature dishes`}
                loading="eager"
              />
            </div>

            <div className="gsap-details-reveal">
              <div className="details-info-badges">
                <span className="eyebrow" style={{ marginBottom: 0 }}>
                  {restaurant.category}
                </span>
                {!isLive && <span className="rating-pill">
                  <Star size={14} className="rating-star" />
                  <span>{restaurant.rating.toFixed(1)} Sample Rating</span>
                  <span style={{ opacity: 0.78 }}>({restaurant.reviewCount})</span>
                </span>}
                {!isLive && <span className="price-tier-badge">
                  {restaurant.priceTier} · {restaurant.priceRangeLabel}
                </span>}
              </div>

              <h1 className="details-title">{restaurant.name}</h1>
              <p
                style={{
                  fontWeight: 600,
                  color: 'var(--color-primary-deep)',
                  marginBottom: '10px',
                  fontSize: '0.96rem',
                }}
              >
                {restaurant.cuisine || 'Cuisine unavailable'}
              </p>
              <p className="details-description">{restaurant.description}</p>

              <div className="details-specs-grid">
                <div className="spec-item">
                  <MapPin size={18} />
                  <div>
                    <p className="spec-label">{isLive ? 'Address' : 'Sample Address'}</p>
                    <p className="spec-value">{restaurant.address || 'Not available'}</p>
                  </div>
                </div>

                <div className="spec-item">
                  <Clock size={18} />
                  <div>
                    <p className="spec-label">{isLive ? 'Opening Hours' : 'Opening Hours (Mock)'}</p>
                    <p className="spec-value">{restaurant.openingHours || 'Not available'}</p>
                  </div>
                </div>

                <div className="spec-item">
                  {isLive ? <Phone size={18} /> : <Wallet size={18} />}
                  <div>
                    <p className="spec-label">{isLive ? 'Phone' : 'Menu Price Range'}</p>
                    <p className="spec-value">
                      {isLive ? restaurant.phone || 'Not available'
                        : <>{restaurant.priceRangeLabel} (Avg {formatPeso(restaurant.avgMealPrice)})</>}
                    </p>
                  </div>
                </div>

                <div className="spec-item">
                  {isLive ? <ExternalLink size={18} /> : <Navigation size={18} />}
                  <div>
                    <p className="spec-label">{isLive ? 'Website' : 'Distance & Landmark'}</p>
                    <p className="spec-value">
                      {isLive ? (restaurant.website
                        ? <a href={restaurant.website} target="_blank" rel="noopener noreferrer">Visit website</a>
                        : 'Not available')
                        : <>{restaurant.distanceKm} km · {restaurant.landmark}</>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="details-cta-row">
                <a href="#menu" className="btn btn-primary">
                  <span>{isLive ? 'View Menu' : 'Explore Menu & Prices'}</span>
                </a>
                {!isLive && <>
                <button
                  type="button"
                  onClick={() => setShowDirections(true)}
                  className="btn btn-secondary"
                >
                  <Navigation size={17} />
                  <span>Get Directions</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleSave(restaurant.id, restaurant.name)}
                  className="btn btn-outline"
                  aria-pressed={isSaved}
                >
                  <Heart
                    size={17}
                    fill={isSaved ? '#D63B64' : 'none'}
                    color={isSaved ? '#D63B64' : 'currentColor'}
                  />
                  <span>{isSaved ? 'Saved' : 'Save Restaurant'}</span>
                </button>
                </>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESTAURANT MENU & PRICES */}
      <section id="menu" className="menu-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: '26px' }}>
            <div>
              <span className="eyebrow">{isLive ? 'Restaurant Menu' : 'Menu & Price Guide'}</span>
              <h2 className="section-title">
                {restaurant.name} <em>Menu</em>
              </h2>
              {!isLive && (
                <p className="section-subtitle">
                  Browse sample dishes and prices in Philippine Pesos (₱). Tap{' '}
                  <strong>Estimate Cost</strong> on any dish to calculate your meal budget.
                </p>
              )}
            </div>
          </div>

          {isLive ? (
            <div className="empty-state-box">
              {!restaurant.menuUrl && <p>Menu items are currently unavailable.</p>}
              {menuLink && (
                <a href={menuLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  <ExternalLink size={16} />
                  {restaurant.menuUrl ? 'Open restaurant menu' : 'Check restaurant website'}
                </a>
              )}
            </div>
          ) : <>
          <div className="menu-controls-bar">
            <div className="menu-top-bar">
              <div className="menu-search-wrap">
                <div className="input-with-icon">
                  <Search size={18} className="field-icon" aria-hidden="true" />
                  <input
                    type="text"
                    aria-label="Search menu items"
                    placeholder="Search menu items (e.g. Rice, Burger, Coffee, Dessert)..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                  />
                  {menuSearch && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => setMenuSearch('')}
                      aria-label="Clear menu search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="menu-price-summary">
                <span>
                  Lowest Dish: <strong>{formatPeso(priceStats.min)}</strong>
                </span>
                <span>•</span>
                <span>
                  Highest Dish: <strong>{formatPeso(priceStats.max)}</strong>
                </span>
              </div>
            </div>

            <div className="menu-tabs-row" role="tablist" aria-label="Menu Categories">
              {MENU_CATEGORIES.map((category) => {
                const count = getCategoryCount(category);
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={menuCategory === category}
                    className={`filter-pill ${menuCategory === category ? 'active' : ''}`}
                    onClick={() => setMenuCategory(category)}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={menuGridRef}>
            {filteredMenu.length > 0 ? (
              <div className="menu-grid">
                {filteredMenu.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    isSelected={estimatedItems.some((e) => e.id === item.id)}
                    onToggleEstimate={handleToggleEstimate}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state-box">
                <div className="empty-state-icon">
                  <Search size={26} />
                </div>
                <h3 className="editorial-serif" style={{ fontSize: '1.45rem', marginBottom: '8px' }}>
                  No Menu Items Match Your Filter
                </h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                  This restaurant currently has no items under &ldquo;{menuCategory}&rdquo;
                  {menuSearch ? ` matching "${menuSearch}"` : ''}.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setMenuCategory('All');
                    setMenuSearch('');
                  }}
                >
                  Show Full Restaurant Menu
                </button>
              </div>
            )}
          </div>
          </>}
        </div>
      </section>

      {/* FLOATING MEAL BUDGET ESTIMATOR BAR */}
      {estimatedItems.length > 0 && (
        <div className="meal-estimator-bar" role="region" aria-label="Meal Budget Estimator">
          <div className="estimator-info">
            <span className="estimator-count-badge">
              <Calculator size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
              {estimatedItems.length}{' '}
              {estimatedItems.length === 1 ? 'Dish Selected' : 'Dishes Selected'}
            </span>
            <span style={{ fontSize: '0.88rem', opacity: 0.9 }}>
              Estimated Meal Total:{' '}
              <strong className="estimator-total">{formatPeso(estimatedTotal)}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setEstimatedItems([])}
            className="btn btn-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.14)',
              color: '#FFFFFF',
            }}
          >
            Clear Estimate
          </button>
        </div>
      )}

      {/* DIRECTIONS DEMONSTRATION MODAL */}
      {!isLive && showDirections && (
        <DirectionsModal
          restaurant={restaurant}
          onClose={() => setShowDirections(false)}
        />
      )}
    </div>
  );
}
