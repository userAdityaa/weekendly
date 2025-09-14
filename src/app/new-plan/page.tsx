'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { UserData, MainPlan } from '../../../types/user';

export default function NewPlan() {
  const [stage, setStage] = useState(1);
  const [title, setTitle] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mainPlanId, setMainPlanId] = useState('');
  const router = useRouter();

  // Check for userData in localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else {
      // Redirect to main page if no userData is found
      router.push('/');
    }
  }, [router]);

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
    setError('');
  };

  const handleBack = () => {
    if (stage === 1) {
      router.push('/plans');
    } else {
      setStage(stage - 1);
    }
  };

  const handleNext = () => {
    if (stage === 1) {
      if (!title.trim()) {
        setError('Please enter a title or generate one randomly.');
        return;
      }

      if (userData) {
        const newPlanId = uuidv4();
        const newMainPlan: MainPlan = {
          id: newPlanId,
          title: title.trim(),
          startDate: new Date(),
          endDate: new Date(),
          subPlans: [],
          isPublic: false,
        };

        const updatedUserData: UserData = {
          ...userData,
          totalPlansMade: userData.totalPlansMade + 1,
          mainPlanList: [...(userData.mainPlanList || []), newMainPlan],
        };

        // Update userData in localStorage
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);

        // Create a dedicated localStorage entry for the main plan
        localStorage.setItem(`mainPlan_${newPlanId}`, JSON.stringify(newMainPlan));

        setMainPlanId(newPlanId);
        // Route to /plan/{mainPlanId} instead of incrementing stage
        router.push(`/plan/${newPlanId}`);
      }
    } else {
      // This case is no longer needed since we're routing instead of incrementing stage
      router.push(`/plan/${mainPlanId}`);
    }
  };

  // Render nothing while userData is being checked or redirecting
  if (userData === null) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 relative">
      {/* Back Button */}
      {stage === 1 && (
        <button
          onClick={handleBack}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 hover:bg-gray-200 rounded-full p-2 transition-all duration-200 max-md:top-60 max-md:left-1/2 max-md:-translate-x-1/2"
        >
          <img
            src="/arrow_prev.png"
            alt="Back"
            className="w-12 h-12"
          />
        </button>
      )}

      {/* Next Button */}
      {stage === 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-gray-200 rounded-full p-2 transition-all duration-200 max-md:top-180 max-md:right-1/2 max-md:translate-x-1/2"
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
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            placeholder="Enter your plan title"
            className={`border rounded-lg p-3 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-black shadow-sm ${error ? 'border-red-500' : ''}`}
          />
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
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
    </div>
  );
}