import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Filter, PlusCircle, Compass, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { db } from '../db/store';
import TripCard from '../components/TripCard';

export default function MyTripsScreen({
  onOpenCreateTrip,
  onViewTrip,
  onOpenBudget,
  onOpenCalendar,
  onShareTrip,
}) {
  const [trips, setTrips] = useState([]);
  const [activeStatusTab, setActiveStatusTab] = useState('all'); // 'all' | 'ongoing' | 'upcoming' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const update = () => {
      setTrips(db.getUserTrips());
    };
    update();
    return db.subscribe(update);
  }, []);

  const handleDeleteTrip = (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip itinerary?')) {
      db.deleteTrip(tripId);
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchesStatus = activeStatusTab === 'all' || t.status === activeStatusTab;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destinationNames.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const ongoingCount = trips.filter((t) => t.status === 'ongoing').length;
  const upcomingCount = trips.filter((t) => t.status === 'upcoming').length;
  const completedCount = trips.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-indigo-400" />
            <span>My Travel Itineraries</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Manage, edit, and organize all your upcoming, ongoing, and past journeys.
          </p>
        </div>

        <button
          onClick={() => onOpenCreateTrip()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white gradient-bg hover:opacity-95 transition-all shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Tabs & Search Bar Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gray-900/60 p-2 rounded-2xl border border-gray-800">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveStatusTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeStatusTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            All Trips ({trips.length})
          </button>
          
          <button
            onClick={() => setActiveStatusTab('ongoing')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeStatusTab === 'ongoing'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ongoing ({ongoingCount})</span>
          </button>

          <button
            onClick={() => setActiveStatusTab('upcoming')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeStatusTab === 'upcoming'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upcoming ({upcomingCount})</span>
          </button>

          <button
            onClick={() => setActiveStatusTab('completed')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeStatusTab === 'completed'
                ? 'bg-gray-700/50 text-gray-300 border border-gray-600'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Completed ({completedCount})</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search trips or cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onView={onViewTrip}
              onBudget={onOpenBudget}
              onCalendar={onOpenCalendar}
              onShare={onShareTrip}
              onDelete={handleDeleteTrip}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center glass-panel rounded-3xl border border-gray-800 space-y-4 max-w-md mx-auto">
          <Compass className="w-16 h-16 text-indigo-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white">No Trips Found</h3>
          <p className="text-xs text-gray-400">
            {searchQuery
              ? `No itineraries match your search query "${searchQuery}".`
              : `You don't have any ${activeStatusTab !== 'all' ? activeStatusTab : ''} trips planned.`}
          </p>
          <button
            onClick={() => onOpenCreateTrip()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-bg"
          >
            Plan a New Trip Now
          </button>
        </div>
      )}

    </div>
  );
}
