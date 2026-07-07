import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createAsset } from '../../redux/slices/assetSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddAsset = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth); // get token from Redux
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  const [formData, setFormData] = useState({
    assetName: '',
    assetTag: '',
    category: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchaseCost: '',
    status: 'Available',
    condition: 'Good',
    assignedTo: ''
  });

  const categories = ['Laptop', 'Desktop', 'Mobile', 'Tablet', 'Monitor', 'Printer', 
    'Scanner', 'Network Device', 'Server', 'Furniture', 'Office Equipment', 'Other'];
  
  const statuses = ['Available', 'Assigned', 'Under Maintenance', 'Lost', 'Damaged', 'Retired'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const authToken = token || localStorage.getItem('token');
        const response = await axios.get('/api/users', { 
          params: { role: 'employee' },
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        // 👇 Debug: log full response to see structure
        console.log('Employees API response:', response.data);
        
        // 👇 Extract array from different possible response shapes
        let employeesArray = [];
        if (Array.isArray(response.data)) {
          employeesArray = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          employeesArray = response.data.data;
        } else if (response.data?.users && Array.isArray(response.data.users)) {
          employeesArray = response.data.users;
        } else {
          console.warn('Unexpected response format:', response.data);
          employeesArray = [];
        }
        
        setEmployees(employeesArray);
      } catch (error) {
        console.error('Failed to load employees', error);
        toast.error('Could not load employee list');
        setEmployees([]); // fallback to empty array
      } finally {
        setLoadingEmployees(false);
      }
    };
    
    fetchEmployees();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.assetName || !formData.assetTag) {
      toast.error('Asset name and asset tag are required');
      return;
    }
    
    setLoading(true);
    
    const payload = { ...formData };
    if (!payload.assignedTo) delete payload.assignedTo;
    
    try {
      await dispatch(createAsset(payload)).unwrap();
      toast.success('Asset created successfully!');
      navigate('/assets');
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.message || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  const addSampleData = () => {
    setFormData({
      assetName: 'Dell XPS 15 Laptop',
      assetTag: 'AST2026000004',
      category: 'Laptop',
      brand: 'Dell',
      model: 'XPS 15',
      serialNumber: 'SN-DELL-001',
      purchaseDate: '2024-01-15',
      purchaseCost: '1500',
      status: 'Available',
      condition: 'Excellent',
      assignedTo: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/assets')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Assets</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Add New Asset</h1>
          <p className="text-gray-500 mt-1">Enter the details of the new asset</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                  <input
                    type="text"
                    name="assetName"
                    value={formData.assetName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Dell XPS Laptop"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag *</label>
                  <input
                    type="text"
                    name="assetTag"
                    value={formData.assetTag}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    placeholder="e.g., LAP001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                      placeholder="e.g., Dell"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                      placeholder="e.g., XPS 15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    placeholder="Unique serial number"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost ($)</label>
                  <input
                    type="number"
                    name="purchaseCost"
                    value={formData.purchaseCost}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    >
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assign to Employee Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to Employee <span className="text-xs text-gray-400">(optional)</span>
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    disabled={loadingEmployees}
                  >
                    <option value="">-- Not Assigned --</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                  {loadingEmployees && (
                    <p className="text-xs text-gray-500 mt-1">Loading employees...</p>
                  )}
                  {!loadingEmployees && employees.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No employees found. You can add employees first or assign later.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 mb-2">💡 Quick Tip:</p>
              <button
                type="button"
                onClick={addSampleData}
                className="text-sm px-4 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-100"
              >
                Fill Sample Data
              </button>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/assets')}
                className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Asset</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAsset;