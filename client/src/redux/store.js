import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import assetReducer from './slices/assetSlice';
import employeeReducer from './slices/employeeSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import allocationReducer from './slices/allocationSlice';
import reportReducer from './slices/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetReducer,
    employees: employeeReducer,
    maintenance: maintenanceReducer,
    allocations: allocationReducer,
    reports: reportReducer,
  },
});

export default store;