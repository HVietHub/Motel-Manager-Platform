"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Receipt, Power } from "lucide-react";
import { toast } from "sonner";

type Surcharge = {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
  createdAt: string;
};

type Building = {
  id: string;
  name: string;
  address: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function SurchargesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: buildingId } = use(params);
  const router = useRouter();

  const [building, setBuilding] = useState<Building | null>(null);
  const [surcharges, setSurcharges] = useState<Surcharge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", amount: "" });
  const [isCreating, setIsCreating] = useState(false);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<Surcharge | null>(null);
  const [editForm, setEditForm] = useState({ name: "", amount: "" });
  const [isEditing, setIsEditing] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Surcharge | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [buildingId]);

  const fetchAll = async () => {
    try {
      const [bRes, sRes] = await Promise.all([
        fetch(`/api/buildings/${buildingId}`),
        fetch(`/api/buildings/${buildingId}/surcharges`),
      ]);
      if (bRes.ok) setBuilding(await bRes.json());
      if (sRes.ok) setSurcharges(await sRes.json());
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.name.trim()) { toast.error("Nhập tên phụ thu"); return; }
    const amount = parseFloat(createForm.amount);
    if (isNaN(amount) || amount < 0) { toast.error("Số tiền không hợp lệ"); return; }

    setIsCreating(true);
    try {
      const res = await fetch(`/api/buildings/${buildingId}/surcharges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createForm.name.trim(), amount }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success("Đã thêm phụ thu!");
      setIsCreateOpen(false);
      setCreateForm({ name: "", amount: "" });
      fetchAll();
    } catch (e: any) {
      toast.error(e.message || "Không thể thêm phụ thu");
    } finally {
      setIsCreating(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const openEdit = (s: Surcharge) => {
    setEditTarget(s);
    setEditForm({ name: s.name, amount: s.amount.toString() });
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!editForm.name.trim()) { toast.error("Nhập tên phụ thu"); return; }
    const amount = parseFloat(editForm.amount);
    if (isNaN(amount) || amount < 0) { toast.error("Số tiền không hợp lệ"); return; }

    setIsEditing(true);
    try {
      const res = await fetch(`/api/buildings/${buildingId}/surcharges/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name.trim(), amount }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success("Đã cập nhật phụ thu!");
      setEditTarget(null);
      fetchAll();
    } catch (e: any) {
      toast.error(e.message || "Không thể cập nhật");
    } finally {
      setIsEditing(false);
    }
  };

  // ── Toggle active ────────────────────────────────────────────────────────────
  const handleToggle = async (s: Surcharge) => {
    try {
      const res = await fetch(`/api/buildings/${buildingId}/surcharges/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(s.isActive ? "Đã tắt phụ thu" : "Đã bật phụ thu");
      fetchAll();
    } catch {
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
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
      toast.error("Không thể xóa phụ thu");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeTotal = surcharges
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/landlord/buildings")} className="mt-1 flex-shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1f2116]">Phụ Thu — {building?.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{building?.address}</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-[#1f2116] hover:bg-[#31361b] text-white">
          <Plus className="mr-2 h-4 w-4" /> Thêm Phụ Thu
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Tổng phụ thu</p>
            <p className="text-2xl font-black text-[#1f2116]">{surcharges.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Đang áp dụng</p>
            <p className="text-2xl font-black text-[#8b9c38]">{surcharges.filter((s) => s.isActive).length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-[#fdb549] to-[#ed7307] text-white">
          <CardContent className="p-4">
            <p className="text-xs text-white/70 font-bold uppercase mb-1">Tổng thu/tháng</p>
            <p className="text-lg font-black">{fmt(activeTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-[#f8f7f4] border-b border-[#e2e0d8] rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-[#1f2116] text-base">
            <Receipt className="h-4 w-4 text-[#ed7307]" />
            Danh sách phụ thu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#fafaf8]">
                <TableHead>Tên phụ thu</TableHead>
                <TableHead className="text-right">Số tiền / tháng</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surcharges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <Receipt className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground text-sm">Chưa có phụ thu nào</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Thêm ngay
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                surcharges.map((s) => (
                  <TableRow key={s.id} className={!s.isActive ? "opacity-50" : ""}>
                    <TableCell className="font-medium text-[#1f2116]">{s.name}</TableCell>
                    <TableCell className="text-right font-semibold">{fmt(s.amount)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(s)}
                          title={s.isActive ? "Tắt phụ thu" : "Bật phụ thu"}
                          className={s.isActive ? "text-[#8b9c38]" : "text-muted-foreground"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Badge
                          variant="secondary"
                          className={s.isActive
                            ? "bg-green-100 text-green-700 text-xs"
                            : "bg-gray-100 text-gray-500 text-xs"
                          }
                        >
                          {s.isActive ? "Đang áp dụng" : "Tắt"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(s)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        💡 Các phụ thu đang áp dụng sẽ tự động được cộng vào <strong>tiền dịch vụ</strong> khi tạo hóa đơn mới cho phòng thuộc tòa nhà này.
      </p>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Thêm Phụ Thu Mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Tên phụ thu</Label>
              <Input
                id="c-name"
                placeholder="VD: Tiền giữ xe, Tiền rác, Wifi..."
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-amount">Số tiền (VNĐ/tháng)</Label>
              <Input
                id="c-amount"
                type="number"
                min="0"
                placeholder="50000"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} disabled={isCreating} className="bg-[#1f2116] hover:bg-[#31361b] text-white">
              {isCreating ? "Đang thêm..." : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Phụ Thu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="e-name">Tên phụ thu</Label>
              <Input
                id="e-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-amount">Số tiền (VNĐ/tháng)</Label>
              <Input
                id="e-amount"
                type="number"
                min="0"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Hủy</Button>
            <Button onClick={handleEdit} disabled={isEditing} className="bg-[#1f2116] hover:bg-[#31361b] text-white">
              {isEditing ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
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
