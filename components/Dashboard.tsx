'use client';
import { JSX, useState, useEffect } from 'react';
import { Plus, Clock, MapPin, Film, Coffee, Mountain, X, Trash2 } from 'lucide-react';
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
import { UserData, MainPlan, SubPlan } from '../types/user';

interface Plan {
  id: string;
  title: string;
  location: string;
  time: string | null;
  note?: string;
  icon: string;
  emoji: string;
}

interface Mood {
  id: string;
  name: string;
  color: string;
}

interface DashboardProps {
  layout: 'horizontal' | 'vertical';
  mainPlanId: string;
}

export default function Dashboard({ layout, mainPlanId }: DashboardProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
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
  const [error, setError] = useState<string>('');

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  // Function to randomly select an image source
  const generateSrc = () => {
    const images = ['/one.jpg', '/two.jpg', '/three.jpg', '/four.jpg', '/five.jpg'];
    return images[Math.floor(Math.random() * images.length)];
  };

  // Load plans from localStorage on mount
  useEffect(() => {
    try {
      const storedMainPlan = localStorage.getItem(`mainPlan_${mainPlanId}`);
      if (storedMainPlan) {
        const mainPlan: MainPlan = JSON.parse(storedMainPlan);
        const subPlans = mainPlan.subPlans || [];
        const convertedPlans: Plan[] = subPlans.map((subPlan) => ({
          id: subPlan.id,
          title: subPlan.activities[0] || 'Untitled',
          location: subPlan.location || 'TBD',
          time: subPlan.timings
            ? `${new Date(subPlan.timings.start).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })} – ${new Date(subPlan.timings.end).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}`
            : null,
          note: subPlan.notes || undefined,
          icon: subPlan.activities[0]?.toLowerCase().includes('hike')
            ? 'hike'
            : subPlan.activities[0]?.toLowerCase().includes('brunch') ||
              subPlan.activities[0]?.toLowerCase().includes('coffee')
            ? 'brunch'
            : subPlan.activities[0]?.toLowerCase().includes('movie')
            ? 'movie'
            : 'default',
          emoji: ['🌄', '🥐', '🎬'][Math.floor(Math.random() * 3)],
        }));
        setPlans(convertedPlans);
      } else {
        setError('Main plan not found in storage.');
      }
    } catch (e) {
      console.error('Error loading main plan from localStorage:', e);
      setError('Failed to load plans. Please try again.');
    }
  }, [mainPlanId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPlans((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newPlans = arrayMove(items, oldIndex, newIndex);

      try {
        const storedMainPlan = localStorage.getItem(`mainPlan_${mainPlanId}`);
        if (storedMainPlan) {
          const mainPlan: MainPlan = JSON.parse(storedMainPlan);
          const newSubPlans = arrayMove(mainPlan.subPlans || [], oldIndex, newIndex);
          const updatedMainPlan: MainPlan = { ...mainPlan, subPlans: newSubPlans };
          localStorage.setItem(`mainPlan_${mainPlanId}`, JSON.stringify(updatedMainPlan));

          const storedUserData = localStorage.getItem('userData');
          if (storedUserData) {
            const userData: UserData = JSON.parse(storedUserData);
            let updatedMainPlanList = userData.mainPlanList || [];
            const existingIndex = updatedMainPlanList.findIndex((plan) => plan.id === mainPlanId);
            if (existingIndex !== -1) {
              updatedMainPlanList[existingIndex] = updatedMainPlan;
            } else {
              updatedMainPlanList.push(updatedMainPlan);
            }
            localStorage.setItem(
              'userData',
              JSON.stringify({ ...userData, mainPlanList: updatedMainPlanList })
            );
          }
        }
      } catch (e) {
        console.error('Error updating subPlans order in localStorage:', e);
        setError('Failed to update plan order.');
      }

      return newPlans;
    });
  };

  const deletePlan = (planId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setPlans((prevPlans) => {
      const newPlans = prevPlans.filter((plan) => plan.id !== planId);

      try {
        const storedMainPlan = localStorage.getItem(`mainPlan_${mainPlanId}`);
        if (storedMainPlan) {
          const mainPlan: MainPlan = JSON.parse(storedMainPlan);
          const newSubPlans = (mainPlan.subPlans || []).filter((subPlan) => subPlan.id !== planId);
          const updatedMainPlan: MainPlan = { ...mainPlan, subPlans: newSubPlans };
          localStorage.setItem(`mainPlan_${mainPlanId}`, JSON.stringify(updatedMainPlan));

          const storedUserData = localStorage.getItem('userData');
          if (storedUserData) {
            const userData: UserData = JSON.parse(storedUserData);
            let updatedMainPlanList = userData.mainPlanList || [];
            const existingIndex = updatedMainPlanList.findIndex((plan) => plan.id === mainPlanId);
            if (existingIndex !== -1) {
              updatedMainPlanList[existingIndex] = updatedMainPlan;
            } else {
              updatedMainPlanList.push(updatedMainPlan);
            }
            localStorage.setItem(
              'userData',
              JSON.stringify({ ...userData, mainPlanList: updatedMainPlanList })
            );
          }
        }
      } catch (e) {
        console.error('Error deleting subPlan from localStorage:', e);
        setError('Failed to delete plan.');
      }

      return newPlans;
    });

    setFlippedCards((prev) => prev.filter((id) => id !== planId));
    setMatchedPairs((prev) => prev.filter((id) => id !== planId));
  };

  const addPlan = () => {
    setShowPlanWizard(true);
  };

  const onComplete = (newPlan: Plan) => {
    setPlans((prevPlans) => [...prevPlans, newPlan]);
    setShowPlanWizard(false);
  };

  const addMood = () => {
    if (newMoodName.trim()) {
      const newMood: Mood = {
        id: crypto.randomUUID(),
        name: newMoodName.trim(),
        color: 'rgba(173, 216, 230, 0.3)',
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
      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}
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

      {showPlanWizard && <PlanWizard onComplete={onComplete} mainPlanId={mainPlanId} />}

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
                  <div className="relative flex items-center gap-3 bg-green-100 rounded-xl p-4 shadow-sm">
                    <div data-no-dnd="true">
                      <button
                        onClick={(e) => deletePlan(plan.id, e)}
                        className="absolute top-3 right-4 text-red-500 hover:text-red-700 z-10"
                        title="Delete plan"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 text-white -mt-[2.2rem]">
                      {iconMap[plan.icon] || iconMap['default']}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-semibold text-gray-900">{plan.title}</h3>
                      <p className="text-sm text-gray-800">{plan.time || 'TBD'}</p>
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
              className="relative rounded-lg p-4 border border-zinc-300 bg-[#8ce88ca9] backdrop-blur-md flex flex-col cursor-pointer w-full max-w-xs mx-auto"
              onClick={() => handleCardClick(plan.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePlan(plan.id, e);
                }}
                className="absolute bottom-4 right-4 text-red-500 hover:text-red-700 z-10"
                title="Delete plan"
              >
                <Trash2 size={18} />
              </button>
              {flippedCards.includes(plan.id) || matchedPairs.includes(plan.id) ? (
                <div className="flex justify-center items-center h-40 text-4xl mb-4">
                  {plan.emoji}
                </div>
              ) : (
                <Image
                  src={generateSrc()}
                  alt="planning placeholder"
                  width={300}
                  height={150}
                  className="rounded-md object-cover mb-4"
                />
              )}
              <h3 className="text-md font-semibold">{plan.title}</h3>
              <p className="text-sm text-gray-700 flex items-center mt-1">
                <Clock className="w-4 h-4 mr-1" /> {plan.time || 'TBD'}
              </p>
              <p className="text-sm text-gray-700 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" /> {plan.location}
              </p>
              <p className="text-sm text-gray-600 italic mt-2">{plan.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}