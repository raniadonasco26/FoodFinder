import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Menu,
  X,
  Heart,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react';
import { gsap, prefersReducedMotion } from '../hooks/useGsapSetup';

export default function Navbar({ session, dashboardPath, savedCount, onLogout }) {
  const ownerDashboard = dashboardPath === '/owner';
  const savedPath = session && !ownerDashboard ? '/dashboard' : '/explore?saved=true';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const drawerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.navbar-inner > *', {
        y: -14,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (!mobileOpen || !drawerRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        drawerRef.current,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }
      );
      gsap.from('.mobile-nav-link', {
        x: -14,
        opacity: 0,
        duration: 0.28,
        stagger: 0.045,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });
    }, drawerRef);
    return () => ctx.revert();
  }, [mobileOpen]);

  const handleSectionLink = (e, sectionId) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname === '/') {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const initials = session?.fullName
    ? session.fullName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'FF';

  return (
    <>
      <header ref={navRef} className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="brand-logo" aria-label="FOOD FINDER Home">
            <span className="brand-mark" aria-hidden="true">
              <UtensilsCrossed size={21} strokeWidth={2.1} />
            </span>
            <span className="brand-text-wrap">
              <span className="brand-name">FOOD FINDER</span>
              <span className="brand-tagline">Menus &amp; Dining Guide</span>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Primary Navigation">
            <Link
              to="/"
              className={`nav-link ${
                location.pathname === '/' && !location.hash ? 'active' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`nav-link ${
                location.pathname.startsWith('/explore') ||
                location.pathname.startsWith('/restaurant')
                  ? 'active'
                  : ''
              }`}
            >
              Explore Restaurants
            </Link>
            <a
              href="/#categories"
              onClick={(e) => handleSectionLink(e, 'categories')}
              className={`nav-link ${location.hash === '#categories' ? 'active' : ''}`}
            >
              Categories
            </a>
            <a
              href="/#about"
              onClick={(e) => handleSectionLink(e, 'about')}
              className={`nav-link ${location.hash === '#about' ? 'active' : ''}`}
            >
              About
            </a>
          </nav>

          <div className="nav-actions">
            <Link
              to={savedPath}
              className="saved-pill"
              title="Saved Restaurants"
            >
              <Heart size={16} />
              <span>Saved</span>
              {savedCount > 0 && <span className="saved-count">{savedCount}</span>}
            </Link>

            {session ? (
              <>
                <Link to={dashboardPath} className="user-chip" title={ownerDashboard ? 'Open owner dashboard' : 'Open dashboard'}>
                  <span className="user-avatar">{initials}</span>
                  <span>{ownerDashboard ? 'Owner dashboard' : session.fullName.split(' ')[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="btn btn-outline btn-sm"
                  aria-label="Sign out"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            className="mobile-drawer"
            role="dialog"
            aria-label="Mobile Navigation"
          >
            <div className="mobile-nav-list">
              <Link
                to="/"
                className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                <span>Home</span>
                <ChevronRight size={18} />
              </Link>
              <Link
                to="/explore"
                className={`mobile-nav-link ${
                  location.pathname.startsWith('/explore') ? 'active' : ''
                }`}
              >
                <span>Explore Restaurants</span>
                <ChevronRight size={18} />
              </Link>
              <a
                href="/#categories"
                onClick={(e) => handleSectionLink(e, 'categories')}
                className="mobile-nav-link"
              >
                <span>Categories</span>
                <ChevronRight size={18} />
              </a>
              <a
                href="/#about"
                onClick={(e) => handleSectionLink(e, 'about')}
                className="mobile-nav-link"
              >
                <span>About</span>
                <ChevronRight size={18} />
              </a>
              <Link
                to={savedPath}
                className="mobile-nav-link"
              >
                <span>Saved Restaurants ({savedCount})</span>
                <Heart size={18} />
              </Link>
            </div>

            {session ? (
              <div className="mobile-drawer-actions">
                <Link to={dashboardPath} className="btn btn-secondary btn-full">
                  <User size={16} />
                  <span>{ownerDashboard ? 'Owner dashboard' : `${session.fullName.split(' ')[0]}'s Hub`}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="btn btn-outline btn-full"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="mobile-drawer-actions">
                <Link to="/login" className="btn btn-outline btn-full">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-full">
                  Register
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
