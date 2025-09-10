'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const WorldMap = dynamic(() => import ('../../../components/WorldMap'), {
  ssr: false,
})

// Define types for friends and past plans
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

// Helper function to determine avatar based on name
const getAvatar = (name: string): string => {
  const femaleNames = ['Stephanie', 'Maryin Kay'];
  return femaleNames.includes(name) ? '/female_user_one.png' : '/male_user_one.png';
};

export default function Plans() {
  const [accountName, setAccountName] = useState<string>('Aditya');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pastPlans, setPastPlans] = useState<PastPlan[]>([]);

  useEffect(() => {
    // Load accountName
    const name = localStorage.getItem('accountName') || 'Aditya';
    setAccountName(name);

    // Load friends
    const storedFriends = localStorage.getItem('friends');
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends));
    } else {
      setFriends([
        { name: 'Albert Flores', status: 'Online' },
        { name: 'Maryin Kay', status: '40 hr ago' },
        { name: 'Guy Nawkin', status: 'Active in ago' },
        { name: 'Stephanie', status: '1 hour ago' },
      ]);
    }

    // Load pastPlans
    const storedPastPlans = localStorage.getItem('pastPlans');
    if (storedPastPlans) {
      setPastPlans(JSON.parse(storedPastPlans));
    } else {
      setPastPlans([
        { title: 'Hiking on Mount Denali', location: 'Alaska', date: '20 Nov', people: '3 pec' },
        { title: 'Camping on Cho Oyu', location: 'Nepal', date: '9-10 ago', people: '4 pec' },
        { title: 'Explore Mount Elbrus', location: 'Russia', date: '10 Jan ago', people: '5 pec' },
      ]);
    }
  }, []);

  return (
    <div className="flex min-h-screen w-full m-0 p-0 bg-[#d6ffd6ee]">
      <div className="w-16 h-screen bg-[#8be77d86] fixed left-0 top-0">
        <Image 
          src="/only_logo.png"
          alt="only logo without text"
          className="absolute top-2 left-1"
          width={55}
          height={55}
        />
      </div>
      <div className="ml-16 min-h-screen p-4 w-[70.5%]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xl font-semibold text-gray-800">
              Hi {accountName} 👋
            </p>
            <p className="text-sm text-gray-600">
              Welcome back & Let&apos;s plan today.
            </p>
          </div>
          <input
            type="text"
            placeholder="Search Location..."
            className="rounded-xl bg-white px-4 py-2 text-gray-600 focus:outline-none w-[25rem]"
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="col-span-2 bg-white rounded-lg p-4 h-[27rem] shadow-md overflow-hidden">
            <h2 className="text-lg font-semibold mb-2 text-black">Most Visited Place</h2>
            <div className="w-full h-[90%]">
              <WorldMap />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 h-[22rem] shadow-md">
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
        <div className="grid grid-cols-3 gap-2 h-[30%] absolute bottom-25">
          <div className="col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 shadow-md overflow-y-auto w-[96%] h-[74%]">
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
          <div className="rounded-lg flex flex-col justify-center items-center text-black relative h-[30rem] w-[21rem] -top-25 -left-8">
            <Image
              src="/crate_new.png"
              alt="Create New Plan"
              layout="fill"
              objectFit="fill"
              className="rounded-lg"
            />
            <div className="absolute inset-0 bg-opacity-40 rounded-lg"></div>
            <div className="absolute bottom-4 w-[80%] bg-[#aaeeaaf3] rounded-2xl shadow-md p-4 mb-4">
              <div className="text-center">
                <p className="text-xl font-bold text-white drop-shadow-md">Make new Plans</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Image
          src="/plans_sideimage.png"
          alt="Plans Side Image"
          className="h-screen w-[25%] object-cover fixed right-0 top-0"
          width={400}
          height={400}
        />
        <div className="absolute w-[30rem] h-[4rem]">
          <div className="flex items-center justify-between h-full px-4 font-bold">
            <p className="text-2xl">My Profile</p>
          </div>
        </div>
        <div className="min-h-screen w-[23rem] mx-auto p-4 relative z-10 mt-[3rem]">
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/male_user_one.png"
              alt="Christian Pulisic avatar"
              width={55}
              height={200}
              className="rounded-full mb-4"
            />
            <h1 className="text-2xl font-bold text-white text-center">Christian Pulisic</h1>
            <p className="text-lg text-white text-center">Mountain Climber</p>
            <div className="flex space-x-4 mt-4 w-[100%] h-[5rem]">
              <div className="bg-white bg-opacity-50 rounded-lg p-2  w-[50%] flex items-center text-black gap-2">
                <Image src="/trips_tken.png" alt="Travel icon" width={50} height={50} />
                <div className='flex flex-col items-center'>
                <p className="text-sm text-black font-semibold">Fav. Hobby</p>
                <p className="text-md font-semibold">Climbing</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-50 rounded-lg p-3  w-[50%] flex items-center text-black gap-2">
                <Image src="/trip.png" alt="Travel icon" width={50} height={50} />
                <div className='flex flex-col items-center'>
                <p className="text-sm text-black font-semibold">Trips Taken</p>
                <p className="text-md font-semibold">5</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}