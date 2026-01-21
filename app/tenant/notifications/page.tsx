"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/use-tenant-id";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function TenantNotificationsPage() {
  const tenantId = useTenantId();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetchNotifications();
    }
  }, [tenantId]);

  const fetchNotifications = async () => {
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/notifications?tenantId=${tenantId}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Fetch notifications error:", error);
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to mark as read");

      toast.success("Đã đánh dấu là đã đọc");
      fetchNotifications();
    } catch (error) {
      console.error("Mark as read error:", error);
      toast.error("Không thể đánh dấu thông báo");
    }
  };

  const handleInvitationResponse = async (action: "accept" | "reject") => {
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/tenants/${tenantId}/invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      if (action === "accept") {
        toast.success("Đã chấp nhận lời mời! Bạn có thể xem thông tin phòng trọ.");
      } else {
        toast.success("Đã từ chối lời mời.");
      }
      
      fetchNotifications();
      // Reload page to update UI
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Invitation response error:", error);
      toast.error(error instanceof Error ? error.message : "Không thể xử lý lời mời");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thông Báo</h1>
          <p className="text-muted-foreground mt-1">
            Các thông báo từ chủ nhà
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-red-100 text-red-700" variant="secondary">
            {unreadCount} chưa đọc
          </Badge>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Chưa Có Thông Báo</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Bạn chưa nhận được thông báo nào
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const isInvitation = notification.title.includes("Lời mời");
            
            return (
              <Card
                key={notification.id}
                className={`${notification.isRead ? "opacity-60" : ""} ${
                  isInvitation && !notification.isRead ? "border-l-4 border-green-500" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {notification.title}
                        {isInvitation && !notification.isRead && (
                          <Badge className="bg-green-100 text-green-700" variant="secondary">
                            Lời mời mới
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && !isInvitation && (
                        <Badge className="bg-blue-100 text-blue-700" variant="secondary">
                          Mới
                        </Badge>
                      )}
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{notification.message}</p>
                  
                  {/* Action buttons for invitation */}
                  {isInvitation && !notification.isRead && (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => handleInvitationResponse("accept")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ✓ Chấp Nhận
                      </Button>
                      <Button 
                        onClick={() => handleInvitationResponse("reject")}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        ✗ Từ Chối
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
