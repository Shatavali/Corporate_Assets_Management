import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchMaintenanceById, updateMaintenanceRequest } from '../../redux/slices/maintenanceSlice';
import { fetchAssets } from '../../redux/slices/assetSlice';
import MaintenanceForm from '../../components/maintenance/MaintenanceForm';

const EditMaintenance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentMaintenance, loading } = useSelector((state) => state.maintenance);
  const { assets } = useSelector((state) => state.assets);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchMaintenanceById(id));
      dispatch(fetchAssets({}));
    }
  }, [dispatch, id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    const result = await dispatch(updateMaintenanceRequest({ id, data: formData }));
    setSubmitting(false);
    if (result.payload?.success) {
      navigate('/maintenance');
    }
  };

  if (loading && !currentMaintenance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-800">Edit Maintenance Request</h1>
          <p className="text-gray-500 mt-1">Update the maintenance request details</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <MaintenanceForm
            initialData={currentMaintenance}
            onSubmit={handleSubmit}
            loading={submitting}
            assets={assets}
          />
        </div>
      </div>
    </div>
  );
};

export default EditMaintenance;