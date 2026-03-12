"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, Shield, CheckCircle, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type UserRole = "LANDLORD" | "TENANT";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

const floatingAnimation = {
  y: [-8, 8, -8],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("LANDLORD");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShake(false);

    try {
      // Use NextAuth signIn with remember me option
      const result = await signIn('credentials', {
        email: formData.email,
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
        // Fetch session to get user role
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();

        if (!session?.user) {
          setError("Không thể lấy thông tin phiên đăng nhập");
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setIsLoading(false);
          return;
        }

        // Verify role matches selection
        if (session.user.role !== selectedRole) {
          const errorMsg = selectedRole === "LANDLORD"
            ? "Tài khoản này không phải là chủ nhà"
            : "Tài khoản này không phải là người thuê";
          setError(errorMsg);
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setIsLoading(false);
          return;
        }

        toast.success("Đăng nhập thành công!");

        // Redirect based on role
        if (session.user.role === "LANDLORD") {
          router.push("/landlord/dashboard");
        } else {
          router.push("/tenant/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Left Side - Hero Image Section */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-600/85 to-purple-700/90 z-10" />

        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=1600&fit=crop"
          alt="Modern apartment building"
          fill
          className="object-cover"
          priority
        />

        {/* Content Overlay */}
        <div className="relative z-20 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            initial="hidden"
            animate="visible"
            variants={fadeInLeft}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Building2 className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold">HouseSea</span>
            </Link>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
                Chào mừng trở lại!
              </h1>
              <p className="text-xl text-white/80 leading-relaxed max-w-md">
                Đăng nhập để quản lý nhà trọ của bạn một cách dễ dàng và hiệu quả.
              </p>
            </motion.div>

            {/* Feature Badges */}
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {[
                { icon: Shield, text: "Bảo mật tuyệt đối" },
                { icon: CheckCircle, text: "Quản lý dễ dàng" },
                { icon: Star, text: "Hỗ trợ 24/7" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-white/90"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.15 }}
                >
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Floating Decorative Elements */}
          <div className="relative">
            {/* Floating Card 1 */}
            <motion.div
              className="absolute -top-32 -right-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
              animate={floatingAnimation}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-400/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Đã xác thực</div>
                  <div className="text-xs text-white/60">100% an toàn</div>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 2 */}
            <motion.div
              className="absolute -top-20 right-40 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
              animate={{
                y: [8, -8, 8],
                transition: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-300" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Đánh giá cao</div>
                  <div className="text-xs text-white/60">4.9/5 sao</div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 pt-8 border-t border-white/20"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {[
                { value: "10K+", label: "Người dùng" },
                { value: "5K+", label: "Tòa nhà" },
                { value: "50K+", label: "Phòng trọ" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl shadow-blue-500/10 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-2">
              <motion.div
                className="flex justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <motion.div
                  className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Building2 className="h-10 w-10 text-white" />
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Đăng Nhập
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Chào mừng bạn quay trở lại HouseSea
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Role Selection */}
              <motion.div
                className="grid grid-cols-2 gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    variant={selectedRole === "LANDLORD" ? "default" : "outline"}
                    className={cn(
                      "h-auto py-4 flex flex-col gap-2 w-full transition-all duration-300",
                      selectedRole === "LANDLORD"
                        ? "ring-2 ring-blue-500 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25"
                        : "hover:border-blue-300 hover:bg-blue-50/50"
                    )}
                    onClick={() => setSelectedRole("LANDLORD")}
                  >
                    <Building2 className="h-6 w-6" />
                    <span className="font-medium">Chủ Nhà</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    variant={selectedRole === "TENANT" ? "default" : "outline"}
                    className={cn(
                      "h-auto py-4 flex flex-col gap-2 w-full transition-all duration-300",
                      selectedRole === "TENANT"
                        ? "ring-2 ring-blue-500 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25"
                        : "hover:border-blue-300 hover:bg-blue-50/50"
                    )}
                    onClick={() => setSelectedRole("TENANT")}
                  >
                    <User className="h-6 w-6" />
                    <span className="font-medium">Người Thuê</span>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {/* Error Message */}
                {error && (
                  <motion.div
                    className={`p-3 rounded-lg bg-red-50 border border-red-200 ${shake ? 'animate-shake' : ''}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
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
                    className={cn(
                      "h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300",
                      error && 'border-red-300 focus-visible:ring-red-500'
                    )}
                  />
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label htmlFor="password" className="text-gray-700 font-medium">Mật Khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setError("");
                    }}
                    required
                    disabled={isLoading}
                    className={cn(
                      "h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300",
                      error && 'border-red-300 focus-visible:ring-red-500'
                    )}
                  />
                </motion.div>

                {/* Remember Me Checkbox */}
                <motion.div
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label 
                    htmlFor="rememberMe" 
                    className="text-sm text-gray-600 cursor-pointer select-none"
                  >
                    Duy trì đăng nhập
                  </Label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Đang đăng nhập...
                        </motion.div>
                      ) : (
                        <span className="flex items-center gap-2">
                          Đăng Nhập
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>

              <motion.div
                className="mt-6 text-center text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <span className="text-muted-foreground">Chưa có tài khoản? </span>
                <Link
                  href="/register"
                  className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </motion.div>

              <motion.div
                className="mt-6 pt-6 border-t border-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
              >
                <p className="text-xs text-center text-muted-foreground">
                  © 2026 HouseSea. Kết nối ngôi nhà của bạn
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
