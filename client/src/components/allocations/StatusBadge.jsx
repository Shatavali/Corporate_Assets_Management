import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Active': { color: 'bg-green-100 text-green-700', icon: '🟢' },
    'Returned': { color: 'bg-blue-100 text-blue-700', icon: '🔵' },
    'Overdue': { color: 'bg-red-100 text-red-700', icon: '🔴' }
  };

  const config = statusConfig[status] || statusConfig['Active'];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon} {status}
    </span>
  );
};

export default StatusBadge;