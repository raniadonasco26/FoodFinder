import { useCallback, useEffect, useState } from 'react';
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Explore from './pages/Explore';
import RestaurantDetails from './pages/RestaurantDetails';
import AccountForm from './pages/AccountForm';
import Dashboard from './pages/Dashboard';
import OwnerPortal from './pages/OwnerPortal';
import { supabase } from './services/ownerMenus';
import {
  getSavedRestaurantIds,
  toggleSavedRestaurant,
} from './utils/savedRestaurants';

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
  const [authSession, setAuthSession] = useState(supabase ? undefined : null);
  const [ownerUserId, setOwnerUserId] = useState(null);
  const user = authSession?.user;
  const { pathname } = useLocation();
  const isOwnerAccount = Boolean(user && (
    pathname === '/owner' || ownerUserId === user.id || user.user_metadata?.account_type === 'owner'
  ));
  const dashboardPath = isOwnerAccount ? '/owner' : '/dashboard';
  const displayName = user?.user_metadata?.full_name;
  const fullName = (typeof displayName === 'string' && displayName.trim()) || user?.email || 'FoodFinder user';
  const session = user ? { fullName, email: user.email }
    : authSession;
  const [savedIds, setSavedIds] = useState(() => getSavedRestaurantIds());
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname !== '/owner' || !user?.id || ownerUserId === user.id) return;
    setOwnerUserId(user.id);
    try { localStorage.setItem(`foodfinder:owner-portal:${user.id}`, 'true'); } catch { /* Session preference still applies. */ }
  }, [ownerUserId, pathname, user?.id]);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const subscription = supabase?.auth.onAuthStateChange((event, nextSession) => {
      const id = nextSession?.user?.id;
      let usedOwnerPortal = false;
      try { usedOwnerPortal = Boolean(id && localStorage.getItem(`foodfinder:owner-portal:${id}`)); } catch { /* Storage is optional. */ }
      setOwnerUserId(usedOwnerPortal ? id : null);
      setAuthSession(nextSession);
    }).data.subscription;
    const syncSaved = () => setSavedIds(getSavedRestaurantIds());

    window.addEventListener('foodfinder:saved-change', syncSaved);
    window.addEventListener('storage', syncSaved);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('foodfinder:saved-change', syncSaved);
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

  const handleLogout = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) { showToast(error.message); return; }
    showToast('Signed out.');
    navigate('/');
  }, [navigate, showToast]);

  return (
    <div className="app-shell">
      <ScrollToTopOnNavigate />
      <Navbar
        session={session}
        dashboardPath={dashboardPath}
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
          <Route path="/login" element={<AccountForm key="login" mode="login" session={authSession} dashboardPath={dashboardPath} />} />
          <Route path="/register" element={<AccountForm key="register" mode="register" session={authSession} dashboardPath={dashboardPath} />} />
          <Route path="/forgot-password" element={<AccountForm key="recover" mode="recover" session={authSession} />} />
          <Route path="/reset-password" element={<AccountForm key="reset" mode="reset" session={authSession} dashboardPath={dashboardPath} />} />
          <Route path="/owner" element={<OwnerPortal session={authSession} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute session={authSession}>
                {isOwnerAccount ? <Navigate to="/owner" replace /> : <Dashboard
                  session={session}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                  onLogout={handleLogout}
                />}
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
