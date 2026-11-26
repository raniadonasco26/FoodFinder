/**
 * FOOD FINDER — Restaurant & Menu Filtering Utilities
 */

import { getMenuByRestaurantId } from '../data/menus.js';

export function filterAndSortRestaurants(restaurants, filters, savedIds = []) {
  const {
    restaurantQuery = '',
    foodQuery = '',
    category = 'All',
    location = 'All Locations',
    maxDistance = 'any',
    budget = 'any',
    sortBy = 'featured',
    onlySaved = false,
  } = filters;

  const cleanNameQuery = restaurantQuery.trim().toLowerCase();
  const cleanFoodQuery = foodQuery.trim().toLowerCase();

  const filtered = restaurants
    .map((restaurant) => {
      const menuItems = getMenuByRestaurantId(restaurant.id);
      let matchedDish = null;

      if (cleanFoodQuery) {
        matchedDish =
          menuItems.find(
            (item) =>
              item.name.toLowerCase().includes(cleanFoodQuery) ||
              item.description.toLowerCase().includes(cleanFoodQuery) ||
              item.category.toLowerCase().includes(cleanFoodQuery)
          ) || null;
      }

      return {
        ...restaurant,
        matchedDish,
      };
    })
    .filter((restaurant) => {
      if (onlySaved && !savedIds.includes(restaurant.id)) {
        return false;
      }

      if (cleanNameQuery) {
        const matchesName =
          restaurant.name.toLowerCase().includes(cleanNameQuery) ||
          restaurant.address.toLowerCase().includes(cleanNameQuery) ||
          restaurant.location.toLowerCase().includes(cleanNameQuery);
        if (!matchesName) return false;
      }

      if (cleanFoodQuery) {
        const matchesCuisineOrTag =
          restaurant.cuisine.toLowerCase().includes(cleanFoodQuery) ||
          restaurant.category.toLowerCase().includes(cleanFoodQuery) ||
          restaurant.tags.some((t) => t.toLowerCase().includes(cleanFoodQuery));
        if (!matchesCuisineOrTag && !restaurant.matchedDish) {
          return false;
        }
      }

      if (category && category !== 'All' && restaurant.category !== category) {
        return false;
      }

      if (location && location !== 'All Locations' && restaurant.location !== location) {
        return false;
      }

      if (maxDistance !== 'any') {
        const limitKm = Number(maxDistance);
        if (!Number.isNaN(limitKm) && restaurant.distanceKm > limitKm) {
          return false;
        }
      }

      if (budget !== 'any') {
        if (budget === 'budget' && restaurant.avgMealPrice > 150) return false;
        if (
          budget === 'moderate' &&
          (restaurant.avgMealPrice < 150 || restaurant.avgMealPrice > 300)
        ) {
          return false;
        }
        if (budget === 'upscale' && restaurant.avgMealPrice <= 300) return false;
      }

      return true;
    });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
      case 'distance':
        return a.distanceKm - b.distanceKm;
      case 'price-low':
        return a.avgMealPrice - b.avgMealPrice;
      case 'price-high':
        return b.avgMealPrice - a.avgMealPrice;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
      default:
        return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    }
  });

  return sorted;
}

export function filterMenuItems(menuItems, { category = 'All', searchQuery = '' }) {
  const cleanQuery = searchQuery.trim().toLowerCase();

  return menuItems.filter((item) => {
    if (category === 'Best Sellers') {
      if (!item.isBestSeller) return false;
    } else if (category !== 'All' && item.category !== category) {
      return false;
    }

    if (cleanQuery) {
      const matches =
        item.name.toLowerCase().includes(cleanQuery) ||
        item.description.toLowerCase().includes(cleanQuery) ||
        item.category.toLowerCase().includes(cleanQuery);
      if (!matches) return false;
    }

    return true;
  });
}

export function formatPeso(amount) {
  return `₱${Number(amount).toLocaleString('en-PH')}`;
}
