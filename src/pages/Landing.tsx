import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import LandingFooter from '@/components/landing/LandingFooter';
import WhatsAppButton from '@/components/landing/WhatsAppButton';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <HeroSection />
        {/* Outras seções serão adicionadas aqui */}
      </main>
      <LandingFooter />
      <WhatsAppButton />
    </div>
  );
}
