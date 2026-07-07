import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Reported': { color: 'bg-yellow-100 text-yellow-700', icon: '📝' },
    'Approved': { color: 'bg-blue-100 text-blue-700', icon: '✅' },
    'In Progress': { color: 'bg-purple-100 text-purple-700', icon: '🔄' },
    'Completed': { color: 'bg-green-100 text-green-700', icon: '✔️' },
    'Cancelled': { color: 'bg-red-100 text-red-700', icon: '❌' }
  };

  const config = statusConfig[status] || statusConfig['Reported'];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon} {status}
    </span>
  );
};

export default StatusBadge;