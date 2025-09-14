import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Remainder {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: Date;
  backgroundColor: string;
  subPlan?: string;
  mainPlanId: string;
}

interface TimeColumnProps {}

interface DayViewProps {
  date: Date;
  remainders: Remainder[];
  onDeleteRemainder: (id: string) => void;
}

interface WeekViewProps {
  currentDate: Date;
  remainders: Remainder[];
}

interface MonthViewProps {
  currentDate: Date;
  remainders: Remainder[];
}

const TimeColumn: React.FC<TimeColumnProps> = () => {
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:00 ${ampm}`;
  });

  return (
    <div className="w-20 flex-none mt-[1rem]">
      {timeSlots.map((time) => (
        <div key={time} className="h-16 text-right pr-4">
          <span className="text-sm font-medium text-black">{time}</span>
        </div>
      ))}
    </div>
  );
};

const DayView: React.FC<DayViewProps> = ({ date, remainders, onDeleteRemainder }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const dayRemainders = remainders.filter(remainder => isSameDay(date, remainder.date));

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return `${totalMinutes * (65/60)}px`;
  };

  const convertTo24Hour = (timeStr: string): number => {
    const [rawTime, period] = timeStr.trim().split(' ');
    let [hours, minutes] = rawTime.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours + (minutes / 60);
  };

  const getRemainderPosition = (timeStr: string): number => {
    const hours24 = convertTo24Hour(timeStr);
    return hours24 * 64;
  };

  const getRemainderHeight = (startTime: string, endTime: string): number => {
    const startHours = convertTo24Hour(startTime);
    const endHours = convertTo24Hour(endTime);
    return Math.max((endHours - startHours) * 64, 32);
  };

  return (
    <div className="flex flex-1 min-h-[960px]">
      <TimeColumn />
      <div className="flex-1 relative">
        {isSameDay(date, new Date()) && (
          <div
            className="absolute left-0 right-0 border-t-2 border-black z-10"
            style={{ top: getCurrentTimePosition() }}
          >
            <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-black" />
          </div>
        )}
        {dayRemainders.map((remainder) => {
          const topPosition = getRemainderPosition(remainder.startTime);
          const height = getRemainderHeight(remainder.startTime, remainder.endTime);
          const isShortRemainder = height <= 40;

          return (
            <div
              key={remainder.id}
              className={`absolute left-4 w-[95%] right-4 p-2 rounded-lg ${remainder.backgroundColor || 'bg-blue-50'} relative`}
              style={{
                top: `${topPosition + 25}px`,
                height: `${height}px`,
                minHeight: '32px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => onDeleteRemainder(remainder.id)}
                className="absolute top-4 right-4 text-black hover:text-red-500 z-20"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex flex-col h-full">
                {isShortRemainder ? (
                  <div className="text-sm text-black truncate">
                    {remainder.title}
                    {remainder.subPlan && (
                      <span className="text-xs text-gray-600 ml-1">
                        (for {remainder.subPlan})
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="font-medium text-black truncate">
                      {remainder.title}
                      {remainder.subPlan && (
                        <span className="text-xs text-gray-600 ml-1">
                          (for {remainder.subPlan})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-black">
                      {remainder.startTime} - {remainder.endTime}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeekView: React.FC<WeekViewProps> = ({ currentDate, remainders }) => {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12.toString().padStart(2, '0')}:00 ${ampm}`;
  });

  const convertTo24Hour = (timeStr: string): number => {
    const [rawTime, period] = timeStr.trim().split(' ');
    let [hours, minutes] = rawTime.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours + (minutes / 60);
  };

  const getRemainderStyles = (remainder: Remainder) => {
    const startHour = convertTo24Hour(remainder.startTime);
    const endHour = convertTo24Hour(remainder.endTime);
    const duration = endHour - startHour;
    const height = Math.max(duration * 64, 32);

    return {
      top: `${startHour * 64}px`,
      height: `${height}px`,
      backgroundColor: remainder.backgroundColor,
    };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b sticky top-0 bg-white z-10">
        <div className="w-20 flex-shrink-0" />
        {days.map((day) => (
          <div key={day.toISOString()} className="flex-1 py-4 px-2">
            <div className="text-sm font-semibold text-black">
              {format(day, 'EEE').toUpperCase()}
            </div>
            <div className="text-2xl font-bold mt-1 text-black">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-y-auto">
        <div className="w-20 flex-shrink-0 border-r bg-white sticky left-0">
          {timeSlots.map((time) => (
            <div key={time} className="h-16 flex items-center justify-end pr-4">
              <span className="text-sm text-black">{time}</span>
            </div>
          ))}
        </div>

        {days.map((day) => (
          <div key={day.toISOString()} className="flex-1 border-r relative min-w-[120px]">
            {timeSlots.map((_, idx) => (
              <div
                key={idx}
                className={`h-16 border-t border-gray-200 ${
                  idx === timeSlots.length - 1 ? 'border-b' : ''
                }`}
              />
            ))}

            {remainders
              .filter(remainder => isSameDay(day, remainder.date))
              .map(remainder => {
                const startHour = convertTo24Hour(remainder.startTime);
                const endHour = convertTo24Hour(remainder.endTime);
                const duration = endHour - startHour;
                const isShortRemainder = duration < 1;

                return (
                  <div
                    key={remainder.id}
                    className={`absolute left-1 right-1 p-2 rounded-lg shadow-sm overflow-hidden ${remainder.backgroundColor}`}
                    style={getRemainderStyles(remainder)}
                  >
                    <div className="text-sm font-medium text-black truncate">{remainder.title}</div>
                    {!isShortRemainder && (
                      <div className="text-xs text-black truncate">
                        {remainder.startTime} - {remainder.endTime}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};

const MonthView: React.FC<MonthViewProps> = ({ currentDate, remainders }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });

  const weeks = [];
  let week = [];
  let day = startDate;

  while (week.length < 7 || day <= monthEnd) {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
    day = addDays(day, 1);
  }
  if (week.length > 0) weeks.push(week);

  const processedRemainderIds = new Set<string>();

  return (
    <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200">
      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
        <div key={day} className="bg-white p-2 text-sm font-medium text-center text-black">
          {day}
        </div>
      ))}
      {weeks.flat().map((day, idx) => {
        processedRemainderIds.clear();

        const dayRemainders = remainders.filter(remainder => {
          if (isSameDay(day, remainder.date) && !processedRemainderIds.has(remainder.id)) {
            processedRemainderIds.add(remainder.id);
            return true;
          }
          return false;
        });

        return (
          <div
            key={idx}
            className={`bg-white min-h-[100px] p-2 ${
              !isSameMonth(day, currentDate) ? 'text-black opacity-50' : 'text-black'
            }`}
          >
            <div className="font-medium text-sm text-black">{format(day, 'd')}</div>
            <div className="space-y-1 mt-1">
              {dayRemainders
                .reduce((unique: Remainder[], remainder) => {
                  const hasTimeSlot = unique.some(
                    existingRemainder => 
                      existingRemainder.startTime === remainder.startTime &&
                      existingRemainder.endTime === remainder.endTime
                  );
                  if (!hasTimeSlot) unique.push(remainder);
                  return unique;
                }, [])
                .map(remainder => (
                  <div
                    key={remainder.id}
                    className={`${remainder.backgroundColor || 'bg-blue-50'} p-1 rounded text-xs truncate text-black`}
                  >
                    {remainder.startTime} {remainder.title}
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface CalendarProps {
  mainPlanId: string;
}

const Calendar: React.FC<CalendarProps> = ({ mainPlanId }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [isRemainderDialogOpen, setIsRemainderDialogOpen] = useState<boolean>(false);
  const [remainders, setRemainders] = useState<Remainder[]>([]);
  const [newRemainder, setNewRemainder] = useState({
    title: '',
    date: currentDate,
    startTime: '12:00 PM',
    endTime: '1:00 PM',
    backgroundColor: 'bg-blue-50',
    subPlan: '',
    mainPlanId: mainPlanId,
  });

  // Load remainders from localStorage on mount
  useEffect(() => {
    const storedRemainders = localStorage.getItem(`remainders_${mainPlanId}`);
    if (storedRemainders) {
      const parsedRemainders = JSON.parse(storedRemainders).map((remainder: any) => ({
        ...remainder,
        date: new Date(remainder.date),
      }));
      setRemainders(parsedRemainders);
    } else {
      setRemainders([]);
    }
  }, [mainPlanId]);

  const handleSaveRemainder = () => {
    if (!newRemainder.title) {
      toast.error('Please enter a title for the remainder');
      return;
    }

    // Convert times into Date objects for comparison
    const startDateTime = new Date(newRemainder.date);
    const [startHour, startMinute] = newRemainder.startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute);

    const now = new Date();
    if (startDateTime < now) {
      toast.error('You cannot set a remainder in the past');
      return;
    }

    const remainder: Remainder = {
      id: Math.random().toString(36).substr(2, 9),
      title: newRemainder.title,
      date: newRemainder.date,
      startTime: newRemainder.startTime,
      endTime: newRemainder.endTime,
      backgroundColor: newRemainder.backgroundColor,
      subPlan: newRemainder.subPlan || undefined,
      mainPlanId: mainPlanId,
    };

    const updatedRemainders = [...remainders, remainder];
    setRemainders(updatedRemainders);
    localStorage.setItem(`remainders_${mainPlanId}`, JSON.stringify(updatedRemainders));

    setNewRemainder({ 
      title: '', 
      date: currentDate, 
      startTime: '12:00 PM', 
      endTime: '1:00 PM', 
      backgroundColor: 'bg-blue-50', 
      subPlan: '',
      mainPlanId: mainPlanId 
    });
    setIsRemainderDialogOpen(false);
    toast.success('Remainder added successfully');
  };

  const handleDeleteRemainder = (id: string) => {
    const updatedRemainders = remainders.filter(remainder => remainder.id !== id);
    setRemainders(updatedRemainders);
    localStorage.setItem(`remainders_${mainPlanId}`, JSON.stringify(updatedRemainders));
    toast.success('Remainder deleted');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'Day') {
      setCurrentDate(prev => direction === 'prev' ? addDays(prev, -1) : addDays(prev, 1));
    } else if (view === 'Week') {
      setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    }
  };

  const getHeaderText = () => {
    if (view === 'Day') return format(currentDate, 'dd MMMM yyyy');
    if (view === 'Week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = addDays(start, 6);
      return `${format(start, 'dd')}-${format(end, 'dd MMMM yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  };

  return (
    <div className="h-screen flex flex-col w-full mx-auto -mt-[2rem]">
      <Toaster position="top-right" />
      <div className="flex-none">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">
            {getHeaderText()}
          </h1>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-white rounded-lg border shadow-sm hover:bg-gray-50 flex items-center gap-2"
              onClick={() => setIsRemainderDialogOpen(true)}
            >
              <Plus size={20} className='text-black'/>
              <span className="font-medium text-black">Add Remainder</span>
            </button>
          </div>
        </div>

        {/* Remainder Dialog Modal */}
        {isRemainderDialogOpen && (
          <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-black">Add Remainder</h3>
                <button
                  onClick={() => setIsRemainderDialogOpen(false)}
                  className="text-black hover:text-gray-700"
                >
                  <X className="w-6 h-6 text-black" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-black mb-1">Name</label>
                  <input
                    type="text"
                    value={newRemainder.title}
                    onChange={(e) => setNewRemainder({ ...newRemainder, title: e.target.value })}
                    className="w-full border rounded-lg p-2 text-black"
                    placeholder="Remainder name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">Sub Plan (optional)</label>
                  <input
                    type="text"
                    value={newRemainder.subPlan}
                    onChange={(e) => setNewRemainder({ ...newRemainder, subPlan: e.target.value })}
                    className="w-full border rounded-lg p-2 text-black"
                    placeholder="Enter sub plan or leave empty"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">Date</label>
                  <input
                    type="date"
                    value={format(newRemainder.date, 'yyyy-MM-dd')}
                    onChange={(e) => setNewRemainder({ ...newRemainder, date: new Date(e.target.value) })}
                    className="w-full border rounded-lg p-2 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newRemainder.startTime}
                    onChange={(e) => setNewRemainder({ ...newRemainder, startTime: e.target.value })}
                    className="w-full border rounded-lg p-2 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">End Time</label>
                  <input
                    type="time"
                    value={newRemainder.endTime}
                    onChange={(e) => setNewRemainder({ ...newRemainder, endTime: e.target.value })}
                    className="w-full border rounded-lg p-2 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">Color</label>
                  <select
                    value={newRemainder.backgroundColor}
                    onChange={(e) => setNewRemainder({ ...newRemainder, backgroundColor: e.target.value })}
                    className="w-full border rounded-lg p-2 text-black"
                  >
                    <option value="bg-blue-50">Blue</option>
                    <option value="bg-green-50">Green</option>
                    <option value="bg-red-50">Red</option>
                    <option value="bg-yellow-50">Yellow</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveRemainder}
                  className="w-full bg-[#4dd25282] text-black py-2 rounded-lg hover:bg-[#4dd252] transition"
                >
                  Save Remainder
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-8">
          <div className="flex rounded-lg overflow-hidden bg-gray-100">
            {['Day', 'Week', 'Month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as typeof view)}
                className={`px-4 py-2 font-medium ${
                  view === v ? 'bg-white shadow-sm text-black' : 'text-black hover:bg-gray-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={20} className="text-black" />
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={20} className="text-black" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          {view === 'Day' && <DayView date={currentDate} remainders={remainders} onDeleteRemainder={handleDeleteRemainder} />}
          {view === 'Week' && <WeekView currentDate={currentDate} remainders={remainders} />}
          {view === 'Month' && <MonthView currentDate={currentDate} remainders={remainders} />}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
