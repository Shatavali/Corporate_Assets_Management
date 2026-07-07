import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import assetService from '../../services/assetService';

const AssetQRCode = ({ asset, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await assetService.getAssetQRCode(asset._id);
        setQrData(response.data);
      } catch (error) {
        console.error('Error fetching QR code:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQRCode();
  }, [asset._id]);

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${asset.assetTag}-qrcode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Asset QR Code</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 text-center">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                <QRCode
                  id="qr-code-svg"
                  value={JSON.stringify({
                    id: asset._id,
                    tag: asset.assetTag,
                    name: asset.assetName
                  })}
                  size={200}
                  level="H"
                />
              </div>

              <div className="mt-4">
                <p className="font-semibold text-gray-800">{asset.assetName}</p>
                <p className="text-sm text-gray-500 font-mono mt-1">{asset.assetTag}</p>
              </div>

              <button
                onClick={handleDownload}
                className="mt-6 flex items-center justify-center space-x-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Download size={18} />
                <span>Download QR Code</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetQRCode;