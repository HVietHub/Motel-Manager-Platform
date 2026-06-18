"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, Shield, CheckCircle, Star, ArrowRight, Eye, EyeOff, TrendingUp, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";
import { motion } from "framer-motion";

type UserRole = "LANDLORD" | "TENANT";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("LANDLORD");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [formTouched, setFormTouched] = useState({
    email: false,
    password: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShake(false);

    setFormTouched({ email: true, password: true });

    if (!formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin email và mật khẩu.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!normalizedEmail.endsWith("@gmail.com")) {
      setError("Vui lòng đăng nhập bằng địa chỉ Gmail hợp lệ, ví dụ: tenban@gmail.com.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password: formData.password,
        rememberMe: formData.rememberMe,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        const sessionResponse = await fetch("/api/auth/session");
        const session = await sessionResponse.json();

        if (!session?.user) {
          setError("Không thể lấy thông tin phiên đăng nhập");
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setIsLoading(false);
          return;
        }

        if (session.user.role !== "ADMIN" && session.user.role !== selectedRole) {
          await signOut({ redirect: false });

          const errorMsg =
            selectedRole === "LANDLORD"
              ? "Tài khoản này không phải là chủ nhà"
              : "Tài khoản này không phải là người thuê";
          setError(errorMsg);
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setIsLoading(false);
          return;
        }

        toast.success("Đăng nhập thành công!");
        router.push(
          session.user.role === "ADMIN"
            ? "/admin/dashboard"
            : session.user.role === "LANDLORD"
              ? "/landlord/dashboard"
              : "/tenant/dashboard"
        );
      }
    } catch {
      setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#1f2116]">

      {/* ── Left panel — brand visual ─────────────────────────────── */}
      <motion.div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Overlay gradient — deep olive → transparent */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1f2116]/95 via-[#31361b]/80 to-[#1f2116]/60 z-10" />

        {/* Background photo */}
        <Image
          src="/images/login-hero.webp"
          alt="Modern apartment building"
          fill
          className="object-cover"
          priority
        />

        {/* Amber accent line top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fdb549] to-[#ed7307] z-20" />

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-between p-12 text-white w-full">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
              <div className="p-1.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                <img src="/icon.webp" alt="HouseSea" width={30} height={30} className="rounded-lg" />
              </div>
              <span className="text-xl font-bold tracking-tight">HouseSea</span>
            </Link>
          </motion.div>

          {/* Headline */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              <p className="text-[#fdb549] text-sm font-semibold tracking-widest uppercase mb-4">
                Nền tảng quản lý nhà trọ
              </p>
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
                Chào mừng<br />trở lại!
              </h1>
              <p className="text-white/70 text-lg leading-relaxed max-w-sm">
                Đăng nhập để quản lý nhà trọ của bạn một cách dễ dàng và hiệu quả.
              </p>
            </motion.div>

            {/* Feature list — icon line style */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              {[
                { icon: Shield,       text: "Bảo mật tuyệt đối với mã hóa SSL" },
                { icon: CheckCircle,  text: "Quản lý hợp đồng & hóa đơn tự động" },
                { icon: Star,         text: "Hỗ trợ 24/7 — đánh giá 4.9/5 sao" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 text-white/85"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + i * 0.12 }}
                >
                  <f.icon className="h-4 w-4 text-[#fdb549] flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-sm">{f.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Stats + floating cards */}
          <div className="relative">
            {/* Floating card 1 */}
            <motion.div
              className="absolute -top-28 right-0 bg-white/8 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 shadow-xl"
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="h-5 w-5 text-[#8b9c38]" strokeWidth={1.75} />
                <div>
                  <div className="font-semibold text-xs">Đã xác thực</div>
                  <div className="text-[10px] text-white/50">100% an toàn</div>
                </div>
              </div>
            </motion.div>

            {/* Floating card 2 */}
            <motion.div
              className="absolute -top-14 right-36 bg-white/8 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 shadow-xl"
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-5 w-5 text-[#fdb549]" strokeWidth={1.75} />
                <div>
                  <div className="font-semibold text-xs">Tăng trưởng</div>
                  <div className="text-[10px] text-white/50">+25% / tháng</div>
                </div>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="flex gap-8 pt-8 border-t border-white/15"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {[
                { value: "10K+", label: "Người dùng" },
                { value: "5K+",  label: "Tòa nhà" },
                { value: "50K+", label: "Phòng trọ" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-[#fdb549]">{s.value}</div>
                  <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Right panel — login form ───────────────────────────────── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 lg:p-12 bg-[#fafaf8]">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <img src="/icon.webp" alt="HouseSea" width={28} height={28} className="rounded-lg" />
            <span className="text-lg font-bold text-[#1f2116]">HouseSea</span>
          </div>

          {/* Header */}
          <div className="mb-8 rounded-3xl border border-white bg-white/80 p-6 shadow-sm shadow-[#1f2116]/5 backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdb549]/15 text-[#ed7307]">
              <Shield className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h2 className="text-3xl font-bold text-[#1f2116] mb-2">Đăng nhập</h2>
            <p className="text-sm leading-6 text-[#64748b]">Chào mừng bạn quay trở lại. Vui lòng sử dụng tài khoản Gmail để tiếp tục.</p>
          </div>

          {/* Role selector */}
          <motion.div
            className="grid grid-cols-2 gap-2.5 mb-7 p-1 bg-[#f1f0ec] rounded-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {(["LANDLORD", "TENANT"] as UserRole[]).map((role) => {
              const active = selectedRole === role;
              return (
                <motion.button
                  key={role}
                  type="button"
                  onClick={() => { setSelectedRole(role); setError(""); }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-white text-[#1f2116] shadow-sm border border-[#e2e0d8]"
                      : "text-[#64748b] hover:text-[#1f2116]"
                  )}
                >
                  {role === "LANDLORD"
                    ? <Building2 className={cn("h-4 w-4", active ? "text-[#fdb549]" : "")} strokeWidth={1.75} />
                    : <User className={cn("h-4 w-4", active ? "text-[#fdb549]" : "")} strokeWidth={1.75} />
                  }
                  {role === "LANDLORD" ? "Chủ Nhà" : "Người Thuê"}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {/* Error */}
            {error && (
              <motion.div
                className={cn(
                  "flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm",
                  shake && "animate-shake"
                )}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
              >
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertCircle className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="leading-6">{error}</span>
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-[#1f2116]">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" strokeWidth={1.75} />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder="tenban@gmail.com"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(""); }}
                  onFocus={() => setFormTouched({ ...formTouched, email: true })}
                  disabled={isLoading}
                  className={cn(
                    "h-12 rounded-xl bg-white pl-10 border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20 text-[#1f2116] placeholder:text-[#94a3b8] transition-colors",
                    error && "border-red-300 focus-visible:ring-red-400/20"
                  )}
                />
              </div>
              <p className="text-xs leading-5 text-[#64748b]">Chỉ hỗ trợ email có đuôi @gmail.com.</p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-[#1f2116]">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(""); }}
                  onFocus={() => setFormTouched({ ...formTouched, password: true })}
                  disabled={isLoading}
                  className={cn(
                    "h-12 rounded-xl pr-10 bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20 text-[#1f2116] placeholder:text-[#94a3b8] transition-colors",
                    error && "border-red-300 focus-visible:ring-red-400/20"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#1f2116] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                    : <Eye className="h-4 w-4" strokeWidth={1.75} />
                  }
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-[#e2e0d8] text-[#fdb549] focus:ring-[#fdb549]/30 cursor-pointer accent-[#fdb549]"
                />
                <Label htmlFor="rememberMe" className="text-sm text-[#64748b] cursor-pointer select-none">
                  Duy trì đăng nhập
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-[#ed7307] hover:text-[#bf4514] transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit */}
            <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl text-sm font-semibold bg-[#1f2116] hover:bg-[#31361b] text-white border-0 shadow-lg shadow-[#1f2116]/10 transition-colors duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    Đang đăng nhập...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Đăng nhập
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e0d8]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#fafaf8] px-3 text-xs text-[#94a3b8]">hoặc</span>
            </div>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-[#64748b]">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#ed7307] hover:text-[#bf4514] transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-[#94a3b8]">
            © 2026 HouseSea. Kết nối ngôi nhà của bạn
          </p>
        </motion.div>
      </div>
    </div>
  );
}
