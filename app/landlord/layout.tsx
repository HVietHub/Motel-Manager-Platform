import { LandlordSidebar } from "@/components/landlord-sidebar";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <LandlordSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto bg-muted/30 custom-scrollbar" role="main">
        {children}
      </main>
    </div>
  );
}
