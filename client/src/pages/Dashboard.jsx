// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Package, Users, LogOut, Bell, Search, Menu, 
  X, ChevronRight, TrendingUp, Server, UserCheck, Wrench, FileText,
  Home, BarChart3, ChevronDown, ArrowLeftRight, MapPin, Phone, Mail,
  ArrowRight, Shield, Cloud, Cpu, Zap, Building2, Globe, Sun, Moon,
  UserCircle
} from 'lucide-react';
import { logout } from '../redux/slices/authslice'; // ✅ Import logout thunk

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch(); // ✅ Initialize dispatch
  
  // Get user from Redux
  const { user: reduxUser, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Maintenance Due', message: '3 assets require maintenance', time: '2 hours ago', read: false, type: 'warning' },
    { id: 2, title: 'New Asset Assigned', message: 'Laptop assigned to John Doe', time: '5 hours ago', read: false, type: 'info' },
    { id: 3, title: 'Warranty Expiring', message: '5 assets warranty expiring soon', time: '1 day ago', read: true, type: 'alert' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Set user from Redux when available
  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
    } else {
      // Fallback to localStorage if Redux doesn't have user
      try {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userData && userData !== 'undefined' && userData !== 'null') {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [reduxUser]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Real‑time notifications (simulated)
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        title: 'Real-time Update',
        message: `System check at ${new Date().toLocaleTimeString()}`,
        time: 'just now',
        read: false,
        type: 'info',
      };
      setNotifications(prev => [newNotification, ...prev]);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ✅ FIXED: Proper logout with Redux dispatch
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    setIsLoggingOut(true);
    try {
      // Dispatch the logout action from Redux
      await dispatch(logout()).unwrap();
      // The logout action handles clearing storage and showing toast
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear storage manually and navigate
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Navigate to the logged‑in user's Employee Details page
  const goToMyProfile = () => {
    const userId = user._id || user.id;
    if (userId) {
      navigate(`/employees/${userId}`);
    } else {
      console.warn('User ID not found');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (will redirect via useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Dashboard static data
  const stats = [
    { title: 'Total Assets', value: '1,284', change: '+12%', trend: 'up', icon: Server, color: '#6366f1', bgGradient: 'from-indigo-500/10 to-indigo-600/5', borderColor: 'border-indigo-500/20' },
    { title: 'Active Employees', value: '342', change: '+5%', trend: 'up', icon: Users, color: '#10b981', bgGradient: 'from-emerald-500/10 to-emerald-600/5', borderColor: 'border-emerald-500/20' },
    { title: 'Assets in Use', value: '892', change: '+8%', trend: 'up', icon: UserCheck, color: '#f59e0b', bgGradient: 'from-amber-500/10 to-amber-600/5', borderColor: 'border-amber-500/20' },
    { title: 'Maintenance Pending', value: '23', change: '-3%', trend: 'down', icon: Wrench, color: '#ef4444', bgGradient: 'from-red-500/10 to-red-600/5', borderColor: 'border-red-500/20' },
  ];

  const recentActivities = [
    { id: 1, action: 'Asset Assigned', user: 'John Smith', asset: 'Dell XPS Laptop', time: '10 minutes ago', icon: Package, color: '#6366f1' },
    { id: 2, action: 'Maintenance Completed', user: 'Tech Team', asset: 'HP Printer', time: '1 hour ago', icon: Wrench, color: '#10b981' },
    { id: 3, action: 'New Asset Added', user: 'Admin', asset: 'MacBook Pro', time: '3 hours ago', icon: Server, color: '#f59e0b' },
    { id: 4, action: 'Asset Returned', user: 'Sarah Johnson', asset: 'iPhone 14', time: '5 hours ago', icon: Users, color: '#ef4444' },
  ];

  const topAssets = [
    { name: 'Dell XPS 15', usage: '98%', status: 'Active', department: 'Engineering', assignee: 'John Doe' },
    { name: 'HP LaserJet', usage: '87%', status: 'Active', department: 'Operations', assignee: 'Common Area' },
    { name: 'MacBook Pro', usage: '76%', status: 'Maintenance', department: 'Design', assignee: 'Sarah Smith' },
    { name: 'iPhone 14', usage: '92%', status: 'Active', department: 'Sales', assignee: 'Mike Johnson' },
  ];

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Assets', icon: Package, path: '/assets' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Allocations', icon: ArrowLeftRight, path: '/allocations' },
    { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { name: 'Reports', icon: FileText, path: '/reports' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  ];

  // Get user's display name safely
  const displayName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const userInitial = user?.name?.charAt(0) || user?.email?.charAt(0) || 'U';
  const userRole = user?.role || 'Employee';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50'
    }`}>
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${darkMode ? 'bg-gray-800 shadow-xl' : 'bg-white shadow-2xl'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            {sidebarOpen ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  AssetHub
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
                <Package className="w-4 h-4 text-white" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isCurrent = location.pathname === item.path;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 group ${
                        isCurrent
                          ? darkMode
                            ? 'bg-gray-700 text-indigo-400'
                            : 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600'
                          : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-indigo-400'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                      }`}
                    >
                      <item.icon size={20} className="flex-shrink-0" />
                      {sidebarOpen && <span className="font-medium">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className={`border-t p-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-3 w-full p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                disabled={isLoggingOut}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold shadow-md">
                  {userInitial}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {displayName}
                      </p>
                      <p className={`text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {userRole}
                      </p>
                    </div>
                    <ChevronDown size={16} className={darkMode ? 'text-gray-400' : 'text-gray-400'} />
                  </>
                )}
              </button>
              
              {showUserMenu && (
                <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} py-2`}>
                  <button
                    onClick={goToMyProfile}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    disabled={isLoggingOut}
                  >
                    <UserCircle size={16} />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`flex items-center space-x-2 w-full px-4 py-2 transition-colors ${
                      isLoggingOut 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                    }`}
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={16} />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Navbar */}
        <nav className={`sticky top-0 z-40 backdrop-blur-md border-b ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'} w-4 h-4`} />
                  <input
                    type="text"
                    placeholder="Search assets, employees..."
                    className={`pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500'
                        : 'bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400 focus:border-indigo-300'
                    }`}
                  />
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Bell size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Notifications</h3>
                          <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                            Mark all as read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.slice(0, 10).map((notif) => (
                          <div key={notif.id} className={`p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-50 hover:bg-gray-50'} transition-colors`}>
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 mt-2 rounded-full ${
                                notif.type === 'warning' ? 'bg-yellow-500' :
                                notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{notif.title}</p>
                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{notif.message}</p>
                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{notif.time}</p>
                              </div>
                              {!notif.read && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar */}
                <button
                  onClick={goToMyProfile}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-label="My Profile"
                  disabled={isLoggingOut}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {userInitial}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Welcome back, {displayName}!
            </h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              Here's what's happening with your assets today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className={`rounded-2xl border p-6 hover:shadow-xl transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : `bg-white ${stat.borderColor}`
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.bgGradient} flex items-center justify-center`}>
                    <stat.icon size={24} style={{ color: stat.color }} />
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</span>
                    <div className={`flex items-center text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'} mt-1`}>
                      {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                    </div>
                  </div>
                </div>
                <h3 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stat.title}</h3>
              </div>
            ))}
          </div>

          {/* Recent Activity & Top Assets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className={`rounded-2xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Activity</h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center">
                    View All <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className={`flex items-center justify-between py-3 border-b last:border-0 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <activity.icon size={18} style={{ color: activity.color }} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {activity.action}: <span className="font-semibold">{activity.asset}</span>
                          </p>
                          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            by {activity.user} • {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`rounded-2xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Top Assets by Usage</h3>
                <TrendingUp size={18} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
              </div>
              <div className="space-y-4">
                {topAssets.map((asset, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{asset.name}</span>
                      <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{asset.usage}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: asset.usage }}></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{asset.department}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        asset.status === 'Active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`mt-6 rounded-2xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <button onClick={() => navigate('/assets')} className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl text-left hover:shadow-md transition-all duration-300">
                <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">View Assets</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage your inventory</p>
              </button>
              <button onClick={() => navigate('/employees')} className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl text-left hover:shadow-md transition-all duration-300">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Employees</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage team members</p>
              </button>
              <button onClick={() => navigate('/allocations')} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl text-left hover:shadow-md transition-all duration-300">
                <ArrowLeftRight className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Allocations</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assign & track assets</p>
              </button>
              <button onClick={() => navigate('/maintenance')} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl text-left hover:shadow-md transition-all duration-300">
                <Wrench className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Maintenance</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track requests</p>
              </button>
              <button onClick={() => navigate('/reports')} className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 rounded-xl text-left hover:shadow-md transition-all duration-300">
                <FileText className="w-6 h-6 text-rose-600 dark:text-rose-400 mb-2" />
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Reports</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generate insights</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;