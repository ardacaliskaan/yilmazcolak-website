import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import Footer from '@/components/layout/Footer';
import PracticeAreasGrid from '@/components/home/PracticeAreasGrid';
import TeamSection from '@/components/home/TeamSection';

export default function Home() {
  return (
    <>
      {/* Header Component */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Practice Areas Grid */}
      <PracticeAreasGrid />

      {/* Team Section */}
      <TeamSection />

      {/* Footer Component */}
      <Footer />
    </>
  );
}

export const metadata = {
  title: 'Yılmaz Çolak Hukuk Bürosu | Karabük Avukat - Profesyonel Hukuki Danışmanlık',
  description: 'Karabük\'te uzman avukat kadromuzla aile hukuku, ceza hukuku, iş hukuku, ticaret hukuku ve daha birçok alanda profesyonel hukuki hizmet veriyoruz.',
  keywords: 'Karabük avukat, hukuk bürosu, aile hukuku, ceza hukuku, iş hukuku, ticaret hukuku, hukuki danışmanlık',
};