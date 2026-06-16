"use client";

import { useState, useEffect, use } from "react";
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Building2, Zap, Droplets, Plus, Trash2, Receipt,
  Save, Pencil, Check, X, Power,
} from "lucide-react";
import { toast } from "sonner";

type Surcharge = {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
};

type Building = {
  id: string;
  name: string;
  address: string;
  description: string;
  electricityPrice: number;
  waterPrice: number;
  waterBillingType: string;
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

export default function EditBuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: buildingId } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Building info form
  const [info, setInfo] = useState<Building>({
    id: "",
    name: "",
    address: "",
    description: "",
    electricityPrice: 3000,
    waterPrice: 50000,
    waterBillingType: "FIXED",
  });

  // Surcharges
  const [surcharges, setSurcharges] = useState<Surcharge[]>([]);
  const [newSurcharge, setNewSurcharge] = useState({ name: "", amount: "" });
  const [isAddingSurcharge, setIsAddingSurcharge] = useState(false);

  // Inline edit state for surcharges
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState({ name: "", amount: "" });

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Surcharge | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, [buildingId]);

  const fetchAll = async () => {
    try {
      const [bRes, sRes] = await Promise.all([
        fetch(`/api/buildings/${buildingId}`),
        fetch(`/api/buildings/${buildingId}/surcharges`),
      ]);
      if (bRes.ok) {
        const b = await bRes.json();
        setInfo({
          id: b.id,
          name: b.name,
          address: b.address,
          description: b.description || "",
          electricityPrice: b.electricityPrice ?? 3000,
          waterPrice: b.waterPrice ?? 50000,
          waterBillingType: b.waterBillingType ?? "FIXED",
        });
      }
      if (sRes.ok) setSurcharges(await sRes.json());
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Save building info ─────────────────────────────────────────────────────
  const handleSaveInfo = async () => {
    if (!info.name.trim()) { toast.error("Nhập tên tòa nhà"); return; }
    if (!info.address.trim()) { toast.error("Nhập địa chỉ"); return; }
    if (info.electricityPrice < 0) { toast.error("Giá điện không hợp lệ"); return; }
    if (info.waterPrice < 0) { toast.error("Giá nước không hợp lệ"); return; }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/buildings/${buildingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: info.name.trim(),
          address: info.address.trim(),
          description: info.description.trim() || undefined,
          electricityPrice: info.electricityPrice,
          waterPrice: info.waterPrice,
          waterBillingType: info.waterBillingType,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success("Đã lưu thông tin tòa nhà!");
    } catch (e: any) {
      toast.error(e.message || "Không thể lưu");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Surcharge: add ─────────────────────────────────────────────────────────
  const handleAddSurcharge = async () => {
    if (!newSurcharge.name.trim()) { toast.error("Nhập tên phụ thu"); return; }
    const amount = parseFloat(newSurcharge.amount);
    if (isNaN(amount) || amount < 0) { toast.error("Số tiền không hợp lệ"); return; }

    setIsAddingSurcharge(true);
    try {
      const res = await fetch(`/api/buildings/${buildingId}/surcharges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSurcharge.name.trim(), amount }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success("Đã thêm phụ thu!");
      setNewSurcharge({ name: "", amount: "" });
      fetchAll();
    } catch (e: any) {
      toast.error(e.message || "Không thể thêm");
    } finally {
      setIsAddingSurcharge(false);
    }
  };

  const addPreset = async (preset: { name: string; amount: string }) => {
    if (surcharges.some((s) => s.name === preset.name)) {
      toast.error("Phụ thu này đã tồn tại"); return;
    }
    try {
      const res = await fetch(`/api/buildings/${buildingId}/surcharges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: preset.name, amount: parseFloat(preset.amount) }),
      });
      if (!res.ok) throw new Error();
      fetchAll();
    } catch {
      toast.error("Không thể thêm phụ thu");
    }
  };

  // ── Surcharge: inline edit ─────────────────────────────────────────────────
  const startEdit = (s: Surcharge) => {
    setEditingId(s.id);
    setEditingValues({ name: s.name, amount: s.amount.toString() });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    if (!editingValues.name.trim()) { toast.error("Tên không được để trống"); return; }
    const amount = parseFloat(editingValues.amount);
    if (isNaN(amount) || amount < 0) { toast.error("Số tiền không hợp lệ"); return; }

    try {
      const res = await fetch(`/api/buildings/${buildingId}/surcharges/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingValues.name.trim(), amount }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      fetchAll();
    } catch {
      toast.error("Không thể cập nhật");
    }
  };

  // ── Surcharge: toggle ──────────────────────────────────────────────────────
  const handleToggle = async (s: Surcharge) => {
    try {
      const res = await fetch(`/api/buildings/${buildingId}/surcharges/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      if (!res.ok) throw new Error();
      fetchAll();
    } catch {
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  // ── Surcharge: delete ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/buildings/${buildingId}/surcharges/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Đã xóa phụ thu!");
      setDeleteTarget(null);
      fetchAll();
    } catch {
      toast.error("Không thể xóa");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeTotal = surcharges.filter((s) => s.isActive).reduce((sum, s) => sum + s.amount, 0);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/landlord/buildings")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1f2116]">{info.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{info.address}</p>
        </div>
      </div>

      {/* ── Section 1: Thông tin tòa nhà ─────────────────────────────────────── */}
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
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Địa chỉ <span className="text-destructive">*</span></Label>
            <Input
              id="address"
              value={info.address}
              onChange={(e) => setInfo({ ...info, address: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Mô tả (tuỳ chọn)</Label>
            <Textarea
              id="description"
              value={info.description}
              onChange={(e) => setInfo({ ...info, description: e.target.value })}
              rows={2}
              placeholder="Mô tả ngắn về tòa nhà..."
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
                onChange={(e) => setInfo({ ...info, electricityPrice: parseFloat(e.target.value) || 0 })}
              />
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
                onChange={(e) => setInfo({ ...info, waterPrice: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                {info.waterBillingType === "METERED" ? "Đơn giá VNĐ/m³ nước" : "Số tiền cố định VNĐ/tháng"}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              onClick={handleSaveInfo}
              disabled={isSaving}
              className="bg-[#1f2116] hover:bg-[#31361b] text-white"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> Lưu thông tin
                </span>
              )}
            </Button>
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
              <Badge className="bg-[#fdb549]/20 text-[#1f2116] border-[#fdb549]/40 font-semibold text-xs">
                Đang thu: {fmt(activeTotal)}/tháng
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">

          {/* Preset chips */}
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Thêm nhanh</p>
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

          {/* Surcharge table */}
          {surcharges.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fafaf8]">
                  <TableHead>Tên phụ thu</TableHead>
                  <TableHead className="text-right">Số tiền / tháng</TableHead>
                  <TableHead className="text-center w-28">Trạng thái</TableHead>
                  <TableHead className="text-right w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surcharges.map((s) => (
                  <TableRow key={s.id} className={!s.isActive ? "opacity-50" : ""}>
                    {/* Name cell */}
                    <TableCell>
                      {editingId === s.id ? (
                        <Input
                          value={editingValues.name}
                          onChange={(e) => setEditingValues({ ...editingValues, name: e.target.value })}
                          className="h-8 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-[#1f2116]">{s.name}</span>
                      )}
                    </TableCell>

                    {/* Amount cell */}
                    <TableCell className="text-right">
                      {editingId === s.id ? (
                        <Input
                          type="number"
                          min="0"
                          value={editingValues.amount}
                          onChange={(e) => setEditingValues({ ...editingValues, amount: e.target.value })}
                          className="h-8 text-sm text-right w-32 ml-auto"
                        />
                      ) : (
                        <span className="font-semibold">{fmt(s.amount)}</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={`text-xs cursor-pointer select-none ${
                          s.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        onClick={() => handleToggle(s)}
                      >
                        <Power className="h-2.5 w-2.5 mr-1" />
                        {s.isActive ? "Bật" : "Tắt"}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      {editingId === s.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => saveEdit(s.id)} className="h-7 w-7 p-0 text-green-600">
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 w-7 p-0 text-muted-foreground">
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(s)} className="h-7 w-7 p-0">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(s)} className="h-7 w-7 p-0 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Manual add row */}
          <div className="flex items-end gap-3 pt-1 border-t border-[#e2e0d8]">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Tên phụ thu mới</Label>
              <Input
                placeholder="VD: Tiền giữ xe, Tiền rác..."
                value={newSurcharge.name}
                onChange={(e) => setNewSurcharge({ ...newSurcharge, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAddSurcharge()}
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
                onKeyDown={(e) => e.key === "Enter" && handleAddSurcharge()}
                className="h-9 bg-white border-[#e2e0d8]"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSurcharge}
              disabled={isAddingSurcharge}
              className="h-9 border-[#e2e0d8] flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              {isAddingSurcharge ? "Đang thêm..." : "Thêm"}
            </Button>
          </div>

          {surcharges.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-1">
              Chưa có phụ thu nào. Dùng "Thêm nhanh" hoặc nhập thủ công bên trên.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bottom nav */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => router.push("/landlord/buildings")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phụ thu?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa <strong>"{deleteTarget?.name}"</strong> ({fmt(deleteTarget?.amount ?? 0)}/tháng).
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
