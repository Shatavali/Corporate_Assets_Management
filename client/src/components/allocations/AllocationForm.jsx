import React, { useState } from 'react';

const AllocationForm = ({ initialData, onSubmit, loading, assets = [], users = [] }) => {
  const [formData, setFormData] = useState({
    assetId: initialData?.assetId?._id || initialData?.assetId || '',
    userId: initialData?.userId?._id || initialData?.userId || '',
    expectedReturnDate: initialData?.expectedReturnDate?.split('T')[0] || '',
    purpose: initialData?.purpose || '',
    condition: initialData?.condition || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'Active'
  });

  const statuses = ['Active', 'Returned', 'Overdue'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {asset.assetName} ({asset.assetTag}) - {asset.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User *</label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email}) - {user.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
            <input
              type="date"
              name="expectedReturnDate"
              value={formData.expectedReturnDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              placeholder="Reason for allocation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition Notes</label>
            <textarea
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Current condition of the asset..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
              placeholder="Any additional information..."
            />
          </div>
        </div>
      </div>

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
          {loading ? 'Saving...' : (initialData ? 'Update Allocation' : 'Create Allocation')}
        </button>
      </div>
    </form>
  );
};

export default AllocationForm;