"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/use-landlord-id";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const landlordId = useLandlordId();
  const [landlord, setLandlord] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (session?.user && landlordId) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
        address: "",
      });
      fetchLandlordInfo(landlordId);
    } else {
      setIsLoading(false);
    }
  }, [session, landlordId]);

  const fetchLandlordInfo = async (landlordId: string) => {
    try {
      // TODO: Create API endpoint to get landlord info
      // For now, use data from session
      if (session?.user) {
        setFormData({
          name: session.user.name || "",
          email: session.user.email || "",
          phone: "",
          address: "",
        });
      }
    } catch (error) {
      console.error("Error fetching landlord info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Create API endpoint to update landlord info
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  const handleChangePassword = () => {
    toast.info("Chức năng đổi mật khẩu đang được phát triển");
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Thông Tin Cá Nhân</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Thông Tin Tài Khoản</CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Chỉnh Sửa</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>Lưu Thay Đổi</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{session?.user?.name}</h3>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Vai trò: Chủ Nhà
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6 pt-6 border-t">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Họ và Tên
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email không thể thay đổi
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Số Điện Thoại
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Chưa cập nhật"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa Chỉ
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Chưa cập nhật"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bảo Mật</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mật Khẩu</p>
              <p className="text-sm text-muted-foreground">
                Thay đổi mật khẩu của bạn
              </p>
            </div>
            <Button variant="outline" onClick={handleChangePassword}>
              Đổi Mật Khẩu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Thống Kê Hoạt Động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">Tòa Nhà</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-muted-foreground">Phòng Trọ</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-muted-foreground">Người Thuê</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
