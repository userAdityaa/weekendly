import React from 'react';
import Image from 'next/image';
import { workSans } from '@/app/layout';
import { tags } from '../constants/Tag';

export default function Navbar() { 
  return (
    <div className="relative">
      {/* Navbar */}
      <div className="bg-[#fefefeee] p-4 rounded-xl flex items-center justify-between fixed top-5 left-1/2 w-[98%] transform -translate-x-1/2 z-10 px-8 border border-black">
        <div className="flex items-center">
          <Image src='/logo.png' alt="weekendly logo" width={200} height={200} className="mr-2" />
        </div>
        <div className={`flex space-x-6 ${workSans.className} text-[1.3rem] -ml-[8rem] font-semibold`}>
          <a href="#" className="text-gray-800 hover:text-green-700">Planner</a>
          <a href="#" className="text-gray-800 hover:text-green-700">Themes</a>
          <a href="#" className="text-gray-800 hover:text-green-700">My Plans</a>
        </div>

        {/* Login Button Image */}
        <div className="cursor-pointer bg-white rounded-lg  hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 p-1">
          <Image 
            src="/login_button.png" 
            alt="Login" 
            width={145} 
            height={145} 
          />
        </div>
      </div>

      {/* Hanging Tags */}
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
    </div>
  );
}
