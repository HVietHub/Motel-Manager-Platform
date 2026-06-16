"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Building2, Zap, Droplets, Plus, Trash2, Receipt, Save,
} from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/auth/use-landlord-id";

type Surcharge = {
  name: string;
  amount: string; // string for input control
};

const SURCHARGE_PRESETS = [
  { name: "Tiền giữ xe máy", amount: "50000" },
  { name: "Tiền giữ ô tô", amount: "200000" },
  { name: "Tiền rác", amount: "20000" },
  { name: "Tiền internet / Wifi", amount: "100000" },
  { name: "Tiền vệ sinh chung", amount: "30000" },
  { name: "Tiền thang máy", amount: "50000" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function CreateBuildingPage() {
  const router = useRouter();
  const landlordId = useLandlordId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Building info
  const [info, setInfo] = useState({
    name: "",
    address: "",
    description: "",
    electricityPrice: "3000",
    waterPrice: "50000",
    waterBillingType: "FIXED",
  });

  // Surcharges
  const [surcharges, setSurcharges] = useState<Surcharge[]>([]);
  const [newSurcharge, setNewSurcharge] = useState<Surcharge>({ name: "", amount: "" });

  // ── Surcharge helpers ──────────────────────────────────────────────────────
  const addSurcharge = () => {
    if (!newSurcharge.name.trim()) { toast.error("Nhập tên phụ thu"); return; }
    const amount = parseFloat(newSurcharge.amount);
    if (isNaN(amount) || amount < 0) { toast.error("Số tiền không hợp lệ"); return; }
    setSurcharges((prev) => [...prev, { name: newSurcharge.name.trim(), amount: newSurcharge.amount }]);
    setNewSurcharge({ name: "", amount: "" });
  };

  const addPreset = (preset: { name: string; amount: string }) => {
    if (surcharges.some((s) => s.name === preset.name)) {
      toast.error("Phụ thu này đã được thêm");
      return;
    }
    setSurcharges((prev) => [...prev, preset]);
  };

  const removeSurcharge = (index: number) => {
    setSurcharges((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSurcharge = (index: number, field: keyof Surcharge, value: string) => {
    setSurcharges((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const surchargeTotal = surcharges.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!landlordId) return;
    if (!info.name.trim()) { toast.error("Nhập tên tòa nhà"); return; }
    if (!info.address.trim()) { toast.error("Nhập địa chỉ"); return; }

    const electricityPrice = parseFloat(info.electricityPrice);
    const waterPrice = parseFloat(info.waterPrice);
    if (isNaN(electricityPrice) || electricityPrice < 0) { toast.error("Giá điện không hợp lệ"); return; }
    if (isNaN(waterPrice) || waterPrice < 0) { toast.error("Giá nước không hợp lệ"); return; }

    // Validate surcharges
    for (const s of surcharges) {
      if (!s.name.trim()) { toast.error("Tên phụ thu không được để trống"); return; }
      if (isNaN(parseFloat(s.amount)) || parseFloat(s.amount) < 0) {
        toast.error(`Số tiền của "${s.name}" không hợp lệ`); return;
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Create building
      const bRes = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId,
          name: info.name.trim(),
          address: info.address.trim(),
          description: info.description.trim() || undefined,
          electricityPrice,
          waterPrice,
          waterBillingType: info.waterBillingType,
        }),
      });

      if (!bRes.ok) {
        const err = await bRes.json();
        throw new Error(err.error || "Không thể tạo tòa nhà");
      }

      const { building } = await bRes.json();

      // 2. Create surcharges in parallel
      if (surcharges.length > 0) {
        await Promise.all(
          surcharges.map((s) =>
            fetch(`/api/buildings/${building.id}/surcharges`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: s.name.trim(), amount: parseFloat(s.amount) }),
            })
          )
        );
      }

      toast.success(`Đã tạo "${building.name}" với ${surcharges.length} phụ thu!`);
      router.push("/landlord/buildings");
    } catch (e: any) {
      toast.error(e.message || "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/landlord/buildings")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1f2116]">Thêm Tòa Nhà / Dãy Trọ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Điền thông tin và thiết lập phụ thu ngay khi tạo</p>
        </div>
      </div>

      {/* ── Section 1: Thông tin cơ bản ─────────────────────────────────────── */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-[#f8f7f4] border-b border-[#e2e0d8] rounded-t-xl pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-[#1f2116]">
            <Building2 className="h-4 w-4 text-[#ed7307]" />
            Thông tin tòa nhà
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Tên tòa nhà / dãy trọ <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="VD: Nhà Trọ A, Dãy Trọ B, Khu C..."
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Địa chỉ <span className="text-destructive">*</span></Label>
            <Input
              id="address"
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
              value={info.address}
              onChange={(e) => setInfo({ ...info, address: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Mô tả (tuỳ chọn)</Label>
            <Textarea
              id="description"
              placeholder="Mô tả ngắn về tòa nhà, tiện ích, vị trí..."
              value={info.description}
              onChange={(e) => setInfo({ ...info, description: e.target.value })}
              rows={2}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="electricity" className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#fdb549]" /> Giá điện (VNĐ/kWh)
              </Label>
              <Input
                id="electricity"
                type="number"
                min="0"
                value={info.electricityPrice}
                onChange={(e) => setInfo({ ...info, electricityPrice: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Mặc định: 3.000đ/kWh</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="waterBillingType" className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-[#90b1c4]" /> Cách tính tiền nước
              </Label>
              <Select value={info.waterBillingType} onValueChange={(value) => setInfo({ ...info, waterBillingType: value })}>
                <SelectTrigger id="waterBillingType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Thu cố định hàng tháng</SelectItem>
                  <SelectItem value="METERED">Tính theo số khối nước</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="water"
                type="number"
                min="0"
                value={info.waterPrice}
                onChange={(e) => setInfo({ ...info, waterPrice: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {info.waterBillingType === "METERED" ? "Đơn giá VNĐ/m³ nước" : "Số tiền cố định VNĐ/tháng"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Phụ thu ───────────────────────────────────────────────── */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-[#f8f7f4] border-b border-[#e2e0d8] rounded-t-xl pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base text-[#1f2116]">
              <Receipt className="h-4 w-4 text-[#ed7307]" />
              Phụ thu hàng tháng
            </CardTitle>
            {surcharges.length > 0 && (
              <Badge className="bg-[#fdb549]/20 text-[#1f2116] border-[#fdb549]/40 font-semibold">
                Tổng: {fmt(surchargeTotal)}/tháng
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Preset chips */}
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
              Thêm nhanh
            </p>
            <div className="flex flex-wrap gap-2">
              {SURCHARGE_PRESETS.map((p) => {
                const added = surcharges.some((s) => s.name === p.name);
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => addPreset(p)}
                    disabled={added}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      added
                        ? "bg-[#f1f0ec] text-muted-foreground border-[#e2e0d8] cursor-not-allowed"
                        : "bg-white border-[#e2e0d8] hover:border-[#fdb549] hover:text-[#1f2116] text-[#64748b]"
                    }`}
                  >
                    {added ? "✓ " : "+ "}{p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Added surcharges list */}
          {surcharges.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Đã thêm ({surcharges.length})
              </p>
              {surcharges.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#f8f7f4] rounded-xl border border-[#e2e0d8]">
                  <Input
                    value={s.name}
                    onChange={(e) => updateSurcharge(i, "name", e.target.value)}
                    className="flex-1 h-8 text-sm bg-white border-[#e2e0d8]"
                    placeholder="Tên phụ thu"
                  />
                  <div className="relative w-36">
                    <Input
                      type="number"
                      min="0"
                      value={s.amount}
                      onChange={(e) => updateSurcharge(i, "amount", e.target.value)}
                      className="h-8 text-sm bg-white border-[#e2e0d8] pr-8"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">đ</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-red-50 flex-shrink-0"
                    onClick={() => removeSurcharge(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Manual add row */}
          <div className="flex items-end gap-3 pt-1">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Tên phụ thu</Label>
              <Input
                placeholder="VD: Tiền giữ xe, Tiền rác..."
                value={newSurcharge.name}
                onChange={(e) => setNewSurcharge({ ...newSurcharge, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addSurcharge()}
                className="h-9 bg-white border-[#e2e0d8]"
              />
            </div>
            <div className="w-36 space-y-1.5">
              <Label className="text-xs">Số tiền (đ/tháng)</Label>
              <Input
                type="number"
                min="0"
                placeholder="50000"
                value={newSurcharge.amount}
                onChange={(e) => setNewSurcharge({ ...newSurcharge, amount: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addSurcharge()}
                className="h-9 bg-white border-[#e2e0d8]"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addSurcharge}
              className="h-9 border-[#e2e0d8] flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </Button>
          </div>

          {surcharges.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Chưa có phụ thu nào. Dùng "Thêm nhanh" hoặc nhập thủ công bên trên.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={() => router.push("/landlord/buildings")} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#1f2116] hover:bg-[#31361b] text-white px-8"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang tạo...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Tạo Tòa Nhà
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
