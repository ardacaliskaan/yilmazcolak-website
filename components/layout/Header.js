'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Logo Component - Sadece logo eklendi
const Logo = ({ className = "", isScrolled = false }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`flex items-center transition-all duration-500 ${className}`}>
        <div className={`flex items-center transition-all duration-500 ${
          isScrolled 
            ? 'h-12 w-auto md:h-14 lg:h-16' 
            : 'h-14 w-auto md:h-16 lg:h-18'
        }`}>
          <span className={`font-bold tracking-wide transition-all duration-500 ${
            isScrolled 
              ? 'text-lg md:text-xl text-gray-800' 
              : 'text-xl md:text-2xl lg:text-3xl text-gray-800'
          }`}>
            LOGO
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center transition-all duration-500 ${className}`}>
      <div className={`flex items-center transition-all duration-500 ${
        isScrolled 
          ? 'h-12 w-auto md:h-14 lg:h-16' 
          : 'h-14 w-auto md:h-16 lg:h-18'
      }`}>
        <Image
          src="/images/logo.png"
          alt="Yılmaz Çolak Hukuk Bürosu"
          width={200}
          height={80}
          className={`transition-all duration-500 object-contain ${
            isScrolled 
              ? 'h-12 w-auto md:h-14 lg:h-16' 
              : 'h-14 w-auto md:h-16 lg:h-18'
          }`}
          onError={() => setImageError(true)}
          priority
        />
      </div>
    </div>
  );
};

// Practice Areas Data - Simple Structure
const practiceAreasData = [
  { id: 1, name: "Aile Hukuku", slug: "aile-hukuku" },
  { id: 2, name: "Ceza Hukuku", slug: "ceza-hukuku" },
  { id: 3, name: "İdare Hukuku", slug: "idare-hukuku" },
  { id: 4, name: "İş Hukuku", slug: "is-hukuku" },
  { id: 5, name: "Kira Hukuku", slug: "kira-hukuku" },
  { id: 6, name: "Kişisel Verilerin Korunması Hukuku", slug: "kvkk-hukuku" },
  { id: 7, name: "Miras Hukuku", slug: "miras-hukuku" },
  { id: 8, name: "Sağlık Hukuku", slug: "saglik-hukuku" },
  { id: 9, name: "Sigorta Hukuku", slug: "sigorta-hukuku" },
  { id: 10, name: "Tüketici Hukuku", slug: "tuketici-hukuku" },
  { id: 11, name: "Yabancılar Hukuku", slug: "yabancilar-hukuku" }
];

// Main Navigation Structure
const navigationStructure = [
  { 
    id: 'practice-areas',
    name: "Çalışma Alanları", 
    href: "/calisma-alanlari",
    hasDropdown: true
  },
  { 
    id: 'team',
    name: "Ekibimiz", 
    href: "/ekibimiz"
  },
  { 
    id: 'articles',
    name: "Makaleler", 
    href: "/makaleler"
  },
  { 
    id: 'contact',
    name: "İletişim", 
    href: "/iletisim"
  }
];

// Simple Dropdown Component
const PracticeAreasDropdown = ({ isOpen, onClose, onItemClick }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={`absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 transition-all duration-300 z-50 ${
        isOpen 
          ? 'opacity-100 visible transform translate-y-0' 
          : 'opacity-0 invisible transform -translate-y-2'
      }`}
      onMouseEnter={() => {}} // Prevent parent mouseleave when hovering dropdown
      onMouseLeave={onClose} // Close when mouse leaves dropdown
    >
      <div className="p-4">
        <div className="grid gap-1">
          {practiceAreasData.map((area) => (
            <Link
              key={area.id}
              href={`/calisma-alanlari/${area.slug}`}
              onClick={() => {
                onItemClick();
                onClose();
              }}
              className="block px-4 py-3 text-sm text-gray-700 hover:text-amber-600 hover:bg-amber-50/70 rounded-lg transition-all duration-200"
            >
              {area.name}
            </Link>
          ))}
        </div>
        
        {/* View All Link */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link
            href="/calisma-alanlari"
            onClick={() => {
              onItemClick();
              onClose();
            }}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-all duration-200"
          >
            Tüm Çalışma Alanları
            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose, menuItems, practiceAreas }) => {
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div 
        ref={mobileMenuRef}
        className={`absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-white shadow-2xl transform transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <Logo isScrolled={true} />
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-300"
            aria-label="Menüyü kapat"
          >
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="flex flex-col py-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.hasDropdown ? (
                <>
                  <button
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    className="flex items-center justify-between w-full px-6 py-4 text-lg font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-all duration-300"
                  >
                    <span>{item.name}</span>
                    <svg 
                      className={`h-5 w-5 transition-transform duration-300 ${mobileDropdownOpen ? 'rotate-180' : ''}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Mobile Dropdown Content */}
                  <div className={`overflow-hidden transition-all duration-500 ${
                    mobileDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="bg-gradient-to-r from-gray-50 to-amber-50/30 border-t border-gray-200">
                      {practiceAreas.map((area) => (
                        <Link
                          key={area.id}
                          href={`/calisma-alanlari/${area.slug}`}
                          onClick={onClose}
                          className="block px-8 py-3 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-all duration-300"
                        >
                          {area.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center px-6 py-4 text-lg font-medium transition-all duration-300 hover:bg-amber-50 hover:text-amber-600 text-gray-700"
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
          
          {/* Mobile CTA Button */}
          <div className="px-6 pt-6">
            <Link
              href="/online-danismanlik"
              onClick={onClose}
              className="flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Online Danışmanlık
            </Link>
          </div>
        </nav>

        {/* Mobile Contact Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-r from-gray-50 to-amber-50/30 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3 font-medium">Acil durumlar için</p>
            <a 
              href="tel:+905556767878" 
              className="flex items-center justify-center text-lg font-bold text-amber-600 hover:text-amber-700 transition-colors duration-300 group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              +90 (555) 676 78 78
            </a>
            <p className="text-xs text-gray-500 mt-2">7/24 hizmet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Header Component
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const headerRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  // Scroll handler - temizlendi
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const newIsScrolled = scrollTop > 20;
    
    if (newIsScrolled !== isScrolled) {
      setIsScrolled(newIsScrolled);
    }
  }, [isScrolled]);

  useEffect(() => {
    let ticking = false;
    
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [handleScroll]);

  // Body scroll management for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isMobileMenuOpen]);

  // Simple dropdown hover handlers
  const handleDropdownEnter = useCallback((index) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(index);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 100); // Short delay
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Menu handlers
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  return (
    <>
      <header 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg py-3' 
            : 'bg-white/90 backdrop-blur-sm py-5'
        }`}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo Section */}
            <Link 
              href="/" 
              className="flex-shrink-0 hover:opacity-80 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-lg"
              aria-label="Yılmaz Çolak Hukuk Bürosu Ana Sayfa"
            >
              <Logo isScrolled={isScrolled} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" role="navigation">
              {navigationStructure.map((item, index) => (
                <div 
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && handleDropdownEnter(index)}
                  onMouseLeave={() => item.hasDropdown && handleDropdownLeave()}
                >
                  <Link
                    href={item.href}
                    className="relative px-4 py-3 text-base font-medium transition-all duration-300 hover:text-amber-600 flex items-center focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-lg text-gray-700"
                  >
                    {item.name}
                    {item.hasDropdown && (
                      <svg 
                        className={`ml-1 h-4 w-4 transition-transform duration-300 ${
                          activeDropdown === index ? 'rotate-180' : ''
                        }`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </Link>

                  {/* Practice Areas Dropdown */}
                  {item.hasDropdown && (
                    <PracticeAreasDropdown 
                      isOpen={activeDropdown === index}
                      onClose={closeDropdown}
                      onItemClick={closeDropdown}
                    />
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Button & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* Desktop CTA Button */}
              <Link
                href="/online-danismanlik"
                className="hidden md:inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Online Danışmanlık
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-amber-600 hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                aria-label={isMobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
                aria-expanded={isMobileMenuOpen}
              >
                <svg
                  className={`h-6 w-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Component */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        menuItems={navigationStructure}
        practiceAreas={practiceAreasData}
      />

      {/* Header Spacer - kaldırıldı çünkü artık header relative */}
    </>
  );
};

export default Header;