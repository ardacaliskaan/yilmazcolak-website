'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Çalışma Alanları Verisi - Profesyonel tasarım için
const practiceAreasData = [
  {
    id: 1,
    name: "Aile Hukuku",
    slug: "aile-hukuku",
    shortDescription: "Ailenizin geleceğini güvence altına alın",
    description: "Boşanma, nafaka, velayet, mal paylaşımı ve evlilik süreçlerinde deneyimli kadromuzla yanınızdayız. Hassas konularda uzman yaklaşım ve güvenilir çözümler sunuyoruz.",
        color: "bg-gradient-to-br from-gray-800 to-gray-900",

    features: [
      "Boşanma Davaları",
      "Nafaka Hesaplamaları", 
      "Velayet Süreçleri",
      "Mal Paylaşımı",
      "Evlilik Sözleşmeleri"
    ]
  },
  {
    id: 2,
    name: "Ceza Hukuku",
    slug: "ceza-hukuku", 
    shortDescription: "Haklarınızı güçlü savunuculukla koruyoruz",
    description: "Ceza davalarında etkili savunma stratejileri ve deneyimli yaklaşımla adaletin tecellisi için mücadele ediyoruz. Her durumda yanınızdayız.",
    color: "bg-gradient-to-br from-gray-800 to-gray-900",
    features: [
      "Suç Savunması",
      "Beraat Stratejileri",
      "Ceza İndirimı",
      "Uzlaşma Süreçleri",
      "Temyiz İşlemleri"
    ]
  },
  {
    id: 3,
    name: "İdare Hukuku",
    slug: "idare-hukuku",
    shortDescription: "Devlete karşı haklarınızı savunuyoruz",
    description: "Kamu kurumlarıyla yaşanan sorunlarda, memur hakları, ihale süreçleri ve idari işlemlerde uzman desteği sağlıyoruz. Bürokrasiye karşı güçlü savunma.",
    color: "bg-gradient-to-br from-gray-800 to-gray-900",
    features: [
      "İdari Davalar",
      "Memur Hakları",
      "İhale İptalleri",
      "Lisans İşlemleri",
      "Disiplin Cezaları"
    ]
  },
  {
    id: 4,
    name: "İş Hukuku",
    slug: "is-hukuku",
    shortDescription: "Çalışma hayatında haklarınızı koruyoruz",
    description: "İşçi-işveren ilişkilerinde dengeli çözümler, kıdem-ihbar tazminatları, mobbing ve çalışma koşulları konularında profesyonel danışmanlık hizmeti veriyoruz.",
    color: "bg-gradient-to-br from-gray-800 to-gray-900",
    features: [
      "Kıdem Tazminatı",
      "İhbar Tazminatı",
      "Mobbing Davaları",
      "İş Sözleşmeleri",
      "Çalışma Koşulları"
    ]
  },
  {
    id: 5,
    name: "Kira Hukuku",
    slug: "kira-hukuku",
    shortDescription: "Mülk haklarınızı güvenceye alın",
    description: "Kiracı-kiraya veren ilişkilerinde ortaya çıkan uyuşmazlıklar, tahliye davaları ve kira artış süreçlerinde uzman çözümler sunuyoruz.",
    color: "bg-gradient-to-br from-gray-800 to-gray-900",
    features: [
      "Tahliye Davaları",
      "Kira Artışı",
      "Depozito İadeleri",
      "Onarım Yükümlülükleri",
      "Sözleşme Düzenlemeleri"
    ]
  },
  {
    id: 6,
    name: "KVKK Hukuku",
    slug: "kvkk-hukuku",
    shortDescription: "Dijital çağda gizliliğinizi koruyoruz",
    description: "Kişisel Verilerin Korunması Kanunu kapsamında bireysel ve kurumsal haklar, veri ihlalleri ve gizlilik konularında uzman danışmanlık hizmeti.",
    color: "bg-gradient-to-br from-gray-800 to-gray-900",
    features: [
      "Veri İhlali Şikayetleri",
      "Gizlilik Hakları",
      "KVKK Uyum Süreçleri",
      "Kişisel Veri Silme",
      "Dijital Haklar"
    ]
  },
  {
    id: 7,
    name: "Miras Hukuku",
    slug: "miras-hukuku",
    shortDescription: "Gelecek nesillere güvenli geçiş",
    description: "Miras paylaşımı, vasiyet düzenleme ve saklı pay hesaplamaları konularında ailevi uyuşmazlıkları çözmek için deneyimli kadromuzla hizmet veriyoruz.",
    color: "bg-gradient-to-br from-gray-800 to-gray-900",

    features: [
      "Miras Paylaşımı",
      "Vasiyet Düzenleme",
      "Saklı Pay Hesaplaması",
      "Mirastan Feragat",
      "Tereke Süreçleri"
    ]
  },
  {
    id: 8,
    name: "Sağlık Hukuku",
    slug: "saglik-hukuku",
    shortDescription: "Sağlık haklarınızın güvencesiyiz",
    description: "Tıbbi malpraktis, hasta hakları, sağlık sigortası uyuşmazlıkları ve sağlık kuruluşları ile yaşanan sorunlarda uzman çözümler üretiyoruz.",
    color: "bg-gradient-to-br from-gray-800 to-gray-900",

    features: [
      "Tıbbi Malpraktis",
      "Hasta Hakları",
      "Sigorta Uyuşmazlıkları",
      "Sağlık Tazminatları",
      "Hastane Süreçleri"
    ]
  },
  {
    id: 9,
    name: "Sigorta Hukuku",
    slug: "sigorta-hukuku",
    shortDescription: "Sigorta haklarınızı tam olarak alın",
    description: "Sigorta şirketleriyle yaşanan uyuşmazlıklar, tazminat ödemeleri ve poliçe kapsamı konularında haklarınızı sonuna kadar savunuyoruz.",
    color: "bg-gradient-to-br from-gray-800 to-gray-900",

    features: [
      "Sigorta Tazminatları",
      "Poliçe Uyuşmazlıkları",
      "Hasar Değerlendirme",
      "Red Kararları",
      "Prim İadesi"
    ]
  },
  {
    id: 10,
    name: "Tüketici Hukuku",
    slug: "tuketici-hukuku",
    shortDescription: "Tüketici olarak haklarınızı koruyoruz",
    description: "Satın aldığınız ürün ve hizmetlerde yaşanan sorunlar, ayıplı mal, garanti süreçleri ve tüketici haklarınızda uzman destek alın.",
    color: "bg-gradient-to-br from-gray-800 to-gray-900",

    features: [
      "Ayıplı Mal İadesi",
      "Garanti Süreçleri",
      "Hizmet Kusurları",
      "Tüketici Mahkemesi",
      "Cayma Hakları"
    ]
  },
  {
    id: 11,
    name: "Yabancılar Hukuku",
    slug: "yabancilar-hukuku",
    shortDescription: "Uluslararası haklarınızda yanınızdayız",
    description: "Oturma izni, çalışma izni, vatandaşlık süreçleri ve yabancılar için hukuki işlemlerde kapsamlı danışmanlık hizmeti sunuyoruz.",
    color: "bg-gradient-to-br from-gray-800 to-gray-900",

    features: [
      "Oturma İzni",
      "Çalışma İzni",
      "Vatandaşlık Başvurusu",
      "Sınır Dışı Davası",
      "Uluslararası Evlilik"
    ]
  }
];

