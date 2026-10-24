import { HeroSection } from "@/components/home/hero";
import { AboutSection } from "@/components/home/about";
import { SiteHeader } from "@/components/layout/site-header";
import { PlacesToVisit } from "@/components/places/places-to-visit";
import { ThemesSection } from "@/components/home/theme";
import { SpeakersSection } from "@/components/home/speaker";
import { ProgrammeSection } from "@/components/home/programme";
import { ImportantDatesSection } from "@/components/home/important-dates";
import { VenueContactSection } from "@/components/home/venue-contact";

const Home = () => (
  <div className="flex min-h-screen flex-col bg-canvas">
    <SiteHeader />
    <main className="flex-1">
      <HeroSection />
      <AboutSection />
      <ThemesSection />
      <SpeakersSection />
      <ProgrammeSection />
      <ImportantDatesSection />
      <VenueContactSection />
      <PlacesToVisit />
    </main>
  </div>
);

export default Home;
