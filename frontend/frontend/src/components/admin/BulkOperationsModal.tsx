import React, { useState } from 'react';
import { X, Save, Mail, Download, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkOperationsModalProps {
  selectedOrders: string[];
  isOpen: boolean;
  onClose: () => void;
  onOrdersUpdated: () => void;
}

const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  selectedOrders,
  isOpen,
  onClose,
  onOrdersUpdated
}) => {
  const [operation, setOperation] = useState<'status' | 'notify' | 'export'>('status');
  const [status, setStatus] = useState('Pending');
  const [statusNote, setStatusNote] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrders.length === 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      
      let response;
      
      switch (operation) {
        case 'status':
          response = await fetch(`${baseUrl}/api/admin/orders/bulk/status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderIds: selectedOrders,
              status: status,
              statusNote: statusNote
            })
          });
          break;
          
        case 'notify':
          response = await fetch(`${baseUrl}/api/admin/orders/bulk/notify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderIds: selectedOrders,
              message: notificationMessage,
              type: 'status_update'
            })
          });
          break;
          
        case 'export':
          response = await fetch(`${baseUrl}/api/admin/orders/bulk/export`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderIds: selectedOrders
            })
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `secilen_siparisler_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('CSV dosyası indirildi');
            onClose();
            return;
          }
          break;
      }

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'İşlem başarıyla tamamlandı');
        onOrdersUpdated();
        onClose();
      } else {
        toast.error(data.message || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Bulk operation error:', error);
      toast.error('İşlem sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Beklemede';
      case 'Processing':
        return 'İşleniyor';
      case 'Shipped':
        return 'Kargoda';
      case 'Completed':
        return 'Tamamlandı';
      case 'Cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Toplu İşlemler ({selectedOrders.length} sipariş)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Operation Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              İşlem Türü
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                operation === 'status' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="operation"
                  value="status"
                  checked={operation === 'status'}
                  onChange={(e) => setOperation(e.target.value as any)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Durum Güncelle</div>
                    <div className="text-sm text-gray-500">Seçili siparişlerin durumunu değiştir</div>
                  </div>
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                operation === 'notify' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="operation"
                  value="notify"
                  checked={operation === 'notify'}
                  onChange={(e) => setOperation(e.target.value as any)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Bildirim Gönder</div>
                    <div className="text-sm text-gray-500">Müşterilere email gönder</div>
                  </div>
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                operation === 'export' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="operation"
                  value="export"
                  checked={operation === 'export'}
                  onChange={(e) => setOperation(e.target.value as any)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <Download className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">CSV Export</div>
                    <div className="text-sm text-gray-500">Seçili siparişleri dışa aktar</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Status Update Form */}
          {operation === 'status' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Durum
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Beklemede</option>
                  <option value="Processing">İşleniyor</option>
                  <option value="Shipped">Kargoda</option>
                  <option value="Completed">Tamamlandı</option>
                  <option value="Cancelled">İptal Edildi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum Değişiklik Notu
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Durum değişikliği hakkında not yazın..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {statusNote.length}/500 karakter
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">
                      Dikkat
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Bu işlem {selectedOrders.length} siparişin durumunu "{getStatusText(status)}" olarak değiştirecektir.
                      Bu işlem geri alınamaz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Form */}
          {operation === 'notify' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bildirim Mesajı
                </label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Müşterilere gönderilecek mesajı yazın..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {notificationMessage.length}/1000 karakter
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">
                      Bildirim Bilgisi
                    </h3>
                    <p className="text-sm text-blue-700">
                      Bu mesaj {selectedOrders.length} müşteriye email olarak gönderilecektir.
                      Boş bırakırsanız varsayılan mesaj gönderilir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Form */}
          {operation === 'export' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="flex items-start">
                  <Download className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-purple-800 mb-1">
                      Export Bilgisi
                    </h3>
                    <p className="text-sm text-purple-700">
                      Seçili {selectedOrders.length} sipariş CSV formatında indirilecektir.
                      Dosya şu bilgileri içerecektir: Sipariş No, Müşteri, E-posta, Durum, Tutar, Ödeme, Teslimat, Tarih, Kargo Takip.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || selectedOrders.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {operation === 'export' ? 'İndir' : 'Uygula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkOperationsModal;
