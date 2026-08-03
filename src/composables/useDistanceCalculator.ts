export function useDistanceCalculator() {
  /**
   * Calculates the distance in kilometers between two geographic coordinates using the Haversine formula.
   *
   * @param lat1 Latitude of the first point
   * @param lng1 Longitude of the first point
   * @param lat2 Latitude of the second point
   * @param lng2 Longitude of the second point
   * @returns Distance in kilometers
   */
  function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * Formats a distance in kilometers into a human-readable string.
   * If the distance is less than 1 km, it returns meters (e.g. "500m").
   * Otherwise, it returns kilometers with 1 decimal place (e.g. "2.5km").
   *
   * @param km Distance in kilometers
   * @returns Formatted distance string
   */
  function formatDistance(km: number): string {
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  }

  return {
    haversineKm,
    formatDistance
  };
}
