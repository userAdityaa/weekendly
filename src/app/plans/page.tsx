'use client';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Loader from '../../../components/Loader';
import { useRouter } from 'next/navigation';
import { UserData, MainPlan, SubPlan } from '../../../types/user';
import { Map, FileText } from 'lucide-react';
import { StandaloneSearchBox } from '@react-google-maps/api';
import PostList from '../../../components/PostList';
import { User } from 'lucide-react';

const WorldMap = dynamic(() => import('../../../components/WorldMap'), {
  ssr: false,
});

interface Friend {
  name: string;
  status: string;
}

interface PastPlan {
  mainPlanId: string;
  title: string;
  startDate: string;
  endDate: string;
  locations: string[];
  friends: string[];
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
  const [viewMode, setViewMode] = useState<'map' | 'posts'>('map');
  const router = useRouter();

  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Handle user data and derived state
  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    let parsedUserData: UserData | null = null;

    try {
      if (storedData) {
        parsedUserData = JSON.parse(storedData) as UserData;
        const totalPlansMade = parsedUserData.mainPlanList?.length ?? 0;
        parsedUserData = { ...parsedUserData, totalPlansMade };
      }
    } catch (error) {
      console.error('Error parsing userData from localStorage:', error);
      parsedUserData = null;
    }

    if (!parsedUserData) {
      router.push('/');
      return;
    }

    setUserData(parsedUserData);

    let friendList: Friend[] = [];
    if (parsedUserData?.mainPlanList) {
      const allFriends = new Set<string>();
      parsedUserData.mainPlanList.forEach((mainPlan: MainPlan) => {
        mainPlan.subPlans?.forEach((subPlan: SubPlan) => {
          subPlan.friendList?.forEach((friend: string) => allFriends.add(friend));
        });
      });

      const defaultFriendNames = new Set(friendList.map((f) => f.name));
      const newFriends = Array.from(allFriends)
        .filter((name) => !defaultFriendNames.has(name))
        .map((name) => ({
          name,
          status: 'Recently added',
        }));

      friendList = [...friendList, ...newFriends];
    }

    setFriends(friendList);

