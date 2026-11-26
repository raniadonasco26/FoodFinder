import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LocateFixed } from 'lucide-react';
import { icon } from 'leaflet';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import markerUrl from 'leaflet/dist/images/marker-icon.png';
import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { fetchCebuCityRestaurants } from '../services/restaurantApi';
import { CEBU_CITY_BOUNDS, CEBU_CITY_CENTER, isInCebuCity } from '../data/cebuCity';

const restaurantIcon = icon({
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

const RestaurantMarkers = memo(function RestaurantMarkers({ restaurants }) {
  return restaurants?.map(restaurant => (
    <Marker key={restaurant.id} position={[restaurant.lat, restaurant.lon]}
      icon={restaurantIcon} title={restaurant.name} alt={restaurant.name}>
      <Popup autoPan={false}>
        <strong>{restaurant.name}</strong><br />
        <Link to={'/restaurant/' + restaurant.id} state={{ osmRestaurant: restaurant }}>
          View restaurant details
        </Link>
      </Popup>
    </Marker>
  ));
});

export default function RestaurantMap() {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(async () => {
      if (controller.signal.aborted) return;
      try {
        const restaurants = await fetchCebuCityRestaurants(controller.signal);
        if (!controller.signal.aborted) setResult({ restaurants });
      } catch {
        if (!controller.signal.aborted) setResult({ error: true });
      }
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        <h2 className="editorial-serif" style={{ fontSize: '1.4rem' }}>
          Explore Cebu City restaurants
        </h2>
        <button type="button" className="btn btn-secondary btn-sm" onClick={locateUser} disabled={locating}>
          <LocateFixed size={16} aria-hidden="true" />
          <span>{locating ? 'Locating…' : 'Use my location'}</span>
        </button>
      </div>
      {locationError && <p className="results-count-text" role="alert" style={{ marginBottom: '8px' }}>{locationError}</p>}
      <span className="results-count-text" role="status">
        {locating ? 'Checking your current location…' : userLocation && !locationError ? 'The blue dot shows your location.' : ''}
      </span>
      <MapContainer center={CEBU_CITY_CENTER} zoom={14} minZoom={11} maxZoom={19}
        scrollWheelZoom={false} maxBounds={CEBU_CITY_BOUNDS} maxBoundsViscosity={1}
        className="cebu-map-viewport">
        <CenterOnUser userLocation={userLocation} />
        <TileLayer noWrap url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' />
        {userLocation && (
          <CircleMarker center={userLocation} radius={8} interactive={false}
            pathOptions={{ className: 'user-location-marker', color: '#fff', weight: 3, fillColor: '#1762ce', fillOpacity: 1 }} />
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
          </p>
        )}
      </div>
    </section>
  );
}
