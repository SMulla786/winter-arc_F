import BrandListSection from '@/components/Website/BrandListSection';
import ClientsCountSection from '@/components/Website/ClientsCountSection';
import FeatureSection from '@/components/Website/FeatureSection';
import FooterSection from '@/components/Website/FooterSection';
import HeaderSection from '@/components/Website/HeaderSection';
import HeroSection from '@/components/Website/HeroSection';
import IndustryRatingSection from '@/components/Website/IndustryRatingSection';
import ScheduleDemoSection from '@/components/Website/ScheduleDemoSection';
import {Suspense, lazy} from 'react';

const VideoSection = lazy(() => import('@/components/Website/VideoSection'));

const LandingPage = () => {
  return (
    <div className="h-full w-full bg-white">
      <HeaderSection />
      <HeroSection />
      <div className="mt-100">
        <FeatureSection />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <VideoSection />
      </Suspense>{' '}
      <BrandListSection />
      <ClientsCountSection />
      <IndustryRatingSection />
      <ScheduleDemoSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
