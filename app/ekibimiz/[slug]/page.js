// app/ekibimiz/[slug]/page.js - Senin mevcut sayfan, sadece Image komponenti değiştirildi
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TeamProfileImage from '@/components/team/TeamProfileImage';
import { getTeamMemberBySlug, teamData } from '@/data/teamData';

// Generate static params for all team members
export async function generateStaticParams() {
  return teamData
    .filter(member => member.isActive)
    .map(member => ({
      slug: member.slug,
    }));
}

// Generate metadata for each team member
export async function generateMetadata({ params }) {
  const member = getTeamMemberBySlug(params.slug);
  
  if (!member) {
    return {
      title: 'Ekip Üyesi Bulunamadı - Yılmaz Çolak Hukuk Bürosu'
    };
  }

  return {
    title: `${member.name} - ${member.title} | Yılmaz Çolak Hukuk Bürosu`,
    description: `${member.name}, ${member.title} olarak ${member.specializations?.join(', ')} alanlarında uzman hizmet vermektedir.`,
    keywords: `${member.name}, ${member.title}, ${member.specializations?.join(', ')}, Karabük avukat`,
  };
}

// Team Member Profile Component - Sadece Image kısmı değiştirildi
const TeamMemberProfile = ({ member }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="md:flex">
        
        {/* Profile Image - Client component olarak değiştirildi */}
        <TeamProfileImage member={member} />

        {/* Profile Info */}
        <div className="md:w-3/5 p-8 lg:p-12">
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {member.name}
            </h1>
            <div className="text-xl text-amber-600 font-semibold bg-amber-50 rounded-lg px-4 py-2 inline-block">
              {member.title}
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
                {member.barRegistrationYear && (
                  <p className="text-sm text-gray-500">Kayıt: {member.barRegistrationYear}</p>
                )}
              </div>
            )}

            {/* Languages */}
            {member.languages && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Diller</h3>
                <p className="text-gray-600">{member.languages.join(', ')}</p>
              </div>
            )}

            {/* Experience */}
            {member.experience && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Deneyim</h3>
                <p className="text-gray-600">{member.experience} Yıl</p>
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors duration-300"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              İletişime Geç
            </Link>
            <Link
              href="/randevu-al"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-300"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Randevu Al
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
            className="flex items-center p-4 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors duration-300"
          >
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-4"></div>
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
          <div key={index} className="border-l-4 border-amber-500 pl-6 py-2">
            <h3 className="font-semibold text-gray-800 text-lg">
              {edu.degree}
            </h3>
            <p className="text-amber-600 font-medium">
              {edu.institution}
            </p>
            {edu.year && (
              <p className="text-gray-500 text-sm">
                {edu.year}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Career History Section
const CareerHistorySection = ({ careerHistory }) => {
  if (!careerHistory || careerHistory.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
        Kariyer Geçmişi
      </h2>
      <div className="space-y-4">
        {careerHistory.map((career, index) => (
          <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl">
            <div className="w-2 h-2 bg-amber-500 rounded-full mr-4"></div>
            <span className="text-gray-700">{career}</span>
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
        Sertifikalar ve Eğitimler
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {certificates.map((cert, index) => (
          <div
            key={index}
            className="flex items-start p-4 bg-green-50 rounded-xl border border-green-100"
          >
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-700 text-sm leading-relaxed">{cert}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Achievements Section
const AchievementsSection = ({ achievements }) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
        Başarılar
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className="flex items-center p-4 bg-amber-50 rounded-xl border border-amber-200"
          >
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">{achievement}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Special Publications Section
const PublicationsSection = ({ member }) => {
  if (!member.publishedBook && !member.masterThesis) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
        Yayınlar ve Tezler
      </h2>
      <div className="space-y-6">
        {member.publishedBook && (
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Yayınlanan Kitap</h3>
            <p className="text-blue-700">{member.publishedBook}</p>
          </div>
        )}
        {member.masterThesis && (
          <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">Yüksek Lisans Tezi</h3>
            <p className="text-purple-700">{member.masterThesis}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Related Team Members Component
const RelatedTeamMembers = ({ currentMember }) => {
  const relatedMembers = teamData
    .filter(member => 
      member.isActive && 
      member.id !== currentMember.id &&
      member.position === currentMember.position
    )
    .slice(0, 3);

  if (relatedMembers.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
        Diğer Ekip Üyeleri
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedMembers.map((member) => (
          <Link
            key={member.id}
            href={`/ekibimiz/${member.slug}`}
            className="group block p-4 bg-gray-50 rounded-xl hover:bg-amber-50 transition-colors duration-300"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-amber-200 transition-colors duration-300">
                <span className="text-lg font-bold text-amber-600">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
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
  const member = getTeamMemberBySlug(params.slug);

  if (!member) {
    notFound();
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

            {/* Career History */}
            <CareerHistorySection careerHistory={member.careerHistory} />

            {/* Certificates */}
            <CertificatesSection certificates={member.certificates} />

            {/* Achievements */}
            <AchievementsSection achievements={member.achievements} />

            {/* Publications */}
            <PublicationsSection member={member} />

            {/* Related Team Members */}
            <RelatedTeamMembers currentMember={member} />
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
            {member.specializations?.join(', ')} alanlarında profesyonel destek alın.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-colors duration-300"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              İletişime Geç
            </Link>
            <Link
              href="/randevu-al"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors duration-300 border-2 border-white/30"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Randevu Al
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}