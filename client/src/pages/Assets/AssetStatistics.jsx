import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Package, Users, Wrench, AlertCircle, CheckCircle, 
  BarChart3, TrendingUp, TrendingDown, PieChart,
  Calendar, DollarSign, Activity, Zap, ArrowLeft
} from 'lucide-react';
import { fetchAssetStatistics } from '../../redux/slices/assetSlice';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const AssetStatistics = () => {
  const dispatch = useDispatch();
  const { statistics, loading } = useSelector((state) => state.assets);
  const { user } = useSelector((state) => state.auth);

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (isAdminOrManager) {
      dispatch(fetchAssetStatistics());
    }
  }, [dispatch, isAdminOrManager]);

  if (!isAdminOrManager) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to view statistics.</p>
          <Link to="/assets" className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-xl">
            Go to Assets
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading statistics...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const categoryChartData = {
    labels: statistics?.byCategory?.map(cat => cat._id) || [],
    datasets: [
      {
        data: statistics?.byCategory?.map(cat => cat.count) || [],
        backgroundColor: [
          '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
          '#f97316', '#f59e0b', '#84cc16', '#10b981', 
          '#14b8a6', '#06b6d4', '#3b82f6'
        ],
        borderWidth: 0,
      },
    ],
  };

  const monthlyGrowthData = {
    labels: statistics?.monthlyGrowth?.map(item => `${item._id.month}/${item._id.year}`).reverse() || [],
    datasets: [
      {
        label: 'Assets Added',
        data: statistics?.monthlyGrowth?.map(item => item.count).reverse() || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const statusData = {
    labels: ['Assigned', 'Available', 'Maintenance', 'Damaged'],
    datasets: [
      {
        data: [
          statistics?.assigned || 0,
          statistics?.available || 0,
          statistics?.maintenance || 0,
          statistics?.damaged || 0,
        ],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const statsCards = [
    {
      title: 'Total Assets',
      value: statistics?.total || 0,
      icon: Package,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Assigned Assets',
      value: statistics?.assigned || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Available Assets',
      value: statistics?.available || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      trend: '-2%',
      trendUp: false
    },
    {
      title: 'Under Maintenance',
      value: statistics?.maintenance || 0,
      icon: Wrench,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      trend: '+3%',
      trendUp: true
    },
    {
      title: 'Damaged Assets',
      value: statistics?.damaged || 0,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      trend: '-1%',
      trendUp: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/assets" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Assets</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Asset Statistics</h1>
              <p className="text-gray-500 mt-1">Comprehensive analytics and insights</p>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-sm text-gray-500">Last 30 days</span>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon size={20} className={stat.textColor} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution - Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <PieChart size={20} className="mr-2 text-indigo-600" />
                Assets by Category
              </h3>
              <span className="text-xs text-gray-400">Distribution</span>
            </div>
            <div className="h-80">
              {statistics?.byCategory?.length > 0 ? (
                <Pie data={categoryChartData} options={{ maintainAspectRatio: false, responsive: true }} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Distribution - Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Activity size={20} className="mr-2 text-indigo-600" />
                Assets by Status
              </h3>
              <span className="text-xs text-gray-400">Current Status</span>
            </div>
            <div className="h-80">
              <Bar 
                data={statusData} 
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Monthly Growth - Line Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <TrendingUp size={20} className="mr-2 text-indigo-600" />
              Monthly Asset Growth
            </h3>
            <span className="text-xs text-gray-400">Last 12 months</span>
          </div>
          <div className="h-80">
            {statistics?.monthlyGrowth?.length > 0 ? (
              <Line 
                data={monthlyGrowthData} 
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' }
                  }
                }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign size={24} />
              <Zap size={20} className="opacity-75" />
            </div>
            <p className="text-3xl font-bold">${(statistics?.total * 500).toLocaleString()}</p>
            <p className="text-sm opacity-90 mt-1">Total Asset Value</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs opacity-75">Estimated based on average asset value</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle size={24} />
              <Activity size={20} className="opacity-75" />
            </div>
            <p className="text-3xl font-bold">{Math.round((statistics?.available / statistics?.total) * 100) || 0}%</p>
            <p className="text-sm opacity-90 mt-1">Asset Utilization Rate</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs opacity-75">{statistics?.available} out of {statistics?.total} assets available</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Wrench size={24} />
              <Calendar size={20} className="opacity-75" />
            </div>
            <p className="text-3xl font-bold">{statistics?.maintenance || 0}</p>
            <p className="text-sm opacity-90 mt-1">Pending Maintenance</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs opacity-75">Assets requiring attention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetStatistics; // Make sure this line exists!