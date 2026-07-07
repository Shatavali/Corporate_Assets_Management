import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import StatusBadge from './StatusBadge';

const AllocationTable = ({ allocations, onDelete, isAdminOrManager, onReturn }) => {
  const navigate = useNavigate();

  if (!allocations || allocations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowRightLeft className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-gray-500">No asset allocations found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Asset</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Allocation Date</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Expected Return</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {allocations.map((allocation) => (
            <tr key={allocation._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-800">{allocation.assetId?.assetName || 'N/A'}</p>
                <p className="text-xs text-gray-500">{allocation.assetId?.assetTag || ''}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-800">{allocation.userId?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{allocation.userId?.email || ''}</p>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={allocation.status} />
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {new Date(allocation.allocationDate).toLocaleDateString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {allocation.expectedReturnDate ? new Date(allocation.expectedReturnDate).toLocaleDateString() : 'Not set'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => navigate(`/allocations/${allocation._id}`)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  {isAdminOrManager && allocation.status === 'Active' && (
                    <button
                      onClick={() => onReturn && onReturn(allocation._id)}
                      className="p-1.5 text-gray-500 hover:text-green-600 transition-colors"
                      title="Return Asset"
                    >
                      <ArrowRightLeft size={16} />
                    </button>
                  )}
                  {isAdminOrManager && (
                    <>
                      <button
                        onClick={() => navigate(`/allocations/edit/${allocation._id}`)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(allocation._id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationTable;