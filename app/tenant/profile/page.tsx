"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, CreditCard, MapPin, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/use-tenant-id";

export default function TenantProfilePage() {
  const tenantId = useTenantId();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [tenantData, setTenantData] = useState({
    name: "",
    email: "",
    phone: "",
    idCard: "",
    address: "",
    roomNumber: "",
    buildingName: "",
    userCode: "",
  });
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    idCard: "",
  });

  useEffect(() => {
    if (tenantId) {
      fetchTenantProfile();
    }
  }, [tenantId]);

  const fetchTenantProfile = async () => {
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/tenants/${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        const profileData = {
          name: data.user?.name || "",
          email: data.user?.email || "",
          phone: data.phone || "",
          idCard: data.idCard || "",
          address: data.address || "",
          roomNumber: data.room?.roomNumber || "",
          buildingName: data.room?.building?.name || "",
          userCode: data.userCode || "",
        };
        setTenantData(profileData);
        setEditData({
          name: profileData.name,
          phone: profileData.phone,
          idCard: profileData.idCard,
        });
      } else {
        toast.error("Không thể tải thông tin cá nhân");
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast.error("Đã xảy ra lỗi khi tải thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          phone: editData.phone,
          idCard: editData.idCard,
        }),
      });

      if (response.ok) {
        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);
        fetchTenantProfile();
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể cập nhật thông tin");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Thông Tin Cá Nhân
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Chỉnh Sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setEditData({
                name: tenantData.name,
                phone: tenantData.phone,
                idCard: tenantData.idCard,
              });
            }}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              Lưu Thay Đổi
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Thông Tin Tài Khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Họ và Tên
            </Label>
            {isEditing ? (
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{tenantData.name}</p>
              </div>
            )}
          </div>

          {/* User Code - Read Only */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Mã Người Dùng
              <Badge variant="secondary" className="ml-2">Không thể thay đổi</Badge>
            </Label>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-mono font-bold text-blue-700">{tenantData.userCode || "Đang tải..."}</p>
              {tenantData.userCode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(tenantData.userCode, "Mã người dùng")}
                >
                  {copiedField === "Mã người dùng" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Email - Read Only */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
              <Badge variant="secondary" className="ml-2">Không thể thay đổi</Badge>
            </Label>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{tenantData.email}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(tenantData.email, "Email")}
              >
                {copiedField === "Email" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Chia sẻ email này với chủ nhà để được mời vào quản lý
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Số Điện Thoại
            </Label>
            {isEditing ? (
              <Input
                id="phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{tenantData.phone}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(tenantData.phone, "Số điện thoại")}
                >
                  {copiedField === "Số điện thoại" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* ID Card */}
          <div className="space-y-2">
            <Label htmlFor="idCard" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              CMND/CCCD
            </Label>
            {isEditing ? (
              <Input
                id="idCard"
                value={editData.idCard}
                onChange={(e) => setEditData({ ...editData, idCard: e.target.value })}
              />
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{tenantData.idCard || "Chưa cập nhật"}</p>
                {tenantData.idCard && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(tenantData.idCard, "CMND/CCCD")}
                  >
                    {copiedField === "CMND/CCCD" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Room Info Card */}
      {tenantData.roomNumber && (
        <Card className="border-none shadow-lg border-l-4 border-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Thông Tin Phòng Trọ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Tòa Nhà</p>
                <p className="text-xl font-bold text-blue-700">{tenantData.buildingName}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Số Phòng</p>
                <p className="text-xl font-bold text-indigo-700">{tenantData.roomNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card for Landlord Invitation */}
      {!tenantData.roomNumber && (
        <Card className="border-none shadow-lg border-l-4 border-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Chưa có phòng trọ</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Để được chủ nhà mời vào quản lý, hãy chia sẻ email của bạn với chủ nhà:
                </p>
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <code className="flex-1 font-mono text-sm">{tenantData.email}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(tenantData.email, "Email")}
                  >
                    {copiedField === "Email" ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Sao chép
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
