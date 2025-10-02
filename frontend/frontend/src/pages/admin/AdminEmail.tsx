import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Mail, Send, Users, TestTube, Trash2 } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

const AdminEmail: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}/api/email/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else if (response.status === 401) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        // Redirect to login or refresh token
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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
    setSelectAll(!selectAll);
  };

  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSendEmail = async (isTest = false) => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast.error('Konu ve mesaj alanları zorunludur');
      return;
    }

    if (!isTest && selectedUsers.length === 0) {
      toast.error('En az bir alıcı seçmelisiniz');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isTest ? '/api/email/send-test' : '/api/email/send-bulk';
      const payload = isTest 
        ? { subject: emailData.subject, message: emailData.message }
        : { 
            subject: emailData.subject, 
            message: emailData.message,
            recipients: selectAll ? ['all'] : selectedUsers
          };

      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isTest ? 'Test e-postası gönderildi!' : data.message);
        if (!isTest) {
          // Reset form after successful bulk send
          setEmailData({ subject: '', message: '' });
          setSelectedUsers([]);
          setSelectAll(false);
        }
      } else if (response.status === 401) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        window.location.href = '/login';
      } else {
        toast.error(data.message || 'E-posta gönderilemedi');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('E-posta gönderilirken hata oluştu');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`"${userName}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
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
        // Remove from selected users if selected
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📧 Toplu E-posta Gönderimi
        </h1>
        <p className="text-gray-600">
          Müşterilerinize toplu e-posta gönderin, duyurular yapın ve iletişimde kalın.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Email Composition */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            E-posta Oluştur
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konu
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="E-posta konusu..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesaj
              </label>
              <textarea
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="E-posta mesajınızı buraya yazın..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleSendEmail(true)}
                disabled={sending}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {sending ? 'Gönderiliyor...' : 'Test Gönder'}
              </button>
              
              <button
                onClick={() => handleSendEmail(false)}
                disabled={sending || selectedUsers.length === 0}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Gönderiliyor...' : 'Toplu Gönder'}
              </button>
            </div>
          </div>
        </div>

        {/* User Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Alıcılar ({users.length} kullanıcı)
          </h2>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="mr-2"
              />
              <span className="font-medium">Tümünü Seç</span>
            </label>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-2">
            {users.map((userItem) => (
              <div
                key={userItem._id}
                className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(userItem._id)}
                  onChange={() => handleUserSelect(userItem._id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{userItem.name}</p>
                  <p className="text-sm text-gray-600">{userItem.email}</p>
                  <p className="text-xs text-gray-500">
                    Kayıt: {new Date(userItem.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteUser(userItem._id, userItem.name)}
                  disabled={deleting === userItem._id || userItem._id === user?.id}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title={userItem._id === user?.id ? "Kendi hesabınızı silemezsiniz" : "Kullanıcıyı sil"}
                >
                  {deleting === userItem._id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>{selectedUsers.length}</strong> kullanıcı seçildi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmail;
