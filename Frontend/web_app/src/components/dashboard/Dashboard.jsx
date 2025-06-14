import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, ShoppingCart, DollarSign, Activity, Eye, Clock, Target } from 'lucide-react';

export default function Dashboard() {
  const [activeUsers, setActiveUsers] = useState(1247);
  const [clients, setClients] = useState(89);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulate real-time user count updates
  useEffect(() => {
    const userInterval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
      setClients(prev => Math.max(0, prev + Math.floor(Math.random() * 2) - 1));
    }, 3000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(userInterval);
      clearInterval(timeInterval);
    };
  }, []);

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4200, orders: 45 },
    { month: 'Feb', revenue: 3800, orders: 38 },
    { month: 'Mar', revenue: 5200, orders: 52 },
    { month: 'Apr', revenue: 4800, orders: 48 },
    { month: 'May', revenue: 6200, orders: 62 },
    { month: 'Jun', revenue: 7800, orders: 78 },
  ];

  const userActivityData = [
    { day: 'Mon', users: 1200 },
    { day: 'Tue', users: 1100 },
    { day: 'Wed', users: 1400 },
    { day: 'Thu', users: 1300 },
    { day: 'Fri', users: 1600 },
    { day: 'Sat', users: 800 },
    { day: 'Sun', users: 900 },
  ];

  const pieData = [
    { name: 'Desktop', value: 45, color: '#3B82F6' },
    { name: 'Mobile', value: 35, color: '#10B981' },
    { name: 'Tablet', value: 20, color: '#F59E0B' },
  ];

  const topProducts = [
    { name: 'Premium Widget', sales: 234, revenue: 4680 },
    { name: 'Smart Device', sales: 187, revenue: 3740 },
    { name: 'Pro Package', sales: 156, revenue: 6240 },
    { name: 'Basic Kit', sales: 98, revenue: 1960 },
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, prefix = '', suffix = '' }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-green-200">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${color === 'text-blue-600' ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 
                                                 color === 'text-green-600' ? 'bg-gradient-to-br from-green-50 to-green-100' :
                                                 color === 'text-purple-600' ? 'bg-gradient-to-br from-purple-50 to-purple-100' :
                                                 'bg-gradient-to-br from-orange-50 to-orange-100'}`}>
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-800 mb-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <div className="flex items-center justify-end mt-3 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 mr-1" />
            {change}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-lg">Monitor your business performance and key metrics</p>
          </div>
          <div className="text-right bg-green-50 px-6 py-4 rounded-xl border">
            <p className="text-sm text-green-500 uppercase tracking-wider font-semibold mb-1">Current Time</p>
            <p className="text-xl font-bold text-gray-800 font-mono">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <StatCard
            title="Active Users"
            value={activeUsers}
            change="+12% from yesterday"
            icon={Users}
            color="text-orange-600"
          />
          <StatCard
            title="Total Clients"
            value={clients}
            change="+5 this week"
            icon={Target}
            color="text-blue-600"
          />
          <StatCard
            title="Monthly Revenue"
            value={7800}
            change="+25% from last month"
            icon={DollarSign}
            color="text-green-600"
            prefix="₹"
          />
          <StatCard
            title="Page Views"
            value="24.8K"
            change="+18% this week"
            icon={Eye}
            color="text-purple-600"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Revenue Trend</h2>
                  <p className="text-gray-600">Monthly performance overview</p>
                </div>
                <div className="flex items-center bg-gradient-to-r from-green-100 to-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="font-bold">+15.3%</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} fontWeight={500} />
                  <YAxis stroke="#6B7280" fontSize={12} fontWeight={500} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #D1D5DB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 500
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-25 rounded-xl border-l-4 border-green-400">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">New order #1234 received</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-25 rounded-xl border-l-4 border-emerald-400">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">Product "Premium Widget" restocked</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-teal-50 to-teal-25 rounded-xl border-l-4 border-teal-400">
                  <div className="w-3 h-3 bg-teal-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">Customer feedback received</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-cyan-50 to-cyan-25 rounded-xl border-l-4 border-cyan-400">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">Monthly report generated</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 - Top Products (1/3) and User Activity (2/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Products - Takes 1 column (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Top Products</h2>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-25 rounded-xl hover:from-green-50 hover:to-green-25 transition-all duration-300 border hover:border-green-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500 font-medium">{product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-lg">${product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Activity Chart - Takes 2 columns (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white p-7 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-5 ">Weekly User Activity</h2>
              <ResponsiveContainer width="100%" height={330}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={12} fontWeight={500} />
                  <YAxis stroke="#6B7280" fontSize={12} fontWeight={500} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #D1D5DB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 500
                    }} 
                  />
                  <Bar dataKey="users" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}