export function buildLineGeoJSON(pins) {
  if (!pins || pins.length < 2) return null;
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: pins.map((p) => [p.coordinates.lng, p.coordinates.lat]),
    },
  };
}

export function groupPinsByDay(pins) {
  const groups = {};
  for (const pin of pins) {
    if (!groups[pin.dayNumber]) groups[pin.dayNumber] = [];
    groups[pin.dayNumber].push(pin);
  }
  for (const day in groups) {
    groups[day].sort((a, b) => a.orderIndex - b.orderIndex);
  }
  return groups;
}

export function getNextOrderIndex(pins, dayNumber) {
  const dayPins = pins.filter((p) => p.dayNumber === dayNumber);
  if (dayPins.length === 0) return 0;
  return Math.max(...dayPins.map((p) => p.orderIndex)) + 1;
}

export function getBounds(pins) {
  if (!pins || pins.length === 0) return null;
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const pin of pins) {
    const { lng, lat } = pin.coordinates;
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function getDistanceMeters(coord1, coord2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinProximity(userCoords, pinCoords, radiusMeters) {
  return getDistanceMeters(userCoords, pinCoords) <= radiusMeters;
}
