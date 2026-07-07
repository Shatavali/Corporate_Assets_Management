import React from 'react';
import { Download, Printer, FileJson, FileSpreadsheet } from 'lucide-react';

const ExportButtons = ({ onExportCSV, onExportJSON, onPrint }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onExportCSV}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        title="Export as CSV"
      >
        <FileSpreadsheet size={16} />
        <span className="text-sm">CSV</span>
      </button>
      <button
        onClick={onExportJSON}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        title="Export as JSON"
      >
        <FileJson size={16} />
        <span className="text-sm">JSON</span>
      </button>
      <button
        onClick={onPrint}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
        title="Print Report"
      >
        <Printer size={16} />
        <span className="text-sm">Print</span>
      </button>
    </div>
  );
};

export default ExportButtons;