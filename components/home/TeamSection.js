// components/home/TeamSection.js - Complete Dynamic Team Section
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const TeamSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side mount kontrolü
  useEffect(() => {
    setIsClient(true);
    fetchTeamMembers();
  }, []);

  // Dynamic team data fetch
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/team?featured=true&limit=6', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.members)) {
        setTeamMembers(data.members);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Team data fetch error:', error);
      setError(error.message);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Position label helper function
  const getPositionLabel = (position) => {
    const positionMap = {
      'founding-partner': 'Kurucu Ortak',
      'managing-partner': 'Ortak',
      'lawyer': 'Avukat',
      'trainee-lawyer': 'Stajyer Avukat',
      'legal-assistant': 'Hukuk Asistanı'
    };
    return positionMap[position] || position;
  };

  // Scroll observer callback
  const handleIntersection = useCallback((entries) => {
    const entry = entries[0];
    if (entry && entry.isIntersecting) {
      setIsVisible(true);
    }
  }, []);

  // Scroll animasyonu - sadece client-side
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    // IntersectionObserver var mı kontrol et
    if (!window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    let observer;
    let element;

    try {
      element = document.getElementById('team-section');
      if (!element) {
        setIsVisible(true);
        return;
      }

      observer = new IntersectionObserver(handleIntersection, {
        threshold: 0.1,
        rootMargin: '50px 0px',
      });

      observer.observe(element);

    } catch (error) {
      console.log('Observer hatası:', error);
      setIsVisible(true);
    }

    return () => {
      try {
        if (observer && element) {
          observer.unobserve(element);
          observer.disconnect();
        }
      } catch (error) {
        console.log('Cleanup hatası:', error);
      }
    };
  }, [isClient, handleIntersection]);

  // Fallback timeout
  useEffect(() => {
    if (!isClient) return;
    
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isClient]);

  // Server-side rendering için basit versiyon
  if (!isClient) {
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Uzman Kadromuz
              </span>
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="team-section"
      className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Uzman Kadromuz
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Alanında uzman, deneyimli avukatlarımız ile hukuki ihtiyaçlarınıza en profesyonel çözümleri sunuyoruz.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto mt-12">
            {[
              { number: `${teamMembers.length}+`, label: "Uzman Avukat" },
              { number: "20+", label: "Yıl Deneyim" },
              { number: "15+", label: "Uzmanlık Alanı" },
              { number: "1000+", label: "Başarılı Dava" }
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`text-center transition-all duration-1000 ease-out ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ 
                  transitionDelay: isVisible ? `${(index + 1) * 100}ms` : '0ms' 
                }}
              >
                <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="aspect-[4/5] bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="flex flex-wrap gap-1">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Veri Yükleme Hatası</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchTeamMembers}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Team Grid */}
        {!loading && !error && teamMembers.length > 0 && (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 transition-all duration-1000 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}>
            {teamMembers.map((member, index) => (
              <div
                key={member._id}
                className={`transition-all duration-700 ease-out ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
                }`}
                style={{ 
                  transitionDelay: isVisible ? `${(index + 5) * 100}ms` : '0ms' 
                }}
              >
                <Link
                  href={`/ekibimiz/${member.slug}`}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-gray-100">
                    
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                      
                      {/* Fallback Avatar */}
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-orange-100">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center shadow-lg mb-2">
                            <span className="text-2xl font-bold text-amber-600">
                              {member.name.split(' ').map(n => n[0]).join('').slice(-2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actual Image */}
                      {member.image && (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      
                      {/* Position Badge */}
                      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-amber-600 shadow-lg">
                          {getPositionLabel(member.position)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300 mb-1">
                          {member.name}
                        </h3>
                        <p className="text-amber-600 font-medium text-sm">
                          {member.title}
                        </p>
                      </div>

                      {/* Bio Preview */}
                      {member.bio && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {member.bio}
                        </p>
                      )}

                      {/* Specializations */}
                      {member.specializations && member.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {member.specializations.slice(0, 2).map((spec, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200"
                            >
                              {spec}
                            </span>
                          ))}
                          {member.specializations.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                              +{member.specializations.length - 2} daha
                            </span>
                          )}
                        </div>
                      )}

                      {/* View Profile Link */}
                      <div className="flex items-center text-amber-600 font-medium text-sm group-hover:text-amber-700 transition-colors duration-300">
                        <span>Profili Görüntüle</span>
                        <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && teamMembers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Ekip Üyesi Yok</h3>
            <p className="text-gray-600">Yakında uzman kadromuzla karşınızda olacağız.</p>
          </div>
        )}

        {/* CTA Section */}
        {!loading && teamMembers.length > 0 && (
          <div className={`text-center bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-12 transition-all duration-1000 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
          style={{ 
            transitionDelay: isVisible ? '800ms' : '0ms' 
          }}>
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Hukuki Destek İhtiyacınız mı Var?
              </h3>
              <p className="text-amber-100 mb-8 text-lg">
                Deneyimli kadromuz size en uygun hukuki çözümü bulmak için burada. 
                Hemen iletişime geçin ve profesyonel danışmanlık alın.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/ekibimiz"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span>Tüm Ekibimizi Görün</span>
                  <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                
                <Link
                  href="/iletisim"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border-2 border-white/30"
                >
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>Hemen Danışın</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;