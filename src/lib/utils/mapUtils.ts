import { Address } from '@/lib/types/address';
import { City } from '@/lib/types/city';
import { Status } from '@/lib/types/status';

export const formatAddress = (address: Address, city: City): string => {
  return `${address.number} ${address.streetName}, ${city.postalCode} ${city.name}, France`;
};

export const createMarkerElement = (color: string): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'custom-marker';
  el.style.cssText = `
    width: 24px;
    height: 24px;
    background-color: ${color};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  return el;
};

export const createPopupContent = (address: Address, city: City, status: Status): string => {
  const fullAddress = formatAddress(address, city);
  return `
    <div class="p-3">
      <h3 class="font-bold text-lg mb-1">${address.number} ${address.streetName}</h3>
      <p class="text-sm text-gray-600 mb-2">${city.postalCode} ${city.name}</p>
      <div class="space-y-2">
        <p class="font-medium">Statut: ${status.name}</p>
        <p class="text-sm text-gray-600">${status.description}</p>
        ${address.additionalInfo ? `<p class="text-sm mt-2 italic">${address.additionalInfo}</p>` : ''}
      </div>
    </div>
  `;
};

export const updateMarkerSize = (markerElement: HTMLDivElement, zoom: number): void => {
  const baseSize = 24;
  const minZoom = 12;
  const maxZoom = 19;
  const scale = Math.max(0.5, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)));
  const size = baseSize * scale;
  
  markerElement.style.width = `${size}px`;
  markerElement.style.height = `${size}px`;
  markerElement.style.borderWidth = `${2 * scale}px`;
};