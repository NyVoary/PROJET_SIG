class StationAPI {
    constructor() {
        this.baseURL = '/api/stations';
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
            const params = new URLSearchParams(filters);
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
}

export default new StationAPI();