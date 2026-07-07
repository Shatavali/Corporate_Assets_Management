import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, CheckCircle, XCircle, Play, Flag, Wrench } from 'lucide-react';
import StatusBadge from './StatusBadge';

const MaintenanceTable = ({ 
  maintenanceRequests, 
  onDelete, 
  onApprove, 
  onReject, 
  onStart, 
  onComplete,
  isAdminOrManager,
  isAdmin 
}) => {
  const navigate = useNavigate();

  const severityColors = {
    'Low': 'bg-green-100 text-green-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'High': 'bg-orange-100 text-orange-700',
    'Critical': 'bg-red-100 text-red-700'
  };

  const canApprove = (status) => status === 'Pending Approval';
  const canStart = (status) => status === 'Approved';
  const canComplete = (status) => status === 'In Progress';

  if (!maintenanceRequests || maintenanceRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wrench size={48} className="text-gray-400" />
        </div>
        <p className="text-gray-500">No maintenance requests found</p>
        <p className="text-sm text-gray-400 mt-1">Click "New Request" to create one</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Asset</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Issue</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Severity</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Reported By</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {maintenanceRequests.map((request) => (
            <tr key={request._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-800">{request.assetId?.assetName || 'N/A'}</p>
                <p className="text-xs text-gray-500">{request.assetId?.assetTag || ''}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-800">{request.issue}</p>
                <p className="text-xs text-gray-500">{request.issueType}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[request.severity]}`}>
                  {request.severity}
                </span>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">{request.reportedBy?.name || 'N/A'}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {new Date(request.maintenanceDate).toLocaleDateString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => navigate(`/maintenance/${request._id}`)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  
                  {isAdminOrManager && canApprove(request.status) && (
                    <>
                      <button
                        onClick={() => onApprove(request._id)}
                        className="p-1.5 text-green-600 hover:text-green-700 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => onReject(request._id)}
                        className="p-1.5 text-red-600 hover:text-red-700 transition-colors"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  
                  {isAdminOrManager && canStart(request.status) && (
                    <button
                      onClick={() => onStart(request._id)}
                      className="p-1.5 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Start Maintenance"
                    >
                      <Play size={16} />
                    </button>
                  )}
                  
                  {isAdminOrManager && canComplete(request.status) && (
                    <button
                      onClick={() => onComplete(request._id)}
                      className="p-1.5 text-green-600 hover:text-green-700 transition-colors"
                      title="Complete"
                    >
                      <Flag size={16} />
                    </button>
                  )}
                  
                  {(isAdmin || (isAdminOrManager && request.status === 'Pending Approval')) && (
                    <>
                      <button
                        onClick={() => navigate(`/maintenance/edit/${request._id}`)}
                        className="p-1.5 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(request._id)}
                        className="p-1.5 text-red-600 hover:text-red-700 transition-colors"
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

export default MaintenanceTable;