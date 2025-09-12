'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <Header />

      <main className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-6">
        <div className="max-w-3xl text-center">
          {/* 404 Başlık */}
          <h1 className="text-8xl font-extrabold text-gray-900 tracking-tight mb-4">
            404
          </h1>

          {/* Açıklama */}
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Şu Anda Aradığınız Sayfamız Mevcut Değil.  
            Emin Olun, Çok Yakında Hizmetinizde Olacak.
          </p>

          {/* CTA Butonlar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 rounded-lg bg-amber-600 text-white font-semibold shadow-md hover:bg-amber-700 transition"
            >
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/calisma-alanlari"
              className="px-8 py-4 rounded-lg border border-gray-400 text-gray-700 font-medium hover:border-gray-600 hover:text-gray-900 transition"
            >
              Çalışma Alanlarımız
            </Link>
            <Link
              href="/iletisim"
              className="px-8 py-4 rounded-lg border border-gray-400 text-gray-700 font-medium hover:border-gray-600 hover:text-gray-900 transition"
            >
              İletişim
            </Link>
          </div>

          {/* Alt Mesaj */}
          <div className="mt-12 text-gray-500 text-sm">
            <p>
              Yılmaz Çolak Hukuk Bürosu • Adalet Ve Güvenin Adresi
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
