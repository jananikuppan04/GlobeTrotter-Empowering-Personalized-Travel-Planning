import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Globe, Bookmark, Settings, Save, RotateCcw, Check, Sparkles } from 'lucide-react';
import { db } from '../db/store';
import { CURRENCIES } from '../db/schema';
import CityCard from '../components/CityCard';

export default function UserProfileScreen({ onOpenCreateTrip }) {
  const [user, setUser] = useState(db.getCurrentUser());
  const [savedCities, setSavedCities] = useState(db.getSavedDestinations());
  const [trips, setTrips] = useState(db.getUserTrips());
  const [activeCurrency, setActiveCurrency] = useState(db.getActiveCurrency());

  // Edit fields
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [country, setCountry] = useState(user?.country || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const update = () => {
      const u = db.getCurrentUser();
      setUser(u);
      setSavedCities(db.getSavedDestinations());
      setTrips(db.getUserTrips());
      setActiveCurrency(db.getActiveCurrency());
    };
    update();
    return db.subscribe(update);
  }, []);

  const handleProfileSave = (e) => {
    e.preventDefault();
    db.updateUserProfile(user.id, {
      firstName,
      lastName,
      phone,
      city,
      country,
      bio,
      avatar,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCurrencyChange = (code) => {
    db.setCurrency(code);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all GlobeTrotter local storage back to fresh initial seed data?')) {
      db.resetToSeed();
    }
  };

  const preplannedTrips = trips.filter((t) => t.status === 'upcoming' || t.status === 'ongoing');
  const pastTrips = trips.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <User className="w-7 h-7 text-indigo-400" />
          <span>User Profile & Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Manage your personal details, preferences, saved destinations, and past travel history.
        </p>
      </div>

      {/* Profile Overview Card & Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: User Summary Card */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6 text-center flex flex-col items-center justify-between">
          <div className="space-y-4">
            <div className="relative">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500/40 shadow-xl mx-auto"
              />
              <span className={`absolute bottom-0 right-1/3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${user?.role === 'admin' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'}`}>
                {user?.role}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <p className="text-xs text-sky-400 mt-1 font-semibold">
                {user?.city ? `${user.city}, ${user.country}` : 'Global Traveler'}
              </p>
            </div>

            <p className="text-xs text-gray-300 italic max-w-xs">
              "{user?.bio}"
            </p>
          </div>

          {/* Quick Stats */}
          <div className="w-full pt-4 border-t border-gray-800 grid grid-cols-2 gap-2 text-center">
            <div className="bg-gray-950 p-2.5 rounded-xl">
              <span className="text-lg font-black text-white">{trips.length}</span>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Total Trips</span>
            </div>
            <div className="bg-gray-950 p-2.5 rounded-xl">
              <span className="text-lg font-black text-rose-400">{savedCities.length}</span>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Favorites</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              <span>Edit Personal Information</span>
            </h3>

            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Saved Successfully!
              </span>
            )}
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Profile Avatar Image URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Travel Bio & Notes</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Currency Preference Selector */}
            <div className="pt-2 border-t border-gray-800">
              <label className="block text-xs font-bold text-gray-400 mb-2">Preferred Display Currency</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(CURRENCIES).map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCurrencyChange(c.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      activeCurrency.code === c.code
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetData}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset App Data to Seed</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 shadow-md shadow-indigo-600/30"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Saved Favorite Destinations */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-rose-400 fill-rose-400" />
          <span>Saved Favorite Destinations ({savedCities.length})</span>
        </h3>

        {savedCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedCities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                isSaved={true}
                onToggleSave={(id) => db.toggleSaveDestination(id)}
                onAddToTrip={(c) => onOpenCreateTrip(c.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center glass-panel rounded-2xl border border-gray-800 text-xs text-gray-400">
            No destinations saved yet. Bookmark cities in the Explore tab!
          </div>
        )}
      </div>

    </div>
  );
}
