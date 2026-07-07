import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchAssetById, updateAsset } from '../../redux/slices/assetSlice';

const EditAsset = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentAsset, loading } = useSelector((state) => state.assets);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    assetName: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchaseCost: '',
    status: '',
    condition: ''
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchAssetById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentAsset) {
      setFormData({
        assetName: currentAsset.assetName || '',
        category: currentAsset.category || '',
        brand: currentAsset.brand || '',
        model: currentAsset.model || '',
        serialNumber: currentAsset.serialNumber || '',
        purchaseDate: currentAsset.purchaseDate?.split('T')[0] || '',
        purchaseCost: currentAsset.purchaseCost || '',
        status: currentAsset.status || 'Available',
        condition: currentAsset.condition || 'Good'
      });
    }
  }, [currentAsset]);

  const categories = ['Laptop', 'Desktop', 'Mobile', 'Tablet', 'Monitor', 'Printer', 
    'Scanner', 'Network Device', 'Server', 'Furniture', 'Office Equipment', 'Other'];
  const statuses = ['Available', 'Assigned', 'Under Maintenance', 'Lost', 'Damaged', 'Retired'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dispatch(updateAsset({ id, assetData: formData })).unwrap();
      navigate('/assets');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !currentAsset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Asset</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                  <input type="text" name="assetName" value={formData.assetName} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost ($)</label>
                  <input type="number" name="purchaseCost" value={formData.purchaseCost} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl">
                      {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl">
                      {conditions.map(condition => <option key={condition} value={condition}>{condition}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={() => navigate('/assets')} className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAsset;