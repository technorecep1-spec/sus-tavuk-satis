import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Users, Trash2, Shield, Calendar, Mail, Search, Filter } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin?: boolean;
}

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'user'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterType]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/email/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else if (response.status === 401) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        window.location.href = '/login';
      } else {
        toast.error('Kullanıcılar yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType === 'admin') {
      filtered = filtered.filter(user => user.email === process.env.REACT_APP_ADMIN_EMAIL);
    } else if (filterType === 'user') {
      filtered = filtered.filter(user => user.email !== process.env.REACT_APP_ADMIN_EMAIL);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`"${userName}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setDeleting(userId);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/email/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${userName} kullanıcısı silindi`);
        // Remove user from list
        setUsers(users.filter(u => u._id !== userId));
      } else {
        toast.error(data.message || 'Kullanıcı silinemedi');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Kullanıcı silinirken hata oluştu');
    } finally {
      setDeleting(null);
    }
  };

  const isUserAdmin = (userEmail: string) => {
    return userEmail === process.env.REACT_APP_ADMIN_EMAIL;
  };

  if (!user?.isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Users className="w-8 h-8 mr-3 text-blue-600" />
          👥 Kullanıcı Yönetimi
        </h1>
        <p className="text-gray-600">
          Kayıtlı kullanıcıları görüntüleyin, yönetin ve silin.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => isUserAdmin(u.email)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bu Ay Kayıt</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => {
                  const userDate = new Date(u.createdAt);
                  const now = new Date();
                  return userDate.getMonth() === now.getMonth() && 
                         userDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Kullanıcı adı veya e-posta ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'admin' | 'user')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Kullanıcılar</option>
              <option value="admin">Sadece Adminler</option>
              <option value="user">Sadece Kullanıcılar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Kullanıcı Listesi ({filteredUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-posta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((userItem) => (
                <tr key={userItem._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {userItem.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{userItem.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isUserAdmin(userItem.email) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Kullanıcı
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(userItem.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(userItem._id, userItem.name)}
                      disabled={deleting === userItem._id || userItem._id === user?.id || isUserAdmin(userItem.email)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      title={
                        userItem._id === user?.id ? "Kendi hesabınızı silemezsiniz" :
                        isUserAdmin(userItem.email) ? "Admin kullanıcıları silinemez" :
                        "Kullanıcıyı sil"
                      }
                    >
                      {deleting === userItem._id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Kullanıcı bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Arama kriterlerinize uygun kullanıcı bulunamadı.'
                : 'Henüz kayıtlı kullanıcı bulunmuyor.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
