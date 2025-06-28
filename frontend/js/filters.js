import stationAPI from './api.js';

class FilterManager {
    constructor() {
        this.activeFilters = {};
        this.onFilterChange = null;
    }

    init(onFilterChangeCallback) {
        this.onFilterChange = onFilterChangeCallback;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Recherche par nom
        const searchInput = document.getElementById('stationSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.updateFilter('name', e.target.value);
            });
        }

        // Checkboxes pour services, carburants, etc.
        const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFiltersFromCheckboxes();
            });
        });
    }

    updateFilter(key, value) {
        if (value) {
            this.activeFilters[key] = value;
        } else {
            delete this.activeFilters[key];
        }
        this.applyFilters();
    }

    updateFiltersFromCheckboxes() {
        const serviceCheckboxes = document.querySelectorAll('[id^="service-"]:checked');
        const fuelCheckboxes = document.querySelectorAll('[id^="fuel-"]:checked');
        const hourCheckboxes = document.querySelectorAll('[id^="hour-"]:checked');

        // Services
        const services = Array.from(serviceCheckboxes).map(cb => cb.id.replace('service-', ''));
        if (services.length > 0) {
            this.activeFilters.services = services;
        } else {
            delete this.activeFilters.services;
        }

        // Carburants
        const fuels = Array.from(fuelCheckboxes).map(cb => cb.id.replace('fuel-', ''));
        if (fuels.length > 0) {
            this.activeFilters.fuel = fuels;
        } else {
            delete this.activeFilters.fuel;
        }

        // Horaires
        const hours = Array.from(hourCheckboxes).map(cb => cb.id.replace('hour-', ''));
        if (hours.length > 0) {
            this.activeFilters.hours = hours;
        } else {
            delete this.activeFilters.hours;
        }

        this.applyFilters();
    }

    async applyFilters() {
        if (this.onFilterChange) {
            const stations = await stationAPI.searchStations(this.activeFilters);
            this.onFilterChange(stations);
        }
    }

    getActiveFilters() {
        return { ...this.activeFilters };
    }

    clearAllFilters() {
        this.activeFilters = {};
        // Reset UI
        document.getElementById('stationSearch').value = '';
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        this.applyFilters();
    }
}

export default new FilterManager();