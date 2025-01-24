// Gestion de la carte
class MapManager {
  constructor() {
    this.map = null;
    this.markers = [];
    this.initializeMap();
  }

  initializeMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibW9ydHlmbHkiLCJhIjoiY2x3Yno0MGU0MHUwbzJqcGxlcmxsaDN6eSJ9.yM6hfVrrtLydI8_31NcfLQ';
    
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [2.3522, 48.8566],
      zoom: 12
    });

    this.map.on('load', () => this.updateMapMarkers());
  }

  // ... autres méthodes de gestion de la carte ...
}