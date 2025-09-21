// app/admin/logout/page.js - Logout Sayfası
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  CheckCircle, 
  Shield, 
  Loader2,
  ArrowRight 
} from 'lucide-react';

export default function AdminLogout() {
  const router = useRouter();
  const [status, setStatus] = useState('logging-out'); // logging-out, success, error
  const [countdown, setCountdown] = useState(3);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    performLogout();
  }, []);

  // Logout işlemini gerçekleştir
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
      // Farklı path ve domain kombinasyonları için cookie'yi sil
      const hostname = window.location.hostname;
      const cookiesToClear = [
        `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
        `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/admin`,
        `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${hostname}`,
        `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/admin; domain=${hostname}`,
        `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${hostname}`
      ];
      
      cookiesToClear.forEach(cookie => {
        document.cookie = cookie;
      });
      
      console.log('Browser cookies cleared');
    }

    // Logout API'sini çağır
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    // Local storage ve session storage'ı temizle
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      
      // Browser cache'ini temizlemeye çalış
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    }

    if (response.ok) {
      setStatus('success');
      startCountdown();
    } else {
      setStatus('error');
      setTimeout(() => {
        // Force redirect with cache busting
        window.location.href = `/admin/login?t=${Date.now()}`;
      }, 2000);
    }
  } catch (error) {
    console.error('Logout error:', error);
    setStatus('error');
    setTimeout(() => {
      // Force redirect with cache busting
      window.location.href = `/admin/login?t=${Date.now()}`;
    }, 2000);
  }
};

  // Geri sayım başlat
  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/admin/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Hemen yönlendir
  const redirectNow = () => {
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-100/30 to-transparent rounded-full blur-3xl"></div>
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.5) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        ></div>
      </div>

      {/* Logout Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
          
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>

          {/* Status Content */}
          {status === 'logging-out' && (
            <>
              <div className="mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Çıkış Yapılıyor</h1>
                <p className="text-gray-600">Oturumunuz güvenli bir şekilde sonlandırılıyor...</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-6">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Başarıyla Çıkış Yapıldı</h1>
                {userName && (
                  <p className="text-gray-600 mb-2">Güle güle, <strong>{userName}</strong>!</p>
                )}
                <p className="text-gray-500 text-sm">
                  Oturumunuz güvenli bir şekilde sonlandırıldı.
                </p>
              </div>

              {/* Countdown */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-800 text-sm">
                  <strong>{countdown}</strong> saniye sonra giriş sayfasına yönlendirileceksiniz
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Manual Redirect Button */}
              <button
                onClick={redirectNow}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
              >
                Hemen Giriş Sayfasına Git
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-6">
                <LogOut className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Çıkış Hatası</h1>
                <p className="text-gray-600 mb-4">
                  Çıkış işlemi sırasında bir sorun oluştu, ama oturumunuz sonlandırıldı.
                </p>
                <button
                  onClick={redirectNow}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  Giriş Sayfasına Git
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                Yılmaz Çolak Hukuk Bürosu
              </p>
              <p className="text-xs text-gray-400">
                Admin Panel - Güvenli Çıkış
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}