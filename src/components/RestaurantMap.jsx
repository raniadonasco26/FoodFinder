import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hand, LocateFixed } from 'lucide-react';
import { icon } from 'leaflet';
import { CircleMarker, MapContainer, Marker, Pane, Polygon, Popup, TileLayer, Tooltip, useMap, useMapEvent } from 'react-leaflet';
import markerUrl from 'leaflet/dist/images/marker-icon.png';
import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { fetchCebuCityRestaurants } from '../services/restaurantApi';
import { fetchPublishedLocations, mergeRestaurantLocations } from '../services/ownerMenus';
import { CEBU_CITY_BOUNDS, CEBU_CITY_CENTER, CEBU_CITY_MAP_RINGS, isInCebuCity } from '../data/cebuCity';

const MAX_RESTAURANT_PINS = 100;

const outsideCityMask = [
  [[85, -180], [85, 180], [-85, 180], [-85, -180]],
  ...CEBU_CITY_MAP_RINGS,
];

const restaurantIcon = icon({
  className: 'cebu-map-pin',
  iconUrl: markerUrl,
  iconRetinaUrl: markerRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function CenterOnUser({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) map.setView(userLocation, Math.max(map.getZoom(), 15));
  }, [map, userLocation]);

  return null;
}

function MapPanning({ enabled }) {
  const map = useMap();

  useEffect(() => {
    if (enabled) map.dragging.enable();
    else map.dragging.disable();
  }, [enabled, map]);

  return null;
}

const RestaurantPin = memo(function RestaurantPin({ restaurant }) {
  return (
    <Marker position={[restaurant.lat, restaurant.lon]}
      icon={restaurantIcon} title={restaurant.name} alt={restaurant.name}>
      <Popup autoPan={false}>
        <strong>{restaurant.name}</strong><br />
        <Link to={'/restaurant/' + restaurant.id} state={{ osmRestaurant: restaurant }}>
          View restaurant details
        </Link>
      </Popup>
    </Marker>
  );
});

const RestaurantMarkers = memo(function RestaurantMarkers({ restaurants }) {
  const map = useMap();
  const [bounds, setBounds] = useState(() => map.getBounds());
  useMapEvent('moveend', () => setBounds(map.getBounds()));

  if (!restaurants) return null;

  const visible = restaurants.filter(({ lat, lon }) => bounds.contains([lat, lon]));
  if (visible.length > MAX_RESTAURANT_PINS) {
    const center = bounds.getCenter();
    const longitudeScale = Math.cos(center.lat * Math.PI / 180);
    const distanceSquared = ({ lat, lon }) =>
      (lat - center.lat) ** 2 + ((lon - center.lng) * longitudeScale) ** 2;
    visible.sort((first, second) => distanceSquared(first) - distanceSquared(second));
  }

  return visible.slice(0, MAX_RESTAURANT_PINS).map(restaurant => (
    <RestaurantPin key={restaurant.id} restaurant={restaurant} />
  ));
});

