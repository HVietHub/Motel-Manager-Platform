"use client";

import { useEffect, useState } from "react";
import { Activity, AlertCircle, Building2, DollarSign, RefreshCw, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminAnalytics {
  generatedAt: string;
  users: {
    totalUsers: number;
    totalLandlords: number;
    totalTenants: number;
    totalAdmins: number;
    activeUsers: number;
    newUsers7d: number;
    newUsers30d: number;
    signupGrowthRate: number;
    roleDistribution: { role: string; value: number }[];
    growth: { date: string; total: number; signups: number }[];
  };
  platform: {
    buildings: number;
    rooms: number;
    occupiedRooms: number;
    occupancyRate: number;
    contracts: number;
    activeContracts: number;
    maintenanceRequests: number;
    pendingMaintenance: number;
    unpaidInvoiceRatio: number;
    maintenancePendingRatio: number;
  };
  revenue: {
    totalRevenue: number;
    billedRevenue: number;
    unpaidRevenue: number;
    paidInvoices: number;
    unpaidInvoices: number;
    paidPlanLandlords: number;
    freePlanLandlords: number;
    trend: { period: string; revenue: number; billed: number }[];
  };
  conversion: {
    landlordsWithBuilding: number;
    landlordsWithRooms: number;
    tenantsWithRoom: number;
    tenantsWithActiveContract: number;
    landlordActivationRate: number;
    tenantConversionRate: number;
    retentionRate: number;
    activeUsers30d: number;
  };
  usage: {
    featureUsage: { feature: string; count: number }[];
    communityEvents: number;
    businessEvents: number;
  };
  recentEvents: {
    id: string;
    type: string;
    actor: string;
    entity: string;
    description: string;
    createdAt: string;
  }[];
  insights: { title: string; description: string; tone: "positive" | "warning" | "neutral" }[];
}

const roleColors = ["#0f172a", "#f59e0b", "#10b981"];

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function formatAdminValue(value: string) {
  const labels: Record<string, string> = {
    ADMIN: "Quản trị viên",
    LANDLORD: "Chủ nhà",
    TENANT: "Người thuê",
    PAID: "Đã thanh toán",
    UNPAID: "Chưa thanh toán",
    OVERDUE: "Quá hạn",
    ACTIVE: "Đang hoạt động",
    EXPIRED: "Đã hết hạn",
    TERMINATED: "Đã kết thúc",
    PENDING: "Đang chờ",
    IN_PROGRESS: "Đang xử lý",
    COMPLETED: "Hoàn tất",
    CANCELLED: "Đã hủy",
  };
  return labels[value] ?? value;
}

function formatAdminText(value: string) {
  return value
    .replace(/\bADMIN\b/g, "Quản trị viên")
    .replace(/\bLANDLORD\b/g, "Chủ nhà")
    .replace(/\bTENANT\b/g, "Người thuê")
    .replace(/\bPAID\b/g, "Đã thanh toán")
    .replace(/\bUNPAID\b/g, "Chưa thanh toán")
    .replace(/\bOVERDUE\b/g, "Quá hạn")
    .replace(/\bACTIVE\b/g, "Đang hoạt động")
    .replace(/\bPENDING\b/g, "Đang chờ")
    .replace(/\bCOMPLETED\b/g, "Hoàn tất");
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/analytics");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Không thể tải dữ liệu phân tích quản trị");
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu phân tích quản trị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-slate-700" />
          <p className="mt-4 text-sm text-slate-600">Đang tải bảng điều khiển quản trị và phân tích...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Lỗi tải dữ liệu
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAnalytics}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Bảng điều khiển quản trị và phân tích</h1>
          <p className="text-sm text-slate-600">Khu vực quản trị dành riêng để theo dõi hành vi người dùng, sức khỏe nền tảng, doanh thu, chuyển đổi và duy trì.</p>
        </div>
        <Badge variant="secondary" className="w-fit">Cập nhật lúc {formatDate(data.generatedAt)}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.totalUsers}</div>
            <p className="text-xs text-slate-500">+{data.users.newUsers30d} đăng ký / 30 ngày, tăng trưởng {formatPercent(data.users.signupGrowthRate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chủ nhà / Người thuê</CardTitle>
            <Building2 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.totalLandlords} / {data.users.totalTenants}</div>
            <p className="text-xs text-slate-500">{data.users.activeUsers} người dùng đang hợp lệ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu gói dịch vụ</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.revenue.totalRevenue)}</div>
            <p className="text-xs text-slate-500">{data.revenue.paidPlanLandlords} chủ nhà gói trả phí, {data.revenue.freePlanLandlords} gói miễn phí</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ duy trì 30 ngày</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(data.conversion.retentionRate)}</div>
            <p className="text-xs text-slate-500">{data.conversion.activeUsers30d} người dùng có hoạt động gần đây</p>
          </CardContent>
        </Card>
      </div>

      <div id="analytics" className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tăng trưởng người dùng theo thời gian</CardTitle>
            <CardDescription>Tổng số người dùng đã đăng ký và số đăng ký mới theo ngày.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.users.growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={2} name="Tổng người dùng" />
                <Line type="monotone" dataKey="signups" stroke="#f59e0b" strokeWidth={2} name="Đăng ký mới" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xu hướng doanh thu gói dịch vụ</CardTitle>
            <CardDescription>Ước tính doanh thu định kỳ hàng tháng từ các gói của chủ nhà.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}M`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="billed" stroke="#94a3b8" fill="#cbd5e1" name="Doanh thu hóa đơn phòng" />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#bbf7d0" name="Doanh thu gói hàng tháng" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mức sử dụng tính năng</CardTitle>
            <CardDescription>Tổng hợp mức sử dụng các tính năng nghiệp vụ và cộng đồng.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.usage.featureUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" name="Lượt sử dụng" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố vai trò</CardTitle>
            <CardDescription>Tỷ lệ tài khoản quản trị viên, chủ nhà và người thuê.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.users.roleDistribution} dataKey="value" nameKey="role" outerRadius={105} label>
                  {data.users.roleDistribution.map((entry, index) => (
                    <Cell key={entry.role} fill={roleColors[index % roleColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Chỉ số chuyển đổi</CardTitle>
            <CardDescription>Dữ liệu trực tiếp phản ánh mức độ sử dụng nền tảng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Metric label="Chủ nhà → Tòa nhà" value={formatPercent(data.conversion.landlordActivationRate)} detail={`${data.conversion.landlordsWithBuilding} chủ nhà đã tạo tòa nhà`} />
            <Metric label="Người thuê → Hợp đồng hoạt động" value={formatPercent(data.conversion.tenantConversionRate)} detail={`${data.conversion.tenantsWithActiveContract} người thuê có hợp đồng hoạt động`} />
            <Metric label="Tỷ lệ lấp đầy" value={formatPercent(data.platform.occupancyRate)} detail={`${data.platform.occupiedRooms}/${data.platform.rooms} phòng đang thuê`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sức khỏe nền tảng</CardTitle>
            <CardDescription>Các chỉ số rủi ro vận hành.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Metric label="Tỷ lệ hóa đơn chưa thanh toán" value={formatPercent(data.platform.unpaidInvoiceRatio)} detail={`${data.revenue.unpaidInvoices} hóa đơn chưa thanh toán`} />
            <Metric label="Bảo trì đang chờ" value={formatPercent(data.platform.maintenancePendingRatio)} detail={`${data.platform.pendingMaintenance} yêu cầu đang chờ`} />
            <Metric label="Hợp đồng hoạt động" value={`${data.platform.activeContracts}`} detail={`${data.platform.contracts} hợp đồng trong hệ thống`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nhận định</CardTitle>
            <CardDescription>Phân tích chuyên sâu ngoài danh sách quản lý cơ bản.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.insights.map((insight) => (
              <div key={insight.title} className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Badge variant={insight.tone === "warning" ? "destructive" : "secondary"}>{insight.tone === "positive" ? "Tích cực" : insight.tone === "warning" ? "Cảnh báo" : "Trung lập"}</Badge>
                  <p className="text-sm font-semibold">{insight.title}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{formatAdminText(insight.description)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card id="activity-log">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Nhật ký hoạt động
          </CardTitle>
          <CardDescription>Tổng hợp hành động người dùng, giao dịch và sự kiện nền tảng từ dữ liệu hệ thống.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-3 pr-4 font-medium">Thời gian</th>
                  <th className="py-3 pr-4 font-medium">Loại</th>
                  <th className="py-3 pr-4 font-medium">Người thực hiện</th>
                  <th className="py-3 pr-4 font-medium">Đối tượng</th>
                  <th className="py-3 font-medium">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEvents.map((event) => (
                  <tr key={event.id} className="border-b last:border-0">
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-600">{formatDate(event.createdAt)}</td>
                    <td className="py-3 pr-4"><Badge variant="outline">{formatAdminValue(event.type)}</Badge></td>
                    <td className="py-3 pr-4">{formatAdminValue(event.actor)}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatAdminValue(event.entity)}</td>
                    <td className="py-3 text-slate-700">{formatAdminText(event.description)}</td>
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

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-lg font-bold text-slate-950">{value}</p>
      </div>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
