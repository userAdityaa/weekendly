'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Loader from '../../../components/Loader';
import { useRouter } from 'next/navigation';
import { UserData } from '../../../types/user';

const WorldMap = dynamic(() => import('../../../components/WorldMap'), {
  ssr: false,
});

interface Friend {
  name: string;
  status: string;
}

interface PastPlan {
  title: string;
  location: string;
  date: string;
  people: string;
}

const getAvatar = (name: string): string => {
  const femaleNames = ['Stephanie', 'Maryin Kay'];
  return femaleNames.includes(name) ? '/female_user_one.png' : '/male_user_one.png';
};

export default function Plans() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pastPlans, setPastPlans] = useState<PastPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }

    const storedFriends = localStorage.getItem('friends');
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends));
    } else {
      setFriends([
        { name: 'Albert Flores', status: 'Online' },
        { name: 'Maryin Kay', status: '40 hr ago' },
      ]);
    }

    const storedPastPlans = localStorage.getItem('pastPlans');
    if (storedPastPlans) {
      setPastPlans(JSON.parse(storedPastPlans));
    } else {
      setPastPlans([
        { title: 'Hiking on Mount Denali', location: 'Alaska', date: '20 Nov', people: '3 pec' },
        { title: 'Camping on Cho Oyu', location: 'Nepal', date: '9-10 ago', people: '4 pec' },
      ]);
    }
  }, []);

  const handleNewPlanClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/new-plan");
    }, 3000);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex w-full h-full m-0 p-0 bg-[#d6ffd6ee] overflow-hidden max-md:overflow-auto">
      {/* Sidebar */}
      <div className="w-16 h-screen bg-[#8be77d86] fixed left-0 top-0 max-md:hidden">
        <Image
          src="/only_logo.png"
          alt="only logo without text"
          className="absolute top-2 left-1"
          width={55}
          height={55}
        />
      </div>

      {/* Main Content */}
      <div className="ml-16 h-[100vh] p-4 w-[70.5%] max-[1367]:w-[100vw] overflow-hidden max-md:overflow-auto max-md:w-full max-md:ml-0">
        {/* Header */}
        <div className="flex max-md:flex-col justify-between items-center mb-4 max-md:items-start">
          <div className=''>
            <p className="text-xl font-semibold text-gray-800">
              Hi {userData?.name || 'User'} 👋
            </p>
            <p className="text-sm text-gray-600">
              Welcome back & Let&apos;s plan today.
            </p>
          </div>
          <input
            type="text"
            placeholder="Search Location..."
            className="rounded-xl bg-white px-4 py-2 text-gray-600 focus:outline-none w-[25rem] max-md:w-[92vw] max-md:mt-[1rem]"
          />
        </div>

        {/* Map + Friends */}
        <div className="grid grid-cols-3 gap-4 mb-2 max-md:grid-cols-1">
          <div className="col-span-2 bg-white rounded-lg p-4 h-[45vh] shadow-md overflow-hidden max-md:col-span-1">
            <h2 className="text-lg font-semibold mb-2 text-black">Most Visited Place</h2>
            <div className="w-full h-[90%]">
              <WorldMap />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 h-[45vh] shadow-md">
            <div className="flex flex-col justify-start items-start mb-4">
              <h2 className="text-lg font-semibold text-black">Friendlist</h2>
              <span className="text-gray-500 text-sm">Friends you mostly recently made plans with.</span>
            </div>
            <ul className="space-y-3 overflow-y-auto h-[calc(100%-4rem)]">
              {friends.map((friend, index) => (
                <li
                  key={index}
                  className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <Image
                    src={getAvatar(friend.name)}
                    alt={`${friend.name}'s avatar`}
                    width={40}
                    height={40}
                    className="rounded-full mr-3 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{friend.name}</p>
                    <p className="text-xs text-gray-500">{friend.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Past Plans + Create New */}
        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4 w-[67.5vw] max-[1367]:w-[92.5vw] max-[1181]:w-[91.5vw] max-[1025]:w-[90.5vw] max-md:w-full">
          <div className="col-span-2 max-md:col-span-1 bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 shadow-md overflow-y-auto h-[43vh] max-md:w-full">
            <div className="flex justify-between items-center mb-4 text-black">
              <h2 className="text-lg font-semibold">Plans made in the past</h2>
              <span className="text-sm text-gray-500 font-semibold hover:text-gray-700 cursor-pointer transition-colors duration-200">View</span>
            </div>
            <ul className="space-y-3">
              {pastPlans.map((plan, index) => (
                <li
                  key={index}
                  className="bg-white rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <Image
                    src="/location.png"
                    alt={`${plan.title} image`}
                    width={64}
                    height={48}
                    className="rounded mr-4 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{plan.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="mr-2">{plan.location}</span>
                      <span className="mr-2">• {plan.date}</span>
                      <span>• {plan.people}</span>
                    </p>
                  </div>
                  <button className="ml-auto bg-green-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors duration-200">
                    Join
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Create New Plan card */}
          <div
            onClick={handleNewPlanClick}
            className="cursor-pointer rounded-xl text-black h-[43.5vh] w-full  p-6 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Create New Plan</h2>
            <p className="text-sm text-white opacity-90 text-center mb-4">Start your next adventure with friends!</p>
            <div className="bg-white text-green-600 font-semibold px-6 py-2 rounded-full hover:bg-green-100 transition-colors duration-200">
              Plan Now
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className='max-[1367]:hidden'>
        <Image
          src="/plans_sideimage.png"
          alt="Plans Side Image"
          className="h-screen w-[24%] object-cover fixed right-0 top-0"
          width={400}
          height={400}
        />
        <div className="absolute h-[4rem] top-0 right-50">
          <div className="flex items-center justify-between h-full px-4 font-bold">
            <p className="text-2xl text-white">My Profile</p>
          </div>
        </div>
        <div className="min-h-screen w-[22rem] mx-auto p-4 relative z-10 mt-[3rem]  -right-3">
          <div className="flex flex-col items-center justify-center">
            <Image
              src={userData?.gender === 'female' ? '/female_user_one.png' : '/male_user_one.png'}
              alt={`${userData?.name || 'User'} avatar`}
              width={55}
              height={200}
              className="rounded-full mb-4"
            />
            <h1 className="text-2xl font-bold text-white text-center">{userData?.name || 'User'}</h1>
            <p className="text-lg text-white text-center">{userData?.hobby || 'No Hobby Set'}</p>
            <div className="flex flex-col space-y-4 mt-4 w-[100%] h-[3rem]">
              <div className="bg-white bg-opacity-50 rounded-lg p-2 w-[100%] flex gap-2 items-center text-black">
                <Image src="/trips_tken.png" alt="Travel icon" width={25} height={25} />
                <div className='flex items-center gap-2'>
                  <p className="text-md text-black font-semibold">Favourite Hobby: </p>
                  <p className="text-md font-semibold">{userData?.hobby || 'Climbing'}</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-50 rounded-lg p-2 w-[100%] flex items-center text-black gap-2">
                <Image src="/trip.png" alt="Travel icon" width={25 } height={25} />
                <div className='flex items-center gap-2'>
                  <p className="text-md text-black font-semibold">Trips Taken: </p>
                  <p className="text-md font-semibold">{userData?.totalPlansMade || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}