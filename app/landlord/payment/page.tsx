"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Check,
  Minus,
  Clock,
  CreditCard,
  Building2,
  Users,
  LayoutGrid,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PLAN_LIMITS, PlanTier } from "@/lib/constants/plans";

// ─── helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  amount === 0 ? "Miễn phí" : `${amount.toLocaleString("vi-VN")}đ / tháng`;

const PLAN_META: Record<PlanTier, { label: string; highlight: boolean }> = {
  FREE:    { label: "Free",    highlight: false },
  STARTER: { label: "Starter", highlight: false },
  PRO:     { label: "Pro",     highlight: true  },
};

const FEATURE_LABELS: Record<keyof typeof PLAN_LIMITS.FREE.features, string> = {
  autoInvoice:        "Tự động tạo hóa đơn",
  emailNotifications: "Thông báo email tự động",
  reports:            "Báo cáo doanh thu",
  communityPosts:     "Cộng đồng người thuê",
  apiAccess:          "Tích hợp API",
  webhooks:           "Webhook sự kiện",
  exportData:         "Export Excel / CSV",
  advancedAnalytics:  "Analytics nâng cao",
  aiChatbot:          "AI Chatbot thông minh",
  aiPredictions:      "AI dự đoán & gợi ý giá",
  multiUser:          "Multi-user & phân quyền",
  whiteLabel:         "White-label thương hiệu",
};

// ─── component ───────────────────────────────────────────────────────────────

