'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Post from './Post';
import { MainPlan, UserData } from '../types/user';

interface PostListProps {
  userData?: UserData; // Optional userData to handle cases where no user data is provided
}

export default function PostList({ userData }: PostListProps) {
  const router = useRouter();

  // List of available post images
  const postImages = ['/one.jpg', '/two.jpg', '/three.jpg', '/four.jpg', '/five.jpg'];

  // Function to get a random image
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * postImages.length);
    return postImages[randomIndex];
  };

  // Default dummy posts with subplans (exactly 4)
  const defaultPosts = [
    {
      id: 'default1',
      username: 'TravelLover',
      avatar: '/male_user_one.png',
      startDate: '2025-10-15',
      endDate: '2025-10-20',
      image: getRandomImage(), // Assign random image
      likes: 10,
      mainPlan: {
        id: 'default1',
        title: 'Beach Vacation',
        startDate: new Date('2025-10-15'),
        endDate: new Date('2025-10-20'),
        subPlans: [
          {
            id: 'default1-1',
            activities: ['Snorkeling', 'Beach BBQ'],
            location: 'Maldives',
            locationDetails: { lat: 3.2028, lng: 73.2207 },
            friendList: ['Alice'],
            timings: { start: '2025-10-15T09:00:00', end: '2025-10-15T16:00:00' },
            notes: 'Bring sunscreen',
          },
        ],
        isPublic: true,
      },
    },
    {
      id: 'default2',
      username: 'CityExplorer',
      avatar: '/female_user_one.png',
      startDate: '2025-11-01',
      endDate: '2025-11-05',
      image: getRandomImage(), // Assign random image
      likes: 7,
      mainPlan: {
        id: 'default2',
        title: 'City Tour',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-05'),
        subPlans: [
          {
            id: 'default2-1',
            activities: ['Museum Visit', 'Night Market'],
            location: 'Bangkok',
            locationDetails: { lat: 13.7563, lng: 100.5018 },
            friendList: ['Bob'],
            timings: { start: '2025-11-01T10:00:00', end: '2025-11-01T18:00:00' },
            notes: 'Wear comfortable shoes',
          },
        ],
        isPublic: true,
      },
    },
    {
      id: 'default3',
      username: 'AdventureSeeker',
      avatar: '/female_user_one.png',
      startDate: '2025-12-10',
      endDate: '2025-12-15',
      image: getRandomImage(), // Assign random image
      likes: 14,
      mainPlan: {
        id: 'default3',
        title: 'Mountain Trek',
        startDate: new Date('2025-12-10'),
        endDate: new Date('2025-12-15'),
        subPlans: [
          {
            id: 'default3-1',
            activities: ['Hiking', 'Camping'],
            location: 'Himalayas',
            locationDetails: { lat: 27.9881, lng: 86.9250 },
            friendList: ['Charlie'],
            timings: { start: '2025-12-10T08:00:00', end: '2025-12-10T17:00:00' },
            notes: 'Pack warm clothes',
          },
        ],
        isPublic: true,
      },
    },
    {
      id: 'default4',
      username: 'FoodieTraveler',
      avatar: '/male_user_one.png',
      startDate: '2026-01-05',
      endDate: '2026-01-10',
      image: getRandomImage(), // Assign random image
      likes: 9,
      mainPlan: {
        id: 'default4',
        title: 'Food Tour',
        startDate: new Date('2026-01-05'),
        endDate: new Date('2026-01-10'),
        subPlans: [
          {
            id: 'default4-1',
            activities: ['Cooking Class', 'Food Market Tour'],
            location: 'Paris',
            locationDetails: { lat: 48.8566, lng: 2.3522 },
            friendList: ['Alice', 'Bob'],
            timings: { start: '2026-01-05T09:00:00', end: '2026-01-05T15:00:00' },
            notes: 'Bring appetite',
          },
        ],
        isPublic: true,
      },
    },
  ];

  // Save default posts to localStorage on component mount
  useEffect(() => {
    defaultPosts.forEach(post => {
      const planKey = `mainPlan_${post.mainPlan.id}`;
      const startDateKey = `mainPlan_${post.mainPlan.id}_startDate`;
      const endDateKey = `mainPlan_${post.mainPlan.id}_endDate`;

      // Only save if not already in localStorage
      if (!localStorage.getItem(planKey)) {
        localStorage.setItem(planKey, JSON.stringify(post.mainPlan));
      }
      if (!localStorage.getItem(startDateKey)) {
        localStorage.setItem(startDateKey, post.mainPlan.startDate.toISOString());
      }
      if (!localStorage.getItem(endDateKey)) {
        localStorage.setItem(endDateKey, post.mainPlan.endDate.toISOString());
      }
    });
  }, []);

  // Filter public plans from userData if provided
  const userPublicPlans = userData?.mainPlanList?.filter(plan => plan.isPublic) || [];

  // Determine avatar based on user gender
  const getUserAvatar = () => {
    if (userData?.gender === 'male') {
      return '/male_user_one.png';
    } else if (userData?.gender === 'female') {
      return '/female_user_one.png';
    } else {
      return '/avatars/default-avatar.png'; // Fallback for unspecified gender
    }
  };

  // Format date to string, handling both Date and string inputs
  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString(); // Convert string to Date and format
    }
    return date.toLocaleDateString(); // Already a Date, format directly
  };

  // Handle post click to store plan in localStorage and navigate
  const handlePostClick = (mainPlan: MainPlan) => {
    const planKey = `mainPlan_${mainPlan.id}`;
    const startDateKey = `mainPlan_${mainPlan.id}_startDate`;
    const endDateKey = `mainPlan_${mainPlan.id}_endDate`;

    // Store plan in localStorage if not already present
    if (!localStorage.getItem(planKey)) {
      localStorage.setItem(planKey, JSON.stringify(mainPlan));
    }
    // Convert startDate to ISO string
    if (!localStorage.getItem(startDateKey)) {
      const startDate = typeof mainPlan.startDate === 'string'
        ? new Date(mainPlan.startDate).toISOString()
        : mainPlan.startDate.toISOString();
      localStorage.setItem(startDateKey, startDate);
    }

    // Convert endDate to ISO string
    if (!localStorage.getItem(endDateKey)) {
      const endDate = typeof mainPlan.endDate === 'string'
        ? new Date(mainPlan.endDate).toISOString()
        : mainPlan.endDate.toISOString();
      localStorage.setItem(endDateKey, endDate);
    }

    // Navigate to plan details page
    router.push(`/plan/${mainPlan.id}`);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Render default posts */}
      {defaultPosts.map(post => (
        <div
          key={post.id}
          onClick={() => handlePostClick(post.mainPlan)}
          className="cursor-pointer"
        >
          <Post
            username={post.username}
            avatar={post.avatar}
            startDate={post.startDate}
            endDate={post.endDate}
            image={post.image}
          />
          <p className="text-sm text-gray-500 mt-1">
            {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
          </p>
        </div>
      ))}

      {/* Render user's public plans if available */}
      {userPublicPlans.map(plan => (
        <div
          key={plan.id}
          onClick={() => handlePostClick(plan)}
          className="cursor-pointer"
        >
          <Post
            username={userData!.name}
            avatar={getUserAvatar()} // Set avatar based on gender
            startDate={formatDate(plan.startDate)} // Format date to string
            endDate={formatDate(plan.endDate)} // Format date to string
            image={getRandomImage()} // Assign random image
          />
          <p className="text-sm text-gray-500 mt-1">
            0 Likes {/* Default to 0 likes for user plans */}
          </p>
        </div>
      ))}
    </div>
  );
}