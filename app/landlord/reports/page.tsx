"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, DollarSign, AlertCircle, Building2, Users, TrendingDown } from "lucide-react";
import { useLandlordId } from "@/hooks/use-landlord-id";
import type { AnalyticsOverview, TrendAnalysis } from '@/lib/types/analytics';

type ReportInvoice = {
  id: string;
  tenantId: string;
  month: number;
  year: number;
  totalAmount: number;
  status: string;
  dueDate?: string | null;
  paidDate?: string | null;
  tenant: {
    user: {
      name: string;
    };
    room?: {
      roomNumber?: string;
    } | null;
  };
};

type MonthlyRevenueReport = {
  month: string;
  revenue: number;
  paid: number;
  unpaid: number;
  collectionRate: number;
};

type DebtReportItem = {
  tenantName: string;
  roomNumber: string;
  months: number;
  amount: number;
};

type ReportInsight = {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
};

const monthFormatter = new Intl.DateTimeFormat("vi-VN", {
  month: "long",
  year: "numeric",
});

function buildMonthlyRevenueReport(invoices: ReportInvoice[]): MonthlyRevenueReport[] {
  const revenueMap = new Map<number, { revenue: number; paid: number; unpaid: number }>();

  invoices.forEach((invoice) => {
    const current = revenueMap.get(invoice.month) || { revenue: 0, paid: 0, unpaid: 0 };
    current.revenue += invoice.totalAmount;
    if (invoice.status === "PAID") {
      current.paid += invoice.totalAmount;
    } else {
      current.unpaid += invoice.totalAmount;
    }
    revenueMap.set(invoice.month, current);
  });

  return Array.from(revenueMap.entries())
    .sort(([monthA], [monthB]) => monthA - monthB)
    .map(([month, totals]) => ({
      month: monthFormatter.format(new Date(2024, month - 1, 1)),
      revenue: totals.revenue,
      paid: totals.paid,
      unpaid: totals.unpaid,
      collectionRate: totals.revenue > 0 ? (totals.paid / totals.revenue) * 100 : 0,
    }));
}

function buildDebtReport(invoices: ReportInvoice[]): DebtReportItem[] {
  const unpaidInvoices = invoices.filter((invoice) => invoice.status === "UNPAID");
  const debtMap = new Map<string, DebtReportItem>();

  unpaidInvoices.forEach((invoice) => {
    const tenantKey = invoice.tenantId;
    const existing = debtMap.get(tenantKey);

    if (existing) {
      existing.amount += invoice.totalAmount;
      existing.months += 1;
      return;
    }

    debtMap.set(tenantKey, {
      tenantName: invoice.tenant.user.name,
      roomNumber: invoice.tenant.room?.roomNumber || "N/A",
      months: 1,
      amount: invoice.totalAmount,
    });
  });

  return Array.from(debtMap.values()).sort((a, b) => b.amount - a.amount);
}

