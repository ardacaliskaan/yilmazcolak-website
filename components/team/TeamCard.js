// components/team/TeamCard.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const TeamCard = ({ member, index = 0, showFullInfo = false }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation delay for staggered entrance
  const animationDelay = `${index * 0.1}s`;

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoaded(true);
  };

  return (
    <Link
      href={`/ekibimiz/${member.slug}`}
      className="group block"
      style={{ 
        animationDelay,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-gray-100">
        
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
          
          {/* Loading Skeleton */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}
          
          {/* Profile Image */}
          {!imageError ? (
            <Image
              src={member.image}
              alt={member.name}
              fill
              className={`object-cover transition-all duration-700 group-hover:scale-105 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            // Fallback Avatar
            <div className={`flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-orange-100 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-amber-600">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Hover Content */}
          <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
            <div className="text-white">
              <div className="text-sm font-medium mb-2">
                Uzmanlik Alanları
              </div>
              <div className="text-xs space-y-1 max-h-20 overflow-hidden">
                {member.specializations?.slice(0, 3).map((spec, idx) => (
                  <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 inline-block mr-1 mb-1">
                    {spec}
                  </div>
                ))}
                {member.specializations?.length > 3 && (
                  <div className="text-white/80 text-xs">
                    +{member.specializations.length - 3} daha...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors duration-300">
            {member.name}
          </h3>
          
          {/* Title */}
          <div className="text-amber-600 font-semibold text-sm mb-3 bg-amber-50 rounded-lg px-3 py-1 inline-block">
            {member.title}
          </div>

          {/* Extended Info for Full Display */}
          {showFullInfo && (
            <div className="space-y-3 mt-4">
              
              {/* Experience/Education */}
              {member.education && (
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm mb-1">Eğitim</h4>
                  <div className="text-xs text-gray-600">
                    {member.education[member.education.length - 1]?.institution}
                  </div>
                </div>
              )}

              {/* Bar Association */}
              {member.barAssociation && (
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm mb-1">Baro</h4>
                  <div className="text-xs text-gray-600">{member.barAssociation}</div>
                </div>
              )}

              {/* Languages */}
              {member.languages && (
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm mb-1">Diller</h4>
                  <div className="text-xs text-gray-600">
                    {member.languages.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Specializations Preview */}
          {!showFullInfo && member.specializations && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-1">
                {member.specializations.slice(0, 2).map((spec, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-1"
                  >
                    {spec}
                  </span>
                ))}
                {member.specializations.length > 2 && (
                  <span className="text-xs text-gray-400">
                    +{member.specializations.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Indicator */}
          <div className="mt-4 flex items-center text-amber-600 text-sm font-medium group-hover:text-amber-700 transition-colors duration-300">
            <span>Profili İncele</span>
            <svg 
              className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TeamCard;

// CSS for animations (add to globals.css)
const teamCardStyles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.team-card-enter {
  opacity: 0;
  transform: translateY(30px);
}

.team-card-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.6s ease-out;
}
`;

export { teamCardStyles };