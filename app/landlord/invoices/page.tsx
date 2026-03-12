"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, CheckCircle, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/use-landlord-id";

type Invoice = {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  buildingName: string;
  month: number;
  year: number;
  rentAmount: number;
  electricityUsage: number;
  electricityAmount: number;
  waterAmount: number;
  serviceAmount: number;
  otherAmount: number;
  totalAmount: number;
  status: string;
  paidDate: string | null;
};

type Tenant = {
  id: string;
  user: {
    name: string;
  };
  room?: {
    roomNumber: string;
    price: number;
    building: {
      name: string;
      electricityPrice: number;
      waterPrice: number;
    };
  };
};

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const landlordId = useLandlordId();
  const [formData, setFormData] = useState({
    tenantId: "",
    month: "",
    year: "",
    electricityUsage: "",
    serviceAmount: "",
    otherAmount: "",
  });

  useEffect(() => {
    if (landlordId) {
      fetchInvoices();
      fetchTenants();
    }
  }, [landlordId]);

  const fetchInvoices = async () => {
    try {
      if (!landlordId) {
        return;
      }

      const response = await fetch(`/api/invoices?landlordId=${landlordId}`);
      if (!response.ok) throw new Error("Failed to fetch invoices");

      const data = await response.json();
      const formattedInvoices = data.map((invoice: any) => ({
        id: invoice.id,
        tenantId: invoice.tenantId,
        tenantName: invoice.tenant.user.name,
        roomNumber: invoice.tenant.room?.roomNumber || "N/A",
        buildingName: invoice.tenant.room?.building?.name || "N/A",
        month: invoice.month,
        year: invoice.year,
        rentAmount: invoice.rentAmount,
        electricityUsage: invoice.electricityUsage || 0,
        electricityAmount: invoice.electricityAmount,
        waterAmount: invoice.waterAmount,
        serviceAmount: invoice.serviceAmount,
        otherAmount: invoice.otherAmount,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        paidDate: invoice.paidDate,
      }));
      setInvoices(formattedInvoices);
    } catch (error) {
      console.error("Fetch invoices error:", error);
      toast.error("Không thể tải danh sách hóa đơn");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      if (!landlordId) return;

      const response = await fetch(`/api/tenants?landlordId=${landlordId}`);
      if (!response.ok) throw new Error("Failed to fetch tenants");

      const data = await response.json();
      setTenants(data);
    } catch (error) {
      console.error("Fetch tenants error:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.buildingName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && invoice.status === "PAID") ||
      (statusFilter === "unpaid" && invoice.status === "UNPAID");
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    try {
      if (!landlordId) {
        return;
      }

      if (!formData.tenantId || !formData.month || !formData.year || formData.electricityUsage === "") {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId,
          tenantId: formData.tenantId,
          month: parseInt(formData.month),
          year: parseInt(formData.year),
          electricityUsage: parseFloat(formData.electricityUsage),
          serviceAmount: formData.serviceAmount ? parseFloat(formData.serviceAmount) : 0,
          otherAmount: formData.otherAmount ? parseFloat(formData.otherAmount) : 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create invoice");
      }

      const result = await response.json();
      toast.success("Tạo hóa đơn thành công!");
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning: string) => toast.warning(warning));
      }
      setIsCreateDialogOpen(false);
      setFormData({
        tenantId: "",
        month: "",
        year: "",
        electricityUsage: "",
        serviceAmount: "",
        otherAmount: "",
      });
      fetchInvoices();
    } catch (error: any) {
      console.error("Create invoice error:", error);
      toast.error(error.message || "Không thể tạo hóa đơn");
    }
  };

  const handleEdit = async () => {
    try {
      if (!landlordId || !selectedInvoice) {
        return;
      }

      const response = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId,
          rentAmount: formData.rentAmount ? parseFloat(formData.rentAmount) : selectedInvoice.rentAmount,
          electricityAmount: formData.electricityAmount ? parseFloat(formData.electricityAmount) : selectedInvoice.electricityAmount,
          waterAmount: formData.waterAmount ? parseFloat(formData.waterAmount) : selectedInvoice.waterAmount,
          serviceAmount: formData.serviceAmount ? parseFloat(formData.serviceAmount) : selectedInvoice.serviceAmount,
          otherAmount: formData.otherAmount ? parseFloat(formData.otherAmount) : selectedInvoice.otherAmount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update invoice");
      }

      toast.success("Cập nhật hóa đơn thành công!");
      setIsEditDialogOpen(false);
      setSelectedInvoice(null);
      setFormData({
        tenantId: "",
        month: "",
        year: "",
        rentAmount: "",
        electricityAmount: "",
        waterAmount: "",
        serviceAmount: "",
        otherAmount: "",
      });
      fetchInvoices();
    } catch (error: any) {
      console.error("Update invoice error:", error);
      toast.error(error.message || "Không thể cập nhật hóa đơn");
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (invoice.status === "PAID") {
      toast.error("Hóa đơn đã được thanh toán!");
      return;
    }

    try {
      if (!landlordId) {
        return;
      }

      const response = await fetch(`/api/invoices/${invoice.id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark invoice as paid");
      }

      toast.success("Đánh dấu hóa đơn đã thanh toán!");
      fetchInvoices();
    } catch (error: any) {
      console.error("Mark invoice paid error:", error);
      toast.error(error.message || "Không thể đánh dấu hóa đơn");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Hóa Đơn</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý hóa đơn tiền thuê và dịch vụ
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Hóa Đơn
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Hóa Đơn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên người thuê, phòng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="paid">Đã Thanh Toán</SelectItem>
                <SelectItem value="unpaid">Chưa Thanh Toán</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người Thuê</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead className="text-center">Tháng/Năm</TableHead>
                  <TableHead className="text-right">Tiền Phòng</TableHead>
                  <TableHead className="text-right">Số điện (kWh)</TableHead>
                  <TableHead className="text-right">Tiền điện</TableHead>
                  <TableHead className="text-right">Tiền nước</TableHead>
                  <TableHead className="text-right">Khác</TableHead>
                  <TableHead className="text-right">Tổng Cộng</TableHead>
                  <TableHead className="text-center">Trạng Thái</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {searchQuery || statusFilter !== "all"
                          ? "Không tìm thấy hóa đơn nào"
                          : "Chưa có hóa đơn nào"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.tenantName}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.roomNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.buildingName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {invoice.month}/{invoice.year}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.rentAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.electricityUsage.toFixed(1)} kWh
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.electricityAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.waterAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.otherAmount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {invoice.status === "PAID" ? (
                          <Badge className="bg-green-100 text-green-700" variant="secondary">
                            Đã Thanh Toán
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700" variant="secondary">
                            Chưa Thanh Toán
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {invoice.status !== "PAID" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo Hóa Đơn Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin hóa đơn tiền thuê và dịch vụ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">Người Thuê</Label>
                <Select value={formData.tenantId} onValueChange={(value) => setFormData({ ...formData, tenantId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn người thuê" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.user.name}
                        {tenant.room && ` - Phòng ${tenant.room.roomNumber}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="month">Tháng</Label>
                  <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tháng" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Năm</Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Năm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="electricityUsage">Số điện tiêu thụ (kWh)</Label>
                <Input 
                  id="electricityUsage" 
                  type="number" 
                  min="0"
                  step="0.1"
                  placeholder="150" 
                  value={formData.electricityUsage}
                  onChange={(e) => setFormData({ ...formData, electricityUsage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceAmount">Phí dịch vụ (VNĐ)</Label>
                <Input 
                  id="serviceAmount" 
                  type="number" 
                  placeholder="0" 
                  value={formData.serviceAmount}
                  onChange={(e) => setFormData({ ...formData, serviceAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherAmount">Chi phí khác (VNĐ)</Label>
              <Input 
                id="otherAmount" 
                type="number" 
                placeholder="0" 
                value={formData.otherAmount}
                onChange={(e) => setFormData({ ...formData, otherAmount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo Hóa Đơn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Hóa Đơn</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin hóa đơn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-roomRent">Tiền Phòng (VNĐ)</Label>
                <Input
                  id="edit-roomRent"
                  type="number"
                  defaultValue={selectedInvoice?.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-electricityCost">Tiền Điện (VNĐ)</Label>
                <Input
                  id="edit-electricityCost"
                  type="number"
                  defaultValue={selectedInvoice?.electricityAmount}
                  onChange={(e) => setFormData({ ...formData, electricityAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-waterCost">Tiền Nước (VNĐ)</Label>
                <Input
                  id="edit-waterCost"
                  type="number"
                  defaultValue={selectedInvoice?.waterAmount}
                  onChange={(e) => setFormData({ ...formData, waterAmount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-otherCosts">Chi Phí Khác (VNĐ)</Label>
                <Input
                  id="edit-otherCosts"
                  type="number"
                  defaultValue={selectedInvoice?.otherAmount}
                  onChange={(e) => setFormData({ ...formData, otherAmount: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEdit}>Lưu Thay Đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
