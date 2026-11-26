import { Link } from 'react-router-dom';
import { Heart, Compass, LogOut, ShieldCheck, ArrowRight } from 'lucide-react';
import { RESTAURANTS } from '../data/restaurants';
import RestaurantCard from '../components/RestaurantCard';

export default function Dashboard({ session, savedIds, onToggleSave, onLogout }) {
  const savedRestaurants = RESTAURANTS.filter((r) => savedIds.includes(r.id));

  return (
    <section className="section">
      <div className="container">
        <div className="dashboard-profile-card">
          <div>
            <span className="eyebrow">
              <ShieldCheck size={14} />
              <span>Simulated Local Session Active</span>
            </span>
            <h1 className="section-title" style={{ marginBottom: '6px' }}>
              Welcome, <em>{session?.fullName}</em>
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.94rem' }}>
              Signed in as <strong>{session?.email}</strong> · Stored locally in{' '}
              <code>localStorage</code>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-primary">
              <Compass size={17} />
              <span>Explore Restaurants</span>
            </Link>
            <button type="button" onClick={onLogout} className="btn btn-outline">
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ fontSize: '1.9rem' }}>
              Your Saved <em>Restaurants</em> ({savedRestaurants.length})
            </h2>
            <p className="section-subtitle">
              Quickly jump back into your bookmarked menus and Philippine Peso price
              guides.
            </p>
          </div>
          <Link to="/explore?budget=budget" className="btn btn-secondary btn-sm">
            <span>Browse Under ₱150 Meals</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {savedRestaurants.length > 0 ? (
          <div className="restaurants-grid">
            {savedRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isSaved={true}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Heart size={28} />
            </div>
            <h3 className="editorial-serif" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
              No Saved Restaurants Yet
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '22px' }}>
              Tap the heart icon on any restaurant card while exploring to bookmark it
              here.
            </p>
            <Link to="/explore" className="btn btn-primary">
              <span>Discover Restaurants</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
