export const mapLayers = {
  CyclOSM: {
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    options: {
      subdomains: 'abc',
      maxZoom: 20,
      attribution:
        '<a href="https://www.cyclosm.org">CyclOSM</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  OpenTopoMap: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      subdomains: 'abc',
      maxZoom: 17,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    },
  },
  Satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    },
  },
} as const;

export type MapLayer = keyof typeof mapLayers;
export const mapLayerNames = Object.keys(mapLayers) as MapLayer[];

/** Leaflet sets these as SVG attributes, so CSS variables can't be used. Keep in sync with app.css. */
export const routeColors = {
  segA: '#6b8e23',
  segB: '#a9c96a',
  split: '#b5d46a',
  ground: '#18201b',
};
