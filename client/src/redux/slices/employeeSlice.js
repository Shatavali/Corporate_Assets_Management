import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Fetch all employees
export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      console.log('Fetch employees response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch employees error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

// Fetch employee by ID
export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee');
    }
  }
);

// Create employee
export const createEmployee = createAsyncThunk(
  'employees/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/users', data);
      toast.success('Employee created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create employee';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update employee
export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      toast.success('Employee updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update employee';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete employee
export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${id}`);
      toast.success('Employee deleted successfully!');
      return { id, ...response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete employee';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update user role
export const updateUserRole = createAsyncThunk(
  'employees/updateRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}/role`, { role });
      toast.success('Role updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update role';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Toggle user status
export const toggleUserStatus = createAsyncThunk(
  'employees/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}/toggle-status`);
      toast.success(`Status updated successfully!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Fetch employee assets
export const fetchEmployeeAssets = createAsyncThunk(
  'employees/fetchAssets',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}/assets`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee assets');
    }
  }
);

// Fetch employee activity
export const fetchEmployeeActivity = createAsyncThunk(
  'employees/fetchActivity',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}/activities`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee activity');
    }
  }
);

const initialState = {
  employees: [],
  currentEmployee: null,
  employeeAssets: [],
  employeeActivities: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  filters: {
    search: '',
    role: '',
    department: '',
    isActive: ''
  }
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
      state.employeeAssets = [];
      state.employeeActivities = [];
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.employees = action.payload.data;
          state.pagination.total = action.payload.total || action.payload.data.length;
        } else if (Array.isArray(action.payload)) {
          state.employees = action.payload;
          state.pagination.total = action.payload.length;
        } else {
          state.employees = [];
        }
        console.log('Employees loaded:', state.employees.length);
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload.data;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create employee
      .addCase(createEmployee.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.employees = [action.payload.data, ...state.employees];
        }
      })
      // Update employee
      .addCase(updateEmployee.fulfilled, (state, action) => {
        if (action.payload?.data) {
          const index = state.employees.findIndex(e => e._id === action.payload.data._id);
          if (index !== -1) {
            state.employees[index] = action.payload.data;
          }
          if (state.currentEmployee?._id === action.payload.data._id) {
            state.currentEmployee = action.payload.data;
          }
        }
      })
      // Delete employee
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(e => e._id !== action.payload.id);
        if (state.currentEmployee?._id === action.payload.id) {
          state.currentEmployee = null;
        }
      })
      // Update role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        if (action.payload?.data) {
          const index = state.employees.findIndex(e => e._id === action.payload.data.id);
          if (index !== -1) {
            state.employees[index].role = action.payload.data.role;
          }
          if (state.currentEmployee?._id === action.payload.data.id) {
            state.currentEmployee.role = action.payload.data.role;
          }
        }
      })
      // Toggle status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        if (action.payload?.data) {
          const index = state.employees.findIndex(e => e._id === action.payload.data.id);
          if (index !== -1) {
            state.employees[index].isActive = action.payload.data.isActive;
          }
          if (state.currentEmployee?._id === action.payload.data.id) {
            state.currentEmployee.isActive = action.payload.data.isActive;
          }
        }
      })
      // Fetch employee assets
      .addCase(fetchEmployeeAssets.fulfilled, (state, action) => {
        state.employeeAssets = action.payload?.data || [];
      })
      // Fetch employee activity
      .addCase(fetchEmployeeActivity.fulfilled, (state, action) => {
        state.employeeActivities = action.payload?.data || [];
      });
  }
});

export const { 
  clearError, 
  clearCurrentEmployee, 
  setFilters, 
  resetFilters, 
  setPage 
} = employeeSlice.actions;

export default employeeSlice.reducer;