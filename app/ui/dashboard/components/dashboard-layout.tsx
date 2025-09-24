import { HeroSection } from "./hero-section";
import { CampaignsSection } from "./campaigns-section";

export function DashboardLayout() {
  return (
    <>
      <HeroSection />
      <main className="container mx-auto px-4 py-8 space-y-12 max-w-screen-2xl">
        <CampaignsSection />
      </main>
    </>
  );
}
