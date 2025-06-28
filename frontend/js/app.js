let map;
let markers = [];
let allStations = []; // Stockage de toutes les stations

// Données d'exemple des stations (remplacez par vos vraies données)
const stationsData = [
  {
    name: "Shell Station Antananarivo Centre",
    lat: -18.8792,
    lng: 47.5079,
    services: ["gonflage", "alimentation", "carte-carburant"],
    fuel: ["shell-super-extra", "shell-diesel"],
    hours: ["actuellement-ouvert", "shop"],
    address: "Avenue de l'Indépendance",
  },
  {
    name: "Shell Express Analakely",
    lat: -18.9149,
    lng: 47.518,
    services: ["lavage", "alimentation"],
    fuel: ["shell-diesel"],
    hours: ["forecourt"],
    address: "Rue Analakely",
  },
  {
    name: "Station Shell Ivato",
    lat: -18.7969,
    lng: 47.4788,
    services: ["gonflage", "remplacement-gaz", "carte-carburant"],
    fuel: ["shell-super-extra", "shell-diesel"],
    hours: ["actuellement-ouvert", "shop", "forecourt"],
    address: "Route de l'Aéroport",
  },
];

function initMap() {
  // Centrer sur Antananarivo
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: { lat: -18.8792, lng: 47.5079 },
  });

  // Créer les marqueurs pour toutes les stations
  createMarkers();
}

function createMarkers() {
  // Supprimer les anciens marqueurs
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  stationsData.forEach((station) => {
    const marker = new google.maps.Marker({
      position: { lat: station.lat, lng: station.lng },
      map: map,
      title: station.name,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
                            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="15" cy="15" r="12" fill="#EA4335" stroke="white" stroke-width="2"/>
                                <text x="15" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">S</text>
                            </svg>
                        `),
        scaledSize: new google.maps.Size(30, 30),
      },
    });

    // InfoWindow pour chaque station
    const infoWindow = new google.maps.InfoWindow({
      content: `
                        <div style="padding: 10px; max-width: 250px;">
                            <h3 style="margin: 0 0 8px 0; color: #EA4335;">${
                              station.name
                            }</h3>
                            <p style="margin: 0 0 8px 0; color: #666;">${
                              station.address
                            }</p>
                            <div style="margin: 8px 0;">
                                <strong>Services:</strong><br>
                                ${station.services
                                  .map((s) => s.replace("-", " "))
                                  .join(", ")}
                            </div>
                            <div style="margin: 8px 0;">
                                <strong>Carburants:</strong><br>
                                ${station.fuel
                                  .map((f) => f.replace("-", " "))
                                  .join(", ")}
                            </div>
                        </div>
                    `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    markers.push({ marker, station });
  });

  allStations = [...markers];
}

function toggleFilters() {
  const panel = document.getElementById("filtersPanel");
  panel.classList.toggle("hidden");
}

function filterByStationName() {
  const searchTerm = document
    .getElementById("stationSearch")
    .value.toLowerCase();

  markers.forEach(({ marker, station }) => {
    const matchesName =
      station.name.toLowerCase().includes(searchTerm) ||
      station.address.toLowerCase().includes(searchTerm);

    if (matchesName || searchTerm === "") {
      // Vérifier aussi les autres filtres
      const matchesOtherFilters = checkOtherFilters(station);
      marker.setMap(matchesOtherFilters ? map : null);
    } else {
      marker.setMap(null);
    }
  });
}

function checkOtherFilters(station) {
  // Vérifier les filtres de services
  const serviceFilters = [
    "gonflage",
    "remplacement-gaz",
    "lavage",
    "alimentation",
    "carte-carburant",
  ];
  const checkedServices = serviceFilters.filter(
    (filter) => document.getElementById(filter).checked
  );

  if (checkedServices.length > 0) {
    const hasService = checkedServices.some((service) =>
      station.services.includes(service)
    );
    if (!hasService) return false;
  }

  // Vérifier les filtres de carburant
  const fuelFilters = ["shell-super-extra", "shell-diesel"];
  const checkedFuels = fuelFilters.filter(
    (filter) => document.getElementById(filter).checked
  );

  if (checkedFuels.length > 0) {
    const hasFuel = checkedFuels.some((fuel) => station.fuel.includes(fuel));
    if (!hasFuel) return false;
  }

  // Vérifier les filtres d'horaires
  const hourFilters = ["actuellement-ouvert", "shop", "forecourt"];
  const checkedHours = hourFilters.filter(
    (filter) => document.getElementById(filter).checked
  );

  if (checkedHours.length > 0) {
    const hasHours = checkedHours.some((hour) => station.hours.includes(hour));
    if (!hasHours) return false;
  }

  return true;
}

function applyFilters() {
  const searchTerm = document
    .getElementById("stationSearch")
    .value.toLowerCase();

  markers.forEach(({ marker, station }) => {
    // Vérifier le nom/adresse
    const matchesName =
      searchTerm === "" ||
      station.name.toLowerCase().includes(searchTerm) ||
      station.address.toLowerCase().includes(searchTerm);

    // Vérifier les autres filtres
    const matchesOtherFilters = checkOtherFilters(station);

    // Afficher le marqueur seulement si tous les critères sont respectés
    marker.setMap(matchesName && matchesOtherFilters ? map : null);
  });
}

// Initialiser la carte quand l'API Google Maps est chargée
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: { lat: -18.8792, lng: 47.5079 },
  });

  createMarkers();
}
