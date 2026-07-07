import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import maintenanceService from '../../services/maintenanceService';
import toast from 'react-hot-toast';

// Async thunks
export const fetchMaintenanceRequests = createAsyncThunk(
  'maintenance/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getMaintenanceRequests(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance requests');
    }
  }
);

export const fetchMaintenanceById = createAsyncThunk(
  'maintenance/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getMaintenanceById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance request');
    }
  }
);

export const createMaintenanceRequest = createAsyncThunk(
  'maintenance/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.createMaintenanceRequest(data);
      toast.success('Maintenance request created successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create maintenance request';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateMaintenanceRequest = createAsyncThunk(
  'maintenance/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.updateMaintenanceRequest(id, data);
      toast.success('Maintenance request updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update maintenance request';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteMaintenanceRequest = createAsyncThunk(
  'maintenance/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.deleteMaintenanceRequest(id);
      toast.success('Maintenance request deleted successfully!');
      return { id, ...response };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete maintenance request';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ==================== APPROVAL WORKFLOW ACTIONS ====================

// Approve maintenance request
export const approveMaintenanceRequest = createAsyncThunk(
  'maintenance/approve',
  async (id, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.approveMaintenance(id);
      toast.success('Maintenance request approved!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve maintenance request';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Reject maintenance request
export const rejectMaintenanceRequest = createAsyncThunk(
  'maintenance/reject',
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.rejectMaintenance(id, rejectionReason);
      toast.warning('Maintenance request rejected');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject maintenance request';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Start maintenance (assign technician)
export const startMaintenance = createAsyncThunk(
  'maintenance/start',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.startMaintenance(id, data);
      toast.success('Maintenance started! Technician assigned.');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start maintenance';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Complete maintenance
export const completeMaintenanceRequest = createAsyncThunk(
  'maintenance/complete',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.completeMaintenance(id, data);
      toast.success('Maintenance completed successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to complete maintenance';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Fetch maintenance statistics
export const fetchMaintenanceStatistics = createAsyncThunk(
  'maintenance/statistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await maintenanceService.getMaintenanceStatistics();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

const initialState = {
  maintenanceRequests: [],
  currentMaintenance: null,
  statistics: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  filters: {
    status: '',
    issueType: '',
    severity: ''
  }
};

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentMaintenance: (state) => {
      state.currentMaintenance = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all maintenance requests
      .addCase(fetchMaintenanceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.maintenanceRequests = action.payload.data;
        state.pagination = {
          ...state.pagination,
          total: action.payload.count,
          pages: Math.ceil(action.payload.count / state.pagination.limit)
        };
      })
      .addCase(fetchMaintenanceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch by ID
      .addCase(fetchMaintenanceById.fulfilled, (state, action) => {
        state.currentMaintenance = action.payload.data;
      })
      
      // Create
      .addCase(createMaintenanceRequest.fulfilled, (state, action) => {
        state.maintenanceRequests.unshift(action.payload.data);
      })
      
      // Update
      .addCase(updateMaintenanceRequest.fulfilled, (state, action) => {
        const index = state.maintenanceRequests.findIndex(m => m._id === action.payload.data._id);
        if (index !== -1) {
          state.maintenanceRequests[index] = action.payload.data;
        }
        if (state.currentMaintenance?._id === action.payload.data._id) {
          state.currentMaintenance = action.payload.data;
        }
      })
      
      // Delete
      .addCase(deleteMaintenanceRequest.fulfilled, (state, action) => {
        state.maintenanceRequests = state.maintenanceRequests.filter(m => m._id !== action.payload.id);
        if (state.currentMaintenance?._id === action.payload.id) {
          state.currentMaintenance = null;
        }
      })
      
      // Approve
      .addCase(approveMaintenanceRequest.fulfilled, (state, action) => {
        const index = state.maintenanceRequests.findIndex(m => m._id === action.payload.data._id);
        if (index !== -1) {
          state.maintenanceRequests[index] = action.payload.data;
        }
        if (state.currentMaintenance?._id === action.payload.data._id) {
          state.currentMaintenance = action.payload.data;
        }
      })
      
      // Reject
      .addCase(rejectMaintenanceRequest.fulfilled, (state, action) => {
        const index = state.maintenanceRequests.findIndex(m => m._id === action.payload.data._id);
        if (index !== -1) {
          state.maintenanceRequests[index] = action.payload.data;
        }
        if (state.currentMaintenance?._id === action.payload.data._id) {
          state.currentMaintenance = action.payload.data;
        }
      })
      
      // Start Maintenance
      .addCase(startMaintenance.fulfilled, (state, action) => {
        const index = state.maintenanceRequests.findIndex(m => m._id === action.payload.data._id);
        if (index !== -1) {
          state.maintenanceRequests[index] = action.payload.data;
        }
        if (state.currentMaintenance?._id === action.payload.data._id) {
          state.currentMaintenance = action.payload.data;
        }
      })
      
      // Complete Maintenance
      .addCase(completeMaintenanceRequest.fulfilled, (state, action) => {
        const index = state.maintenanceRequests.findIndex(m => m._id === action.payload.data._id);
        if (index !== -1) {
          state.maintenanceRequests[index] = action.payload.data;
        }
        if (state.currentMaintenance?._id === action.payload.data._id) {
          state.currentMaintenance = action.payload.data;
        }
      })
      
      // Fetch Statistics
      .addCase(fetchMaintenanceStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload.data;
      });
  }
});

export const { 
  clearError, 
  setFilters, 
  resetFilters, 
  clearCurrentMaintenance 
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;