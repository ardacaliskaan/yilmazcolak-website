// app/ekibimiz/page.js - Complete Dynamic Team Page
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Position Types
const positionTypes = [
  { value: "founding-partner", label: "Kurucu Ortak & Avukat" },
  { value: "managing-partner", label: "Ortak & Avukat" },
  { value: "lawyer", label: "Avukat" },
  { value: "trainee-lawyer", label: "Stajyer Avukat" },
  { value: "legal-assistant", label: "Hukuk Asistanı" }
];

// Hero Section Component
const TeamHeroSection = ({ totalMembers, loading }) => {
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
            Deneyimli ve Uzman
            <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Hukuk Kadromuz
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 leading-relaxed mb-12">
            Her alanda uzmanlaşmış avukatlarımız, size en profesyonel hukuki hizmeti sunmak için burada. 
            Yılların deneyimi ile yanınızdayız.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { number: loading ? "..." : `${totalMembers}`, label: "Uzman Kadromuz" },
              { number: "25+", label: "Yıl Toplam Deneyim" },
              { number: "20+", label: "Uzmanlık Alanı" },
              { number: "1500+", label: "Başarılı Dava" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Team Card Component
const TeamCard = ({ member, index }) => {
  const getPositionColor = (position) => {
    const colorMap = {
      'founding-partner': 'bg-purple-100 text-purple-800 border-purple-200',
      'managing-partner': 'bg-blue-100 text-blue-800 border-blue-200',
      'lawyer': 'bg-green-100 text-green-800 border-green-200',
      'trainee-lawyer': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'legal-assistant': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[position] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPositionLabel = (position) => {
    const pos = positionTypes.find(p => p.value === position);
    return pos ? pos.label : position;
  };

  return (
    <Link href={`/ekibimiz/${member.slug}`} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1 border border-gray-100 h-full flex flex-col">
        
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
          
          {/* Fallback Avatar */}
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-orange-100">
            <div className="text-center">
              <div className="w-24 h-24 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
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
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          
          {/* Position Badge */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPositionColor(member.position)}`}>
              {getPositionLabel(member.position)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300 mb-2">
              {member.name}
            </h3>
            <p className="text-amber-600 font-medium">
              {member.title}
            </p>
          </div>

          {/* Bio Preview */}
          {member.bio && (
            <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
              {member.bio}
            </p>
          )}

          {/* Specializations */}
          {member.specializations && member.specializations.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {member.specializations.slice(0, 3).map((spec, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    {spec}
                  </span>
                ))}
                {member.specializations.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                    +{member.specializations.length - 3} daha
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            {member.email && (
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="truncate">{member.email}</span>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>{member.phone}</span>
              </div>
            )}
          </div>

          {/* View Profile Link */}
          <div className="flex items-center text-amber-600 font-medium text-sm group-hover:text-amber-700 transition-colors duration-300 mt-auto">
            <span>Detayları Görüntüle</span>
            <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Team by Position Component
const TeamByPosition = ({ positionType, members, loading }) => {
  const positionLabel = positionTypes.find(p => p.value === positionType)?.label || positionType;

  if (loading) {
    return (
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {positionLabel}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="aspect-[4/5] bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-16 bg-gray-200 rounded mb-3"></div>
                  <div className="flex flex-wrap gap-1">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) return null;

  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {positionLabel}
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {members.map((member, index) => (
          <TeamCard 
            key={member._id}
            member={member}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

// Main Page Component
export default function EkibimizPage() {
  const [teamMembers, setTeamMembers] = useState({
    'founding-partner': [],
    'managing-partner': [],
    'lawyer': [],
    'trainee-lawyer': [],
    'legal-assistant': []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalMembers, setTotalMembers] = useState(0);

  // Fetch team data
  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all team members
      const response = await fetch('/api/team', {
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
        // Group members by position
        const grouped = {
          'founding-partner': [],
          'managing-partner': [],
          'lawyer': [],
          'trainee-lawyer': [],
          'legal-assistant': []
        };

        data.members.forEach(member => {
          if (grouped[member.position]) {
            grouped[member.position].push(member);
          }
        });

        setTeamMembers(grouped);
        setTotalMembers(data.members.length);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Team data fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <TeamHeroSection totalMembers={totalMembers} loading={loading} />

      {/* Team Members by Position */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
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
                onClick={fetchTeamData}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && totalMembers === 0 && (
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

          {/* Team Sections */}
          {positionTypes.map(positionType => (
            <TeamByPosition 
              key={positionType.value}
              positionType={positionType.value} 
              members={teamMembers[positionType.value]} 
              loading={loading}
            />
          ))}
        </div>
      </section>

      {/* Contact CTA Section */}
      {!loading && totalMembers > 0 && (
        <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Hangi Konuda Yardıma İhtiyacınız Var?
            </h2>
            <p className="text-xl text-amber-100 mb-8 leading-relaxed">
              Uzman kadromuzdan size en uygun avukatı bulabilir, 
              hemen ücretsiz danışmanlık alabilirsiniz.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/iletisim"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>Hemen Danışın</span>
              </Link>
              
              <Link
                href="/hizmetlerimiz"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border-2 border-white/30"
              >
                <span>Hizmetlerimizi İnceleyin</span>
                <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}