import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, UserCheck, UserX, Shield } from 'lucide-react';

const EmployeeTable = ({ employees, onDelete, onToggleStatus, onUpdateRole, isAdmin }) => {
  const navigate = useNavigate();

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    employee: 'bg-green-100 text-green-700'
  };

  const departmentColors = {
    IT: 'bg-indigo-100 text-indigo-700',
    HR: 'bg-pink-100 text-pink-700',
    Finance: 'bg-emerald-100 text-emerald-700',
    Operations: 'bg-orange-100 text-orange-700',
    Sales: 'bg-cyan-100 text-cyan-700',
    Marketing: 'bg-rose-100 text-rose-700',
    Other: 'bg-gray-100 text-gray-700'
  };

  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={48} className="text-gray-400" />
        </div>
        <p className="text-gray-500">No employees found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Employee ID</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {employees.map((employee) => (
            <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {employee.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{employee.name}</p>
                    <p className="text-xs text-gray-500">{employee.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-mono text-gray-600">{employee.employeeId || 'N/A'}</span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${departmentColors[employee.department] || departmentColors.Other}`}>
                  {employee.department}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[employee.role]}`}>
                  {employee.role}
                </span>
              </td>
              <td className="px-6 py-4">
                {employee.isActive ? (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">{employee.phoneNumber || 'N/A'}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => navigate(`/employees/${employee._id}`)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => navigate(`/employees/edit/${employee._id}`)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onToggleStatus(employee._id)}
                        className="p-1.5 text-gray-500 hover:text-yellow-600 transition-colors"
                        title={employee.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {employee.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <select
                        onChange={(e) => onUpdateRole(employee._id, e.target.value)}
                        value={employee.role}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white"
                        title="Change Role"
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => onDelete(employee._id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;