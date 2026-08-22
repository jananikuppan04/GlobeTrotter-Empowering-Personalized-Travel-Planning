import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Briefcase, MapPin, Sparkles, TrendingUp, UserCheck, ShieldAlert, Award } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { db } from '../db/store';

export default function AdminAnalyticsScreen() {
  const [stats, setStats] = useState(db.getAdminStats());

  useEffect(() => {
    const update = () => setStats(db.getAdminStats());
    update();
    return db.subscribe(update);
  }, []);

  const handleToggleUserRole = (userId) => {
    db.toggleUserRole(userId);
  };

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-gray-900 to-gray-950 p-6 rounded-3xl border border-amber-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>Admin & Analytics Control Center</span>
            </h1>
            <p className="text-xs text-gray-300">
              Platform usage trends, user management, popular destinations, and itinerary stats.
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 self-start sm:self-auto">
          ADMIN ACCESS ACTIVE
        </span>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase">Total Users</span>
          <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase">Trips Created</span>
          <p className="text-3xl font-black text-sky-400">{stats.totalTrips}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase">Total Budget Tracked</span>
          <p className="text-3xl font-black text-emerald-400">{db.formatCurrency(stats.totalBudget)}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase">Community Trip Copies</span>
          <p className="text-3xl font-black text-amber-400">{stats.totalCommunityCopies}</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Platform Growth Area Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>User Growth & Trip Creation Trends</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="trips" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Trips Created" />
                <Area type="monotone" dataKey="users" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Cities Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            <span>Top Visited Cities Share</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topCities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#38bdf8" radius={[0, 8, 8, 0]} name="Stops Added" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* User Management & Popular Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Management Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Platform User Directory ({stats.users.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {stats.users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-950/40">
                    <td className="p-3 flex items-center gap-2.5 font-bold text-white">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3 text-gray-400">{u.email}</td>
                    <td className="p-3 text-sky-400 font-medium">{u.city || u.country || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleUserRole(u.id)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                      >
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Activities Leaderboard */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Top Activities Leaderboard</span>
          </h3>

          <div className="space-y-3">
            {stats.topActivities.map((act, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-gray-950 border border-gray-800/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-bold text-white truncate">{act.title}</span>
                </div>
                <span className="text-xs font-bold text-sky-400 flex-shrink-0 ml-2">{act.count} Times</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
