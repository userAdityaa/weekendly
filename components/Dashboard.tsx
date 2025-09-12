'use client';
import { JSX, useState } from 'react';
import { Plus, Clock, MapPin, Film, Coffee, Mountain, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import Image from 'next/image';
import PlanWizard from './PlanWizard';
import { DragEndEvent } from '@dnd-kit/core';

interface Plan {
  id: string;
  title: string;
  location: string;
  time: string;
  note?: string;
  icon: string;
  emoji: string;
}

interface PlanFormData {
  title: string;
  time: string;
  note: string;
  friends: { name: string; gender: 'male' | 'female' }[];
  location: string;
}

interface Mood {
  id: string;
  name: string;
  color: string;
}

export default function Dashboard({ layout }: { layout: 'horizontal' | 'vertical' }) {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: '1',
      title: 'Morning Hike',
      location: 'Blue Ridge Trail',
      time: '9:00 AM – 12:00 PM',
      note: 'Bring water and snacks',
      icon: 'hike',
      emoji: '🌄',
    },
    {
      id: '2',
      title: 'Brunch with Friends',
      location: 'Sunny Side Café',
      time: '12:30 PM – 2:00 PM',
      note: 'Try their avocado toast',
      icon: 'brunch',
      emoji: '🥐',
    },
    {
      id: '3',
      title: 'Evening Movie',
      location: 'Downtown Cinema',
      time: '7:00 PM – 9:30 PM',
      note: 'Book tickets in advance',
      icon: 'movie',
      emoji: '🎬',
    },
    {
      id: '4',
      title: 'Evening Walk',
      location: 'City Park',
      time: '6:00 PM – 7:00 PM',
      note: 'Enjoy the sunset',
      icon: 'hike',
      emoji: '🌄',
    },
    {
      id: '5',
      title: 'Coffee Meetup',
      location: 'Bean House',
      time: '3:00 PM – 4:00 PM',
      note: 'Try the latte',
      icon: 'brunch',
      emoji: '🥐',
    },
    {
      id: '6',
      title: 'Movie Night',
      location: 'Home Theater',
      time: '8:00 PM – 10:30 PM',
      note: 'Popcorn ready',
      icon: 'movie',
      emoji: '🎬',
    },
  ]);

  const [moods, setMoods] = useState<Mood[]>([
    { id: '1', name: 'Calm', color: 'rgba(173, 216, 230, 0.3)' },
    { id: '2', name: 'Productive', color: 'rgba(144, 238, 144, 0.3)' },
  ]);

  const [isAddingMood, setIsAddingMood] = useState(false);
  const [newMoodName, setNewMoodName] = useState('');
  const [showPlanWizard, setShowPlanWizard] = useState(false);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(2);
  const [showHooray, setShowHooray] = useState(false);

  const iconMap: Record<string, JSX.Element> = {
    hike: <Mountain className="w-5 h-5" />,
    brunch: <Coffee className="w-5 h-5" />,
    movie: <Film className="w-5 h-5" />,
    default: <Clock className="w-5 h-5" />,
  };

  const userName =
    typeof window !== 'undefined'
      ? localStorage.getItem('userName') || 'Aditya'
      : 'Aditya';

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPlans((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const addPlan = () => {
    setShowPlanWizard(true);
  };

  const formatTime = (time: string): string => {
    if (!time) return 'TBD';
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const endHours = (hours + 2) % 24;
      const endPeriod = endHours >= 12 ? 'PM' : 'AM';
      const formattedEndHours = endHours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period} – ${formattedEndHours}:${minutes.toString().padStart(2, '0')} ${endPeriod}`;
    } catch (error) {
      return 'TBD';
    }
  };

  const onComplete = (formData: PlanFormData) => {
    const newId = crypto.randomUUID();
    const activityIcons: Record<string, string> = {
      Movie: 'movie',
      Hiking: 'hike',
      Brunch: 'brunch',
      'Road Trip': 'default',
      Coffee: 'brunch',
      Crafting: 'default',
      Sports: 'default',
    };
    const icon = activityIcons[formData.title] || 'default';
    const emojiOptions = ['🌄', '🥐', '🎬'];
    const randomEmoji = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
    const friendsNote = formData.friends.length
      ? `Invited: ${formData.friends.map((f) => f.name).join(', ')}. `
      : '';
    const finalNote = friendsNote + (formData.note || '');
    const newPlan: Plan = {
      id: newId,
      title: formData.title,
      location: formData.location || 'TBD',
      time: formatTime(formData.time),
      note: finalNote.trim() || undefined,
      icon,
      emoji: randomEmoji,
    };
    setPlans((prevPlans) => [...prevPlans, newPlan]);
    setShowPlanWizard(false);
  };

  const addMood = () => {
    if (newMoodName.trim()) {
      const newMood: Mood = {
        id: crypto.randomUUID(),
        name: newMoodName.trim(),
        color: 'rgba(173, 216, 230, 0.3)', // fixed light blue
      };
      setMoods([...moods, newMood]);
      setNewMoodName('');
      setIsAddingMood(false);
    }
  };

  const removeMood = (id: string) => {
    setMoods(moods.filter((mood) => mood.id !== id));
  };

  const handleCardClick = (planId: string) => {
    if (flippedCards.includes(planId) || matchedPairs.includes(planId)) return;

    const newFlipped = [...flippedCards, planId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      const firstPlan = plans.find((p) => p.id === firstId);
      const secondPlan = plans.find((p) => p.id === secondId);

      if (firstPlan?.emoji === secondPlan?.emoji) {
        setMatchedPairs([...matchedPairs, firstId, secondId]);
        setShowHooray(true);
        setTimeout(() => {
          setShowHooray(false);
          setMatchedPairs((prev) => prev.filter((id) => id !== firstId && id !== secondId));
        }, 2000);
      }

      const newAttempts = attempts - 1;
      setAttempts(newAttempts);

      setTimeout(() => {
        setFlippedCards([]);
        if (newAttempts === 0) {
          setAttempts(2);
          setMatchedPairs([]);
        }
      }, 1000);
    }
  };

  return (
    <div className="relative p-6 rounded-xl min-h-screen text-black -top-10">
      {/* Header Section */}
      <div className="mb-6 space-y-4 -ml-[1.4rem]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2 max-md:mt-4">
            {moods.map((mood) => (
              <div
                key={mood.id}
                className="flex items-center gap-2 px-3 py-1 rounded text-black"
                style={{ backgroundColor: mood.color }}
              >
                {mood.name}
                <button
                  onClick={() => removeMood(mood.id)}
                  className="text-black hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {isAddingMood ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMoodName}
                  onChange={(e) => setNewMoodName(e.target.value)}
                  placeholder="Mood name"
                  className="px-2 py-1 border rounded text-black"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addMood();
                    if (e.key === 'Escape') setIsAddingMood(false);
                  }}
                />
                <button
                  onClick={addMood}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingMood(false)}
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingMood(true)}
                className="flex items-center gap-1 bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300"
              >
                <Plus size={16} /> Add Mood
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="font-medium">{plans.length} plans</p>
          <button
            onClick={addPlan}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            <Plus size={18} /> Add New
          </button>
        </div>
      </div>

      {showPlanWizard && <PlanWizard onComplete={onComplete} />}

      {/* Game Info for Vertical Layout */}
      {layout === 'vertical' && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600">
            Attempts left: {attempts} | Click two cards to match emojis!
          </p>
          {showHooray && (
            <p className="text-lg font-bold text-green-500 animate-pulse">Hooray!</p>
          )}
        </div>
      )}

      {/* Plans Section */}
      {plans.length === 0 ? (
        <p className="text-gray-400 text-center">
          You don&apos;t have any plans yet. Click the plus button to add one!
        </p>
      ) : layout === 'horizontal' ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={plans.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="relative space-y-3">
              {plans.map((plan) => (
                <SortableItem key={plan.id} id={plan.id}>
                  <div className="flex items-center gap-3 bg-green-100 rounded-xl p-4 shadow-sm">
                    {/* Left Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 text-white -mt-[2.2rem]">
                      {iconMap[plan.icon] || iconMap['default']}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-md font-semibold text-gray-900">{plan.title}</h3>
                      <p className="text-sm text-gray-800">{plan.time}</p>
                      <p className="text-sm text-gray-800">{plan.location}</p>
                      {plan.note && (
                        <p className="text-xs text-gray-700 mt-1">{plan.note}</p>
                      )}
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg shadow-md p-4 border border-gray-200/50 backdrop-blur-md flex flex-col cursor-pointer w-full max-w-xs mx-auto"
              style={{
                backgroundColor: 'rgba(173, 216, 230, 0.3)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
              onClick={() => handleCardClick(plan.id)}
            >
              {flippedCards.includes(plan.id) || matchedPairs.includes(plan.id) ? (
                <div className="flex justify-center items-center h-40 text-4xl mb-4">
                  {plan.emoji}
                </div>
              ) : (
                <Image
                  src="/plan.jpg"
                  alt="planning placeholder"
                  width={200}
                  height={150}
                  className="rounded-md object-cover mb-4"
                />
              )}
              <h3 className="text-md font-semibold">{plan.title}</h3>
              <p className="text-sm text-gray-700 flex items-center mt-1">
                <Clock className="w-4 h-4 mr-1" /> {plan.time}
              </p>
              <p className="text-sm text-gray-700 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" /> {plan.location}
              </p>
              {plan.note && <p className="text-sm text-gray-600 italic mt-2">{plan.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