function buildFallbackInsights(
  overview: AnalyticsOverview | null,
  monthlyRevenue: MonthlyRevenueReport[],
  debtReport: DebtReportItem[]
): ReportInsight[] {
  const insights: ReportInsight[] = [];
  const totalDebt = debtReport.reduce((sum, debt) => sum + debt.amount, 0);
  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const totalPaid = monthlyRevenue.reduce((sum, item) => sum + item.paid, 0);
  const collectionRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;

  if (overview) {
    const occupancyRate = overview.totalRooms > 0
      ? (overview.occupiedRooms / overview.totalRooms) * 100
      : 0;

    if (occupancyRate >= 85) {
      insights.push({
        id: "occupancy-strong",
        type: "positive",
        title: "Tỷ lệ lấp đầy đang ở mức tốt",
        description: `Hiện có ${overview.occupiedRooms}/${overview.totalRooms} phòng đang khai thác, tương đương ${occupancyRate.toFixed(1)}%.`,
        impact: "high",
      });
    } else if (overview.totalRooms > 0) {
      insights.push({
        id: "occupancy-warning",
        type: "warning",
        title: "Còn dư địa tăng lấp đầy",
        description: `Tỷ lệ lấp đầy đang ở mức ${occupancyRate.toFixed(1)}%, nên ưu tiên marketing hoặc tối ưu giá cho phòng trống.`,
        impact: "medium",
      });
    }
  }

  if (monthlyRevenue.length > 0) {
    const bestMonth = monthlyRevenue.reduce((best, current) =>
      current.revenue > best.revenue ? current : best
    );
    insights.push({
      id: "best-revenue-month",
      type: "neutral",
      title: "Tháng có doanh thu cao nhất đã được xác định",
      description: `${bestMonth.month} đạt ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(bestMonth.revenue)} với tỷ lệ thu ${bestMonth.collectionRate.toFixed(1)}%.`,
      impact: "medium",
    });
  }

  if (totalRevenue > 0) {
    insights.push({
      id: "collection-rate",
      type: collectionRate >= 90 ? "positive" : collectionRate >= 75 ? "warning" : "negative",
      title: "Hiệu quả thu tiền",
      description: `Đã thu ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPaid)} trên tổng ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalRevenue)}, tương đương ${collectionRate.toFixed(1)}%.`,
      impact: collectionRate >= 90 ? "medium" : "high",
    });
  }

  if (totalDebt > 0) {
    insights.push({
      id: "debt-alert",
      type: totalDebt > 10000000 ? "negative" : "warning",
      title: "Công nợ cần theo dõi",
      description: `Có ${debtReport.length} người thuê còn nợ tổng cộng ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalDebt)}.`,
      impact: totalDebt > 10000000 ? "high" : "medium",
    });
  }

  return insights;
}

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const landlordId = useLandlordId();
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueReport[]>([]);
  const [debtReport, setDebtReport] = useState<DebtReportItem[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fallbackInsights = buildFallbackInsights(overview, monthlyRevenue, debtReport);
  const totalDebt = debtReport.reduce((sum, debt) => sum + debt.amount, 0);
  const bestRevenueMonth = monthlyRevenue.length > 0
    ? monthlyRevenue.reduce((best, current) => current.revenue > best.revenue ? current : best)
    : null;
  const averageCollectionRate = monthlyRevenue.length > 0
    ? monthlyRevenue.reduce((sum, month) => sum + month.collectionRate, 0) / monthlyRevenue.length
    : 0;

  useEffect(() => {
    if (!landlordId) {
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch analytics data with year filter
        const yearParam = `?year=${selectedYear}`;
        const [overviewRes, trendsRes, invoicesRes] = await Promise.all([
          fetch(`/api/analytics/overview${yearParam}`),
          fetch(`/api/analytics/trends${yearParam}`),
          fetch(`/api/invoices?landlordId=${landlordId}`),
        ]);

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setOverview(overviewData);
        } else {
          setOverview(null);
        }

        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          setTrends(trendsData);
        } else {
          setTrends(null);
        }

        if (invoicesRes.ok) {
          const invoicesData: ReportInvoice[] = await invoicesRes.json();
          const filteredInvoices = invoicesData.filter(
            (invoice) => invoice.year === Number(selectedYear)
          );

          setMonthlyRevenue(buildMonthlyRevenueReport(filteredInvoices));
          setDebtReport(buildDebtReport(filteredInvoices));
        } else {
          setMonthlyRevenue([]);
          setDebtReport([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setOverview(null);
        setTrends(null);
        setMonthlyRevenue([]);
        setDebtReport([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [landlordId, selectedYear]);

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
          <h1 className="text-3xl font-bold">Báo Cáo & Phân Tích</h1>
          <p className="text-muted-foreground mt-1">
            Xem báo cáo doanh thu, thống kê và phân tích AI
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn năm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={currentYear.toString()}>Năm {currentYear}</SelectItem>
            <SelectItem value={(currentYear - 1).toString()}>Năm {currentYear - 1}</SelectItem>
            <SelectItem value={(currentYear - 2).toString()}>Năm {currentYear - 2}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
          <TabsTrigger value="revenue">Doanh Thu</TabsTrigger>
          <TabsTrigger value="debt">Công Nợ</TabsTrigger>
          <TabsTrigger value="analytics">Phân Tích AI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overview.totalRooms > 0 
                      ? ((overview.occupiedRooms / overview.totalRooms) * 100).toFixed(1)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {overview.occupiedRooms}/{overview.totalRooms} phòng
                  </p>
                  <div className="flex items-center mt-2">
                    {overview.occupancyTrend === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : overview.occupancyTrend === 'decreasing' ? (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    ) : null}
                    <span className="text-xs capitalize">{overview.occupancyTrend}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(overview.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tăng trưởng: {overview.revenueGrowth > 0 ? '+' : ''}
                    {overview.revenueGrowth.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Giá phòng TB</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(overview.averageRoomPrice)}
                  </div>
                  <p className="text-xs text-muted-foreground">Trung bình/tháng</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng phòng</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.totalRooms}</div>
                  <p className="text-xs text-muted-foreground">
                    Đang thuê: {overview.occupiedRooms}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Room Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Thống Kê Phòng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Tổng Phòng</p>
                      <p className="text-3xl font-bold">{overview.totalRooms}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Đã Thuê</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {overview.occupiedRooms}
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Trống</p>
                      <p className="text-3xl font-bold text-green-600">
                        {overview.totalRooms - overview.occupiedRooms}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Tỷ Lệ Lấp Đầy</span>
                      <span className="text-sm font-bold">
                        {overview.totalRooms > 0 
                          ? ((overview.occupiedRooms / overview.totalRooms) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ 
                          width: `${overview.totalRooms > 0 
                            ? (overview.occupiedRooms / overview.totalRooms) * 100
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Doanh Thu Trung Bình/Phòng
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(overview.averageRoomPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Tổng Doanh Thu
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(overview.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có dữ liệu phòng
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
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
                    Chưa có dữ liệu doanh thu cho năm {selectedYear}
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
                              width: `${data.collectionRate}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tỷ lệ thu: {data.collectionRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debt" className="space-y-6">
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
                    Không có công nợ trong năm {selectedYear}
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
                          {formatCurrency(totalDebt)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* AI Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng theo mùa</CardTitle>
            </CardHeader>
            <CardContent>
              {trends && trends.seasonalPatterns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trends.seasonalPatterns.map((pattern, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold capitalize mb-2">{pattern.season}</h3>
                      <p className="text-sm text-gray-600">
                        Tỷ lệ lấp đầy TB: {pattern.averageOccupancy.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Doanh thu TB: {formatCurrency(pattern.averageRevenue)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Tháng doanh thu cao nhất</p>
                    <p className="font-semibold">
                      {bestRevenueMonth ? bestRevenueMonth.month : `Năm ${selectedYear}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {bestRevenueMonth
                        ? formatCurrency(bestRevenueMonth.revenue)
                        : "Chưa có dữ liệu doanh thu"}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Tỷ lệ thu tiền trung bình</p>
                    <p className="font-semibold">{averageCollectionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Dựa trên các hóa đơn của năm {selectedYear}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Tổng công nợ hiện tại</p>
                    <p className="font-semibold text-red-600">{formatCurrency(totalDebt)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {debtReport.length} người thuê còn công nợ
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân tích chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              {trends && trends.insights.length > 0 ? (
                <div className="space-y-3">
                  {trends.insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'positive'
                          ? 'bg-green-50 border-green-500'
                          : insight.type === 'negative'
                          ? 'bg-red-50 border-red-500'
                          : insight.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                      <span className="text-xs text-gray-500 mt-2 inline-block">
                        Mức độ ảnh hưởng: {insight.impact}
                      </span>
                    </div>
                  ))}
                </div>
              ) : fallbackInsights.length > 0 ? (
                <div className="space-y-3">
                  {fallbackInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'positive'
                          ? 'bg-green-50 border-green-500'
                          : insight.type === 'negative'
                          ? 'bg-red-50 border-red-500'
                          : insight.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                      <span className="text-xs text-gray-500 mt-2 inline-block">
                        Mức độ ảnh hưởng: {insight.impact}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">Chưa có phân tích nào</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
