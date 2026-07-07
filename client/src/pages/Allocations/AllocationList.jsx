import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Plus, RefreshCw, Search, Filter, 
  ChevronLeft, ChevronRight, Eye, 
  Edit, Trash2, Grid, List,
  ArrowLeftRight, Calendar, User, Package,
  CheckCircle, Clock, AlertCircle, XCircle,
  Download, Briefcase
} from 'lucide-react';
import { fetchAllocations, deleteAllocation, returnAllocation } from '../../redux/slices/allocationSlice';

const AllocationList = () => {
  const dispatch = useDispatch();
  const { allocations, loading } = useSelector((state) => state.allocations);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    dispatch(fetchAllocations());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this allocation? This action cannot be undone.')) {
      dispatch(deleteAllocation(id));
    }
  };

  const handleReturn = (id) => {
    if (window.confirm('Mark this asset as returned?')) {
      dispatch(returnAllocation(id));
    }
  };

  const statusColors = {
    'Active': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    'Returned': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle },
    'Overdue': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle }
  };

  const statuses = ['all', 'Active', 'Returned', 'Overdue'];

  // Filter allocations
  const filteredAllocations = allocations?.filter(allocation => {
    const assetData = allocation.assetId || {};
    const userData = allocation.userId || {};
    
    const matchesSearch = 
      assetData.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assetData.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredAllocations.length / itemsPerPage);
  const paginatedAllocations = filteredAllocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    total: allocations?.length || 0,
    active: allocations?.filter(a => a.status === 'Active').length || 0,
    returned: allocations?.filter(a => a.status === 'Returned').length || 0,
    overdue: allocations?.filter(a => a.status === 'Overdue').length || 0
  };

  const handleExport = () => {
    const headers = ['Asset Name', 'Asset Tag', 'Employee Name', 'Employee ID', 'Department', 'Allocation Date', 'Expected Return', 'Actual Return', 'Status', 'Purpose', 'Notes'];
    const csvData = filteredAllocations.map(a => {
      const assetData = a.assetId || {};
      const userData = a.userId || {};
      return [
        assetData.assetName || 'N/A',
        assetData.assetTag || 'N/A',
        userData.name || 'N/A',
        userData.employeeId || 'N/A',
        userData.department || 'N/A',
        new Date(a.allocationDate).toLocaleDateString(),
        a.expectedReturnDate ? new Date(a.expectedReturnDate).toLocaleDateString() : 'N/A',
        a.actualReturnDate ? new Date(a.actualReturnDate).toLocaleDateString() : 'N/A',
        a.status || 'N/A',
        a.purpose || 'N/A',
        a.notes || 'N/A'
      ];
    });
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `allocations_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading allocations...</p>
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
                Asset Allocations
              </h1>
              <p className="text-gray-500 mt-2">Track and manage asset assignments to employees</p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-all shadow-sm"
              >
                <Download size={18} className="text-gray-500" />
                <span>Export</span>
              </button>
              <button
                onClick={() => dispatch(fetchAllocations())}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-all shadow-sm"
              >
                <RefreshCw size={18} className="text-gray-500" />
                <span>Refresh</span>
              </button>
              {isAdminOrManager && (
                <Link
                  to="/allocations/add"
                  className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus size={18} />
                  <span>New Allocation</span>
                </Link>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Allocations</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Returned</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.returned}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
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
                placeholder="Search by asset name, tag, or employee name..."
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
              {statusFilter !== 'all' && (
                <span className="ml-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
              )}
            </button>
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
            </div>
          )}
        </div>

        {/* Allocations Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {paginatedAllocations.length > 0 ? (
            <>
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Allocation Info</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedAllocations.map((allocation) => {
                        const assetData = allocation.assetId || {};
                        const userData = allocation.userId || {};
                        const StatusIcon = statusColors[allocation.status]?.icon || Clock;
                        const isOverdue = allocation.status === 'Active' && 
                          allocation.expectedReturnDate && 
                          new Date(allocation.expectedReturnDate) < new Date();
                        
                        return (
                          <tr key={allocation._id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-gray-800">{assetData.assetName || 'N/A'}</p>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{assetData.assetTag || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{assetData.category || 'N/A'}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold shadow-sm">
                                  {userData.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{userData.name || 'N/A'}</p>
                                  <p className="text-xs text-gray-500">{userData.employeeId || 'N/A'}</p>
                                  <p className="text-xs text-gray-500">{userData.department || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Calendar size={14} className="text-gray-400" />
                                  <span className="text-gray-600">From: {new Date(allocation.allocationDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Calendar size={14} className="text-gray-400" />
                                  <span className="text-gray-600">Expected: {allocation.expectedReturnDate ? new Date(allocation.expectedReturnDate).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                {allocation.actualReturnDate && (
                                  <div className="flex items-center space-x-2 text-sm">
                                    <CheckCircle size={14} className="text-green-500" />
                                    <span className="text-gray-600">Returned: {new Date(allocation.actualReturnDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {allocation.purpose && (
                                  <div className="flex items-center space-x-2 text-sm mt-1">
                                    <Briefcase size={14} className="text-gray-400" />
                                    <span className="text-gray-600 text-xs">{allocation.purpose}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${statusColors[allocation.status]?.bg} ${statusColors[allocation.status]?.border} border`}>
                                <StatusIcon size={12} className={statusColors[allocation.status]?.text} />
                                <span className={`text-xs font-medium ${statusColors[allocation.status]?.text}`}>
                                  {allocation.status}
                                  {isOverdue && ' (Overdue)'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-2">
                                <Link
                                  to={`/allocations/${allocation._id}`}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </Link>
                                {isAdminOrManager && allocation.status === 'Active' && (
                                  <>
                                    <button
                                      onClick={() => handleReturn(allocation._id)}
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Mark as Returned"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <Link
                                      to={`/allocations/edit/${allocation._id}`}
                                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                      title="Edit Allocation"
                                    >
                                      <Edit size={16} />
                                    </Link>
                                    <button
                                      onClick={() => handleDelete(allocation._id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Allocation"
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
                  {paginatedAllocations.map((allocation) => {
                    const assetData = allocation.assetId || {};
                    const userData = allocation.userId || {};
                    const StatusIcon = statusColors[allocation.status]?.icon || Clock;
                    const isOverdue = allocation.status === 'Active' && 
                      allocation.expectedReturnDate && 
                      new Date(allocation.expectedReturnDate) < new Date();
                    
                    return (
                      <div key={allocation._id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              {assetData.assetName?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{assetData.assetName || 'N/A'}</h3>
                              <p className="text-xs text-gray-500 font-mono">{assetData.assetTag || 'N/A'}</p>
                            </div>
                          </div>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${statusColors[allocation.status]?.bg}`}>
                            <StatusIcon size={12} className={statusColors[allocation.status]?.text} />
                            <span className={`text-xs font-medium ${statusColors[allocation.status]?.text}`}>
                              {allocation.status}
                              {isOverdue && ' (Overdue)'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                            {userData.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{userData.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{userData.employeeId || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{userData.department || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Allocated Date:</span>
                            <span className="text-gray-800 font-medium">
                              {new Date(allocation.allocationDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Expected Return:</span>
                            <span className="text-gray-800 font-medium">
                              {allocation.expectedReturnDate ? new Date(allocation.expectedReturnDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          {allocation.actualReturnDate && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Actual Return:</span>
                              <span className="text-green-600 font-medium">
                                {new Date(allocation.actualReturnDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <Link
                            to={`/allocations/${allocation._id}`}
                            className="flex-1 text-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                          >
                            View Details
                          </Link>
                          {isAdminOrManager && allocation.status === 'Active' && (
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => handleReturn(allocation._id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Mark as Returned"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <Link
                                to={`/allocations/edit/${allocation._id}`}
                                className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                onClick={() => handleDelete(allocation._id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAllocations.length)} of {filteredAllocations.length} allocations
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
                <ArrowLeftRight className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Allocations Found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all'
                  ? "No allocations match your search criteria. Try adjusting your filters."
                  : "Get started by creating your first asset allocation."}
              </p>
              {isAdminOrManager && !(searchTerm || statusFilter !== 'all') && (
                <Link
                  to="/allocations/add"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md"
                >
                  <Plus size={18} />
                  <span>Create New Allocation</span>
                </Link>
              )}
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
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
    </div>
  );
};

export default AllocationList;