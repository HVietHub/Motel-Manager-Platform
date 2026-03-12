"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { validatePassword, getPasswordStrength } from "@/lib/password-validation";

type UserRole = "LANDLORD" | "TENANT";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("LANDLORD");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    idCard: "",
    address: "",
  });

  const passwordValidation = validatePassword(formData.password);
  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShake(false);

    // Validation
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Đăng ký thất bại");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setIsLoading(false);
        return;
      }

      toast.success("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setError("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="flex justify-center mb-4 hover:opacity-80 transition-opacity">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </Link>
          <Link href="/">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
              HouseSea
            </CardTitle>
          </Link>
          <CardDescription className="text-base">
            Tạo tài khoản để bắt đầu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              type="button"
              variant={selectedRole === "LANDLORD" ? "default" : "outline"}
              className={cn(
                "h-auto py-4 flex flex-col gap-2",
                selectedRole === "LANDLORD" && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedRole("LANDLORD")}
            >
              <Building2 className="h-6 w-6" />
              <span className="font-medium">Chủ Nhà</span>
            </Button>
            <Button
              type="button"
              variant={selectedRole === "TENANT" ? "default" : "outline"}
              className={cn(
                "h-auto py-4 flex flex-col gap-2",
                selectedRole === "TENANT" && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedRole("TENANT")}
            >
              <User className="h-6 w-6" />
              <span className="font-medium">Người Thuê</span>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg bg-red-50 border border-red-200 ${shake ? 'animate-shake' : ''}`}>
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và Tên</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  setError("");
                }}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setError("");
                }}
                required
                disabled={isLoading}
                className={error && error.includes("email") ? 'border-red-300 focus-visible:ring-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số Điện Thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0901234567"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  setError("");
                }}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật Khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError("");
                }}
                onFocus={() => setShowPasswordRequirements(true)}
                required
                disabled={isLoading}
                className={error && error.includes("Mật khẩu") ? 'border-red-300 focus-visible:ring-red-500' : ''}
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-300", passwordStrength.color)}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{passwordStrength.label}</span>
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {showPasswordRequirements && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-xs">
                  <p className="font-medium text-gray-700">Yêu cầu mật khẩu:</p>
                  <div className="space-y-1">
                    <div className={cn("flex items-center gap-2", formData.password.length >= 8 ? "text-green-600" : "text-gray-500")}>
                      {formData.password.length >= 8 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>Ít nhất 8 ký tự</span>
                    </div>
                    <div className={cn("flex items-center gap-2", /[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-500")}>
                      {/[A-Z]/.test(formData.password) ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>Một chữ cái viết hoa</span>
                    </div>
                    <div className={cn("flex items-center gap-2", /[a-z]/.test(formData.password) ? "text-green-600" : "text-gray-500")}>
                      {/[a-z]/.test(formData.password) ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>Một chữ cái viết thường</span>
                    </div>
                    <div className={cn("flex items-center gap-2", /[0-9]/.test(formData.password) ? "text-green-600" : "text-gray-500")}>
                      {/[0-9]/.test(formData.password) ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>Một chữ số</span>
                    </div>
                    <div className={cn("flex items-center gap-2", /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "text-green-600" : "text-gray-500")}>
                      {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>Một ký tự đặc biệt (!@#$%...)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setError("");
                }}
                required
                disabled={isLoading}
                className={error && error.includes("không khớp") ? 'border-red-300 focus-visible:ring-red-500' : ''}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Đã có tài khoản? </span>
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Đăng nhập
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              © 2026 HouseSea. Kết nối ngôi nhà của bạn
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
