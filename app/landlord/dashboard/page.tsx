"use client";
 
import { useEffect, useState } from "react";
import { useLandlordId } from "@/hooks/auth/use-landlord-id";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, DoorOpen, Users, TrendingUp, TrendingDown, LayoutDashboard, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/utils";

export default function DashboardPage() {
  const landlordId = useLandlordId();
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    unpaidInvoices: 0,
    totalDebt: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!landlordId) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `/api/dashboard/stats?landlordId=${landlordId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Không thể tải thống kê");
      } finally {
        setIsLoading(false);
      }
    };

    if (landlordId) {
      fetchStats();
    }
  }, [landlordId]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-[#fdb549] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="p-6 lg:p-8 space-y-8 bg-[#fafaf8] min-h-screen"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.div variants={itemVariants} className="flex items-center gap-2 text-[#ed7307] font-semibold text-sm uppercase tracking-wider mb-1">
            <LayoutDashboard className="h-4 w-4" />
            Tổng quan hệ thống
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-3xl lg:text-4xl font-bold text-[#1f2116]">
            {getGreeting()}, <span className="text-[#ed7307]">{session?.user?.name || "Chủ nhà"}</span> 👋
          </motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground mt-1">
            Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </motion.p>
        </div>
        <motion.div variants={itemVariants} className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-[#e2e0d8]">
          <div className="p-2 bg-[#fdb549]/10 rounded-xl">
            <Calendar className="h-5 w-5 text-[#ed7307]" />
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Cập nhật lúc</p>
            <p className="text-sm font-bold text-[#1f2116]">{new Date().toLocaleTimeString('vi-VN')}</p>
          </div>
        </motion.div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: "Tổng Tòa Nhà", 
            value: stats.totalBuildings, 
            label: "Đang quản lý", 
            icon: Building2, 
            color: "from-[#fdb549] to-[#ed7307]",
            shadow: "shadow-orange-200"
          },
          { 
            title: "Tổng Phòng", 
            value: stats.totalRooms, 
            label: `${stats.availableRooms} trống • ${stats.occupiedRooms} thuê`, 
            icon: DoorOpen, 
            color: "from-[#1f2116] to-[#31361b]",
            shadow: "shadow-slate-200"
          },
          { 
            title: "Người Thuê", 
            value: stats.totalTenants, 
            label: "Đang sinh sống", 
            icon: Users, 
            color: "from-[#8b9c38] to-[#6a7a2a]",
            shadow: "shadow-green-100"
          },
          { 
            title: "Doanh Thu Tháng", 
            value: formatCurrency(stats.monthlyRevenue), 
            label: "Dự kiến tháng này", 
            icon: TrendingUp, 
            color: "from-[#ed7307] to-[#bf4514]",
            shadow: "shadow-red-100",
            isCurrency: true
          },
        ].map((item, i) => (
          <motion.div key={i} variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
            <Card className={cn("border-none shadow-xl h-full overflow-hidden relative group", item.shadow)}>
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", item.color)} />
              <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2 text-white/80">
                <CardTitle className="text-xs font-bold uppercase tracking-wider">
                  {item.title}
                </CardTitle>
                <item.icon className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </CardHeader>
              <CardContent className="relative z-10 text-white">
                <div className={cn("font-bold tracking-tight", item.isCurrency ? "text-xl lg:text-2xl" : "text-4xl")}>
                  {item.value}
                </div>
                <p className="text-xs opacity-70 mt-1 font-medium">{item.label}</p>
              </CardContent>
              {/* Decorative circle */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Financial Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue Breakdown */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="border-none shadow-lg overflow-hidden h-full">
            <CardHeader className="bg-[#f8f7f4] border-b border-[#e2e0d8] flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#1f2116]">
                <div className="p-1.5 bg-[#fdb549]/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-[#ed7307]" />
                </div>
                Dòng tiền & Thu nhập
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-[#ed7307] text-xs font-bold" onClick={() => router.push('/landlord/reports')}>
                Chi tiết <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-[#f8f7f4] rounded-2xl border border-[#e2e0d8]">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Tổng doanh thu dự kiến</p>
                    <p className="text-3xl font-black text-[#1f2116]">{formatCurrency(stats.monthlyRevenue)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-green-100 shadow-sm">
                      <p className="text-[10px] text-green-600 font-bold uppercase mb-1">Đã thu</p>
                      <p className="text-sm font-bold text-[#1f2116]">{formatCurrency(stats.monthlyRevenue - stats.totalDebt)}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-orange-100 shadow-sm">
                      <p className="text-[10px] text-orange-600 font-bold uppercase mb-1">Chưa thu</p>
                      <p className="text-sm font-bold text-[#1f2116]">{formatCurrency(stats.totalDebt)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center p-6 bg-gradient-to-br from-[#1f2116] to-[#31361b] rounded-2xl text-white">
                  <div className="text-center">
                    <p className="text-xs text-white/60 font-bold uppercase mb-2">Tỷ lệ thanh toán</p>
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-24 h-24">
                        <circle className="text-white/10" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                        <circle
                          className="text-[#fdb549]"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - (stats.monthlyRevenue > 0 ? (stats.monthlyRevenue - stats.totalDebt) / stats.monthlyRevenue : 0))}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="48"
                          cy="48"
                        />
                      </svg>
                      <span className="absolute text-xl font-black">
                        {stats.monthlyRevenue > 0 ? Math.round(((stats.monthlyRevenue - stats.totalDebt) / stats.monthlyRevenue) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Debt & Invoices */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-lg h-full">
            <CardHeader className="bg-[#f8f7f4] border-b border-[#e2e0d8]">
              <CardTitle className="flex items-center gap-2 text-[#1f2116]">
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                Công nợ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Tổng nợ chưa thu</p>
                  <p className="text-2xl font-black text-red-600">{formatCurrency(stats.totalDebt)}</p>
                </div>
                <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f8f7f4] rounded-xl border border-[#e2e0d8]">
                  <span className="text-xs font-bold text-[#1f2116]">Hóa đơn chờ</span>
                  <span className="text-sm font-black text-red-600">{stats.unpaidInvoices}</span>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 border-dashed">
                  <p className="text-[10px] text-orange-700 font-black uppercase mb-1">Ghi chú</p>
                  <p className="text-[10px] text-orange-600 font-medium">Cần gửi nhắc nhở thanh toán cho {stats.unpaidInvoices} người thuê.</p>
                </div>
              </div>
              <Button className="w-full bg-[#1f2116] hover:bg-[#31361b] text-white text-xs font-bold h-10" onClick={() => router.push('/landlord/invoices')}>
                Quản lý hóa đơn
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Room Occupancy */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-[#f8f7f4] border-b border-[#e2e0d8]">
            <CardTitle className="flex items-center gap-2 text-[#1f2116]">
              <div className="p-1.5 bg-[#fdb549]/10 rounded-lg">
                <DoorOpen className="h-4 w-4 text-[#ed7307]" />
              </div>
              Tình trạng lấp đầy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#e2e0d8] shadow-sm">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Trống</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-green-600">{stats.availableRooms}</span>
                    <span className="text-[10px] text-muted-foreground mb-1 font-bold">phòng</span>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#e2e0d8] shadow-sm">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Đã thuê</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-[#ed7307]">{stats.occupiedRooms}</span>
                    <span className="text-[10px] text-muted-foreground mb-1 font-bold">phòng</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#fdb549] to-[#ed7307] rounded-2xl shadow-lg md:col-span-2 text-white">
                  <p className="text-[10px] text-white/80 font-bold uppercase mb-2">Tỷ lệ lấp đầy</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-black">
                      {stats.totalRooms > 0 ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.totalRooms > 0 ? (stats.occupiedRooms / stats.totalRooms) * 100 : 0}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
