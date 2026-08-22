/**
 * GlobeTrotter Relational Schema Definition
 */

export const ENTITY_TYPES = {
  USERS: 'users',
  DESTINATIONS: 'destinations',
  ACTIVITIES: 'activities',
  TRIPS: 'trips',
  TRIP_STOPS: 'tripStops',
  TRIP_ACTIVITIES: 'tripActivities',
  TRIP_EXPENSES: 'tripExpenses',
  COMMUNITY_POSTS: 'communityPosts',
  SAVED_DESTINATIONS: 'savedDestinations',
};

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, label: 'GBP (£)' },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0, label: 'JPY (¥)' },
  INR: { code: 'INR', symbol: '₹', rate: 83.5, label: 'INR (₹)' },
};

export const ACTIVITY_CATEGORIES = [
  { id: 'sightseeing', label: 'Sightseeing', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  { id: 'food', label: 'Food & Dining', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'adventure', label: 'Adventure & Nature', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'culture', label: 'Culture & Arts', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'relaxation', label: 'Relaxation & Spa', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  { id: 'shopping', label: 'Shopping & Nightlife', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
];

export const EXPENSE_CATEGORIES = [
  { id: 'stay', label: 'Accommodation', color: '#6366f1', icon: 'Hotel' },
  { id: 'transport', label: 'Transportation', color: '#06b6d4', icon: 'Plane' },
  { id: 'activities', label: 'Activities & Excursions', color: '#10b981', icon: 'Ticket' },
  { id: 'meals', label: 'Food & Meals', color: '#f59e0b', icon: 'Utensils' },
  { id: 'other', label: 'Miscellaneous', color: '#ec4899', icon: 'ShoppingBag' },
];
