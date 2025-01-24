export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibW9ydHlmbHkiLCJhIjoiY2x3Yno0MGU0MHUwbzJqcGxlcmxsaDN6eSJ9.yM6hfVrrtLydI8_31NcfLQ';

export const MAP_CONFIG = {
  MAPBOX_ACCESS_TOKEN,
  DEFAULT_CENTER: [2.3522, 48.8566] as [number, number], // Paris
  DEFAULT_ZOOM: 13,
  MAX_ZOOM: 19,
  MIN_ZOOM: 10,
  STYLE_URL: 'mapbox://styles/mapbox/streets-v12',
  GEOCODING_OPTIONS: {
    country: 'fr',
    types: ['place', 'address'],
    language: 'fr'
  }
} as const;

export const STATUS_COLORS = {
  'Accepté': '#22c55e',     // green-500
  'Absent': '#eab308',      // yellow-500
  'PI': '#ef4444',         // red-500
  'Fermé': '#3b82f6',      // blue-500
  'À Vendre': '#a855f7',   // purple-500
  'Référent': '#14b8a6'    // teal-500
} as const;

export const STATUS_BADGES = {
  'Accepté': 'bg-green-100 text-green-800',
  'Absent': 'bg-yellow-100 text-yellow-800',
  'PI': 'bg-red-100 text-red-800',
  'Fermé': 'bg-blue-100 text-blue-800',
  'À Vendre': 'bg-purple-100 text-purple-800',
  'Référent': 'bg-teal-100 text-teal-800'
} as const;

export const STATUS_DESCRIPTIONS = {
  'Accepté': 'Le propriétaire a accepté de recevoir des informations',
  'Absent': 'Personne n\'était présent lors de la visite',
  'PI': 'Pas intéressé',
  'Fermé': 'Accès impossible ou refusé',
  'À Vendre': 'Bien en vente',
  'Référent': 'Contact privilégié dans le secteur'
} as const;