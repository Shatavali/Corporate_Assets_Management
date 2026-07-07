import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Wrench, ArrowLeftRight, Download, Printer } from 'lucide-react';
import {
  generateAssetReport,
  generateMaintenanceReport,
  generateAllocationReport,
  clearReports
} from '../../redux/slices/reportSlice';
import reportService from '../../services/reportService';
import ReportCard from '../../components/reports/ReportCard';
import ReportTable from '../../components/reports/ReportTable';
import ReportFilters from '../../components/reports/ReportFilters';
import ExportButtons from '../../components/reports/ExportButtons';

const Reports = () => {
  const dispatch = useDispatch();
  const { 
    assetReport, 
    maintenanceReport, 
    allocationReport, 
    loading, 
    activeReport 
  } = useSelector((state) => state.reports);
  
  const [filters, setFilters] = useState({});

  const handleGenerateAssetReport = () => {
    dispatch(generateAssetReport(filters));
  };

  const handleGenerateMaintenanceReport = () => {
    dispatch(generateMaintenanceReport(filters));
  };

  const handleGenerateAllocationReport = () => {
    dispatch(generateAllocationReport(filters));
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleExportCSV = () => {
    let data = null;
    let filename = '';
    
    if (activeReport === 'assets' && assetReport) {
      data = assetReport.data;
      filename = `asset-report-${new Date().toISOString().split('T')[0]}`;
    } else if (activeReport === 'maintenance' && maintenanceReport) {
      data = maintenanceReport.data;
      filename = `maintenance-report-${new Date().toISOString().split('T')[0]}`;
    } else if (activeReport === 'allocations' && allocationReport) {
      data = allocationReport.data;
      filename = `allocation-report-${new Date().toISOString().split('T')[0]}`;
    }
    
    if (data) {
      reportService.exportToCSV(data, filename);
    }
  };

  const handleExportJSON = () => {
    let data = null;
    let filename = '';
    
    if (activeReport === 'assets' && assetReport) {
      data = assetReport;
      filename = `asset-report-${new Date().toISOString().split('T')[0]}`;
    } else if (activeReport === 'maintenance' && maintenanceReport) {
      data = maintenanceReport;
      filename = `maintenance-report-${new Date().toISOString().split('T')[0]}`;
    } else if (activeReport === 'allocations' && allocationReport) {
      data = allocationReport;
      filename = `allocation-report-${new Date().toISOString().split('T')[0]}`;
    }
    
    if (data) {
      reportService.exportToJSON(data, filename);
    }
  };

  const handlePrint = () => {
    let data = null;
    let title = '';
    let reportType = '';
    
    if (activeReport === 'assets' && assetReport) {
      data = assetReport.data;
      title = 'Asset Management Report';
      reportType = 'Assets';
    } else if (activeReport === 'maintenance' && maintenanceReport) {
      data = maintenanceReport.data;
      title = 'Maintenance Report';
      reportType = 'Maintenance';
    } else if (activeReport === 'allocations' && allocationReport) {
      data = allocationReport.data;
      title = 'Asset Allocation Report';
      reportType = 'Allocations';
    }
    
    if (data) {
      reportService.printReport(data, title, reportType);
    }
  };

  const getCurrentReport = () => {
    if (activeReport === 'assets') return assetReport;
    if (activeReport === 'maintenance') return maintenanceReport;
    if (activeReport === 'allocations') return allocationReport;
    return null;
  };

  const currentReport = getCurrentReport();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export detailed reports</p>
        </div>

        {/* Report Filters */}
        {activeReport && (
          <ReportFilters 
            onFilter={handleFilter}
            onClear={handleClearFilters}
            reportType={activeReport}
          />
        )}

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ReportCard
            title="Asset Report"
            description="Generate comprehensive asset inventory report with status, condition, and assignment details"
            icon={Package}
            color="from-indigo-500 to-indigo-600"
            onClick={handleGenerateAssetReport}
            onExport={handleExportCSV}
            onPrint={handlePrint}
          />
          <ReportCard
            title="Maintenance Report"
            description="Track all maintenance requests, status, costs, and completion history"
            icon={Wrench}
            color="from-amber-500 to-orange-600"
            onClick={handleGenerateMaintenanceReport}
            onExport={handleExportCSV}
            onPrint={handlePrint}
          />
          <ReportCard
            title="Allocation Report"
            description="View asset assignments, allocation dates, returns, and user details"
            icon={ArrowLeftRight}
            color="from-emerald-500 to-green-600"
            onClick={handleGenerateAllocationReport}
            onExport={handleExportCSV}
            onPrint={handlePrint}
          />
        </div>

        {/* Report Results */}
        {(assetReport || maintenanceReport || allocationReport) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Report Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {currentReport?.reportType}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Total Records: {currentReport?.total || 0}
                  </p>
                  {Object.keys(filters).length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Filters applied: {Object.keys(filters).filter(k => filters[k]).join(', ')}
                    </p>
                  )}
                </div>
                <ExportButtons 
                  onExportCSV={handleExportCSV}
                  onExportJSON={handleExportJSON}
                  onPrint={handlePrint}
                />
              </div>
            </div>

            {/* Report Table */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <ReportTable 
                  data={currentReport?.data || []} 
                  title={currentReport?.reportType}
                />
              )}
            </div>

            {/* Report Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Generated on: {new Date().toLocaleString()} | Asset Management System v1.0
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;