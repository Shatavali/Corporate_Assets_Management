
import api from './api';

const employeeService = {
  // Get all employees
  getEmployees: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/users${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  // Get single employee
  getEmployeeById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update current user
  updateCurrentUser: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Create employee
  createEmployee: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data;
  },

  // Get employee assets
  getEmployeeAssets: async (id) => {
    const response = await api.get(`/users/${id}/assets`);
    return response.data;
  },

  // Get employee activity
  getEmployeeActivity: async (id, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/users/${id}/activities${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  // Get employees by department
  getEmployeesByDepartment: async (department) => {
    const response = await api.get(`/users/department/${department}`);
    return response.data;
  },

  // Export employees
  exportEmployees: async (format = 'csv') => {
    const response = await api.get(`/users/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default employeeService;