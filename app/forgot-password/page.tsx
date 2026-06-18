"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";
import { motion } from "framer-motion";

type UserRole = "LANDLORD" | "TENANT";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("LANDLORD");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Không thể gửi mã xác nhận");
        return;
      }

      toast.success(data.message || "Mã xác nhận đã được gửi");
      setStep("reset");
    } catch {
      setError("Đã xảy ra lỗi khi gửi mã. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          role: selectedRole,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Không thể đặt lại mật khẩu");
        return;
      }

      toast.success(data.message || "Đặt lại mật khẩu thành công");
      router.push("/login");
    } catch {
      setError("Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8] p-6">
      <motion.div
        className="w-full max-w-[440px] bg-white rounded-2xl border border-[#e2e0d8] shadow-sm p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#1f2116] mb-8">
          <ArrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </Link>

        <div className="mb-7">
          <h1 className="text-3xl font-bold text-[#1f2116] mb-2">Quên mật khẩu</h1>
          <p className="text-sm text-[#64748b]">
            {step === "email" ? "Nhập email đã đăng ký để nhận mã xác nhận" : "Nhập mã xác nhận và mật khẩu mới"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-7 p-1 bg-[#f1f0ec] rounded-xl">
          {(["LANDLORD", "TENANT"] as UserRole[]).map((role) => {
            const active = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => { setSelectedRole(role); setError(""); }}
                disabled={step === "reset" || isLoading}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed",
                  active ? "bg-white text-[#1f2116] shadow-sm border border-[#e2e0d8]" : "text-[#64748b] hover:text-[#1f2116]"
                )}
              >
                {role === "LANDLORD" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                {role === "LANDLORD" ? "Chủ Nhà" : "Người Thuê"}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-[#1f2116]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(""); }}
                required
                disabled={isLoading}
                className="h-11 bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-11 bg-[#1f2116] hover:bg-[#31361b] text-white">
              {isLoading ? "Đang gửi mã..." : "Gửi mã xác nhận"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-sm font-medium text-[#1f2116]">Mã xác nhận</Label>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={formData.otp}
                onChange={(e) => { setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "") }); setError(""); }}
                required
                disabled={isLoading}
                className="h-11 bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20 tracking-[0.35em] text-center"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-medium text-[#1f2116]">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => { setFormData({ ...formData, newPassword: e.target.value }); setError(""); }}
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="h-11 pr-10 bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#1f2116]">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setError(""); }}
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="h-11 pr-10 bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 bg-[#1f2116] hover:bg-[#31361b] text-white">
              {isLoading ? "Đang đặt lại..." : <span className="flex items-center gap-2">Đặt lại mật khẩu <ArrowRight className="h-4 w-4" /></span>}
            </Button>
            <button type="button" onClick={() => setStep("email")} disabled={isLoading} className="w-full text-sm text-[#ed7307] hover:text-[#bf4514]">
              Gửi lại mã xác nhận
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
