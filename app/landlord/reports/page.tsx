"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, DollarSign, AlertCircle, Building2 } from "lucide-react";

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [debtReport, setDebtReport] = useState<any[]>([]);
  const [roomStats, setRoomStats] = useState({
    totalRooms: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    occupancyRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch reports from API
    setIsLoading(false);
  }, [selectedYear]);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo Cáo & Thống Kê</h1>
          <p className="text-muted-foreground mt-1">
            Xem báo cáo doanh thu và thống kê hoạt động
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn năm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">Năm 2024</SelectItem>
            <SelectItem value="2023">Năm 2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Báo Cáo Doanh Thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyRevenue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có dữ liệu doanh thu
              </div>
            ) : (
              monthlyRevenue.map((data, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{data.month}</h3>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(data.revenue)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Đã Thu</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(data.paid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Chưa Thu</p>
                      <p className="font-semibold text-orange-600">
                        {formatCurrency(data.unpaid)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(data.paid / data.revenue) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tỷ lệ thu: {((data.paid / data.revenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debt Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Báo Cáo Công Nợ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debtReport.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có công nợ
              </div>
            ) : (
              <>
                {debtReport.map((debt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border rounded-lg p-4"
                  >
                    <div>
                      <p className="font-medium">{debt.tenantName}</p>
                      <p className="text-sm text-muted-foreground">
                        Phòng {debt.roomNumber} • {debt.months} tháng
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {formatCurrency(debt.amount)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Tổng Công Nợ</span>
                    <span className="text-xl font-bold text-red-600">
                      {formatCurrency(
                        debtReport.reduce((sum, debt) => sum + debt.amount, 0)
                      )}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Room Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Thống Kê Phòng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roomStats.totalRooms === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có dữ liệu phòng
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Tổng Phòng</p>
                    <p className="text-3xl font-bold">{roomStats.totalRooms}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Đã Thuê</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {roomStats.occupied}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Trống</p>
                    <p className="text-3xl font-bold text-green-600">
                      {roomStats.available}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tỷ Lệ Lấp Đầy</span>
                    <span className="text-sm font-bold">{roomStats.occupancyRate}%</span>
                  </div>
                  <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${roomStats.occupancyRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Doanh Thu Trung Bình/Phòng
                    </p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(2600000)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Tổng Doanh Thu Tháng
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(125000000)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
