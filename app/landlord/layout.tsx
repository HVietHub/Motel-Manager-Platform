import { AppShell } from "@/components/shared/app-shell";
import { LandlordSidebar, LandlordTopBar } from "@/components/shared/landlord-sidebar";
import { PricingUpsellPopup } from "@/components/upsell/pricing-upsell-popup";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      sidebar={<LandlordSidebar />}
      topbar={<LandlordTopBar />}
      extras={<PricingUpsellPopup />}
    >
      {children}
    </AppShell>
  );
}
