import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Filter, MapPin, Clock, Star, Plus, Check, X } from 'lucide-react';
import { db } from '../db/store';
import { ACTIVITY_CATEGORIES } from '../db/schema';
import ActivityCard from '../components/ActivityCard';

export default function ActivitySearchScreen({ onOpenCreateTrip }) {
  const [activities, setActivities] = useState(db.getActivities());
  const [destinations, setDestinations] = useState(db.getDestinations());
  const [userTrips, setUserTrips] = useState(db.getUserTrips());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCityId, setSelectedCityId] = useState('All');

  // Add to Itinerary Modal state
  const [targetActivity, setTargetActivity] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [actDayNum, setActDayNum] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const update = () => {
      setActivities(db.getActivities());
      setDestinations(db.getDestinations());
      setUserTrips(db.getUserTrips());
    };
    update();
    return db.subscribe(update);
  }, []);

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || act.category === selectedCategory;
    const matchesCity = selectedCityId === 'All' || act.destinationId === selectedCityId;
    return matchesSearch && matchesCategory && matchesCity;
  });

  const handleOpenAddModal = (activity) => {
    setTargetActivity(activity);
    if (userTrips.length > 0) {
      setSelectedTripId(userTrips[0].id);
      if (userTrips[0].stops.length > 0) {
        setSelectedStopId(userTrips[0].stops[0].id);
      }
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!selectedStopId || !targetActivity) return;

    db.addActivityToStop(selectedStopId, {
      activityId: targetActivity.id,
      customTitle: targetActivity.name,
      dayNumber: actDayNum,
      startTime: '10:00',
      cost: targetActivity.cost,
      category: targetActivity.category,
      notes: targetActivity.description,
    });

    setSuccessMessage(`Added "${targetActivity.name}" to your itinerary!`);
    setTimeout(() => {
      setSuccessMessage('');
      setTargetActivity(null);
    }, 1500);
  };

  const activeTrip = userTrips.find((t) => t.id === selectedTripId);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-amber-400" />
          <span>Discover Things To Do</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Enrich your trips with sight-seeing tours, food tastings, adventure activities, and cultural experiences.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4 bg-gray-900/60 p-4 rounded-3xl border border-gray-800 backdrop-blur-md">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Filter by City */}
          <div className="flex items-center gap-2 bg-gray-950 px-3 py-2 border border-gray-800 rounded-xl text-xs">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span className="text-gray-400 font-bold">City:</span>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1"
            >
              <option value="All" className="bg-gray-900">All Cities</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id} className="bg-gray-900">
                  {d.name} ({d.country})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Category */}
          <div className="flex items-center gap-2 bg-gray-950 px-3 py-2 border border-gray-800 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-amber-400" />
            <span className="text-gray-400 font-bold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer flex-1"
            >
              <option value="All" className="bg-gray-900">All Categories</option>
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-gray-900">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Activities Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onAddToItinerary={() => handleOpenAddModal(activity)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center glass-panel rounded-3xl border border-gray-800 space-y-3">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white">No Activities Found</h3>
          <p className="text-xs text-gray-400">Try adjusting search filters or selecting another city.</p>
        </div>
      )}

      {/* Add Activity Modal */}
      {targetActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Add Activity to Trip</h3>
                <p className="text-xs text-amber-400">{targetActivity.name}</p>
              </div>
              <button onClick={() => setTargetActivity(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMessage ? (
              <div className="p-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="space-y-4">
                {userTrips.length > 0 ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Select Target Trip</label>
                      <select
                        value={selectedTripId}
                        onChange={(e) => {
                          setSelectedTripId(e.target.value);
                          const t = userTrips.find((x) => x.id === e.target.value);
                          if (t && t.stops.length > 0) setSelectedStopId(t.stops[0].id);
                        }}
                        className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                      >
                        {userTrips.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {activeTrip?.stops.length > 0 ? (
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Select City Stop</label>
                        <select
                          value={selectedStopId}
                          onChange={(e) => setSelectedStopId(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                        >
                          {activeTrip.stops.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.destination?.name} ({s.destination?.country})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p className="text-xs text-rose-400">
                        Selected trip has no city stops yet. Please add a city stop in Itinerary Builder first.
                      </p>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Day Number in Itinerary</label>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={actDayNum}
                        onChange={(e) => setActDayNum(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedStopId}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 disabled:opacity-50"
                    >
                      Confirm & Add to Schedule
                    </button>
                  </>
                ) : (
                  <div className="text-center space-y-3 py-3">
                    <p className="text-xs text-gray-400">You don't have any active trip itineraries to add to.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetActivity(null);
                        onOpenCreateTrip();
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-bg"
                    >
                      Create a Trip First
                    </button>
                  </div>
                )}
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
