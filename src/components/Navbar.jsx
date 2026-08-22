import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  PieChart,
  Users,
  ShieldCheck,
  Search,
  PlusCircle,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
  Globe,
  DollarSign,
  Briefcase,
  Bookmark,
} from 'lucide-react';
import { db } from '../db/store';
import { CURRENCIES } from '../db/schema';

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal, onOpenCreateTrip }) {
  const [currentUser, setCurrentUser] = useState(db.getCurrentUser());
  const [activeCurrency, setActiveCurrency] = useState(db.getActiveCurrency());
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setCurrentUser(db.getCurrentUser());
      setActiveCurrency(db.getActiveCurrency());
    });
    return unsubscribe;
  }, []);

  const handleCurrencyChange = (e) => {
    db.setCurrency(e.target.value);
  };

  const handleQuickDemoSwitch = (role) => {
    if (role === 'admin') {
      db.setCurrentUser('usr_admin_1');
    } else {
      db.setCurrentUser('usr_demo_1');
    }
    setIsProfileMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'my-trips', label: 'My Trips', icon: Briefcase },
    { id: 'cities', label: 'Explore Cities', icon: MapPin },
    { id: 'activities', label: 'Activities', icon: Sparkles },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'community', label: 'Community', icon: Users },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck, highlight: true });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Globe className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight gradient-text">GlobeTrotter</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full ml-2 border border-sky-500/20">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-900/60 p-1.5 rounded-xl border border-gray-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* Create Trip CTA */}
            <button
              onClick={onOpenCreateTrip}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Plan New Trip</span>
            </button>

            {/* Currency Selector */}
            <div className="relative hidden sm:flex items-center bg-gray-900/80 border border-gray-800 rounded-lg px-2 py-1 text-xs">
              <span className="text-gray-400 font-semibold mr-1">{activeCurrency.symbol}</span>
              <select
                value={activeCurrency.code}
                onChange={handleCurrencyChange}
                className="bg-transparent text-gray-200 font-medium focus:outline-none cursor-pointer text-xs"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code} className="bg-gray-900 text-gray-200">
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-800/60 transition-colors border border-transparent hover:border-gray-800"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/50"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-gray-200 truncate max-w-[100px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-gray-400 capitalize">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${currentUser.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {currentUser.role.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>My Profile & Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('my-trips');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <Briefcase className="w-4 h-4 text-sky-400" />
                        <span>My Saved Trips</span>
                      </button>

                      {/* Demo Quick Switchers */}
                      <div className="px-4 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Quick Demo Accounts
                      </div>
                      <button
                        onClick={() => handleQuickDemoSwitch('user')}
                        className={`w-full flex items-center justify-between px-4 py-1.5 text-xs ${
                          currentUser.role === 'user' ? 'text-indigo-400 font-semibold' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>Switch to Demo Traveler</span>
                        {currentUser.role === 'user' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                      </button>
                      <button
                        onClick={() => handleQuickDemoSwitch('admin')}
                        className={`w-full flex items-center justify-between px-4 py-1.5 text-xs ${
                          currentUser.role === 'admin' ? 'text-amber-400 font-semibold' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>Switch to Demo Admin</span>
                        {currentUser.role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                      </button>
                    </div>

                    <div className="border-t border-gray-800 pt-1">
                      <button
                        onClick={() => {
                          db.setCurrentUser(null);
                          onOpenAuthModal();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 no-scrollbar border-t border-gray-800/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
