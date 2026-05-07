import { AppShell } from "@/components/shared/app-shell";
import { TenantSidebar, TenantTopBar } from "@/components/shared/tenant-sidebar";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
