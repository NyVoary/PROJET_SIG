import stationAPI from "./api.js";
import filterManager from "./filters.js";
import mapManager from "./map.js";

class App {
  constructor() {
    this.stations = [];
    this.routePoints = [];
    this.routeVisible = true;
  }

  async init() {
    // Initialiser la carte
    mapManager.init();

    // Initialiser les filtres
    filterManager.init(this.onFilterChange.bind(this));

    // Charger la route et les stations
    await Promise.all([this.loadRoute(), this.loadInitialStations()]);

    // Setup UI events
    this.setupUIEvents();

    // CORRECTION : Synchroniser l'état initial
    this.syncRouteState();

    // Exposer certaines méthodes globalement pour les boutons HTML
    window.app = this;
  }

  syncRouteState() {
    // Synchroniser l'état de la route avec l'interface
    const routeCheckbox = document.getElementById("show-route");
    const routeBtn = document.getElementById("routeToggleBtn");

    // S'assurer que la route est visible par défaut
    this.routeVisible = true;

    if (routeCheckbox) {
      routeCheckbox.checked = this.routeVisible;
    }

    if (routeBtn) {
      if (this.routeVisible) {
        routeBtn.textContent = "🗺️ Masquer Route";
        routeBtn.style.backgroundColor = "#f44336";
      } else {
        routeBtn.textContent = "🗺️ Afficher Route";
        routeBtn.style.backgroundColor = "#4CAF50";
      }
    }
  }

  async loadRoute() {
    try {
      console.log("Début du chargement de la route...");

      // Charger les points de la route
      // Charger les points de la route
      this.routePoints = await stationAPI.getRoute();

      // 🔄 Réorganiser les points pour avoir une route continue
      this.routePoints = this.orderRouteByProximity(this.routePoints);

      // Vérifier si on a des données
      if (!this.routePoints || this.routePoints.length === 0) {
        console.error("Aucun point de route trouvé");
        return;
      }

      // Charger les informations de la route
      const routeInfo = await stationAPI.getRouteInfo();
      console.log("Infos de route récupérées:", routeInfo);

      // Afficher la route sur la carte
      mapManager.displayRoute(this.routePoints);

      // Mettre à jour les informations dans le panneau
      this.updateRouteInfo(routeInfo);

      console.log(
        `Route chargée avec succès: ${this.routePoints.length} points`
      );
    } catch (error) {
      console.error("Erreur lors du chargement de la route:", error);
    }
  }

  debugRoute() {
    console.log("État de la route:", {
      routeVisible: this.routeVisible,
      routePointsCount: this.routePoints?.length || 0,
      routePoints: this.routePoints?.slice(0, 3), // Premiers points
      mapManager: mapManager,
      routePolyline: mapManager.routePolyline,
    });
  }

  updateRouteInfo(routeInfo) {
    const routeInfoElement = document.getElementById("routeInfo");
    if (!routeInfoElement || !routeInfo || !this.routePoints) return;

    const highways = routeInfo.highways || [];
    const totalPoints = routeInfo.totalPoints || this.routePoints.length;
    const startCity = routeInfo.startCity || "Début inconnu";
    const endCity = routeInfo.endCity || "Fin inconnue";

    // Calculer la distance totale de la route (en km)
    const totalDistanceKm = this.calculateTotalDistance(this.routePoints);

    // Générer les liens vers les way/ID
    const routeListHTML = highways.length
      ? `
      <details style="margin-top: 5px;">
        <summary style="cursor:pointer; color:#007bff;">
          Voir les ${highways.length} segments OSM
        </summary>
        <div style="columns: 2; font-size: 12px; color: #444; margin-top: 6px;">
          ${highways
            .map((h) => {
              const id = h.replace("way/", "");
              return `<a href="https://www.openstreetmap.org/way/${id}" target="_blank">${h}</a>`;
            })
            .join("<br>")}
        </div>
      </details>
    `
      : "<em>Aucun segment trouvé</em>";

    // Injecter dans le DOM
    routeInfoElement.innerHTML = `
    <div style="font-size: 13px; line-height: 1.6;">
      <strong style="font-size: 14px;">🗺️ ${
        routeInfo.description || "Route Andoharanofotsy - Analakely"
      }</strong><br>
      🧭 Trajet : <strong>${startCity}</strong> → <strong>${endCity}</strong><br>
      📍 Points GPS : ${totalPoints}<br>
      📏 Distance estimée : <strong>${totalDistanceKm.toFixed(
        2
      )} km</strong><br>
      ${routeListHTML}
    </div>
  `;
  }

