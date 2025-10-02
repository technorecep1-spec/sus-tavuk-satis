import React from 'react';
import { useQuery } from 'react-query';
import { Users, Package, ShoppingCart, FileText, Image, DollarSign, Mail } from 'lucide-react';
import { api } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { data: dashboardData, isLoading } = useQuery('admin-dashboard', () =>
    api.get('/admin/dashboard').then(res => res.data)
  );

  if (isLoading) return <LoadingSpinner />;

  const stats = dashboardData?.stats || {};
  const recentOrders = dashboardData?.recentOrders || [];
  const recentUsers = dashboardData?.recentUsers || [];

  const statCards = [
    {
      title: t('admin.totalUsers'),
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: t('admin.totalProducts'),
      value: stats.totalProducts || 0,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t('admin.totalOrders'),
      value: stats.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: t('admin.totalRevenue'),
      value: `$${(stats.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: t('admin.blogPosts'),
      value: stats.totalBlogPosts || 0,
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: t('admin.galleryImages'),
      value: stats.totalGalleryImages || 0,
      icon: Image,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
          <p className="text-gray-600">{t('admin.welcomeMessage')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('admin.recentOrders')}</h2>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('admin.noRecentOrders')}</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">
                          {t('orders.orderNumber')} #{order._id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.user?.name || t('admin.unknownUser')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${order.totalPrice.toFixed(2)}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('admin.recentUsers')}</h2>
            </div>
            <div className="p-6">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('admin.noRecentUsers')}</p>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user: any) => (
                    <div key={user._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/products"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">{t('admin.manageProducts')}</p>
                  <p className="text-sm text-gray-600">{t('admin.manageProductsDesc')}</p>
                </div>
              </div>
            </a>

            <a
              href="/admin/orders"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">{t('admin.manageOrders')}</p>
                  <p className="text-sm text-gray-600">{t('admin.manageOrdersDesc')}</p>
                </div>
              </div>
            </a>

            <a
              href="/admin/blog"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">{t('admin.manageBlog')}</p>
                  <p className="text-sm text-gray-600">{t('admin.manageBlogDesc')}</p>
                </div>
              </div>
            </a>

            <a
              href="/admin/gallery"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center">
                <Image className="h-8 w-8 text-pink-600 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">{t('admin.manageGallery')}</p>
                  <p className="text-sm text-gray-600">{t('admin.manageGalleryDesc')}</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/email"
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900">📧 Toplu E-posta</p>
                  <p className="text-sm text-gray-600">Müşterilere e-posta gönder</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
