import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Address } from '@/lib/types/address';
import { City } from '@/lib/types/city';
import { MAP_CONFIG } from '@/lib/utils/constants';
import { geocodeAddress } from '@/lib/utils/geocoding';
import { createMarkerElement, createPopupContent } from '@/lib/utils/mapUtils';
import { useStatusSettings } from '@/lib/hooks/useStatusSettings';
import { useTutorial } from '@/components/tutorial/TutorialProvider';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = MAP_CONFIG.MAPBOX_ACCESS_TOKEN;

interface MapViewProps {
  addresses: Address[];
  city: City;
}

export function MapView({ addresses, city }: MapViewProps) {
  const { statuses } = useStatusSettings();
  const { nextStep } = useTutorial();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {
        const { coordinates } = await geocodeAddress(`${city.name} ${city.postalCode} France`);
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: MAP_CONFIG.STYLE_URL,
          center: coordinates,
          zoom: MAP_CONFIG.DEFAULT_ZOOM,
          dragRotate: false,
          touchZoomRotate: true,
          touchPitch: false,
          cooperativeGestures: true
        });

        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

        map.current.on('load', () => {
          setMapLoaded(true);
          // Passer à l'étape suivante du tutoriel une fois la carte chargée
          nextStep();
        });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
      }
    };

    initializeMap();

    return () => {
      markers.current.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [city, nextStep]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    addresses.forEach(async (address) => {
      try {
        const fullAddress = `${address.number} ${address.streetName}, ${city.name} ${city.postalCode} France`;
        const { coordinates } = await geocodeAddress(fullAddress);
        
        const status = statuses.find(s => s.name === address.status);
        if (!status) return;

        const el = createMarkerElement(status.color);
        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .setPopup(
            new mapboxgl.Popup({ 
              offset: 25,
              maxWidth: '300px',
              closeButton: true,
              closeOnClick: false
            })
              .setHTML(createPopupContent(address, city, status))
          )
          .addTo(map.current!);

        markers.current.push(marker);
      } catch (error) {
        console.error(`Erreur de géocodage pour l'adresse: ${address.number} ${address.streetName}`, error);
      }
    });
  }, [addresses, city, statuses, mapLoaded]);

  return (
    <div className="relative w-full h-[50vh] sm:h-[500px] map-view">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full rounded-lg overflow-hidden touch-pan-y"
        aria-label="Carte des adresses"
      />
    </div>
  );
}