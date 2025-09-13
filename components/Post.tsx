'use client';
import Image from 'next/image';
import { useState } from 'react';

interface PostProps {
  username: string;
  avatar: string;
  startDate: string;
  endDate: string;
  image: string;
}

export default function Post({ username, avatar, startDate, endDate, image }: PostProps) {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center mb-2">
        <Image
          src={avatar}
          alt={`${username}'s avatar`}
          width={40}
          height={40}
          className="rounded-full mr-3 object-cover"
        />
        <p className="text-sm font-semibold text-gray-800">{username}</p>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        {username} has created a new plan for {startDate} - {endDate}
      </p>
      <Image
        src={image}
        alt="Plan image"
        width={300}
        height={200}
        className="rounded-lg w-full h-48 object-cover mb-3"
      />
      <button
        onClick={handleLike}
        className={`flex items-center text-sm ${
          liked ? 'text-red-500' : 'text-gray-500'
        } hover:text-red-600 transition-colors duration-200`}
      >
        <svg
          className={`w-5 h-5 mr-1 ${liked ? 'fill-current' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        Like
      </button>
    </div>
  );
}