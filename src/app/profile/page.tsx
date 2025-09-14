'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '../../../components/Loader';

export default function Profile() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [name, setName] = useState('');
  const [hobby, setHobby] = useState('');
  const [hasUserData, setHasUserData] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setHasUserData(true);
      if (parsed.gender) setGender(parsed.gender);
      if (parsed.name) setName(parsed.name);
      if (parsed.hobby) setHobby(parsed.hobby);
    }
  }, []);

  // Save data to localStorage and navigate
  const handleSubmit = () => {
    const userData = { gender, name, hobby };
    localStorage.setItem('userData', JSON.stringify(userData));
    setHasUserData(true);
    setLoading(true);
    setTimeout(() => {
      router.push(`/plans`);
    }, 3000);
  };

  // Logout user
  const handleLogout = () => {
    localStorage.removeItem('userData');
    setHasUserData(false);
    setGender('male');
    setName('');
    setHobby('');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {/* User Image as Toggle Button */}
      <button
        onClick={() => setGender(gender === 'male' ? 'female' : 'male')}
        className="mb-6"
      >
        <img
          src={gender === 'female' ? '/female_user_one.png' : '/male_user_one.png'}
          alt="User"
          className="w-14 h-14 rounded-full object-cover"
        />
      </button>

      {/* Input Fields */}
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-64 border-b border-gray-400 focus:outline-none text-center py-2 mb-4 text-black"
      />

      <input
        type="text"
        placeholder="Your weekend favourite hobby"
        value={hobby}
        onChange={(e) => setHobby(e.target.value)}
        className="w-64 border-b border-gray-400 focus:outline-none text-center py-2 mb-6 text-black"
      />

      {/* Create/Update Profile Button */}
      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 mb-4"
      >
        {hasUserData ? 'Update Profile' : 'Create Profile'}
      </button>

      {/* Logout Button (only if logged in) */}
      {hasUserData && (
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          Logout
        </button>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-1000">
          <Loader />
        </div>
      )}
    </div>
  );
}
