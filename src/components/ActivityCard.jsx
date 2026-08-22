import React from 'react';
import { Clock, Star, MapPin, Plus, Ticket } from 'lucide-react';
import { db } from '../db/store';
import { ACTIVITY_CATEGORIES } from '../db/schema';

export default function ActivityCard({ activity, onAddToItinerary }) {
  const categoryInfo =
    ACTIVITY_CATEGORIES.find((c) => c.id === activity.category) || ACTIVITY_CATEGORIES[0];
  const formattedCost = activity.cost > 0 ? db.formatCurrency(activity.cost) : 'Free';

  return (
    <div className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between border border-[var(--border-color)] hover:border-indigo-500/40 transition-all duration-300 shadow-md">
      
      <div className="relative h-40 w-full overflow-hidden bg-gray-900">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-80" />

        {/* Category Pill */}
        <div
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${categoryInfo.color}`}
        >
          {categoryInfo.label}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-900/80 border border-gray-700 text-amber-300 backdrop-blur-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{activity.rating}</span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-gray-700 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{activity.durationHours} hrs</span>
          </div>

          <div className="flex items-center gap-1 text-emerald-400 font-bold bg-gray-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
            <Ticket className="w-3.5 h-3.5" />
            <span>{formattedCost}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-base font-extrabold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors line-clamp-1">
            {activity.name}
          </h4>
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1 font-medium">
            <MapPin className="w-3 h-3 text-sky-400" />
            <span className="truncate">{activity.location}</span>
          </p>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-2">
            {activity.description}
          </p>
        </div>

        <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
          <button
            onClick={() => onAddToItinerary?.(activity)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-input)] hover:bg-indigo-600 hover:text-white border border-[var(--border-color)] hover:border-indigo-500 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-indigo-400 group-hover:text-white" />
            <span>Add to Itinerary</span>
          </button>
        </div>
      </div>
    </div>
  );
}
