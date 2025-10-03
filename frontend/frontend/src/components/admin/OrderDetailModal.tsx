import React, { useState, useEffect } from 'react';
import { X, User, Mail, MapPin, Package, DollarSign, Calendar, Truck, CheckCircle, Clock, Edit, Mail as MailIcon } from 'lucide-react';
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
  statusHistory?: Array<{
    status: string;
    changedBy: {
      _id: string;
      name: string;
    };
    changedAt: string;
    note?: string;
  }>;
}

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onEditOrder: (order: Order) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onEditOrder
}) => {
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      fetchOrderDetails();
    }
  }, [isOpen, order]);

  const fetchOrderDetails = async () => {
    if (!order) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      
      const response = await fetch(`${baseUrl}/api/admin/orders/${order._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setOrderDetails(data);
      } else {
        toast.error(data.message || 'Sipariş detayları yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Sipariş detayları yüklenirken hata oluştu');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return 'Bilinmiyor';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'Cash on Delivery':
        return 'Kapıda Ödeme';
      case 'Bank Transfer':
        return 'Havale';
      case 'Credit Card':
        return 'Kredi Kartı';
      default:
        return method;
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Sipariş Detayları - #{order._id.slice(-8)}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendNotification}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <MailIcon className="w-4 h-4 mr-2" />
              Bildirim Gönder
            </button>
            <button
              onClick={() => onEditOrder(order)}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Düzenle
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Order Status and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Sipariş Bilgileri
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sipariş No:</span>
                    <span className="text-sm font-medium">#{order._id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Durum:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tarih:</span>
                    <span className="text-sm font-medium">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Toplam:</span>
                    <span className="text-sm font-bold text-green-600">₺{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Ödeme Bilgileri
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Yöntem:</span>
                    <span className="text-sm font-medium">{getPaymentMethodText(order.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Durum:</span>
                    <div className="flex items-center">
                      {order.isPaid ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <Clock className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                        {order.isPaid ? 'Ödendi' : 'Ödenmedi'}
                      </span>
                    </div>
                  </div>
                  {order.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ödeme Tarihi:</span>
                      <span className="text-sm font-medium">
                        {new Date(order.paidAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Teslimat Bilgileri
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Durum:</span>
                    <div className="flex items-center">
                      {order.isDelivered ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                      )}
                      <span className={`text-sm ${order.isDelivered ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.isDelivered ? 'Teslim Edildi' : 'Teslim Edilmedi'}
                      </span>
                    </div>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Takip No:</span>
                      <span className="text-sm font-medium">{order.trackingNumber}</span>
                    </div>
                  )}
                  {order.shippingCompany && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Kargo:</span>
                      <span className="text-sm font-medium">{order.shippingCompany}</span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Teslim Tarihi:</span>
                      <span className="text-sm font-medium">
                        {new Date(order.deliveredAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Müşteri Bilgileri
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm font-medium">{order.user.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-600">{order.user.email}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Teslimat Adresi
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.postalCode} {order.shippingAddress.city}
                  </p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Sipariş Ürünleri
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ürün
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Miktar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Birim Fiyat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toplam
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.orderItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover mr-3"
                                  src={item.product.imageUrls[0]}
                                  alt={item.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">#{item.product._id.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.qty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₺{item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₺{(item.price * item.qty).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Toplam:
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          ₺{order.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.orderNotes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Sipariş Notları
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{order.orderNotes}</p>
                </div>
              </div>
            )}

            {/* Status History */}
            {orderDetails?.statusHistory && orderDetails.statusHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Durum Geçmişi
                </h3>
                <div className="space-y-3">
                  {orderDetails.statusHistory
                    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
                    .map((history, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(history.status)}`}>
                          {getStatusText(history.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(history.changedAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Değiştiren:</span> {history.changedBy.name}
                      </div>
                      {history.note && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Not:</span> {history.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal;
