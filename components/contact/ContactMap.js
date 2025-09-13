// components/contact/ContactMap.js
import React from "react";

const ContactMap = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  // Tam Adres + İsim (ampersand vb. karakterler encode edilecek)
  const placeQuery =
    "Yılmaz & Çolak Hukuk Bürosu, Bayır Mah., Kemal Güneş Cd. No:145, Kat:4, 78050 Karabük Merkez, Karabük, Türkiye";
  const q = encodeURIComponent(placeQuery);

  // NOT: place_id ile sorun yaşarsanız text query en stabil çözümdür.
  // Embed PLACE endpoint: İsim + Kart Gösterir
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${q}&zoom=18&language=tr`;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ofisimizi Ziyaret Edin
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ofisimizde size daha iyi hizmet verebilmek için hazırız.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Map */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-[4/3]">
                <iframe
                  title="Yılmaz & Çolak Hukuk Bürosu Konumu"
                  src={mapSrc}
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Adres Bilgileri
              </h3>
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-900">
                  Yılmaz &amp; Çolak Hukuk Bürosu
                </p>
                <div className="text-gray-700 space-y-1">
                  <p>Akbank Binası</p>
                  <p>Bayır, Kemal Güneş Cd. No:145, Kat:4</p>
                  <p>78050 Karabük Merkez/Karabük</p>
                </div>
              </div>
            </div>

            {/* Ulaşım */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                  </svg>
                </div>
                Ulaşım
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">🚗 Araç ile</h4>
                  <p className="text-gray-600 text-sm">
                    Karabük şehir merkezinde, Akbank Binası 4. katında bulunmaktayız.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">🚍 Toplu Taşıma</h4>
                  <p className="text-gray-600 text-sm">
                    Şehir merkezindeki tüm otobüs hatları ile ulaşım sağlanabilir.
                    En yakın durak 2 dakika yürüme mesafesindedir.
                  </p>
                </div>
              </div>
            </div>

            {/* Ziyaret Saatleri */}
            <div className="bg-amber-900 text-white rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Ziyaret Saatleri
              </h3>
              <div className="space-y-2 text-amber-100">
                <div className="flex justify-between">
                  <span>Pazartesi - Cuma</span>
                  <span className="font-semibold">09:00 - 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Cumartesi</span>
                  <span className="font-semibold">11:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Pazar</span>
                  <span className="text-red-300">Kapalı</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-800 rounded-lg">
                <p className="text-sm font-medium">💡 Randevu almanızı tavsiye ederiz</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+905556767878"
                className="flex-1 bg-green-600 text-white text-center py-4 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                📞 Hemen Ara
              </a>
              <a
                href="https://goo.gl/maps/KarabukAkbankBinasi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white text-center py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                🗺️ Yol Tarifi Al
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactMap;
