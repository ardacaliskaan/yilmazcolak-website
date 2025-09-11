'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const heroSlides = [
  {
    id: 1,
    title: "Hukuki Haklarınızı Güçlü Savunuculukla Koruyoruz",
    subtitle: "15 yıllık deneyim ve uzman kadromuzla tüm hukuki süreçlerde yanınızdayız. Adaleti sizin için mücadele ediyoruz.",
    buttonText: "Detaylı Gör",
    buttonLink: "/calisma-alanlari",
    image: "/images/hero-1.jpg"
  },
  {
    id: 2,
    title: "Aile Hukukunda Hassas ve Deneyimli Yaklaşım",
    subtitle: "Boşanma, nafaka, velayet gibi kişisel konularda profesyonel destek. Haklarınızı korurken ailenizi de düşünüyoruz.",
    buttonText: "Detaylı Gör",
    buttonLink: "/calisma-alanlari/aile-hukuku",
    image: "/images/hero-2.jpg"
  },
  {
    id: 3,
    title: "İş Hukuku ve Çalışan Hakları Uzmanınız",
    subtitle: "İşçi-işveren ilişkilerinde adil çözümler. Çalışma hayatındaki haklarınızı koruma altına alıyoruz.",
    buttonText: "Detaylı Gör", 
    buttonLink: "/calisma-alanlari/is-hukuku",
    image: "/images/hero-3.jpg"
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
      
      {/* Background Images */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: `url('${slide.image}')`,
            }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {currentSlideData.title}
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 max-w-2xl">
              {currentSlideData.subtitle}
            </p>

            {/* Button */}
            <Link
              href={currentSlideData.buttonLink}
              className="inline-flex items-center px-8 py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-all duration-300 hover:scale-105"
            >
              {currentSlideData.buttonText}
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300"
        aria-label="Önceki"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300"
        aria-label="Sonraki"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-amber-500' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;