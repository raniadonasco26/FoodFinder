import boundary from './cebuCityBoundary.json' with { type: 'json' };

export const CEBU_CITY_CENTER = [10.3157, 123.8854];
export const CEBU_CITY_AREA = 3600000000 + boundary.properties.osmRelationId;
const [west, south, east, north] = boundary.bbox;
export const CEBU_CITY_BOUNDS = [[south, west], [north, east]];
const { type, coordinates } = boundary.geometry;
const polygons = type === 'Polygon' ? [coordinates] : coordinates;
export const CEBU_CITY_MAP_RINGS = polygons.flatMap(polygon =>
  polygon.map(ring => ring.map(([lon, lat]) => [lat, lon])));

function containsPoint(ring, lat, lon) {
  let inside = false;
  for (let i = 0, previous = ring.length - 1; i < ring.length; previous = i++) {
    const [x, y] = ring[i];
    const [previousX, previousY] = ring[previous];
    if ((y > lat) !== (previousY > lat) &&
        lon < x + (previousX - x) * (lat - y) / (previousY - y)) {
      inside = !inside;
    }
  }
  return inside;
}

export function isInCebuCity(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) ||
      lat < south || lat > north || lon < west || lon > east) return false;

  return polygons.some(([outer, ...holes]) =>
    containsPoint(outer, lat, lon) && !holes.some(hole => containsPoint(hole, lat, lon)));
}
