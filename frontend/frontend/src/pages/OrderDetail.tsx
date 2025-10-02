import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: order, isLoading, error } = useQuery(
    ['order', id],
    () => api.get(`/orders/${id}`).then(res => res.data),
    { enabled: !!id }
  );

  if (isLoading) return <LoadingSpinner />;
  
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Link to="/my-orders" className="btn-primary">
            <ArrowLeft className="inline mr-2" size={16} />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Package className="text-yellow-500" size={24} />;
      case 'Processing':
        return <Package className="text-blue-500" size={24} />;
      case 'Shipped':
        return <Truck className="text-purple-500" size={24} />;
      case 'Completed':
        return <CheckCircle className="text-green-500" size={24} />;
      default:
        return <Package className="text-gray-500" size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/my-orders" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="mr-2" size={16} />
            Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h1>
                <p className="text-orange-100">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-2xl font-bold">${order.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Order Items */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="text-gray-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.qty).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2" size={24} />
                Shipping Information
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">
                  {order.shippingAddress.address}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>$15.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>${(order.totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${(order.totalPrice + 15 + order.totalPrice * 0.08).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
