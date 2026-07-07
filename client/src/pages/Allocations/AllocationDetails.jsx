import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Package, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { fetchAllocationById, returnAllocation } from '../../redux/slices/allocationSlice';

const AllocationDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentAllocation, loading } = useSelector((state) => state.allocations);
  const { user } = useSelector((state) => state.auth);

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (id) {
      dispatch(fetchAllocationById(id));
    }
  }, [dispatch, id]);

  const handleReturn = () => {
    if (window.confirm('Mark this asset as returned?')) {
      dispatch(returnAllocation(id));
      setTimeout(() => dispatch(fetchAllocationById(id)), 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentAllocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Allocation not found</p>
          <button onClick={() => navigate('/allocations')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl">
            Back to Allocations
          </button>
        </div>
      </div>
    );
  }

  const assetData = currentAllocation.assetId || {};
  const userData = currentAllocation.userId || {};
  const isOverdue = currentAllocation.status === 'Active' && 
    currentAllocation.expectedReturnDate && 
    new Date(currentAllocation.expectedReturnDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <button onClick={() => navigate('/allocations')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft size={20} />
          <span>Back to Allocations</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Asset Allocation Details</h1>
                <p className="text-gray-500 mt-1">ID: {currentAllocation._id}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  currentAllocation.status === 'Active' ? 'bg-green-100 text-green-700' :
                  currentAllocation.status === 'Returned' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                  {currentAllocation.status === 'Active' && <CheckCircle size={14} />}
                  {currentAllocation.status === 'Returned' && <CheckCircle size={14} />}
                  {currentAllocation.status === 'Overdue' && <AlertCircle size={14} />}
                  <span>{currentAllocation.status}</span>
                </span>
                {isOverdue && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    <AlertCircle size={14} />
                    <span>Overdue</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Package size={20} className="text-indigo-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">{assetData.assetName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Tag: {assetData.assetTag || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Category: {assetData.category || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Serial: {assetData.serialNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <User size={20} className="text-indigo-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">{userData.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Email: {userData.email || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Department: {userData.department || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Employee ID: {userData.employeeId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Allocation Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Allocation Date</span>
                      <span className="font-medium">
                        <Calendar size={14} className="inline mr-1" />
                        {new Date(currentAllocation.allocationDate).toLocaleDateString()}
                      </span>
                    </div>
                    {currentAllocation.expectedReturnDate && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Expected Return Date</span>
                        <span className="font-medium">
                          {new Date(currentAllocation.expectedReturnDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {currentAllocation.actualReturnDate && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Actual Return Date</span>
                        <span className="font-medium text-green-600">
                          {new Date(currentAllocation.actualReturnDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {currentAllocation.duration && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">Duration</span>
                        <span className="font-medium">{currentAllocation.duration} days</span>
                      </div>
                    )}
                  </div>
                </div>

                {currentAllocation.purpose && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Purpose</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700">{currentAllocation.purpose}</p>
                    </div>
                  </div>
                )}

                {currentAllocation.condition && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Condition Notes</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700">{currentAllocation.condition}</p>
                    </div>
                  </div>
                )}

                {currentAllocation.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Notes</h3>
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <FileText size={16} className="text-yellow-600 inline mr-2" />
                      <p className="text-yellow-700 inline">{currentAllocation.notes}</p>
                    </div>
                  </div>
                )}

                {/* Return Button for Active Allocations */}
                {isAdminOrManager && currentAllocation.status === 'Active' && (
                  <div className="mt-4">
                    <button
                      onClick={handleReturn}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Mark as Returned
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationDetails;