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
import { Search, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/use-landlord-id";

type MaintenanceStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type MaintenanceRequest = {
  id: string;
  tenantName: string;
  roomNumber: string;
  buildingName: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: string;
  createdAt: string;
  completedAt: string | null;
};

export default function MaintenancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const landlordId = useLandlordId();
  const [newStatus, setNewStatus] = useState<MaintenanceStatus>("PENDING");

  useEffect(() => {
    if (landlordId) {
      fetchMaintenanceRequests();
    }
  }, [landlordId]);

  const fetchMaintenanceRequests = async () => {
    try {
      if (!landlordId) {
        return;
      }

      const response = await fetch(`/api/maintenance?landlordId=${landlordId}`);
      if (!response.ok) throw new Error("Failed to fetch maintenance requests");

      const data = await response.json();
      const formattedRequests = data.map((request: any) => ({
        id: request.id,
        tenantName: request.tenant.user.name,
        roomNumber: request.tenant.room?.roomNumber || "N/A",
        buildingName: request.tenant.room?.building?.name || "N/A",
        title: request.title,
        description: request.description,
        status: request.status,
        priority: request.priority,
        createdAt: request.createdAt,
        completedAt: request.completedAt,
      }));
      setRequests(formattedRequests);
    } catch (error) {
      console.error("Fetch maintenance requests error:", error);
      toast.error("Không thể tải danh sách yêu cầu bảo trì");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    const variants = {
      PENDING: { label: "Chờ Xử Lý", className: "bg-yellow-100 text-yellow-700" },
      IN_PROGRESS: { label: "Đang Xử Lý", className: "bg-blue-100 text-blue-700" },
      COMPLETED: { label: "Hoàn Thành", className: "bg-green-100 text-green-700" },
      CANCELLED: { label: "Đã Hủy", className: "bg-gray-100 text-gray-700" },
    };
    const variant = variants[status];
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: any = {
      LOW: { label: "Thấp", className: "bg-gray-100 text-gray-700" },
      MEDIUM: { label: "Trung Bình", className: "bg-blue-100 text-blue-700" },
      HIGH: { label: "Cao", className: "bg-red-100 text-red-700" },
    };
    const variant = variants[priority] || variants.MEDIUM;
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async () => {
    try {
      if (!landlordId || !selectedRequest) {
        return;
      }

      const response = await fetch(`/api/maintenance/${selectedRequest.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      toast.success("Cập nhật trạng thái thành công!");
      setIsUpdateStatusDialogOpen(false);
      setSelectedRequest(null);
      fetchMaintenanceRequests();
    } catch (error: any) {
      console.error("Update status error:", error);
      toast.error(error.message || "Không thể cập nhật trạng thái");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Bảo Trì</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý yêu cầu bảo trì từ người thuê
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Yêu Cầu Bảo Trì</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên người thuê, phòng, tiêu đề..."
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
                <SelectItem value="PENDING">Chờ Xử Lý</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang Xử Lý</SelectItem>
                <SelectItem value="COMPLETED">Hoàn Thành</SelectItem>
                <SelectItem value="CANCELLED">Đã Hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người Yêu Cầu</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Tiêu Đề</TableHead>
                  <TableHead>Mô Tả</TableHead>
                  <TableHead className="text-center">Ưu Tiên</TableHead>
                  <TableHead className="text-center">Ngày Tạo</TableHead>
                  <TableHead className="text-center">Trạng Thái</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {searchQuery || statusFilter !== "all"
                          ? "Không tìm thấy yêu cầu nào"
                          : "Chưa có yêu cầu bảo trì nào"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.tenantName}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.roomNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {request.buildingName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.description}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPriorityBadge(request.priority)}
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setNewStatus(request.status);
                            setIsUpdateStatusDialogOpen(true);
                          }}
                        >
                          Cập Nhật
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập Nhật Trạng Thái</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái yêu cầu bảo trì
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tiêu Đề</Label>
              <p className="text-sm font-medium">{selectedRequest?.title}</p>
            </div>
            <div className="space-y-2">
              <Label>Mô Tả</Label>
              <p className="text-sm text-muted-foreground">
                {selectedRequest?.description}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Ưu Tiên</Label>
              <p className="text-sm">{getPriorityBadge(selectedRequest?.priority || "MEDIUM")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng Thái</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as MaintenanceStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chờ Xử Lý</SelectItem>
                  <SelectItem value="IN_PROGRESS">Đang Xử Lý</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn Thành</SelectItem>
                  <SelectItem value="CANCELLED">Đã Hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateStatusDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateStatus}>Cập Nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
