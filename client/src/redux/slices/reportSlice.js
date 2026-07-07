import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportService from '../../services/reportService';
import toast from 'react-hot-toast';

// Async thunks
export const generateAssetReport = createAsyncThunk(
  'reports/assets',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await reportService.generateAssetReport(filters);
      toast.success('Asset report generated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate asset report';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const generateMaintenanceReport = createAsyncThunk(
  'reports/maintenance',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await reportService.generateMaintenanceReport(filters);
      toast.success('Maintenance report generated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate maintenance report';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const generateAllocationReport = createAsyncThunk(
  'reports/allocations',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await reportService.generateAllocationReport(filters);
      toast.success('Allocation report generated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate allocation report';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  assetReport: null,
  maintenanceReport: null,
  allocationReport: null,
  loading: false,
  error: null,
  activeReport: null // 'assets', 'maintenance', 'allocations'
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReports: (state) => {
      state.assetReport = null;
      state.maintenanceReport = null;
      state.allocationReport = null;
      state.activeReport = null;
    },
    setActiveReport: (state, action) => {
      state.activeReport = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Asset Report
      .addCase(generateAssetReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateAssetReport.fulfilled, (state, action) => {
        state.loading = false;
        state.assetReport = action.payload;
        state.activeReport = 'assets';
      })
      .addCase(generateAssetReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Maintenance Report
      .addCase(generateMaintenanceReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateMaintenanceReport.fulfilled, (state, action) => {
        state.loading = false;
        state.maintenanceReport = action.payload;
        state.activeReport = 'maintenance';
      })
      .addCase(generateMaintenanceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Allocation Report
      .addCase(generateAllocationReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateAllocationReport.fulfilled, (state, action) => {
        state.loading = false;
        state.allocationReport = action.payload;
        state.activeReport = 'allocations';
      })
      .addCase(generateAllocationReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearReports, setActiveReport } = reportSlice.actions;
export default reportSlice.reducer;