// Practice Area Card Component
const PracticeAreaCard = ({ area, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 ${area.color} p-8 text-white min-h-[420px] flex flex-col`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Icon & Title */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
            {area.icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1">{area.name}</h3>
            <p className="text-white/80 text-sm font-medium">{area.shortDescription}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/90 leading-relaxed mb-6 flex-grow">
          {area.description}
        </p>

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 text-white/90">Hizmet Alanları:</h4>
          <div className="grid grid-cols-1 gap-2">
            {area.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
            {area.features.length > 3 && (
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                <span className="text-sm text-white/60">+{area.features.length - 3} diğer alan</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href={`/calisma-alanlari/${area.slug}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 hover:border-white/50 group-hover:scale-105"
        >
          <span>Detaylı Bilgi</span>
          <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
    </div>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-20 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -translate-x-36 -translate-y-36"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl -translate-x-32 -translate-y-32"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/20">
          <svg className="w-4 h-4 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Uzman Hukuki Danışmanlık
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Çalışma 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500"> Alanlarımız</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-12 max-w-4xl mx-auto">
          Her hukuki alanda deneyimli kadromuz ve uzman yaklaşımımızla, 
          haklarınızı korumak ve adaletin tecellisi için yanınızdayız.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            { number: "11", label: "Uzman Alan" },
            { number: "15+", label: "Yıl Deneyim" },
            { number: "500+", label: "Başarılı Dava" },
            { number: "24/7", label: "Destek" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-2">{stat.number}</div>
              <div className="text-white/70 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Page Component
export default function CalismaAlanlariPage() {
  return (
    <>
      <Header />
      
      <HeroSection />

      {/* Practice Areas Grid */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Hangi Konuda Yardıma İhtiyacınız Var?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Aşağıdaki çalışma alanlarımızdan size uygun olanı seçin ve 
              uzman kadromuzdan profesyonel destek alın.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {practiceAreasData.map((area, index) => (
              <PracticeAreaCard 
                key={area.id} 
                area={area} 
                index={index}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-20 p-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Hangi Alanda Danışmanlığa İhtiyacınız Var?
            </h3>
            <p className="text-amber-100 mb-8 text-lg">
              Uzman kadromuz size en uygun çözümü bulmak için burada. 
              Hemen iletişime geçin ve ücretsiz ön değerlendirme alın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/online-danismanlik"
                className="inline-flex items-center px-8 py-4 bg-white text-amber-600 font-bold rounded-xl hover:bg-amber-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Online Danışmanlık
              </Link>
              <Link
                href="/iletisim"
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                Hemen Ara
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}