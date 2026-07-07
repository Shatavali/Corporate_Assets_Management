import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchAllocationById, updateAllocation } from '../../redux/slices/allocationSlice';
import { fetchAssets } from '../../redux/slices/assetSlice';
import { fetchEmployees } from '../../redux/slices/employeeSlice';
import AllocationForm from '../../components/allocations/AllocationForm';

const EditAllocation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentAllocation, loading } = useSelector((state) => state.allocations);
  const { assets } = useSelector((state) => state.assets);
  const { employees } = useSelector((state) => state.employees);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchAllocationById(id));
      dispatch(fetchAssets({}));
      dispatch(fetchEmployees());
    }
  }, [dispatch, id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    const result = await dispatch(updateAllocation({ id, data: formData }));
    setSubmitting(false);
    if (result.payload?.success) {
      navigate('/allocations');
    }
  };

  if (loading && !currentAllocation) {
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
            onClick={() => navigate('/allocations')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Allocations</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Edit Allocation</h1>
          <p className="text-gray-500 mt-1">Update asset allocation details</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <AllocationForm
            initialData={currentAllocation}
            onSubmit={handleSubmit}
            loading={submitting}
            assets={assets || []}
            users={employees || []}
          />
        </div>
      </div>
    </div>
  );
};

export default EditAllocation;