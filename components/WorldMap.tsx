'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { UserData, MainPlan, SubPlan } from '../types/user';

// Interface for location points displayed on the map
interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
}

const WorldMap = () => {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const markersRef = useRef<(google.maps.Marker | null)[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Fetch and process locations from user plans in localStorage
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        let aggregatedLocations: LocationPoint[] = [];

        if (storedUserData) {
          const userData: UserData = JSON.parse(storedUserData);
          const mainPlans: MainPlan[] = userData.mainPlanList || [];

          const seenLocations = new Set<string>();

          for (const mainPlan of mainPlans) {
            const subPlans: SubPlan[] = mainPlan.subPlans || [];
            for (const subPlan of subPlans) {
              if (
                subPlan.location &&
                subPlan.location !== 'TBD' &&
                subPlan.locationDetails?.lat &&
                subPlan.locationDetails?.lng
              ) {
                if (!seenLocations.has(subPlan.location)) {
                  seenLocations.add(subPlan.location);
                  aggregatedLocations.push({
                    name: subPlan.location,
                    lat: subPlan.locationDetails.lat,
                    lng: subPlan.locationDetails.lng,
                  });
                }
              }
            }
          }

          localStorage.setItem('userLocationHistory', JSON.stringify(aggregatedLocations));
          setLocations(aggregatedLocations);
        }

        if (aggregatedLocations.length === 0) {
          const storedLocations = localStorage.getItem('userLocationHistory');
          if (storedLocations) {
            aggregatedLocations = JSON.parse(storedLocations);
            setLocations(aggregatedLocations);
          }
        }

        setIsMapLoading(false);
      } catch (error) {
        console.error('Error fetching locations from plans:', error);
        setMapError('Failed to load locations. Please try again.');
        setIsMapLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const defaultCenter = { lat: 20, lng: 0 };

  const mapOptions = {
    zoom: 2,
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'greedy' as const,
  };

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapLoading(false);

    if (locations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach((loc) => bounds.extend({ lat: loc.lat, lng: loc.lng }));
      map.fitBounds(bounds);
    }
  };

  useEffect(() => {
    if (mapRef.current && locations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach((loc) => bounds.extend({ lat: loc.lat, lng: loc.lng }));
      mapRef.current.fitBounds(bounds);
    }
  }, [locations]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker?.setMap(null));
      markersRef.current = [];
    };
  }, []);

  return (
    <div className="w-full h-full relative rounded-lg shadow-md">
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-black">Loading map...</p>
          </div>
        </div>
      )}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600 p-4 rounded-lg z-10">
          <p>{mapError}</p>
        </div>
      )}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={mapOptions.zoom}
        options={mapOptions}
        onLoad={handleMapLoad}
      >
        {locations.map((loc, index) => (
          <Marker
            key={index}
            position={{ lat: loc.lat, lng: loc.lng }}
            title={loc.name}
            onLoad={(marker) => {
              markersRef.current[index] = marker;
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default WorldMap;
