"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/use-tenant-id";

type MaintenanceStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type Priority = "LOW" | "MEDIUM" | "HIGH";

type MaintenanceRequest = {
  id: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: Priority;
  createdAt: string;
  completedAt: string | null;
};

export default function TenantMaintenancePage() {
  const tenantId = useTenantId();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as Priority,
  });

  useEffect(() => {
    if (tenantId) {
      fetchMaintenanceRequests();
    }
  }, [tenantId]);

  const fetchMaintenanceRequests = async () => {
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/maintenance?tenantId=${tenantId}`);
      if (!response.ok) throw new Error("Failed to fetch maintenance requests");

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Fetch maintenance requests error:", error);
      toast.error("Không thể tải danh sách yêu cầu bảo trì");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!tenantId) return;

    try {
      if (!formData.title || !formData.description) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      // Get tenant info to get roomId
      const tenantResponse = await fetch(`/api/tenants/${tenantId}`);
      if (!tenantResponse.ok) {
        throw new Error("Không thể lấy thông tin người thuê");
      }
      const tenantData = await tenantResponse.json();
      
      if (!tenantData.roomId) {
        toast.error("Bạn chưa được phân phòng. Vui lòng liên hệ chủ nhà.");
        return;
      }

      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          roomId: tenantData.roomId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create maintenance request");
      }

      toast.success("Tạo yêu cầu bảo trì thành công!");
      setIsCreateDialogOpen(false);
      setFormData({ title: "", description: "", priority: "MEDIUM" });
      fetchMaintenanceRequests();
    } catch (error: any) {
      console.error("Create maintenance request error:", error);
      toast.error(error.message || "Không thể tạo yêu cầu bảo trì");
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

  const getPriorityBadge = (priority: Priority) => {
    const variants = {
      LOW: { label: "Thấp", className: "bg-gray-100 text-gray-700" },
      MEDIUM: { label: "Trung Bình", className: "bg-blue-100 text-blue-700" },
      HIGH: { label: "Cao", className: "bg-red-100 text-red-700" },
    };
    const variant = variants[priority];
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Yêu Cầu Bảo Trì</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý yêu cầu sửa chữa và bảo trì
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Yêu Cầu
        </Button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Chưa Có Yêu Cầu</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Bạn chưa tạo yêu cầu bảo trì nào
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tạo lúc: {new Date(request.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(request.priority)}
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{request.description}</p>
                {request.completedAt && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Hoàn thành lúc: {new Date(request.completedAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo Yêu Cầu Bảo Trì</DialogTitle>
            <DialogDescription>
              Mô tả vấn đề cần sửa chữa hoặc bảo trì
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu Đề</Label>
              <Input
                id="title"
                placeholder="Ví dụ: Vòi nước bị hỏng"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Mức Độ Ưu Tiên</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Thấp</SelectItem>
                  <SelectItem value="MEDIUM">Trung Bình</SelectItem>
                  <SelectItem value="HIGH">Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô Tả Chi Tiết</Label>
              <textarea
                id="description"
                className="w-full min-h-[150px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Mô tả chi tiết vấn đề cần sửa chữa..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo Yêu Cầu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
