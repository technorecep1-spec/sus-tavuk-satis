import React, { useState } from 'react';
import { X, Settings, Trash2, ToggleLeft, ToggleRight, DollarSign, Package, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: 'Live Bird' | 'Feed' | 'Equipment';
  isActive: boolean;
}

interface ProductBulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onBulkUpdate: (action: string, data: any) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
}

const ProductBulkOperationsModal: React.FC<ProductBulkOperationsModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  onBulkUpdate,
  onBulkDelete,
  onBulkExport
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [bulkData, setBulkData] = useState({
    status: 'active',
    category: '',
    priceChange: '',
    priceChangeType: 'set'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleActionChange = (action: string) => {
    setSelectedAction(action);
    setBulkData({
      status: 'active',
      category: '',
      priceChange: '',
      priceChangeType: 'set'
    });
  };

  const handleBulkAction = async () => {
    if (!selectedAction) {
      toast.error('Lütfen bir işlem seçin');
      return;
    }

    setLoading(true);
    try {
      switch (selectedAction) {
        case 'status':
          if (!bulkData.status) {
            toast.error('Lütfen durum seçin');
            return;
          }
          await onBulkUpdate('status', { status: bulkData.status });
          break;
        case 'category':
          if (!bulkData.category) {
            toast.error('Lütfen kategori seçin');
            return;
          }
          await onBulkUpdate('category', { category: bulkData.category });
          break;
        case 'price':
          if (!bulkData.priceChange) {
            toast.error('Lütfen fiyat değişikliği girin');
            return;
          }
          await onBulkUpdate('price', { 
            priceChange: parseFloat(bulkData.priceChange),
            priceChangeType: bulkData.priceChangeType
          });
          break;
        case 'delete':
          await onBulkDelete();
          break;
        case 'export':
          await onBulkExport();
          break;
      }
      onClose();
    } catch (error) {
      console.error('Bulk operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'Live Bird': return 'Canlı Kuş';
      case 'Feed': return 'Yem';
      case 'Equipment': return 'Ekipman';
      default: return category;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-3 text-blue-600" />
            Toplu İşlemler
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Selected Products Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Seçili Ürünler ({selectedProducts.length})
            </h3>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
              {selectedProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700">{product.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">₺{product.price}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">İşlem Seçin</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Status Change */}
              <button
                onClick={() => handleActionChange('status')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedAction === 'status'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <ToggleRight className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="font-medium">Durum Değiştir</span>
                </div>
                <p className="text-sm text-gray-600">Ürünleri aktif/pasif yap</p>
              </button>

              {/* Category Change */}
              <button
                onClick={() => handleActionChange('category')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedAction === 'category'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <Package className="w-5 h-5 mr-2 text-green-600" />
                  <span className="font-medium">Kategori Değiştir</span>
                </div>
                <p className="text-sm text-gray-600">Ürün kategorilerini güncelle</p>
              </button>

              {/* Price Change */}
              <button
                onClick={() => handleActionChange('price')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedAction === 'price'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
                  <span className="font-medium">Fiyat Değiştir</span>
                </div>
                <p className="text-sm text-gray-600">Toplu fiyat güncellemesi</p>
              </button>

              {/* Export */}
              <button
                onClick={() => handleActionChange('export')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedAction === 'export'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <Download className="w-5 h-5 mr-2 text-purple-600" />
                  <span className="font-medium">CSV Export</span>
                </div>
                <p className="text-sm text-gray-600">Seçili ürünleri dışa aktar</p>
              </button>
            </div>

            {/* Delete Action */}
            <button
              onClick={() => handleActionChange('delete')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                selectedAction === 'delete'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center">
                <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-medium text-red-600">Toplu Silme</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Seçili ürünleri kalıcı olarak sil</p>
            </button>
          </div>

          {/* Action Configuration */}
          {selectedAction && selectedAction !== 'export' && selectedAction !== 'delete' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">İşlem Ayarları</h4>
              
              {selectedAction === 'status' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Durum
                  </label>
                  <select
                    value={bulkData.status}
                    onChange={(e) => setBulkData({ ...bulkData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              )}

              {selectedAction === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Kategori
                  </label>
                  <select
                    value={bulkData.category}
                    onChange={(e) => setBulkData({ ...bulkData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Kategori seçin...</option>
                    <option value="Live Bird">Canlı Kuş</option>
                    <option value="Feed">Yem</option>
                    <option value="Equipment">Ekipman</option>
                  </select>
                </div>
              )}

              {selectedAction === 'price' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiyat Değişikliği Türü
                    </label>
                    <select
                      value={bulkData.priceChangeType}
                      onChange={(e) => setBulkData({ ...bulkData, priceChangeType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="set">Belirli fiyata ayarla</option>
                      <option value="increase">Artır</option>
                      <option value="decrease">Azalt</option>
                      <option value="percentage">Yüzde olarak değiştir</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {bulkData.priceChangeType === 'percentage' ? 'Yüzde (%)' : 'Miktar (₺)'}
                    </label>
                    <input
                      type="number"
                      value={bulkData.priceChange}
                      onChange={(e) => setBulkData({ ...bulkData, priceChange: e.target.value })}
                      placeholder={bulkData.priceChangeType === 'percentage' ? '10' : '100'}
                      step={bulkData.priceChangeType === 'percentage' ? '1' : '0.01'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleBulkAction}
            disabled={loading || !selectedAction}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                İşleniyor...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                İşlemi Uygula
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductBulkOperationsModal;
