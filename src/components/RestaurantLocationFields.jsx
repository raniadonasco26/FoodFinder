import { useState } from 'react';
import { isInCebuCity } from '../data/cebuCity';

export function readRestaurantLocation(fields) {
  const address = fields.get('address').trim();
  const latitude = Number(fields.get('latitude'));
  const longitude = Number(fields.get('longitude'));
  if (!address || !isInCebuCity(latitude, longitude)) {
    throw new Error('Enter a street address and coordinates within Cebu City.');
  }
  return { listing_address: address, listing_latitude: latitude, listing_longitude: longitude };
}

export default function RestaurantLocationFields({ location, busy }) {
  const [latitude, setLatitude] = useState(location?.latitude ?? '');
  const [longitude, setLongitude] = useState(location?.longitude ?? '');
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState('');

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage('Enter the coordinates manually. Location access is unavailable.');
      return;
    }
    setLocating(true);
    setMessage('');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setLocating(false);
      if (!isInCebuCity(coords.latitude, coords.longitude)) {
        setMessage('Your current location is outside Cebu City.');
        return;
      }
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      setMessage('Coordinates filled. Check that they match the restaurant entrance.');
    }, () => {
      setLocating(false);
      setMessage('Could not get your location. Enter the coordinates manually.');
    }, { enableHighAccuracy: true, timeout: 12000 });
  }

  return <>
    <label>Street address<input name="address" autoComplete="street-address" maxLength={500} defaultValue={location?.address} required /></label>
    <div className="owner-coordinates">
      <label>Latitude<input name="latitude" type="number" step="any" min="-90" max="90"
        value={latitude} onChange={event => setLatitude(event.target.value)} required /></label>
      <label>Longitude<input name="longitude" type="number" step="any" min="-180" max="180"
        value={longitude} onChange={event => setLongitude(event.target.value)} required /></label>
    </div>
    <button type="button" className="btn btn-secondary btn-sm" disabled={busy || locating} onClick={useCurrentLocation}>
      {locating ? 'Finding your location…' : 'Use my current location'}
    </button>
    {message && <p role="status">{message}</p>}
  </>;
}
