const {haversineDistance} = require("./GeoCommons");
class HardCodedMaps {
    // Cluster suppliers by displacement
    /** * Clusters suppliers based on their displacement values.
     * @param {Array} suppliers - Array of supplier objects {index, supplier_id, Displacement, SupplierCoordinates}, each with a Displacement property.
     * @param {Number} margin - The maximum difference in displacement to consider suppliers in the same
     * cluster. Default is 2.5.
     * @returns {Array} An array of clusters, where each cluster is an object with a key like 'cluster1', 'cluster2', etc., and the value is an array of suppliers in that cluster.
     */
    static clusterByDisplacement(suppliers, margin = 2.5) {
        const sorted = [...suppliers].sort((a, b) => a.Displacement - b.Displacement);
        const clusters = [];
        let currentCluster = [];

        for (let i = 0; i < sorted.length; i++) {
            if (currentCluster.length === 0) {
                currentCluster.push(sorted[i]);
            } else {
                const first = currentCluster[0].Displacement;
                if (Math.abs(sorted[i].Displacement - first) <= margin) {
                    currentCluster.push(sorted[i]);
                } else {
                    clusters.push(currentCluster);
                    currentCluster = [sorted[i]];
                }
            }
        }

        if (currentCluster.length > 0) {
            clusters.push(currentCluster);
        }
        // Enhance: Return clusters with meta info and better structure
        return clusters.map((cluster, index) => {
            const averageDisplacement = cluster.reduce((sum, supplier) => sum + supplier.Displacement, 0) / cluster.length;
            return {
                regionName: `region ${index + 1}`,
                suppliers: cluster.map(supplier => ({
                    supplier_id: supplier.supplier_id,
                    Displacement: supplier.Displacement,
                    // SupplierCoordinates: supplier.SupplierCoordinates
                })),
                meta: {
                    count: cluster.length,
                    minDisplacement: Math.min(...cluster.map(s => s.Displacement)),
                    maxDisplacement: Math.max(...cluster.map(s => s.Displacement)),
                    averageDisplacement: Number(averageDisplacement.toFixed(3))
                }
            };
        });
    }
    /**
     * 
     * @param {Array} suppliersPositions [{lat: number, lng: number}]
     * @param {Object} currentLocation {lat: number, lng: number}
     * @param {Number} distance // Distance in KM to filter suppliers
     * @returns {Array} Filtered suppliers with their displacement
     */
    static filterSuppliersByDistance(suppliersPositions, currentLocation, distanceKM = 10, clusteringRange = 2.5) {
        if (!suppliersPositions || suppliersPositions.length === 0) {
            return false;
        }
        const haversine = suppliersPositions.map((supplier, index) => {
            const Displacement = haversineDistance(
                currentLocation.lat,
                currentLocation.lng,
                supplier.lat,
                supplier.lng);
            return {
                supplier_id: supplier.id,
                Displacement: Number(Displacement.toFixed(3)),
                SupplierCoordinates: {
                    lat: supplier.lat,
                    lng: supplier.lng
                },
            };
        });
        const filteredSuppliers = haversine.filter(supplier => supplier.Displacement <= (distanceKM));

        const data = this.clusterByDisplacement(filteredSuppliers, clusteringRange);
        return data;
    }
}
module.exports = HardCodedMaps;