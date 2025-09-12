'use client';

import Link from 'next/link';

// Practice Areas Data
const practiceAreas = [
  {
    id: 1,
    name: "Aile Hukuku",
    slug: "aile-hukuku",
    description: "Boşanma, nafaka, velayet davalarında uzman hizmet",
    icon: "👨‍👩‍👧‍👦"
  },
  {
    id: 2,
    name: "Ceza Hukuku",
    slug: "ceza-hukuku", 
    description: "Ceza davalarında profesyonel savunma hizmetleri",
    icon: "⚖️"
  },
  {
    id: 3,
    name: "İdare Hukuku",
    slug: "idare-hukuku",
    description: "Kamu yönetimi ve idari davalar",
    icon: "🏛️"
  }
];

const PracticeAreasGrid = () => {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Çalışma Alanlarımız
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Uzman kadromuz ve 15 yıllık deneyimimizle her hukuki konuda profesyonel destek sunuyoruz. 
            Haklarınızı korumak için buradayız.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {practiceAreas.map((area) => (
            <Link
              key={area.id}
              href={`/calisma-alanlari/${area.slug}`}
              className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100"
            >
              {/* Icon */}
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {area.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors duration-300">
                {area.name}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                {area.description}
              </p>
              
              {/* Arrow */}
              <div className="flex items-center text-amber-600 font-semibold">
                <span className="mr-2">Detaylı Bilgi</span>
                <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/calisma-alanlari"
            className="inline-flex items-center px-8 py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Tüm Çalışma Alanlarını Görüntüle
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PracticeAreasGrid;