'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { StandaloneSearchBox } from '@react-google-maps/api';

interface PlanFormData {
  title: string;
  time: string;
  note: string;
  friends: { name: string; gender: 'male' | 'female' }[];
  location: string;
}

interface Friend {
  name: string;
  gender: 'male' | 'female';
}

export default function PlanWizard({ onComplete }: { onComplete: (plan: PlanFormData) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PlanFormData>({
    title: '',
    time: '',
    note: '',
    friends: [],
    location: '',
  });
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendGender, setNewFriendGender] = useState<'male' | 'female'>('male');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 37.7749, // Default to San Francisco
    lng: -122.4194,
  });
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  const trendingActivities = [
    { name: '🎬 Movie Night', value: 'Movie' },
    { name: '🥾 Hiking', value: 'Hiking' },
    { name: '🍳 Brunch', value: 'Brunch' },
    { name: '🚗 Road Trip', value: 'Road Trip' },
    { name: '☕ Coffee Meetup', value: 'Coffee' },
    { name: '🎨 Crafting', value: 'Crafting' },
    { name: '⚽ Sports', value: 'Sports' },
  ];

  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const slideVariants = {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: { y: '-100%', opacity: 0, transition: { duration: 0.4 } },
  };

  const handleAddFriend = () => {
    if (newFriendName.trim()) {
      setFormData({
        ...formData,
        friends: [...formData.friends, { name: newFriendName, gender: newFriendGender }],
      });
      setNewFriendName('');
      setNewFriendGender('male');
    }
  };

  const handlePlacesChanged = () => {
    if (!searchBoxRef.current) return;
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      setSelectedPlace(place);
      setFormData({
        ...formData,
        location: place.formatted_address || place.name || '',
      });
      if (place.geometry?.location) {
        setMapCenter({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  const handleMapLoad = () => setIsMapLoading(false);

  const handleMapError = () => {
    setMapError('Failed to load Google Maps. Please check your API key and network connection.');
    setIsMapLoading(false);
  };

  const handleSearchBoxLoad = (searchBox: google.maps.places.SearchBox) => {
    searchBoxRef.current = searchBox;
  };

  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMapCenter({ lat, lng });

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const place = results[0];
        setSelectedPlace({
          ...place,
          geometry: { location: new google.maps.LatLng(lat, lng) },
          name: place.formatted_address,
        });
        setFormData({ ...formData, location: place.formatted_address || '' });
        if (inputRef.current) inputRef.current.value = place.formatted_address || '';
      } else {
        setFormData({ ...formData, location: '' });
        setSelectedPlace(null);
        if (inputRef.current) inputRef.current.value = '';
      }
    });
  };

  const libraries: ('places' | 'geocoding')[] = ['places', 'geocoding'];
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-gray-100 z-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {/* STEP 1 - ACTIVITY */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center h-full p-6"
          >
            <div className="flex flex-col items-center w-full max-w-lg text-center">
              <h2 className="text-3xl font-bold mb-6">✨ What activity do you want to do?</h2>
              <div className="grid grid-cols-2 gap-4 w-full">
                {trendingActivities.map((act) => (
                  <button
                    key={act.value}
                    onClick={() => setFormData({ ...formData, title: act.value })}
                    className={`p-6 rounded-xl border shadow-md hover:shadow-xl transition transform hover:scale-105 font-medium ${
                      formData.title === act.value
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white'
                    }`}
                  >
                    {act.name}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type another activity..."
                value={
                  trendingActivities.find((t) => t.value === formData.title) ? '' : formData.title
                }
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full mt-6 border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button
                onClick={next}
                disabled={!formData.title}
                className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 - LOCATION */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center h-full p-6"
          >
            <div className="flex flex-col items-center w-full max-w-lg text-center">
              <h2 className="text-3xl font-bold mb-6">📍 Choose a Location</h2>
              {apiKey ? (
                <LoadScript
                  googleMapsApiKey={apiKey}
                  libraries={libraries}
                  onLoad={handleMapLoad}
                  onError={handleMapError}
                >
                  <div className="w-full h-96 mb-4 relative rounded-xl overflow-hidden shadow-md">
                    {isMapLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
                        <p className="text-gray-700">Loading map...</p>
                      </div>
                    )}
                    {mapError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600 p-4 rounded-xl">
                        <p>{mapError}</p>
                      </div>
                    )}
                    <StandaloneSearchBox
                      onLoad={handleSearchBoxLoad}
                      onPlacesChanged={handlePlacesChanged}
                    >
                      <input
                        type="text"
                        placeholder="Search for places..."
                        ref={inputRef}
                        className="w-full border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none mb-4"
                      />
                    </StandaloneSearchBox>
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={mapCenter}
                      zoom={14}
                      options={{ disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy' }}
                      onLoad={handleMapLoad}
                    >
                      {selectedPlace?.geometry?.location && (
                        <Marker
                          position={{
                            lat: selectedPlace.geometry.location.lat(),
                            lng: selectedPlace.geometry.location.lng(),
                          }}
                          title={selectedPlace.name}
                          draggable={true}
                          onDragEnd={handleMarkerDragEnd}
                        />
                      )}
                    </GoogleMap>
                  </div>
                </LoadScript>
              ) : (
                <div className="w-full p-4 bg-red-100 text-red-600 rounded-xl">
                  <p>Google Maps API key is missing. Please contact support.</p>
                </div>
              )}
              {formData.location && <p className="text-gray-700 mb-4">Selected: {formData.location}</p>}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setFormData({ ...formData, location: '' });
                    setSelectedPlace(null);
                    if (inputRef.current) inputRef.current.value = '';
                    next();
                  }}
                  className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
                >
                  Skip
                </button>
                <button
                  onClick={next}
                  disabled={!formData.location}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:shadow-lg transition disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
              <button
                onClick={prev}
                className="mt-4 text-gray-600 underline hover:text-black transition"
              >
                ← Back
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 - TIME */}
        {step === 3 && (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center h-full p-6"
          >
            <div className="flex flex-col items-center w-full max-w-lg text-center bg-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-xl border">
              <h2 className="text-3xl font-bold mb-6">⏰ Set a time</h2>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="appearance-none text-4xl text-center font-semibold w-48 bg-gray-100 rounded-xl py-3 px-4 mb-4 shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <span className="text-gray-500">Pick the best time for your plan</span>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setFormData({ ...formData, time: '' });
                    next();
                  }}
                  className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
                >
                  Skip
                </button>
                <button
                  onClick={next}
                  disabled={!formData.time}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:shadow-lg transition disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
              <button
                onClick={prev}
                className="mt-4 text-gray-600 underline hover:text-black transition"
              >
                ← Back
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4 - FRIENDS */}
        {step === 4 && (
          <motion.div
            key="step4"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center h-full p-6"
          >
            <div className="flex flex-col items-center w-full max-w-lg text-center">
              <h2 className="text-3xl font-bold mb-6">👥 Invite Friends</h2>
              <div className="w-full mb-6 bg-white p-6 rounded-2xl shadow-lg border">
                <h3 className="text-lg font-semibold mb-4">Add a new friend</h3>
                <div className="flex gap-2 items-center mb-3">
                  <input
                    type="text"
                    placeholder="Friend's name"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    className="flex-1 border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewFriendGender('male')}
                      className={`p-2 rounded-full border transition shadow-sm hover:scale-105 ${
                        newFriendGender === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      <img src="/male_user_one.png" alt="Male" className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setNewFriendGender('female')}
                      className={`p-2 rounded-full border transition shadow-sm hover:scale-105 ${
                        newFriendGender === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      <img src="/female_user_one.png" alt="Female" className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddFriend}
                  disabled={!newFriendName.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                >
                  ➕ Add Friend
                </button>
              </div>
              {formData.friends.length > 0 && (
                <div className="w-full">
                  <h3 className="text-lg font-semibold mb-3">Added Friends</h3>
                  <div className="flex flex-wrap gap-3 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-2xl shadow-inner">
                    <AnimatePresence>
                      {formData.friends.map((friend, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white shadow-md border hover:shadow-lg transition"
                        >
                          <img
                            src={
                              friend.gender === 'male'
                                ? '/male_user_one.png'
                                : '/female_user_one.png'
                            }
                            alt={friend.gender}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="font-medium">{friend.name}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={prev}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-100 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={next}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:shadow-lg transition"
                >
                  Next →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5 - NOTES */}
        {step === 5 && (
          <motion.div
            key="step5"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center h-full p-6"
          >
            <div className="flex flex-col items-center w-full max-w-lg text-center">
              <h2 className="text-3xl font-bold mb-6">📝 Any notes?</h2>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Write your note here..."
                className="w-full border rounded-xl px-4 py-3 h-40 resize-none shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <div className="flex gap-4 mt-8">
                <button
                  onClick={prev}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-100 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => onComplete(formData)}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition"
                >
                  Finish
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
