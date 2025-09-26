import { HeroSection } from "./hero-section";
import { MyCampaignsSection } from "@/app/ui/my-campaigns/components/my-campaigns-section";
import { CampaignsSection } from "@/app/ui/campaign/components/campaigns-section";

export function DashboardLayout() {
  return (
    <>
      <HeroSection />
      <main className="container mx-auto px-4 py-8 space-y-12 max-w-screen-2xl">
        <MyCampaignsSection />
        <CampaignsSection />
      </main>
    </>
  );
}
