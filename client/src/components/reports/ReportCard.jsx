import React from 'react';
import { FileText, Download, Printer, Eye } from 'lucide-react';

const ReportCard = ({ title, description, icon: Icon, color, onClick, onExport, onPrint }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div className="flex space-x-3">
        <button
          onClick={onClick}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Eye size={16} />
          <span>Generate</span>
        </button>
        <button
          onClick={onExport}
          className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          title="Export CSV"
        >
          <Download size={16} />
        </button>
        <button
          onClick={onPrint}
          className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          title="Print"
        >
          <Printer size={16} />
        </button>
      </div>
    </div>
  );
};

export default ReportCard;