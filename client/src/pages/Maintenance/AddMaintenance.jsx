import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createMaintenanceRequest } from '../../redux/slices/maintenanceSlice';
import { fetchAssets } from '../../redux/slices/assetSlice';
import MaintenanceForm from '../../components/maintenance/MaintenanceForm';

const AddMaintenance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { assets } = useSelector((state) => state.assets);

  useEffect(() => {
    // Fetch assets for dropdown
    dispatch(fetchAssets({}));
  }, [dispatch]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const result = await dispatch(createMaintenanceRequest(formData));
    setLoading(false);
    if (result.payload?.success) {
      navigate('/maintenance');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/maintenance')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Maintenance</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">New Maintenance Request</h1>
          <p className="text-gray-500 mt-1">Create a maintenance request for an asset</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <MaintenanceForm onSubmit={handleSubmit} loading={loading} assets={assets} />
        </div>
      </div>
    </div>
  );
};

export default AddMaintenance;