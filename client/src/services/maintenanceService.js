import api from './api';

const maintenanceService = {
  // Get all maintenance requests
  getMaintenanceRequests: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/maintenance${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  // Get single maintenance request by ID
  getMaintenanceById: async (id) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  // Create new maintenance request
  createMaintenanceRequest: async (data) => {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  // Update maintenance request
  updateMaintenanceRequest: async (id, data) => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  // Delete maintenance request
  deleteMaintenanceRequest: async (id) => {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },

  // Add these methods to maintenanceService.js

approveMaintenance: async (id) => {
  const response = await api.put(`/maintenance/${id}/approve`);
  return response.data;
},

rejectMaintenance: async (id, rejectionReason) => {
  const response = await api.put(`/maintenance/${id}/reject`, { rejectionReason });
  return response.data;
},

startMaintenance: async (id, data) => {
  const response = await api.put(`/maintenance/${id}/start`, data);
  return response.data;
},

completeMaintenance: async (id, data) => {
  const response = await api.put(`/maintenance/${id}/complete`, data);
  return response.data;
},

getMaintenanceStatistics: async () => {
  const response = await api.get('/maintenance/statistics');
  return response.data;
},
};


export default maintenanceService;