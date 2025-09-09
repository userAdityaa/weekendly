import React from 'react';
import Image from 'next/image';
import { workSans } from '@/app/layout';

export default function Navbar() { 
  return (
    <div className="bg-[#eff9efee] p-4 rounded-xl flex items-center justify-between fixed top-5 left-1/2 w-[98%] transform -translate-x-1/2 z-10 px-8 border border-black">
      <div className="flex items-center">
        <Image src='/logo.png' alt="weekendly logo" width={200} height={200} className="mr-2" />
      </div>
      <div className={`flex space-x-6 ${workSans.className} text-[1.3rem] -ml-[8rem] font-semibold`}>
        <a href="#" className="text-gray-800 hover:text-green-700">Planner</a>
        <a href="#" className="text-gray-800 hover:text-green-700">Themes</a>
        <a href="#" className="text-gray-800 hover:text-green-700">My Plans</a>
      </div>
      <button className="bg-white text-green-700 font-semibold py-2 px-4 rounded-lg border border-green-700 shadow-md hover:shadow-lg hover:bg-green-100 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-sm transition-all duration-200">
        Login
      </button>
    </div>
  );
}