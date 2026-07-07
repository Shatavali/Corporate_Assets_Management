import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

const ReportFilters = ({ onFilter, onClear, reportType }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    category: ''
  });

  const statusOptions = {
    assets: ['Available', 'Assigned', 'Under Maintenance', 'Damaged', 'Retired'],
    maintenance: ['Reported', 'Approved', 'In Progress', 'Completed', 'Cancelled'],
    allocations: ['Active', 'Returned', 'Overdue']
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApply = () => {
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        activeFilters[key] = filters[key];
      }
    });
    onFilter(activeFilters);
    setShowFilters(false);
  };

  const handleClear = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      category: ''
    });
    onClear();
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.status || filters.category;

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Filter size={18} />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="ml-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
        )}
      </button>

      {showFilters && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Filter Report</h3>
            <button
              onClick={handleClear}
              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
            >
              <X size={14} />
              <span>Clear all</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Status</option>
                {statusOptions[reportType]?.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;