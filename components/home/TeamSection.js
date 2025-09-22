// components/home/TeamSection.js - iOS Safari %100 Güvenli
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  // 🔧 Direkt mount, hiç isClient yok
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/team?featured=true', {
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

  const getPositionLabel = (position) => {
    const positionMap = {
      'founding-partner': 'Ortak & Avukat',
      'managing-partner': 'Ortak & Avukat',
      'lawyer': 'Avukat',
      'trainee-lawyer': 'Stajyer Avukat',
      'legal-assistant': 'Hukuk Asistanı'
    };
    return positionMap[position] || position;
  };

  const getPositionHierarchy = (position) => {
    const hierarchy = {
      'founding-partner': 1,
      'managing-partner': 1,
      'lawyer': 2,
      'trainee-lawyer': 3,
      'legal-assistant': 4
    };
    return hierarchy[position] || 6;
  };

  // Sort team members by hierarchy then by sortOrder
  const sortedMembers = [...teamMembers].sort((a, b) => {
    const hierarchyA = getPositionHierarchy(a.position);
    const hierarchyB = getPositionHierarchy(b.position);
    
    if (hierarchyA !== hierarchyB) {
      return hierarchyA - hierarchyB;
    }
    
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  // 🔧 IntersectionObserver YOK, direkt render
  return (
    <section 
      id="team-section"
      className="relative py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden"
    >
      {/* Background Elements - Aynı */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-100/30 to-orange-100/30 rounded-full blur-3xl transform -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-100/30 to-orange-100/30 rounded-full blur-3xl transform translate-x-48 translate-y-48"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Animasyon YOK, direkt görünür */}
        <div className="text-center mb-20">
          
          {/* Main Title - Aynı stil */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 tracking-tight leading-none">
            <span className="block">Uzman</span>
            <span className="block bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
              Kadromuz
            </span>
          </h2>
          
          {/* Subtitle - Aynı */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            Hukuk alanında yılların deneyimine sahip, uzman kadromuzla 
            size en profesyonel hizmeti sunmak için buradayız
          </p>

          {/* Stats Bar - Aynı (animasyon yok) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mt-16">
            {[
              { number: teamMembers.length || '12', label: 'Uzman Avukat' },
              { number: '25+', label: 'Yıl Deneyim' },
              { number: '500+', label: 'Başarılı Dava' },
              { number: '100%', label: 'Müvekkil Memnuniyeti' }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-semibold text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading State - Aynı */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/50 shadow-lg">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State - Aynı */}
        {error && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Veri Yükleme Hatası</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchTeamMembers}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-2xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Team Grid - Animasyon YOK, direkt görünür */}
        {!loading && !error && sortedMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedMembers.map((member, index) => (
              <div
                key={member._id || index}
                className="group"
                onMouseEnter={() => setHoveredMember(member._id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <Link href={`/ekibimiz/${member.slug || '#'}`} className="block">
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02]">
                    
                    {/* Image Container - Aynı */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name || 'Team Member'}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200">
                          <div className="text-center">
                            <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center shadow-lg mb-4 transform transition-all duration-300 group-hover:scale-110">
                              <span className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                {(member.name || 'AA').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Gradient Overlay - Aynı */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      
                      {/* Position Badge - Aynı */}
                      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-1 group-hover:translate-y-0">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 backdrop-blur-md text-gray-700 shadow-md border border-white/40">
                          {getPositionLabel(member.position)}
                        </span>
                      </div>
                      
                      {/* Specializations Overlay - Aynı */}
                      {member.specializations && Array.isArray(member.specializations) && member.specializations.length > 0 && (
                        <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                          <div className="space-y-2">
                            <div className="text-white text-xs font-semibold uppercase tracking-wider">
                              Uzmanlık Alanları
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {member.specializations.slice(0, 2).map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white/20 backdrop-blur-xl text-white text-xs px-3 py-1 rounded-full border border-white/30"
                                >
                                  {spec}
                                </span>
                              ))}
                              {member.specializations.length > 2 && (
                                <span className="bg-amber-500/80 backdrop-blur-xl text-white text-xs px-3 py-1 rounded-full font-semibold">
                                  +{member.specializations.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content - Aynı */}
                    <div className="p-6">
                      <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 group-hover:bg-clip-text transition-all duration-300">
                        {member.name || 'İsim Belirtilmemiş'}
                      </h3>
                      <p className="text-amber-600 font-semibold text-sm mb-4">
                        {member.title || getPositionLabel(member.position)}
                      </p>

                      {/* Brief Bio - Aynı */}
                      {member.bio && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                          {member.bio}
                        </p>
                      )}

                      {/* Languages - Aynı */}
                      {member.languages && Array.isArray(member.languages) && member.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {member.languages.slice(0, 3).map((lang, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Hover Effect Arrow - Aynı */}
                      <div className="flex justify-end mt-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Empty State - Aynı */}
        {!loading && !error && sortedMembers.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Henüz Ekip Üyesi Yok</h3>
            <p className="text-gray-600 max-w-md mx-auto">Yakında uzman kadromuzla karşınızda olacağız.</p>
          </div>
        )}

        {/* Call to Action - Animasyon YOK */}
        {!loading && !error && sortedMembers.length > 0 && (
          <div className="text-center mt-20">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-12 shadow-2xl">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-6">
                Hangi Konuda Yardıma İhtiyacınız Var?
              </h3>
              <p className="text-xl text-amber-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Uzman kadromuzdan size en uygun avukatı bulabilir, 
                hemen ücretli danışmanlık alabilirsiniz
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/iletisim"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-600 font-black rounded-2xl hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="mr-3 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>Hemen Danışın</span>
                </Link>
                
                <Link
                  href="/ekibimiz"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-black rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border-2 border-white/30"
                >
                  <span>Tüm Kadroyu Görün</span>
                  <svg className="ml-3 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
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