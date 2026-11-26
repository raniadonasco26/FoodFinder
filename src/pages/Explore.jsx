import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Utensils,
  LayoutGrid,
  List,
  RotateCcw,
  Heart,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { gsap, prefersReducedMotion } from '../hooks/useGsapSetup';
import { FOOD_CATEGORIES, LOCATIONS, RESTAURANTS } from '../data/restaurants';
import { filterAndSortRestaurants } from '../utils/filters';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantMap from '../components/RestaurantMap';

export default function Explore({ savedIds, onToggleSave }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageRef = useRef(null);
  const resultsRef = useRef(null);

  const [restaurantQuery, setRestaurantQuery] = useState(
    () => searchParams.get('q') || ''
  );
  const [foodQuery, setFoodQuery] = useState(() => searchParams.get('food') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get('category') || 'All'
  );
  const [selectedLocation, setSelectedLocation] = useState(
    () => searchParams.get('location') || 'All Locations'
  );
  const [maxDistance, setMaxDistance] = useState('any');
  const [budget, setBudget] = useState(() => searchParams.get('budget') || 'any');
  const [sortBy, setSortBy] = useState('featured');
  const [onlySaved, setOnlySaved] = useState(
    () => searchParams.get('saved') === 'true'
  );
  const [viewMode, setViewMode] = useState('grid');

  // Sync incoming URL query changes (e.g. clicking footer/navbar category links)
  useEffect(() => {
    const qParam = searchParams.get('q');
    const foodParam = searchParams.get('food');
    const catParam = searchParams.get('category');
    const locParam = searchParams.get('location');
    const budgetParam = searchParams.get('budget');
    const savedParam = searchParams.get('saved');

    if (qParam !== null) {
      // Hero search can match either restaurant name or dish/cuisine:
      // if it doesn't match a restaurant name directly, populate foodQuery for broader discovery
      const matchesRestaurant = RESTAURANTS.some(
        (r) =>
          r.name.toLowerCase().includes(qParam.toLowerCase()) ||
          r.location.toLowerCase().includes(qParam.toLowerCase())
      );
      if (matchesRestaurant) {
        setRestaurantQuery(qParam);
      } else {
        setFoodQuery(qParam);
      }
    }
    if (foodParam !== null) setFoodQuery(foodParam);
    if (catParam !== null) setSelectedCategory(catParam);
    if (locParam !== null) setSelectedLocation(locParam);
    if (budgetParam !== null) setBudget(budgetParam);
    if (savedParam !== null) setOnlySaved(savedParam === 'true');
  }, [searchParams]);

  const filteredRestaurants = useMemo(
    () =>
      filterAndSortRestaurants(
        RESTAURANTS,
        {
          restaurantQuery,
          foodQuery,
          category: selectedCategory,
          location: selectedLocation,
          maxDistance,
          budget,
          sortBy,
          onlySaved,
        },
        savedIds
      ),
    [
      restaurantQuery,
      foodQuery,
      selectedCategory,
      selectedLocation,
      maxDistance,
      budget,
      sortBy,
      onlySaved,
      savedIds,
    ]
  );

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.gsap-explore-header > *', {
        y: 18,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !resultsRef.current) return;
    const ctx = gsap.context(() => {
      const cards = resultsRef.current.querySelectorAll('.gsap-restaurant-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.42,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          }
        );
      }
    }, resultsRef);
    return () => ctx.revert();
  }, [
    selectedCategory,
    selectedLocation,
    maxDistance,
    budget,
    sortBy,
    onlySaved,
    viewMode,
  ]);

  const hasActiveFilters =
    restaurantQuery.trim() !== '' ||
    foodQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedLocation !== 'All Locations' ||
    maxDistance !== 'any' ||
    budget !== 'any' ||
    onlySaved;

  const handleResetFilters = () => {
    setRestaurantQuery('');
    setFoodQuery('');
    setSelectedCategory('All');
    setSelectedLocation('All Locations');
    setMaxDistance('any');
    setBudget('any');
    setSortBy('featured');
    setOnlySaved(false);
    setSearchParams({});
  };

  return (
    <div ref={pageRef}>
      <section className="page-hero-compact">
        <div className="container gsap-explore-header">
          <span className="eyebrow">
            <SlidersHorizontal size={13} />
            <span>Restaurant &amp; Menu Discovery</span>
          </span>
          <h1 className="section-title" style={{ marginBottom: '8px' }}>
            Explore <em>Restaurants &amp; Prices</em>
          </h1>
          <p className="section-subtitle">
            Search by restaurant name, dish, or cuisine—and filter by neighborhood,
            distance, or meal budget in Philippine Pesos (₱).
          </p>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="explore-controls-panel">
            <div className="explore-search-row">
              <div>
                <label
                  htmlFor="search-restaurant-name"
                  style={{
                    display: 'block',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Search Restaurant Name
                </label>
                <div className="input-with-icon">
                  <Search size={18} className="field-icon" aria-hidden="true" />
                  <input
                    id="search-restaurant-name"
                    type="text"
                    placeholder="e.g. Mesa Lavanda, Crisp & Co., Trattoria..."
                    value={restaurantQuery}
                    onChange={(e) => setRestaurantQuery(e.target.value)}
                  />
                  {restaurantQuery && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => setRestaurantQuery('')}
                      aria-label="Clear restaurant search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="search-food-cuisine"
                  style={{
                    display: 'block',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Search Food, Dish, or Cuisine
                </label>
                <div className="input-with-icon">
                  <Utensils size={18} className="field-icon" aria-hidden="true" />
                  <input
                    id="search-food-cuisine"
                    type="text"
                    placeholder="e.g. Chicken Rice, Burger, Ramen, Iced Coffee..."
                    value={foodQuery}
                    onChange={(e) => setFoodQuery(e.target.value)}
                  />
                  {foodQuery && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => setFoodQuery('')}
                      aria-label="Clear food or cuisine search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="explore-filters-row">
              <div className="filter-group">
                <label htmlFor="filter-location">Location</label>
                <select
                  id="filter-location"
                  className="select-control"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-distance">Distance (Mock)</label>
                <select
                  id="filter-distance"
                  className="select-control"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                >
                  <option value="any">Any Distance</option>
                  <option value="1">Within 1 km</option>
                  <option value="2.5">Within 2.5 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-budget">Meal Budget (₱)</label>
                <select
                  id="filter-budget"
                  className="select-control"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option value="any">Any Budget</option>
                  <option value="budget">Budget-Friendly (Under ₱150 avg)</option>
                  <option value="moderate">Moderate (₱150 – ₱300 avg)</option>
                  <option value="upscale">Upscale Dining (₱300+ avg)</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-sort">Sort By</label>
                <select
                  id="filter-sort"
                  className="select-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured Recommendations</option>
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="category-pills-bar" role="tablist" aria-label="Food Categories">
            <button
              type="button"
              className={`filter-pill ${
                selectedCategory === 'All' && !onlySaved ? 'active' : ''
              }`}
              onClick={() => {
                setSelectedCategory('All');
                setOnlySaved(false);
              }}
            >
              All Restaurants
            </button>

            <button
              type="button"
              className={`filter-pill ${onlySaved ? 'active' : ''}`}
              onClick={() => setOnlySaved((prev) => !prev)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Heart size={14} fill={onlySaved ? 'currentColor' : 'none'} />
              <span>Saved ({savedIds.length})</span>
            </button>

            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS LISTING */}
      <section className="section" style={{ paddingTop: '12px' }}>
        <RestaurantMap />
        <div className="container">
          <div className="results-toolbar">
            <p className="results-count-text">
              Showing <strong>{filteredRestaurants.length}</strong> of{' '}
              <strong>{RESTAURANTS.length}</strong> demonstration restaurants
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {selectedLocation !== 'All Locations' && ` near ${selectedLocation}`}
            </p>

            <div className="toolbar-right">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary btn-sm"
                >
                  <RotateCcw size={14} />
                  <span>Reset Filters</span>
                </button>
              )}

              <div className="view-toggle-group" role="group" aria-label="Display Layout">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                >
                  <LayoutGrid size={16} />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                >
                  <List size={16} />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          <div ref={resultsRef}>
            {filteredRestaurants.length > 0 ? (
              <div
                className={
                  viewMode === 'grid' ? 'restaurants-grid' : 'restaurants-list'
                }
              >
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    viewMode={viewMode}
                    isSaved={savedIds.includes(restaurant.id)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state-box">
                <div className="empty-state-icon">
                  <Utensils size={28} />
                </div>
                <h2 className="editorial-serif" style={{ fontSize: '1.55rem', marginBottom: '8px' }}>
                  No Matching Restaurants Found
                </h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '22px' }}>
                  Try broadening your search terms, adjusting your Philippine Peso budget
                  range, or clearing active filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-primary"
                >
                  <RotateCcw size={16} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
