import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AppShell } from "@/components/shared/app-shell";
import { AdminSidebar, AdminTopBar } from "@/components/shared/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect(session.user.role === "LANDLORD" ? "/landlord/dashboard" : "/tenant/dashboard");
  }

  return (
    <AppShell sidebar={<AdminSidebar />} topbar={<AdminTopBar />}>
      {children}
    </AppShell>
  );
}
