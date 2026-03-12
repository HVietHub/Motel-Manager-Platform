import { TenantSidebar, TenantTopBar } from "@/components/tenant-sidebar";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <TenantSidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-0 lg:ml-64">
        <div className="hidden lg:block">
          <TenantTopBar />
        </div>
        <main id="main-content" className="flex-1 overflow-y-auto custom-scrollbar mt-16 lg:mt-0" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
