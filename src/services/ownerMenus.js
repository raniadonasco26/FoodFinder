import { createClient } from '@supabase/supabase-js';

const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const projectUrl = 'https://wboqapkbseuwctqjjill.supabase.co';
const url = configuredUrl || projectUrl;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  (url === projectUrl ? 'sb_publishable_B39j0ZWHeY_SHpA5JzEvlg_42w4gi-k' : undefined);
export const supabase = url && key ? createClient(url, key) : null;

export function restaurantIdentity(id) {
  const ownerListing = /^owner-([1-9]\d{0,18})$/.exec(id);
  if (ownerListing) return { restaurant_osm_type: 'foodfinder', restaurant_osm_id: ownerListing[1] };
  const [, restaurant_osm_type, restaurant_osm_id] = /^osm-(node|way|relation)-([1-9]\d{0,18})$/.exec(id) ?? [];
  return restaurant_osm_id ? { restaurant_osm_type, restaurant_osm_id } : null;
}

export function listingId({ restaurant_osm_type, restaurant_osm_id }) {
  return restaurant_osm_type === 'foodfinder' ? 'owner-' + restaurant_osm_id
    : `osm-${restaurant_osm_type}-${restaurant_osm_id}`;
}

export async function fetchPublishedMenu(id, signal) {
  const identity = restaurantIdentity(id);
  if (!supabase || !identity) return null;
  const query = supabase.from('published_restaurant_menus').select('items, published_at').match(identity);
  if (signal) query.abortSignal(signal);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchPublishedLocations(signal, id) {
  if (!supabase) return [];
  const identity = id ? restaurantIdentity(id) : null;
  if (id && !identity) return [];
  const fields = 'restaurant_osm_type, restaurant_osm_id, restaurant_name, address, latitude, longitude';
  const query = supabase.from('published_restaurant_locations').select(fields);
  if (identity) query.match(identity);
  if (signal) query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(row => ({
    id: listingId(row), name: row.restaurant_name, lat: row.latitude, lon: row.longitude,
    address: row.address, category: 'Restaurant', tags: [], ownerLocation: true,
  }));
}

export function mergeRestaurantLocations(restaurants, locations) {
  const listings = new Map(restaurants.map(restaurant => [restaurant.id, restaurant]));
  for (const location of locations) {
    const existing = listings.get(location.id);
    listings.set(location.id, existing ? {
      ...existing, lat: location.lat, lon: location.lon, address: location.address, ownerLocation: true,
    } : location);
  }
  return [...listings.values()];
}
