// app/page.js - Basit dynamic import
import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import Footer from '@/components/layout/Footer';
import PracticeAreasGrid from '@/components/home/PracticeAreasGrid';
import dynamic from 'next/dynamic';

// TeamSection'ı dynamic import
const TeamSection = dynamic(() => import('@/components/home/TeamSection'));

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <PracticeAreasGrid />
      <TeamSection />
      <Footer />
    </>
  );
}

export const metadata = {
  title: 'Yılmaz Çolak Hukuk Bürosu | Karabük Avukat - Profesyonel Hukuki Danışmanlık',
  description: 'Karabük\'te uzman avukat kadromuzla aile hukuku, ceza hukuku, iş hukuku, ticaret hukuku ve daha birçok alanda profesyonel hukuki hizmet veriyoruz.',
  keywords: 'Karabük avukat, hukuk bürosu, aile hukuku, ceza hukuku, iş hukuku, ticaret hukuku, hukuki danışmanlık',
};