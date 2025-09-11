'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlanFormData {
  title: string;
  time: string;
  note: string;
  friends: { name: string; gender: 'male' | 'female' }[];
}

interface Friend {
  name: string;
  gender: 'male' | 'female';
}

export default function PlanWizard({ onComplete }: { onComplete: (plan: PlanFormData) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PlanFormData>({
    title: '',
    time: '',
    note: '',
    friends: [],
  });
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendGender, setNewFriendGender] = useState<'male' | 'female'>('male');

  const userFriendList: Friend[] = []; // Simulated empty friend list

  const trendingActivities = [
    { name: '🎬 Movie Night', value: 'Movie' },
    { name: '🥾 Hiking', value: 'Hiking' },
    { name: '🍳 Brunch', value: 'Brunch' },
    { name: '🚗 Road Trip', value: 'Road Trip' },
    { name: '☕ Coffee Meetup', value: 'Coffee' },
    { name: '🎨 Crafting', value: 'Crafting' },
    { name: '⚽ Sports', value: 'Sports' },
  ];

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const slideVariants = {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: '-100%', opacity: 0, transition: { duration: 0.5 } },
  };

  const handleAddFriend = () => {
    if (newFriendName.trim()) {
      setFormData({
        ...formData,
        friends: [...formData.friends, { name: newFriendName, gender: newFriendGender }],
      });
      setNewFriendName('');
      setNewFriendGender('male');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {/* STEP 1 - ACTIVITY */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center h-full p-6 text-center"
          >
            <h2 className="text-2xl font-bold mb-6">What activity do you want to do?</h2>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {trendingActivities.map((act) => (
                <button
                  key={act.value}
                  onClick={() => setFormData({ ...formData, title: act.value })}
                  className={`p-6 rounded-2xl border shadow hover:shadow-lg transition ${
                    formData.title === act.value ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  {act.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or type another activity..."
              value={
                trendingActivities.find((t) => t.value === formData.title) ? '' : formData.title
              }
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full max-w-md mt-6 border rounded-lg px-4 py-3"
            />
            <button
              onClick={next}
              disabled={!formData.title}
              className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* STEP 2 - TIME (iPhone-style) */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center h-full p-6 text-center"
          >
            <h2 className="text-2xl font-bold mb-6">Set a time</h2>
            <div className="w-full max-w-md bg-gray-50 p-6 rounded-3xl shadow-xl flex flex-col items-center">
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="appearance-none text-4xl text-center font-semibold w-40 bg-gray-100 rounded-xl py-2 px-4 mb-4 shadow-inner"
              />
              <span className="text-gray-500 mb-4">Pick the best time for your plan</span>
              <button
                onClick={() => {
                  setFormData({ ...formData, time: '' });
                  next();
                }}
                className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Skip
              </button>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={prev} className="px-6 py-3 border rounded-lg">
                Back
              </button>
              <button
                onClick={next}
                disabled={!formData.time}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 - FRIENDS (scrollable & visually attractive) */}
        {step === 3 && (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center h-full p-6 text-center"
          >
            <h2 className="text-2xl font-bold mb-6">Invite friends</h2>
            {userFriendList.length > 0 && (
              <div className="w-full max-w-md mb-6">
                <h3 className="text-lg font-semibold mb-2">Your Friends</h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-xl">
                  {userFriendList.map((friend, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-xl bg-gray-100 shadow-sm"
                    >
                      <img
                        src={friend.gender === 'male' ? '/male_user_one.png' : '/female_user_one.png'}
                        alt={friend.gender}
                        className="w-8 h-8"
                      />
                      <span>{friend.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="w-full max-w-md mb-6">
              <h3 className="text-lg font-semibold mb-2">Add a new friend</h3>
              <div className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  placeholder="Friend's name"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  className="flex-1 border rounded-lg px-4 py-3"
                />
                <button
                  onClick={() => setNewFriendGender('male')}
                  className={`p-2 rounded-full transition ${
                    newFriendGender === 'male' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <img src="/male_user_one.png" alt="Male" className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setNewFriendGender('female')}
                  className={`p-2 rounded-full transition ${
                    newFriendGender === 'female' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <img src="/female_user_one.png" alt="Female" className="w-6 h-6" />
                </button>
              </div>
              <button
                onClick={handleAddFriend}
                disabled={!newFriendName.trim()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 transition"
              >
                Add Friend
              </button>
            </div>
            {formData.friends.length > 0 && (
              <div className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Added Friends</h3>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border rounded-xl">
                  {formData.friends.map((friend, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-xl bg-gray-100 shadow-sm"
                    >
                      <img
                        src={friend.gender === 'male' ? '/male_user_one.png' : '/female_user_one.png'}
                        alt={friend.gender}
                        className="w-8 h-8"
                      />
                      <span>{friend.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <button onClick={prev} className="px-6 py-3 border rounded-lg">
                Back
              </button>
              <button
                onClick={next}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4 - NOTES */}
        {step === 4 && (
          <motion.div
            key="step4"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center h-full p-6 text-center"
          >
            <h2 className="text-2xl font-bold mb-6">Any notes?</h2>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Write your note here..."
              className="w-full max-w-md border rounded-lg px-4 py-3 h-32 resize-none shadow-inner"
            />
            <div className="flex gap-4 mt-8">
              <button onClick={prev} className="px-6 py-3 border rounded-lg">
                Back
              </button>
              <button
                onClick={() => onComplete(formData)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Finish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
