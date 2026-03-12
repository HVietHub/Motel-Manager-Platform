"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  Shield,
  Clock,
  Smartphone,
  ArrowRight,
  Star,
  Zap,
  Lock,
  Bell,
  Wrench,
  ChevronDown,
  MessageCircle,
  X,
  Send
} from "lucide-react";
import {
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  StaggerContainer,
  StaggerItem,
  Floating,
  AnimatedCounter,
  HoverCard,
  GlowPulse,
  BouncingArrow,
  ScaleIn,
} from "@/components/ui/motion";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: 'Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng đăng nhập để sử dụng chatbot hoặc thử lại sau.' 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Header */}
      <motion.header
        className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              HouseSea
            </span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-6">
            {["Giới Thiệu", "Tính Năng", "Quy Tắc", "Bảng Giá"].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item === "Giới Thiệu" ? "gioi-thieu" : item === "Tính Năng" ? "tinh-nang" : item === "Quy Tắc" ? "quy-tac" : "bang-gia"}`}
                className="text-gray-600 hover:text-gray-900 transition-colors relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
                whileHover={{ y: -2 }}
              >
                {item}
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </nav>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost">Đăng Nhập</Button>
              </motion.div>
            </Link>
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Đăng Ký Miễn Phí
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="h-4 w-4" />
              Nền tảng quản lý nhà trọ #1 Việt Nam
            </motion.div>

            <motion.h1
              className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">
                HouseSea
              </span>
              <br />
              <motion.span
                className="text-4xl lg:text-5xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Kết Nối Phòng Trọ Thông Minh
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Giải pháp quản lý nhà trọ toàn diện - Kết nối chủ nhà và người thuê.
              Quản lý hợp đồng, hóa đơn, bảo trì một cách dễ dàng, nhanh chóng và hiệu quả.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/register">
                <GlowPulse>
                  <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Bắt Đầu Miễn Phí
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </GlowPulse>
              </Link>
              <Link href="#gioi-thieu">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Tìm Hiểu Thêm
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              className="flex items-center gap-8 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-3xl font-bold text-blue-600">
                  <AnimatedCounter value={10} suffix="K+" duration={2} />
                </div>
                <div className="text-sm text-gray-500">Người dùng</div>
              </motion.div>
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-3xl font-bold text-indigo-600">
                  <AnimatedCounter value={5} suffix="K+" duration={2} />
                </div>
                <div className="text-sm text-gray-500">Tòa nhà</div>
              </motion.div>
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-3xl font-bold text-purple-600">
                  <AnimatedCounter value={50} suffix="K+" duration={2} />
                </div>
                <div className="text-sm text-gray-500">Phòng trọ</div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl opacity-20" style={{ filter: 'blur(24px)' }} />
            <Floating duration={4} distance={10}>
              <Image
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
                alt="Modern apartment building"
                width={800}
                height={600}
                className="relative rounded-2xl shadow-2xl"
                priority
              />
            </Floating>

            {/* Floating badges */}
            <motion.div
              className="absolute -left-4 top-1/4 bg-white p-4 rounded-xl shadow-lg"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <Floating duration={3} distance={5}>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Đã xác thực</div>
                    <div className="text-xs text-gray-500">100% an toàn</div>
                  </div>
                </div>
              </Floating>
            </motion.div>

            <motion.div
              className="absolute -right-4 bottom-1/4 bg-white p-4 rounded-xl shadow-lg"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <Floating duration={2.5} distance={5}>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Tăng trưởng</div>
                    <div className="text-xs text-gray-500">+25% / tháng</div>
                  </div>
                </div>
              </Floating>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="flex justify-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <BouncingArrow className="text-gray-400" />
        </motion.div>
      </section>

      {/* Introduction Section */}
      <section id="gioi-thieu" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Giới Thiệu Về HouseSea
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              HouseSea là nền tảng quản lý nhà trọ hiện đại, được thiết kế dành riêng cho thị trường Việt Nam.
              Chúng tôi giúp số hóa và tối ưu hóa toàn bộ quy trình cho thuê phòng trọ.
            </p>
          </FadeInUp>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <SlideInLeft delay={0.1}>
                <HoverCard className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <motion.div
                    className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Shield className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Sứ Mệnh</h3>
                    <p className="text-gray-600">
                      Mang đến giải pháp công nghệ tiên tiến, giúp chủ nhà và người thuê kết nối,
                      quản lý và giao dịch một cách minh bạch, an toàn và tiện lợi nhất.
                    </p>
                  </div>
                </HoverCard>
              </SlideInLeft>

              <SlideInLeft delay={0.2}>
                <HoverCard className="flex items-start gap-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <motion.div
                    className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Star className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Tầm Nhìn</h3>
                    <p className="text-gray-600">
                      Trở thành nền tảng quản lý nhà trọ số 1 Việt Nam, phục vụ hàng triệu
                      chủ nhà và người thuê trên toàn quốc vào năm 2030.
                    </p>
                  </div>
                </HoverCard>
              </SlideInLeft>

              <SlideInLeft delay={0.3}>
                <HoverCard className="flex items-start gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <motion.div
                    className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Users className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Giá Trị Cốt Lõi</h3>
                    <p className="text-gray-600">
                      Minh bạch - Tiện lợi - Bảo mật - Hỗ trợ tận tâm. Chúng tôi đặt
                      lợi ích của người dùng lên hàng đầu trong mọi quyết định.
                    </p>
                  </div>
                </HoverCard>
              </SlideInLeft>
            </div>

            <SlideInRight>
              <div className="relative">
                <Floating duration={5} distance={8}>
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
                    alt="Beautiful apartment interior"
                    width={800}
                    height={600}
                    className="rounded-2xl shadow-xl"
                  />
                </Floating>
              </div>
            </SlideInRight>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="tinh-nang" className="container mx-auto px-4 py-20">
        <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6">Tính Năng Nổi Bật</h2>
          <p className="text-xl text-gray-600">
            Đầy đủ công cụ giúp bạn quản lý nhà trọ hiệu quả
          </p>
        </FadeInUp>

        <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Building2, title: "Quản Lý Tòa Nhà", desc: "Quản lý nhiều tòa nhà và phòng trọ với thông tin chi tiết về diện tích, tiện nghi, giá thuê.", color: "from-blue-500 to-blue-600" },
            { icon: Users, title: "Quản Lý Người Thuê", desc: "Lưu trữ thông tin người thuê, theo dõi lịch sử thuê trọ và thanh toán dễ dàng.", color: "from-green-500 to-green-600" },
            { icon: FileText, title: "Hóa Đơn Tự Động", desc: "Tự động tạo hóa đơn điện, nước, tiền thuê hàng tháng và gửi thông báo cho người thuê.", color: "from-purple-500 to-purple-600" },
            { icon: TrendingUp, title: "Báo Cáo Doanh Thu", desc: "Xem báo cáo doanh thu, công nợ chi tiết với biểu đồ trực quan, dễ hiểu.", color: "from-orange-500 to-orange-600" },
            { icon: Bell, title: "Thông Báo Tức Thời", desc: "Gửi và nhận thông báo về hóa đơn, bảo trì, thông tin quan trọng ngay lập tức.", color: "from-cyan-500 to-cyan-600" },
            { icon: Wrench, title: "Yêu Cầu Bảo Trì", desc: "Người thuê gửi yêu cầu sửa chữa, chủ nhà theo dõi và xử lý nhanh chóng.", color: "from-red-500 to-red-600" },
            { icon: Lock, title: "Hợp Đồng Điện Tử", desc: "Tạo và lưu trữ hợp đồng thuê trọ điện tử, tiện lợi và có giá trị pháp lý.", color: "from-indigo-500 to-indigo-600" },
            { icon: Smartphone, title: "Đa Nền Tảng", desc: "Sử dụng mọi lúc, mọi nơi trên điện thoại, máy tính bảng hoặc máy tính.", color: "from-pink-500 to-pink-600" },
          ].map((feature, index) => (
            <StaggerItem key={index}>
              <HoverCard className="bg-white p-8 rounded-2xl shadow-sm border h-full">
                <motion.div
                  className={`h-14 w-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Rules Section */}
      <section id="quy-tac" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Quy Tắc & Điều Khoản
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Để đảm bảo trải nghiệm tốt nhất cho tất cả người dùng, vui lòng tuân thủ các quy tắc sau
            </p>
          </FadeInUp>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Quy tắc cho Chủ nhà */}
            <SlideInLeft>
              <HoverCard className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Building2 className="h-6 w-6 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-blue-900">Dành Cho Chủ Nhà</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    { title: "Thông tin chính xác:", desc: "Cung cấp thông tin phòng trọ đầy đủ, chính xác về diện tích, giá thuê, tiện nghi." },
                    { title: "Hình ảnh thực tế:", desc: "Chỉ sử dụng hình ảnh thực tế của phòng trọ, không chỉnh sửa quá mức." },
                    { title: "Phản hồi kịp thời:", desc: "Phản hồi yêu cầu từ người thuê trong vòng 24 giờ." },
                    { title: "Minh bạch chi phí:", desc: "Công khai tất cả các khoản phí trước khi ký hợp đồng." },
                    { title: "Bảo trì định kỳ:", desc: "Đảm bảo phòng trọ luôn trong tình trạng tốt, xử lý sự cố nhanh chóng." },
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.div whileHover={{ scale: 1.2 }}>
                        <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <div>
                        <strong className="text-gray-900">{item.title}</strong>
                        <span className="text-gray-600"> {item.desc}</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </HoverCard>
            </SlideInLeft>

            {/* Quy tắc cho Người thuê */}
            <SlideInRight>
              <HoverCard className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Users className="h-6 w-6 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-green-900">Dành Cho Người Thuê</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    { title: "Thanh toán đúng hạn:", desc: "Thanh toán tiền thuê và các chi phí đúng thời hạn quy định." },
                    { title: "Giữ gìn tài sản:", desc: "Bảo quản phòng trọ và các trang thiết bị trong phòng cẩn thận." },
                    { title: "Tuân thủ nội quy:", desc: "Nghiêm túc chấp hành nội quy tòa nhà và quy định của chủ nhà." },
                    { title: "Thông báo sự cố:", desc: "Báo ngay cho chủ nhà khi phát hiện hư hỏng hoặc sự cố." },
                    { title: "Thông báo khi rời đi:", desc: "Thông báo trước ít nhất 30 ngày nếu muốn chấm dứt hợp đồng." },
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.div whileHover={{ scale: 1.2 }}>
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <div>
                        <strong className="text-gray-900">{item.title}</strong>
                        <span className="text-gray-600"> {item.desc}</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </HoverCard>
            </SlideInRight>
          </div>

          {/* Quy tắc chung */}
          <FadeInUp delay={0.3} className="mt-8">
            <HoverCard className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Shield className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-purple-900">Quy Tắc Chung</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Không chia sẻ thông tin đăng nhập cho người khác",
                  "Tôn trọng quyền riêng tư của người dùng khác",
                  "Cung cấp thông tin cá nhân chính xác khi đăng ký",
                  "Giao tiếp lịch sự, văn minh trên nền tảng",
                  "Không sử dụng nền tảng cho mục đích bất hợp pháp",
                  "Báo cáo các hành vi vi phạm cho đội ngũ hỗ trợ",
                ].map((rule, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center gap-3 list-none"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <motion.div whileHover={{ scale: 1.2 }}>
                      <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    </motion.div>
                    <span className="text-gray-600">{rule}</span>
                  </motion.li>
                ))}
              </div>
            </HoverCard>
          </FadeInUp>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6">Cách Thức Hoạt Động</h2>
          <p className="text-xl text-gray-600">
            Bắt đầu sử dụng HouseSea chỉ với 3 bước đơn giản
          </p>
        </FadeInUp>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: 1, title: "Đăng Ký Tài Khoản", desc: "Tạo tài khoản miễn phí với email hoặc số điện thoại trong vài phút.", gradient: "from-blue-600 to-indigo-600", lineGradient: "from-blue-300 to-indigo-300" },
            { step: 2, title: "Thiết Lập Thông Tin", desc: "Chủ nhà thêm tòa nhà, phòng trọ. Người thuê được mời vào phòng.", gradient: "from-indigo-600 to-purple-600", lineGradient: "from-indigo-300 to-purple-300" },
            { step: 3, title: "Bắt Đầu Quản Lý", desc: "Quản lý hợp đồng, hóa đơn, bảo trì mọi lúc mọi nơi trên nền tảng.", gradient: "from-purple-600 to-pink-600", lineGradient: "" },
          ].map((item, index) => (
            <ScaleIn key={index} delay={index * 0.2}>
              <div className="text-center">
                <div className="relative">
                  <motion.div
                    className={`h-20 w-20 bg-gradient-to-r ${item.gradient} rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white`}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.step}
                  </motion.div>
                  {item.lineGradient && (
                    <motion.div
                      className={`hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r ${item.lineGradient}`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
                      viewport={{ once: true }}
                      style={{ transformOrigin: "left" }}
                    />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </ScaleIn>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="bang-gia" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Bảng Giá Dịch Vụ
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Chọn gói phù hợp với nhu cầu của bạn
            </p>
          </FadeInUp>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <ScaleIn delay={0}>
              <HoverCard className="bg-white p-8 rounded-2xl border-2 border-gray-200 h-full">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Miễn Phí</h3>
                  <div className="text-4xl font-bold text-gray-900">0đ</div>
                  <div className="text-gray-500">/ tháng</div>
                </div>
                <ul className="space-y-4 mb-8">
                  {["Tối đa 1 tòa nhà", "2-3 phòng", "Quản lý hợp đồng cơ bản", "Hóa đơn thủ công"].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full" size="lg">
                      Dùng Thử Ngay
                    </Button>
                  </motion.div>
                </Link>
              </HoverCard>
            </ScaleIn>

            {/* Pro Plan */}
            <ScaleIn delay={0.1}>
              <motion.div
                className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-2xl text-white shadow-2xl relative h-full"
                whileHover={{ scale: 1.02 }}
                initial={{ scale: 1.05 }}
              >
                <motion.div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-pink-500 px-4 py-1 rounded-full text-sm font-semibold"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Phổ Biến Nhất
                </motion.div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Cơ Bản</h3>
                  <div className="text-4xl font-bold">100.000đ</div>
                  <div className="text-blue-100">/ tháng</div>
                </div>
                <ul className="space-y-4 mb-8">
                  {["3-5 tòa nhà", "2-3 phòng mỗi tòa", "Hóa đơn tự động", "Báo cáo chi tiết", "Hỗ trợ ưu tiên"].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className="h-5 w-5 text-white" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full bg-white text-blue-600 hover:bg-gray-100" size="lg">
                      Bắt Đầu Ngay
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </ScaleIn>

            {/* Enterprise Plan */}
            <ScaleIn delay={0.2}>
              <HoverCard className="bg-white p-8 rounded-2xl border-2 border-gray-200 h-full">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Siêu Cấp</h3>
                  <div className="text-4xl font-bold text-gray-900">200.000đ</div>
                  <div className="text-gray-500">/ tháng</div>
                </div>
                <ul className="space-y-4 mb-8">
                  {["Không giới hạn tòa nhà", "Không giới hạn phòng", "Tích hợp API", "Quản lý đội nhóm", "Hỗ trợ 24/7"].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="w-full" size="lg">
                    Liên Hệ Tư Vấn
                  </Button>
                </motion.div>
              </HoverCard>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6">Khách Hàng Nói Gì?</h2>
          <p className="text-xl text-gray-600">
            Hơn 10,000 người dùng đang tin tưởng sử dụng HouseSea
          </p>
        </FadeInUp>

        <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Nguyễn Văn Hùng",
              role: "Chủ nhà - Hà Nội",
              initials: "NV",
              comment: "HouseSea giúp tôi quản lý 20 phòng trọ dễ dàng hơn bao giờ hết. Tạo hóa đơn tự động tiết kiệm rất nhiều thời gian!",
              gradient: "from-blue-500 to-indigo-500"
            },
            {
              name: "Trần Thị Lan",
              role: "Người thuê - TP.HCM",
              initials: "TL",
              comment: "Là người thuê, tôi thích cách HouseSea giúp tôi xem hóa đơn và gửi yêu cầu sửa chữa một cách nhanh chóng.",
              gradient: "from-green-500 to-emerald-500"
            },
            {
              name: "Phạm Minh Đức",
              role: "Chủ nhà - Đà Nẵng",
              initials: "PM",
              comment: "Báo cáo doanh thu chi tiết giúp tôi theo dõi công nợ và lập kế hoạch tài chính cho các tòa nhà của mình.",
              gradient: "from-purple-500 to-pink-500"
            },
          ].map((testimonial, index) => (
            <StaggerItem key={index}>
              <HoverCard className="bg-white p-8 rounded-2xl shadow-sm border h-full">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`h-12 w-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold`}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    {testimonial.initials}
                  </motion.div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">Câu Hỏi Thường Gặp</h2>
          </FadeInUp>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "HouseSea có miễn phí không?", a: "Có! HouseSea cung cấp gói miễn phí cho chủ nhà có dưới 5 phòng trọ. Bạn có thể nâng cấp lên gói Chuyên Nghiệp hoặc Doanh Nghiệp khi cần nhiều tính năng hơn." },
              { q: "Làm sao để thêm người thuê vào phòng?", a: "Sau khi tạo phòng, bạn có thể gửi lời mời cho người thuê qua email hoặc số điện thoại. Người thuê sẽ nhận được thông báo và có thể đăng ký tài khoản để xem thông tin phòng." },
              { q: "Dữ liệu của tôi có được bảo mật không?", a: "Chắc chắn! HouseSea sử dụng mã hóa SSL và tuân thủ các tiêu chuẩn bảo mật cao nhất. Dữ liệu của bạn được bảo vệ tuyệt đối và không được chia sẻ cho bên thứ ba." },
              { q: "Tôi có thể hủy gói đăng ký không?", a: "Có, bạn có thể hủy gói đăng ký bất cứ lúc nào. Sau khi hủy, bạn vẫn có thể sử dụng các tính năng của gói miễn phí. Dữ liệu của bạn sẽ được lưu trữ an toàn." },
            ].map((faq, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <motion.details
                  className="group bg-gray-50 rounded-xl p-6"
                  whileHover={{ scale: 1.01 }}
                >
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg">
                    {faq.q}
                    <motion.div
                      className="transition-transform group-open:rotate-180"
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.div>
                  </summary>
                  <motion.p
                    className="mt-4 text-gray-600"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    {faq.a}
                  </motion.p>
                </motion.details>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <ScaleIn>
          <motion.div
            className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />

            <h2 className="text-4xl font-bold mb-6 relative z-10">
              Sẵn Sàng Bắt Đầu?
            </h2>
            <p className="text-xl text-blue-100 mb-8 relative z-10">
              Đăng ký ngay hôm nay và trải nghiệm quản lý nhà trọ hiện đại.
              Miễn phí 30 ngày, không cần thẻ tín dụng!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="text-lg px-12 bg-white text-blue-600 hover:bg-gray-100">
                    Đăng Ký Miễn Phí
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10">
                    Đã Có Tài Khoản?
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </ScaleIn>
      </section>

      {/* Footer */}
      <motion.footer
        className="border-t bg-gray-900 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <FadeInUp delay={0}>
              <div>
                <motion.div
                  className="flex items-center gap-2 mb-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <Building2 className="h-8 w-8 text-blue-400" />
                  <span className="text-2xl font-bold">HouseSea</span>
                </motion.div>
                <p className="text-gray-400">
                  Nền tảng quản lý nhà trọ thông minh hàng đầu Việt Nam.
                </p>
              </div>
            </FadeInUp>

            {[
              { title: "Sản Phẩm", links: [{ name: "Tính năng", href: "#tinh-nang" }, { name: "Bảng giá", href: "#bang-gia" }, { name: "Cập nhật", href: "#" }] },
              { title: "Hỗ Trợ", links: [{ name: "Trung tâm hỗ trợ", href: "#" }, { name: "Hướng dẫn sử dụng", href: "#" }, { name: "Liên hệ", href: "#" }] },
              { title: "Pháp Lý", links: [{ name: "Điều khoản sử dụng", href: "#" }, { name: "Chính sách bảo mật", href: "#" }, { name: "Quy tắc cộng đồng", href: "#quy-tac" }] },
            ].map((section, sectionIndex) => (
              <FadeInUp key={section.title} delay={0.1 * (sectionIndex + 1)}>
                <div>
                  <h4 className="font-semibold text-lg mb-4">{section.title}</h4>
                  <ul className="space-y-2 text-gray-400">
                    {section.links.map((link, linkIndex) => (
                      <motion.li key={link.name} whileHover={{ x: 5 }}>
                        <a href={link.href} className="hover:text-white transition-colors">
                          {link.name}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </FadeInUp>
            ))}
          </div>
          <motion.div
            className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p>&copy; 2026 HouseSea. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>

      {/* Chatbot Button */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white z-50"
          >
            <MessageCircle className="h-7 w-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">HouseSea Assistant</h3>
                  <p className="text-xs text-blue-100">Trợ lý ảo của bạn</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => setInputMessage('Giới thiệu về HouseSea')}
                      className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                    >
                      📖 Giới thiệu về HouseSea
                    </button>
                    <button
                      onClick={() => setInputMessage('Các gói dịch vụ')}
                      className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                    >
                      💎 Các gói dịch vụ
                    </button>
                  </div>
                </div>
              )}
              
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
