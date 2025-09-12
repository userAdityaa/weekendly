import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addWeeks, subWeeks, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: Date;
  backgroundColor: string;
}

interface TimeColumnProps {}

interface DayViewProps {
  date: Date;
  events: Event[];
}

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
}

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
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

const DayView: React.FC<DayViewProps> = ({ date, events }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const dayEvents = events.filter(event => isSameDay(date, event.date));

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

  const getEventPosition = (timeStr: string): number => {
    const hours24 = convertTo24Hour(timeStr);
    return hours24 * 64;
  };

  const getEventHeight = (startTime: string, endTime: string): number => {
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
        {dayEvents.map((event) => {
          const topPosition = getEventPosition(event.startTime);
          const height = getEventHeight(event.startTime, event.endTime);
          const isShortEvent = height <= 40;

          return (
            <div
              key={event.id}
              className={`absolute left-4 right-4 p-2 rounded-lg ${event.backgroundColor || 'bg-blue-50'}`}
              style={{
                top: `${topPosition + 25}px`,
                height: `${height}px`,
                minHeight: '32px',
                overflow: 'hidden'
              }}
            >
              <div className="flex flex-col h-full">
                {isShortEvent ? (
                  <div className="text-sm text-black truncate">
                    {event.title}
                  </div>
                ) : (
                  <>
                    <div className="font-medium text-black truncate">
                      {event.title}
                    </div>
                    <div className="text-sm text-black">
                      {event.startTime} - {event.endTime}
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

const WeekView: React.FC<WeekViewProps> = ({ currentDate, events }) => {
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

  const getEventStyles = (event: Event) => {
    const startHour = convertTo24Hour(event.startTime);
    const endHour = convertTo24Hour(event.endTime);
    const duration = endHour - startHour;
    const height = Math.max(duration * 64, 32);

    return {
      top: `${startHour * 64}px`,
      height: `${height}px`,
      backgroundColor: event.backgroundColor,
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

            {events
              .filter(event => isSameDay(day, event.date))
              .map(event => {
                const startHour = convertTo24Hour(event.startTime);
                const endHour = convertTo24Hour(event.endTime);
                const duration = endHour - startHour;
                const isShortEvent = duration < 1;

                return (
                  <div
                    key={event.id}
                    className={`absolute left-1 right-1 p-2 rounded-lg shadow-sm overflow-hidden ${event.backgroundColor}`}
                    style={getEventStyles(event)}
                  >
                    <div className="text-sm font-medium text-black truncate">{event.title}</div>
                    {!isShortEvent && (
                      <div className="text-xs text-black truncate">
                        {event.startTime} - {event.endTime}
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

const MonthView: React.FC<MonthViewProps> = ({ currentDate, events }) => {
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

  const processedEventIds = new Set<string>();

  return (
    <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200">
      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
        <div key={day} className="bg-white p-2 text-sm font-medium text-center text-black">
          {day}
        </div>
      ))}
      {weeks.flat().map((day, idx) => {
        processedEventIds.clear();

        const dayEvents = events.filter(event => {
          if (isSameDay(day, event.date) && !processedEventIds.has(event.id)) {
            processedEventIds.add(event.id);
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
              {dayEvents
                .reduce((unique: Event[], event) => {
                  const hasTimeSlot = unique.some(
                    existingEvent => 
                      existingEvent.startTime === event.startTime &&
                      existingEvent.endTime === event.endTime
                  );
                  if (!hasTimeSlot) unique.push(event);
                  return unique;
                }, [])
                .map(event => (
                  <div
                    key={event.id}
                    className={`${event.backgroundColor || 'bg-blue-50'} p-1 rounded text-xs truncate text-black`}
                  >
                    {event.startTime} {event.title}
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
  startDate: Date | null;
  endDate: Date | null;
}

const Calendar: React.FC<CalendarProps> = ({ startDate, endDate }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: currentDate,
    startTime: '12:00 PM',
    endTime: '1:00 PM',
    backgroundColor: 'bg-blue-50',
  });

  // Filter events based on startDate and endDate
  const filteredEvents = startDate && endDate
    ? events.filter(event =>
        isWithinInterval(event.date, { start: startDate, end: endDate })
      )
    : events;

  const handleSaveEvent = () => {
    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      backgroundColor: newEvent.backgroundColor,
    };
    setEvents([...events, event]);
    setNewEvent({ title: '', date: currentDate, startTime: '12:00 PM', endTime: '1:00 PM', backgroundColor: 'bg-blue-50' });
    setIsEventDialogOpen(false);
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
    <div className="h-screen flex flex-col w-full mx-auto p-4">
      <div className="flex-none">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">
            {getHeaderText()}
          </h1>
          <button
            className="px-4 py-2 bg-white rounded-lg border shadow-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => setIsEventDialogOpen(true)}
          >
            <Plus size={20} className='text-black'/>
            <span className="font-medium text-black">Add Event</span>
          </button>
        </div>

        {/* Event Dialog Modal */}
        {isEventDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-black">Add Event</h3>
                <button
                  onClick={() => setIsEventDialogOpen(false)}
                  className="text-black hover:text-gray-700"
                >
                  <X className="w-6 h-6 text-black" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-black mb-1">Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full border rounded-lg p-2 text-black"
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">Date</label>
                  <input
                    type="date"
                    value={format(newEvent.date, 'yyyy-MM-dd')}
                    onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                    className="w-full border rounded-lg p-2 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full border rounded-lg p-2 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full border rounded-lg p-2 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">Color</label>
                  <select
                    value={newEvent.backgroundColor}
                    onChange={(e) => setNewEvent({ ...newEvent, backgroundColor: e.target.value })}
                    className="w-full border rounded-lg p-2 text-black"
                  >
                    <option value="bg-blue-50">Blue</option>
                    <option value="bg-green-50">Green</option>
                    <option value="bg-red-50">Red</option>
                    <option value="bg-yellow-50">Yellow</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveEvent}
                  className="w-full bg-[#4dd25282] text-black py-2 rounded-lg hover:bg-[#4dd252] transition"
                >
                  Save Event
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
          {view === 'Day' && <DayView date={currentDate} events={filteredEvents} />}
          {view === 'Week' && <WeekView currentDate={currentDate} events={filteredEvents} />}
          {view === 'Month' && <MonthView currentDate={currentDate} events={filteredEvents} />}
        </div>
      </div>
    </div>
  );
};

export default Calendar;