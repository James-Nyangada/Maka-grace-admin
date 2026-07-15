"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { api } from "@/lib/api";
import { 
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from "recharts";
import { 
  Globe, MessageSquare, CalendarCheck, DollarSign, ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [topPackages, setTopPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewRes, trafficRes, topPackagesRes] = await Promise.all([
          api.analytics.getOverview(),
          api.analytics.getTrafficVsConversions(),
          api.analytics.getTopPackages()
        ]);
        
        setOverview(overviewRes);
        setTrafficData(trafficRes.data);
        setTopPackages(topPackagesRes.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
        setError("Failed to load analytics data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num || 0);
  };

  const renderGrowthBadge = (growth) => {
    const isPositive = growth >= 0;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {Math.abs(growth || 0).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-10 w-48 bg-muted animate-pulse rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl"></div>
            ))}
          </div>
          <div className="h-24 bg-muted animate-pulse rounded-2xl"></div>
          <div className="h-96 bg-muted animate-pulse rounded-2xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 h-96 bg-muted animate-pulse rounded-2xl"></div>
            <div className="lg:col-span-2 h-96 bg-muted animate-pulse rounded-2xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getConversionStatus = (rate) => {
    if (rate >= 3) return { text: "Excellent", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" };
    if (rate >= 2) return { text: "Good", color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200" };
    if (rate >= 1) return { text: "Needs Attention", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" };
    return { text: "Critical", color: "text-rose-700", bg: "bg-rose-100", border: "border-rose-200" };
  };

  const conversionStatus = overview ? getConversionStatus(overview.conversionRate) : getConversionStatus(0);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {error && (
          <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200 mb-6">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Overview</h1>
            <p className="text-muted-foreground mt-1">Real-time performance metrics for your business</p>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl shadow-sm text-sm font-medium">
            <Activity className="w-4 h-4 text-primary" />
            <span>Last 30 Days</span>
          </div>
        </div>

        {overview && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Globe className="w-5 h-5" />
                  </div>
                  {renderGrowthBadge(overview.uniqueVisitors.growth)}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{formatNumber(overview.uniqueVisitors.current)}</h3>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  {renderGrowthBadge(overview.totalEnquiries.growth)}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Enquiries</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{formatNumber(overview.totalEnquiries.current)}</h3>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  {renderGrowthBadge(overview.confirmedBookings.growth)}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed Bookings</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{formatNumber(overview.confirmedBookings.current)}</h3>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  {renderGrowthBadge(overview.totalRevenue.growth)}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{formatCurrency(overview.totalRevenue.current)}</h3>
              </motion.div>
            </div>

            {/* Conversion Rate Banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-2xl p-6 sm:px-8 border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${conversionStatus.bg} ${conversionStatus.border}`}>
              <div>
                <h3 className={`text-lg font-bold ${conversionStatus.color}`}>Site Conversion Rate</h3>
                <p className={`text-sm opacity-80 ${conversionStatus.color}`}>(Enquiries + Bookings) ÷ Unique Visitors × 100</p>
              </div>
              <div className="flex items-center gap-6">
                <div className={`text-4xl sm:text-5xl font-black ${conversionStatus.color}`}>
                  {overview.conversionRate}%
                </div>
                <div className={`px-4 py-1.5 rounded-full font-bold text-sm bg-white/50 backdrop-blur-sm ${conversionStatus.color} shadow-sm border ${conversionStatus.border}`}>
                  {conversionStatus.text}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Chart Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground">Traffic vs. Conversions</h3>
            <p className="text-sm text-muted-foreground">Daily page views compared to enquiry submissions</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  dy={10}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area yAxisId="left" type="monotone" dataKey="pageViews" name="Page Views" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                <Area yAxisId="right" type="monotone" dataKey="enquiries" name="Enquiries" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorEnquiries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-3 bg-card rounded-2xl p-6 shadow-sm border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-6">Top Packages by Revenue</h3>
            <div className="h-[350px] w-full">
              {topPackages.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPackages} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#0D9488" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `$${val/1000}k`} />
                    <YAxis dataKey="packageName" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} width={100} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff' }}
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                    />
                    <Bar dataKey="totalRevenue" name="Revenue" fill="url(#colorRevenue)" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No package data available</div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-sm border border-border/50 overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-6">Leaderboard Details</h3>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-border text-muted-foreground font-medium">
                    <th className="pb-3 pl-2 w-8">#</th>
                    <th className="pb-3">Package</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right pr-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topPackages.length > 0 ? topPackages.map((pkg, idx) => (
                    <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 pl-2 text-muted-foreground font-medium">{idx + 1}</td>
                      <td className="py-3 font-medium text-foreground max-w-[120px] truncate" title={pkg.packageName}>
                        {pkg.packageName || 'Unknown'}
                      </td>
                      <td className="py-3 text-center text-muted-foreground">{pkg.totalBookings}</td>
                      <td className="py-3 text-right pr-2 font-semibold text-emerald-600">{formatCurrency(pkg.totalRevenue)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-muted-foreground">No sales data found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
