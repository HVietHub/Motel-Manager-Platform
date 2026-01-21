import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Users, FileText, TrendingUp, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              HomeLink
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Đăng Nhập</Button>
            </Link>
            <Link href="/register">
              <Button>Đăng Ký Miễn Phí</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              HomeLink
            </span>
            <br />
            <span className="text-4xl">Kết Nối Phòng Trọ Của Bạn</span>
          </h1>
          <p className="text-xl text-gray-600">
            Nền tảng quản lý nhà trọ thông minh - Kết nối chủ nhà và người thuê.
            Quản lý hợp đồng, hóa đơn, bảo trì một cách dễ dàng và hiệu quả.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Bắt Đầu Ngay
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Đăng Nhập
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tính Năng Nổi Bật
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quản Lý Tòa Nhà</h3>
            <p className="text-gray-600">
              Quản lý nhiều tòa nhà và phòng trọ một cách dễ dàng
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quản Lý Người Thuê</h3>
            <p className="text-gray-600">
              Theo dõi thông tin người thuê và hợp đồng thuê trọ
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Hóa Đơn Tự Động</h3>
            <p className="text-gray-600">
              Tạo và quản lý hóa đơn điện nước, tiền thuê tự động
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Báo Cáo Doanh Thu</h3>
            <p className="text-gray-600">
              Xem báo cáo doanh thu và công nợ chi tiết
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Dễ Sử Dụng
                  </h3>
                  <p className="text-gray-600">
                    Giao diện thân thiện, dễ dàng sử dụng cho cả chủ nhà và người thuê
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Bảo Mật Cao
                  </h3>
                  <p className="text-gray-600">
                    Dữ liệu được mã hóa và bảo mật tuyệt đối
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Hỗ Trợ 24/7
                  </h3>
                  <p className="text-gray-600">
                    Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Miễn Phí Dùng Thử
                  </h3>
                  <p className="text-gray-600">
                    Dùng thử miễn phí 30 ngày, không cần thẻ tín dụng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">
            Sẵn Sàng Bắt Đầu?
          </h2>
          <p className="text-xl text-gray-600">
            Đăng ký ngay hôm nay và trải nghiệm quản lý nhà trọ hiện đại
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-12">
              Đăng Ký Miễn Phí
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 HomeLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
