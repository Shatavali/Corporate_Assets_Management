import React from 'react';
import { FileText } from 'lucide-react';

const ReportTable = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No data available for this report</p>
        <p className="text-sm text-gray-400 mt-1">Generate a report to see results</p>
      </div>
    );
  }

  // Get all unique keys from the data, excluding internal fields
  const excludeFields = ['_id', '__v', 'password', 'createdAt', 'updatedAt'];
  const headers = Object.keys(data[0] || {}).filter(key => !excludeFields.includes(key));

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      if (value.name) return value.name;
      if (value.assetName) return value.assetName;
      return JSON.stringify(value);
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {header.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              {headers.map((header) => (
                <td key={header} className="px-6 py-4 text-sm text-gray-600">
                  {formatValue(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;