import React from 'react';
import { X } from 'lucide-react';

const AssetFilters = ({ filters, onFilterChange }) => {
  const categories = [
    'All', 'Laptop', 'Desktop', 'Mobile', 'Tablet', 'Monitor', 'Printer',
    'Scanner', 'Network Device', 'Server', 'Furniture', 'Software License',
    'Office Equipment', 'Other'
  ];

  const statuses = ['All', 'Available', 'Assigned', 'Under Maintenance', 'Lost', 'Damaged', 'Retired'];

  const handleChange = (name, value) => {
    onFilterChange({ [name]: value === 'All' ? '' : value });
  };

  const clearFilters = () => {
    onFilterChange({ search: '', category: '', status: '', assignedTo: '' });
  };

  const hasActiveFilters = filters.search || filters.category || filters.status;

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name or tag..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={filters.category || 'All'}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status || 'All'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AssetFilters;