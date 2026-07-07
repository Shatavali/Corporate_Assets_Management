import api from './api';

const reportService = {
  // Generate Asset Report
  generateAssetReport: async (filters = {}) => {
    const response = await api.post('/reports/assets', filters);
    return response.data;
  },

  // Generate Maintenance Report
  generateMaintenanceReport: async (filters = {}) => {
    const response = await api.post('/reports/maintenance', filters);
    return response.data;
  },

  // Generate Allocation Report
  generateAllocationReport: async (filters = {}) => {
    const response = await api.post('/reports/allocations', filters);
    return response.data;
  },

  // Export to CSV
  exportToCSV: (data, filename) => {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }
    
    const headers = Object.keys(data[0] || {});
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        let value = row[header];
        if (typeof value === 'object') value = JSON.stringify(value);
        return `"${(value || '').toString().replace(/"/g, '""')}"`;
      }).join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Export to JSON
  exportToJSON: (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Print Report
  printReport: (data, title, reportType) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - ${reportType}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; }
            h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .report-title { font-size: 24px; font-weight: bold; color: #1f2937; }
            .report-meta { color: #6b7280; font-size: 12px; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            th { background-color: #4f46e5; color: white; font-weight: 600; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
            .badge-active { background: #d1fae5; color: #065f46; }
            .badge-completed { background: #dbeafe; color: #1e40af; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="report-title">${title}</div>
            <div class="report-meta">Report Type: ${reportType}</div>
            <div class="report-meta">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0] || {}).filter(key => !key.includes('_id')).map(key => `<th>${key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.entries(row).filter(([key]) => !key.includes('_id')).map(([key, value]) => {
                    let displayValue = value;
                    if (typeof value === 'object') displayValue = JSON.stringify(value);
                    if (value === null || value === undefined) displayValue = 'N/A';
                    return `<td>${displayValue}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Asset Management System - Confidential Report</p>
            <p>This report is system generated and does not require signature</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

export default reportService;