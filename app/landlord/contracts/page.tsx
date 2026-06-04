"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Plus, Search, Pencil, XCircle, FileText, X, Download } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/auth/use-landlord-id";
import { ContractForm, ContractFormData } from "@/components/forms/contract-form";
import { uploadContractFile } from "@/lib/utils/file-upload";

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
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
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
  price: number;
  building: {
    name: string;
  };
  status: string;
};

export default function ContractsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantIdFilter = searchParams.get("tenantId");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const landlordId = useLandlordId();

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
        fileUrl: contract.fileUrl,
        fileName: contract.fileName,
        fileType: contract.fileType,
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
    const matchesTenant = !tenantIdFilter || contract.tenantId === tenantIdFilter;
    return matchesSearch && matchesStatus && matchesTenant;
  });

  const handleCreate = async (data: ContractFormData) => {
    try {
      if (!landlordId) {
        return;
      }

      setIsSubmitting(true);

      let fileUrl, fileName, fileType;
      if (data.contractFile) {
        const uploadResult = await uploadContractFile(data.contractFile);
        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
        fileType = uploadResult.fileType;
      }

      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId,
          tenantId: data.tenantId,
          roomId: data.roomId,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          rentAmount: 0,
          depositAmount: 0,
          terms: "",
          fileUrl,
          fileName,
          fileType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create contract");
      }

      toast.success("Thêm hợp đồng thành công!");
      setIsCreateDialogOpen(false);
      fetchContracts();
      fetchRooms();
    } catch (error: any) {
      console.error("Create contract error:", error);
      toast.error(error.message || "Không thể thêm hợp đồng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: ContractFormData) => {
    try {
      if (!selectedContract) {
        return;
      }

      if (!data.contractFile) {
        toast.error("Vui lòng chọn file hợp đồng");
        return;
      }

      setIsSubmitting(true);

      const uploadResult = await uploadContractFile(data.contractFile);

      toast.success("Cập nhật file hợp đồng thành công!");
      setIsEditDialogOpen(false);
      setSelectedContract(null);
      fetchContracts();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Không thể upload file");
    } finally {
      setIsSubmitting(false);
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
          Thêm Hợp Đồng
        </Button>
      </div>

      {/* Tenant filter banner */}
      {tenantIdFilter && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <FileText className="h-4 w-4 shrink-0" />
          <span>
            Đang lọc hợp đồng của:{" "}
            <span className="font-semibold">
              {filteredContracts[0]?.tenantName ?? tenantIdFilter}
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 w-6 p-0 text-blue-700 hover:text-blue-900 hover:bg-blue-100"
            onClick={() => router.push("/landlord/contracts")}
            title="Xóa bộ lọc"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Search and Filter */}
      <Card>        <CardHeader>
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
                  <TableHead className="text-center">File</TableHead>
                  <TableHead className="text-center">Trạng Thái</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
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
                      <TableCell className="text-center">
                        {contract.fileUrl ? (
                          <a
                            href={contract.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Download className="h-4 w-4" />
                            <span className="text-xs">{contract.fileName}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Hợp Đồng</DialogTitle>
            <DialogDescription>
              Chọn người thuê, phòng và tải lên file hợp đồng
            </DialogDescription>
          </DialogHeader>
          <ContractForm
            tenants={tenants.map(t => ({
              id: t.id,
              user: { name: t.user.name, email: '' },
              room: t.room ? { roomNumber: t.room.roomNumber } : null,
            }))}
            rooms={rooms}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isSubmitting}
            submitLabel="Thêm Hợp Đồng"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập Nhật File Hợp Đồng</DialogTitle>
            <DialogDescription>
              Thay đổi file hợp đồng
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <ContractForm
              tenants={tenants.map(t => ({
                id: t.id,
                user: { name: t.user.name, email: '' },
                room: t.room ? { roomNumber: t.room.roomNumber } : null,
              }))}
              rooms={rooms}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedContract(null);
              }}
              isLoading={isSubmitting}
              submitLabel="Cập Nhật"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
