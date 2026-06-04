import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AppShell } from "@/components/shared/app-shell";
import { LandlordSidebar, LandlordTopBar } from "@/components/shared/landlord-sidebar";
import { TenantSidebar, TenantTopBar } from "@/components/shared/tenant-sidebar";

/**
 * Community layout — shared by /community/[id] post detail pages.
 * Renders the correct sidebar based on the user's role (LANDLORD or TENANT).
 */
export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const isLandlord = session.user.role === "LANDLORD";

  if (isLandlord) {
    return (
      <AppShell
        sidebar={<LandlordSidebar />}
        topbar={<LandlordTopBar />}
      >
        {children}
      </AppShell>
    );
  }

  return (
    <AppShell
      sidebar={<TenantSidebar />}
      topbar={<TenantTopBar />}
      contentClassName="ml-0 lg:ml-64"
    >
      {children}
    </AppShell>
  );
}
