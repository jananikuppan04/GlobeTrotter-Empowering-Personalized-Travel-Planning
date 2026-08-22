/**
 * GlobeTrotter Database Store & State Management
 * Persistent relational store with pub/sub event subscription.
 */

import {
  SEED_USERS,
  SEED_DESTINATIONS,
  SEED_ACTIVITIES,
  SEED_TRIPS,
  SEED_TRIP_STOPS,
  SEED_TRIP_ACTIVITIES,
  SEED_TRIP_EXPENSES,
  SEED_COMMUNITY_POSTS,
} from './seedData';
import { CURRENCIES } from './schema';

const STORAGE_KEY = 'globetrotter_db_v1';

class DatabaseStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load storage, using seed data:', e);
    }
    return this.getInitialSeedState();
  }

  getInitialSeedState() {
    return {
      users: [...SEED_USERS],
      destinations: [...SEED_DESTINATIONS],
      activities: [...SEED_ACTIVITIES],
      trips: [...SEED_TRIPS],
      tripStops: [...SEED_TRIP_STOPS],
      tripActivities: [...SEED_TRIP_ACTIVITIES],
      tripExpenses: [...SEED_TRIP_EXPENSES],
      communityPosts: [...SEED_COMMUNITY_POSTS],
      savedDestinations: ['dest_paris', 'dest_tokyo'],
      currentUserId: 'usr_demo_1', // default demo user
      activeCurrency: 'USD',
      theme: 'dark', // 'dark' | 'light'
    };
  }

  getTheme() {
    return this.state.theme || 'dark';
  }

  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.state.theme = theme;
      this.saveToStorage();
    }
  }

  toggleTheme() {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    this.saveToStorage();
    return this.state.theme;
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  resetToSeed() {
    this.state = this.getInitialSeedState();
    this.saveToStorage();
  }

  // --- AUTHENTICATION & USER MANAGEMENT ---

  getCurrentUser() {
    return this.state.users.find((u) => u.id === this.state.currentUserId) || this.state.users[0];
  }

  setCurrentUser(userId) {
    if (this.state.users.some((u) => u.id === userId)) {
      this.state.currentUserId = userId;
      this.saveToStorage();
    }
  }

  login(email, password) {
    const user = this.state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      throw new Error('Invalid email or password');
    }
    this.state.currentUserId = user.id;
    this.saveToStorage();
    return user;
  }

  signup(userData) {
    const existing = this.state.users.find(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      email: userData.email,
      password: userData.password,
      name: `${userData.firstName} ${userData.lastName}`.trim() || 'Traveler',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      city: userData.city || '',
      country: userData.country || '',
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      bio: userData.bio || 'Excited traveler exploring the world!',
      role: 'user',
      currency: 'USD',
      createdAt: new Date().toISOString(),
    };

    this.state.users.push(newUser);
    this.state.currentUserId = newUser.id;
    this.saveToStorage();
    return newUser;
  }

  updateUserProfile(userId, updates) {
    const userIndex = this.state.users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      this.state.users[userIndex] = {
        ...this.state.users[userIndex],
        ...updates,
        name: updates.firstName && updates.lastName ? `${updates.firstName} ${updates.lastName}` : (updates.name || this.state.users[userIndex].name),
      };
      this.saveToStorage();
    }
  }

  // --- CURRENCY CONVERSION ---

  setCurrency(currencyCode) {
    if (CURRENCIES[currencyCode]) {
      this.state.activeCurrency = currencyCode;
      this.saveToStorage();
    }
  }

  getActiveCurrency() {
    return CURRENCIES[this.state.activeCurrency] || CURRENCIES.USD;
  }

  formatCurrency(amountUSD) {
    const currency = this.getActiveCurrency();
    const converted = amountUSD * currency.rate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 0,
    }).format(converted);
  }

  // --- DESTINATIONS & ACTIVITIES ---

  getDestinations() {
    return this.state.destinations;
  }

  getDestinationById(id) {
    return this.state.destinations.find((d) => d.id === id);
  }

  getActivities(destinationId = null) {
    if (destinationId) {
      return this.state.activities.filter((a) => a.destinationId === destinationId);
    }
    return this.state.activities;
  }

  getActivityById(id) {
    return this.state.activities.find((a) => a.id === id);
  }

  toggleSaveDestination(destinationId) {
    const index = this.state.savedDestinations.indexOf(destinationId);
    if (index >= 0) {
      this.state.savedDestinations.splice(index, 1);
    } else {
      this.state.savedDestinations.push(destinationId);
    }
    this.saveToStorage();
  }

  getSavedDestinations() {
    return this.state.savedDestinations.map((id) => this.getDestinationById(id)).filter(Boolean);
  }

  // --- TRIP RELATIONAL DATA & OPERATIONS ---

  getUserTrips(userId = this.state.currentUserId) {
    return this.state.trips
      .filter((t) => t.userId === userId)
      .map((t) => this.getTripWithDetails(t.id));
  }

  getTripWithDetails(tripId) {
    const trip = this.state.trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const stops = this.state.tripStops
      .filter((s) => s.tripId === tripId)
      .sort((a, b) => a.stopOrder - b.stopOrder)
      .map((stop) => {
        const destination = this.getDestinationById(stop.destinationId);
        const activities = this.state.tripActivities
          .filter((act) => act.stopId === stop.id)
          .sort((a, b) => a.dayNumber - b.dayNumber || a.startTime.localeCompare(b.startTime));
        const expenses = this.state.tripExpenses.filter((exp) => exp.stopId === stop.id);

        return {
          ...stop,
          destination,
          activities,
          expenses,
        };
      });

    const allExpenses = this.state.tripExpenses.filter((e) => e.tripId === tripId);
    const totalSpent = allExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const user = this.state.users.find((u) => u.id === trip.userId);

    return {
      ...trip,
      user,
      stops,
      expenses: allExpenses,
      totalSpent,
      destinationNames: stops.map((s) => s.destination?.name).filter(Boolean).join(', '),
      destinationCount: stops.length,
    };
  }

  createTrip({ title, description, coverImage, startDate, endDate, totalBudget, isPublic = true, selectedDestinations = [] }) {
    const tripId = `trip_${Date.now()}`;
    const user = this.getCurrentUser();

    const newTrip = {
      id: tripId,
      userId: user.id,
      title: title || 'New Travel Plan',
      description: description || 'Exciting multi-city journey',
      coverImage: coverImage || (selectedDestinations[0] ? this.getDestinationById(selectedDestinations[0])?.image : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80'),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      totalBudget: Number(totalBudget) || 1500,
      status: 'upcoming',
      isPublic: Boolean(isPublic),
      shareId: `sh_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString(),
    };

    this.state.trips.unshift(newTrip);

    // Create stops for selected destinations
    selectedDestinations.forEach((destId, idx) => {
      const stopId = `stop_${tripId}_${idx + 1}`;
      this.state.tripStops.push({
        id: stopId,
        tripId,
        destinationId: destId,
        stopOrder: idx + 1,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        estimatedBudget: Math.round(newTrip.totalBudget / (selectedDestinations.length || 1)),
      });

      // Pre-add 1-2 activities for convenience
      const destActivities = this.getActivities(destId);
      if (destActivities.length > 0) {
        this.state.tripActivities.push({
          id: `act_item_${Date.now()}_${idx}`,
          stopId,
          activityId: destActivities[0].id,
          customTitle: destActivities[0].name,
          dayNumber: 1,
          startTime: '10:00',
          cost: destActivities[0].cost,
          category: destActivities[0].category,
          notes: destActivities[0].description,
          status: 'planned',
        });
      }
    });

    // Create community post if public
    if (newTrip.isPublic) {
      this.state.communityPosts.unshift({
        id: `post_${tripId}`,
        tripId,
        userId: user.id,
        likes: 1,
        copiesCount: 0,
        commentsCount: 0,
        tags: [selectedDestinations[0] ? this.getDestinationById(selectedDestinations[0])?.name : 'Adventure'],
        createdAt: new Date().toISOString(),
      });
    }

    this.saveToStorage();
    return this.getTripWithDetails(tripId);
  }

  updateTrip(tripId, updates) {
    const idx = this.state.trips.findIndex((t) => t.id === tripId);
    if (idx !== -1) {
      this.state.trips[idx] = { ...this.state.trips[idx], ...updates };
      this.saveToStorage();
    }
  }

  deleteTrip(tripId) {
    this.state.trips = this.state.trips.filter((t) => t.id !== tripId);
    this.state.tripStops = this.state.tripStops.filter((s) => s.tripId !== tripId);
    this.state.tripExpenses = this.state.tripExpenses.filter((e) => e.tripId !== tripId);
    this.state.communityPosts = this.state.communityPosts.filter((p) => p.tripId !== tripId);
    this.saveToStorage();
  }

  addStopToTrip(tripId, { destinationId, startDate, endDate, estimatedBudget }) {
    const existingStops = this.state.tripStops.filter((s) => s.tripId === tripId);
    const stopId = `stop_${Date.now()}`;
    const newStop = {
      id: stopId,
      tripId,
      destinationId,
      stopOrder: existingStops.length + 1,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      estimatedBudget: Number(estimatedBudget) || 500,
    };
    this.state.tripStops.push(newStop);
    this.saveToStorage();
    return newStop;
  }

  deleteStop(stopId) {
    this.state.tripStops = this.state.tripStops.filter((s) => s.id !== stopId);
    this.state.tripActivities = this.state.tripActivities.filter((a) => a.stopId !== stopId);
    this.state.tripExpenses = this.state.tripExpenses.filter((e) => e.stopId !== stopId);
    this.saveToStorage();
  }

  addActivityToStop(stopId, { activityId, customTitle, dayNumber = 1, startTime = '09:00', cost = 0, category = 'sightseeing', notes = '' }) {
    const activityItem = {
      id: `act_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      stopId,
      activityId,
      customTitle: customTitle || 'Custom Activity',
      dayNumber: Number(dayNumber) || 1,
      startTime: startTime || '09:00',
      cost: Number(cost) || 0,
      category,
      notes,
      status: 'planned',
    };
    this.state.tripActivities.push(activityItem);
    this.saveToStorage();
    return activityItem;
  }

  deleteActivity(activityItemId) {
    this.state.tripActivities = this.state.tripActivities.filter((a) => a.id !== activityItemId);
    this.saveToStorage();
  }

  addExpense(tripId, { stopId, category, amount, date, description }) {
    const newExpense = {
      id: `exp_${Date.now()}`,
      tripId,
      stopId: stopId || null,
      category: category || 'other',
      amount: Number(amount) || 0,
      date: date || new Date().toISOString().split('T')[0],
      description: description || 'Expense',
    };
    this.state.tripExpenses.push(newExpense);
    this.saveToStorage();
    return newExpense;
  }

  deleteExpense(expenseId) {
    this.state.tripExpenses = this.state.tripExpenses.filter((e) => e.id !== expenseId);
    this.saveToStorage();
  }

  // --- COMMUNITY & COPY TRIP ---

  getCommunityPosts() {
    return this.state.communityPosts.map((post) => {
      const trip = this.getTripWithDetails(post.tripId);
      const user = this.state.users.find((u) => u.id === post.userId);
      return {
        ...post,
        trip,
        user,
      };
    }).filter((p) => p.trip);
  }

  likePost(postId) {
    const post = this.state.communityPosts.find((p) => p.id === postId);
    if (post) {
      post.likes += 1;
      this.saveToStorage();
    }
  }

  copyTripToUser(sourceTripId, targetUserId = this.state.currentUserId) {
    const sourceTrip = this.getTripWithDetails(sourceTripId);
    if (!sourceTrip) throw new Error('Source trip not found');

    const newTripId = `trip_copied_${Date.now()}`;
    const newTrip = {
      id: newTripId,
      userId: targetUserId,
      title: `${sourceTrip.title} (Copy)`,
      description: sourceTrip.description,
      coverImage: sourceTrip.coverImage,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      totalBudget: sourceTrip.totalBudget,
      status: 'upcoming',
      isPublic: false,
      shareId: `sh_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString(),
    };

    this.state.trips.unshift(newTrip);

    // Copy stops & activities
    sourceTrip.stops.forEach((sourceStop, idx) => {
      const newStopId = `stop_${newTripId}_${idx + 1}`;
      this.state.tripStops.push({
        id: newStopId,
        tripId: newTripId,
        destinationId: sourceStop.destinationId,
        stopOrder: sourceStop.stopOrder,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        estimatedBudget: sourceStop.estimatedBudget,
      });

      sourceStop.activities.forEach((act) => {
        this.state.tripActivities.push({
          id: `act_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          stopId: newStopId,
          activityId: act.activityId,
          customTitle: act.customTitle,
          dayNumber: act.dayNumber,
          startTime: act.startTime,
          cost: act.cost,
          category: act.category,
          notes: act.notes,
          status: 'planned',
        });
      });
    });

    // Increment copy count on community post
    const post = this.state.communityPosts.find((p) => p.tripId === sourceTripId);
    if (post) {
      post.copiesCount = (post.copiesCount || 0) + 1;
    }

    this.saveToStorage();
    return this.getTripWithDetails(newTripId);
  }

  // --- ADMIN ANALYTICS ---

  getAdminStats() {
    const totalUsers = this.state.users.length;
    const totalTrips = this.state.trips.length;
    const totalBudget = this.state.trips.reduce((sum, t) => sum + Number(t.totalBudget || 0), 0);
    const totalCommunityCopies = this.state.communityPosts.reduce((sum, p) => sum + Number(p.copiesCount || 0), 0);

    // Top cities calculation
    const cityCounts = {};
    this.state.tripStops.forEach((stop) => {
      const dest = this.getDestinationById(stop.destinationId);
      if (dest) {
        cityCounts[dest.name] = (cityCounts[dest.name] || 0) + 1;
      }
    });

    const topCities = Object.entries(cityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top activities
    const actCounts = {};
    this.state.tripActivities.forEach((act) => {
      const title = act.customTitle;
      actCounts[title] = (actCounts[title] || 0) + 1;
    });

    const topActivities = Object.entries(actCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Monthly trends mock data
    const monthlyTrends = [
      { month: 'Jan', trips: 12, users: 8 },
      { month: 'Feb', trips: 18, users: 14 },
      { month: 'Mar', trips: 25, users: 20 },
      { month: 'Apr', trips: 32, users: 29 },
      { month: 'May', trips: 45, users: 38 },
      { month: 'Jun', trips: 60, users: 50 },
    ];

    return {
      totalUsers,
      totalTrips,
      totalBudget,
      totalCommunityCopies,
      topCities,
      topActivities,
      monthlyTrends,
      users: this.state.users,
    };
  }

  toggleUserRole(userId) {
    const user = this.state.users.find((u) => u.id === userId);
    if (user) {
      user.role = user.role === 'admin' ? 'user' : 'admin';
      this.saveToStorage();
    }
  }
}

export const db = new DatabaseStore();
