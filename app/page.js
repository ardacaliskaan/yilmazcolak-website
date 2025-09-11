import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import Footer from '@/components/layout/Footer';
import PracticeAreasGrid from '@/components/home/PracticeAreasGrid';

export default function Home() {
  return (
    <>
      {/* Header Component */}
      <Header />

      {/* Hero Section */}
      <HeroSection />
<PracticeAreasGrid />
      {/* Footer Component */}
      <Footer />
    </>
  );
}