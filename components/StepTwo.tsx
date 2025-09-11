'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Dashboard from './Dashboard';
import { LayoutList, LayoutGrid } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function StepTwo() {
  const [selectedOption, setSelectedOption] = useState('Main Planning Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Load dates from localStorage on component mount
  useEffect(() => {
    const savedStartDate = localStorage.getItem('startDate');
    const savedEndDate = localStorage.getItem('endDate');
    if (savedStartDate) setStartDate(new Date(savedStartDate));
    if (savedEndDate) setEndDate(new Date(savedEndDate));
  }, []);

  // Save dates to localStorage when they change
  useEffect(() => {
    if (startDate) {
      localStorage.setItem('startDate', startDate.toISOString());
    } else {
      localStorage.removeItem('startDate');
    }
    if (endDate) {
      localStorage.setItem('endDate', endDate.toISOString());
    } else {
      localStorage.removeItem('endDate');
    }
  }, [startDate, endDate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleLayout = () => {
    setLayout((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100 relative">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } bg-[#8be77d86] shadow-lg p-5 transition-all duration-300 overflow-y-auto relative`}
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
                className={`py-2 px-4 mb-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedOption === 'Main Planning Dashboard'
                    ? 'bg-[#4dd25282] text-black'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
                onClick={() => setSelectedOption('Main Planning Dashboard')}
              >
                Main Planning Dashboard
              </li>
              <li
                className={`py-2 px-4 mb-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedOption === 'Calendar View'
                    ? 'bg-[#4dd25282] text-black'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
                onClick={() => setSelectedOption('Calendar View')}
              >
                Calendar View
              </li>
            </ul>
            {/* Date Picker Section */}
            <div className="mt-8 ml-[0.1rem]">
              <h3 className="text-md font-semibold text-black mb-2">Select Plan Date</h3>
              <div className="mb-4">
                <label className="block text-xs text-black mb-1">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate || new Date()}
                  inline
                  calendarClassName="bg-white border rounded-lg shadow-lg text-black"
                />
              </div>
              <div>
                <label className="block text-xs text-black mb-1">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  maxDate={new Date()}
                  inline
                  calendarClassName="bg-white border rounded-lg shadow-lg text-black"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reopen Sidebar Button */}
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

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-black">
            {selectedOption}
          </h1>

          {selectedOption === 'Main Planning Dashboard' && (
            <div
              onClick={toggleLayout}
              className={`relative mr-[1.1rem] w-20 h-8 flex items-center rounded-lg p-1 cursor-pointer transition-colors ${
                layout === 'horizontal' ? 'bg-gray-400' : 'bg-gray-400'
              }`}
            >
              {/* Sliding Knob */}
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
          )}
        </div>

        {selectedOption === 'Main Planning Dashboard'
          ? <Dashboard layout={layout} />
          : 'Calendar View will display your planning schedule (coming soon).'}
      </div>
    </div>
  );
}