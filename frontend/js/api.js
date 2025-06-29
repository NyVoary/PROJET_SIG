class StationAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api/stations';
        this.routeURL = 'http://localhost:3000/api/route';
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

    // Nouvelles méthodes pour la route
    async getRoute() {
        try {
            const response = await fetch(this.routeURL);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Erreur API getRoute:', error);
            return [];
        }
    }

    async getRouteInfo() {
        try {
            const response = await fetch(`${this.routeURL}/info`);
            const data = await response.json();
            return data.success ? data.data : {};
        } catch (error) {
            console.error('Erreur API getRouteInfo:', error);
            return {};
        }
    }
}

export default new StationAPI();