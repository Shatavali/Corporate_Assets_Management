import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { fetchAllocations, deleteAllocation, updateAllocation } from '../../redux/slices/allocationSlice';
import AllocationTable from '../../components/allocations/AllocationTable';

const AllocationList = () => {
  const dispatch = useDispatch();
  const { allocations, loading } = useSelector((state) => state.allocations);
  const { user } = useSelector((state) => state.auth);

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    dispatch(fetchAllocations());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      dispatch(deleteAllocation(id));
    }
  };

  const handleReturn = async (id) => {
    if (window.confirm('Mark this asset as returned?')) {
      await dispatch(updateAllocation({ 
        id, 
        data: { 
          status: 'Returned', 
          actualReturnDate: new Date().toISOString() 
        } 
      }));
      dispatch(fetchAllocations());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading allocations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Asset Allocations</h1>
            <p className="text-gray-500 mt-1">Manage asset assignments to employees</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => dispatch(fetchAllocations())}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
            {isAdminOrManager && (
              <Link
                to="/allocations/add"
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
              >
                <Plus size={18} />
                <span>New Allocation</span>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <AllocationTable 
            allocations={allocations} 
            onDelete={handleDelete}
            onReturn={handleReturn}
            isAdminOrManager={isAdminOrManager}
          />
        </div>
      </div>
    </div>
  );
};

export default AllocationList;