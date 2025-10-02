import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Geçersiz doğrulama linki');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        
        // Auto login after successful verification
        if (response.data.token && response.data.user) {
          login(response.data.token, response.data.user);
          toast.success('E-posta adresiniz başarıyla doğrulandı!');
          setStatus('success');
          setMessage(response.data.message);
          
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Doğrulama sırasında hata oluştu');
        toast.error(error.response?.data?.message || 'Doğrulama başarısız');
      }
    };

    verifyEmail();
  }, [token, login, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">E-posta adresiniz doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                Doğrulama Başarılı!
              </h2>
              <p className="text-green-700 mb-4">{message}</p>
              <p className="text-sm text-green-600">
                Anasayfaya yönlendiriliyorsunuz...
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                Doğrulama Başarısız
              </h2>
              <p className="text-red-700 mb-4">{message}</p>
              <div className="space-y-2">
                <Link 
                  to="/register" 
                  className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Yeniden Kayıt Ol
                </Link>
                <Link 
                  to="/resend-verification" 
                  className="inline-block w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Doğrulama E-postası Gönder
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
