import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, User, Calendar, DollarSign } from 'lucide-react';
import { fetchAssetById } from '../../redux/slices/assetSlice';

const AssetDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentAsset, loading } = useSelector((state) => state.assets);

  useEffect(() => {
    if (id) {
      dispatch(fetchAssetById(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentAsset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Asset not found</p>
          <button onClick={() => navigate('/assets')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl">
            Back to Assets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <button onClick={() => navigate('/assets')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft size={20} />
          <span>Back to Assets</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">{currentAsset.assetName}</h1>
            <p className="text-gray-500 font-mono mt-1">{currentAsset.assetTag}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium">{currentAsset.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Brand</span>
                    <span className="font-medium">{currentAsset.brand || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Model</span>
                    <span className="font-medium">{currentAsset.model || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Serial Number</span>
                    <span className="font-medium">{currentAsset.serialNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium">{currentAsset.status}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Condition</span>
                    <span className="font-medium">{currentAsset.condition}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Purchase Date</span>
                    <span className="font-medium">{new Date(currentAsset.purchaseDate).toLocaleDateString()}</span>
                  </div>
                  {currentAsset.purchaseCost && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Purchase Cost</span>
                      <span className="font-medium">${currentAsset.purchaseCost}</span>
                    </div>
                  )}
                </div>

                {currentAsset.assignedTo && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Assignment</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Assigned To</span>
                        <span className="font-medium">{currentAsset.assignedTo.name}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">Department</span>
                        <span className="font-medium">{currentAsset.assignedTo.department || 'N/A'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;