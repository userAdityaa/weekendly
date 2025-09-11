'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepTwo from '../../../components/StepTwo';

export default function NewPlan() {
  const [stage, setStage] = useState(1);
  const [title, setTitle] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  const generateRandomTitle = () => {
    const funTitles = [
      'Epic Adventure Blueprint',
      'Master Plan Extravaganza',
      'Quest for Greatness',
      'Operation Awesome',
      'Dream Big Scheme',
    ];
    const randomTitle = funTitles[Math.floor(Math.random() * funTitles.length)];
    setTitle(randomTitle);
  };

  const handleBack = () => {
    if (stage === 1) {
      router.push('/plans'); // Navigate to plans page
    } else {
      setStage(stage - 1); // Go back to previous stage
    }
  };

  const handleNext = () => {
    setStage(stage + 1); // Proceed to next stage
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 relative">
      {/* Back Button - Vertically centered, extreme left, only for Stage 1 */}
      {stage === 1 && (
        <button
          onClick={handleBack}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 hover:bg-gray-200 rounded-full p-2 transition-all duration-200"
        >
          <img
            src="/arrow_prev.png"
            alt="Back"
            className="w-12 h-12"
          />
        </button>
      )}

      {/* Next Button - Vertically centered, extreme right, rotated 180 degrees, only for Stage 1 */}
      {stage === 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-gray-200 rounded-full p-2 transition-all duration-200"
        >
          <img
            src="/arrow_prev.png"
            alt="Next"
            className="w-12 h-12 rotate-180"
          />
        </button>
      )}

      {stage === 1 && (
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold mb-8 text-black tracking-tight">
            Do you have a planning title in mind (just for fun)?
          </h1>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your plan title"
            className="border rounded-lg p-3 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-black shadow-sm"
          />
          <div className="flex items-center justify-center mb-6">
            <div className="border-t border-gray-300 flex-grow"></div>
            <span className="mx-4 text-gray-500">or</span>
            <div className="border-t border-gray-300 flex-grow"></div>
          </div>
          <div className="relative inline-block">
            <button
              onClick={generateRandomTitle}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform duration-200 shadow-md"
            >
              Generate Title
            </button>
            {showTooltip && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-3 w-64 bg-gray-800 text-white text-sm rounded-lg p-3 shadow-lg transition-opacity duration-200">
                A random fun title will be generated for your planning
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-gray-800"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === 2 && <StepTwo />}
    </div>
  );
}