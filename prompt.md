# FOODFINDER – RESTAURANT DISCOVERY AND MENU INTEGRATION

## PROJECT OBJECTIVE

Develop FoodFinder using React JS (JSX) for restaurant discovery through an interactive map, viewing available food menus, and publishing menus through verified restaurant-owner accounts.

The application must integrate OpenStreetMap, Overpass API, Leaflet, React Leaflet, and Axios to retrieve and display restaurant information.

The main goal is to allow users to:
1. View restaurants on an interactive map.
2. Discover restaurants based on their geographic locations.
3. Click restaurant markers to view restaurant information.
4. View available food menus, descriptions, prices, and food images.
5. Access restaurant-provided menu links when available.

**IMPORTANT: Do not add unrelated functionalities. The project must focus ONLY on restaurant discovery, restaurant maps, and restaurant menus.**

---

## 1. REQUIRED TECHNOLOGY STACK

Use the following technologies:

### Frontend
- React JS with JSX.
- Vite as the development environment.
- CSS for styling.
- Lucide React for icons.
- Axios for API requests.

### Mapping
- OpenStreetMap for map tiles and geographic data.
- Overpass API for retrieving restaurant information.
- Leaflet for interactive mapping.
- React Leaflet for integrating Leaflet into React.

### Menu Data
- Use Supabase Auth for restaurant-owner accounts and Supabase to store ownership claims and menu records.
- For the initial frontend prototype, use structured sample menu data if necessary.
- Never fabricate actual restaurant menus or prices and present them as verified information.

### API Integration
- Axios for all external HTTP requests.
- Separate API services from React components.
- Implement proper error handling, loading states, request cancellation, and duplicate prevention.

---

## 2. OPENSTREETMAP AND OVERPASS API INTEGRATION

Integrate OpenStreetMap with Overpass API to retrieve restaurants.

Use the following Overpass query structure:

[out:json][timeout:25];
(
  nwr["amenity"~"^(restaurant|cafe|fast_food)$"](south,west,north,east);
);
out center tags;

Retrieve the following available information:

- Restaurant ID
- Restaurant name
- Latitude
- Longitude
- Cuisine
- Restaurant category
- Street address
- City
- Contact number
- Website
- Menu website
- Opening hours

IMPORTANT REQUIREMENTS:

- Retrieve restaurants based on the currently visible map boundaries.
- Support restaurants represented as nodes, ways, and relations.
- For ways and relations, use the center coordinates returned by Overpass.
- Exclude records without valid names or coordinates.
- Use the OSM element type and ID as the unique restaurant identifier.
- Prevent duplicate restaurant markers.
- Normalize the returned data before displaying it.
- Do not assume that every restaurant has complete information.
- Display "Not Available" when information is missing.

Use Axios POST requests to communicate with Overpass API.

Keep API requests inside a dedicated service file.

---

## 3. INTERACTIVE RESTAURANT MAP

Create an interactive map using React Leaflet and OpenStreetMap tiles.

Map requirements:

- Display OpenStreetMap tiles.
- Show restaurant markers based on retrieved coordinates.
- Support map zooming.
- Support map dragging.
- Support clicking restaurant markers.
- Display restaurant names in marker popups.
- Load restaurants according to the current visible map boundaries.
- Refresh restaurant results when the map stops moving.
- Include loading indicators while retrieving restaurants.
- Include an error message and retry functionality when requests fail.
- Avoid sending excessive API requests.
- Debounce map movement requests.
- Cancel or ignore outdated requests.
- Cache previously retrieved map results when practical.

Use this tile URL:

https://tile.openstreetmap.org/{z}/{x}/{y}.png

Include proper OpenStreetMap attribution:

© OpenStreetMap contributors

Do not use Google Maps or Google Maps APIs.

---

## 4. RESTAURANT DETAILS

When a user clicks a restaurant marker, display its details.

Display the following:

