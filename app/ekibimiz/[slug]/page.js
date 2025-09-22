// app/ekibimiz/[slug]/page.js - Complete Dynamic Team Member Page
'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Team Member Profile Component
const TeamMemberProfile = ({ member }) => {
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
    const positionMap = {
      'founding-partner': 'Ortak & Avukat',
      'managing-partner': 'Ortak & Avukat',
      'lawyer': 'Avukat',
      'trainee-lawyer': 'Stajyer Avukat',
      'legal-assistant': 'Hukuk Asistanı'
    };
    return positionMap[position] || position;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="md:flex">
        
        {/* Profile Image */}
        <div className="md:w-2/5 aspect-[4/5] md:aspect-auto relative bg-gradient-to-br from-amber-50 to-orange-50">
          
          {/* Fallback Avatar */}
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-orange-100">
            <div className="text-center">
              <div className="w-32 h-32 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-amber-600">
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
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="md:w-3/5 p-8 lg:p-12">
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {member.name}
            </h1>
            <div className="text-xl text-amber-600 font-semibold bg-amber-50 rounded-lg px-4 py-2 inline-block mb-3">
              {member.title}
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPositionColor(member.position)}`}>
              {getPositionLabel(member.position)}
            </div>
          </div>

          {/* Bio */}
          {member.bio && (
            <div className="mb-8">
              <p className="text-gray-600 leading-relaxed text-lg">
                {member.bio}
              </p>
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Birth Info */}
            {(member.birthYear || member.birthPlace) && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Doğum</h3>
                <p className="text-gray-600">
                  {member.birthYear && member.birthPlace 
                    ? `${member.birthYear}, ${member.birthPlace}`
                    : member.birthYear || member.birthPlace
                  }
                </p>
              </div>
            )}

            {/* Bar Association */}
            {member.barAssociation && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Baro</h3>
                <p className="text-gray-600">{member.barAssociation}</p>
              </div>
            )}

            {/* Contact */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-800 mb-3">İletişim</h3>
              <div className="space-y-2">
                {member.email && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <a href={`mailto:${member.email}`} className="hover:text-amber-600 transition-colors">
                      {member.email}
                    </a>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <a href={`tel:${member.phone}`} className="hover:text-amber-600 transition-colors">
                      {member.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/iletisim"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              İletişime Geçin
            </Link>
            <Link
              href="/randevu"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-amber-500 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Randevu Alın
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Specializations Section
const SpecializationsSection = ({ specializations }) => {
  if (!specializations || specializations.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
        Uzmanlık Alanları
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specializations.map((spec, index) => (
          <div 
            key={index}
            className="flex items-center p-4 bg-amber-50 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">{spec}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Education Section
const EducationSection = ({ education }) => {
  if (!education || education.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
        Eğitim
      </h2>
      <div className="space-y-6">
        {education.map((edu, index) => (
          <div key={index} className="border-l-4 border-amber-400 pl-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-lg">
                {edu.degree}
              </h3>
              {edu.year && (
                <span className="text-amber-600 font-medium text-sm">
                  {edu.year}
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-2">{edu.institution}</p>
            {edu.description && (
              <p className="text-gray-500 text-sm">{edu.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Certificates Section
const CertificatesSection = ({ certificates }) => {
  if (!certificates || certificates.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
        Sertifikalar ve Kurslar
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {certificates.map((cert, index) => (
          <div 
            key={index}
            className="flex items-start p-4 bg-blue-50 rounded-xl border border-blue-200"
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-700 leading-relaxed">{cert}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Publications Section
const PublicationsSection = ({ member }) => {
  if (!member.publishedBook && !member.masterThesis) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
        Yayınlar ve Tezler
      </h2>
      <div className="space-y-6">
        {member.publishedBook && (
          <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Yayınlanan Kitap
            </h3>
            <p className="text-purple-700">{member.publishedBook}</p>
          </div>
        )}
        {member.masterThesis && (
          <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
            <h3 className="font-semibold text-indigo-800 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Yüksek Lisans Tezi
            </h3>
            <p className="text-indigo-700">{member.masterThesis}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Related Team Members Component
const RelatedTeamMembers = ({ relatedMembers }) => {
  if (!relatedMembers || relatedMembers.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
        Diğer Ekip Üyeleri
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedMembers.map((member) => (
          <Link
            key={member._id}
            href={`/ekibimiz/${member.slug}`}
            className="group block p-4 bg-gray-50 rounded-xl hover:bg-amber-50 transition-colors duration-300"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-amber-200 transition-colors duration-300 overflow-hidden">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <span class="text-lg font-bold text-amber-600">
                          ${member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      `;
                    }}
                  />
                ) : (
                  <span className="text-lg font-bold text-amber-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors duration-300">
                {member.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{member.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Main Page Component
export default function TeamMemberPage({ params }) {
  const [member, setMember] = useState(null);
  const [relatedMembers, setRelatedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMemberData();
  }, [params.slug]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/team/${params.slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        notFound();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.member) {
        setMember(data.member);
        setRelatedMembers(data.relatedMembers || []);
      } else {
        throw new Error(data.message || 'Member not found');
      }
    } catch (error) {
      console.error('Member data fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <section className="pt-32 pb-12 bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-2/5 aspect-[4/5] bg-gray-200"></div>
                  <div className="md:w-3/5 p-8 lg:p-12">
                    <div className="h-10 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-6"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <section className="pt-32 pb-12 bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Veri Yükleme Hatası</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchMemberData}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (!member) {
    notFound();
    return null;
  }

  return (
    <>
      <Header />
      
      {/* Hero Section with Breadcrumbs */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-amber-600 transition-colors duration-200">
                Ana Sayfa
              </Link>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link href="/ekibimiz" className="hover:text-amber-600 transition-colors duration-200">
                Ekibimiz
              </Link>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-amber-600 font-medium">{member.name}</span>
            </div>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            
            {/* Profile Section */}
            <TeamMemberProfile member={member} />

            {/* Specializations */}
            <SpecializationsSection specializations={member.specializations} />

            {/* Education */}
            <EducationSection education={member.education} />

            {/* Certificates */}
            <CertificatesSection certificates={member.certificates} />

            {/* Publications */}
            <PublicationsSection member={member} />

            {/* Related Team Members */}
            <RelatedTeamMembers relatedMembers={relatedMembers} />
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {member.name} ile İletişime Geçin
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            {member.specializations?.slice(0, 3).join(', ')} alanlarında profesyonel destek alın.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Hemen İletişime Geçin
            </Link>
            
            <Link
              href="/ekibimiz"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border-2 border-white/30"
            >
              <span>Diğer Ekip Üyelerini Görün</span>
              <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}