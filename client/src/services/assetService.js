import api from './api';

const assetService = {
  // Get all assets with pagination and filters
  getAssets: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/assets${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  // Get single asset by ID
  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  // Get asset by tag
  getAssetByTag: async (tag) => {
    const response = await api.get(`/assets/tag/${tag}`);
    return response.data;
  },

  // Create new asset
  createAsset: async (assetData) => {
    const response = await api.post('/assets', assetData);
    return response.data;
  },

  // Update asset
  updateAsset: async (id, assetData) => {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data;
  },

  // Delete asset
  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  // Get asset statistics
  getAssetStatistics: async () => {
    const response = await api.get('/assets/statistics');
    return response.data;
  },

  // Get asset QR code
  getAssetQRCode: async (id) => {
    const response = await api.get(`/assets/${id}/qrcode`);
    return response.data;
  },

  // Assign asset to employee
  assignAsset: async (id, assignData) => {
    const response = await api.post(`/assets/${id}/assign`, assignData);
    return response.data;
  },

  // Return asset
  returnAsset: async (id) => {
    const response = await api.post(`/assets/${id}/return`);
    return response.data;
  },

  // Get asset maintenance history
  getAssetMaintenanceHistory: async (id) => {
    const response = await api.get(`/assets/${id}/maintenance`);
    return response.data;
  },

  // Bulk upload assets
  bulkUploadAssets: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/assets/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Export assets
  exportAssets: async (format = 'csv') => {
    const response = await api.get(`/assets/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Upload asset images
  uploadAssetImages: async (id, images) => {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    const response = await api.post(`/assets/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default assetService;