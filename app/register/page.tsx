"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, CheckCircle, XCircle, Eye, EyeOff, ArrowRight, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";
import { validatePassword, getPasswordStrength } from "@/lib/validation/password-validation";
import { motion, AnimatePresence } from "framer-motion";

type UserRole = "LANDLORD" | "TENANT";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("LANDLORD");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  
  // OTP States
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState("");
  const [otpError, setOtpError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    idCard: "",
    address: "",
    otp: "",
  });

  useEffect(() => {
    // Check for existing cooldown in localStorage
    const savedCooldown = localStorage.getItem("otpCooldown");
    if (savedCooldown) {
      const remainingTime = Math.ceil((parseInt(savedCooldown) - Date.now()) / 1000);
      if (remainingTime > 0) {
        setCountdown(remainingTime);
      } else {
        localStorage.removeItem("otpCooldown");
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("otpCooldown");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const passwordValidation = validatePassword(formData.password);
  const passwordStrength = getPasswordStrength(formData.password);

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSendCode = async () => {
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Vui lòng nhập email hợp lệ!");
      return;
    }
    
    setIsSendingCode(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.error || "Gửi mã thất bại. Vui lòng thử lại.");
        setTimeout(() => setOtpError(""), 5000);
        return;
      }

      setOtpSentMessage("Mã xác thực đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư đến hoặc thư rác.");
      setOtpError("");
      
      // Auto hide after 5 seconds
      setTimeout(() => setOtpSentMessage(""), 5000);
      
      const cooldownEnd = Date.now() + 60 * 1000;
      localStorage.setItem("otpCooldown", cooldownEnd.toString());
      setCountdown(60);
    } catch {
      setOtpError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
      setTimeout(() => setOtpError(""), 5000);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShake(false);

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

    if (!formData.otp) {
      setError("Vui lòng nhập mã xác thực!");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: selectedRole }),
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
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsLoading(false);
    }
  };

  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-[#8b9c38]", "bg-[#8b9c38]"];
  const strengthWidth = formData.password ? `${(passwordStrength.score / 4) * 100}%` : "0%";

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#fafaf8]">

      {/* ── Left panel — form ─────────────────────────────────────── */}
      <div className="w-full lg:w-[52%] flex items-center justify-center p-4 lg:p-8 overflow-hidden">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[#1f2116] mb-0.5">Tạo tài khoản</h2>
            <p className="text-[11px] text-[#64748b]">Bắt đầu quản lý nhà trọ miễn phí ngay hôm nay</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-[#f1f0ec] rounded-xl">
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
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
            {error && (
              <motion.div
                className={cn(
                  "flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600",
                  shake && "animate-shake"
                )}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </motion.div>
            )}

            {/* Row: Họ tên + SĐT */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-medium text-[#1f2116]">Họ và tên</Label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10 text-sm bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20 text-[#1f2116] placeholder:text-[#94a3b8]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-medium text-[#1f2116]">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10 text-sm bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20 text-[#1f2116] placeholder:text-[#94a3b8]"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-medium text-[#1f2116]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
                required
                disabled={isLoading}
                className="h-10 text-sm bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20 text-[#1f2116] placeholder:text-[#94a3b8]"
              />
            </div>

            {/* OTP Code - NEW */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="otp" className="text-xs font-medium text-[#1f2116]">Mã xác thực</Label>
                <AnimatePresence>
                  {otpSentMessage && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-[10px] text-[#8b9c38] font-medium flex items-center gap-1"
                    >
                      <Check className="h-2.5 w-2.5" /> Đã gửi email
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              
              <AnimatePresence>
                {(otpSentMessage || otpError) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                    animate={{ height: "auto", opacity: 1, marginBottom: 8 }}
                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn(
                      "p-2 rounded-lg text-[10px] flex items-start gap-2",
                      otpSentMessage ? "bg-[#8b9c38]/10 text-[#8b9c38] border border-[#8b9c38]/20" : "bg-red-50 text-red-600 border border-red-100"
                    )}>
                      {otpSentMessage ? (
                        <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="leading-tight">{otpSentMessage || otpError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2">
                <Input
                  id="otp"
                  placeholder="Nhập mã 6 số"
                  value={formData.otp}
                  onChange={(e) => update("otp", e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={6}
                  className="h-10 text-sm bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20 text-[#1f2116] placeholder:text-[#94a3b8] flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={countdown > 0 || isSendingCode || isLoading}
                  onClick={handleSendCode}
                  className="h-10 px-3 text-xs font-semibold border-[#e2e0d8] text-[#1f2116] hover:bg-[#f1f0ec] min-w-[100px]"
                >
                  {isSendingCode ? (
                    <motion.span
                      className="w-3 h-3 border-2 border-[#1f2116]/30 border-t-[#1f2116] rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  ) : countdown > 0 ? (
                    `Gửi lại (${countdown}s)`
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="h-3 w-3" />
                      Gửi mã
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-medium text-[#1f2116]">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => update("password", e.target.value)}
                  onFocus={() => setShowPasswordRequirements(true)}
                  required
                  disabled={isLoading}
                  className="h-10 text-sm pr-10 bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20 text-[#1f2116] placeholder:text-[#94a3b8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#1f2116] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </div>

              {/* Strength bar */}
              {formData.password && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-[#e2e0d8] rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", strengthColors[passwordStrength.score])}
                      style={{ width: strengthWidth }}
                    />
                  </div>
                  <span className="text-xs text-[#64748b] w-16 text-right">{passwordStrength.label}</span>
                </div>
              )}

              {/* Requirements */}
              {showPasswordRequirements && formData.password && (
                <motion.div
                  className="p-2 bg-[#f8f7f4] border border-[#e2e0d8] rounded-lg grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] mt-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  {[
                    { test: formData.password.length >= 8,                              label: "8+ ký tự" },
                    { test: /[A-Z]/.test(formData.password),                            label: "Chữ hoa" },
                    { test: /[a-z]/.test(formData.password),                            label: "Chữ thường" },
                    { test: /[0-9]/.test(formData.password),                            label: "Chữ số" },
                    { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password), label: "Ký tự đặc biệt" },
                  ].map((r, i) => (
                    <div key={i} className={cn("flex items-center gap-1.5", r.test ? "text-[#8b9c38]" : "text-[#94a3b8]")}>
                      {r.test
                        ? <CheckCircle className="h-2.5 w-2.5 flex-shrink-0" strokeWidth={2} />
                        : <XCircle className="h-2.5 w-2.5 flex-shrink-0" strokeWidth={2} />
                      }
                      {r.label}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-[#1f2116]">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  required
                  disabled={isLoading}
                  className={cn(
                    "h-10 text-sm pr-10 bg-white border-[#e2e0d8] focus:border-[#fdb549] focus:ring-[#fdb549]/20 text-[#1f2116] placeholder:text-[#94a3b8]",
                    formData.confirmPassword && formData.password !== formData.confirmPassword && "border-red-300"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#1f2116] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </div>
              {/* Match indicator */}
              {formData.confirmPassword && (
                <p className={cn("text-[10px] flex items-center gap-1 mt-0.5",
                  formData.password === formData.confirmPassword ? "text-[#8b9c38]" : "text-red-500"
                )}>
                  {formData.password === formData.confirmPassword
                    ? <><CheckCircle className="h-2.5 w-2.5" strokeWidth={2} /> Mật khẩu khớp</>
                    : <><XCircle className="h-2.5 w-2.5" strokeWidth={2} /> Mật khẩu chưa khớp</>
                  }
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }} className="pt-1">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-semibold bg-[#1f2116] hover:bg-[#31361b] text-white border-0 shadow-sm transition-colors duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    Đang đăng ký...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Tạo tài khoản
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e0d8]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#fafaf8] px-3 text-[10px] text-[#94a3b8]">hoặc</span>
            </div>
          </div>

          <p className="text-center text-sm text-[#64748b]">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-[#ed7307] hover:text-[#bf4514] transition-colors">
              Đăng nhập
            </Link>
          </p>

          <p className="mt-4 text-center text-[10px] text-[#94a3b8]">
            © 2026 HouseSea. Kết nối ngôi nhà của bạn
          </p>
        </motion.div>
      </div>

      {/* ── Right panel — brand visual ────────────────────────────── */}
      <motion.div
        className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-[#1f2116]"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Image
          src="/images/register-hero.webp"
          alt="Landlord and tenant interaction"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f2116] via-[#1f2116]/40 to-transparent z-10" />
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-[#fdb549] to-[#ed7307] z-20" />
        <div className="relative z-20 flex flex-col justify-center p-14 text-white w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-10"
          >
            <div>
              <p className="text-[#fdb549] text-xs font-semibold tracking-widest uppercase mb-4">
                Tại sao chọn HouseSea?
              </p>
              <h2 className="text-4xl font-bold leading-tight text-white mb-4">
                Quản lý nhà trọ<br />
                <span className="text-[#fdb549]">thông minh hơn</span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed max-w-sm">
                Nền tảng số hóa toàn bộ quy trình cho thuê — từ hợp đồng, hóa đơn đến bảo trì.
              </p>
            </div>

            <div className="space-y-5">
              {[
                { title: "Hóa đơn tự động",     desc: "Tính điện, nước, dịch vụ tự động hàng tháng" },
                { title: "Hợp đồng điện tử",    desc: "Tạo và lưu trữ hợp đồng có giá trị pháp lý" },
                { title: "Báo cáo doanh thu",   desc: "Theo dõi công nợ và dự báo doanh thu bằng AI" },
                { title: "Thông báo tức thời",  desc: "Nhắc nhở thanh toán và cập nhật bảo trì" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg border border-[#fdb549]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-[#fdb549]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {[
                { value: "10K+", label: "Người dùng" },
                { value: "5K+",  label: "Tòa nhà" },
                { value: "50K+", label: "Phòng trọ" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-[#fdb549]">{s.value}</div>
                  <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
