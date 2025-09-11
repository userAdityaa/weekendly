'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Work_Sans } from 'next/font/google';

export const workSans = Work_Sans({
  subsets: ["latin"]
});

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative z-[100]">
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
          className={`flex space-x-6 ${workSans.className} text-[1.3rem] -ml-[8rem] font-semibold max-md:hidden`}
        >
          <a href="#" className="text-gray-800 hover:text-green-700">
            Planner
          </a>
          <a href="#" className="text-gray-800 hover:text-green-700">
            Themes
          </a>
          <a href="#" className="text-gray-800 hover:text-green-700">
            My Plans
          </a>
        </div>

        {/* Desktop Login Text */}
        <div className="cursor-pointer text-gray-800 font-semibold max-md:hidden">
          Login
        </div>

        {/* Mobile Hamburger */}
        <button
          className="hidden max-md:block p-2 -mr-4"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={32} className='text-zinc-400' /> : <Menu size={32} className='text-zinc-400'/>}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="fixed top-[6rem] right-4 transform  w-[115px] bg-[#fefefe] border border-black shadow-lg z-20 flex flex-col items-center justify-start space-y-4 py-4 rounded-lg max-md:flex px-4">
          <a
            href="#"
            className={`text-gray-800 hover:text-green-700 ${workSans.className} font-semibold text-lg w-full text-center`}
          >
            Planner
          </a>
          <a
            href="#"
            className={`text-gray-800 hover:text-green-700 ${workSans.className} font-semibold text-lg w-full text-center`}
          >
            Themes
          </a>
          <a
            href="#"
            className={`text-gray-800 hover:text-green-700 ${workSans.className} font-semibold text-lg w-full text-center`}
          >
            My Plans
          </a>
          <a
            href="#"
            className={`text-gray-800 hover:text-green-700 ${workSans.className} font-semibold text-lg w-full text-center`}
          >
            Login
          </a>
        </div>
      )}
    </div>
  );
}
