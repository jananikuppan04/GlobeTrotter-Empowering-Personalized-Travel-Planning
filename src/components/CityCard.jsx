import React from 'react';
import { MapPin, DollarSign, Star, Bookmark, Plus, Sun } from 'lucide-react';
import { db } from '../db/store';

export default function CityCard({ city, isSaved, onToggleSave, onAddToTrip, onClickDetail }) {
  const formattedDailyCost = db.formatCurrency(city.avgDailyCost);

  return (
    <div className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between border border-[var(--border-color)] hover:border-sky-500/40 transition-all duration-300 shadow-md">
      
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-900 cursor-pointer" onClick={() => onClickDetail?.(city)}>
        <img
          src={city.image}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-80" />

        {/* Save Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(city.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
              : 'bg-gray-900/70 text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save Destination'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>

        {/* Popularity Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 backdrop-blur-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{city.popularityScore} Match</span>
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
              {city.country} • {city.region}
            </span>
            <h3 className="text-xl font-extrabold leading-tight">
              {city.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-gray-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-700 text-xs font-semibold text-amber-300">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>{city.weather}</span>
          </div>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
          {city.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {city.tags?.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Avg Daily Cost</span>
            <span className="text-sm font-bold text-emerald-400">{formattedDailyCost} / day</span>
          </div>

          <button
            onClick={() => onAddToTrip?.(city)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Trip</span>
          </button>
        </div>

      </div>
    </div>
  );
}
