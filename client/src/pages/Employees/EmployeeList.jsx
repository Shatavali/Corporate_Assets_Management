import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Plus, RefreshCw, Download, Users, Search, Filter,
  ChevronLeft, ChevronRight, Eye, Edit, Trash2,
  Grid, List, UserCheck, UserX, Shield, Award,
  Mail, Building2, CheckCircle, AlertCircle, Trash2 as TrashIcon
} from 'lucide-react';
import { fetchEmployees, deleteEmployee, toggleUserStatus, updateUserRole } from '../../redux/slices/employeeSlice';
import toast from 'react-hot-toast';

const EmployeeList = () => {
  const dispatch = useDispatch();
  const { employees, loading, error } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  
  const itemsPerPage = 10;
  const isAdmin = user?.role === 'admin';

  // Debug logging
  useEffect(() => {
    console.log('=== EmployeeList Debug ===');
    console.log('Employees data:', employees);
    console.log('Loading state:', loading);
    console.log('Error state:', error);
    console.log('Is Admin:', isAdmin);
    console.log('User:', user);
  }, [employees, loading, error, isAdmin, user]);

  // Fetch employees on mount
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        console.log('Fetching employees...');
        const result = await dispatch(fetchEmployees()).unwrap();
        console.log('Fetch result:', result);
      } catch (err) {
        console.error('Fetch failed:', err);
        toast.error('Failed to load employees');
      }
    };
    
    loadEmployees();
  }, [dispatch]);

  // Function to check if a user is corrupted
  const isCorruptedUser = (employee) => {
    return employee?.email?.includes('_deleted_') || 
           employee?.name?.includes('_deleted_') ||
           (employee?.email && employee.email.length > 100);
  };

  // Cleanup corrupted users
  const handleCleanupCorrupted = async () => {
    const corruptedCount = employeeList.filter(emp => isCorruptedUser(emp)).length;
    
    if (corruptedCount === 0) {
      toast.error('No corrupted users found');
      return;
    }
    
    if (!window.confirm(`This will permanently delete ${corruptedCount} corrupted user record(s). This action cannot be undone. Are you sure?`)) {
      return;
    }
    
    setIsCleaningUp(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/users/cleanup-corrupted', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Cleaned up ${result.data.deletedCount} corrupted users`);
        // Refresh the employee list
        await dispatch(fetchEmployees()).unwrap();
      } else {
        toast.error(result.message || 'Cleanup failed');
      }
    } catch (err) {
      console.error('Cleanup error:', err);
      toast.error('Failed to cleanup corrupted users');
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Handle Delete Employee
  const handleDelete = async (id, employeeName) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      try {
        await dispatch(deleteEmployee(id)).unwrap();
        toast.success('Employee deleted successfully!');
        await dispatch(fetchEmployees()).unwrap();
      } catch (err) {
        console.error('Delete error:', err);
        toast.error(err || 'Failed to delete employee');
      }
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (id, currentStatus, employeeName) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} ${employeeName}?`)) {
      try {
        await dispatch(toggleUserStatus(id)).unwrap();
        toast.success(`Employee ${action}d successfully!`);
        await dispatch(fetchEmployees()).unwrap();
      } catch (err) {
        console.error('Toggle status error:', err);
        toast.error(err || `Failed to ${action} employee`);
      }
    }
  };

  // Handle Update Role
  const handleUpdateRole = async (id, newRole, employeeName) => {
    if (window.confirm(`Change ${employeeName}'s role to ${newRole}?`)) {
      try {
        await dispatch(updateUserRole({ id, role: newRole })).unwrap();
        toast.success(`Role updated to ${newRole}!`);
        await dispatch(fetchEmployees()).unwrap();
      } catch (err) {
        console.error('Update role error:', err);
        toast.error('Failed to update role');
      }
    }
  };

  // Handle Refresh
  const handleRefresh = async () => {
    try {
      await dispatch(fetchEmployees()).unwrap();
      toast.success('Employees refreshed!');
    } catch (err) {
      toast.error('Failed to refresh employees');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/users/export?format=csv', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export started!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export employees');
    }
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    employee: 'bg-green-100 text-green-700 border-green-200'
  };

  const roleIcons = {
    admin: Shield,
    manager: Award,
    employee: UserCheck
  };

  const departmentColors = {
    IT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    HR: 'bg-pink-100 text-pink-700 border-pink-200',
    Finance: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Operations: 'bg-orange-100 text-orange-700 border-orange-200',
    Sales: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    Marketing: 'bg-rose-100 text-rose-700 border-rose-200',
    Other: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  // Safely get employees array
  const employeeList = Array.isArray(employees) ? employees : [];
  
  // Get unique values for filters
  const roles = ['all', ...new Set(employeeList.map(emp => emp?.role).filter(Boolean))];
  const departments = ['all', ...new Set(employeeList.map(emp => emp?.department).filter(Boolean))];

  // Filter employees (excluding corrupted from main list or including them based on search)
  const filteredEmployees = employeeList.filter(emp => {
    const matchesSearch = searchTerm === '' || 
      (emp?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (emp?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (emp?.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || emp?.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || emp?.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && emp?.isActive === true) ||
                         (statusFilter === 'inactive' && emp?.isActive === false);
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics including corrupted count
  const corruptedCount = employeeList.filter(emp => isCorruptedUser(emp)).length;
  const stats = {
    total: employeeList.length,
    active: employeeList.filter(emp => emp?.isActive === true && !isCorruptedUser(emp)).length,
    inactive: employeeList.filter(emp => emp?.isActive === false && !isCorruptedUser(emp)).length,
    admins: employeeList.filter(emp => emp?.role === 'admin' && !isCorruptedUser(emp)).length,
    managers: employeeList.filter(emp => emp?.role === 'manager' && !isCorruptedUser(emp)).length,
    corrupted: corruptedCount
  };

  if (loading && employeeList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading employees...</p>
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
                Team Management
              </h1>
              <p className="text-gray-500 mt-2">Manage your workforce, roles, and permissions</p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              {isAdmin && stats.corrupted > 0 && (
                <button
                  onClick={handleCleanupCorrupted}
                  disabled={isCleaningUp}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-sm disabled:opacity-50"
                >
                  <TrashIcon size={18} />
                  <span>{isCleaningUp ? 'Cleaning...' : `Cleanup (${stats.corrupted})`}</span>
                </button>
              )}
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-all shadow-sm"
              >
                <Download size={18} className="text-gray-500" />
                <span>Export</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={18} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              {isAdmin && (
                <Link
                  to="/employees/add"
                  className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus size={18} />
                  <span>Add Employee</span>
                </Link>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
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
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Managers</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.managers}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            {stats.corrupted > 0 && (
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm">Needs Cleanup</p>
                    <p className="text-2xl font-bold text-red-700">{stats.corrupted}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or employee ID..."
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
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Employee Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {paginatedEmployees.length > 0 ? (
            <>
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedEmployees.map((employee) => {
                        const RoleIcon = roleIcons[employee?.role] || UserCheck;
                        const isCorrupted = isCorruptedUser(employee);
                        return (
                          <tr key={employee?._id} className={`hover:bg-gray-50 transition-colors group ${isCorrupted ? 'bg-red-50' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-md ${isCorrupted ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`}>
                                  {employee?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <p className={`font-semibold ${isCorrupted ? 'text-red-600' : 'text-gray-800'}`}>
                                    {employee?.name || 'Unknown'}
                                    {isCorrupted && <span className="ml-2 text-xs text-red-500">(Corrupted)</span>}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-0.5">
                                    <Mail size={12} className="text-gray-400" />
                                    <p className="text-xs text-gray-500">{isCorrupted ? 'Corrupted data - please delete' : (employee?.email || 'No email')}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                                {employee?.employeeId || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium border ${departmentColors[employee?.department] || departmentColors.Other}`}>
                                {employee?.department || 'Other'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {isAdmin && !isCorrupted ? (
                                <select
                                  value={employee?.role || 'employee'}
                                  onChange={(e) => handleUpdateRole(employee?._id, e.target.value, employee?.name)}
                                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium border ${roleColors[employee?.role] || roleColors.employee} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                >
                                  <option value="employee">Employee</option>
                                  <option value="manager">Manager</option>
                                  <option value="admin">Admin</option>
                                </select>
                              ) : (
                                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${roleColors[employee?.role] || roleColors.employee}`}>
                                  <RoleIcon size={12} />
                                  <span className="text-xs font-medium capitalize">{employee?.role || 'N/A'}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {employee?.isActive ? (
                                <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-green-100 text-green-700">
                                  <CheckCircle size={12} />
                                  <span className="text-xs font-medium">Active</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-red-100 text-red-700">
                                  <AlertCircle size={12} />
                                  <span className="text-xs font-medium">Inactive</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-2">
                                {!isCorrupted && (
                                  <Link
                                    to={`/employees/${employee?._id}`}
                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </Link>
                                )}
                                {isAdmin && (
                                  <>
                                    {!isCorrupted && (
                                      <>
                                        <Link
                                          to={`/employees/edit/${employee?._id}`}
                                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                          title="Edit Employee"
                                        >
                                          <Edit size={16} />
                                        </Link>
                                        <button
                                          onClick={() => handleToggleStatus(employee?._id, employee?.isActive, employee?.name)}
                                          className={`p-1.5 rounded-lg transition-colors ${employee?.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                          title={employee?.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                          {employee?.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => handleDelete(employee?._id, employee?.name || 'this employee')}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Employee"
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
                  {paginatedEmployees.map((employee) => {
                    const isCorrupted = isCorruptedUser(employee);
                    return (
                      <div key={employee?._id} className={`bg-white rounded-xl border p-4 hover:shadow-lg transition-all ${isCorrupted ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${isCorrupted ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`}>
                              {employee?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <h3 className={`font-semibold ${isCorrupted ? 'text-red-600' : 'text-gray-800'}`}>
                                {employee?.name || 'Unknown'}
                                {isCorrupted && <span className="ml-2 text-xs text-red-500">(Corrupted)</span>}
                              </h3>
                              <p className="text-xs text-gray-500 font-mono">{employee?.employeeId || 'No ID'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail size={14} className="text-gray-400" />
                            <span className="text-gray-600 truncate">{isCorrupted ? 'Corrupted data' : (employee?.email || 'No email')}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Building2 size={14} className="text-gray-400" />
                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs ${departmentColors[employee?.department] || departmentColors.Other}`}>
                              {employee?.department || 'Other'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          {employee?.isActive ? (
                            <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-green-100 text-green-700">
                              <CheckCircle size={12} />
                              <span className="text-xs font-medium">Active</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-red-100 text-red-700">
                              <AlertCircle size={12} />
                              <span className="text-xs font-medium">Inactive</span>
                            </div>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(employee?._id, employee?.name || 'this employee')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
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
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Employees Found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || roleFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all'
                  ? "No employees match your search criteria. Try adjusting your filters."
                  : "Get started by adding your first employee to the system."}
              </p>
              {isAdmin && !(searchTerm || roleFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all') && (
                <Link
                  to="/employees/add"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md"
                >
                  <Plus size={18} />
                  <span>Add Your First Employee</span>
                </Link>
              )}
              {(searchTerm || roleFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setDepartmentFilter('all');
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

export default EmployeeList;