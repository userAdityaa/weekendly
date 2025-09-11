"use client";

import React from "react";
import Lottie from "lottie-react";
import loaderAnimation from "@/../public/Loader.json";

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white">
      <Lottie 
        animationData={loaderAnimation} 
        loop={true} 
        style={{ width: 150, height: 150 }} 
      />
    </div>
  );
};

export default Loader;
