
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
/**
 * Calculates the great-circle distance between two points on the Earth's surface using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of the first point in decimal degrees.
 * @param {number} lng1 - Longitude of the first point in decimal degrees.
 * @param {number} lat2 - Latitude of the second point in decimal degrees.
 * @param {number} lng2 - Longitude of the second point in decimal degrees.
 * @returns {number} The distance between the two points in kilometers.
 *
 * @example
 * Returns approximately 3936.91 (distance between New York and Los Angeles)
 * haversineDistance(40.7128, -74.0060, 34.0522, -118.2437);
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in kilometers
}
module.exports = {
    haversineDistance
}