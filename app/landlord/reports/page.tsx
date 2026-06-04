"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  Building2,
  Users,
  TrendingDown,
  Lock,
} from "lucide-react";
import { useLandlordId } from "@/hooks/auth/use-landlord-id";
import { PLAN_LIMITS, PlanTier } from "@/lib/constants/plans";
import type { AnalyticsOverview, TrendAnalysis } from "@/lib/types/analytics";

// ─── Types ────────────────────────────────────────────────────────────────────

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
    user: { name: string };
    room?: { roomNumber?: string } | null;
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
  type: "positive" | "negative" | "neutral" | "warning";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const monthFormatter = new Intl.DateTimeFormat("vi-VN", {
  month: "long",
  year: "numeric",
});

const fmt = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

function buildMonthlyRevenueReport(invoices: ReportInvoice[]): MonthlyRevenueReport[] {
  const map = new Map<number, { revenue: number; paid: number; unpaid: number }>();
  invoices.forEach((inv) => {
    const cur = map.get(inv.month) || { revenue: 0, paid: 0, unpaid: 0 };
    cur.revenue += inv.totalAmount;
    if (inv.status === "PAID") cur.paid += inv.totalAmount;
    else cur.unpaid += inv.totalAmount;
    map.set(inv.month, cur);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([month, t]) => ({
      month: monthFormatter.format(new Date(2024, month - 1, 1)),
      revenue: t.revenue,
      paid: t.paid,
      unpaid: t.unpaid,
      collectionRate: t.revenue > 0 ? (t.paid / t.revenue) * 100 : 0,
    }));
}

function buildDebtReport(invoices: ReportInvoice[]): DebtReportItem[] {
  const map = new Map<string, DebtReportItem>();
  invoices
    .filter((i) => i.status === "UNPAID")
    .forEach((inv) => {
      const ex = map.get(inv.tenantId);
      if (ex) {
        ex.amount += inv.totalAmount;
        ex.months += 1;
      } else {
        map.set(inv.tenantId, {
          tenantName: inv.tenant.user.name,
          roomNumber: inv.tenant.room?.roomNumber || "N/A",
          months: 1,
          amount: inv.totalAmount,
        });
      }
    });
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function buildBasicInsights(
  overview: AnalyticsOverview | null,
  monthlyRevenue: MonthlyRevenueReport[],
  debtReport: DebtReportItem[]
): ReportInsight[] {
  const insights: ReportInsight[] = [];
  const totalDebt = debtReport.reduce((s, d) => s + d.amount, 0);
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalPaid = monthlyRevenue.reduce((s, m) => s + m.paid, 0);
  const collectionRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;

  if (overview) {
    const occ =
      overview.totalRooms > 0
        ? (overview.occupiedRooms / overview.totalRooms) * 100
        : 0;
    insights.push(
      occ >= 85
        ? {
            id: "occ-good",
            type: "positive",
            title: "Tỷ lệ lấp đầy tốt",
            description: `${overview.occupiedRooms}/${overview.totalRooms} phòng đang khai thác (${occ.toFixed(1)}%).`,
            impact: "high",
          }
        : {
            id: "occ-warn",
            type: "warning",
            title: "Còn dư địa tăng lấp đầy",
            description: `Tỷ lệ lấp đầy ${occ.toFixed(1)}% — nên tối ưu giá hoặc marketing cho phòng trống.`,
            impact: "medium",
          }
    );
  }

  if (monthlyRevenue.length > 0) {
    const best = monthlyRevenue.reduce((b, c) => (c.revenue > b.revenue ? c : b));
    insights.push({
      id: "best-month",
      type: "neutral",
      title: "Tháng doanh thu cao nhất",
      description: `${best.month} đạt ${fmt(best.revenue)} với tỷ lệ thu ${best.collectionRate.toFixed(1)}%.`,
      impact: "medium",
    });
  }

  if (totalRevenue > 0) {
    insights.push({
      id: "collection",
      type: collectionRate >= 90 ? "positive" : collectionRate >= 75 ? "warning" : "negative",
      title: "Hiệu quả thu tiền",
      description: `Đã thu ${fmt(totalPaid)} / ${fmt(totalRevenue)} (${collectionRate.toFixed(1)}%).`,
      impact: collectionRate >= 90 ? "medium" : "high",
    });
  }

  if (totalDebt > 0) {
    insights.push({
      id: "debt",
      type: totalDebt > 10_000_000 ? "negative" : "warning",
      title: "Công nợ cần theo dõi",
      description: `${debtReport.length} người thuê còn nợ tổng ${fmt(totalDebt)}.`,
      impact: totalDebt > 10_000_000 ? "high" : "medium",
    });
  }

  return insights;
}

// ─── Insight card ─────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: ReportInsight }) {
  const colors = {
    positive: "bg-green-50 border-green-500",
    negative: "bg-red-50 border-red-500",
    warning: "bg-yellow-50 border-yellow-500",
    neutral: "bg-blue-50 border-blue-500",
  };
  return (
    <div className={`p-4 rounded-lg border-l-4 ${colors[insight.type]}`}>
      <h4 className="font-medium text-sm">{insight.title}</h4>
      <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
      <span className="text-xs text-gray-500 mt-1 inline-block">
        Mức độ: {insight.impact}
      </span>
    </div>
  );
}

// ─── Plan gate banner ─────────────────────────────────────────────────────────

function PlanGateBanner({
  requiredPlan,
  currentPlan,
  featureName,
}: {
  requiredPlan: PlanTier;
  currentPlan: PlanTier;
  featureName: string;
}) {
  return (
    <Card className="border-dashed border-2 border-amber-200 bg-amber-50/30">
      <CardContent className="py-10 flex flex-col items-center text-center gap-3">
        <div className="h-11 w-11 rounded-xl border border-amber-200 flex items-center justify-center">
          <Lock className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">
            {featureName} yêu cầu gói {requiredPlan} trở lên
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Gói hiện tại của bạn là <strong>{currentPlan}</strong>. Nâng cấp để mở khóa tính năng này.
          </p>
        </div>
        <a
          href="/landlord/payment"
          className="text-sm text-amber-600 underline underline-offset-2 hover:text-amber-700"
        >
          Xem các gói dịch vụ →
        </a>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const landlordId = useLandlordId();
  const { data: session } = useSession();

  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueReport[]>([]);
  const [debtReport, setDebtReport] = useState<DebtReportItem[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Plan state — fetched from landlord API
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(PlanTier.FREE);
  const [planLoaded, setPlanLoaded] = useState(false);

  // Plan feature flags
  const hasReports = PLAN_LIMITS[currentPlan].features.reports;
  const hasAdvancedAnalytics = PLAN_LIMITS[currentPlan].features.advancedAnalytics;

  const basicInsights = buildBasicInsights(overview, monthlyRevenue, debtReport);
  const totalDebt = debtReport.reduce((s, d) => s + d.amount, 0);

  // Fetch plan
  useEffect(() => {
    const lid = session?.user?.landlordId;
    if (!lid) return;
    fetch(`/api/landlords/${lid}`)
      .then((r) => r.json())
      .then((data) => {
        setCurrentPlan((data.plan as PlanTier) ?? PlanTier.FREE);
        setPlanLoaded(true);
      })
      .catch(() => setPlanLoaded(true));
  }, [session?.user?.landlordId]);

  // Fetch data
  useEffect(() => {
    if (!landlordId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const year = `?year=${selectedYear}`;
        const [overviewRes, trendsRes, invoicesRes] = await Promise.all([
          fetch(`/api/analytics/overview${year}`),
          fetch(`/api/analytics/trends${year}`),
          fetch(`/api/invoices?landlordId=${landlordId}`),
        ]);

        setOverview(overviewRes.ok ? await overviewRes.json() : null);

        if (trendsRes.ok) {
          setTrends(await trendsRes.json());
        } else {
          setTrends(null);
        }

        if (invoicesRes.ok) {
          const all: ReportInvoice[] = await invoicesRes.json();
          const filtered = all.filter((i) => i.year === Number(selectedYear));
          setMonthlyRevenue(buildMonthlyRevenueReport(filtered));
          setDebtReport(buildDebtReport(filtered));
        } else {
          setMonthlyRevenue([]);
          setDebtReport([]);
        }
      } catch {
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

  if (isLoading || !planLoaded) {
    return (
      <div className="p-8 flex items-center gap-2 text-muted-foreground text-sm">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo Cáo & Phân Tích</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Doanh thu, công nợ và phân tích AI theo năm
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Chọn năm" />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2].map((offset) => (
              <SelectItem key={offset} value={(currentYear - offset).toString()}>
                Năm {currentYear - offset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Two top-level tabs ── */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          {/* Tab 1: Báo Cáo — Free+ */}
          <TabsTrigger value="reports">Báo Cáo</TabsTrigger>
          {/* Tab 2: Phân Tích AI — Pro+ */}
          <TabsTrigger value="ai" className="flex items-center gap-1.5">
            Phân Tích AI
            {!hasAdvancedAnalytics && (
              <Lock className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
            )}
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════
            TAB 1 — BÁO CÁO (Free: overview only; Starter+: full)
        ══════════════════════════════════════════════ */}
        <TabsContent value="reports" className="space-y-6">

          {/* ── Overview — available to all plans ── */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Tổng Quan
            </h2>
            {overview ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {overview.totalRooms > 0
                        ? ((overview.occupiedRooms / overview.totalRooms) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {overview.occupiedRooms}/{overview.totalRooms} phòng
                    </p>
                    <div className="flex items-center mt-1 gap-1">
                      {overview.occupancyTrend === "increasing" ? (
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" strokeWidth={1.5} />
                      ) : overview.occupancyTrend === "decreasing" ? (
                        <TrendingDown className="h-3.5 w-3.5 text-red-600" strokeWidth={1.5} />
                      ) : null}
                      <span className="text-xs text-muted-foreground capitalize">
                        {overview.occupancyTrend}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{fmt(overview.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {overview.revenueGrowth > 0 ? "+" : ""}
                      {overview.revenueGrowth.toFixed(1)}% so với kỳ trước
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Giá phòng TB</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{fmt(overview.averageRoomPrice)}</p>
                    <p className="text-xs text-muted-foreground">Trung bình / tháng</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Tổng phòng</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{overview.totalRooms}</p>
                    <p className="text-xs text-muted-foreground">
                      Đang thuê: {overview.occupiedRooms}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  Chưa có dữ liệu tổng quan
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Doanh Thu & Công Nợ — Starter+ ── */}
          {!hasReports ? (
            <PlanGateBanner
              requiredPlan={PlanTier.STARTER}
              currentPlan={currentPlan}
              featureName="Báo cáo doanh thu & công nợ"
            />
          ) : (
            <>
              {/* Doanh Thu */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Doanh Thu Theo Tháng
                </h2>
                <Card>
                  <CardContent className="pt-5 space-y-3">
                    {monthlyRevenue.length === 0 ? (
                      <p className="text-center py-6 text-muted-foreground text-sm">
                        Chưa có dữ liệu doanh thu cho năm {selectedYear}
                      </p>
                    ) : (
                      monthlyRevenue.map((data, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{data.month}</span>
                            <span className="font-bold text-green-600 text-sm">
                              {fmt(data.revenue)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                            <div>
                              <p className="text-muted-foreground">Đã thu</p>
                              <p className="font-semibold text-green-600">{fmt(data.paid)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Chưa thu</p>
                              <p className="font-semibold text-orange-600">{fmt(data.unpaid)}</p>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${data.collectionRate}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Tỷ lệ thu: {data.collectionRate.toFixed(1)}%
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Công Nợ */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Công Nợ
                </h2>
                <Card>
                  <CardContent className="pt-5 space-y-3">
                    {debtReport.length === 0 ? (
                      <p className="text-center py-6 text-muted-foreground text-sm">
                        Không có công nợ trong năm {selectedYear}
                      </p>
                    ) : (
                      <>
                        {debtReport.map((debt, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between border rounded-lg p-3"
                          >
                            <div>
                              <p className="font-medium text-sm">{debt.tenantName}</p>
                              <p className="text-xs text-muted-foreground">
                                Phòng {debt.roomNumber} · {debt.months} tháng
                              </p>
                            </div>
                            <p className="font-semibold text-red-600 text-sm">
                              {fmt(debt.amount)}
                            </p>
                          </div>
                        ))}
                        <div className="flex items-center justify-between border-t pt-3 mt-1">
                          <span className="font-semibold text-sm">Tổng công nợ</span>
                          <span className="font-bold text-red-600">{fmt(totalDebt)}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Basic Insights */}
              {basicInsights.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Nhận Xét
                  </h2>
                  <div className="space-y-3">
                    {basicInsights.map((ins) => (
                      <InsightCard key={ins.id} insight={ins} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ══════════════════════════════════════════════
            TAB 2 — PHÂN TÍCH AI (Pro+)
        ══════════════════════════════════════════════ */}
        <TabsContent value="ai" className="space-y-6">
          {!hasAdvancedAnalytics ? (
            <PlanGateBanner
              requiredPlan={PlanTier.PRO}
              currentPlan={currentPlan}
              featureName="Phân tích AI nâng cao"
            />
          ) : (
            <>
              {/* Seasonal patterns */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Xu Hướng Theo Mùa
                </h2>
                <Card>
                  <CardContent className="pt-5">
                    {trends && trends.seasonalPatterns.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trends.seasonalPatterns.map((p, i) => (
                          <div key={i} className="border rounded-lg p-4">
                            <p className="font-semibold capitalize text-sm mb-2">{p.season}</p>
                            <p className="text-xs text-muted-foreground">
                              Lấp đầy TB: {p.averageOccupancy.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Doanh thu TB: {fmt(p.averageRevenue)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-muted-foreground text-sm">
                        Chưa đủ dữ liệu để phân tích xu hướng theo mùa
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Phân Tích Chi Tiết
                </h2>
                {trends && trends.insights.length > 0 ? (
                  <div className="space-y-3">
                    {trends.insights.map((ins) => (
                      <InsightCard key={ins.id} insight={ins} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground text-sm">
                      Chưa đủ dữ liệu để tạo phân tích AI
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
