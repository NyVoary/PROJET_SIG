const map = L.map("map").setView([-18.9333, 47.5167], 13);

// Fond de carte OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OSM",
}).addTo(map);

// Tracer l’itinéraire (exemple fixe, remplace par l’API plus tard)
const route = L.polyline(
  [
    // [-18.9735, 47.532], // Andoharanofotsy
    // [-18.9333, 47.5167], // Analakely
  ],
  { color: "blue" }
).addTo(map);

// Fonction pour charger les stations depuis le backend
function loadStations(distance = 1000) {
  //   fetch(`/api/stations?distance=${distance}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       L.geoJSON(data, {
  //         onEachFeature: function (feature, layer) {
  //           const props = feature.properties;
  //           layer.bindPopup(`
  //             <strong>${props.nom}</strong><br/>
  //             Carburants : ${props.carburants.join(", ")}<br/>
  //             Services : ${props.services.join(", ")}<br/>
  //             Horaires : ${props.horaires}
  //           `);
  //         },
  //         pointToLayer: function (feature, latlng) {
  //           return L.marker(latlng, {
  //             icon: L.icon({
  //               iconUrl:
  //                 "https://cdn-icons-png.flaticon.com/512/1045/1045707.png",
  //               iconSize: [25, 25],
  //             }),
  //           });
  //         },
  //       }).addTo(map);
  //     })
  //     .catch((err) => console.error("Erreur chargement stations:", err));

  const data = fakeStations;
  displayStations(data);  
}

function displayStations(data) {
  // Supprime anciens calques
  stationLayer && map.removeLayer(stationLayer);
  // Ajoute GeoJSON
  stationLayer = L.geoJSON(data, {
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      layer.bindPopup(`
        <strong>${p.nom}</strong><br/>
        Carburants : ${p.carburants.join(', ')}<br/>
        Services : ${p.services.join(', ')}<br/>
        Horaires : ${p.horaires}
      `);
    },
    pointToLayer: (feature, latlng) => L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'https://cdn-icons‑png.flaticon.com/512/1045/1045707.png',
        iconSize: [25, 25]
      })
    })
  }).addTo(map);
}
// Charger les stations par défaut
loadStations();

// Réagir au changement de filtre de distance
document.getElementById("distance").addEventListener("change", (e) => {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.GeoJSON) {
      map.removeLayer(layer);
    }
  });
  //   route.addTo(map); // Re-affiche la route
  loadStations(e.target.value);
});

const fakeStations = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [47.532, -18.9731] },
      properties: {
        nom: "OMH – Andoharanofotsy",
        carburants: ["Essence", "Gasoil"],
        services: ["Toilettes"],
        horaires: "6h–20h",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [47.525, -18.95] },
      properties: {
        nom: "OMH – Galana",
        carburants: ["Essence", "Gasoil"],
        services: ["Shop"],
        horaires: "6h–22h",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [47.51756, -18.919617] },
      properties: {
        nom: "Shell – Anosibe",
        carburants: ["Essence"],
        services: ["Air", "Toilettes"],
        horaires: "24h",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [47.5269, -18.9065] },
      properties: {
        nom: "OMH – Analakely",
        carburants: ["Essence", "Gasoil"],
        services: ["Shop", "Lavage"],
        horaires: "6h–22h",
      },
    },
  ],
};
