'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "../../components/Navbar";
import Loader from '../../components/Loader';

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check for userData in localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  // Handle Start Planning button click
  const handleStartPlanning = () => {
    if (!userData) {
      toast.error('Set profile through login first to proceed');
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        router.push('/new-plan');
      }, 3000);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Toaster for notifications */}
      <Toaster position="top-center" />

      {isLoading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-1000">
          <Loader />
        </div>
      )}

      {/* Background image */}
      <Navbar />
      <Image
        src="/background_image.png"
        alt="Background"
        fill
        priority
        quality={70}
        className="absolute inset-0 object-fill z-0 opacity-95"
      />

      {/* Card container with text overlay and analytics image */}
      <div className="relative top-45 w-[90vw] flex justify-center gap-4 mx-auto max-md:w-[100vw] max-md:flex-col max-md:justify-center max-md:items-center max-md:top-20 max-md:gap-0">
        <div className="relative bottom-15 max-md:bottom-0 max-md:w-[125vw]">
          <Image
            src="/landing_page_card.png"
            alt="detail card"
            width={550}
            height={550}
            priority
            quality={70}
            className="object-contain min-2xl:w-[60vh]"
          />

          {/* Text + Button overlay */}
          <div className="absolute inset-0 min-2xl:top-[28vh] min-2xl:left-[11vh] top-[16.5rem] left-24 w-[28vw] max-[1182]:w-[29vw] max-[1025]:top-[13rem] max-[1025]:left-20 max-md:w-[90vw] max-md:top-[24vh] max-md:p-4 max-[1181]:top-[15rem] max-[1181]:left-22 max-[391]:left-20">
            <div className="flex flex-col justify-center text-black">
              <h1 className="max-[431]:text-3xl max-[391]:text-[1.6rem] text-3xl font-semibold  max-[1025]:text-[1.55rem] min-2xl:text-[3.2vh]">Plan a Perfect Weekend</h1>
              <p className="text-2xl min-2xl:text-[2.8vh] max-[1182]:text-[1.4rem] min-2xl:w-[38vh] max-[1025]:text-[1.15rem] font-medium w-[85%] text-left mt-[1rem] max-[431]:text-2xl max-[391]:text-[1.4rem]">
                Playful planning for perfect weekends — craft your own mix of activities, moods, and meals, and turn two days into unforgettable memories.
              </p>

              {/* Green button full width */}
              <button
                onClick={handleStartPlanning}
                className="relative w-[25vw] min-2xl:w-[38vh] min-2xl:h-[8vh] rounded-xl border-2 border-black h-[80px] mt-[1rem] bg-[#82ed82ce] max-md:h-[65px] max-md:w-[80vw] max-md:mt-[0.5rem] max-[391]:w-[80vw] max-[391]:-ml-[0.5rem]"
              >
                <span className="absolute inset-0 min-2xl:text-[2.5vh] flex items-center justify-center text-black font-semibold text-xl">
                  Start Planning
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative -left-8 flex flex-col items-center justify-center rotate-90 max-lg:hidden">
          {/* Circle */}
          <div className="w-4 h-4 rounded-full bg-black"></div>
          {/* String */}
          <div className="w-[2px] h-[10rem] min-2xl:h-[16vh] bg-black"></div>
          <div className="w-4 h-4 rounded-full bg-black"></div>
        </div>

        {/* Analytics image */}
        <Image
          src="/analytics.png"
          alt="Analytics"
          width={550}
          height={150}
          priority
          quality={70}
          className="object-contain mt-[1rem] max-md:-mt-[1rem] max-md:w-[94vw] max-md:-ml-[2vw] min-2xl:w-[60vh]"
        />
      </div>
    </div>
  );
}