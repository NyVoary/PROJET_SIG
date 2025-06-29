class MapManager {
  constructor() {
    this.map = null;
    this.markers = [];
    this.routePolyline = null;
    this.routePoints = [];
  }

  init() {
    this.map = new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      center: { lat: -18.983, lng: 47.533 },
      styles: [
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }],
        },
      ],
    });
  }

  updateStations(stations) {
    this.clearMarkers();
    this.createMarkers(stations);
  }

  // Nouvelle méthode pour afficher la route
  displayRoute(routePoints) {
    console.log(
      "MapManager.displayRoute appelé avec:",
      routePoints?.length,
      "points"
    );

    this.routePoints = routePoints;

    // Supprimer la route existante
    if (this.routePolyline) {
      this.routePolyline.setMap(null);
      console.log("Route existante supprimée");
    }

    if (!routePoints || routePoints.length === 0) {
      console.log("Aucun point de route à afficher");
      return;
    }

    // Vérifier la validité des points
    const validPoints = routePoints.filter(
      (point) =>
        point &&
        typeof point.lat === "number" &&
        typeof point.lng === "number" &&
        !isNaN(point.lat) &&
        !isNaN(point.lng)
    );

    console.log(`Points valides: ${validPoints.length}/${routePoints.length}`);

    if (validPoints.length === 0) {
      console.error("Aucun point valide trouvé");
      return;
    }

    // Créer le chemin de la route
    const path = validPoints.map((point) => ({
      lat: parseFloat(point.lat),
      lng: parseFloat(point.lng),
    }));

    console.log("Chemin créé:", path.slice(0, 3)); // Premiers points

    // Créer la polyline avec des options plus visibles
    this.routePolyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 6, // Plus épais pour être plus visible
      clickable: true,
      zIndex: 999, // Assurer que la route est visible
    });

    // Ajouter la polyline à la carte
    this.routePolyline.setMap(this.map);
    console.log("Polyline ajoutée à la carte");

    // Ajouter un événement de clic sur la route
    this.routePolyline.addListener("click", (event) => {
      this.showRouteInfo(event.latLng);
    });

    // Ajuster la vue pour inclure toute la route
    this.fitBoundsToRoute(validPoints);

    console.log("Route affichée avec succès");
  }
  
  // Ajuster la vue pour inclure toute la route
  fitBoundsToRoute(routePoints) {
    if (routePoints.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    routePoints.forEach((point) => {
      bounds.extend(new google.maps.LatLng(point.lat, point.lng));
    });

    this.map.fitBounds(bounds);

    // Ajuster le zoom si nécessaire
    const listener = google.maps.event.addListener(this.map, "idle", () => {
      if (this.map.getZoom() > 15) this.map.setZoom(15);
      google.maps.event.removeListener(listener);
    });
  }

  // Afficher les informations de la route
  showRouteInfo(latLng) {
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 8px 0; color: #FF0000;">Route Andoharanofotsy - Analakely</h3>
          <p style="margin: 0; color: #666;">Cliquez sur une station pour plus d'informations</p>
          <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">
            Points de route: ${this.routePoints.length}
          </p>
        </div>
      `,
      position: latLng,
    });

    infoWindow.open(this.map);
  }

  // Méthode pour masquer/afficher la route
  toggleRoute(show = true) {
    if (this.routePolyline) {
      this.routePolyline.setVisible(show);
    }
  }

  createMarkers(stations) {
    stations.forEach((station) => {
      // Vérifier que les coordonnées existent
      if (station.lat && station.lng) {
        const marker = new google.maps.Marker({
          position: {
            lat: parseFloat(station.lat),
            lng: parseFloat(station.lng),
          },
          map: this.map,
          title: station.name,
          icon: this.getMarkerIcon(station),
          zIndex: 1000, // Assurer que les marqueurs sont au-dessus de la route
        });

        const infoWindow = new google.maps.InfoWindow({
          content: this.createInfoWindowContent(station),
        });

        marker.addListener("click", () => {
          infoWindow.open(this.map, marker);
        });

        this.markers.push(marker);
      }
    });
  }

  clearMarkers() {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
  }

  clearRoute() {
    if (this.routePolyline) {
      this.routePolyline.setMap(null);
      this.routePolyline = null;
    }
    this.routePoints = [];
  }

  getMarkerIcon(station) {
    // Retourner une icône personnalisée selon l'opérateur
    const color = this.getOperatorColor(station.operator);
    return {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(this.createMarkerSVG(station, color)),
      scaledSize: new google.maps.Size(30, 30),
    };
  }

  getOperatorColor(operator) {
    const colors = {
      Jovena: "#EA4335",
      Galana: "#4285F4",
      Total: "#34A853",
      Shell: "#FBBC04",
    };
    return colors[operator] || "#EA4335";
  }

  createMarkerSVG(station, color) {
    const initial = station.operator
      ? station.operator.charAt(0).toUpperCase()
      : "S";
    return `
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
                <text x="15" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${initial}</text>
            </svg>
        `;
  }

  createInfoWindowContent(station) {
    return `
            <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: #EA4335;">${
                  station.name
                }</h3>
                ${
                  station.operator
                    ? `<p style="margin: 0 0 8px 0; color: #666; font-weight: bold;">Opérateur: ${station.operator}</p>`
                    : ""
                }
                ${
                  station.address
                    ? `<p style="margin: 0 0 8px 0; color: #666;">${station.address}</p>`
                    : ""
                }
                ${
                  station.addr_city
                    ? `<p style="margin: 0 0 8px 0; color: #666;">${station.addr_city}</p>`
                    : ""
                }
                <div style="margin: 8px 0;">
                    <strong>Services:</strong><br>
                    ${
                      station.services && station.services.length > 0
                        ? station.services.join(", ")
                        : "Non spécifié"
                    }
                </div>
                <div style="margin: 8px 0;">
                    <strong>Carburants:</strong><br>
                    ${
                      station.fuel && station.fuel.length > 0
                        ? station.fuel.join(", ")
                        : "Non spécifié"
                    }
                </div>
                ${
                  station.hours && station.hours.length > 0
                    ? `
                <div style="margin: 8px 0;">
                    <strong>Horaires:</strong><br>
                    ${station.hours.join(", ")}
                </div>
                `
                    : ""
                }
            </div>
        `;
  }
}

export default new MapManager();
