import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateAllocationReport } from '../../redux/slices/reportSlice';
import reportService from '../../services/reportService';
import ReportTable from '../../components/reports/ReportTable';
import ReportFilters from '../../components/reports/ReportFilters';

const AllocationReport = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allocationReport, loading } = useSelector((state) => state.reports);
  const [filters, setFilters] = useState({});

  const handleGenerate = () => {
    dispatch(generateAllocationReport(filters));
  };

  const handleExportCSV = () => {
    if (allocationReport?.data) {
      reportService.exportToCSV(allocationReport.data, `allocation-report-${new Date().toISOString().split('T')[0]}`);
    }
  };

  const handlePrint = () => {
    if (allocationReport?.data) {
      reportService.printReport(allocationReport.data, 'Asset Allocation Report', 'Allocations');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <button onClick={() => navigate('/reports')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft size={20} />
          <span>Back to Reports</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Allocation Report</h1>
            <p className="text-gray-500 mt-1">View asset assignments and allocation history</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleGenerate} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
              Generate Report
            </button>
            {allocationReport && (
              <>
                <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
                  <Download size={16} className="inline mr-1" /> CSV
                </button>
                <button onClick={handlePrint} className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700">
                  <Printer size={16} className="inline mr-1" /> Print
                </button>
              </>
            )}
          </div>
        </div>

        <ReportFilters onFilter={setFilters} onClear={() => setFilters({})} reportType="allocations" />

        {allocationReport && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600">Total Allocations: {allocationReport.total}</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
              ) : (
                <ReportTable data={allocationReport.data} title="Allocation Report" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationReport;