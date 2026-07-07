import api from './api';

const allocationService = {
  // Get all allocations
  getAllocations: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/allocations${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  // Get single allocation
  getAllocationById: async (id) => {
    const response = await api.get(`/allocations/${id}`);
    return response.data;
  },

  // Create new allocation (auto-assigns asset)
  createAllocation: async (data) => {
    const response = await api.post('/allocations', data);
    return response.data;
  },

  // Update allocation (e.g., extend date, change purpose)
  updateAllocation: async (id, data) => {
    const response = await api.put(`/allocations/${id}`, data);
    return response.data;
  },

  // Delete allocation (frees asset if active)
  deleteAllocation: async (id) => {
    const response = await api.delete(`/allocations/${id}`);
    return response.data;
  },

  // Mark allocation as returned (dedicated endpoint)
  returnAllocation: async (id) => {
    const response = await api.post(`/allocations/${id}/return`);
    return response.data;
  },

  // Get allocation statistics
  getAllocationStatistics: async () => {
    const response = await api.get('/allocations/statistics');
    return response.data;
  }
};

export default allocationService;