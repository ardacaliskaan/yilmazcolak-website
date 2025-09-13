// app/ekibimiz/page.js - <a> tagları Link ile değiştirildi
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TeamCard from '@/components/team/TeamCard';
import { teamData, getTeamMembersByPosition, positionTypes } from '@/data/teamData';

// Hero Section Component
const TeamHeroSection = () => {
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
              { number: `${teamData.filter(m => m.isActive).length}`, label: "Uzman Kadromuz" },
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

// Team by Position Component
const TeamByPosition = ({ positionType, members }) => {
  if (members.length === 0) return null;

  const positionLabel = positionTypes.find(p => p.value === positionType)?.label || positionType;

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
            key={member.id}
            member={member}
            index={index}
            showFullInfo={true}
          />
        ))}
      </div>
    </div>
  );
};

// Main Page Component
export default function EkibimizPage() {
  // Group team members by position
  const foundingPartners = getTeamMembersByPosition('founding-partner');
  const managingPartners = getTeamMembersByPosition('managing-partner');
  const lawyers = getTeamMembersByPosition('lawyer');
  const traineeLawyers = getTeamMembersByPosition('trainee-lawyer');
  const legalAssistants = getTeamMembersByPosition('legal-assistant');

  return (
    <>
      <Header />
      
      <TeamHeroSection />

      {/* Team Members by Position */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Founding Partners */}
          <TeamByPosition 
            positionType="founding-partner" 
            members={foundingPartners} 
          />

          {/* Managing Partners */}
          <TeamByPosition 
            positionType="managing-partner" 
            members={managingPartners} 
          />

          {/* Lawyers */}
          <TeamByPosition 
            positionType="lawyer" 
            members={lawyers} 
          />

          {/* Trainee Lawyers */}
          <TeamByPosition 
            positionType="trainee-lawyer" 
            members={traineeLawyers} 
          />

          {/* Legal Assistants */}
          <TeamByPosition 
            positionType="legal-assistant" 
            members={legalAssistants} 
          />
        </div>
      </section>

      {/* Contact CTA Section */}
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
              href="/calisma-alanlari"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border-2 border-white/30"
            >
              <span>Çalışma Alanları</span>
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

// Metadata
export const metadata = {
  title: 'Ekibimiz - Yılmaz Çolak Hukuk Bürosu | Uzman Avukatlarımız',
  description: 'Deneyimli ve uzman avukatlarımız ile tanışın. Her alanda uzmanlaşmış hukuk kadromuz size profesyonel hizmet sunmaya hazır.',
  keywords: 'avukat kadrosu, hukuk ekibi, uzman avukatlar, Karabük avukat, hukuki danışmanlık',
};