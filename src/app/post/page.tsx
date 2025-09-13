'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserData, MainPlan } from '../../../types/user';
import { Heart } from 'lucide-react';

interface Post {
  mainPlanId: string;
  username: string;
  gender: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function Post() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState('Posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const userData: UserData = JSON.parse(storedUserData);
      const publicPlans: Post[] = userData.mainPlanList
        .filter((plan: MainPlan) => plan.isPublic)
        .map((plan: MainPlan) => ({
          mainPlanId: plan.id,
          username: userData.name || 'User',
          gender: userData.gender || 'male',
          title: plan.title || 'Untitled Plan',
          startDate: plan.startDate
            ? new Date(plan.startDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
              })
            : 'N/A',
          endDate: plan.endDate
            ? new Date(plan.endDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
              })
            : 'N/A',
        }));
      setPosts(publicPlans);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLikeToggle = (mainPlanId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mainPlanId)) {
        newSet.delete(mainPlanId);
      } else {
        newSet.add(mainPlanId);
      }
      return newSet;
    });
  };

  const getAvatar = (gender: string): string => {
    return gender === 'female' ? '/female_user_one.png' : '/male_user_one.png';
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100 relative">
      {/* Sidebar */}
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
          <ul>
            <li
              className={`py-2 px-4 mb-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                selectedOption === 'Planning Dashboard'
                  ? 'bg-[#4dd25282] text-black'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
              onClick={() => router.push('/plans')}
            >
              Planning Dashboard
            </li>
            <li
              className={`py-2 px-4 mb-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                selectedOption === 'Posts'
                  ? 'bg-[#4dd25282] text-black'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
              onClick={() => setSelectedOption('Posts')}
            >
              Posts
            </li>
          </ul>
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

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-black mb-6">Posts</h1>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center">No public plans available.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.mainPlanId}
                className="bg-white rounded-lg p-4 shadow-md flex items-center space-x-4"
              >
                <Image
                  src={getAvatar(post.gender)}
                  alt={`${post.username}'s avatar`}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {post.username} has created a new plan: {post.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {post.startDate} - {post.endDate}
                  </p>
                </div>
                <Image
                  src="/placeholder_plan.png"
                  alt="Plan placeholder"
                  width={64}
                  height={48}
                  className="rounded object-cover"
                />
                <button
                  onClick={() => handleLikeToggle(post.mainPlanId)}
                  className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${likedPosts.has(post.mainPlanId) ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}