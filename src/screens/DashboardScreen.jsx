import React, { useState, useEffect } from 'react';
import {
  Compass,
  PlusCircle,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp,
  Globe,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  Search,
} from 'lucide-react';
import { db } from '../db/store';
import TripCard from '../components/TripCard';
import CityCard from '../components/CityCard';
import ActivityCard from '../components/ActivityCard';

export default function DashboardScreen({
  setActiveTab,
  onOpenCreateTrip,
  onViewTrip,
  onOpenBudget,
  onOpenCalendar,
  onShareTrip,
}) {
  const [user, setUser] = useState(db.getCurrentUser());
  const [userTrips, setUserTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [savedDestIds, setSavedDestIds] = useState(db.getSavedDestinations().map((d) => d.id));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const update = () => {
      setUser(db.getCurrentUser());
      setUserTrips(db.getUserTrips());
      setDestinations(db.getDestinations());
      setActivities(db.getActivities().slice(0, 4));
      setSavedDestIds(db.getSavedDestinations().map((d) => d.id));
    };

    update();
    return db.subscribe(update);
  }, []);

  const handleToggleSave = (destId) => {
    db.toggleSaveDestination(destId);
  };

  const handleQuickAddCityToTrip = (city) => {
    onOpenCreateTrip(city.id);
  };

  const filteredDestinations = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-2xl bg-gray-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80"
            alt="Travel Hero"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Welcome back, {user?.firstName || 'Traveler'}!</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Plan Your Next Trip <br />
            <span className="gradient-text">Simple, Easy & Fun</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed">
            Pick your cities, add daily fun activities, check costs automatically, and share your travel plan with friends.
          </p>

          {/* Quick Search & Create Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a city or country (e.g. Paris, Japan)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-950/90 backdrop-blur-md border border-gray-700/80 rounded-xl text-sm text-white focus:border-indigo-500 focus:outline-none shadow-lg"
              />
            </div>

            <button
              onClick={() => onOpenCreateTrip()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white gradient-bg hover:opacity-95 transition-all shadow-lg shadow-indigo-600/30 whitespace-nowrap"
            >
              <PlusCircle className="w-5 h-5" />
              <span>+ Create New Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simple Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{userTrips.length}</p>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">My Trips</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{destinations.length}</p>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">Cities Available</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)]">
              {db.formatCurrency(userTrips.reduce((acc, t) => acc + (t.totalBudget || 0), 0))}
            </p>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">Total Planned Cost</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)]">24</p>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">Shared Plans</p>
          </div>
        </div>
      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500" />
              <span>Your Recent Trips</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)]">Easily manage your day-by-day plans</p>
          </div>

          <button
            onClick={() => setActiveTab('my-trips')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
          >
            <span>See All ({userTrips.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {userTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTrips.slice(0, 3).map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onView={onViewTrip}
                onBudget={onOpenBudget}
                onCalendar={onOpenCalendar}
                onShare={onShareTrip}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center glass-panel rounded-2xl border border-[var(--border-color)] space-y-3">
            <Compass className="w-12 h-12 text-indigo-400 mx-auto opacity-60" />
            <p className="text-sm font-semibold text-[var(--text-secondary)]">No trips planned yet!</p>
            <button
              onClick={() => onOpenCreateTrip()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-bg"
            >
              + Start Planning A Trip
            </button>
          </div>
        )}
      </div>

      {/* Recommended Destinations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-400" />
              <span>Popular Cities to Visit</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)]">Check average daily costs and add cities to your trip</p>
          </div>

          <button
            onClick={() => setActiveTab('cities')}
            className="flex items-center gap-1 text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors"
          >
            <span>Browse All Cities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDestinations.slice(0, 4).map((city) => (
            <CityCard
              key={city.id}
              city={city}
              isSaved={savedDestIds.includes(city.id)}
              onToggleSave={handleToggleSave}
              onAddToTrip={handleQuickAddCityToTrip}
              onClickDetail={() => setActiveTab('cities')}
            />
          ))}
        </div>
      </div>

      {/* Popular Activities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Fun Things To Do</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)]">Tours, food, nature, and cultural experiences</p>
          </div>

          <button
            onClick={() => setActiveTab('activities')}
            className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors"
          >
            <span>Explore All Activities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onAddToItinerary={() => setActiveTab('activities')}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
