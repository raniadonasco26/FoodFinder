import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Explore from './pages/Explore';
import RestaurantDetails from './pages/RestaurantDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import {
  getCurrentMockSession,
  getSavedRestaurantIds,
  logoutMockUser,
  toggleSavedRestaurant,
} from './utils/mockAuth';

function ScrollToTopOnNavigate() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const [session, setSession] = useState(() => getCurrentMockSession());
  const [savedIds, setSavedIds] = useState(() => getSavedRestaurantIds());
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const syncAuth = () => setSession(getCurrentMockSession());
    const syncSaved = () => setSavedIds(getSavedRestaurantIds());

    window.addEventListener('foodfinder:auth-change', syncAuth);
    window.addEventListener('foodfinder:saved-change', syncSaved);
    window.addEventListener('storage', syncAuth);
    window.addEventListener('storage', syncSaved);

    return () => {
      window.removeEventListener('foodfinder:auth-change', syncAuth);
      window.removeEventListener('foodfinder:saved-change', syncSaved);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('storage', syncSaved);
    };
  }, []);

  const handleToggleSave = useCallback(
    (restaurantId, restaurantName) => {
      const result = toggleSavedRestaurant(restaurantId);
      setSavedIds(result.ids);
      showToast(
        result.saved
          ? `Saved "${restaurantName}" to your favorites.`
          : `Removed "${restaurantName}" from saved restaurants.`
      );
    },
    [showToast]
  );

  const handleLogout = useCallback(() => {
    logoutMockUser();
    setSession(null);
    showToast('Logged out of simulated session.');
    navigate('/');
  }, [navigate, showToast]);

  const handleLoginSuccess = useCallback(
    (newSession) => {
      setSession(newSession);
      showToast(`Signed in as ${newSession.fullName}`);
    },
    [showToast]
  );

  return (
    <div className="app-shell">
      <ScrollToTopOnNavigate />
      <Navbar
        session={session}
        savedCount={savedIds.length}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Home savedIds={savedIds} onToggleSave={handleToggleSave} />}
          />
          <Route
            path="/explore"
            element={<Explore savedIds={savedIds} onToggleSave={handleToggleSave} />}
          />
          <Route
            path="/restaurant/:id"
            element={
              <RestaurantDetails
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
              />
            }
          />
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard
                  session={session}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<Home savedIds={savedIds} onToggleSave={handleToggleSave} />}
          />
        </Routes>
      </main>

      <Footer />

      {toast && (
        <div className="toast-notification" role="status" aria-live="polite">
          <Sparkles size={16} color="#D8C5FF" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
