'use client';
import { LoadScript } from '@react-google-maps/api';
import { ReactNode } from 'react';

const libraries: ('places' | 'geocoding')[] = ['places', 'geocoding'];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function GoogleMapsProvider({ children }: { children: ReactNode }) {
  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onError={() => console.error('Failed to load Google Maps API')}
    >
      {children}
    </LoadScript>
  );
}