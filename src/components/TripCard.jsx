import React from 'react';
import { Calendar, MapPin, DollarSign, Eye, PieChart, Share2, Trash2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { db } from '../db/store';

export default function TripCard({ trip, onView, onBudget, onCalendar, onDelete, onShare }) {
  const formattedBudget = db.formatCurrency(trip.totalBudget || 0);
  const formattedSpent = db.formatCurrency(trip.totalSpent || 0);
  const percentSpent = Math.min(100, Math.round(((trip.totalSpent || 0) / (trip.totalBudget || 1)) * 100));

  const statusColors = {
    ongoing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    upcoming: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    completed: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  };

  const statusIcons = {
    ongoing: Sparkles,
    upcoming: Clock,
    completed: CheckCircle2,
  };

  const StatusIcon = statusIcons[trip.status] || Clock;

  return (
    <div className="glass-card rounded-2xl overflow-hidden group flex flex-col h-full border border-gray-800/80 hover:border-indigo-500/50 transition-all duration-300">
      
      {/* Cover Image & Status Tag */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-900">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-md capitalize shadow-black/40 ${statusColors[trip.status]}">
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{trip.status}</span>
        </div>

        {/* Share Public Icon */}
        {trip.isPublic && (
          <div className="absolute top-3 right-3 p-1.5 bg-gray-900/80 backdrop-blur-md rounded-full text-sky-400 border border-sky-500/30" title="Publicly Shared">
            <Share2 className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Date Range Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-200">
          <div className="flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-700/60">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{trip.startDate} → {trip.endDate}</span>
          </div>

          <div className="flex items-center gap-1 bg-gray-900/80 backdrop-blur-md px-2 py-1 rounded-lg border border-gray-700/60 text-emerald-400 font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{trip.destinationCount || 1} Stops</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
            {trip.title}
          </h3>
          
          <p className="text-xs text-gray-400 line-clamp-2 mt-1">
            {trip.description}
          </p>

          {trip.destinationNames && (
            <p className="text-xs font-semibold text-sky-400 mt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{trip.destinationNames}</span>
            </p>
          )}
        </div>

        {/* Budget Progress Bar */}
        <div className="bg-gray-900/70 p-3 rounded-xl border border-gray-800/80 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gray-400">Spent / Budget</span>
            <span className={percentSpent > 90 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {formattedSpent} / {formattedBudget}
            </span>
          </div>
          
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentSpent > 100
                  ? 'bg-rose-500'
                  : percentSpent > 80
                  ? 'bg-amber-500'
                  : 'gradient-bg'
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between gap-2">
          <button
            onClick={() => onView(trip.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Itinerary</span>
          </button>

          <button
            onClick={() => onBudget(trip.id)}
            className="flex items-center justify-center p-2 rounded-xl text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Budget Analytics"
          >
            <PieChart className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => onCalendar(trip.id)}
            className="flex items-center justify-center p-2 rounded-xl text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Calendar View"
          >
            <Calendar className="w-4 h-4 text-sky-400" />
          </button>

          <button
            onClick={() => onShare(trip)}
            className="flex items-center justify-center p-2 rounded-xl text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Share Trip"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(trip.id)}
              className="flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
