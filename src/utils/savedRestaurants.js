const STORAGE_KEY = 'foodfinder_saved_restaurants_v1';
const DEFAULT_IDS = ['mesa-lavanda-filipino', 'atelier-violette-cafe'];

export function getSavedRestaurantIds() {
  try {
    const ids = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return Array.isArray(ids) ? ids : DEFAULT_IDS;
  } catch {
    return DEFAULT_IDS;
  }
}

export function toggleSavedRestaurant(restaurantId) {
  const current = getSavedRestaurantIds();
  const saved = !current.includes(restaurantId);
  const ids = saved ? [...current, restaurantId] : current.filter(id => id !== restaurantId);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('foodfinder:saved-change'));
  } catch {
    // The current page can still reflect the change when storage is unavailable.
  }
  return { saved, ids };
}
