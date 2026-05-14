export function getDistanceInMeters(
  pointA: [number, number],
  pointB: [number, number]
) {
  const earthRadius = 6371000;

  const lat1 = (pointA[0] * Math.PI) / 180;
  const lat2 = (pointB[0] * Math.PI) / 180;

  const deltaLat = ((pointB[0] - pointA[0]) * Math.PI) / 180;
  const deltaLng = ((pointB[1] - pointA[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}