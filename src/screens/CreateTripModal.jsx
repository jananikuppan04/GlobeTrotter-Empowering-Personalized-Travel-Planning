import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Image as ImageIcon, MapPin, Sparkles, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../db/store';

export default function CreateTripModal({ isOpen, onClose, initialDestinationId, onTripCreated }) {
  const [destinations, setDestinations] = useState(db.getDestinations());
  const activeCurrency = db.getActiveCurrency();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [totalBudget, setTotalBudget] = useState(2000);
  const [coverImage, setCoverImage] = useState('');
  const [selectedDestIds, setSelectedDestIds] = useState([]);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (initialDestinationId && !selectedDestIds.includes(initialDestinationId)) {
      setSelectedDestIds([initialDestinationId]);
      const dest = db.getDestinationById(initialDestinationId);
      if (dest) {
        setTitle(`${dest.name} Explorer`);
        setCoverImage(dest.image);
      }
    }
  }, [initialDestinationId]);

  if (!isOpen) return null;

  const toggleSelectCity = (destId) => {
    if (selectedDestIds.includes(destId)) {
      setSelectedDestIds(selectedDestIds.filter((id) => id !== destId));
    } else {
      const newIds = [...selectedDestIds, destId];
      setSelectedDestIds(newIds);
      if (!coverImage && newIds.length > 0) {
        const dest = db.getDestinationById(newIds[0]);
        if (dest) setCoverImage(dest.image);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    const newTrip = db.createTrip({
      title,
      description,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
      startDate,
      endDate,
      totalBudget,
      isPublic,
      selectedDestinations: selectedDestIds,
    });

    // Trigger celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onTripCreated?.(newTrip.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">Create New Travel Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Trip Name & Public Toggle */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Trip Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Romantic Paris & French Riviera Odyssey"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Trip Description</label>
              <textarea
                rows={2}
                placeholder="Briefly describe your itinerary goals, travel companions, or theme..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Dates & Budget Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-950/40 p-4 rounded-2xl border border-gray-800/80">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-indigo-400" />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-indigo-400" />
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Target Budget ({activeCurrency.code})</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-emerald-400">
                  {activeCurrency.symbol}
                </span>
                <input
                  type="number"
                  min={100}
                  required
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Select Initial Cities / Destinations */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2">
              Select Initial Destinations / City Stops ({selectedDestIds.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
              {destinations.map((dest) => {
                const isSelected = selectedDestIds.includes(dest.id);
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => toggleSelectCity(dest.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{dest.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{dest.country}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cover Photo Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Cover Photo URL (Optional)</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-950/60 border border-gray-800 rounded-xl">
            <div>
              <p className="text-xs font-bold text-white">Share to Community Feed</p>
              <p className="text-[11px] text-gray-400">Allow other travelers to get inspired and copy your trip</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Action Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white gradient-bg hover:opacity-90 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Travel Itinerary</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
