"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DoorOpen, Receipt, Bell, FileText } from "lucide-react";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/use-tenant-id";

type DashboardStats = {
  room: {
    roomNumber: string;
    buildingName: string;
    price: number;
  } | null;
  unpaidInvoicesCount: number;
  unreadNotificationsCount: number;
  hasNewInvitation: boolean;
  activeContract: {
    startDate: string;
    endDate: string;
    rentAmount: number;
  } | null;
};

export default function TenantDashboardPage() {
  const tenantId = useTenantId();
  const [stats, setStats] = useState<DashboardStats>({
    room: null,
    unpaidInvoicesCount: 0,
    unreadNotificationsCount: 0,
    hasNewInvitation: false,
    activeContract: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetchDashboardStats();
    }
  }, [tenantId]);

  const fetchDashboardStats = async () => {
    if (!tenantId) return;

    try {
      // Fetch tenant info with room
      const tenantResponse = await fetch(`/api/tenants/${tenantId}`);
      if (tenantResponse.ok) {
        const tenantData = await tenantResponse.json();
        if (tenantData.room) {
          setStats((prev) => ({
            ...prev,
            room: {
              roomNumber: tenantData.room.roomNumber,
              buildingName: tenantData.room.building.name,
              price: tenantData.room.price,
            },
          }));
        }
      }

      // Fetch unpaid invoices count
      const invoicesResponse = await fetch(`/api/invoices?tenantId=${tenantId}&status=UNPAID`);
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setStats((prev) => ({
          ...prev,
          unpaidInvoicesCount: invoicesData.length,
        }));
      }

      // Fetch unread notifications count
      const notificationsResponse = await fetch(`/api/notifications?tenantId=${tenantId}`);
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        const unreadCount = notificationsData.filter((n: any) => !n.isRead).length;
        const hasInvitation = notificationsData.some((n: any) => 
          !n.isRead && n.title.includes("Lời mời")
        );
        setStats((prev) => ({
          ...prev,
          unreadNotificationsCount: unreadCount,
          hasNewInvitation: hasInvitation,
        }));
      }

      // Fetch active contract
      const contractsResponse = await fetch(`/api/contracts?tenantId=${tenantId}&status=ACTIVE`);
      if (contractsResponse.ok) {
        const contractsData = await contractsResponse.json();
        if (contractsData.length > 0) {
          const contract = contractsData[0];
          setStats((prev) => ({
            ...prev,
            activeContract: {
              startDate: contract.startDate,
              endDate: contract.endDate,
              rentAmount: contract.rentAmount,
            },
          }));
        }
      }
    } catch (error) {
      console.error("Fetch dashboard stats error:", error);
      toast.error("Không thể tải thông tin dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Trang Chủ
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Chào mừng bạn đến với HouseSea
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Hôm nay</p>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Room Info */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng Của Tôi</CardTitle>
            <DoorOpen className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            {stats.room ? (
              <>
                <div className="text-3xl font-bold">{stats.room.roomNumber}</div>
                <p className="text-xs opacity-80 mt-1">
                  {stats.room.buildingName}
                </p>
                <p className="text-sm font-medium mt-2 bg-white/20 inline-block px-2 py-1 rounded">
                  {formatCurrency(stats.room.price)}/tháng
                </p>
              </>
            ) : (
              <div className="text-sm opacity-80">
                Chưa có phòng
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unpaid Invoices */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hóa Đơn</CardTitle>
            <Receipt className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.unpaidInvoicesCount}</div>
            <p className="text-xs opacity-80 mt-1">
              {stats.unpaidInvoicesCount > 0 ? "Cần thanh toán" : "Đã thanh toán hết"}
            </p>
          </CardContent>
        </Card>

        {/* Unread Notifications */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thông Báo</CardTitle>
            <Bell className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.unreadNotificationsCount}</div>
            <p className="text-xs opacity-80 mt-1">
              {stats.unreadNotificationsCount > 0 ? "Chưa đọc" : "Đã đọc hết"}
            </p>
            {stats.hasNewInvitation && (
              <Badge className="mt-2 bg-white/20 text-white border-white/30">
                🎉 Có lời mời mới!
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Active Contract */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hợp Đồng</CardTitle>
            <FileText className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            {stats.activeContract ? (
              <>
                <div className="text-2xl font-bold">
                  Đang Hiệu Lực
                </div>
                <p className="text-xs opacity-80 mt-1">
                  Đến {new Date(stats.activeContract.endDate).toLocaleDateString("vi-VN")}
                </p>
              </>
            ) : (
              <div className="text-sm opacity-80">
                Chưa có hợp đồng
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract Details */}
      {stats.activeContract && (
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Thông Tin Hợp Đồng
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Ngày Bắt Đầu</p>
                <p className="text-xl font-bold text-blue-700">
                  {new Date(stats.activeContract.startDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Ngày Kết Thúc</p>
                <p className="text-xl font-bold text-purple-700">
                  {new Date(stats.activeContract.endDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Tiền Thuê Hàng Tháng</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(stats.activeContract.rentAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {stats.hasNewInvitation && (
        <Card className="border-none shadow-lg border-l-4 border-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">🎉 Bạn có lời mời mới từ chủ nhà!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Chủ nhà đã mời bạn vào hệ thống quản lý. Hãy kiểm tra thông báo để xem chi tiết.
                </p>
                <Button onClick={() => window.location.href = '/tenant/notifications'}>
                  Xem Thông Báo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {stats.unpaidInvoicesCount > 0 && (
        <Card className="border-none shadow-lg border-l-4 border-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Receipt className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Bạn có {stats.unpaidInvoicesCount} hóa đơn chưa thanh toán</h3>
                <p className="text-sm text-muted-foreground">
                  Vui lòng thanh toán hóa đơn để tránh bị gián đoạn dịch vụ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
