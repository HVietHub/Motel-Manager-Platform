"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/use-landlord-id";

type Tenant = {
  id: string;
  user: {
    name: string;
  };
  room?: {
    roomNumber: string;
  };
};

export default function NotificationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const landlordId = useLandlordId();
  const [formData, setFormData] = useState({
    tenantId: "",
    title: "",
    message: "",
  });
  const [broadcastData, setBroadcastData] = useState({
    title: "",
    message: "",
  });

  useEffect(() => {
    if (landlordId) {
      fetchTenants();
    }
  }, [landlordId]);

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

  const handleCreateNotification = async () => {
    try {
      if (!landlordId) {
        return;
      }

      if (!formData.tenantId || !formData.title || !formData.message) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId,
          tenantId: formData.tenantId,
          title: formData.title,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create notification");
      }

      toast.success("Gửi thông báo thành công!");
      setIsCreateDialogOpen(false);
      setFormData({ tenantId: "", title: "", message: "" });
    } catch (error: any) {
      console.error("Create notification error:", error);
      toast.error(error.message || "Không thể gửi thông báo");
    }
  };

  const handleBroadcastNotification = async () => {
    try {
      if (!landlordId) {
        return;
      }

      if (!broadcastData.title || !broadcastData.message) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      const response = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId,
          title: broadcastData.title,
          message: broadcastData.message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to broadcast notification");
      }

      const result = await response.json();
      toast.success(`Gửi thông báo đến ${result.count} người thuê thành công!`);
      setIsBroadcastDialogOpen(false);
      setBroadcastData({ title: "", message: "" });
    } catch (error: any) {
      console.error("Broadcast notification error:", error);
      toast.error(error.message || "Không thể gửi thông báo");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Thông Báo</h1>
          <p className="text-muted-foreground mt-1">
            Gửi thông báo đến người thuê
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBroadcastDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            Gửi Tất Cả
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Gửi Thông Báo
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gửi Thông Báo Cá Nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gửi thông báo đến một người thuê cụ thể về các vấn đề như thanh toán,
              bảo trì, hoặc thông tin quan trọng khác.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Tạo Thông Báo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gửi Thông Báo Chung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gửi thông báo đến tất cả người thuê về các thông tin chung như
              bảo trì hệ thống, thay đổi quy định, hoặc sự kiện.
            </p>
            <Button onClick={() => setIsBroadcastDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Gửi Broadcast
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Create Notification Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gửi Thông Báo Cá Nhân</DialogTitle>
            <DialogDescription>
              Tạo thông báo gửi đến một người thuê cụ thể
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenant">Người Nhận</Label>
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
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu Đề</Label>
              <Input 
                id="title" 
                placeholder="Nhập tiêu đề thông báo" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Nội Dung</Label>
              <textarea
                id="message"
                className="w-full min-h-[150px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nhập nội dung thông báo..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateNotification}>
              <Send className="mr-2 h-4 w-4" />
              Gửi Thông Báo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Broadcast Notification Dialog */}
      <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gửi Thông Báo Chung</DialogTitle>
            <DialogDescription>
              Tạo thông báo gửi đến tất cả người thuê
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="broadcast-title">Tiêu Đề</Label>
              <Input 
                id="broadcast-title" 
                placeholder="Nhập tiêu đề thông báo" 
                value={broadcastData.title}
                onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="broadcast-message">Nội Dung</Label>
              <textarea
                id="broadcast-message"
                className="w-full min-h-[150px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nhập nội dung thông báo..."
                value={broadcastData.message}
                onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Thông báo này sẽ được gửi đến tất cả người thuê
                hiện tại của bạn ({tenants.length} người).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBroadcastDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleBroadcastNotification}>
              <Users className="mr-2 h-4 w-4" />
              Gửi Đến Tất Cả
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
