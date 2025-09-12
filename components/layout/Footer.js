'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Logo Component for Footer - Updated with logo.png
const FooterLogo = ({ className = "" }) => (
  <div className={`flex items-center ${className}`}>
    <Image 
      src="/images/logo.png" 
      alt="Yılmaz Çolak Hukuk Bürosu" 
      className="h-16 w-auto object-contain"
      onError={(e) => {
        // Fallback text if image fails to load
        e.target.style.display = 'none';
        e.target.nextElementSibling.style.display = 'block';
      }}
    />
    <span 
      className="text-2xl font-bold tracking-wide text-gray-800"
      style={{ display: 'none' }}
    >
      YILMAZ ÇOLAK HUKUK BÜROSU
    </span>
  </div>
);

// Calculation Tools Data - Admin Ready Structure
const calculationToolsData = [
  {
    id: 1,
    name: "Nafaka Hesaplama",
    slug: "nafaka-hesaplama",
    description: "Boşanma davalarında nafaka miktarı hesaplayıcısı",
    featured: true,
    category: "aile-hukuku"
  },
  {
    id: 2,
    name: "Tazminat Hesaplama",
    slug: "tazminat-hesaplama", 
    description: "İş kazası ve maddi-manevi tazminat hesaplayıcısı",
    featured: true,
    category: "is-hukuku"
  },
  {
    id: 3,
    name: "Faiz Hesaplama",
    slug: "faiz-hesaplama",
    description: "Yasal faiz ve gecikme faizi hesaplayıcısı", 
    featured: true,
    category: "ticaret-hukuku"
  },
  {
    id: 4,
    name: "Vekalet Ücreti Hesaplama",
    slug: "vekalet-ucreti-hesaplama",
    description: "Avukatlık ücret tarifeesi hesaplayıcısı",
    featured: false,
    category: "genel"
  },
  {
    id: 5,
    name: "İcra Masraf Hesaplama",
    slug: "icra-masraf-hesaplama",
    description: "İcra takibi masraf ve harç hesaplayıcısı",
    featured: false,
    category: "icra-hukuku"
  },
  {
    id: 6,
    name: "Kıdem Tazminatı Hesaplama",
    slug: "kidem-tazminati-hesaplama",
    description: "İş sözleşmesi sona ermede kıdem tazminatı",
    featured: true,
    category: "is-hukuku"
  }
];

// Corporate Links Data Structure
const corporateLinksData = [
  {
    id: 1,
    name: "Hakkımızda",
    slug: "hakkimizda",
    href: "/hakkimizda"
  },
  {
    id: 2,
    name: "Ekibimiz",
    slug: "ekibimiz",
    href: "/ekibimiz"
  },
  {
    id: 3,
    name: "Referanslar",
    slug: "referanslar",
    href: "/referanslar"
  },
  {
    id: 4,
    name: "Başarı Hikayeleri",
    slug: "basari-hikayeleri",
    href: "/basari-hikayeleri"
  },
  {
    id: 5,
    name: "Sık Sorulan Sorular",
    slug: "sss",
    href: "/sss"
  },
  {
    id: 6,
    name: "Kariyer",
    slug: "kariyer",
    href: "/kariyer"
  }
];

// Services Links Data Structure
const servicesLinksData = [
  {
    id: 1,
    name: "Online Danışmanlık",
    slug: "online-danismanlik",
    href: "/online-danismanlik"
  },
  {
    id: 2,
    name: "Randevu Al",
    slug: "randevu-al",
    href: "/randevu-al"
  },
  {
    id: 3,
    name: "Sözleşme İnceleme",
    slug: "sozlesme-inceleme",
    href: "/hizmetler/sozlesme-inceleme"
  },
  {
    id: 4,
    name: "Mahkeme Temsili",
    slug: "mahkeme-temsili",
    href: "/hizmetler/mahkeme-temsili"
  },
  {
    id: 5,
    name: "Arabuluculuk",
    slug: "arabuluculuk",
    href: "/hizmetler/arabuluculuk"
  },
  {
    id: 6,
    name: "Dava Takibi",
    slug: "dava-takibi",
    href: "/hizmetler/dava-takibi"
  }
];

// Contact Information Data Structure
const contactInfoData = {
 address: {
  street: "Kemal Güneş Cd.",
  building: "Akbank Binası, Bayır, No:145, Kat:4",
  district: "Merkez",
  city: "Karabük",
  postalCode: "78050",
  full: "Akbank Binası, Bayır, Kemal Güneş Cd. No:145 Kat:4, 78050 Karabük Merkez/Karabük"
},

  phone: {
    primary: "+90 (555) 676 78 78",
    secondary: "+90 (370) 433 44 55",
    formatted: {
      primary: "+905556767878",
      secondary: "+903704334455"
    }
  },
  email: {
    primary: "info@yilmazcolak.av.tr",
    consultation: "danismanlik@yilmazcolak.av.tr",
    career: "kariyer@yilmazcolak.av.tr"
  },
  workingHours: {
    weekdays: "Pazartesi - Cuma: 09:00 - 18:00",
    saturday: "Cumartesi: 09:00 - 13:00", 
    sunday: "Pazar: Kapalı",
    emergency: "7/24 Acil Durum Hattı"
  },
  socialMedia: {
    linkedin: "https://linkedin.com/company/yilmaz-colak-hukuk",
    twitter: "https://twitter.com/yilmazcolakhukuk",
    instagram: "https://instagram.com/yilmazcolakhukuk",
    youtube: "https://youtube.com/@yilmazcolakhukuk"
  }
};

