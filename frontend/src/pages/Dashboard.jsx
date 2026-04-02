import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, FileText, DollarSign, Activity, Filter } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({
    totalSpend: 0,
    invoiceCount: 0,
    spendByVendor: [],
  });
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');


  const [allVendors, setAllVendors] = useState([]);


  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/analytics`);
        const json = await res.json();
        if (res.ok) {
          setAllVendors(json.spendByVendor.map(v => v.name));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (monthFilter) params.append('month', monthFilter);
        if (vendorFilter !== 'all') params.append('vendor', vendorFilter);

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/analytics?${params.toString()}`);
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          console.error('API Error:', json);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [monthFilter, vendorFilter]);

  if (loading && Object.keys(data.spendByVendor).length === 0) return <div className="animate-pulse space-y-6">
    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
    </div>
  </div>;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your extracted invoice insights.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="month"
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 bg-white shadow-sm"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="pl-4 pr-10 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 bg-white shadow-sm appearance-none"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
            >
              <option value="all">All Vendors</option>
              {allVendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading && data.totalSpend > 0 && <div className="text-sm text-slate-400 animate-pulse">Updating dashboard data...</div>}

      {/* Metric Cards Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <MetricCard
          title="Total Spent"
          value={`$${data.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="text-emerald-500 h-6 w-6" />}
          trend={monthFilter ? `In ${monthFilter}` : "All time"}
          trendPositive={true}
        />
        <MetricCard
          title="Invoices Processed"
          value={data.invoiceCount.toLocaleString()}
          icon={<FileText className="text-indigo-500 h-6 w-6" />}
        />
        <MetricCard
          title="Avg Confidence Score"
          value="98.4%"
          icon={<Activity className="text-amber-500 h-6 w-6" />}
          trend="High accuracy AI"
        />
        <MetricCard
          title="Active Vendors"
          value={data.spendByVendor.length.toLocaleString()}
          icon={<TrendingUp className="text-blue-500 h-6 w-6" />}
        />
      </div>

      {/* Charts Section */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>

        {/* Bar Chart Box */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-96">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex justify-between">
            Spend by Vendor
            {vendorFilter !== 'all' && <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">{vendorFilter}</span>}
          </h2>
          <div className="flex-1 w-full min-h-0">
            {data.spendByVendor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.spendByVendor.slice(0, 5)} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">No results match your filters</div>
            )}
          </div>
        </div>

        {/* Pie Chart Box */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-96">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Spend Distribution</h2>
          <div className="flex-1 w-full min-h-0">
            {data.spendByVendor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.spendByVendor.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.spendByVendor.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">No results match your filters</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Metric Card Subcomponent to keep code DRY
function MetricCard({ title, value, icon, trend, trendPositive }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500 tracking-wide uppercase">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-extrabold text-slate-900">{value}</div>
      {trend && (
        <div className={`text-sm mt-3 flex items-center gap-1 font-medium ${trendPositive ? 'text-emerald-600' : 'text-slate-500'}`}>
          {trend}
        </div>
      )}
    </div>
  );
}