- Restaurant name
- Restaurant category
- Cuisine
- Address
- Contact number, if available
- Website, if available
- Opening hours, if available
- Menu website, if available

The restaurant information should be displayed in a clean restaurant details panel or side drawer.

When information is missing, show a clear unavailable message instead of inventing information.

---

## 5. RESTAURANT MENU INTEGRATION

This is one of the most important features.

The application must allow users to view the actual food menus associated with a selected restaurant.

Menu information should include:

- Food image
- Food name
- Food description
- Food price
- Food category

Organize menus into categories such as:

- Main Dishes
- Appetizers
- Rice Meals
- Desserts
- Beverages

IMPORTANT DATA RULES:

OpenStreetMap does not provide a complete food menu database.

Use the following priority:

1. Retrieve the restaurant's menu website using the OSM `website:menu` tag when available.
2. Retrieve its regular website if a dedicated menu URL is unavailable.
3. Retrieve verified, published menu records from Supabase when available.
4. For the frontend prototype, use clearly identified sample menu records.
5. If no verified menu is available, display "Menu currently unavailable."

Never automatically associate unrelated sample menus with real restaurants.

Use the OSM element type and ID as the relationship identifier between restaurant records and their menu records.

Each menu record should have:

- id
- restaurant_osm_id
- restaurant_osm_type
- name
- description
- category
- price
- image_url

Prices must use Philippine peso formatting (₱).

### Restaurant Owner Accounts and Menu Publishing

- Restaurant owners can register, sign in, and access an owner dashboard. Diners can browse restaurants and published menus without an owner account.
- To claim a listing, an owner selects their existing Cebu City restaurant and submits evidence that they represent it. Identify the listing by its OpenStreetMap element type and ID.
- A designated reviewer approves or rejects claims. Owners can see their claim status. A pending or rejected claim grants no menu editing or publishing access.
- An approved owner can manage only the restaurant listings they are authorized to represent. Enforce ownership and reviewer permissions on the server or in Supabase access policies.
- Approved owners can add, edit, and remove menu items, and update dish names, descriptions, categories, photos, prices in Philippine pesos, and availability.
- Owners can save drafts, publish updates, and unpublish a menu. Drafts and ownership evidence are private. Public restaurant details retrieve only published menu items tied to that listing’s OpenStreetMap element type and ID.
- If there is no published menu or other verified source, show “Menu currently unavailable.”

---

## 6. USER INTERFACE DESIGN

Create a modern, clean, responsive restaurant discovery interface.

The design must focus exclusively on restaurants and food menus.

### Main Layout

Create a split-screen interface:

LEFT SECTION:
- Restaurant discovery area.
- Restaurant search input.
- Restaurant results list.
- Restaurant name and cuisine.
- Available menu indicator.

RIGHT SECTION:
- Interactive OpenStreetMap.
- Restaurant location markers.
- Interactive map controls.
- Restaurant marker popups.

### Restaurant Details Panel

When a restaurant is selected, display:

- Restaurant name.
- Restaurant information.
- Available menu.
- Food images.
- Food names.
- Food descriptions.
- Prices.

The menu should be visually organized into clean food cards.

### Design Guidelines

- Modern and minimal interface.
- Clean typography.
- Responsive layout.
- Consistent spacing.
- Rounded cards.
- Subtle shadows.
- Professional restaurant discovery aesthetic.
- Use Lucide React icons.
- Avoid excessive animations.
- Avoid unnecessary dashboards and unrelated features.

---

## 7. RECOMMENDED PROJECT STRUCTURE

Organize the application using the following structure:

src/
├── components/
│   ├── RestaurantMap.jsx
│   ├── RestaurantMarker.jsx
│   ├── RestaurantList.jsx
│   ├── RestaurantCard.jsx
│   ├── RestaurantDetails.jsx
│   ├── RestaurantMenu.jsx
│   └── MenuCard.jsx
│
├── services/
│   ├── restaurantService.js
│   └── menuService.js
│
├── hooks/
│   └── useRestaurants.js
│
├── data/
│   └── sampleMenus.js
│
├── utils/
│   └── restaurantNormalizer.js
│
├── assets/
│
├── App.jsx
├── main.jsx
└── index.css

