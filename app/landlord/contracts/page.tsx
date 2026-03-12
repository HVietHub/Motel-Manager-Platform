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
import { Plus, Search, Pencil, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/use-landlord-id";

type ContractStatus = "ACTIVE" | "EXPIRED" | "TERMINATED" | "PENDING";

type Contract = {
  id: string;
  tenantId: string;
  roomId: string;
  tenantName: string;
  roomNumber: string;
  buildingName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  status: ContractStatus;
  terms?: string;
};

type Tenant = {
  id: string;
  user: {
    name: string;
  };
  room?: {
    roomNumber: string;
  };
};

type Room = {
  id: string;
  roomNumber: string;
  building: {
    name: string;
  };
  status: string;
};

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const landlordId = useLandlordId();
  const [formData, setFormData] = useState({
    tenantId: "",
    roomId: "",
    startDate: "",
    endDate: "",
    rentAmount: "",
    depositAmount: "",
    terms: "",
  });

  useEffect(() => {
    if (landlordId) {
      fetchContracts();
      fetchTenants();
      fetchRooms();
    }
  }, [landlordId]);

  const fetchContracts = async () => {
    try {
      if (!landlordId) {
        return;
      }

      const response = await fetch(`/api/contracts?landlordId=${landlordId}`);
      if (!response.ok) throw new Error("Failed to fetch contracts");

      const data = await response.json();
      const formattedContracts = data.map((contract: any) => ({
        id: contract.id,
        tenantId: contract.tenantId,
        roomId: contract.roomId,
        tenantName: contract.tenant.user.name,
        roomNumber: contract.room.roomNumber,
        buildingName: contract.room.building.name,
        startDate: contract.startDate,
        endDate: contract.endDate,
        rentAmount: contract.rentAmount,
        depositAmount: contract.depositAmount,
        status: contract.status,
        terms: contract.terms,
      }));
      setContracts(formattedContracts);
    } catch (error) {
      console.error("Fetch contracts error:", error);
      toast.error("Không thể tải danh sách hợp đồng");
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

  const fetchRooms = async () => {
    try {
      if (!landlordId) return;

      // Fetch all rooms (not just AVAILABLE) so we can create contracts for occupied rooms too
      const response = await fetch(`/api/rooms?landlordId=${landlordId}`);
      if (!response.ok) throw new Error("Failed to fetch rooms");

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Fetch rooms error:", error);
    }
  };

  const getStatusBadge = (status: ContractStatus) => {
    const variants = {
      ACTIVE: { label: "Đang Hiệu Lực", className: "bg-green-100 text-green-700" },
      PENDING: { label: "Chưa Bắt Đầu", className: "bg-yellow-100 text-yellow-700" },
      EXPIRED: { label: "Hết Hạn", className: "bg-gray-100 text-gray-700" },
      TERMINATED: { label: "Đã Hủy", className: "bg-red-100 text-red-700" },
    };
    const variant = variants[status];
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.buildingName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    try {
      if (!landlordId) {
        return;
      }

      if (!formData.tenantId || !formData.roomId || !formData.startDate || !formData.endDate || !formData.rentAmount) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId,
          tenantId: formData.tenantId,
          roomId: formData.roomId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          rentAmount: parseFloat(formData.rentAmount),
          depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : 0,
          terms: formData.terms,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create contract");
      }

      toast.success("Tạo hợp đồng thành công!");
      setIsCreateDialogOpen(false);
      setFormData({
        tenantId: "",
        roomId: "",
        startDate: "",
        endDate: "",
        rentAmount: "",
        depositAmount: "",
        terms: "",
      });
      fetchContracts();
      fetchRooms(); // Refresh available rooms
    } catch (error: any) {
      console.error("Create contract error:", error);
      toast.error(error.message || "Không thể tạo hợp đồng");
    }
  };

  const handleEdit = async () => {
    try {
      if (!landlordId || !selectedContract) {
        return;
      }

      const response = await fetch(`/api/contracts/${selectedContract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId,
          startDate: formData.startDate || selectedContract.startDate,
          endDate: formData.endDate || selectedContract.endDate,
          rentAmount: formData.rentAmount ? parseFloat(formData.rentAmount) : selectedContract.rentAmount,
          depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : selectedContract.depositAmount,
          terms: formData.terms || selectedContract.terms,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update contract");
      }

      toast.success("Cập nhật hợp đồng thành công!");
      setIsEditDialogOpen(false);
      setSelectedContract(null);
      setFormData({
        tenantId: "",
        roomId: "",
        startDate: "",
        endDate: "",
        rentAmount: "",
        depositAmount: "",
        terms: "",
      });
      fetchContracts();
    } catch (error: any) {
      console.error("Update contract error:", error);
      toast.error(error.message || "Không thể cập nhật hợp đồng");
    }
  };

  const handleTerminate = async (contract: Contract) => {
    if (contract.status !== "ACTIVE") {
      toast.error("Chỉ có thể hủy hợp đồng đang hiệu lực!");
      return;
    }

    try {
      if (!landlordId) {
        return;
      }

      const response = await fetch(`/api/contracts/${contract.id}/terminate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to terminate contract");
      }

      toast.success("Hủy hợp đồng thành công! Phòng đã được giải phóng.");
      fetchContracts();
      fetchRooms(); // Refresh available rooms
    } catch (error: any) {
      console.error("Terminate contract error:", error);
      toast.error(error.message || "Không thể hủy hợp đồng");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Hợp Đồng</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý hợp đồng thuê trọ
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Hợp Đồng
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Hợp Đồng</CardTitle>
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
                <SelectItem value="PENDING">Chưa Bắt Đầu</SelectItem>
                <SelectItem value="ACTIVE">Đang Hiệu Lực</SelectItem>
                <SelectItem value="EXPIRED">Hết Hạn</SelectItem>
                <SelectItem value="TERMINATED">Đã Hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người Thuê</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Ngày Bắt Đầu</TableHead>
                  <TableHead>Ngày Kết Thúc</TableHead>
                  <TableHead className="text-right">Tiền Thuê</TableHead>
                  <TableHead className="text-right">Tiền Cọc</TableHead>
                  <TableHead className="text-center">Trạng Thái</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {searchQuery || statusFilter !== "all"
                          ? "Không tìm thấy hợp đồng nào"
                          : "Chưa có hợp đồng nào"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.tenantName}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contract.roomNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {contract.buildingName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(contract.startDate).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(contract.rentAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(contract.depositAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(contract.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {contract.status === "ACTIVE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTerminate(contract)}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
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
            <DialogTitle>Tạo Hợp Đồng Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin hợp đồng thuê trọ
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
                        {tenant.room && ` (Đang ở ${tenant.room.roomNumber})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Phòng</Label>
                <Select value={formData.roomId} onValueChange={(value) => setFormData({ ...formData, roomId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.roomNumber} - {room.building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày Bắt Đầu</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày Kết Thúc</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Tiền Thuê Hàng Tháng (VNĐ)</Label>
                <Input 
                  id="monthlyRent" 
                  type="number" 
                  placeholder="2500000" 
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">Tiền Cọc (VNĐ)</Label>
                <Input 
                  id="deposit" 
                  type="number" 
                  placeholder="5000000" 
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Điều Khoản (Tùy chọn)</Label>
              <textarea
                id="terms"
                className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nhập các điều khoản hợp đồng..."
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo Hợp Đồng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Hợp Đồng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin hợp đồng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Ngày Bắt Đầu</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  defaultValue={selectedContract?.startDate?.split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">Ngày Kết Thúc</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  defaultValue={selectedContract?.endDate?.split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-monthlyRent">Tiền Thuê Hàng Tháng (VNĐ)</Label>
                <Input
                  id="edit-monthlyRent"
                  type="number"
                  defaultValue={selectedContract?.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-deposit">Tiền Cọc (VNĐ)</Label>
                <Input
                  id="edit-deposit"
                  type="number"
                  defaultValue={selectedContract?.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-terms">Điều Khoản</Label>
              <textarea
                id="edit-terms"
                className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nhập các điều khoản hợp đồng..."
                defaultValue={selectedContract?.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              />
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
