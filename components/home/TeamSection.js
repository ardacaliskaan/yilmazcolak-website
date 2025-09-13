// components/home/TeamSection.js - useEffect ref problemi düzeltildi
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import TeamCard from '@/components/team/TeamCard';
import { getFeaturedTeamMembers } from '@/data/teamData';

const TeamSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const teamMembers = getFeaturedTeamMembers();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = sectionRef.current; // Ref'i değişkene kopyala

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) { // Cleanup'ta kopyalanan değişkeni kullan
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
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
            Alanında uzman, deneyimli avukatlarımız ile hukuki ihtiyaçlarınıza 
            en profesyonel çözümleri sunuyoruz.
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
                className={`text-center transition-all duration-1000 ${
                  isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-5'
                }`}
                style={{ transitionDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="text-2xl md:text-3xl font-bold text-amber-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className={`transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-10'
              }`}
              style={{ 
                transitionDelay: isVisible ? `${0.5 + index * 0.1}s` : '0s'
              }}
            >
              <TeamCard 
                member={member} 
                index={index}
              />
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`text-center mt-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
        }`} style={{ transitionDelay: '1s' }}>
          
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Hangi Alanda Uzman Desteğe İhtiyacınız Var?
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

        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;