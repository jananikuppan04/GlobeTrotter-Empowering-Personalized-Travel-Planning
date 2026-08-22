import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Clock,
  Ticket,
  DollarSign,
  PieChart,
  CheckCircle2,
  Circle,
  Share2,
  Sparkles,
  Layers,
  ChevronDown,
  X,
  LayoutList,
  Grid,
  TrendingUp,
} from 'lucide-react';
import { db } from '../db/store';
import { ACTIVITY_CATEGORIES } from '../db/schema';

export default function ItineraryBuilderScreen({
  tripId,
  onBack,
  onOpenBudget,
  onOpenCalendar,
  onShareTrip,
}) {
  const [trip, setTrip] = useState(db.getTripWithDetails(tripId));
  const [destinations, setDestinations] = useState(db.getDestinations());

  // View Mode Toggle ('timeline' | 'compact')
  const [viewMode, setViewMode] = useState('timeline');

  // Modal states
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState('');

  const [isAddActOpen, setIsAddActOpen] = useState(false);
  const [activeStopId, setActiveStopId] = useState(null);
  const [actTitle, setActTitle] = useState('');
  const [actDay, setActDay] = useState(1);
  const [actTime, setActTime] = useState('09:00');
  const [actCost, setActCost] = useState(0);
  const [actCategory, setActCategory] = useState('sightseeing');
  const [actNotes, setActNotes] = useState('');

  useEffect(() => {
    const update = () => {
      setTrip(db.getTripWithDetails(tripId));
    };
    update();
    return db.subscribe(update);
  }, [tripId]);

  if (!trip) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">
        Trip not found. <button onClick={onBack} className="text-indigo-500 font-bold underline">Go Back</button>
      </div>
    );
  }

  const handleAddStopSubmit = (e) => {
    e.preventDefault();
    if (!selectedDestId) return;
    db.addStopToTrip(tripId, {
      destinationId: selectedDestId,
      startDate: trip.startDate,
      endDate: trip.endDate,
      estimatedBudget: 500,
    });
    setIsAddStopOpen(false);
    setSelectedDestId('');
  };

  const handleDeleteStop = (stopId) => {
    if (window.confirm('Remove this city stop and its activities?')) {
      db.deleteStop(stopId);
    }
  };

  const handleOpenAddActivity = (stopId) => {
    setActiveStopId(stopId);
    setActTitle('');
    setActDay(1);
    setActTime('10:00');
    setActCost(25);
    setActCategory('sightseeing');
    setActNotes('');
    setIsAddActOpen(true);
  };

  const handleAddActivitySubmit = (e) => {
    e.preventDefault();
    if (!activeStopId || !actTitle) return;

    db.addActivityToStop(activeStopId, {
      activityId: null,
      customTitle: actTitle,
      dayNumber: actDay,
      startTime: actTime,
      cost: actCost,
      category: actCategory,
      notes: actNotes,
    });

    setIsAddActOpen(false);
  };

  const handleDeleteActivity = (actItemId) => {
    db.deleteActivity(actItemId);
  };

  const handleSelectPresetActivity = (stopId, presetAct) => {
    db.addActivityToStop(stopId, {
      activityId: presetAct.id,
      customTitle: presetAct.name,
      dayNumber: 1,
      startTime: '11:00',
      cost: presetAct.cost,
      category: presetAct.category,
      notes: presetAct.description,
    });
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-surface)] p-5 rounded-3xl border border-[var(--border-color)] shadow-lg backdrop-blur-md">
        
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[var(--bg-input)] hover:bg-gray-800 text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">{trip.title}</h1>
              <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${trip.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'}`}>
                {trip.status}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {trip.startDate} to {trip.endDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-sky-400 font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                {trip.destinationCount} Destination Stops
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls & View Mode Toggle */}
        <div className="flex items-center gap-2">
          
          {/* View Mode Toggle Pill Switch */}
          <div className="flex items-center bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-color)]">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Timeline Flow View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>

            <button
              onClick={() => setViewMode('compact')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'compact'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Compact Cards View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compact</span>
            </button>
          </div>

          <button
            onClick={() => onOpenBudget(trip.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
          >
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">Cost Breakdown</span>
          </button>

          <button
            onClick={() => onOpenCalendar(trip.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </button>

          <button
            onClick={() => onShareTrip(trip)}
            className="p-2 rounded-xl text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
            title="Share Trip"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Budget Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Target Trip Budget</span>
          <p className="text-xl font-black text-[var(--text-primary)]">{db.formatCurrency(trip.totalBudget)}</p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Current Logged Expenses</span>
          <p className="text-xl font-black text-emerald-400">{db.formatCurrency(trip.totalSpent)}</p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Remaining Balance</span>
          <p className={`text-xl font-black ${trip.totalBudget - trip.totalSpent < 0 ? 'text-rose-400' : 'text-sky-400'}`}>
            {db.formatCurrency(trip.totalBudget - trip.totalSpent)}
          </p>
        </div>
      </div>

      {/* City Stops & Activities Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Day-wise Itinerary ({viewMode === 'timeline' ? 'Timeline Flow' : 'Compact Grid'})</span>
          </h2>

          <button
            onClick={() => setIsAddStopOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add City Stop</span>
          </button>
        </div>

        {trip.stops.length > 0 ? (
          <div className="space-y-8">
            {trip.stops.map((stop, index) => {
              const destActivities = db.getActivities(stop.destinationId);
              
              // Group activities by day
              const daysMap = {};
              stop.activities.forEach((act) => {
                const d = act.dayNumber || 1;
                if (!daysMap[d]) daysMap[d] = [];
                daysMap[d].push(act);
              });

              const dayNumbers = Object.keys(daysMap).map(Number).sort((a, b) => a - b);

              return (
                <div
                  key={stop.id}
                  className="glass-panel rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-xl"
                >
                  {/* Stop City Header */}
                  <div className="relative p-6 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={stop.destination?.image}
                        alt={stop.destination?.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            Stop #{index + 1}
                          </span>
                          <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                            {stop.destination?.name}, {stop.destination?.country}
                          </h3>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                          Avg Daily Index: <span className="text-emerald-400 font-bold">{db.formatCurrency(stop.destination?.avgDailyCost || 100)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAddActivity(stop.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Activity</span>
                      </button>

                      <button
                        onClick={() => handleDeleteStop(stop.id)}
                        className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove City Stop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content - Day wise flow */}
                  <div className="p-6 space-y-6">
                    {dayNumbers.length > 0 ? (
                      dayNumbers.map((dayNum) => (
                        <div key={dayNum} className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                              {dayNum}
                            </span>
                            <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                              Day {dayNum} Schedule
                            </h4>
                          </div>

                          <div className={viewMode === 'timeline' ? 'space-y-2.5' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
                            {daysMap[dayNum].map((act) => {
                              const catInfo =
                                ACTIVITY_CATEGORIES.find((c) => c.id === act.category) ||
                                ACTIVITY_CATEGORIES[0];
                              return (
                                <div
                                  key={act.id}
                                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-indigo-500/30 transition-all group shadow-sm"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex flex-col items-center justify-center px-2 py-1 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] text-[10px] font-bold text-indigo-400">
                                      <Clock className="w-3.5 h-3.5 mb-0.5 text-indigo-400" />
                                      <span>{act.startTime}</span>
                                    </div>

                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-sm font-extrabold text-[var(--text-primary)] truncate">
                                          {act.customTitle}
                                        </h5>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catInfo.color}`}>
                                          {catInfo.label}
                                        </span>
                                      </div>
                                      {act.notes && (
                                        <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                                          {act.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-emerald-400">
                                      {db.formatCurrency(act.cost)}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteActivity(act.id)}
                                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center border border-dashed border-[var(--border-color)] rounded-2xl space-y-2">
                        <p className="text-xs text-[var(--text-muted)]">No activities added for {stop.destination?.name} yet.</p>
                        <button
                          onClick={() => handleOpenAddActivity(stop.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20"
                        >
                          + Add First Activity
                        </button>
                      </div>
                    )}

                    {/* Quick Pick Presets for this city */}
                    {destActivities.length > 0 && (
                      <div className="pt-4 border-t border-[var(--border-color)] space-y-2">
                        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">
                          Recommended Experiences in {stop.destination?.name}:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {destActivities.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => handleSelectPresetActivity(stop.id, preset)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500 transition-all"
                            >
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>{preset.name}</span>
                              <span className="text-emerald-400 font-bold ml-1">
                                ({db.formatCurrency(preset.cost)})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center glass-panel rounded-3xl border border-[var(--border-color)] space-y-4">
            <MapPin className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">No City Stops Added Yet</h3>
            <p className="text-xs text-[var(--text-muted)]">Add destinations to construct your day-by-day itinerary flow.</p>
            <button
              onClick={() => setIsAddStopOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-bg"
            >
              Add First City Stop
            </button>
          </div>
        )}
      </div>

      {/* Add Stop Modal */}
      {isAddStopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Add City Stop to Itinerary</h3>
              <button onClick={() => setIsAddStopOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStopSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Select Destination City</label>
                <select
                  required
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose City --</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}, {d.country} ({db.formatCurrency(d.avgDailyCost)}/day)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90"
              >
                Add City Stop
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Activity Modal */}
      {isAddActOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Add Activity to Schedule</h3>
              <button onClick={() => setIsAddActOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivitySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Louvre Museum & Mona Lisa Tour"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Day Number</label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={actDay}
                    onChange={(e) => setActDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Start Time</label>
                  <input
                    type="time"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Cost (USD)</label>
                  <input
                    type="number"
                    min={0}
                    value={actCost}
                    onChange={(e) => setActCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Category</label>
                  <select
                    value={actCategory}
                    onChange={(e) => setActCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  >
                    {ACTIVITY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Notes / Reminders</label>
                <textarea
                  rows={2}
                  placeholder="Ticket numbers, dress codes, tips..."
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90"
              >
                Save Activity to Day {actDay}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
