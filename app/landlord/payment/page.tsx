"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  Minus,
  CreditCard,
  Building2,
  Users,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PLAN_LIMITS, PlanTier } from "@/lib/constants/plans";

const formatCurrency = (amount: number) =>
  amount === 0 ? "Miễn phí" : `${amount.toLocaleString("vi-VN")}đ / tháng`;

const PLAN_META: Record<PlanTier, { label: string; highlight: boolean }> = {
  FREE: { label: "Free", highlight: false },
  STARTER: { label: "Starter", highlight: false },
  PRO: { label: "Pro", highlight: true },
};

const FEATURE_LABELS: Record<keyof typeof PLAN_LIMITS.FREE.features, string> = {
  autoInvoice: "Tự động tạo hóa đơn",
  emailNotifications: "Thông báo email tự động",
  reports: "Báo cáo doanh thu",
  communityPosts: "Cộng đồng người thuê",
  apiAccess: "Tích hợp API",
  webhooks: "Webhook sự kiện",
  exportData: "Export Excel / CSV",
  advancedAnalytics: "Analytics nâng cao",
  aiChatbot: "AI Chatbot thông minh",
  aiPredictions: "AI dự đoán & gợi ý giá",
  multiUser: "Multi-user & phân quyền",
  whiteLabel: "White-label thương hiệu",
};

export default function LandlordPaymentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState<PlanTier | null>(null);
  const [stats, setStats] = useState<{ totalBuildings: number; totalRooms: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanTier | null>(null);

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

  useEffect(() => {
    const orderCode = searchParams.get("orderCode");
    if (!orderCode || !session?.user?.landlordId) return;

    fetch("/api/payos/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderCode }),
    })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok) {
          throw new Error(data.error || "Không thể xác nhận thanh toán");
        }
        if (data.status === "PAID") {
          setCurrentPlan(data.plan as PlanTier);
          toast.success(`Thanh toán thành công. Tài khoản đã lên gói ${PLAN_META[data.plan as PlanTier].label}.`);
          router.replace("/landlord/payment");
        } else {
          toast.info(`Thanh toán đang ở trạng thái ${data.status}.`);
        }
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Không thể xác nhận thanh toán"));
  }, [router, searchParams, session?.user?.landlordId]);

  const plans = Object.values(PlanTier);

  async function handleCheckout(plan: PlanTier) {
    try {
      setCheckoutPlan(plan);
      const response = await fetch("/api/payos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Không thể tạo thanh toán");
      }
      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo thanh toán");
    } finally {
      setCheckoutPlan(null);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
          Nâng Cấp Gói Dịch Vụ
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Chọn gói phù hợp để mở khóa thêm tính năng và giới hạn cao hơn.
        </p>
      </div>

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
                  meta.highlight ? "border-orange-400 shadow-md ring-1 ring-orange-300" : "",
                  isCurrent && !meta.highlight ? "border-amber-400 shadow-sm" : "",
                ].join(" ")}
              >
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
                    {limits.maxBuildings === -1 ? "Không giới hạn nhà" : `≤ ${limits.maxBuildings} nhà`}
                    {" · "}
                    {limits.maxRooms === -1 ? "∞ phòng" : `${limits.maxRooms} phòng`}
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
                  {tier !== PlanTier.FREE && (
                    <Button
                      className="w-full mt-4"
                      disabled={isCurrent || checkoutPlan === tier}
                      onClick={() => handleCheckout(tier)}
                    >
                      {isCurrent ? "Đang sử dụng" : checkoutPlan === tier ? "Đang tạo thanh toán..." : `Mua gói ${meta.label}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

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
