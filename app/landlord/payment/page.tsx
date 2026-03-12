"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Gem,
  Landmark,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const BANK_INFO = {
  bankName: "MB Bank",
  accountNumber: "970422000000001",
  accountName: "CONG TY TNHH HOUSESEA",
};

type PlanKey = "BASIC" | "PREMIUM";
type BillingCycle = "MONTHLY" | "YEARLY";

const PLAN_CONFIG: Record<PlanKey, { title: string; monthlyPrice: number; features: string[] }> = {
  BASIC: {
    title: "Gói Cơ Bản",
    monthlyPrice: 100000,
    features: ["3-5 tòa nhà", "2-3 phòng mỗi tòa", "Hóa đơn tự động", "Báo cáo chi tiết"],
  },
  PREMIUM: {
    title: "Gói Siêu Cấp",
    monthlyPrice: 200000,
    features: ["Không giới hạn tòa nhà", "Không giới hạn phòng", "Tích hợp API", "Hỗ trợ 24/7"],
  },
};

const formatCurrency = (amount: number) => `${amount.toLocaleString("vi-VN")}đ`;

export default function LandlordPaymentPage() {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<PlanKey>("BASIC");
  const [cycle, setCycle] = useState<BillingCycle>("MONTHLY");
  const [months, setMonths] = useState<number>(1);

  const landlordCode = session?.user?.landlordId?.slice(-6).toUpperCase() || "HOUSESEA";

  const pricing = useMemo(() => {
    const selectedPlan = PLAN_CONFIG[plan];
    const selectedMonths = cycle === "MONTHLY" ? 1 : 12;
    const baseAmount = selectedPlan.monthlyPrice * selectedMonths * months;
    const discountRate = cycle === "YEARLY" ? 0.1 : 0;
    const discount = Math.round(baseAmount * discountRate);
    const finalAmount = baseAmount - discount;

    return {
      selectedPlan,
      selectedMonths,
      totalMonths: selectedMonths * months,
      baseAmount,
      discount,
      finalAmount,
    };
  }, [plan, cycle, months]);

  const transferContent = useMemo(() => {
    const cycleText = cycle === "YEARLY" ? "Y" : "M";
    return `HS ${plan} ${cycleText}${months} ${landlordCode}`;
  }, [cycle, landlordCode, months, plan]);

  const qrSrc = useMemo(() => {
    const addInfo = encodeURIComponent(transferContent);
    const accountName = encodeURIComponent(BANK_INFO.accountName);
    return `https://img.vietqr.io/image/MB-970422-compact2.png?amount=${pricing.finalAmount}&addInfo=${addInfo}&accountName=${accountName}`;
  }, [pricing.finalAmount, transferContent]);

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Đã copy ${label}`);
    } catch {
      toast.error("Không thể copy. Vui lòng thử lại.");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-blue-600" />
            Thanh Toán Gói Dịch Vụ
          </h1>
          <p className="text-muted-foreground mt-1">
            Hỗ trợ chuyển khoản ngân hàng. Hệ thống sẽ xác nhận và kích hoạt gói sau khi đối soát.
          </p>
        </div>
        <div className="rounded-lg border bg-blue-50/70 px-4 py-2 text-sm text-blue-700 inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Thanh toán an toàn qua tài khoản doanh nghiệp
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-indigo-600" />
              Chọn Gói Và Chu Kỳ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gói dịch vụ</Label>
                <Select value={plan} onValueChange={(value) => setPlan(value as PlanKey)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn gói" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Cơ Bản - 100.000đ/tháng</SelectItem>
                    <SelectItem value="PREMIUM">Siêu Cấp - 200.000đ/tháng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chu kỳ thanh toán</Label>
                <Select value={cycle} onValueChange={(value) => setCycle(value as BillingCycle)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chu kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Theo tháng</SelectItem>
                    <SelectItem value="YEARLY">Theo năm (giảm 10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 max-w-xs">
              <Label>Số chu kỳ muốn mua</Label>
              <Input
                type="number"
                min={1}
                value={months}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setMonths(Number.isNaN(value) || value < 1 ? 1 : value);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Ví dụ: chu kỳ năm + số chu kỳ 2 = thanh toán 24 tháng.
              </p>
            </div>

            <div className="rounded-xl border p-4 bg-muted/30 space-y-2">
              <p className="font-semibold">Tính năng bao gồm trong {pricing.selectedPlan.title}</p>
              <ul className="space-y-1 text-sm">
                {pricing.selectedPlan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tổng Thanh Toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gói đã chọn</span>
              <span className="font-medium">{pricing.selectedPlan.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thời hạn</span>
              <span className="font-medium">{pricing.totalMonths} tháng</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatCurrency(pricing.baseAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giảm giá</span>
              <span className="text-emerald-600">-{formatCurrency(pricing.discount)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-base">
              <span className="font-semibold">Cần chuyển khoản</span>
              <span className="font-bold text-blue-700">{formatCurrency(pricing.finalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-blue-600" />
            Thanh Toán Chuyển Khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ngân hàng</p>
                  <p className="font-semibold">{BANK_INFO.bankName}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Số tài khoản</p>
                  <p className="font-semibold tracking-wide">{BANK_INFO.accountNumber}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-0 h-7 mt-1"
                    onClick={() => copyText(BANK_INFO.accountNumber, "số tài khoản")}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                </div>

                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Chủ tài khoản</p>
                  <p className="font-semibold">{BANK_INFO.accountName}</p>
                </div>
              </div>

              <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs text-blue-700">Nội dung chuyển khoản (bắt buộc)</p>
                <p className="font-semibold text-blue-900 tracking-wide mt-1">{transferContent}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 h-7 mt-1 text-blue-700"
                  onClick={() => copyText(transferContent, "nội dung chuyển khoản")}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy nội dung
                </Button>
              </div>

              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Sau khi chuyển khoản, vui lòng giữ lại biên lai. Hệ thống sẽ kích hoạt gói trong vòng 5-15 phút trong giờ hành chính.
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => copyText(String(pricing.finalAmount), "số tiền")}>Copy số tiền</Button>
              <Button variant="outline" onClick={() => toast.success("Đã ghi nhận yêu cầu, chúng tôi sẽ kiểm tra giao dịch sớm nhất.")}>
                Tôi Đã Chuyển Khoản
              </Button>
            </div>
          </div>

          <div className="rounded-xl border p-4 bg-muted/20 h-fit">
            <p className="font-semibold mb-3 inline-flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Quét Mã QR
            </p>
            <img
              src={qrSrc}
              alt="QR chuyển khoản"
              className="w-full rounded-md border bg-white"
            />
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Mã QR đã chứa sẵn số tiền và nội dung chuyển khoản của gói bạn đang chọn.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Câu hỏi thường gặp</p>
          <p>1) Khi nào gói được kích hoạt: sau khi đối soát giao dịch thành công.</p>
          <p>2) Cần hỗ trợ nhanh: email support@housesea.vn hoặc hotline 0900 000 000.</p>
          <p>3) Xuất hóa đơn VAT: liên hệ bộ phận CSKH sau khi thanh toán.</p>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
        <Building2 className="h-3.5 w-3.5" />
        Mã tham chiếu tài khoản: {landlordCode}
      </div>
    </div>
  );
}