// Mobile Accordion Component
const MobileAccordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);

  return (
    <div className="border-b border-gray-200/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <svg 
          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div 
        ref={contentRef}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};

// Social Media Icons Component
const SocialMediaIcons = ({ socialLinks, className = "" }) => (
  <div className={`flex space-x-4 ${className}`}>
    {/* LinkedIn */}
    <a
      href={socialLinks.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-300 hover:scale-110"
      aria-label="LinkedIn"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    </a>

    {/* Twitter */}
    <a
      href={socialLinks.twitter}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-300 hover:scale-110"
      aria-label="Twitter"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    </a>

    {/* Instagram */}
    <a
      href={socialLinks.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-300 hover:scale-110"
      aria-label="Instagram"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-2.508 0-4.541-2.036-4.541-4.544s2.033-4.544 4.541-4.544c2.508 0 4.544 2.036 4.544 4.544s-2.036 4.544-4.544 4.544zm7.119 0c-2.508 0-4.544-2.036-4.544-4.544s2.036-4.544 4.544-4.544 4.541 2.036 4.541 4.544-2.033 4.544-4.541 4.544z"/>
      </svg>
    </a>

    {/* YouTube */}
    <a
      href={socialLinks.youtube}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-300 hover:scale-110"
      aria-label="YouTube"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    </a>
  </div>
);

// Main Footer Component
const Footer = () => {
  const [currentYear] = useState(() => new Date().getFullYear());

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* Desktop Layout - 4 Columns */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
          
          {/* Column 1: Hesaplama Araçları */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Hesaplama Araçları
            </h3>
            <div className="space-y-4">
              {calculationToolsData.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/hesaplama-araclari/${tool.slug}`}
                  className="group block"
                >
                  <div className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors duration-300">
                    {tool.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300">
                    {tool.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Kurumsal */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Kurumsal
            </h3>
            <div className="space-y-3">
              {corporateLinksData.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="block text-sm text-gray-600 hover:text-amber-600 transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Hizmetler */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Hizmetler
            </h3>
            <div className="space-y-3">
              {servicesLinksData.map((service) => (
                <Link
                  key={service.id}
                  href={service.href}
                  className="block text-sm text-gray-600 hover:text-amber-600 transition-colors duration-300"
                >
                  {service.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: İletişim */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              İletişim
            </h3>
            <div className="space-y-4">
              
              {/* Address */}
              <div>
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {contactInfoData.address.full}
                  </div>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="space-y-2">
                <a 
                  href={`tel:${contactInfoData.phone.formatted.primary}`}
                  className="flex items-center space-x-3 text-sm text-gray-600 hover:text-amber-600 transition-colors duration-300"
                >
                  <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <span>{contactInfoData.phone.primary}</span>
                </a>

                <a 
                  href={`tel:${contactInfoData.phone.formatted.secondary}`}
                  className="flex items-center space-x-3 text-sm text-gray-600 hover:text-amber-600 transition-colors duration-300"
                >
                  <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <span>{contactInfoData.phone.secondary}</span>
                </a>
              </div>

              {/* Email */}
              <a 
                href={`mailto:${contactInfoData.email.primary}`}
                className="flex items-center space-x-3 text-sm text-gray-600 hover:text-amber-600 transition-colors duration-300"
              >
                <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span>{contactInfoData.email.primary}</span>
              </a>

              {/* Working Hours */}
              <div className="pt-2">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{contactInfoData.workingHours.weekdays}</div>
                  <div>{contactInfoData.workingHours.saturday}</div>
                  <div>{contactInfoData.workingHours.sunday}</div>
                  <div className="text-amber-600 font-medium pt-2">
                    {contactInfoData.workingHours.emergency}
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-4">
                <SocialMediaIcons socialLinks={contactInfoData.socialMedia} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Accordion Style */}
        <div className="lg:hidden space-y-0">
          
          {/* Hesaplama Araçları */}
          <MobileAccordion title="Hesaplama Araçları" defaultOpen={true}>
            {calculationToolsData.map((tool) => (
              <Link
                key={tool.id}
                href={`/hesaplama-araclari/${tool.slug}`}
                className="block p-3 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50/50 rounded-lg transition-all duration-300"
              >
                <div>{tool.name}</div>
                <div className="text-xs text-gray-500 mt-1">{tool.description}</div>
              </Link>
            ))}
          </MobileAccordion>

          {/* Kurumsal */}
          <MobileAccordion title="Kurumsal">
            {corporateLinksData.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="block p-3 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50/50 rounded-lg transition-all duration-300"
              >
                {link.name}
              </Link>
            ))}
          </MobileAccordion>

          {/* Hizmetler */}
          <MobileAccordion title="Hizmetler">
            {servicesLinksData.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="block p-3 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50/50 rounded-lg transition-all duration-300"
              >
                {service.name}
              </Link>
            ))}
          </MobileAccordion>

          {/* İletişim */}
          <MobileAccordion title="İletişim">
            {/* Mobile Address */}
            <div className="p-3 text-sm text-gray-600 bg-gray-50/50 rounded-lg">
              <div className="flex items-start space-x-2 mb-2">
                <svg className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{contactInfoData.address.full}</span>
              </div>
            </div>

            {/* Mobile Phone Numbers */}
            <div className="space-y-2">
              <a 
                href={`tel:${contactInfoData.phone.formatted.primary}`}
                className="flex items-center space-x-3 p-3 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50/50 rounded-lg transition-all duration-300"
              >
                <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span>{contactInfoData.phone.primary}</span>
              </a>

              <a 
                href={`tel:${contactInfoData.phone.formatted.secondary}`}
                className="flex items-center space-x-3 p-3 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50/50 rounded-lg transition-all duration-300"
              >
                <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span>{contactInfoData.phone.secondary}</span>
              </a>
            </div>

            {/* Mobile Email */}
            <a 
              href={`mailto:${contactInfoData.email.primary}`}
              className="flex items-center space-x-3 p-3 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50/50 rounded-lg transition-all duration-300"
            >
              <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span>{contactInfoData.email.primary}</span>
            </a>

            {/* Mobile Working Hours */}
            <div className="p-3 text-sm text-gray-600 bg-gray-50/50 rounded-lg">
              <div className="space-y-1">
                <div>{contactInfoData.workingHours.weekdays}</div>
                <div>{contactInfoData.workingHours.saturday}</div>
                <div>{contactInfoData.workingHours.sunday}</div>
                <div className="text-amber-600 font-medium pt-2">
                  {contactInfoData.workingHours.emergency}
                </div>
              </div>
            </div>

{/* Mobile Social Media - devamı */}
            <div className="pt-2">
              <div className="text-sm font-medium text-gray-700 mb-3">Sosyal Medya</div>
              <SocialMediaIcons socialLinks={contactInfoData.socialMedia} />
            </div>
          </MobileAccordion>
        </div>
      </div>

      {/* Bottom Section - Logo + Copyright */}
      <div className="border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            
            {/* Logo + Description */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 space-y-4 lg:space-y-0">
              <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity duration-300">
                <FooterLogo />
              </Link>
              
              <div className="text-sm text-gray-600 max-w-md leading-relaxed">
                Karabük merkezli hukuk büromuz, aile hukuku, ceza hukuku, iş hukuku ve daha birçok alanda 
                profesyonel hukuki danışmanlık hizmetleri sunmaktadır.
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-6 text-sm">
              <Link 
                href="/online-danismanlik" 
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors duration-300"
              >
                Online Danışmanlık
              </Link>
              <Link 
                href="/randevu-al" 
                className="text-gray-600 hover:text-amber-600 transition-colors duration-300"
              >
                Randevu Al
              </Link>
              <Link 
                href="/acil-durum" 
                className="text-gray-600 hover:text-amber-600 transition-colors duration-300"
              >
                Acil Durum
              </Link>
              <Link 
                href="/iletisim" 
                className="text-gray-600 hover:text-amber-600 transition-colors duration-300"
              >
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-gray-200 bg-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © {currentYear} Yılmaz Çolak Hukuk Bürosu. Tüm hakları saklıdır.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <Link 
                href="/gizlilik-politikasi" 
                className="hover:text-amber-600 transition-colors duration-300"
              >
                Gizlilik Politikası
              </Link>
              <span className="hidden md:inline">•</span>
              <Link 
                href="/kullanim-kosullari" 
                className="hover:text-amber-600 transition-colors duration-300"
              >
                Kullanım Koşulları
              </Link>
              <span className="hidden md:inline">•</span>
              <Link 
                href="/kvkk" 
                className="hover:text-amber-600 transition-colors duration-300"
              >
                KVKK
              </Link>
              <span className="hidden md:inline">•</span>
              <Link 
                href="/sitemap" 
                className="hover:text-amber-600 transition-colors duration-300"
              >
                Site Haritası
              </Link>
            </div>

            {/* Developer Credit */}
            <div className="text-xs text-gray-400">
              Web tasarım ve geliştirme: 
              <span className="text-amber-600 hover:text-amber-700 font-medium ml-1 cursor-pointer transition-colors duration-300">
                <Link href="https://ardacaliskan.com" target="_blank" rel="noopener noreferrer">
                Arda Çalışkan
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </footer>
  );
};

// Scroll to Top Button Component
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 p-3 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 hover:scale-110 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Sayfa başına dön"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

export default Footer;