import React from 'react';
import { Package, Users, Wrench, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const AssetStats = ({ statistics }) => {
  const stats = [
    {
      title: 'Total Assets',
      value: statistics?.total || 0,
      icon: Package,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-500/10'
    },
    {
      title: 'Assigned',
      value: statistics?.assigned || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Available',
      value: statistics?.available || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Under Maintenance',
      value: statistics?.maintenance || 0,
      icon: Wrench,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Damaged',
      value: statistics?.damaged || 0,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon size={24} className={`text-${stat.color.split('-')[1]}-600`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetStats;