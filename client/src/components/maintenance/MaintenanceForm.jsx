import React, { useState, useEffect } from 'react';
import assetService from '../../services/assetService';

const MaintenanceForm = ({ initialData, onSubmit, loading, assets = [] }) => {
  const [formData, setFormData] = useState({
    assetId: initialData?.assetId?._id || initialData?.assetId || '',
    issue: initialData?.issue || '',
    issueType: initialData?.issueType || 'Other',
    severity: initialData?.severity || 'Medium',
    status: initialData?.status || 'Reported',
    maintenanceDate: initialData?.maintenanceDate?.split('T')[0] || '',
    repairCost: initialData?.repairCost || 0,
    description: initialData?.description || '',
    resolution: initialData?.resolution || '',
    technician: {
      name: initialData?.technician?.name || '',
      contact: initialData?.technician?.contact || '',
      company: initialData?.technician?.company || ''
    }
  });

  const issueTypes = ['Hardware', 'Software', 'Network', 'Physical Damage', 'Regular Service', 'Other'];
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
  const statusOptions = ['Reported', 'Approved', 'In Progress', 'Completed', 'Cancelled'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset *</label>
            <select
              name="assetId"
              value={formData.assetId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Asset</option>
              {assets.map(asset => (
                <option key={asset._id} value={asset._id}>
                  {asset.assetName} ({asset.assetTag})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description *</label>
            <textarea
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe the issue..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
              >
                {issueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
              >
                {severityLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Date *</label>
              <input
                type="date"
                name="maintenanceDate"
                value={formData.maintenanceDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repair Cost ($)</label>
              <input
                type="number"
                name="repairCost"
                value={formData.repairCost}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution (if completed)</label>
            <textarea
              name="resolution"
              value={formData.resolution}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="How was this resolved?"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Technician Information</h4>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                name="technician.name"
                placeholder="Name"
                value={formData.technician.name}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
              <input
                type="text"
                name="technician.contact"
                placeholder="Contact"
                value={formData.technician.contact}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
              <input
                type="text"
                name="technician.company"
                placeholder="Company"
                value={formData.technician.company}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (initialData ? 'Update Request' : 'Create Request')}
        </button>
      </div>
    </form>
  );
};

export default MaintenanceForm;