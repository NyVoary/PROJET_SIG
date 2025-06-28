class StationAPI {
    constructor() {
        // URL complète vers le backend
        this.baseURL = 'http://localhost:3000/api/stations';
    }

    async getAllStations() {
        try {
            const response = await fetch(this.baseURL);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Erreur API getAllStations:', error);
            return [];
        }
    }

    async searchStations(filters) {
        try {
            // Convertir les filtres en URLSearchParams
            const params = new URLSearchParams();
            
            // Gérer les filtres qui sont des tableaux
            Object.keys(filters).forEach(key => {
                if (Array.isArray(filters[key])) {
                    // Pour les tableaux, les joindre avec des virgules
                    params.append(key, filters[key].join(','));
                } else {
                    params.append(key, filters[key]);
                }
            });

            const response = await fetch(`${this.baseURL}/search?${params}`);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Erreur API searchStations:', error);
            return [];
        }
    }

    async getAvailableFilters() {
        try {
            const response = await fetch(`${this.baseURL}/filters`);
            const data = await response.json();
            return data.success ? data.data : {};
        } catch (error) {
            console.error('Erreur API getAvailableFilters:', error);
            return {};
        }
    }

    async getStationById(id) {
        try {
            const response = await fetch(`${this.baseURL}/${id}`);
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Erreur API getStationById:', error);
            return null;
        }
    }

    async getItinerary() {
        try {
            const response = await fetch('http://localhost:3000/api/itinerary');
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Erreur API getItinerary:', error);
            return null;
        }
    }
}

export default new StationAPI();