class MapManager {
  constructor() {
    this.map = null;
    this.markers = [];
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

  createMarkers(stations) {
    stations.forEach((station) => {
      const marker = new google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map: this.map,
        title: station.name,
        icon: this.getMarkerIcon(station),
      });

      const infoWindow = new google.maps.InfoWindow({
        content: this.createInfoWindowContent(station),
      });

      marker.addListener("click", () => {
        infoWindow.open(this.map, marker);
      });

      this.markers.push(marker);
    });
  }

  clearMarkers() {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
  }

  getMarkerIcon(station) {
    // Retourner une icône personnalisée selon le type de station
    return {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(this.createMarkerSVG(station)),
      scaledSize: new google.maps.Size(30, 30),
    };
  }

  createMarkerSVG(station) {
    return `
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" fill="#EA4335" stroke="white" stroke-width="2"/>
                <text x="15" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">S</text>
            </svg>
        `;
  }

  createInfoWindowContent(station) {
    return `
            <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: #EA4335;">${
                  station.name
                }</h3>
                <p style="margin: 0 0 8px 0; color: #666;">${
                  station.address
                }</p>
                <div style="margin: 8px 0;">
                    <strong>Services:</strong><br>
                    ${station.services.join(", ")}
                </div>
                <div style="margin: 8px 0;">
                    <strong>Carburants:</strong><br>
                    ${station.fuel.join(", ")}
                </div>
            </div>
        `;
  }
}

export default new MapManager();
