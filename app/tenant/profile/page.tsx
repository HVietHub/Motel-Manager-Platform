"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, CreditCard, MapPin, Copy, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/auth/use-tenant-id";
import { NeonText } from "@/components/shared/neon-text";

export default function TenantProfilePage() {
  const tenantId = useTenantId();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
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

  const handleChangePassword = async () => {
    if (!session?.user?.id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Đổi mật khẩu thành công!");
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.error || "Không thể đổi mật khẩu");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Đã xảy ra lỗi");
    }
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
                <NeonText 
                  text={tenantData.name} 
                  plan={session?.user?.subscriptionPlan}
                  className="font-medium"
                />
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

      {/* Change Password Card */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" />
            Đổi Mật Khẩu
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!isChangingPassword ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bảo mật tài khoản của bạn bằng cách thay đổi mật khẩu định kỳ
              </p>
              <Button onClick={() => setIsChangingPassword(true)}>
                Đổi Mật Khẩu
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleChangePassword}>
                  Xác Nhận Đổi Mật Khẩu
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
