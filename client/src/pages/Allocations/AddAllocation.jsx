import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createAllocation } from '../../redux/slices/allocationSlice';
import { fetchAssets } from '../../redux/slices/assetSlice';
import { fetchEmployees } from '../../redux/slices/employeeSlice';
import AllocationForm from '../../components/allocations/AllocationForm';

const AddAllocation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { assets } = useSelector((state) => state.assets);
  const { employees } = useSelector((state) => state.employees);

  useEffect(() => {
    dispatch(fetchAssets({}));
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const result = await dispatch(createAllocation(formData));
    setLoading(false);
    if (result.payload?.success) {
      navigate('/allocations');
    }
  };

  // Only show available assets (not already assigned)
  const availableAssets = assets?.filter(asset => asset.status === 'Available') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/allocations')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Allocations</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">New Asset Allocation</h1>
          <p className="text-gray-500 mt-1">Assign an asset to an employee</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <AllocationForm 
            onSubmit={handleSubmit} 
            loading={loading} 
            assets={availableAssets}
            users={employees || []}
          />
        </div>
      </div>
    </div>
  );
};

export default AddAllocation;