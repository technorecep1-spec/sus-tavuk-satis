import React from 'react';
import { X, Trash2, AlertTriangle, Package } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Live Bird' | 'Feed' | 'Equipment';
  imageUrls: string[];
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
  loading?: boolean;
}

const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  product,
  loading = false
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
            Ürün Sil
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0">
              <img
                src={product.imageUrls[0] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-md"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>₺{product.price}</span>
                <span>•</span>
                <span>Stok: {product.stock}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  product.category === 'Live Bird' ? 'bg-green-100 text-green-800' :
                  product.category === 'Feed' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {product.category === 'Live Bird' ? 'Canlı Kuş' :
                   product.category === 'Feed' ? 'Yem' : 'Ekipman'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Bu işlem geri alınamaz!
                </h4>
                <p className="text-sm text-red-700">
                  Bu ürünü silmek istediğinizden emin misiniz? Bu işlem sonrasında ürün kalıcı olarak silinecek ve müşteriler bu ürünü göremeyecek.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <Package className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                  Dikkat Edilmesi Gerekenler
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Bu ürünle ilgili aktif siparişler varsa sorun yaşanabilir</li>
                  <li>• Ürün resimleri de silinecek</li>
                  <li>• Bu işlem geri alınamaz</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Siliniyor...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Evet, Sil
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDeleteModal;
