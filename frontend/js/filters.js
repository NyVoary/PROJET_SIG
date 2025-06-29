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
        // Services - adapter aux données backend
        const serviceCheckboxes = document.querySelectorAll('[id^="service-"]:checked');
        const services = Array.from(serviceCheckboxes).map(cb => cb.id.replace('service-', ''));
        if (services.length > 0) {
            this.activeFilters.services = services;
        } else {
            delete this.activeFilters.services;
        }

        // Carburants - adapter aux données backend (gasoil, essence)
        const fuelCheckboxes = document.querySelectorAll('[id^="fuel-"]:checked');
        const fuels = Array.from(fuelCheckboxes).map(cb => cb.id.replace('fuel-', ''));
        if (fuels.length > 0) {
            this.activeFilters.fuel = fuels;
        } else {
            delete this.activeFilters.fuel;
        }

        // Horaires
        const hourCheckboxes = document.querySelectorAll('[id^="hour-"]:checked');
        const hours = Array.from(hourCheckboxes).map(cb => cb.id.replace('hour-', ''));
        if (hours.length > 0) {
            this.activeFilters.hours = hours;
        } else {
            delete this.activeFilters.hours;
        }

        // Opérateur
        const operatorCheckboxes = document.querySelectorAll('[id^="operator-"]:checked');
        const operators = Array.from(operatorCheckboxes).map(cb => cb.id.replace('operator-', ''));
        if (operators.length > 0) {
            this.activeFilters.operator = operators;
        } else {
            delete this.activeFilters.operator;
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
        const searchInput = document.getElementById('stationSearch');
        if (searchInput) {
            searchInput.value = '';
        }
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        this.applyFilters();
    }
}

export default new FilterManager();