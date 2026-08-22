import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import DashboardScreen from './screens/DashboardScreen';
import CreateTripModal from './screens/CreateTripModal';
import MyTripsScreen from './screens/MyTripsScreen';
import ItineraryBuilderScreen from './screens/ItineraryBuilderScreen';
import CitySearchScreen from './screens/CitySearchScreen';
import ActivitySearchScreen from './screens/ActivitySearchScreen';
import TripBudgetScreen from './screens/TripBudgetScreen';
import TripCalendarScreen from './screens/TripCalendarScreen';
import CommunityScreen from './screens/CommunityScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import AdminAnalyticsScreen from './screens/AdminAnalyticsScreen';
import { db } from './db/store';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTripId, setActiveTripId] = useState(null);
  const [theme, setTheme] = useState(db.getTheme());
  
  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [createTripInitialCityId, setCreateTripInitialCityId] = useState(null);

  useEffect(() => {
    // Sync theme with body element
    document.body.className = `${db.getTheme()}-theme min-h-screen font-sans transition-colors duration-300`;

    const unsubscribe = db.subscribe(() => {
      const currentTheme = db.getTheme();
      setTheme(currentTheme);
      document.body.className = `${currentTheme}-theme min-h-screen font-sans transition-colors duration-300`;
    });

    // Check for shared URL query param
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      setActiveTab('community');
    }

    return unsubscribe;
  }, []);

  const handleOpenCreateTrip = (initialCityId = null) => {
    setCreateTripInitialCityId(initialCityId);
    setIsCreateTripOpen(true);
  };

  const handleViewTrip = (tripId) => {
    setActiveTripId(tripId);
    setActiveTab('itinerary');
  };

  const handleOpenBudget = (tripId) => {
    setActiveTripId(tripId);
    setActiveTab('budget');
  };

  const handleOpenCalendar = (tripId) => {
    setActiveTripId(tripId);
    setActiveTab('calendar');
  };

  const handleShareTrip = (trip) => {
    const url = `${window.location.origin}?share=${trip.shareId || 'sh_demo'}`;
    navigator.clipboard.writeText(url);
    alert(`Public itinerary link copied to clipboard!\n${url}`);
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white ${theme}-theme`}>
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenCreateTrip={() => handleOpenCreateTrip()}
      />

      {/* Main Screen Router Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <DashboardScreen
            setActiveTab={setActiveTab}
            onOpenCreateTrip={handleOpenCreateTrip}
            onViewTrip={handleViewTrip}
            onOpenBudget={handleOpenBudget}
            onOpenCalendar={handleOpenCalendar}
            onShareTrip={handleShareTrip}
          />
        )}

        {activeTab === 'my-trips' && (
          <MyTripsScreen
            onOpenCreateTrip={handleOpenCreateTrip}
            onViewTrip={handleViewTrip}
            onOpenBudget={handleOpenBudget}
            onOpenCalendar={handleOpenCalendar}
            onShareTrip={handleShareTrip}
          />
        )}

        {activeTab === 'itinerary' && (
          <ItineraryBuilderScreen
            tripId={activeTripId || db.getUserTrips()[0]?.id}
            onBack={() => setActiveTab('my-trips')}
            onOpenBudget={handleOpenBudget}
            onOpenCalendar={handleOpenCalendar}
            onShareTrip={handleShareTrip}
          />
        )}

        {activeTab === 'cities' && (
          <CitySearchScreen onOpenCreateTrip={handleOpenCreateTrip} />
        )}

        {activeTab === 'activities' && (
          <ActivitySearchScreen onOpenCreateTrip={handleOpenCreateTrip} />
        )}

        {activeTab === 'budget' && (
          <TripBudgetScreen
            tripId={activeTripId || db.getUserTrips()[0]?.id}
            onBack={() => setActiveTab('my-trips')}
          />
        )}

        {activeTab === 'calendar' && (
          <TripCalendarScreen onViewTrip={handleViewTrip} />
        )}

        {activeTab === 'community' && (
          <CommunityScreen
            onViewTrip={handleViewTrip}
            onTripCreated={(newTripId) => {
              setActiveTripId(newTripId);
              setActiveTab('itinerary');
            }}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileScreen onOpenCreateTrip={handleOpenCreateTrip} />
        )}

        {activeTab === 'admin' && <AdminAnalyticsScreen />}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {}}
      />

      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        initialDestinationId={createTripInitialCityId}
        onTripCreated={(newTripId) => {
          setActiveTripId(newTripId);
          setActiveTab('itinerary');
        }}
      />

      {/* Footer */}
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-color)] py-8 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-[var(--text-muted)] space-y-2">
          <p className="font-bold text-[var(--text-secondary)]">GlobeTrotter — Empowering Personalized Travel Planning</p>
          <p>© 2026 GlobeTrotter Inc. Crafted for multi-city travel excellence.</p>
        </div>
      </footer>

    </div>
  );
}
