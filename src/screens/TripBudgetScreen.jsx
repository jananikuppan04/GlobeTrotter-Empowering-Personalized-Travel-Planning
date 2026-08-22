import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  DollarSign,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  TrendingUp,
  Receipt,
  Hotel,
  Plane,
  Ticket,
  Utensils,
  ShoppingBag,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { db } from '../db/store';
import { EXPENSE_CATEGORIES } from '../db/schema';

export default function TripBudgetScreen({ tripId, onBack }) {
  const [userTrips, setUserTrips] = useState(db.getUserTrips());
  const [selectedTripId, setSelectedTripId] = useState(tripId || (userTrips[0]?.id || ''));

  // Expense form
  const [expCategory, setExpCategory] = useState('stay');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const update = () => {
      const trips = db.getUserTrips();
      setUserTrips(trips);
      if (!selectedTripId && trips.length > 0) {
        setSelectedTripId(trips[0].id);
      }
    };
    update();
    return db.subscribe(update);
  }, []);

  const currentTrip = db.getTripWithDetails(selectedTripId);

  if (!currentTrip) {
    return (
      <div className="p-8 text-center text-gray-400 space-y-3">
        <p>No trip selected or available for budget analysis.</p>
        {onBack && (
          <button onClick={onBack} className="text-indigo-400 font-bold text-xs underline">
            Back to Trips
          </button>
        )}
      </div>
    );
  }

  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expAmount) return;

    db.addExpense(currentTrip.id, {
      stopId: currentTrip.stops[0]?.id || null,
      category: expCategory,
      amount: expAmount,
      date: expDate,
      description: expDesc || 'Expense',
    });

    setExpAmount('');
    setExpDesc('');
  };

  const handleDeleteExpense = (expId) => {
    db.deleteExpense(expId);
  };

  // Calculate Category Breakdowns for Recharts
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => {
    const total = currentTrip.expenses
      .filter((e) => e.category === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      name: cat.label,
      value: total,
      color: cat.color,
    };
  }).filter((item) => item.value > 0);

  // Daily spend calculation
  const dailySpentMap = {};
  currentTrip.expenses.forEach((e) => {
    const d = e.date || 'Unspecified';
    dailySpentMap[d] = (dailySpentMap[d] || 0) + Number(e.amount);
  });

  const barData = Object.entries(dailySpentMap).map(([date, amount]) => ({
    date,
    Amount: amount,
  }));

  const isOverBudget = currentTrip.totalSpent > currentTrip.totalBudget;
  const budgetVariance = currentTrip.totalBudget - currentTrip.totalSpent;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-5 rounded-3xl border border-gray-800 backdrop-blur-md">
        
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <PieIcon className="w-6 h-6 text-emerald-400" />
              <span>Trip Budget & Expense Hub</span>
            </h1>
            <p className="text-xs text-gray-400">Financial breakdowns, cost allocations, and live budget tracking</p>
          </div>
        </div>

        {/* Trip Picker Selector */}
        <div className="flex items-center gap-2 bg-gray-950 px-3 py-2 border border-gray-800 rounded-xl text-xs">
          <span className="text-gray-400 font-bold">Select Trip:</span>
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            {userTrips.map((t) => (
              <option key={t.id} value={t.id} className="bg-gray-900">
                {t.title} ({db.formatCurrency(t.totalBudget)})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Overbudget Warning Alert */}
      {isOverBudget && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs font-bold animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <span>OVER BUDGET ALERT! You have exceeded your target budget by {db.formatCurrency(Math.abs(budgetVariance))}.</span>
            <p className="text-[11px] font-normal text-rose-300/80">Review category breakdowns below to adjust activities or stay costs.</p>
          </div>
        </div>
      )}

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase">Target Trip Budget</span>
          <p className="text-2xl font-black text-white">{db.formatCurrency(currentTrip.totalBudget)}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase">Total Expenses Logged</span>
          <p className="text-2xl font-black text-emerald-400">{db.formatCurrency(currentTrip.totalSpent)}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase">Remaining Variance</span>
          <p className={`text-2xl font-black ${budgetVariance < 0 ? 'text-rose-400' : 'text-sky-400'}`}>
            {db.formatCurrency(budgetVariance)}
          </p>
        </div>
      </div>

      {/* Charts Row: Pie Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown Pie Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-400" />
            <span>Category Spending Breakdown</span>
          </h3>

          {categoryTotals.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => db.formatCurrency(val)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-gray-400">
              No expense data recorded yet.
            </div>
          )}
        </div>

        {/* Daily Spend Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Daily Expense Timeline</span>
          </h3>

          {barData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    formatter={(val) => db.formatCurrency(val)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="Amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-gray-400">
              Log daily expenses to visualize spend velocity over time.
            </div>
          )}
        </div>

      </div>

      {/* Log New Expense & Expense History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expense Entry Form */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-sky-400" />
            <span>Log Custom Expense</span>
          </h3>

          <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Expense Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Hotel Stay, Airline Tickets, Dinner"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Amount (USD)</label>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="150"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Date</label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </form>
        </div>

        {/* Expense Log Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-base font-extrabold text-white">Expense History ({currentTrip.expenses.length} records)</h3>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {currentTrip.expenses.map((exp) => {
                  const cat = EXPENSE_CATEGORIES.find((c) => c.id === exp.category) || EXPENSE_CATEGORIES[4];
                  return (
                    <tr key={exp.id} className="hover:bg-gray-950/40">
                      <td className="p-3 font-semibold text-white">{exp.description}</td>
                      <td className="p-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">{exp.date}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        {db.formatCurrency(exp.amount)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