  calculateTotalDistance(points) {
    const R = 6371; // Rayon de la Terre en km

    let distance = 0;

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];

      if (!p1 || !p2) continue;

      const dLat = this.degToRad(p2.lat - p1.lat);
      const dLng = this.degToRad(p2.lng - p1.lng);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(this.degToRad(p1.lat)) *
          Math.cos(this.degToRad(p2.lat)) *
          Math.sin(dLng / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance += R * c;
    }

    return distance; // en km
  }

  degToRad(deg) {
    return deg * (Math.PI / 180);
  }

  async loadInitialStations() {
    const allStations = await stationAPI.getAllStations();
    // Filtrer les stations qui ont des coordonnées valides
    this.stations = allStations.filter(
      (station) =>
        station.lat !== null &&
        station.lng !== null &&
        station.type === "gasoil"
    );
    mapManager.updateStations(this.stations);

    console.log(`Stations chargées: ${this.stations.length}`);
  }

  onFilterChange(filteredStations) {
    // Filtrer également les stations avec coordonnées valides
    const validStations = filteredStations.filter(
      (station) => station.lat !== null && station.lng !== null
    );
    mapManager.updateStations(validStations);
  }

  // Nouvelle méthode pour basculer l'affichage de la route
  toggleRouteDisplay(show) {
    this.routeVisible = show;
    mapManager.toggleRoute(show);

    // Mettre à jour la checkbox dans le panneau
    const routeCheckbox = document.getElementById("show-route");
    if (routeCheckbox) {
      routeCheckbox.checked = show;
    }
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

    // Gérer la checkbox de la route dans le panneau des filtres
    const routeCheckbox = document.getElementById("show-route");
    if (routeCheckbox) {
      routeCheckbox.addEventListener("change", (e) => {
        this.toggleRouteDisplay(e.target.checked);

        // Mettre à jour le bouton principal
        const routeBtn = document.getElementById("routeToggleBtn");
        if (routeBtn) {
          if (e.target.checked) {
            routeBtn.textContent = "🗺️ Masquer Route";
            routeBtn.style.backgroundColor = "#f44336";
          } else {
            routeBtn.textContent = "🗺️ Afficher Route";
            routeBtn.style.backgroundColor = "#4CAF50";
          }
        }
      });
    }
  }

  orderRouteByProximity(points) {
    if (!points || points.length < 2) return points;

    const ordered = [points[0]];
    const remaining = [...points.slice(1)];

    while (remaining.length > 0) {
      const last = ordered[ordered.length - 1];
      let nearestIndex = 0;
      let nearestDist = this.getDistance(last, remaining[0]);

      for (let i = 1; i < remaining.length; i++) {
        const dist = this.getDistance(last, remaining[i]);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIndex = i;
        }
      }

      ordered.push(remaining[nearestIndex]);
      remaining.splice(nearestIndex, 1);
    }

    return ordered;
  }

  getDistance(p1, p2) {
    const R = 6371; // Rayon de la Terre
    const dLat = this.degToRad(p2.lat - p1.lat);
    const dLng = this.degToRad(p2.lng - p1.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.degToRad(p1.lat)) *
        Math.cos(this.degToRad(p2.lat)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
