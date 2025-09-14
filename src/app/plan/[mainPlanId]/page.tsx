'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Dashboard from '../../../../components/Dashboard';
import Calendar from '../../../../components/Calendar';
import { LayoutList, LayoutGrid, LayoutDashboard, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { UserData, MainPlan } from '../../../../types/user';
import { toast } from 'react-hot-toast';
import Lottie from 'lottie-react';
import confettiAnimation from '../../../../public/confetti.json';

export default function Plan() {
  const params = useParams();
  const mainPlanId = params.mainPlanId as string;
  const [selectedOption, setSelectedOption] = useState('Planning Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
      ? 'vertical'
      : 'horizontal'
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [error, setError] = useState('');
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  const defaultPlanIds = ['default1', 'default2', 'default3', 'default4'];
  const isDefaultPlan = defaultPlanIds.includes(mainPlanId);

  // Update layout on window resize
  useEffect(() => {
    const handleResize = () => {
      setLayout(window.matchMedia('(max-width: 768px)').matches ? 'vertical' : 'horizontal');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!mainPlanId) {
      setError('Invalid plan ID.');
      return;
    }

    const storedPlan = localStorage.getItem(`mainPlan_${mainPlanId}`);
    if (!storedPlan) {
      setError('Plan not found.');
      return;
    }

    const savedStartDate = localStorage.getItem(`mainPlan_${mainPlanId}_startDate`);
    const savedEndDate = localStorage.getItem(`mainPlan_${mainPlanId}_endDate`);
    if (savedStartDate) setStartDate(new Date(savedStartDate));
    if (savedEndDate) setEndDate(new Date(savedEndDate));
  }, [mainPlanId]);

  useEffect(() => {
    if (startDate) {
      localStorage.setItem(`mainPlan_${mainPlanId}_startDate`, startDate.toISOString());
    } else {
      localStorage.removeItem(`mainPlan_${mainPlanId}_startDate`);
    }
    if (endDate) {
      localStorage.setItem(`mainPlan_${mainPlanId}_endDate`, endDate.toISOString());
    } else {
      localStorage.removeItem(`mainPlan_${mainPlanId}_endDate`);
    }
  }, [startDate, endDate, mainPlanId]);

  useEffect(() => {
    if (isDatePickerOpen || isPublicModalOpen || showConfetti) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isDatePickerOpen, isPublicModalOpen, showConfetti]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleLayout = () => {
    setLayout((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  };

  const toggleDatePicker = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const handleCreatePlan = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates.', {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }
    setIsPublicModalOpen(true);
  };

  const handlePublicChoice = (isPublic: boolean) => {
    const storedUserData = localStorage.getItem('userData');
    const storedMainPlan = localStorage.getItem(`mainPlan_${mainPlanId}`);
    if (storedUserData && storedMainPlan) {
      const userData: UserData = JSON.parse(storedUserData);
      const mainPlan: MainPlan = JSON.parse(storedMainPlan);
      if (startDate == null) return;
      if (endDate == null) return;

      const updatedMainPlan: MainPlan = {
        ...mainPlan,
        startDate,
        endDate,
        isPublic,
      };

      const updatedMainPlanList = userData.mainPlanList.map((plan) =>
        plan.id === mainPlanId ? updatedMainPlan : plan
      );
      const updatedUserData: UserData = {
        ...userData,
        mainPlanList: updatedMainPlanList,
      };

      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      localStorage.setItem(`mainPlan_${mainPlanId}`, JSON.stringify(updatedMainPlan));

      localStorage.removeItem(`mainPlan_${mainPlanId}_startDate`);
      localStorage.removeItem(`mainPlan_${mainPlanId}_endDate`);

      setIsPublicModalOpen(false);
      setShowConfetti(true);

      setTimeout(() => {
        router.push('/plans');
      }, 3000);
    } else {
      toast.error('Error: Plan data not found.', {
        duration: 3000,
        position: 'top-right',
      });
      setIsPublicModalOpen(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => router.push('/plans')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100 relative">
      <div
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } bg-[#8be77d86] shadow-lg p-5 transition-all duration-300 overflow-y-auto relative max-md:hidden`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">
            {isSidebarOpen ? (
              <Image
                src="/logo.png"
                alt="weekendly logo"
                className="-ml-[0.5rem]"
                width={200}
                height={200}
              />
            ) : (
              <Image
                src="/only_logo.png"
                alt="weekendly logo"
                className="mx-auto"
                width={100}
                height={100}
              />
            )}
          </h2>
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 bg-gray-200 text-black rounded-full shadow-lg hover:bg-gray-200 transition flex items-center justify-center absolute right-2 top-4 z-50"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>
        {isSidebarOpen && (
          <>
            <ul>
              <li
                className={`py-2 px-4 mb-2 rounded-lg font-medium cursor-pointer transition-colors duration-200 flex items-center gap-2 ${
                  selectedOption === 'Planning Dashboard'
                    ? 'bg-[#23b72894] text-black'
                    : 'bg-[#8be77d86] text-black hover:bg-[#4dd25282]'
                }`}
                onClick={() => setSelectedOption('Planning Dashboard')}
              >
                <LayoutDashboard className="w-5 h-5" />
                Planning Dashboard
              </li>
              <li
                className={`py-2 px-4 mb-2 rounded-lg font-medium cursor-pointer transition-colors duration-200 flex items-center gap-2 ${
                  selectedOption === 'Calendar View'
                    ? 'bg-[#23b72894] text-black'
                    : 'bg-[#8be77d86] text-black hover:bg-[#4dd25282]'
                }`}
                onClick={() => setSelectedOption('Calendar View')}
              >
                <CalendarIcon className="w-5 h-5" />
                Calendar View
              </li>
            </ul>
            <div className="mt-8 ml-[0.1rem]">
              <h3 className="text-md font-semibold text-black mb-2">Select Plan Date</h3>
              <div className="mb-4">
                <label className="block text-xs text-black mb-1">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => {
                    setStartDate(date);
                    setError('');
                  }}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  inline
                  calendarClassName="bg-white border rounded-lg shadow-lg text-black"
                />
              </div>
              <div>
                <label className="block text-xs text-black mb-1">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => {
                    setEndDate(date);
                    setError('');
                  }}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  inline
                  calendarClassName="bg-white border rounded-lg shadow-lg text-black"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              <button
                onClick={handleCreatePlan}
                className="mt-4 w-full bg-[#4dd252] text-black py-2 rounded-lg hover:bg-[#4dd25282] transition"
                disabled = {isDefaultPlan}
              >
                Create / Update Plan
              </button>
            </div>
          </>
        )}
      </div>

      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition flex items-center justify-center absolute left-24 top-4 z-50"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      <div className="flex-1 p-8">
        <div className="flex max-md:flex-col max-md:justify-start max-md:items-start max-md:gap-4 items-center justify-between mb-6">
          <h1 className="text-3xl max-[391]:text-[1.68em] max-[431]:text-[1.8rem] font-bold text-black max-md:text-[#118b11ee] max-md:uppercase">
            {selectedOption === "Calendar View" ? "": selectedOption}
          </h1>

          {selectedOption === 'Planning Dashboard' && (
            <div className="flex items-center gap-4 max-md:justify-between max-md:w-full">
              <div
                onClick={toggleLayout}
                className={`relative mr-[1.1rem] w-20 h-8 flex items-center max-md:justify-between rounded-lg p-1 cursor-pointer transition-colors ${
                  layout === 'horizontal' ? 'bg-gray-400' : 'bg-gray-400'
                }`}
              >
                <div
                  className={`bg-white w-8 h-6 rounded-md shadow-md flex items-center justify-center transform transition-transform ${
                    layout === 'horizontal' ? 'translate-x-0' : 'translate-x-10'
                  }`}
                >
                  {layout === 'horizontal' ? (
                    <LayoutList className="w-5 h-5 text-black" />
                  ) : (
                    <LayoutGrid className="w-5 h-5 text-black" />
                  )}
                </div>
              </div>

              <button
                onClick={toggleDatePicker}
                className="md:hidden w-[200px] h-[33px] text-black rounded-lg hover:bg-gray-300 transition flex items-center justify-center border border-zinc-300 bg-[#aeae] p-1 ml-[2vh]"
              >
                Create / Update Plan
              </button>
            </div>
          )}
        </div>

        {isDatePickerOpen && (
          <div className="fixed inset-0 backdrop:blur-2xl bg-opacity-50 flex items-center justify-center z-50 md:hidden">
            <div className="bg-white p-6 w-9/12 max-w-md rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-black">Select Plan Date</h3>
                <button
                  onClick={toggleDatePicker}
                  className="text-black hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-xs text-black mb-1">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => {
                    setStartDate(date);
                    setError('');
                  }}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  inline
                  calendarClassName="bg-white border rounded-lg shadow-lg text-black"
                />
              </div>
              <div>
                <label className="block text-xs text-black mb-1">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => {
                    setEndDate(date);
                    setError('');
                  }}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  inline
                  calendarClassName="bg-white border rounded-lg shadow-lg text-black"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              <button
                onClick={handleCreatePlan}
                className="mt-4 w-full bg-[#4dd252] text-black py-2 rounded-lg hover:bg-[#4dd25282] transition"
              >
                Create Plan
              </button>
            </div>
          </div>
        )}

        {isPublicModalOpen && (
          <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
            <div className="text-center p-6 w-full max-w-md">
              <h2 className="text-2xl font-semibold text-black mb-4">
                Make Your Plan Public?
              </h2>
              <p className="text-black mb-6">
                Would you like to make this plan public? If public, other users will be able to view your plan.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handlePublicChoice(true)}
                  className="bg-[#4dd252] text-black px-6 py-2 rounded-lg hover:bg-[#4dd25282] transition"
                >
                  Make Public
                </button>
                <button
                  onClick={() => handlePublicChoice(false)}
                  className="bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Keep Private
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfetti && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-90">
            <div className="text-center p-6 w-full max-w-md">
              <Lottie animationData={confettiAnimation} loop={false} className="w-full h-64" />
              <h2 className="text-2xl font-semibold text-black mb-4">
                Hurraahh!
              </h2>
              <p className="text-black mb-6">
                You have finally made a weekend plan! You can view it in the plans section.
              </p>
            </div>
          </div>
        )}

        {selectedOption === 'Planning Dashboard' ? (
          <Dashboard layout={layout} mainPlanId={mainPlanId} />
        ) : (
          <Calendar mainPlanId={mainPlanId} />
        )}
      </div>
    </div>
  );
}