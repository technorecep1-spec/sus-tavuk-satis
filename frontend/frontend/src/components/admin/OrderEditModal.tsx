import React, { useState, useEffect } from 'react';
import { X, Save, Package, DollarSign, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: Array<{
    name: string;
    qty: number;
    price: number;
    product: {
      _id: string;
      name: string;
      imageUrls: string[];
    };
  }>;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
  paymentMethod: 'Cash on Delivery' | 'Bank Transfer' | 'Credit Card';
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  orderNotes?: string;
  trackingNumber?: string;
  shippingCompany?: string;
}

interface OrderEditModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: Order) => void;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated
}) => {
  const [formData, setFormData] = useState({
    status: 'Pending' as 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled',
    orderNotes: '',
    trackingNumber: '',
    shippingCompany: '',
    isPaid: false,
    isDelivered: false,
    statusNote: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        orderNotes: order.orderNotes || '',
        trackingNumber: order.trackingNumber || '',
        shippingCompany: order.shippingCompany || '',
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        statusNote: ''
      });
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      
      const response = await fetch(`${baseUrl}/api/admin/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Sipariş başarıyla güncellendi');
        onOrderUpdated(data.order);
        onClose();
      } else {
        toast.error(data.message || 'Sipariş güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Sipariş güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!order) return;

    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      
      const response = await fetch(`${baseUrl}/api/admin/orders/${order._id}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'status_update'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Müşteriye bildirim gönderildi');
      } else {
        toast.error(data.message || 'Bildirim gönderilemedi');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Bildirim gönderilirken hata oluştu');
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Sipariş Düzenle - #{order._id.slice(-8)}
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
          {/* Order Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-2" />
              Sipariş Durumu
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Beklemede</option>
              <option value="Processing">İşleniyor</option>
              <option value="Shipped">Kargoda</option>
              <option value="Completed">Tamamlandı</option>
              <option value="Cancelled">İptal Edildi</option>
            </select>
          </div>

          {/* Status Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum Değişiklik Notu
            </label>
            <textarea
              value={formData.statusNote}
              onChange={(e) => setFormData({ ...formData, statusNote: e.target.value })}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Durum değişikliği hakkında not yazın..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.statusNote.length}/500 karakter
            </p>
          </div>

          {/* Payment and Delivery Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Ödeme Durumu
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isPaid"
                    checked={formData.isPaid === true}
                    onChange={() => setFormData({ ...formData, isPaid: true })}
                    className="mr-2"
                  />
                  <span className="text-sm text-green-600">Ödendi</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isPaid"
                    checked={formData.isPaid === false}
                    onChange={() => setFormData({ ...formData, isPaid: false })}
                    className="mr-2"
                  />
                  <span className="text-sm text-red-600">Ödenmedi</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Truck className="w-4 h-4 inline mr-2" />
                Teslimat Durumu
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isDelivered"
                    checked={formData.isDelivered === true}
                    onChange={() => setFormData({ ...formData, isDelivered: true })}
                    className="mr-2"
                  />
                  <span className="text-sm text-green-600">Teslim Edildi</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isDelivered"
                    checked={formData.isDelivered === false}
                    onChange={() => setFormData({ ...formData, isDelivered: false })}
                    className="mr-2"
                  />
                  <span className="text-sm text-yellow-600">Teslim Edilmedi</span>
                </label>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Truck className="w-4 h-4 inline mr-2" />
                Kargo Takip Numarası
              </label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kargo takip numarası girin..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kargo Firması
              </label>
              <input
                type="text"
                value={formData.shippingCompany}
                onChange={(e) => setFormData({ ...formData, shippingCompany: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kargo firması adı girin..."
              />
            </div>
          </div>

          {/* Order Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Sipariş Notları
            </label>
            <textarea
              value={formData.orderNotes}
              onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sipariş hakkında notlarınızı yazın..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.orderNotes.length}/1000 karakter
            </p>
          </div>

          {/* Notification Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Müşteri Bildirimi
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Sipariş durumu değiştirildiğinde müşteriye otomatik bildirim gönderilir.
                  Manuel bildirim göndermek için aşağıdaki butonu kullanabilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={handleSendNotification}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Manuel Bildirim Gönder
                </button>
              </div>
            </div>
          </div>

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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEditModal;
