import { Link } from 'react-router-dom';
import { UtensilsCrossed, MapPin, Mail, Phone, Info } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand-logo">
              <span className="brand-mark" aria-hidden="true">
                <UtensilsCrossed size={20} />
              </span>
              <span className="brand-text-wrap">
                <span className="brand-name">FOOD FINDER</span>
                <span className="brand-tagline">Menus &amp; Dining Guide</span>
              </span>
            </Link>
            <p className="footer-desc">
              Discover nearby restaurants, explore curated menus, and compare transparent
              food prices in Philippine Pesos (₱) before deciding where to dine.
            </p>
          </div>

          <div>
            <h3 className="footer-heading">Navigation</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/explore">Explore Restaurants</Link>
              </li>
              <li>
                <Link to="/explore?budget=budget">Under ₱150 Meals</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
              <li>
                <Link to="/owner">Restaurant owner portal</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Popular Cuisines</h3>
            <ul className="footer-links">
              <li>
                <Link to="/explore?category=Filipino+Food">Filipino Food</Link>
              </li>
              <li>
                <Link to="/explore?category=Japanese">Japanese Ramen</Link>
              </li>
              <li>
                <Link to="/explore?category=Caf%C3%A9">Specialty Cafés</Link>
              </li>
              <li>
                <Link to="/explore?category=Korean">Korean Bistro</Link>
              </li>
              <li>
                <Link to="/explore?category=Italian">Italian Trattoria</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Contact Placeholder</h3>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <MapPin size={17} />
                <span>Salcedo Village, Makati City, Metro Manila (Demo Office)</span>
              </li>
              <li className="footer-contact-item">
                <Mail size={17} />
                <span>concierge@foodfinder.example</span>
              </li>
              <li className="footer-contact-item">
                <Phone size={17} />
                <span>+63 (02) 8555-0192 (Placeholder)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FOOD FINDER. All rights reserved.</p>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} />
            <span>
              Demo listings and sample menus are labeled. Cebu City map listings use OpenStreetMap.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
