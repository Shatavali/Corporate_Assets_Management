import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, User, Wrench, AlertCircle } from 'lucide-react';
import { fetchMaintenanceById } from '../../redux/slices/maintenanceSlice';
import StatusBadge from '../../components/maintenance/StatusBadge';

const MaintenanceDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentMaintenance, loading } = useSelector((state) => state.maintenance);

  useEffect(() => {
    if (id) {
      dispatch(fetchMaintenanceById(id));
    }
  }, [dispatch, id]);

  const severityColors = {
    'Low': 'bg-green-100 text-green-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'High': 'bg-orange-100 text-orange-700',
    'Critical': 'bg-red-100 text-red-700'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentMaintenance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Maintenance request not found</p>
          <button onClick={() => navigate('/maintenance')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl">
            Back to Maintenance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <button onClick={() => navigate('/maintenance')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft size={20} />
          <span>Back to Maintenance</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Maintenance Request</h1>
                <p className="text-gray-500 mt-1">ID: {currentMaintenance._id}</p>
              </div>
              <StatusBadge status={currentMaintenance.status} />
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-800">{currentMaintenance.assetId?.assetName}</p>
                    <p className="text-sm text-gray-500">Tag: {currentMaintenance.assetId?.assetTag}</p>
                    <p className="text-sm text-gray-500">Category: {currentMaintenance.assetId?.category}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Issue Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Issue</span>
                      <span className="font-medium">{currentMaintenance.issue}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Issue Type</span>
                      <span className="font-medium">{currentMaintenance.issueType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Severity</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[currentMaintenance.severity]}`}>
                        {currentMaintenance.severity}
                      </span>
                    </div>
                    {currentMaintenance.description && (
                      <div className="py-2">
                        <span className="text-gray-500">Description</span>
                        <p className="text-gray-700 mt-1">{currentMaintenance.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule & Cost</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Maintenance Date</span>
                      <span className="font-medium">
                        <Calendar size={14} className="inline mr-1" />
                        {new Date(currentMaintenance.maintenanceDate).toLocaleDateString()}
                      </span>
                    </div>
                    {currentMaintenance.completionDate && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Completion Date</span>
                        <span className="font-medium">
                          {new Date(currentMaintenance.completionDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-500">Repair Cost</span>
                      <span className="font-medium">
                        <DollarSign size={14} className="inline mr-1" />
                        ${currentMaintenance.repairCost?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {currentMaintenance.technician?.name && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Technician Information</h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-gray-700">{currentMaintenance.technician.name}</span>
                      </div>
                      {currentMaintenance.technician.contact && (
                        <p className="text-sm text-gray-500">Contact: {currentMaintenance.technician.contact}</p>
                      )}
                      {currentMaintenance.technician.company && (
                        <p className="text-sm text-gray-500">Company: {currentMaintenance.technician.company}</p>
                      )}
                    </div>
                  </div>
                )}

                {currentMaintenance.resolution && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Resolution</h3>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-gray-700">{currentMaintenance.resolution}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reported By</span>
                      <span className="text-gray-700">{currentMaintenance.reportedBy?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reported Date</span>
                      <span className="text-gray-700">{new Date(currentMaintenance.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetails;