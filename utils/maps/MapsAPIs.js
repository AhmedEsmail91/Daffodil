const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const axios = require('axios');
class APIs {
    static async getRegionFromGoogle(lat, lng, language) {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=${language}`;
        const response = await axios.get(geocodeUrl);
        const components = response.data.results[0]?.address_components || [];
        const governorate = components.find(c => c.types.includes('administrative_area_level_1'));
        const subRegion =
            components.find(c => c.types.includes('administrative_area_level_2')) ||
            components.find(c => c.types.includes('locality')) ||
            components.find(c => c.types.includes('sublocality'));

        return {
            governorate: governorate?.long_name || null,
            subRegion: subRegion?.long_name || null,
            response: response.data,
        };
    };
    static async getRegionFromOpenCage(lat, lng, language, currentLocation) {
        try {
            const apiKey = process.env.OPENCAGE_API_KEY;
            // console.log(AppliedLang,language)
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&language=${language}`;
            const response = await axios.get(url);
            const components = response.data.results[0]?.components || {};

            return {
                governorate: components.state || null,
                subRegion: components.city || components.county || null,
                response: response.data
            };
        } catch (error) {
            console.error('OpenCage geocoding error:', error.message);
            return {
                governorate: null,
                subRegion: null
            };
        }
    }
    static async getRegionFromNominatim(lat, lng, language) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${language}`;
            const response = await axios.get(url);
            const address = response.data.address || {};

            return {
                governorate: address.state || null,
                subRegion: address.city || address.town || address.village || null,
                response: response.data
            };
        } catch (error) {
            console.error('Nominatim geocoding error:', error.message);
            return {
                governorate: null,
                subRegion: null
            };
        }
    }
    static async getSupplierRegions(suppliers, language, API = "google", info = false) {
        const groupedArray = [];
        if (!suppliers || suppliers.length === 0) {
            return groupedArray; // Return empty array if no suppliers
        }
        const calledAPI = {
            "google": getRegionFromGoogle,
            "opencage": getRegionFromOpenCage,
            "nominatim": getRegionFromNominatim
        };
        for (const supplier of suppliers) {
            const {
                lat,
                lng,
                id
            } = supplier;
            let regionInfo;
            try {
                regionInfo = await calledAPI[API](lat, lng, language);
            } catch (error) {
                console.error('Geocoding error:', error.message);
                continue; // Skip this supplier if geocoding fails
            }
            if (regionInfo.governorate && regionInfo.subRegion) {
                groupedArray.push({
                    supplier_id: id,
                    governorate: regionInfo.governorate || null,
                    subRegion: regionInfo.subRegion || null,
                    info: info ? (regionInfo.response || null) : null,
                });

            }
        }
        return groupedArray;
    }
    static groupSuppliersByRegion(suppliers) {
        const governorateMap = {};
        console.log("groupSuppliersByRegion", suppliers.length)
        suppliers.forEach(({
            supplier_id,
            governorate,
            subRegion
        }) => {
            if (!governorateMap[governorate]) {
                governorateMap[governorate] = {};
            }

            if (!governorateMap[governorate][subRegion]) {
                governorateMap[governorate][subRegion] = [];
            }

            governorateMap[governorate][subRegion].push(supplier_id);
        });

        // Convert map to desired structure
        return Object.entries(governorateMap).map(([govName, subRegionsObj]) => ({
            name: govName,
            subRegions: Object.entries(subRegionsObj).map(([subName, supplierIds]) => ({
                name: subName,
                supplierIds
            }))
        }));
    }
}
module.exports = APIs;