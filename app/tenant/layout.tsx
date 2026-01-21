import { TenantSidebar } from "@/components/tenant-sidebar";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <TenantSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto lg:ml-64 mt-16 lg:mt-0 custom-scrollbar" role="main">
        {children}
      </main>
    </div>
  );
}
