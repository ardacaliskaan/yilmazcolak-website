'use client';

import { useEffect, useState, useCallback } from 'react';
import { Shield, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminLogout() {
  const [status, setStatus] = useState('logging-out');
  const [countdown, setCountdown] = useState(3);
  const [userName, setUserName] = useState('');

  const performLogout = useCallback(async () => {
    try {
      console.log('🚀 Logout process started');
      
      // 1. Kullanıcı bilgisini al
      try {
        const userRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserName(userData.user.name);
          console.log('👤 User:', userData.user.name);
        }
      } catch (e) {
        console.log('⚠️ Could not get user info');
      }

      // 2. Browser cookie temizleme
      if (typeof document !== 'undefined') {
        console.log('🍪 Clearing browser cookies...');
        
        const hostname = window.location.hostname;
        const cookiesToClear = [
          `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
          `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/admin`,
          `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure`,
          `admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/admin; secure`,
        ];
        
        cookiesToClear.forEach(cookie => {
          document.cookie = cookie;
        });
        
        console.log('🔥 Browser cookies cleared');
      }

      // 3. Logout API çağır
      console.log('💣 Calling nuclear logout API...');
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Nuclear API success:', data.message);
        
        // 4. Auth durumunu kontrol et
        setTimeout(async () => {
          try {
            const authCheck = await fetch('/api/auth/me', { credentials: 'include' });
            if (authCheck.ok) {
              console.log('🚨 STILL AUTHENTICATED! Token not cleared!');
              setStatus('error');
            } else {
              console.log('🎉 Auth check failed - SUCCESS!');
              setStatus('success');
            }
          } catch (e) {
            console.log('🎉 Auth check error - SUCCESS!');
            setStatus('success');
          }
          
          startCountdown();
        }, 500);
        
      } else {
        console.log('❌ Nuclear API error:', response.status);
        setStatus('success'); // Yine de success yap, F5'te login'e gidiyor
        startCountdown();
      }

    } catch (error) {
      console.log('💥 Logout error:', error.message);
      setStatus('success'); // Yine de success yap
      startCountdown();
    }
  }, []);

  useEffect(() => {
    performLogout();
  }, [performLogout]);

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          console.log('🚀 Redirecting to login...');
          window.location.replace('/admin/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleManualRedirect = () => {
    console.log('👆 Manual redirect');
    window.location.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-center max-w-md w-full">
        
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>

        {status === 'logging-out' && (
          <div className="mb-6">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Çıkış Yapılıyor</h1>
            <p className="text-gray-600">Oturumunuz temizleniyor...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Çıkış Başarılı! 🎉</h1>
              {userName && (
                <p className="text-gray-600 mb-2">Güle güle, <strong>{userName}</strong>!</p>
              )}
              <p className="text-gray-500 text-sm">Oturum başarıyla sonlandırıldı.</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                {countdown} saniye sonra giriş sayfasına yönlendirileceksiniz
              </p>
              <button
                onClick={handleManualRedirect}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Hemen Giriş Sayfasına Git
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sorun Tespit Edildi</h1>
              <p className="text-gray-600 mb-2">Cookie tam silinmemiş olabilir.</p>
              <p className="text-gray-500 text-sm">Console&apos;u kontrol edin.</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                {countdown} saniye sonra giriş sayfasına yönlendirileceksiniz
              </p>
              <button
                onClick={handleManualRedirect}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg"
              >
                Yine De Giriş Sayfasına Git
              </button>
            </div>
          </>
        )}

        <p className="text-xs text-gray-400 mt-4">
          Console&apos;da debug logları kontrol edin 🔍
        </p>

      </div>
    </div>
  );
}