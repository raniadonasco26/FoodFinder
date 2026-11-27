import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Star,
  Utensils,
} from 'lucide-react';
import { gsap, prefersReducedMotion } from '../hooks/useGsapSetup';
import { FOOD_CATEGORIES, RESTAURANTS } from '../data/restaurants';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import RestaurantCard from '../components/RestaurantCard';
import ImageWithFallback from '../components/ImageWithFallback';

const QUICK_SEARCHES = [
  { label: 'Chicken Rice Meal', to: '/explore?food=Chicken+Rice' },
  { label: 'Under ₱150', to: '/explore?budget=budget' },
  { label: 'Artisan Ramen', to: '/explore?food=Ramen' },
  { label: 'Specialty Café', to: '/explore?category=Caf%C3%A9' },
  { label: 'Ube Desserts', to: '/explore?category=Desserts' },
];

export default function Home({ savedIds, onToggleSave }) {
  const homeRef = useRef(null);
  const location = useLocation();

  const featuredRestaurants = RESTAURANTS.filter((r) => r.featured).slice(0, 6);

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Initial Hero Entrance
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from('.gsap-hero-item', {
          y: 26,
          opacity: 0,
          duration: 0.75,
          stagger: 0.11,
          clearProps: 'transform,opacity',
        })
        .from(
          '.gsap-hero-visual',
          {
            scale: 0.96,
            y: 20,
            opacity: 0,
            duration: 0.85,
            clearProps: 'transform,opacity',
          },
          '-=0.55'
        )
        .from(
          '.hero-float-card',
          {
            y: 16,
            opacity: 0,
            duration: 0.55,
            stagger: 0.14,
            clearProps: 'transform,opacity',
          },
          '-=0.4'
        );

      // Categories Scroll Reveal
      gsap.from('.gsap-categories-header > *', {
        scrollTrigger: {
          trigger: '#categories',
          start: 'top 82%',
          once: true,
        },
        y: 22,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });

      gsap.from('#categories .gsap-category-card', {
        scrollTrigger: {
          trigger: '.categories-grid',
          start: 'top 84%',
          once: true,
        },
        y: 28,
        opacity: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });

      // Featured Restaurants Scroll Reveal
      gsap.from('#featured .gsap-restaurant-card', {
        scrollTrigger: {
          trigger: '#featured .restaurants-grid',
          start: 'top 84%',
          once: true,
        },
        y: 32,
        opacity: 0,
        duration: 0.62,
        stagger: 0.09,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });

      // CTA Reveal
      gsap.from('.gsap-cta-card', {
        scrollTrigger: {
          trigger: '.gsap-cta-card',
          start: 'top 86%',
          once: true,
        },
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, homeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={homeRef}>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow gsap-hero-item">
              <Sparkles size={14} />
              <span>Curated Menus · Transparent Peso Prices</span>
            </span>

            <h1 className="hero-title gsap-hero-item">
              Discover Great Food <span className="highlight-italic">Around You.</span>
            </h1>

            <p className="hero-subtitle gsap-hero-item">
              Find nearby restaurants, explore delicious menus, compare prices, and
              discover your next favorite place to eat.
            </p>

            <div className="gsap-hero-item">
              <SearchBar />
            </div>

            <div className="hero-quick-tags gsap-hero-item">
              <span className="hero-quick-label">Popular right now:</span>
              {QUICK_SEARCHES.map((item) => (
                <Link key={item.label} to={item.to} className="quick-tag-chip">
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hero-metrics gsap-hero-item">
              <div>
                <p className="hero-metric-value">10+</p>
                <p className="hero-metric-label">Curated Demo Restaurants</p>
              </div>
              <div>
                <p className="hero-metric-value">70+</p>
                <p className="hero-metric-label">Priced Menu Dishes (₱)</p>
              </div>
              <div>
                <p className="hero-metric-value">₱55–₱420</p>
                <p className="hero-metric-label">Every Dining Budget Covered</p>
              </div>
            </div>
          </div>

          <div className="hero-visual gsap-hero-visual">
            <div className="hero-float-card hero-float-top float-ambient">
              <div className="float-icon-badge">
                <Utensils size={20} />
              </div>
              <div>
                <p className="float-card-title">Chicken Rice Meal</p>
                <p className="float-card-sub">Crisp &amp; Co. Grill Express</p>
              </div>
              <span className="float-price-pill">₱99</span>
            </div>

            <div className="hero-image-frame">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85"
                alt="Artfully plated restaurant dishes ready to explore on FOOD FINDER"
                loading="eager"
              />
              <div className="hero-image-overlay">
                <div className="hero-image-caption">
                  <span>Featured Dining Spot</span>
                  <h3>Mesa Lavanda Heritage Kitchen · Cebu City</h3>
                </div>
              </div>
            </div>

            <div className="hero-float-card hero-float-bottom float-ambient-delayed">
              <div className="float-icon-badge">
                <Star size={20} fill="#9575CD" />
              </div>
              <div>
                <p className="float-card-title">4.9 ★ Editorial Pick</p>
                <p className="float-card-sub">Menus &amp; ₱ prices verified upfront</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOD CATEGORIES */}
      <section id="categories" className="section">
        <div className="container">
          <div className="section-header gsap-categories-header">
            <div>
              <span className="eyebrow">Browse by Craving</span>
              <h2 className="section-title">
                Explore Food <em>Categories</em>
              </h2>
              <p className="section-subtitle">
                From comforting Filipino rice plates and quick value meals to specialty
                cafés and wood-fired Italian kitchens.
              </p>
            </div>
            <Link to="/explore" className="btn btn-outline">
              <span>View All Cuisines</span>
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="categories-grid">
            {FOOD_CATEGORIES.map((category) => {
              const count = RESTAURANTS.filter((r) => r.category === category.id).length;
              return (
                <CategoryCard key={category.id} category={category} count={count} />
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED RESTAURANTS */}
      <section id="featured" className="section section-lavender">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow">Handpicked Tables</span>
              <h2 className="section-title">
                Featured <em>Restaurants</em>
              </h2>
              <p className="section-subtitle">
                Inspect full menus, dish descriptions, and Philippine Peso price ranges
                before you head out.
              </p>
            </div>
            <Link to="/explore" className="btn btn-primary">
              <span>Explore All Restaurants</span>
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="restaurants-grid">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isSaved={savedIds.includes(restaurant.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE FOOD FINDER & ABOUT */}
      <section id="about" className="section">
        <div className="container">
          <h2 className="section-title">About FoodFinder</h2>
          <p>FoodFinder covers Cebu City only.</p>
          <p>Contact: <a href="mailto:raniadonasco26@gmail.com">raniadonasco26@gmail.com</a></p>
        </div>
      </section>

      {/* CALL-TO-ACTION SECTION */}
      <section className="section" style={{ paddingTop: '16px' }}>
        <div className="container">
          <div className="cta-card gsap-cta-card">
            <span
              className="eyebrow"
              style={{
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#FAF8FF',
                borderColor: 'rgba(255, 255, 255, 0.25)',
              }}
            >
              Start Exploring Today
            </span>
            <h2>Your Next Favorite Meal Is Waiting.</h2>
            <p>
              Compare menus, check food prices in seconds, and bookmark the restaurants
              that match your craving and budget.
            </p>
            <Link to="/explore" className="btn btn-white-luxury btn-lg">
              <span>Explore Restaurants</span>
              <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
