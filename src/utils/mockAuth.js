/**
 * FOOD FINDER — Simulated Frontend Authentication & Favorites (localStorage ONLY)
 *
 * IMPORTANT: This module provides demonstration-only client-side authentication.
 * No external server, database, or real credential storage is used.
 */

const USERS_STORAGE_KEY = 'foodfinder_mock_users_v1';
const SESSION_STORAGE_KEY = 'foodfinder_mock_session_v1';
const SAVED_STORAGE_KEY = 'foodfinder_saved_restaurants_v1';

export const PREDEFINED_DEMO_USER = {
  id: 'demo-user-01',
  fullName: 'Camille Santos (Demo)',
  email: 'demo@foodfinder.ph',
  demoPasscode: 'DemoPass123!',
  createdAt: '2026-01-15T08:00:00.000Z',
  isPredefinedDemo: true,
};

function safeReadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

function notifyAuthListeners() {
  window.dispatchEvent(new CustomEvent('foodfinder:auth-change'));
}

function notifySavedListeners() {
  window.dispatchEvent(new CustomEvent('foodfinder:saved-change'));
}

export function getMockUsers() {
  const stored = safeReadJson(USERS_STORAGE_KEY, []);
  const hasDemo = stored.some(
    (u) => u.email.toLowerCase() === PREDEFINED_DEMO_USER.email.toLowerCase()
  );
  if (!hasDemo) {
    return [PREDEFINED_DEMO_USER, ...stored];
  }
  return stored;
}

export function validateEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

export function registerMockUser({ fullName, email, password }) {
  const cleanName = String(fullName || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPass = String(password || '');

  if (!cleanName || !cleanEmail || !cleanPass) {
    return { ok: false, error: 'Please complete all required fields.' };
  }

  if (!validateEmailFormat(cleanEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  if (cleanPass.length < 6) {
    return {
      ok: false,
      error: 'Demonstration password should be at least 6 characters long.',
    };
  }

  const allUsers = getMockUsers();
  const exists = allUsers.some((u) => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    return {
      ok: false,
      error: 'An account with this email already exists in local demonstration storage.',
    };
  }

  const newUser = {
    id: `mock-user-${Date.now()}`,
    fullName: cleanName,
    email: cleanEmail,
    // Stored locally solely for simulated frontend login matching
    demoPasscode: cleanPass,
    createdAt: new Date().toISOString(),
  };

  const customUsers = safeReadJson(USERS_STORAGE_KEY, []);
  safeWriteJson(USERS_STORAGE_KEY, [...customUsers, newUser]);

  return {
    ok: true,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      createdAt: newUser.createdAt,
    },
  };
}

export function loginMockUser({ email, password, rememberMe = true }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPass = String(password || '');

  if (!cleanEmail || !cleanPass) {
    return { ok: false, error: 'Please enter both your email address and password.' };
  }

  if (!validateEmailFormat(cleanEmail)) {
    return { ok: false, error: 'Please enter a valid email format.' };
  }

  const allUsers = getMockUsers();
  const matched = allUsers.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.demoPasscode === cleanPass
  );

  if (!matched) {
    return {
      ok: false,
      error:
        'Invalid demonstration credentials. Try the Demo Account button or create a mock account first.',
    };
  }

  const sessionPayload = {
    id: matched.id,
    fullName: matched.fullName,
    email: matched.email,
    rememberMe: Boolean(rememberMe),
    loggedInAt: new Date().toISOString(),
    simulated: true,
  };

  safeWriteJson(SESSION_STORAGE_KEY, sessionPayload);
  notifyAuthListeners();

  return { ok: true, session: sessionPayload };
}

export function getCurrentMockSession() {
  return safeReadJson(SESSION_STORAGE_KEY, null);
}

export function logoutMockUser() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage access errors
  }
  notifyAuthListeners();
}

/* Saved / Favorite Restaurants (localStorage) */
export function getSavedRestaurantIds() {
  return safeReadJson(SAVED_STORAGE_KEY, ['mesa-lavanda-filipino', 'atelier-violette-cafe']);
}

export function toggleSavedRestaurant(restaurantId) {
  const current = getSavedRestaurantIds();
  const exists = current.includes(restaurantId);
  const updated = exists
    ? current.filter((id) => id !== restaurantId)
    : [...current, restaurantId];
  safeWriteJson(SAVED_STORAGE_KEY, updated);
  notifySavedListeners();
  return { saved: !exists, ids: updated };
}