export default function LandlordPaymentPage() {
  const { data: session } = useSession();
  const [currentPlan, setCurrentPlan] = useState<PlanTier | null>(null);
  const [stats, setStats] = useState<{ totalBuildings: number; totalRooms: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const landlordId = session?.user?.landlordId;
    if (!landlordId) return;

    fetch(`/api/landlords/${landlordId}`)
      .then((r) => r.json())
      .then((data) => {
        setCurrentPlan((data.plan as PlanTier) ?? PlanTier.FREE);
        setStats({
          totalBuildings: data.stats?.totalBuildings ?? 0,
          totalRooms: data.stats?.totalRooms ?? 0,
        });
      })
      .catch(() => setCurrentPlan(PlanTier.FREE))
      .finally(() => setLoading(false));
  }, [session?.user?.landlordId]);

  const plans = Object.values(PlanTier);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
          Nâng Cấp Gói Dịch Vụ
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Chọn gói phù hợp để mở khóa thêm tính năng và giới hạn cao hơn.
        </p>
      </div>

      {/* ── Current plan status ── */}
      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="p-5 flex flex-wrap items-center gap-8">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Gói hiện tại</p>
            {loading ? (
              <Skeleton className="h-5 w-24 mt-1" />
            ) : (
              <p className="font-semibold text-amber-700 text-sm">
                {currentPlan ? PLAN_META[currentPlan].label : "—"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Tòa nhà</p>
              {loading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <p className="font-semibold text-sm">
                  {stats?.totalBuildings ?? 0}
                  {currentPlan && PLAN_LIMITS[currentPlan].maxBuildings !== -1
                    ? ` / ${PLAN_LIMITS[currentPlan].maxBuildings}`
                    : " / ∞"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Phòng</p>
              {loading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <p className="font-semibold text-sm">
                  {stats?.totalRooms ?? 0}
                  {currentPlan && PLAN_LIMITS[currentPlan].maxRooms !== -1
                    ? ` / ${PLAN_LIMITS[currentPlan].maxRooms}`
                    : " / ∞"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Plan comparison ── */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          So Sánh Các Gói
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((tier) => {
            const meta = PLAN_META[tier];
            const limits = PLAN_LIMITS[tier];
            const isCurrent = currentPlan === tier;
            return (
              <Card
                key={tier}
                className={[
                  "relative flex flex-col",
                  meta.highlight  ? "border-orange-400 shadow-md ring-1 ring-orange-300" : "",
                  isCurrent && !meta.highlight ? "border-amber-400 shadow-sm" : "",

                ].join(" ")}
              >
                {/* badge */}
                {(meta.highlight || isCurrent) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span
                      className={[
                        "text-white text-[11px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap",
                        meta.highlight ? "bg-orange-500" : "bg-amber-500",
                      ].join(" ")}
                    >
                      {meta.highlight ? "Phổ biến nhất" : "Gói hiện tại"}
                    </span>
                  </div>
                )}

                <CardHeader className="pb-2 pt-6 px-4">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-muted-foreground">
                    {meta.label}
                  </p>
                  <p className="text-xl font-bold leading-tight text-gray-900">
                    {formatCurrency(limits.priceVnd)}
                  </p>
                  <p className="text-[11px] mt-1 text-muted-foreground">
                    ≤ {limits.maxBuildings} nhà · {limits.maxRooms} phòng
                  </p>
                </CardHeader>

                <CardContent className="flex-1 space-y-1.5 pb-5 px-4">
                  <div className="h-px mb-3 bg-border" />
                  {(Object.keys(FEATURE_LABELS) as Array<keyof typeof FEATURE_LABELS>).map((key) => {
                    const enabled = limits.features[key];
                    return (
                      <div key={key} className="flex items-center gap-2 text-[12px]">
                        {enabled ? (
                          <Check
                            className="h-3.5 w-3.5 shrink-0 text-emerald-500"
                            strokeWidth={2}
                          />
                        ) : (
                          <Minus
                            className="h-3.5 w-3.5 shrink-0 text-gray-300"
                            strokeWidth={1.5}
                          />
                        )}
                        <span className={enabled ? "text-gray-700" : "text-gray-400"}>
                          {FEATURE_LABELS[key]}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
          * Thanh toán theo năm giảm 10%.
        </p>
      </div>

      {/* ── Coming Soon ── */}
      <Card className="border-dashed border-2 border-amber-200 bg-amber-50/20">
        <CardContent className="py-12 flex flex-col items-center text-center gap-3">
          <div className="h-12 w-12 rounded-xl border border-amber-200 flex items-center justify-center">
            <Lock className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />
            <Badge variant="outline" className="text-amber-700 border-amber-300 text-xs font-semibold">
              Coming Soon
            </Badge>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Thanh Toán Đang Được Phát Triển</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Hệ thống thanh toán trực tuyến đang được xây dựng. Sẽ hỗ trợ chuyển khoản ngân hàng,
              ví điện tử (Momo, ZaloPay, VNPay) và thẻ tín dụng.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-1 text-xs text-muted-foreground">
            {["Chuyển khoản ngân hàng", "Momo · ZaloPay · VNPay", "Thẻ tín dụng / ghi nợ"].map((m) => (
              <span key={m} className="bg-white border rounded-full px-3 py-1">{m}</span>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Cần hỗ trợ ngay? Liên hệ{" "}
            <a href="mailto:support@housesea.vn" className="text-amber-600 underline underline-offset-2">
              support@housesea.vn
            </a>
          </p>
        </CardContent>
      </Card>

      {/* ── Policy ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Chính Sách Gói Dịch Vụ</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-1 text-xs uppercase tracking-wide">Nâng cấp</p>
            <p className="text-xs">Có hiệu lực ngay lập tức. Tính phí theo tỷ lệ thời gian còn lại trong tháng. Giữ nguyên dữ liệu.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1 text-xs uppercase tracking-wide">Hạ cấp</p>
            <p className="text-xs">Có hiệu lực từ kỳ thanh toán tiếp theo. Dữ liệu vượt giới hạn bị ẩn, không xóa.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1 text-xs uppercase tracking-wide">Hủy gói</p>
            <p className="text-xs">Hủy bất kỳ lúc nào. Dữ liệu giữ 30 ngày, sau đó tài khoản về gói Free.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
