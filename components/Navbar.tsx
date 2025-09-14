'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Work_Sans } from 'next/font/google';
import { tags } from '../constants/Tag';
import { UserData } from '../types/user';
import toast, { Toaster } from 'react-hot-toast';
import Loader from './Loader';

export const workSans = Work_Sans({
  subsets: ["latin"]
});

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check for userData in localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  // Handle navigation to profile page
  const handleProfileClick = () => {
    router.push('/profile');
  };

  // Handle navigation to plans page
  const handleMyPlansClick = () => {
    if (!userData) {
      toast.error('Set profile through login first to proceed');
    } else {
      setLoading(true);
      setTimeout(() => {
        router.push(`/plans`);
      }, 3000);
    }
  };

  return (
    <div className="relative z-[100]">
      {/* Toaster for notifications */}
      <Toaster position="top-center" />

      {/* Navbar */}
      <div className="bg-[#fefefeee] p-4 rounded-xl flex items-center justify-between fixed top-5 left-1/2 w-[98%] transform -translate-x-1/2 z-10 px-8 border border-black max-md:left-[50%] max-md:top-[2%]">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="weekendly logo"
            width={200}
            height={200}
            className="mr-2 max-md:w-[50vw] max-md:-ml-5"
          />
        </div>

        {/* Desktop Nav Links */}
        <div
          className={`flex space-x-6 ${workSans.className} text-[1.3rem] font-semibold max-md:hidden ml-[50vw] w-[15vw] justify-end`}
        >
          <button onClick={handleMyPlansClick} className="text-gray-800 hover:text-green-700">
            My Plans
          </button>
        </div>

        {/* Desktop Profile/Login Button */}
        <div className="cursor-pointer max-md:hidden">
          {userData ? (
            <button onClick={handleProfileClick}>
              <Image
                src={userData.gender === 'female' ? '/female_user_one.png' : '/male_user_one.png'}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </button>
          ) : (
            <button
              onClick={handleProfileClick}
              className="text-gray-800 font-semibold bg-[#82ed82ce] p-2 rounded-xl border border-black"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="hidden max-md:block p-2 -mr-4"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={32} className='text-zinc-400' /> : <Menu size={32} className='text-zinc-400'/>}
        </button>
      </div>

      <div className="fixed top-[6.5rem] left-1/2 transform -translate-x-1/2 flex space-x-20 z-10">
        {tags.map((tag, index) => (
          <div key={index} className="relative flex flex-col items-center hover:animate-swing">
            {/* Circle at the start of the string */}
            <div className="w-3 h-3 rounded-full bg-black"></div>
            {/* String */}
            <div className="w-[2px] h-8 bg-black"></div>
            {/* Tag */}
            <div
              className={`${tag.color} min-w-[10rem] px-6 py-2 rounded-2xl border border-black font-semibold text-black text-center cursor-pointer`}
            >
              {tag.name}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="fixed top-[6rem] right-4 transform w-[115px] bg-[#fefefe] border border-black shadow-lg z-20 flex flex-col items-center justify-start space-y-4 py-4 rounded-lg max-md:flex px-4">
          <button
            onClick={handleMyPlansClick}
            className={`text-gray-800 hover:text-green-700 ${workSans.className} font-semibold text-lg w-full text-center`}
          >
            My Plans
          </button>
          <button
            onClick={handleProfileClick}
            className={`text-gray-800 hover:text-green-700 ${workSans.className} font-semibold text-lg w-full text-center`}
          >
            {userData ? 'Profile' : 'Login'}
          </button>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-1000">
          <Loader />
        </div>
      )}
    </div>
  );
}