    const storedPastPlans = parsedUserData?.mainPlanList?.map((mainPlan: MainPlan) => {
      const locations = mainPlan.subPlans?.map((subPlan: SubPlan) => subPlan.location || 'TBD') ?? [];
      const friends = Array.from(
        new Set(
          mainPlan.subPlans?.flatMap((subPlan: SubPlan) => subPlan.friendList ?? []) ?? []
        )
      );
      return {
        mainPlanId: mainPlan.id,
        title: mainPlan.title || 'Untitled Plan',
        startDate: mainPlan.startDate
          ? new Date(mainPlan.startDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
            })
          : 'N/A',
        endDate: mainPlan.endDate
          ? new Date(mainPlan.endDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
            })
          : 'N/A',
        locations: locations.length > 0 ? locations : ['No locations set'],
        friends: friends.length > 0 ? friends : ['No friends'],
      };
    }) ?? [];

    setPastPlans(storedPastPlans);
  }, [router]);

  const handleSearchBoxLoad = (searchBox: google.maps.places.SearchBox) => {
    searchBoxRef.current = searchBox;
  };

  const handlePlacesChanged = () => {
    if (!searchBoxRef.current) return;
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const location = place.formatted_address || place.name || 'Unknown Location';
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(googleMapsUrl, '_blank');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleNewPlanClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/new-plan');
    }, 3000);
  };

  const handleUpdateProfile = () => { 
    router.push('/profile');
  }

  const handleViewPlan = (mainPlanId: string) => {
    router.push(`/plan/${mainPlanId}`);
  };

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
        <div className="mt-20 flex flex-col items-center space-y-4">
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-green-500' : 'bg-transparent'}`}
          >
            <Map size={30} className={viewMode === 'map' ? 'text-white' : 'text-[#19a719e3]'} />
          </button>
          <button
            onClick={() => setViewMode('posts')}
            className={`p-2 rounded-lg ${viewMode === 'posts' ? 'bg-green-500' : 'bg-transparent'}`}
          >
            <FileText size={30} className={viewMode === 'posts' ? 'text-white' : 'text-[#19a719e3]'} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-16 h-[100vh] p-4 w-[70.5%] max-[1367]:w-[100vw] overflow-hidden max-md:overflow-auto max-md:w-full max-md:ml-0">
        {/* Header */}
        <div className="flex max-md:flex-col justify-between items-center mb-4 max-md:items-start">
          <div className='flex w-full justify-between'>
          <div className="">
            <p className="text-xl font-semibold text-gray-800">
              Hi {userData?.name || 'User'} 👋
            </p>
            <p className="text-sm text-gray-600">
              Welcome back & Let&apos;s plan today.
            </p>
          </div>

          <div className="items-center -mt-[0.3rem] gap-3 hidden max-md:visible max-md:flex">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-green-500' : 'bg-white'}`}
            >
              <Map size={22} className={viewMode === 'map' ? 'text-white' : 'text-[#094709d0]'} />
            </button>
            <button
              onClick={() => setViewMode('posts')}
              className={`p-2 rounded-lg ${viewMode === 'posts' ? 'bg-green-500' : 'bg-white'}`}
            >
              <FileText size={22} className={viewMode === 'posts' ? 'text-white' : 'text-[#094709d0]'} />
            </button>
            <button
              className={`p-2 rounded-lg bg-white`}
              onClick={handleUpdateProfile}
            >
              <User size={22} className="text-[#094709d0]" />
            </button>
          </div>
        </div>
        

          <div className="relative">
            <StandaloneSearchBox
              onLoad={handleSearchBoxLoad}
              onPlacesChanged={handlePlacesChanged}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Location..."
                className="rounded-md bg-white px-4 py-1 text-gray-600 focus:outline-none w-[25rem] max-md:w-[92vw] max-md:mt-[1rem]"
              />
            </StandaloneSearchBox>
          </div>

          <button className='max-md:hidden text-white w-[18rem] p-1 ml-[1rem] rounded-lg font-medium bg-[#41af419f]' onClick={handleUpdateProfile}>Update Profile</button>
        </div>

        {viewMode === 'map' ? (
          <>
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
            <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4 w-[68.4vw] max-[1367]:w-[92.5vw] max-[1181]:w-[91.5vw] max-[1025]:w-[90.5vw] max-md:w-full">
              <div className="col-span-2 max-md:col-span-1 bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 shadow-md overflow-y-auto h-[43vh] max-md:w-full">
                <div className="flex justify-between items-center mb-4 text-black">
                  <h2 className="text-lg font-semibold">Plans made in the past</h2>
                </div>
                <ul className="space-y-3">
                  {pastPlans.map((plan, index) => (
                    <li
                      key={index}
                      className="bg-white rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <Image
                        src="/one.jpg"
                        alt={`${plan.title} image`}
                        width={80}
                        height={80}
                        className="rounded mr-4 object-cover h-[8rem] w-[8rem]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{plan.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="mr-2">{plan.locations.join(', ')}</span>
                          <span className="mr-2">• {plan.startDate} - {plan.endDate}</span>
                          <span>• {plan.friends.join(', ')}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewPlan(plan.mainPlanId)}
                        className="ml-auto bg-green-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors duration-200"
                      >
                        View
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                onClick={handleNewPlanClick}
                className="cursor-pointer col-span-1 rounded-xl text-black h-[43vh] p-6 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform bg-[#70cf70a9]"
              >
                <Image
                src = "/four.jpg"
                alt='create new card'
                width={400}
                height={300}
                className='h-[35rem] scale-105 rounded-xl'
                />
                <h2 className="text-[1.8rem] font-bold text-white mb-2 mt-[1rem]">Create New Plan</h2>
                <p className="text-sm text-white opacity-90 text-center mb-4">Start your next adventure with friends!</p>
                <div className="bg-white text-green-600 font-semibold px-6 py-2 rounded-xl hover:bg-green-100 transition-colors duration-200">
                  Plan Now
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg p-4 h-[88vh] shadow-md overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-black">Recent Posts</h2>
            <div className="space-y-4">
                <PostList userData={userData!} /> 
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="max-[1367]:hidden">
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
        <div className="min-h-screen w-[22rem] mx-auto p-4 relative z-10 mt-[3rem] -right-3">
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
                <div className="flex items-center gap-2">
                  <p className="text-md text-black font-semibold">Favourite Hobby: </p>
                  <p className="text-md font-semibold">{userData?.hobby || 'Climbing'}</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-50 rounded-lg p-2 w-[100%] flex items-center text-black gap-2">
                <Image src="/trip.png" alt="Travel icon" width={25} height={25} />
                <div className="flex items-center gap-2">
                  <p className="text-md text-black font-semibold">Trips Taken: </p>
                  <p className="text-md font-semibold">{userData?.totalPlansMade || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-1000">
          <Loader />
        </div>
      )}
    </div>
  );
}