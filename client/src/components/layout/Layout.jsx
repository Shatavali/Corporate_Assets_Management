import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Package, Users, LogOut, Bell, Search, Menu, 
  X, ChevronDown, ArrowLeftRight, Wrench, FileText,
  Home, Sun, Moon, UserCircle
} from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Maintenance Due', message: '3 assets require maintenance', time: '2 hours ago', read: false, type: 'warning' },
    { id: 2, title: 'New Asset Assigned', message: 'Laptop assigned to John Doe', time: '5 hours ago', read: false, type: 'info' },
    { id: 3, title: 'Warranty Expiring', message: '5 assets warranty expiring soon', time: '1 day ago', read: true, type: 'alert' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Menu items
  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Assets', icon: Package, path: '/assets' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Allocations', icon: ArrowLeftRight, path: '/allocations' },
    { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  // Load user data
  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (!token || !userData || userData === 'undefined') {
        navigate('/login', { replace: true });
        return;
      }

      const parsedUser = JSON.parse(userData);
      if (parsedUser && parsedUser.email) {
        setUser(parsedUser);
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const goToProfile = () => {
    const userId = user?._id || user?.id;
    if (userId) {
      navigate(`/employees/${userId}`);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

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

          {/* User Profile */}
          <div className={`border-t p-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-3 w-full p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold shadow-md">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className={`text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.role || 'Employee'}
                      </p>
                    </div>
                    <ChevronDown size={16} className={darkMode ? 'text-gray-400' : 'text-gray-400'} />
                  </>
                )}
              </button>
              
              {showUserMenu && (
                <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} py-2`}>
                  <button
                    onClick={goToProfile}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserCircle size={16} />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
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
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'} w-4 h-4`} />
                  <input
                    type="text"
                    placeholder="Search..."
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
                        {notifications.slice(0, 5).map((notif) => (
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
                  onClick={goToProfile}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content - This renders child routes */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;