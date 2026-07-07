import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Filter, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { 
  fetchMaintenanceRequests, 
  deleteMaintenanceRequest,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  startMaintenance,
  completeMaintenanceRequest,
  fetchMaintenanceStatistics
} from '../../redux/slices/maintenanceSlice';
import MaintenanceTable from '../../components/maintenance/MaintenanceTable';

const MaintenanceList = () => {
  const dispatch = useDispatch();
  const { maintenanceRequests, loading, statistics } = useSelector((state) => state.maintenance);
  const { user } = useSelector((state) => state.auth);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const params = statusFilter ? { status: statusFilter } : {};
    dispatch(fetchMaintenanceRequests(params));
    if (isAdminOrManager) {
      dispatch(fetchMaintenanceStatistics());
    }
  }, [dispatch, statusFilter, isAdminOrManager]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      dispatch(deleteMaintenanceRequest(id));
    }
  };

  const handleApprove = (id) => {
    if (window.confirm('Approve this maintenance request?')) {
      dispatch(approveMaintenanceRequest(id));
    }
  };

  const handleReject = (id) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      dispatch(rejectMaintenanceRequest({ id, rejectionReason: reason }));
    }
  };

  const handleStart = (id) => {
    const technicianName = prompt('Enter technician name:');
    const technicianContact = prompt('Enter technician contact:');
    if (technicianName) {
      dispatch(startMaintenance({ 
        id, 
        data: {
          technician: {
            name: technicianName,
            contact: technicianContact || '',
            company: 'Internal'
          }
        }
      }));
    }
  };

  const handleComplete = (id) => {
    const resolution = prompt('Enter resolution details:');
    const repairCost = prompt('Enter repair cost ($):');
    if (resolution) {
      dispatch(completeMaintenanceRequest({ 
        id, 
        data: {
          resolution,
          repairCost: parseFloat(repairCost) || 0
        }
      }));
    }
  };

  const statusCounts = {
    'Pending Approval': maintenanceRequests?.filter(r => r.status === 'Pending Approval').length || 0,
    'Approved': maintenanceRequests?.filter(r => r.status === 'Approved').length || 0,
    'In Progress': maintenanceRequests?.filter(r => r.status === 'In Progress').length || 0,
    'Completed': maintenanceRequests?.filter(r => r.status === 'Completed').length || 0,
    'Rejected': maintenanceRequests?.filter(r => r.status === 'Rejected').length || 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Maintenance Requests</h1>
            <p className="text-gray-500 mt-1">Track and manage asset maintenance</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => dispatch(fetchMaintenanceRequests())}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
            <Link
              to="/maintenance/add"
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >
              <Plus size={18} />
              <span>New Request</span>
            </Link>
          </div>
        </div>

        {/* Statistics Cards (Admin/Manager only) */}
        {isAdminOrManager && statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border-l-4 border-yellow-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.pendingApproval || 0}</p>
                </div>
                <Clock size={24} className="text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.approved || 0}</p>
                </div>
                <CheckCircle size={24} className="text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-l-4 border-purple-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.inProgress || 0}</p>
                </div>
                <AlertTriangle size={24} className="text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.completed || 0}</p>
                </div>
                <CheckCircle size={24} className="text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Avg. Completion</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.averageCompletionDays || 0}d</p>
                </div>
                <Clock size={24} className="text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === '' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({maintenanceRequests?.length || 0})
          </button>
          <button
            onClick={() => setStatusFilter('Pending Approval')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'Pending Approval' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending ({statusCounts['Pending Approval']})
          </button>
          <button
            onClick={() => setStatusFilter('Approved')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'Approved' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Approved ({statusCounts['Approved']})
          </button>
          <button
            onClick={() => setStatusFilter('In Progress')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'In Progress' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            In Progress ({statusCounts['In Progress']})
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'Completed' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Completed ({statusCounts['Completed']})
          </button>
          <button
            onClick={() => setStatusFilter('Rejected')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'Rejected' 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Rejected ({statusCounts['Rejected']})
          </button>
        </div>

        {/* Maintenance Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <MaintenanceTable 
            maintenanceRequests={maintenanceRequests} 
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            onStart={handleStart}
            onComplete={handleComplete}
            isAdminOrManager={isAdminOrManager}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  );
};

export default MaintenanceList;