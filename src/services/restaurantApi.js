import axios from 'axios';
import { CEBU_CITY_AREA, CEBU_CITY_BOUNDS, isInCebuCity } from '../data/cebuCity.js';

const endpoint = import.meta.env?.VITE_OVERPASS_URL || 'https://ovp.dresel.systems/api-as/interpreter';
const amenities = { restaurant: 'Restaurant', cafe: 'Café', fast_food: 'Fast food' };
const restaurantFilter = '["amenity"~"^(restaurant|cafe|fast_food)$"]';
const cache = new Map();

function websiteUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href : null;
  } catch {
    return null;
  }
}

export function normalizeRestaurants(elements) {
  const restaurants = new Map();
  for (const element of elements) {
    if (!element || !['node', 'way', 'relation'].includes(element.type) ||
        !Number.isSafeInteger(element.id) || element.id < 1) continue;

    const tags = element.tags ?? {};
    const name = typeof tags.name === 'string' ? tags.name.trim() : '';
    const { lat, lon } = (element.type === 'node' ? element : element.center) ?? {};
    if (!name || !Object.hasOwn(amenities, tags.amenity) ||
        !Number.isFinite(lat) || Math.abs(lat) > 90 ||
        !Number.isFinite(lon) || Math.abs(lon) > 180) continue;

    const id = 'osm-' + element.type + '-' + element.id;
    const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
    const locality = tags['addr:city'] || tags['addr:town'] || tags['addr:municipality'];
    const address = tags['addr:full'] || tags['addr:place'] || [street, locality].filter(Boolean).join(', ');

    restaurants.set(id, {
      id,
      osmId: element.id,
      osmType: element.type,
      name,
      lat,
      lon,
      category: amenities[tags.amenity],
      cuisine: typeof tags.cuisine === 'string' ? tags.cuisine.replaceAll('_', ' ').replace(/;\s*/g, ', ').trim() : '',
      address,
      phone: tags['contact:phone'] || tags.phone,
      website: websiteUrl(tags.website) || websiteUrl(tags['contact:website']),
      menuUrl: websiteUrl(tags['website:menu']),
      openingHours: tags.opening_hours,
      description: tags.description,
      tags: [],
    });
  }
  return [...restaurants.values()];
}

async function queryRestaurants(statement, signal) {
  const cached = cache.get(statement);
  if (cached && Date.now() - cached.time < 5 * 60 * 1000) return cached.restaurants;

  const { data } = await axios.get(endpoint, {
    params: { data: '[out:json][timeout:25];' + statement + 'out center tags;' },
    signal,
    timeout: 30000,
  });
  if (!Array.isArray(data?.elements) || data.remark) {
    throw new Error('Overpass returned incomplete restaurant data.');
  }

  const restaurants = normalizeRestaurants(data.elements).filter(({ lat, lon }) => isInCebuCity(lat, lon));
  cache.delete(statement);
  cache.set(statement, { time: Date.now(), restaurants });
  if (cache.size > 24) cache.delete(cache.keys().next().value);
  return restaurants;
}

export function fetchCebuCityRestaurants(signal) {
  const bounds = CEBU_CITY_BOUNDS.flat().join(',');
  return queryRestaurants('area(' + CEBU_CITY_AREA + ')->.cebu;nwr' + restaurantFilter + '(area.cebu)(' + bounds + ');', signal);
}

export function isOsmRestaurantId(id) {
  return /^osm-(node|way|relation)-[1-9]\d*$/.test(id);
}

export async function fetchOsmRestaurant(id, signal) {
  if (!isOsmRestaurantId(id)) return null;
  const [, type, number] = id.split('-');
  const restaurants = await queryRestaurants(type + '(' + number + ');', signal);
  return restaurants.find(restaurant => restaurant.id === id) ?? null;
}
