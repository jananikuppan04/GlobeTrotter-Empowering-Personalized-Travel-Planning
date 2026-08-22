import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, Ticket, Sparkles, X } from 'lucide-react';
import { db } from '../db/store';

export default function TripCalendarScreen({ onViewTrip }) {
  const [trips, setTrips] = useState(db.getUserTrips());
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026 default
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const update = () => setTrips(db.getUserTrips());
    update();
    return db.subscribe(update);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to check if a date is within a trip range
  const getTripsForDate = (dateStr) => {
    return trips.filter((t) => {
      const start = t.startDate;
      const end = t.endDate;
      return dateStr >= start && dateStr <= end;
    });
  };

  // Gather activities for a specific day
  const getDayActivities = (dateStr) => {
    const activeTrips = getTripsForDate(dateStr);
    const dayActivities = [];

    activeTrips.forEach((trip) => {
      trip.stops.forEach((stop) => {
        stop.activities.forEach((act) => {
          dayActivities.push({
            ...act,
            tripTitle: trip.title,
            cityName: stop.destination?.name,
          });
        });
      });
    });

    return dayActivities;
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-indigo-400" />
            <span>Itinerary Calendar & Timeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Visualize your multi-city journeys and daily scheduled activities across time.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 bg-gray-900/80 p-2 rounded-2xl border border-gray-800 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-bold text-white min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel p-6 rounded-3xl border border-gray-800 shadow-2xl">
        
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 uppercase mb-4">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayNum, index) => {
            if (!dayNum) {
              return <div key={`empty-${index}`} className="h-28 bg-gray-950/20 rounded-2xl" />;
            }

            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const fullDateStr = `${year}-${monthStr}-${dayStr}`;

            const dateTrips = getTripsForDate(fullDateStr);
            const dateActivities = getDayActivities(fullDateStr);

            return (
              <div
                key={fullDateStr}
                onClick={() => setSelectedDay({ dayNum, fullDateStr, dateTrips, dateActivities })}
                className={`h-28 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                  dateTrips.length > 0
                    ? 'bg-indigo-950/30 border-indigo-500/40 hover:border-indigo-400 shadow-sm'
                    : 'bg-gray-950/60 border-gray-800/80 hover:bg-gray-900 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${dateTrips.length > 0 ? 'text-indigo-400' : 'text-gray-400'}`}>
                    {dayNum}
                  </span>

                  {dateActivities.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                  )}
                </div>

                {/* Trip Event Bars */}
                <div className="space-y-1">
                  {dateTrips.map((t) => (
                    <div
                      key={t.id}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-white gradient-bg truncate shadow-sm"
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}

                  {dateActivities.length > 0 && dateTrips.length === 0 && (
                    <span className="text-[10px] font-semibold text-amber-300 block truncate">
                      {dateActivities.length} Activities
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Day Details Drawer Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Day Details</h3>
                <p className="text-xs text-indigo-400">{selectedDay.fullDateStr}</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {/* Active Trips on this day */}
              {selectedDay.dateTrips.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Active Itinerary</span>
                  {selectedDay.dateTrips.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedDay(null);
                        onViewTrip(t.id);
                      }}
                      className="p-3 bg-gray-950 rounded-2xl border border-gray-800 hover:border-indigo-500 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{t.title}</h4>
                        <p className="text-[10px] text-sky-400">{t.destinationNames}</p>
                      </div>
                      <button className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-indigo-600">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Scheduled Activities */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Scheduled Activities ({selectedDay.dateActivities.length})</span>
                {selectedDay.dateActivities.length > 0 ? (
                  selectedDay.dateActivities.map((act, idx) => (
                    <div key={idx} className="p-3 bg-gray-950 rounded-2xl border border-gray-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{act.customTitle}</span>
                        <span className="text-xs font-bold text-emerald-400">{db.formatCurrency(act.cost)}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 flex items-center gap-2">
                        <span>{act.startTime}</span>
                        <span>•</span>
                        <span className="text-sky-400">{act.cityName}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">No specific activities scheduled for this day.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
