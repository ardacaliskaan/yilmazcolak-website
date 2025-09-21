// Düzeltilmiş Logout Page - Fetch metodu eklendi
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  CheckCircle, 
  Shield, 
  Loader2,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export default function AdminLogout() {
  const router = useRouter();
  const [status, setStatus] = useState('logging-out');
  const [countdown, setCountdown] = useState(3);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    performLogout();
  }, []);

  const performLogout = async () => {
    try {
      // Mevcut kullanıcı bilgisini al
      const userResponse = await fetch('/api/auth/me', { credentials: 'include' });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserName(userData.user.name);
      }

      // Browser cookie'lerini JavaScript ile temizle
      if (typeof document !== 'undefined') {
        const hostname = window.location.hostname;
        const cookiesToClear = [
          `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure`,
          `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/admin; secure`,
          `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${hostname}; secure`,
        ];
        
        cookiesToClear.forEach(cookie => {
          document.cookie = cookie;
        });
        
        console.log('Browser cookies cleared');
      }

      // 🛠️ DÜZELTİLMİŞ - Logout API'sini çağır
      const response = await fetch('/api/auth/logout', {
        method: 'POST',           // 👈 Eksik olan method eklendi
        credentials: 'include',   // 👈 Düzeltildi
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ Logout API successful');
        setStatus('success');
        startCountdown();
      } else {
        console.error('❌ Logout API failed');
        setStatus('error');
        setTimeout(() => startCountdown(), 1000);
      }

    } catch (error) {
      console.error('❌ Logout process error:', error);
      setStatus('error');
      setTimeout(() => startCountdown(), 1000);
    }
  };

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.replace('/admin/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleManualRedirect = () => {
    window.location.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-center max-w-md w-full">
        
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>

        {status === 'logging-out' && (
          <div className="mb-6">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Çıkış Yapılıyor</h1>
            <p className="text-gray-600">Oturumunuz güvenli bir şekilde sonlandırılıyor...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Başarıyla Çıkış Yapıldı</h1>
              {userName && (
                <p className="text-gray-600 mb-2">Güle güle, <strong>{userName}</strong>!</p>
              )}
              <p className="text-gray-500 text-sm">Oturumunuz güvenli bir şekilde sonlandırıldı.</p>
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 text-blue-600">
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {countdown} saniye sonra giriş sayfasına yönlendirileceksiniz
                </span>
              </div>
            </div>

            <button
              onClick={handleManualRedirect}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Hemen Giriş Sayfasına Git
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Çıkış Tamamlandı</h1>
              <p className="text-gray-600 mb-2">Oturumunuz sonlandırıldı, ancak bazı hatalar oluştu.</p>
              <p className="text-gray-500 text-sm">Güvenlik amacıyla giriş sayfasına yönlendiriliyorsunuz.</p>
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 text-orange-600">
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {countdown} saniye sonra giriş sayfasına yönlendirileceksiniz
                </span>
              </div>
            </div>

            <button
              onClick={handleManualRedirect}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg"
            >
              Hemen Giriş Sayfasına Git
            </button>
          </>
        )}

      </div>
    </div>
  );
}
