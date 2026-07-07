import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, RefreshCw, Search, Filter, 
  ChevronLeft, ChevronRight, Eye, 
  Edit, Trash2, Grid, List,
  Package, AlertCircle, CheckCircle, 
  Clock, TrendingUp, Download, Printer,
  X, UserPlus, Calendar, FileText
} from 'lucide-react';
import { fetchAssets, deleteAsset, assignAsset } from '../../redux/slices/assetSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const AssetList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assets, loading } = useSelector((state) => state.assets);
  const { user, token } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    dispatch(fetchAssets({}));
  }, [dispatch]);

  // Fetch employees when modal opens
  useEffect(() => {
    if (showAssignModal && isAdminOrManager) {
      const loadEmployees = async () => {
        setLoadingEmployees(true);
        try {
          const authToken = token || localStorage.getItem('token');
          const response = await axios.get('/api/users', { 
            params: { role: 'employee' },
            headers: { Authorization: `Bearer ${authToken}` }
          });
          
          let employeesArray = [];
          if (Array.isArray(response.data)) {
            employeesArray = response.data;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            employeesArray = response.data.data;
          } else if (response.data?.users && Array.isArray(response.data.users)) {
            employeesArray = response.data.users;
          } else {
            console.warn('Unexpected employees response format:', response.data);
            employeesArray = [];
          }
          
          setEmployeesList(employeesArray);
        } catch (error) {
          console.error('Failed to load employees', error);
          toast.error('Could not load employee list');
          setEmployeesList([]);
        } finally {
          setLoadingEmployees(false);
        }
      };
      loadEmployees();
    }
  }, [showAssignModal, isAdminOrManager, token]);

  // Handle Delete Asset
  const handleDelete = async (id, assetName) => {
    if (window.confirm(`Are you sure you want to delete "${assetName}"? This action cannot be undone.`)) {
      try {
        await dispatch(deleteAsset(id)).unwrap();
        toast.success('Asset deleted successfully!');
        await dispatch(fetchAssets({}));
      } catch (err) {
        console.error('Delete error:', err);
        toast.error(err?.message || 'Failed to delete asset');
      }
    }
  };

  // Handle Assign Asset (with expected return date and purpose)
  const handleAssign = async () => {
    if (!selectedEmployeeId) {
      toast.error('Please select an employee');
      return;
    }
    setAssignLoading(true);
    try {
      await dispatch(assignAsset({ 
        id: selectedAsset._id, 
        assignData: { 
          assignedTo: selectedEmployeeId,
          expectedReturnDate: expectedReturnDate || undefined,
          purpose: purpose || undefined
        }
      })).unwrap();
      toast.success(`Asset "${selectedAsset.assetName}" assigned successfully!`);
      setShowAssignModal(false);
      setSelectedAsset(null);
      setSelectedEmployeeId('');
      setExpectedReturnDate('');
      setPurpose('');
      await dispatch(fetchAssets({}));
    } catch (err) {
      console.error('Assign error:', err);
      toast.error(err?.message || 'Failed to assign asset');
    } finally {
      setAssignLoading(false);
    }
  };

  const statusColors = {
    'Available': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    'Assigned': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Package },
    'Under Maintenance': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
    'Lost': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle },
    'Damaged': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle },
    'Retired': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: X }
  };

  const categories = ['all', ...new Set(assets?.map(asset => asset.category) || [])];
  const statuses = ['all', 'Available', 'Assigned', 'Under Maintenance', 'Lost', 'Damaged', 'Retired'];

  const filteredAssets = assets?.filter(asset => {
    const matchesSearch = asset.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: assets?.length || 0,
    available: assets?.filter(a => a.status === 'Available').length || 0,
    assigned: assets?.filter(a => a.status === 'Assigned').length || 0,
    maintenance: assets?.filter(a => a.status === 'Under Maintenance').length || 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <div className="p-6 lg:p-8">
        
        {/* Header Section with Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Asset Management
              </h1>
              <p className="text-gray-500 mt-2">Track, manage, and optimize your asset inventory</p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <button
                onClick={() => dispatch(fetchAssets({}))}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-all shadow-sm"
              >
                <RefreshCw size={18} className="text-gray-500" />
                <span>Refresh</span>
              </button>
              {isAdminOrManager && (
                <Link
                  to="/assets/add"
                  className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus size={18} />
                  <span>Add Asset</span>
                </Link>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">In Use</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by asset name, tag, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid size={18} />
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-xl transition-all ${showFilters ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
            <div className="flex space-x-2">
              <button className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
                <Download size={18} />
              </button>
              <button className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
                <Printer size={18} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Assets Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {paginatedAssets.length > 0 ? (
            <>
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset Tag</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedAssets.map((asset) => {
                        const StatusIcon = statusColors[asset.status]?.icon || Package;
                        return (
                          <tr key={asset._id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-gray-800">{asset.assetName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{asset.model || 'No model'}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{asset.assetTag}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">{asset.category}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${statusColors[asset.status]?.bg} ${statusColors[asset.status]?.border} border`}>
                                <StatusIcon size={12} className={statusColors[asset.status]?.text} />
                                <span className={`text-xs font-medium ${statusColors[asset.status]?.text}`}>
                                  {asset.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">
                                {asset.assignedTo?.name || 'Not Assigned'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => navigate(`/assets/${asset._id}`)}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                {isAdminOrManager && (
                                  <>
                                    {asset.status === 'Available' && (
                                      <button
                                        onClick={() => {
                                          setSelectedAsset(asset);
                                          setShowAssignModal(true);
                                        }}
                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Assign to Employee"
                                      >
                                        <UserPlus size={16} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => navigate(`/assets/edit/${asset._id}`)}
                                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                      title="Edit Asset"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(asset._id, asset.assetName)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Asset"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {paginatedAssets.map((asset) => {
                    const StatusIcon = statusColors[asset.status]?.icon || Package;
                    return (
                      <div key={asset._id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${statusColors[asset.status]?.bg}`}>
                            <StatusIcon size={12} className={statusColors[asset.status]?.text} />
                            <span className={`text-xs font-medium ${statusColors[asset.status]?.text}`}>
                              {asset.status}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-1">{asset.assetName}</h3>
                        <p className="text-xs text-gray-500 font-mono mb-2">{asset.assetTag}</p>
                        <p className="text-sm text-gray-600 mb-2">{asset.category}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            {asset.assignedTo?.name || 'Unassigned'}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => navigate(`/assets/${asset._id}`)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            {isAdminOrManager && (
                              <>
                                {asset.status === 'Available' && (
                                  <button
                                    onClick={() => {
                                      setSelectedAsset(asset);
                                      setShowAssignModal(true);
                                    }}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Assign to Employee"
                                  >
                                    <UserPlus size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => navigate(`/assets/edit/${asset._id}`)}
                                  className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                  title="Edit Asset"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(asset._id, asset.assetName)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Asset"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length} assets
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg transition-all ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'hover:bg-gray-200 text-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Assets Found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                  ? "No assets match your search criteria. Try adjusting your filters."
                  : "Get started by adding your first asset to the system."}
              </p>
              {isAdminOrManager && !(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <Link
                  to="/assets/add"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md"
                >
                  <Plus size={18} />
                  <span>Add Your First Asset</span>
                </Link>
              )}
              {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                >
                  <RefreshCw size={18} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Asset Modal with Expected Return Date and Purpose */}
      {showAssignModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800">Assign Asset</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Asset Info */}
              <div>
                <p className="text-sm text-gray-500">Asset</p>
                <p className="font-medium text-gray-800">{selectedAsset.assetName}</p>
                <p className="text-xs text-gray-400 font-mono">{selectedAsset.assetTag}</p>
              </div>

              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={assignLoading || loadingEmployees}
                >
                  <option value="">-- Choose an employee --</option>
                  {employeesList.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
                {loadingEmployees && (
                  <p className="text-xs text-gray-500 mt-1">Loading employees...</p>
                )}
                {!loadingEmployees && employeesList.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No employees found. Please add employees first.
                  </p>
                )}
              </div>

              {/* Expected Return Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={14} className="inline mr-1" />
                  Expected Return Date
                </label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={new Date().toISOString().split('T')[0]} // prevent past dates
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={14} className="inline mr-1" />
                  Purpose / Reason
                </label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Software development, Graphic design, Temporary replacement..."
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={assignLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={assignLoading || !selectedEmployeeId || employeesList.length === 0}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {assignLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Assign Asset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetList;