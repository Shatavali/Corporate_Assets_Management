import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import allocationService from '../../services/allocationService';
import toast from 'react-hot-toast';

// Fetch all allocations
export const fetchAllocations = createAsyncThunk(
  'allocations/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await allocationService.getAllocations(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch allocations');
    }
  }
);

// Fetch single allocation
export const fetchAllocationById = createAsyncThunk(
  'allocations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await allocationService.getAllocationById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch allocation');
    }
  }
);

// Create allocation (auto-assigns asset)
export const createAllocation = createAsyncThunk(
  'allocations/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await allocationService.createAllocation(data);
      toast.success('Asset allocated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create allocation';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update allocation
export const updateAllocation = createAsyncThunk(
  'allocations/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await allocationService.updateAllocation(id, data);
      toast.success('Allocation updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update allocation';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete allocation (frees asset if active)
export const deleteAllocation = createAsyncThunk(
  'allocations/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await allocationService.deleteAllocation(id);
      toast.success('Allocation deleted successfully!');
      return { id, ...response };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete allocation';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Return allocation (dedicated endpoint)
export const returnAllocation = createAsyncThunk(
  'allocations/return',
  async (id, { rejectWithValue }) => {
    try {
      const response = await allocationService.returnAllocation(id);
      toast.success('Asset returned successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to return asset';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Fetch statistics
export const fetchAllocationStatistics = createAsyncThunk(
  'allocations/statistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await allocationService.getAllocationStatistics();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

const initialState = {
  allocations: [],
  currentAllocation: null,
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
    search: ''
  }
};

const allocationSlice = createSlice({
  name: 'allocations',
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
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearCurrentAllocation: (state) => {
      state.currentAllocation = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAllocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.allocations = action.payload.data;
        state.pagination.total = action.payload.count || 0;
      })
      .addCase(fetchAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchAllocationById.fulfilled, (state, action) => {
        state.currentAllocation = action.payload.data;
      })
      // Create
      .addCase(createAllocation.fulfilled, (state, action) => {
        state.allocations.unshift(action.payload.data);
      })
      // Update
      .addCase(updateAllocation.fulfilled, (state, action) => {
        const index = state.allocations.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) {
          state.allocations[index] = action.payload.data;
        }
        if (state.currentAllocation?._id === action.payload.data._id) {
          state.currentAllocation = action.payload.data;
        }
      })
      // Delete
      .addCase(deleteAllocation.fulfilled, (state, action) => {
        state.allocations = state.allocations.filter(a => a._id !== action.payload.id);
        if (state.currentAllocation?._id === action.payload.id) {
          state.currentAllocation = null;
        }
      })
      // Return
      .addCase(returnAllocation.fulfilled, (state, action) => {
        const index = state.allocations.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) {
          state.allocations[index] = action.payload.data;
        }
        if (state.currentAllocation?._id === action.payload.data._id) {
          state.currentAllocation = action.payload.data;
        }
      })
      // Statistics
      .addCase(fetchAllocationStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload.data;
      });
  }
});

export const { 
  clearError, 
  setFilters, 
  resetFilters, 
  setPage, 
  clearCurrentAllocation 
} = allocationSlice.actions;

export default allocationSlice.reducer;