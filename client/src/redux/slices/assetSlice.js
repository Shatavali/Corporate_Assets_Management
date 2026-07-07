import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import assetService from '../../services/assetService';
import toast from 'react-hot-toast';

// Async thunks
export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (params, { rejectWithValue }) => {
    try {
      const response = await assetService.getAssets(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assets');
    }
  }
);

export const fetchAssetById = createAsyncThunk(
  'assets/fetchAssetById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await assetService.getAssetById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asset');
    }
  }
);

export const createAsset = createAsyncThunk(
  'assets/createAsset',
  async (assetData, { rejectWithValue }) => {
    try {
      const response = await assetService.createAsset(assetData);
      toast.success('Asset created successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create asset';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAsset = createAsyncThunk(
  'assets/updateAsset',
  async ({ id, assetData }, { rejectWithValue }) => {
    try {
      const response = await assetService.updateAsset(id, assetData);
      toast.success('Asset updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update asset';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteAsset = createAsyncThunk(
  'assets/deleteAsset',
  async (id, { rejectWithValue }) => {
    try {
      const response = await assetService.deleteAsset(id);
      toast.success('Asset deleted successfully!');
      return { id, ...response };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete asset';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchAssetStatistics = createAsyncThunk(
  'assets/fetchAssetStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await assetService.getAssetStatistics();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const assignAsset = createAsyncThunk(
  'assets/assignAsset',
  async ({ id, assignData }, { rejectWithValue }) => {
    try {
      // ✅ This will now call the correct POST /api/assets/:id/assign endpoint
      const response = await assetService.assignAsset(id, assignData);
      toast.success('Asset assigned successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to assign asset';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const returnAsset = createAsyncThunk(
  'assets/returnAsset',
  async (id, { rejectWithValue }) => {
    try {
      const response = await assetService.returnAsset(id);
      toast.success('Asset returned successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to return asset';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  assets: [],
  currentAsset: null,
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
    search: '',
    category: '',
    status: '',
    assignedTo: ''
  }
};

const assetSlice = createSlice({
  name: 'assets',
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
    clearCurrentAsset: (state) => {
      state.currentAsset = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAssetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAsset = action.payload.data;
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.assets.unshift(action.payload.data);
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        const index = state.assets.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) state.assets[index] = action.payload.data;
        if (state.currentAsset?._id === action.payload.data._id) state.currentAsset = action.payload.data;
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.assets = state.assets.filter(a => a._id !== action.payload.id);
        if (state.currentAsset?._id === action.payload.id) state.currentAsset = null;
      })
      .addCase(assignAsset.fulfilled, (state, action) => {
        const index = state.assets.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) state.assets[index] = action.payload.data;
        if (state.currentAsset?._id === action.payload.data._id) state.currentAsset = action.payload.data;
      })
      .addCase(returnAsset.fulfilled, (state, action) => {
        const index = state.assets.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) state.assets[index] = action.payload.data;
        if (state.currentAsset?._id === action.payload.data._id) state.currentAsset = action.payload.data;
      })
      .addCase(fetchAssetStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload.data;
      });
  }
});

export const { clearError, setFilters, resetFilters, setPage, clearCurrentAsset } = assetSlice.actions;
export default assetSlice.reducer;