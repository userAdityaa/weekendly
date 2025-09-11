'use client'
import { JSX, useState } from 'react';
import { Plus, Clock, MapPin, Film, Coffee, Mountain } from 'lucide-react';
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

interface Plan {
  id: string;
  title: string;
  location: string;
  time: string;
  note?: string;
  icon: string;
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
    },
    {
      id: '2',
      title: 'Brunch with Friends',
      location: 'Sunny Side Café',
      time: '12:30 PM – 2:00 PM',
      note: 'Try their avocado toast',
      icon: 'brunch',
    },
    {
      id: '3',
      title: 'Evening Movie',
      location: 'Downtown Cinema',
      time: '7:00 PM – 9:30 PM',
      note: 'Book tickets in advance',
      icon: 'movie',
    },
  ]);

  const iconMap: Record<string, JSX.Element> = {
    hike: <Mountain className="w-4 h-4 text-green-500" />,
    brunch: <Coffee className="w-4 h-4 text-yellow-500" />,
    movie: <Film className="w-4 h-4 text-purple-500" />,
    default: <Clock className="w-4 h-4 text-blue-500" />,
  };

  const [showPlanWizard, setShowPlanWizard] = useState(false);

  const userName =
    typeof window !== 'undefined'
      ? localStorage.getItem('userName') || 'Aditya'
      : 'Aditya';

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
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

  // Function to generate random pastel color
  const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 20) + 30;
    const lightness = Math.floor(Math.random() * 20) + 70;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const onComplete = () => { 
    setShowPlanWizard(false);
  }

  return (
    <div className="relative p-6 rounded-xl min-h-screen text-black -top-10">
      {/* Header Section */}
      <div className="mb-6 space-y-4 -ml-[1.4rem]">
        {/* Dates + Mood */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-8 text-sm">
            <p><span className="font-medium">Start:</span> Sep 11 2025</p>
            <p><span className="font-medium">Due:</span> Oct 11 2025</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="bg-yellow-300 text-black px-3 py-1 rounded">Research</button>
            <button className="bg-green-300 text-black px-3 py-1 rounded">Design</button>
            <button className="bg-blue-300 text-black px-3 py-1 rounded">Development</button>
            <button className="bg-gray-400 text-black px-3 py-1 rounded">Other</button>
          </div>
        </div>

        {/* Total Plans + Add Button */}
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

      {showPlanWizard && <PlanWizard onComplete={onComplete}/>}

      {/* Plans Section */}
      {plans.length === 0 ? (
        <p className="text-gray-400 text-center">
          You don’t have any plans yet. Click the plus button to add one!
        </p>
      ) : layout === 'horizontal' ? (
        // Horizontal Layout with Timeline
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={plans.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="relative border-l-2 border-gray-300 pl-8">
              {plans.map((plan) => (
                <SortableItem key={plan.id} id={plan.id}>
                  <div className="relative mb-2">
                    <span className="absolute -left-12 top-4 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow border border-gray-300">
                      {iconMap[plan.icon] || iconMap['default']}
                    </span>
                    <div
                      className="rounded-lg shadow-md p-4 flex gap-4 items-start border border-gray-200"
                      style={{ backgroundColor: getRandomPastelColor() }}
                    >
                      <Image
                        src="/plan.jpg"
                        alt="planning placeholder"
                        width={140}
                        height={120}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{plan.title}</h3>
                        <p className="text-sm text-gray-700 flex items-center mt-1">
                          <Clock className="w-4 h-4 mr-1" /> {plan.time}
                        </p>
                        <p className="text-sm text-gray-700 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" /> {plan.location}
                        </p>
                        {plan.note && <p className="text-sm text-gray-600 italic mt-2">{plan.note}</p>}
                      </div>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        // Vertical Layout (cards stacked)
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg shadow-md p-4 border border-gray-200 flex flex-col"
              style={{ backgroundColor: getRandomPastelColor() }}
            >
              <Image
                src="/plan.jpg"
                alt="planning placeholder"
                width={300}
                height={200}
                className="rounded-md object-cover mb-4"
              />
              <h3 className="text-lg font-semibold">{plan.title}</h3>
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
