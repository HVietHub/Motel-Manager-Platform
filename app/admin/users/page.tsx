import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

function formatRole(role: string) {
  if (role === "LANDLORD") return "Chủ nhà";
  if (role === "TENANT") return "Người thuê";
  if (role === "ADMIN") return "Quản trị viên";
  return role;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string; q?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect(session.user.role === "LANDLORD" ? "/landlord/dashboard" : "/tenant/dashboard");
  }

  const params = await searchParams;
  const role = params?.role && params.role !== "ALL" ? params.role : undefined;
  const q = params?.q?.trim();

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      landlord: { include: { buildings: true } },
      tenant: { include: { room: true, contracts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const landlordCount = users.filter((user) => user.role === "LANDLORD").length;
  const tenantCount = users.filter((user) => user.role === "TENANT").length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Quản lý người dùng</h1>
        <p className="text-sm text-slate-600">Theo dõi tài khoản chủ nhà, người thuê và quản trị viên trong khu vực quản trị.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng kết quả</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chủ nhà</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{landlordCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Người thuê</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>Giao diện quản lý chỉ đọc cho tài khoản chủ nhà, người thuê và quản trị viên.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <FilterLink href="/admin/users" active={!role}>Tất cả</FilterLink>
            <FilterLink href="/admin/users?role=LANDLORD" active={role === "LANDLORD"}>Chủ nhà</FilterLink>
            <FilterLink href="/admin/users?role=TENANT" active={role === "TENANT"}>Người thuê</FilterLink>
            <FilterLink href="/admin/users?role=ADMIN" active={role === "ADMIN"}>Quản trị viên</FilterLink>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-3 pr-4 font-medium">Người dùng</th>
                  <th className="py-3 pr-4 font-medium">Vai trò</th>
                  <th className="py-3 pr-4 font-medium">Trạng thái</th>
                  <th className="py-3 pr-4 font-medium">Mã / Số điện thoại</th>
                  <th className="py-3 pr-4 font-medium">Thông tin sử dụng</th>
                  <th className="py-3 font-medium">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-950">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="py-3 pr-4"><Badge variant="secondary">{formatRole(user.role)}</Badge></td>
                    <td className="py-3 pr-4"><Badge variant={user.isValid ? "outline" : "destructive"}>{user.isValid ? "Hợp lệ" : "Đã khóa"}</Badge></td>
                    <td className="py-3 pr-4 text-slate-600">
                      {user.role === "LANDLORD" && user.landlord ? `${user.landlord.userCode} / ${user.landlord.phone}` : null}
                      {user.role === "TENANT" && user.tenant ? `${user.tenant.userCode} / ${user.tenant.phone}` : null}
                      {user.role === "ADMIN" ? "Tài khoản quản trị" : null}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {user.role === "LANDLORD" && user.landlord ? `${user.landlord.buildings.length} tòa nhà, gói ${user.landlord.plan}` : null}
                      {user.role === "TENANT" && user.tenant ? `${user.tenant.room ? `Phòng ${user.tenant.room.roomNumber}` : "Chưa có phòng"}, ${user.tenant.contracts.length} hợp đồng` : null}
                      {user.role === "ADMIN" ? "Quản trị hệ thống" : null}
                    </td>
                    <td className="whitespace-nowrap py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a className={`rounded-lg border px-3 py-1.5 text-sm ${active ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`} href={href}>
      {children}
    </a>
  );
}
