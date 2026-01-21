"use client";

import { useEffect, useState } from "react";
import { useLandlordId } from "@/hooks/use-landlord-id";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DoorOpen, Users, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const landlordId = useLandlordId();
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    unpaidInvoices: 0,
    totalDebt: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!landlordId) {
          console.error("No landlordId found in session");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `/api/dashboard/stats?landlordId=${landlordId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Không thể tải thống kê");
      } finally {
        setIsLoading(false);
      }
    };

    if (landlordId) {
      fetchStats();
    }
  }, [landlordId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Tổng quan hoạt động quản lý nhà trọ của bạn
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Cập nhật lúc</p>
          <p className="text-lg font-semibold">{new Date().toLocaleTimeString('vi-VN')}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Buildings */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Tòa Nhà
            </CardTitle>
            <Building2 className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalBuildings}</div>
            <p className="text-xs opacity-80 mt-1">Đang quản lý</p>
          </CardContent>
        </Card>

        {/* Total Rooms */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Phòng
            </CardTitle>
            <DoorOpen className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs opacity-80 mt-1">
              {stats.availableRooms} trống • {stats.occupiedRooms} đã thuê
            </p>
          </CardContent>
        </Card>

        {/* Total Tenants */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Người Thuê
            </CardTitle>
            <Users className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalTenants}</div>
            <p className="text-xs opacity-80 mt-1">Đang sinh sống</p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh Thu Tháng
            </CardTitle>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs opacity-80 mt-1">Tháng này</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Debt Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Doanh Thu & Thu Nhập
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <span className="text-sm text-muted-foreground">Doanh thu tháng này</span>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-white">
              <span className="text-sm font-medium">Đã thu</span>
              <span className="text-lg font-semibold text-green-700">
                {formatCurrency(stats.monthlyRevenue - stats.totalDebt)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-orange-500 bg-white">
              <span className="text-sm font-medium">Chưa thu</span>
              <span className="text-lg font-semibold text-orange-600">
                {formatCurrency(stats.totalDebt)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Debt Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Công Nợ & Thanh Toán
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <span className="text-sm text-muted-foreground">Tổng công nợ</span>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(stats.totalDebt)}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-red-500 bg-white">
              <span className="text-sm font-medium">Hóa đơn chưa thanh toán</span>
              <span className="text-lg font-semibold text-red-600">
                {stats.unpaidInvoices} hóa đơn
              </span>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-orange-700 font-medium">⚠️ Cần theo dõi</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Liên hệ người thuê để thu hồi công nợ
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Status */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-blue-600" />
            Tình Trạng Phòng
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-green-500 shadow-lg shadow-green-200" />
                <span className="font-medium">Phòng trống</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-green-600">{stats.availableRooms}</span>
                <span className="text-sm text-muted-foreground bg-green-50 px-3 py-1 rounded-full">
                  {stats.totalRooms > 0 ? ((stats.availableRooms / stats.totalRooms) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-blue-500 shadow-lg shadow-blue-200" />
                <span className="font-medium">Đã cho thuê</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-blue-600">{stats.occupiedRooms}</span>
                <span className="text-sm text-muted-foreground bg-blue-50 px-3 py-1 rounded-full">
                  {stats.totalRooms > 0 ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Tỷ lệ lấp đầy</span>
                <span className="text-sm font-bold text-blue-600">
                  {stats.totalRooms > 0 ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 shadow-lg"
                  style={{
                    width: `${stats.totalRooms > 0 ? (stats.occupiedRooms / stats.totalRooms) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
