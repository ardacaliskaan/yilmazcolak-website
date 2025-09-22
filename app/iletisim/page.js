// app/iletisim/page.js
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/contact/ContactForm';
import ContactMap from '@/components/contact/ContactMap';

// Contact Hero Section
const ContactHeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            İletişime
            <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Geçin
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 leading-relaxed mb-12">
            Hukuki sorularınız için 7/24 buradayız. Ücretsiz ön değerlendirme için 
            hemen iletişime geçin.
          </p>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: "phone",
                title: "Telefon",
                content: "+90 (555) 676 78 78",
                subtitle: "7/24 Acil Hat",
                href: "tel:+905556767878"
              },
              {
                icon: "email", 
                title: "E-posta",
                content: "info@yilmazcolak.av.tr",
                subtitle: "Hızlı Yanıt",
                href: "mailto:info@yilmazcolak.av.tr"
              },
              {
                icon: "location",
                title: "Adres", 
                content: "Merkez / Karabük",
                subtitle: "Akbank Binası Kat:4"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  {item.icon === 'phone' && (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  )}
                  {item.icon === 'email' && (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  )}
                  {item.icon === 'location' && (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                
                {item.href ? (
                  <a href={item.href} className="text-amber-200 font-medium hover:text-amber-100 transition-colors duration-200 block">
                    {item.content}
                  </a>
                ) : (
                  <p className="text-amber-200 font-medium">{item.content}</p>
                )}
                
                <p className="text-gray-400 text-sm mt-1">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Contact Info Section
const ContactInfoSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            İletişim Bilgileri
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Size en uygun iletişim yöntemini seçerek uzman kadromuzla görüşebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Details */}
          <div className="space-y-8">
            
            {/* Address */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                Ofis Adresi
              </h3>
              <div className="space-y-2 text-gray-600">
                <p className="font-medium">Akbank Binası</p>
                <p>Bayır, Kemal Güneş Cd. No:145, Kat:4</p>
                <p>78050 Karabük Merkez/Karabük</p>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                Telefon Numaraları
              </h3>
              <div className="space-y-3">
                <div>
                  <a href="tel:+905556767878" className="text-amber-600 font-semibold text-lg hover:text-amber-700 transition-colors duration-200">
                    +90 (555) 676 78 78
                  </a>
                  <p className="text-sm text-gray-500">Ana Hat</p>
                </div>
                <div>
                  <a href="tel:+903704334455" className="text-amber-600 font-semibold text-lg hover:text-amber-700 transition-colors duration-200">
                    +90 (370) 433 44 55
                  </a>
                  <p className="text-sm text-gray-500">Alternatif Hat</p>
                </div>
              </div>
            </div>

            {/* Email Addresses */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                E-posta Adresleri
              </h3>
              <div className="space-y-3">
                <div>
                  <a href="mailto:info@yilmazcolak.av.tr" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors duration-200">
                    info@yilmazcolak.av.tr
                  </a>
                  <p className="text-sm text-gray-500">Genel Bilgi</p>
                </div>
                <div>
                  <a href="mailto:danismanlik@yilmazcolak.av.tr" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors duration-200">
                    danismanlik@yilmazcolak.av.tr
                  </a>
                  <p className="text-sm text-gray-500">Hukuki Danışmanlık</p>
                </div>
                <div>
                  <a href="mailto:kariyer@yilmazcolak.av.tr" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors duration-200">
                    kariyer@yilmazcolak.av.tr
                  </a>
                  <p className="text-sm text-gray-500">Kariyer ve İş Başvuruları</p>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                Çalışma Saatleri
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Pazartesi - Cuma</span>
                  <span className="text-amber-600 font-semibold">09:00 - 19:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Cumartesi</span>
                  <span className="text-amber-600 font-semibold">11:00 - 17:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Pazar</span>
                  <span className="text-red-500 font-medium">Kapalı</span>
                </div>
                <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                  <p className="text-amber-800 font-medium text-sm">
                    🚨 7/24 Acil Durum Hattı Aktif
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const faqs = [
    {
      question: "İlk görüşme ücretli mi?",
      answer: "Evet, Bu görüşmede davanızın durumunu değerlendiriyor ve size en doğru rehberliği sunuyoruz."
    },
    {
      question: "Randevu almak için ne yapmalıyım?",
      answer: "Telefon, e-posta veya iletişim formu aracılığıyla bizimle iletişime geçebilirsiniz. Size en uygun randevu saatini birlikte belirleriz."
    },
    {
      question: "Acil durumlar için nasıl ulaşabilirim?",
      answer: "Acil durum hattımız aktiftir. Acil hukuki durumlarda +90 (555) 676 78 78 numaramızdan bize ulaşabilirsiniz."
    },
    {
      question: "Hangi alanlarda hizmet veriyorsunuz?",
      answer: "Aile hukuku, ceza hukuku, iş hukuku, ticaret hukuku, idare hukuku ve daha birçok alanda uzman hizmet vermekteyiz."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Sık Sorulan Sorular
          </h2>
          <p className="text-xl text-gray-600">
            Merak ettiğiniz konulara hızlı yanıtlar
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-amber-600 font-bold text-sm">{index + 1}</span>
                </div>
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed ml-9">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Page Component
export default function IletisimPage() {
  return (
    <>
      <Header />
      
      <ContactHeroSection />
      <ContactInfoSection />
      <ContactMap />
      <FAQSection />

      <Footer />
    </>
  );
}

// Metadata
export const metadata = {
  title: 'İletişim - Yılmaz Çolak Hukuk Bürosu | Karabük Avukat',
  description: 'Hukuki sorularınız için bize ulaşın. Ücretsiz ön değerlendirme ve 7/24 acil durum hattı ile yanınızdayız.',
  keywords: 'iletişim, Karabük avukat, hukuk bürosu iletişim, randevu al, ücretsiz danışmanlık',
};