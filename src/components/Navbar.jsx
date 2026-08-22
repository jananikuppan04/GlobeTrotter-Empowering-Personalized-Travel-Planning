import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  PieChart,
  Users,
  ShieldCheck,
  PlusCircle,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
  Globe,
  Briefcase,
  Sun,
  Moon,
} from 'lucide-react';
import { db } from '../db/store';
import { CURRENCIES } from '../db/schema';

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal, onOpenCreateTrip }) {
  const [currentUser, setCurrentUser] = useState(db.getCurrentUser());
  const [activeCurrency, setActiveCurrency] = useState(db.getActiveCurrency());
  const [theme, setTheme] = useState(db.getTheme());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setCurrentUser(db.getCurrentUser());
      setActiveCurrency(db.getActiveCurrency());
      setTheme(db.getTheme());
    });
    return unsubscribe;
  }, []);

  const handleToggleTheme = () => {
    const newTheme = db.toggleTheme();
    setTheme(newTheme);
  };

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
    <header className="sticky top-0 z-40 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border-color)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group shrink-0" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight gradient-text">GlobeTrotter</span>
              <span className="hidden sm:inline-block text-[9px] uppercase font-extrabold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-full border border-sky-500/20">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-color)] shadow-inner overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
                    isActive
                      ? item.highlight
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                        : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Create Trip CTA */}
            <button
              onClick={onOpenCreateTrip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 transition-all shadow-md shadow-indigo-500/25 active:scale-95 whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Plan New Trip</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="flex items-center justify-center p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500 transition-all shrink-0"
              title={`Switch Theme`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Currency Selector */}
            <div className="relative hidden md:flex items-center bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-2 py-1 text-xs shrink-0">
              <span className="text-[var(--text-muted)] font-bold mr-1">{activeCurrency.symbol}</span>
              <select
                value={activeCurrency.code}
                onChange={handleCurrencyChange}
                className="bg-transparent text-[var(--text-primary)] font-bold focus:outline-none cursor-pointer text-xs"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-[var(--bg-card)] transition-colors border border-transparent hover:border-[var(--border-color)]"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/50 shrink-0"
                  />
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[90px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[9px] text-[var(--text-muted)] capitalize">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden xl:block shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-[var(--border-color)]">
                      <p className="text-xs font-bold text-[var(--text-primary)]">{currentUser.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${currentUser.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
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
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>My Profile & Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('my-trips');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                      >
                        <Briefcase className="w-4 h-4 text-sky-400" />
                        <span>My Saved Trips</span>
                      </button>

                      <div className="px-4 py-1.5 text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Quick Demo Switcher
                      </div>
                      <button
                        onClick={() => handleQuickDemoSwitch('user')}
                        className={`w-full flex items-center justify-between px-4 py-1.5 text-xs ${
                          currentUser.role === 'user' ? 'text-indigo-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <span>Demo Traveler</span>
                        {currentUser.role === 'user' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                      </button>
                      <button
                        onClick={() => handleQuickDemoSwitch('admin')}
                        className={`w-full flex items-center justify-between px-4 py-1.5 text-xs ${
                          currentUser.role === 'admin' ? 'text-amber-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <span>Demo Admin</span>
                        {currentUser.role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                      </button>
                    </div>

                    <div className="border-t border-[var(--border-color)] pt-1">
                      <button
                        onClick={() => {
                          db.setCurrentUser(null);
                          onOpenAuthModal();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 font-bold"
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
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shrink-0"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 no-scrollbar border-t border-[var(--border-color)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
