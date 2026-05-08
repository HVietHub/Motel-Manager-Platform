import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AppShell } from "@/components/shared/app-shell";
import { TenantSidebar, TenantTopBar } from "@/components/shared/tenant-sidebar";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Landlord trying to access tenant routes → redirect to their dashboard
  if (session.user.role !== "TENANT") {
    redirect("/landlord/dashboard");
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
