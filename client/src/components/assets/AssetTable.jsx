import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, QrCode, ArrowRightLeft, Package, User, AlertCircle } from 'lucide-react';
import AssetQRCode from './AssetQRCode';
import DeleteConfirmModal from './DeleteConfirmModal';

const AssetTable = ({ assets, onDelete, onReturn, isAdminOrManager }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const statusColors = {
    'Available': 'bg-green-100 text-green-700',
    'Assigned': 'bg-blue-100 text-blue-700',
    'Under Maintenance': 'bg-yellow-100 text-yellow-700',
    'Lost': 'bg-red-100 text-red-700',
    'Damaged': 'bg-red-100 text-red-700',
    'Retired': 'bg-gray-100 text-gray-700'
  };

  const conditionIcons = {
    'Excellent': '🟢',
    'Good': '✅',
    'Fair': '⚠️',
    'Poor': '🔴',
    'Critical': '💀'
  };

  const handleShowQR = (asset) => {
    setSelectedAsset(asset);
    setShowQRModal(true);
  };

  const handleDeleteClick = (asset) => {
    setSelectedAsset(asset);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAsset) {
      onDelete(selectedAsset._id);
      setShowDeleteModal(false);
      setSelectedAsset(null);
    }
  };

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No assets found</p>
        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new asset</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tag/Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchase Date</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assets.map((asset) => (
              <tr key={asset._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-800">{asset.assetName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {asset.brand} {asset.model}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-mono text-gray-600">{asset.assetTag}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{asset.category}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[asset.status]}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {conditionIcons[asset.condition]} {asset.condition}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {asset.assignedTo ? (
                    <div className="flex items-center space-x-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{asset.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Not Assigned</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {new Date(asset.purchaseDate).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Link
                      to={`/assets/${asset._id}`}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => handleShowQR(asset)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                      title="Show QR Code"
                    >
                      <QrCode size={16} />
                    </button>
                    {isAdminOrManager && (
                      <>
                        <Link
                          to={`/assets/edit/${asset._id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        {asset.status === 'Assigned' && (
                          <button
                            onClick={() => onReturn(asset._id)}
                            className="p-1.5 text-gray-500 hover:text-green-600 transition-colors"
                            title="Return Asset"
                          >
                            <ArrowRightLeft size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(asset)}
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

      {/* Modals */}
      {showQRModal && selectedAsset && (
        <AssetQRCode asset={selectedAsset} onClose={() => setShowQRModal(false)} />
      )}
      {showDeleteModal && selectedAsset && (
        <DeleteConfirmModal
          asset={selectedAsset}
          onConfirm={handleConfirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
};

export default AssetTable;