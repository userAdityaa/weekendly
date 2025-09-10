'use client';

import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Temporary location list with times visited
const tempLocations = [
  { name: 'Alaska', lat: 64.2008, lng: -149.4937, timesVisited: 3 },
  { name: 'Nepal', lat: 28.3949, lng: 84.1240, timesVisited: 2 },
  { name: 'Russia', lat: 55.7558, lng: 37.6173, timesVisited: 5 },
];

interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
  timesVisited: number;
}

// Component to handle map invalidation
const MapEffect = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

const WorldMap = () => {
  const [locations, setLocations] = useState<LocationPoint[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('userLocationHistory');
    if (stored) {
      setLocations(JSON.parse(stored));
    } else {
      setLocations(tempLocations);
    }
  }, []);

  // Create a custom divIcon for card-like marker
  const createCustomCardIcon = (name: string, timesVisited: number) => {
    return new L.DivIcon({
      html: `
        <div class="relative flex flex-col items-center">
          <!-- Row: Image + Card -->
          <div class="flex items-center bg-white rounded-lg shadow-md p-2 gap-2">
            <!-- Marker Image -->
            <img src="/marker_image.png" alt="marker" class="w-8 h-8 rounded-lg" />

            <!-- Card Content -->
            <div class="flex flex-col">
              <p class="text-xs font-semibold text-gray-800">${name}</p>
              <p class="text-xs text-gray-500">${timesVisited} time${timesVisited === 1 ? '' : 's'}</p>
            </div>
          </div>

          <!-- Arrow -->
          <div class="w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      `,
      className: '', // Remove default Leaflet icon styling
      iconSize: [128, 60], // Adjust size to fit card
      iconAnchor: [64, 60], // Anchor at bottom-center of card
    });
  };

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="w-full h-full rounded-lg shadow-md"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <MapEffect />
        {locations.map((loc, index) => (
          <Marker
            key={index}
            position={[loc.lat, loc.lng]}
            icon={createCustomCardIcon(loc.name, loc.timesVisited)}
          >
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMap;