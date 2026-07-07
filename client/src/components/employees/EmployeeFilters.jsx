
import React from 'react';
import { X } from 'lucide-react';

const EmployeeFilters = ({ filters, onFilterChange }) => {
  const departments = ['All', 'IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Other'];
  const roles = ['All', 'admin', 'manager', 'employee'];
  const statuses = ['All', 'active', 'inactive'];

  const handleChange = (name, value) => {
    onFilterChange({ [name]: value === 'All' ? '' : value });
  };

  const clearFilters = () => {
    onFilterChange({ search: '', role: '', department: '', isActive: '' });
  };

  const hasActiveFilters = filters.search || filters.role || filters.department || filters.isActive;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700">
            <X size={14} />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            value={filters.department || 'All'}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={filters.role || 'All'}
            onChange={(e) => handleChange('role', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            {roles.map(role => (
              <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.isActive === 'true' ? 'active' : filters.isActive === 'false' ? 'inactive' : 'All'}
            onChange={(e) => {
              const value = e.target.value;
              handleChange('isActive', value === 'active' ? 'true' : value === 'inactive' ? 'false' : '');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilters;