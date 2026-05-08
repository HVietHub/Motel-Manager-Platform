import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AppShell } from "@/components/shared/app-shell";
import { LandlordSidebar, LandlordTopBar } from "@/components/shared/landlord-sidebar";
import { PricingUpsellPopup } from "@/components/upsell/pricing-upsell-popup";

export default async function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Tenant trying to access landlord routes → redirect to their dashboard
  if (session.user.role !== "LANDLORD") {
    redirect("/tenant/dashboard");
  }

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
