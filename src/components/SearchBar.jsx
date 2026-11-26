import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { LOCATIONS } from '../data/restaurants';

export default function SearchBar({ initialQuery = '', initialLocation = 'All Locations' }) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query.trim());
    }
    if (selectedLocation && selectedLocation !== 'All Locations') {
      params.set('location', selectedLocation);
    }
    const qs = params.toString();
    navigate(qs ? `/explore?${qs}` : '/explore');
  };

  return (
    <div className="search-bar-card">
      <form className="search-bar-form" onSubmit={handleSubmit} role="search">
        <div className="search-field-group">
          <Search size={20} className="search-field-icon" aria-hidden="true" />
          <div className="search-field-content">
            <label htmlFor="hero-food-search" className="search-field-label">
              Restaurant, Dish, or Cuisine
            </label>
            <input
              id="hero-food-search"
              type="text"
              className="search-field-input"
              placeholder="Try 'Chicken Rice', 'Ramen', or 'Café'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="search-field-group">
          <MapPin size={20} className="search-field-icon" aria-hidden="true" />
          <div className="search-field-content">
            <label htmlFor="hero-location-select" className="search-field-label">
              Dining Location
            </label>
            <select
              id="hero-location-select"
              className="search-field-select"
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
        </div>

        <button type="submit" className="btn btn-primary btn-lg">
          <span>Explore Restaurants</span>
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
