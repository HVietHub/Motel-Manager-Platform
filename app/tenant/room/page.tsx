"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoorOpen, Building2, DollarSign, Coins } from "lucide-react";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/use-tenant-id";

type RoomInfo = {
  roomNumber: string;
  floor: number;
  area: number;
  price: number;
  deposit: number;
  description: string | null;
  building: {
    name: string;
    address: string;
  };
};

export default function TenantRoomPage() {
  const tenantId = useTenantId();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetchRoomInfo();
    }
  }, [tenantId]);

  const fetchRoomInfo = async () => {
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/tenants/${tenantId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Không thể tải thông tin phòng");
      }

      const data = await response.json();
      
      if (data.room && data.room.building) {
        setRoomInfo(data.room);
      } else {
        setRoomInfo(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải thông tin phòng");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!roomInfo) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Chưa Có Phòng</p>
              <p className="text-sm text-muted-foreground mt-2">
                Bạn chưa được phân phòng. Vui lòng liên hệ chủ nhà.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Phòng Của Tôi</h1>
        <p className="text-muted-foreground mt-1">
          Thông tin chi tiết về phòng trọ của bạn
        </p>
      </div>

      {/* Room Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Phòng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <DoorOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Số Phòng</p>
                <p className="text-lg font-medium">{roomInfo.roomNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tầng</p>
                <p className="text-lg font-medium">Tầng {roomInfo.floor}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DoorOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Diện Tích</p>
                <p className="text-lg font-medium">{roomInfo.area} m²</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Tài Chính</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tiền Thuê Hàng Tháng</p>
                <p className="text-lg font-medium text-primary">
                  {formatCurrency(roomInfo.price)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tiền Cọc</p>
                <p className="text-lg font-medium">
                  {formatCurrency(roomInfo.deposit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Building Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Tòa Nhà</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Tên Tòa Nhà</p>
            <p className="text-lg font-medium">{roomInfo.building.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Địa Chỉ</p>
            <p className="text-lg font-medium">{roomInfo.building.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {roomInfo.description && (
        <Card>
          <CardHeader>
            <CardTitle>Mô Tả</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{roomInfo.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