You may adjust the structure when necessary, but maintain separation between components, services, and data.

---

## 8. ERROR HANDLING AND PERFORMANCE REQUIREMENTS

The application must be implemented with reliability in mind.

Implement:

- Axios request timeouts.
- AbortController or Axios cancellation for outdated requests.
- Debounced map movement requests.
- Loading indicators.
- Empty restaurant results state.
- API error messages.
- Retry functionality.
- Duplicate restaurant prevention.
- Valid latitude and longitude checking.
- Missing restaurant information handling.
- Missing menu handling.
- Image fallback when a food image fails to load.
- Safe handling of unavailable external websites.
- Caching to minimize unnecessary API requests.

Do not create infinite API request loops.

Do not make API requests every time React renders.

Do not place API calls directly inside component rendering logic.

Do not hardcode API response data as if it came from the real API.

Do not assume that public Overpass API instances or OpenStreetMap tile servers have guaranteed uptime.

Use a configurable Overpass endpoint and respect public service usage policies.

---

## 9. IMPLEMENTATION RULES

Follow these development rules:

1. Use React JSX, not TypeScript.
2. Use Axios for external API fetching.
3. Use React Leaflet for the interactive map.
4. Use OpenStreetMap for the map tiles.
5. Use Overpass API for restaurant discovery.
6. Use Lucide React for icons.
7. Keep components reusable.
8. Keep API services separate from UI components.
9. Do not introduce unnecessary external APIs.
10. Do not use Google Maps.
11. Do not invent restaurant information.
12. Do not invent real menu prices.
13. Do not introduce unrelated functionalities.
14. Make sure all imports and dependencies are correct.
15. Ensure the application runs using `npm run dev`.

---

## 10. TESTING AND VALIDATION

Before considering the implementation complete, verify the following:

### Restaurant Discovery
- Restaurants are retrieved successfully.
- Restaurant names are displayed.
- Coordinates are valid.
- Different OSM element types are supported.
- Duplicate markers are prevented.

### Interactive Map
- OpenStreetMap tiles load.
- Restaurant markers appear in their correct locations.
- Markers are clickable.
- Map zooming works.
- Map dragging works.
- Restaurant results refresh when map boundaries change.

### Restaurant Details
- Clicking a marker displays the correct restaurant.
- Available information is displayed correctly.
- Missing information is handled properly.

### Restaurant Menus
- Menu records are associated with the correct restaurant.
- Food names are displayed.
- Food descriptions are displayed.
- Food images are displayed.
- Prices are formatted in Philippine pesos.
- Unavailable menus are handled properly.

### Reliability
- No infinite rendering loops.
- No repeated unnecessary API calls.
- No uncaught API errors.
- No missing imports.
- No invalid React keys.
- No blank map caused by missing CSS or height.
- No broken image layout.
- No fabricated menu information.

Fix all errors encountered during testing before completing the implementation.

---

## FINAL EXPECTED OUTPUT

Deliver a functional FoodFinder frontend focused ONLY on:

1. Restaurant discovery.
2. OpenStreetMap integration.
3. Restaurant markers and locations.
4. Restaurant details.
5. Restaurant menus.
6. Restaurant-owner accounts, ownership verification, and menu publishing.

The application must use React JS, Axios, OpenStreetMap, Overpass API, Leaflet, and React Leaflet.

Prioritize a working implementation over unnecessary visual effects or additional functionalities.

Do not simply generate a UI mockup. Implement the actual API integration and interactive map behavior.

Provide the complete source code, installation commands, environment configuration if needed, and clear instructions for running the application locally.
