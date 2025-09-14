'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { UserData, MainPlan, SubPlan } from '../types/user';

interface PlanFormData {
  title: string;
  startTime: string;
  endTime: string;
  note: string;
  friends: { name: string; gender: 'male' | 'female' }[];
  location: {
    name: string;
    lat: number;
    lng: number;
  } | null;
}

interface Plan {
  id: string;
  title: string;
  location: string;
  time: string | null;
  note?: string;
  icon: string;
  emoji: string;
}

interface Friend {
  name: string;
  gender: 'male' | 'female';
}

interface PlanWizardProps {
  onComplete: (plan: Plan) => void;
  mainPlanId: string;
}

export default function PlanWizard({ onComplete, mainPlanId }: PlanWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PlanFormData>({
    title: '',
    startTime: '',
    endTime: '',
    note: '',
    friends: [],
    location: null,
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
  const [error, setError] = useState<string>('');

  const router = useRouter();
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Check for userData in localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (!storedUserData) {
      router.push('/');
    }
  }, [router]);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsMapLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsMapLoading(false);
        }
      );
    } else {
      setIsMapLoading(false);
    }

    // Debug: Check if Google Maps API is loaded
    if (!window.google) {
      setMapError('Google Maps API not loaded. Please check your API key.');
      setIsMapLoading(false);
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

  const initializeUserData = (): UserData => ({
    name: '',
    gender: 'male',
    hobby: '',
    totalPlansMade: 0,
    mainPlanList: [],
    friendList: [],
    locations: [],
  });

  const formatTime = (startTime: string, endTime: string): string | null => {
    if (!startTime || !endTime) return null;
    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const startPeriod = startHours >= 12 ? 'PM' : 'AM';
      const endPeriod = endHours >= 12 ? 'PM' : 'AM';
      const formattedStartHours = startHours % 12 || 12;
      const formattedEndHours = endHours % 12 || 12;
      return `${formattedStartHours}:${startMinutes.toString().padStart(2, '0')} ${startPeriod} – ${formattedEndHours}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return null;
    }
  };

  const handlePlacesChanged = () => {
    if (!searchBoxRef.current) {
      console.error('SearchBox reference is not set');
      return;
    }
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      setSelectedPlace(place);
      const location = {
        name: place.formatted_address || place.name || 'Unknown Location',
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0,
      };
      setFormData({ ...formData, location });

      // Save location to UserData.locations in localStorage
      try {
        const storedUserData = localStorage.getItem('userData');
        let userData: UserData;
        if (storedUserData) {
          userData = JSON.parse(storedUserData);
          if (!userData.locations) {
            userData.locations = [];
          }
        } else {
          userData = initializeUserData();
        }
        const updatedLocations = userData.locations.includes(location.name)
          ? userData.locations
          : [...userData.locations, location.name];
        localStorage.setItem(
          'userData',
          JSON.stringify({ ...userData, locations: updatedLocations })
        );
      } catch (error) {
        console.error('Error saving location to localStorage:', error);
        setError('Failed to save location. Please try again.');
      }

      if (place.geometry?.location) {
        setMapCenter({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    } else {
      console.warn('No places found in search');
    }
  };

  const handleMapLoad = () => {
    setIsMapLoading(false);
  };

  const handleMapError = () => {
    setMapError('Failed to load Google Maps. Please check your API key and network connection.');
    setIsMapLoading(false);
  };

  const handleSearchBoxLoad = (searchBox: google.maps.places.SearchBox) => {
    searchBoxRef.current = searchBox;
    console.log('SearchBox loaded successfully');
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
        const location = {
          name: place.formatted_address || 'Unknown Location',
          lat,
          lng,
        };
        setSelectedPlace({
          ...place,
          geometry: { location: new google.maps.LatLng(lat, lng) },
          name: place.formatted_address,
        });
        setFormData({ ...formData, location });

        // Save location to UserData.locations in localStorage
        try {
          const storedUserData = localStorage.getItem('userData');
          let userData: UserData;
          if (storedUserData) {
            userData = JSON.parse(storedUserData);
            if (!userData.locations) {
              userData.locations = [];
            }
          } else {
            userData = initializeUserData();
          }
          const updatedLocations = userData.locations.includes(location.name)
            ? userData.locations
            : [...userData.locations, location.name];
          localStorage.setItem(
            'userData',
            JSON.stringify({ ...userData, locations: updatedLocations })
          );
        } catch (error) {
          console.error('Error saving location to localStorage:', error);
          setError('Failed to save location. Please try again.');
        }

        if (inputRef.current) inputRef.current.value = location.name;
      } else {
        setFormData({ ...formData, location: null });
        setSelectedPlace(null);
        if (inputRef.current) inputRef.current.value = '';
      }
    });
  };

  const updateStorage = () => {
    try {
      const storedMainPlan = localStorage.getItem(`mainPlan_${mainPlanId}`);
      if (!storedMainPlan) {
        setError('Main plan not found. Please create a main plan first.');
        return null;
      }

      const mainPlan: MainPlan = JSON.parse(storedMainPlan);
      const planDate = mainPlan.startDate || new Date().toISOString().split('T')[0]; // Fallback to current date
      const newId = crypto.randomUUID();

      // Create start and end times only if provided
      const startTime = formData.startTime;
      const endTime = formData.endTime;

      // Validate endTime is after startTime if both are provided
      if (startTime && endTime && endTime <= startTime) {
        setError('End time must be after start time.');
        return null;
      }

      const friendsNote = formData.friends.length
        ? `Invited: ${formData.friends.map((f) => f.name).join(', ')}. `
        : '';
      const finalNote = friendsNote + (formData.note || '');

      const newSubPlan: SubPlan = {
        id: newId,
        activities: [formData.title || 'Untitled'],
        location: formData.location ? formData.location.name : 'TBD',
        locationDetails: formData.location
          ? { lat: formData.location.lat, lng: formData.location.lng }
          : undefined,
        friendList: formData.friends.map((f) => f.name),
        timings: startTime && endTime ? { start: startTime, end: endTime } : { start: "", end: "" },
        notes: finalNote.trim() || '',
      };

      // Update mainPlan in localStorage
      const updatedSubPlans = [...(mainPlan.subPlans || []), newSubPlan];
      const updatedMainPlan: MainPlan = { ...mainPlan, subPlans: updatedSubPlans };
      localStorage.setItem(`mainPlan_${mainPlanId}`, JSON.stringify(updatedMainPlan));

      // Update userData.mainPlanList
      try {
        const storedUserData = localStorage.getItem('userData');
        let userData: UserData;
        if (storedUserData) {
          userData = JSON.parse(storedUserData);
          if (!userData.locations) {
            userData.locations = [];
          }
        } else {
          userData = initializeUserData();
        }
        const updatedMainPlanList = userData.mainPlanList || [];
        const existingIndex = updatedMainPlanList.findIndex((plan) => plan.id === mainPlanId);
        if (existingIndex !== -1) {
          updatedMainPlanList[existingIndex] = updatedMainPlan;
        } else {
          updatedMainPlanList.push(updatedMainPlan);
        }
        localStorage.setItem(
          'userData',
          JSON.stringify({
            ...userData,
            mainPlanList: updatedMainPlanList,
            totalPlansMade: (userData.totalPlansMade || 0) + 1,
          })
        );
      } catch (error) {
        console.error('Error updating userData in localStorage:', error);
        setError('Failed to update user data. Please try again.');
        return null;
      }

      console.log('user data: ', localStorage.getItem('userData'));
      return newSubPlan;
    } catch (error) {
      console.error('Error updating storage with subPlan:', error);
      setError('Failed to save plan. Please try again.');
      return null;
    }
  };

  const handleFinish = () => {
    const newSubPlan = updateStorage();
    if (newSubPlan) {
      const activityIcons: Record<string, string> = {
        Movie: 'movie',
        Hiking: 'hike',
        Brunch: 'brunch',
        'Road Trip': 'default',
        Coffee: 'brunch',
        Crafting: 'default',
        Sports: 'default',
      };
      const icon = activityIcons[formData.title] || 'default';
      const emojiOptions = ['🌄', '🥐', '🎬'];
      const randomEmoji = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
      const friendsNote = formData.friends.length
        ? `Invited: ${formData.friends.map((f) => f.name).join(', ')}. `
        : '';
      const finalNote = friendsNote + (formData.note || '');
      const formattedTime = formatTime(formData.startTime, formData.endTime);
      const newPlan: Plan = {
        id: newSubPlan.id,
        title: formData.title,
        location: formData.location ? formData.location.name : 'TBD',
        time: formattedTime,
        note: finalNote.trim() || undefined,
        icon,
        emoji: randomEmoji,
      };

      console.log('PlanWizard Data:', {
        formData: { ...formData },
        subPlan: newSubPlan,
        plan: newPlan,
      });
      onComplete(newPlan);
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = `/plan/${mainPlanId}`;
  };

  const trendingActivities = [
    { name: '🎬 Movie Night', value: 'Movie' },
    { name: '🥾 Hiking', value: 'Hiking' },
    { name: '🍳 Brunch', value: 'Brunch' },
    { name: '🚗 Road Trip', value: 'Road Trip' },
    { name: '☕ Coffee Meetup', value: 'Coffee' },
    { name: '🎨 Crafting', value: 'Crafting' },
    { name: '⚽ Sports', value: 'Sports' },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-gray-100 z-50 overflow-hidden">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 p-3 rounded-xl shadow-md">
          {error}
        </div>
      )}
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
                    className={`p-6 rounded-xl border border-zinc-300 shadow-md hover:shadow-xl transition transform hover:scale-105 font-medium ${
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
                className="w-full mt-6 border border-zinc-300 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBackToDashboard}
                  className="px-6 py-3 border border-zinc-300 rounded-lg hover:bg-gray-100 transition"
                >
                  ← Back to Dashboard
                </button>
                <button
                  onClick={next}
                  disabled={!formData.title}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
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
              <div className="w-full h-96 mb-4 relative rounded-xl overflow-hidden shadow-md">
                {isMapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="mt-4 text-lg text-black">Loading map...</p>
                    </div>
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
                    className="w-full border border-zinc-300 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none mb-4"
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
              {formData.location && (
                <p className="text-gray-700 mb-4">Selected: {formData.location.name}</p>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setFormData({ ...formData, location: null });
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
                className="px-4 mt-[1rem] py-3 border border-zinc-300 rounded-lg hover:bg-gray-100 transition"
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
            <div className="flex flex-col items-center w-full max-w-lg text-center bg-white/70 backdrop-blur-lg p-8 rounded-xl shadow-xl border border-zinc-300">
              <h2 className="text-3xl font-bold mb-6">⏰ Set Times</h2>
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => {
                      setFormData({ ...formData, startTime: e.target.value });
                      setError('');
                    }}
                    className="appearance-none text-2xl text-center font-semibold w-48 bg-gray-100 rounded-xl py-3 px-4 shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => {
                      setFormData({ ...formData, endTime: e.target.value });
                      setError('');
                    }}
                    className="appearance-none text-2xl text-center font-semibold w-48 bg-gray-100 rounded-xl py-3 px-4 shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>
              <span className="text-gray-500 mb-4">Pick the best times for your plan</span>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setFormData({ ...formData, startTime: '', endTime: '' });
                    next();
                  }}
                  className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
                >
                  Skip
                </button>
                <button
                  onClick={next}
                  disabled={!formData.startTime || !formData.endTime}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:shadow-lg transition disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
              <button
                onClick={prev}
                className="px-4 mt-[1rem] py-3 border border-zinc-300 rounded-lg hover:bg-gray-100 transition"
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
              <div className="w-full mb-6 bg-white p-6 rounded-xl shadow-lg border border-zinc-300">
                <h3 className="text-lg font-semibold mb-4">Add a new friend</h3>
                <div className="flex gap-2 items-center mb-3">
                  <input
                    type="text"
                    placeholder="Friend's name"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    className="flex-1 border border-zinc-300 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewFriendGender('male')}
                      className={`p-2 rounded-full border border-zinc-300 transition shadow-sm hover:scale-105 ${
                        newFriendGender === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      <img src="/male_user_one.png" alt="Male" className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setNewFriendGender('female')}
                      className={`p-2 rounded-full border border-zinc-300 transition shadow-sm hover:scale-105 ${
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
                  Add Friend
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
                  className="px-6 py-3 border border-zinc-300 rounded-lg hover:bg-gray-100 transition"
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
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 h-40 resize-none shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <div className="flex gap-4 mt-8">
                <button
                  onClick={prev}
                  className="px-6 py-3 border border-zinc-300 rounded-lg hover:bg-gray-100 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleFinish}
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