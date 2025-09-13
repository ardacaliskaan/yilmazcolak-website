// components/team/TeamProfileImage.js - Sadece Image error handler için
'use client';

import { useState } from 'react';
import Image from 'next/image';

const TeamProfileImage = ({ member }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="md:w-2/5">
      <div className="relative h-80 md:h-full bg-gradient-to-br from-amber-50 to-orange-50">
        {!imageError ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback görüntü - gerçek resim yüklenemezse
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-orange-100">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center shadow-lg mx-auto mb-3">
                <span className="text-xl font-bold text-amber-600">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <p className="text-amber-700 text-sm">{member.name}</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
    </div>
  );
};

export default TeamProfileImage;