export default function RestaurantMap() {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [panning, setPanning] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(async () => {
      if (controller.signal.aborted) return;
      const [osm, owned] = await Promise.allSettled([
        fetchCebuCityRestaurants(controller.signal), fetchPublishedLocations(controller.signal),
      ]);
      if (controller.signal.aborted) return;
      const locations = owned.value ?? [];
      if (osm.status === 'rejected' && !locations.length) setResult({ error: true });
      else setResult({ restaurants: mergeRestaurantLocations(osm.value ?? [], locations) });
    });

    return () => controller.abort();
  }, [attempt]);

  function locateUser() {
    if (!window.isSecureContext) {
      setLocationError('Location access requires HTTPS or localhost.');
      return;
    }
    if (!navigator.geolocation) {
      setLocationError('This browser does not support location access.');
      return;
    }

    setLocationError('');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        if (!isInCebuCity(coords.latitude, coords.longitude)) {
          setUserLocation(null);
          setLocationError('Your location is outside Cebu City. You can still explore the city on the map.');
          return;
        }
        setUserLocation([coords.latitude, coords.longitude]);
      },
      error => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Allow location access in your browser settings, then try again.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Getting your location timed out. Try again.');
        } else {
          setLocationError('Your location is currently unavailable. Try again.');
        }
      },
      { timeout: 10000, maximumAge: 30000 }
    );
  }

  return (
    <section className="cebu-map-section" aria-label="Cebu City restaurant map">
      <div className="cebu-map-header">
        <h2 className="editorial-serif">Restaurants in Cebu City</h2>
        <div className="cebu-map-actions">
          <button type="button" className={`btn btn-${panning ? 'primary' : 'secondary'} btn-sm`}
            aria-pressed={panning} onClick={() => setPanning(value => !value)}>
            <Hand size={16} aria-hidden="true" />
            <span>Pan map</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={locateUser} disabled={locating}>
            <LocateFixed size={16} aria-hidden="true" />
            <span>{locating ? 'Locating…' : 'Use my location'}</span>
          </button>
        </div>
      </div>
      {locationError && <p className="results-count-text" role="alert" style={{ marginBottom: '8px' }}>{locationError}</p>}
      <span className="results-count-text" role="status">
        {locating ? 'Checking your current location…' : userLocation && !locationError ? 'Your location is shown on the map.' : ''}
      </span>
      <MapContainer center={CEBU_CITY_CENTER} zoom={14} minZoom={11} maxZoom={19}
        dragging={false} scrollWheelZoom={false} maxBounds={CEBU_CITY_BOUNDS} maxBoundsViscosity={1}
        className="cebu-map-viewport">
        <MapPanning enabled={panning} />
        <CenterOnUser userLocation={userLocation} />
        <TileLayer noWrap className="cebu-map-tiles" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' />
        <Pane name="cebu-city-mask" style={{ zIndex: 350, pointerEvents: 'none' }}>
          <Polygon positions={outsideCityMask} interactive={false}
            pathOptions={{ stroke: false, fillColor: 'var(--color-lavender-light)', fillOpacity: 1, fillRule: 'evenodd' }} />
          <Polygon positions={CEBU_CITY_MAP_RINGS} interactive={false}
            pathOptions={{ color: 'var(--color-secondary)', weight: 2, fill: false }} />
        </Pane>
        {userLocation && (
          <Pane name="cebu-user-location" style={{ zIndex: 625, pointerEvents: 'none' }}>
            <CircleMarker center={userLocation} radius={10} interactive={false}
              pathOptions={{ className: 'user-location-marker', color: 'var(--color-white)', weight: 3, fillColor: 'var(--color-primary-deep)', fillOpacity: 1 }}>
              <Tooltip permanent direction="top" offset={[0, -16]} opacity={1} className="user-location-label">
                You are here
              </Tooltip>
            </CircleMarker>
          </Pane>
        )}
        <RestaurantMarkers restaurants={result?.restaurants} />
      </MapContainer>
      <div className="results-count-text" style={{ marginTop: '8px' }}>
        {result?.error ? (
          <div role="alert">
            Couldn’t load map restaurants.{' '}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
              setResult(null);
              setAttempt(value => value + 1);
            }}>
              Retry
            </button>
          </div>
        ) : (
          <p role="status">
            {!result ? 'Loading Cebu City restaurants…'
              : result.restaurants.length === 0 ? 'No restaurants found in Cebu City.'
              : result.restaurants.length + (result.restaurants.length === 1 ? ' restaurant in Cebu City' : ' restaurants in Cebu City')}
            {result?.restaurants.length > MAX_RESTAURANT_PINS &&
              ` · Up to ${MAX_RESTAURANT_PINS} pins per view. Pan or zoom to explore more.`}
          </p>
        )}
      </div>
    </section>
  );
}
