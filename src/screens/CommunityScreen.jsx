import React, { useState, useEffect } from 'react';
import { Users, Heart, Copy, Share2, Search, Sparkles, MapPin, Calendar, Check, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../db/store';

export default function CommunityScreen({ onViewTrip, onTripCreated }) {
  const [posts, setPosts] = useState(db.getCommunityPosts());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [shareModalTrip, setShareModalTrip] = useState(null);

  useEffect(() => {
    const update = () => setPosts(db.getCommunityPosts());
    update();
    return db.subscribe(update);
  }, []);

  const handleLike = (postId) => {
    db.likePost(postId);
  };

  const handleCopyTrip = (tripId) => {
    const clonedTrip = db.copyTripToUser(tripId);
    
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });

    setCopiedId(tripId);
    setTimeout(() => setCopiedId(null), 2000);

    onTripCreated?.(clonedTrip.id);
  };

  const handleCopyLink = (shareId) => {
    const url = `${window.location.origin}?share=${shareId}`;
    navigator.clipboard.writeText(url);
    alert(`Public shareable link copied to clipboard:\n${url}`);
  };

  const filteredPosts = posts.filter((post) => {
    const titleMatch = post.trip?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const destMatch = post.trip?.destinationNames.toLowerCase().includes(searchQuery.toLowerCase());
    const userMatch = post.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || destMatch || userMatch;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-amber-400" />
            <span>Community Travel Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Explore public itineraries shared by travelers worldwide, get inspired, and clone trips directly to your account.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search community trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Community Feed Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => {
          const trip = post.trip;
          const user = post.user;

          return (
            <div
              key={post.id}
              className="glass-card rounded-3xl overflow-hidden border border-gray-800 flex flex-col justify-between"
            >
              {/* Cover Image & User Bar */}
              <div className="relative h-52 w-full overflow-hidden bg-gray-950">
                <img
                  src={trip.coverImage}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />

                {/* User Header Tag */}
                <div className="absolute top-4 left-4 flex items-center gap-2.5 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-bold text-white">{user?.name}</span>
                </div>

                {/* Bottom Overlay Title & Budget */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-white leading-tight">{trip.title}</h3>
                    <p className="text-xs text-sky-400 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{trip.destinationNames}</span>
                    </p>
                  </div>

                  <span className="text-sm font-black text-emerald-400 bg-gray-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-500/30">
                    {db.formatCurrency(trip.totalBudget)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-300 line-clamp-2">
                  {trip.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                      <span>{post.likes} Likes</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-sky-400">
                      <Copy className="w-4 h-4" />
                      <span>{post.copiesCount || 0} Cloned</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(trip.shareId)}
                      className="p-2 rounded-xl text-gray-300 bg-gray-800 hover:bg-gray-700"
                      title="Share Public Link"
                    >
                      <Share2 className="w-4 h-4 text-amber-400" />
                    </button>

                    <button
                      onClick={() => handleCopyTrip(trip.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 transition-all shadow-md shadow-indigo-600/30"
                    >
                      {copiedId === trip.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied to My Trips!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Trip</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
