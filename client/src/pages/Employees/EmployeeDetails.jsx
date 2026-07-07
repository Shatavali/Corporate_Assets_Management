import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar, 
  Package, Activity, AlertCircle, Clock, Camera,
  Server, Wrench, CheckCircle, XCircle 
} from 'lucide-react';

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('assets');
  const [uploading, setUploading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const token = localStorage.getItem('token');
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;
  const isOwnProfile = currentUserId === id;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch user profile
        let userUrl;
        if (isOwnProfile) {
          userUrl = '/api/users/me';
        } else {
          userUrl = `/api/users/${id}`;
        }
        const userRes = await fetch(userUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!userRes.ok) throw new Error('Failed to load user profile');
        const userData = await userRes.json();
        setUser(userData.data);

        // 2. Fetch assets
        const assetsRes = await fetch(`/api/users/${id}/assets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (assetsRes.ok) {
          const assetsData = await assetsRes.json();
          setAssets(assetsData.data || []);
        }

        // 3. Fetch activities
        const activitiesRes = await fetch(`/api/users/${id}/activities?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData.data || []);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchData();
  }, [id, token, isOwnProfile]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Avatar upload handler
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    try {
      const res = await fetch('/api/users/me/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        // Refresh user data
        const userRes = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        setUser(userData.data);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{error || 'User not found'}</p>
          <button 
            onClick={() => navigate('/employees')} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    employee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-6">
        {/* Back button */}
        <button 
          onClick={() => navigate('/employees')} 
          className={`flex items-center space-x-2 mb-6 transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <ArrowLeft size={20} />
          <span>Back to Employees</span>
        </button>

        {/* Profile Header */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-24"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              {/* Avatar with upload for own profile */}
              <div className="relative">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 border-4 border-white dark:border-gray-800 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                  {user.avatar && !user.avatar.includes('ui-avatars.com') ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || 'U'
                  )}
                </div>
                {isOwnProfile && (
                  <label className={`absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1.5 cursor-pointer hover:bg-indigo-700 transition shadow-md ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Camera size={14} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
                  </label>
                )}
              </div>
              <div className="ml-4 mb-2">
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {isOwnProfile && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Mail size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.phoneNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.department}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.position || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Server size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Employee ID: {user.employeeId || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`border-b mb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('assets')}
              className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'assets' 
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' 
                  : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package size={16} />
              <span>Assets ({assets.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'activity' 
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' 
                  : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Activity size={16} />
              <span>Activity Log ({activities.length})</span>
            </button>
          </div>
        </div>

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Assigned Assets</h3>
              {assets.length > 0 ? (
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <div key={asset._id} className={`flex items-center justify-between p-4 rounded-xl transition ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                          <Package size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{asset.assetName}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{asset.assetTag} • {asset.category}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        asset.status === 'Assigned' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : asset.status === 'Maintenance'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package size={40} className={`mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No assets assigned</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Activity</h3>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity._id} className={`flex items-start justify-between p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {activity.action === 'CREATE' && <CheckCircle size={18} className="text-green-500" />}
                          {activity.action === 'UPDATE' && <Wrench size={18} className="text-blue-500" />}
                          {activity.action === 'DELETE' && <XCircle size={18} className="text-red-500" />}
                          {!['CREATE','UPDATE','DELETE'].includes(activity.action) && <Activity size={18} className="text-gray-500" />}
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {activity.action} • {activity.entityType}
                          </p>
                          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {activity.details?.message || 'No additional details'}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Clock size={12} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity size={40} className={`mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No activity logs found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;