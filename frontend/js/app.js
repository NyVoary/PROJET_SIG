import stationAPI from "./api.js";
import filterManager from "./filters.js";
import mapManager from "./map.js";

class App {
  constructor() {
    this.stations = [];
  }

  async init() {
    // Initialiser la carte
    mapManager.init();

    // Initialiser les filtres
    filterManager.init(this.onFilterChange.bind(this));

    // Charger les stations initiales
    await this.loadInitialStations();

    // Setup UI events
    this.setupUIEvents();
  }

  async loadInitialStations() {
    const allStations = await stationAPI.getAllStations();
    this.stations = allStations.filter((station) => station.type === "gasoil");
    mapManager.updateStations(this.stations);
  }

  onFilterChange(filteredStations) {
    mapManager.updateStations(filteredStations);
  }

  setupUIEvents() {
    // Toggle filters panel
    const toggleBtn = document.querySelector(".toggle-btn");
    const filtersPanel = document.getElementById("filtersPanel");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        filtersPanel.classList.toggle("hidden");
      });
    }

    // Close filters panel
    const closeBtn = document.querySelector(".close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        filtersPanel.classList.add("hidden");
      });
    }
  }
}

// Initialiser l'app quand le DOM est prêt
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();

  // Attendre que Google Maps soit chargé
  window.initMap = () => {
    app.init();
  };
});
