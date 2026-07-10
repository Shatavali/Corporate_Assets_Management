import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import AssetList from './pages/Assets/AssetList';
import AddAsset from './pages/Assets/AddAsset';
import EditAsset from './pages/Assets/EditAsset';
import AssetDetails from './pages/Assets/AssetDetails';
import MaintenanceList from './pages/Maintenance/MaintenanceList';
import AddMaintenance from './pages/Maintenance/AddMaintenance';
import EditMaintenance from './pages/Maintenance/EditMaintenance';
import MaintenanceDetails from './pages/Maintenance/MaintenanceDetails';
import AllocationList from './pages/Allocations/AllocationList';
import AddAllocation from './pages/Allocations/AddAllocation';
import EditAllocation from './pages/Allocations/EditAllocation';
import AllocationDetails from './pages/Allocations/AllocationDetails';
import Reports from './pages/Reports/Reports';
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeDetails from './pages/Employees/EmployeeDetails';
import AddEmployee from './pages/Employees/AddEmployee';
import EditEmployee from './pages/Employees/EditEmployee';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

const isAuthenticated = () => {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes - each renders independently */}
      <Route path="/dashboard" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/assets" element={isAuthenticated() ? <AssetList /> : <Navigate to="/login" />} />
      <Route path="/assets/add" element={isAuthenticated() ? <AddAsset /> : <Navigate to="/login" />} />
      <Route path="/assets/edit/:id" element={isAuthenticated() ? <EditAsset /> : <Navigate to="/login" />} />
      <Route path="/assets/:id" element={isAuthenticated() ? <AssetDetails /> : <Navigate to="/login" />} />

      <Route path="/maintenance" element={isAuthenticated() ? <MaintenanceList /> : <Navigate to="/login" />} />
      <Route path="/maintenance/add" element={isAuthenticated() ? <AddMaintenance /> : <Navigate to="/login" />} />
      <Route path="/maintenance/edit/:id" element={isAuthenticated() ? <EditMaintenance /> : <Navigate to="/login" />} />
      <Route path="/maintenance/:id" element={isAuthenticated() ? <MaintenanceDetails /> : <Navigate to="/login" />} />

      <Route path="/allocations" element={isAuthenticated() ? <AllocationList /> : <Navigate to="/login" />} />
      <Route path="/allocations/add" element={isAuthenticated() ? <AddAllocation /> : <Navigate to="/login" />} />
      <Route path="/allocations/edit/:id" element={isAuthenticated() ? <EditAllocation /> : <Navigate to="/login" />} />
      <Route path="/allocations/:id" element={isAuthenticated() ? <AllocationDetails /> : <Navigate to="/login" />} />

      <Route path="/reports" element={isAuthenticated() ? <Reports /> : <Navigate to="/login" />} />

      <Route path="/employees" element={isAuthenticated() ? <EmployeeList /> : <Navigate to="/login" />} />
      <Route path="/employees/:id" element={isAuthenticated() ? <EmployeeDetails /> : <Navigate to="/login" />} />
      <Route path="/employees/add" element={isAuthenticated() ? <AddEmployee /> : <Navigate to="/login" />} />
      <Route path="/employees/edit/:id" element={isAuthenticated() ? <EditEmployee /> : <Navigate to="/login" />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;