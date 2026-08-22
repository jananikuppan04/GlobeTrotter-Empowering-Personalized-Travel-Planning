import React, { useState, useEffect } from 'react';
import { MapPin, Search, Filter, ArrowUpDown, Sun, DollarSign, Star, Bookmark, Plus, X, Globe, Sparkles } from 'lucide-react';
import { db } from '../db/store';
import CityCard from '../components/CityCard';

export default function CitySearchScreen({ onOpenCreateTrip }) {
  const [destinations, setDestinations] = useState(db.getDestinations());
  const [savedDestIds, setSavedDestIds] = useState(db.getSavedDestinations().map((d) => d.id));
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity' | 'cost-asc' | 'cost-desc' | 'name'
  const [detailCity, setDetailCity] = useState(null);

  useEffect(() => {
    const update = () => {
      setDestinations(db.getDestinations());
      setSavedDestIds(db.getSavedDestinations().map((d) => d.id));
    };
    update();
    return db.subscribe(update);
  }, []);

  const handleToggleSave = (destId) => {
    db.toggleSaveDestination(destId);
  };

  const continents = ['All', 'Europe', 'Asia', 'North America', 'Oceania', 'Africa', 'Middle East'];

  const filtered = destinations
    .filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesContinent = selectedContinent === 'All' || d.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.popularityScore - a.popularityScore;
      if (sortBy === 'cost-asc') return a.avgDailyCost - b.avgDailyCost;
      if (sortBy === 'cost-desc') return b.avgDailyCost - a.avgDailyCost;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <MapPin className="w-7 h-7 text-sky-400" />
          <span>Explore Global Destinations</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Discover world-class cities, analyze daily budget indexes, and incorporate stops into your travel plans.
        </p>
      </div>

      {/* Controls Bar: Search, Continent Filter, Sorting */}
      <div className="space-y-4 bg-gray-900/60 p-4 rounded-3xl border border-gray-800 backdrop-blur-md">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by city, country, or tag (e.g. Paris, Temples, Beach)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs sm:text-sm text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 bg-gray-950 px-3 py-2 border border-gray-800 rounded-xl text-xs">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 font-bold hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="popularity" className="bg-gray-900">Highest Popularity</option>
              <option value="cost-asc" className="bg-gray-900">Daily Cost: Low to High</option>
              <option value="cost-desc" className="bg-gray-900">Daily Cost: High to Low</option>
              <option value="name" className="bg-gray-900">City Name (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Continent Pill Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {continents.map((continent) => (
            <button
              key={continent}
              onClick={() => setSelectedContinent(continent)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedContinent === continent
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {continent}
            </button>
          ))}
        </div>

      </div>

      {/* Destination Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              isSaved={savedDestIds.includes(city.id)}
              onToggleSave={handleToggleSave}
              onAddToTrip={(c) => onOpenCreateTrip(c.id)}
              onClickDetail={(c) => setDetailCity(c)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center glass-panel rounded-3xl border border-gray-800 space-y-3">
          <Globe className="w-12 h-12 text-sky-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white">No Cities Match Your Criteria</h3>
          <p className="text-xs text-gray-400">Try adjusting your continent filters or search query.</p>
        </div>
      )}

      {/* City Detail Modal */}
      {detailCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="relative h-64 w-full bg-gray-950">
              <img
                src={detailCity.image}
                alt={detailCity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />

              <button
                onClick={() => setDetailCity(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-900/80 text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                    {detailCity.country} • {detailCity.region}
                  </span>
                  <h2 className="text-3xl font-black text-white">{detailCity.name}</h2>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-gray-900/90 border border-gray-700 text-xs font-bold text-amber-300">
                  {detailCity.weather}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <p className="text-sm text-gray-300 leading-relaxed">
                {detailCity.description}
              </p>

              <div className="grid grid-cols-2 gap-4 bg-gray-950 p-4 rounded-2xl border border-gray-800">
                <div>
                  <span className="text-xs text-gray-400 font-bold block">Avg Daily Cost Index</span>
                  <span className="text-lg font-black text-emerald-400">{db.formatCurrency(detailCity.avgDailyCost)} / day</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold block">Popularity Score</span>
                  <span className="text-lg font-black text-amber-400">{detailCity.popularityScore} / 100</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-xs text-gray-400 font-bold block mb-2">Category Highlights</span>
                <div className="flex flex-wrap gap-2">
                  {detailCity.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-xl bg-gray-800 text-xs font-semibold text-gray-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => {
                    handleToggleSave(detailCity.id);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    savedDestIds.includes(detailCity.id)
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  {savedDestIds.includes(detailCity.id) ? 'Saved in Favorites' : 'Save to Favorites'}
                </button>

                <button
                  onClick={() => {
                    setDetailCity(null);
                    onOpenCreateTrip(detailCity.id);
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 shadow-md shadow-indigo-600/30"
                >
                  Start Trip to {detailCity.name}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
