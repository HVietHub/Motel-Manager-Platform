# 🏠 HouseSea - Nền Tảng Quản Lý Nhà Trọ Thông Minh

**Kết nối chủ nhà và người thuê - Quản lý nhà trọ dễ dàng, hiệu quả**

HouseSea là nền tảng quản lý nhà trọ toàn diện, giúp chủ nhà và người thuê quản lý mọi khía cạnh của việc cho thuê nhà trọ một cách dễ dàng và hiệu quả.

## ✨ Tính Năng

### Dành cho Chủ Nhà
- 🏢 **Quản lý tòa nhà và phòng trọ**: Theo dõi nhiều tòa nhà, phòng trọ với thông tin chi tiết
- 👥 **Quản lý người thuê**: Lưu trữ thông tin người thuê, lịch sử thuê trọ
- 📝 **Quản lý hợp đồng**: Tạo, cập nhật và theo dõi hợp đồng thuê trọ
- 💰 **Quản lý hóa đơn**: Tạo hóa đơn tự động, theo dõi thanh toán
- 🔔 **Gửi thông báo**: Thông báo đến người thuê về hóa đơn, bảo trì
- 🔧 **Quản lý bảo trì**: Theo dõi yêu cầu bảo trì từ người thuê
- 📊 **Báo cáo doanh thu**: Xem báo cáo doanh thu, công nợ chi tiết

### Dành cho Người Thuê
- 🏠 **Xem thông tin phòng**: Thông tin chi tiết về phòng đang thuê
- 📄 **Xem hợp đồng**: Theo dõi hợp đồng thuê trọ
- 💳 **Xem hóa đơn**: Kiểm tra hóa đơn hàng tháng
- 🔔 **Nhận thông báo**: Nhận thông báo từ chủ nhà
- 🛠️ **Yêu cầu bảo trì**: Gửi yêu cầu sửa chữa, bảo trì

## 🚀 Công Nghệ

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite với Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Authentication**: Custom JWT-based auth
- **State Management**: React Hooks

## 📦 Cài Đặt

### Yêu cầu
- Node.js 18+ 
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd housesea
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Thiết lập database**
```bash
# Tạo database và chạy migrations
npx prisma db push

# Seed dữ liệu mẫu
npm run seed
```

4. **Chạy development server**
```bash
npm run dev
```

5. **Mở trình duyệt**
```
http://localhost:3000
```

## 🔑 Tài Khoản Test

### Chủ Nhà
- Email: `landlord@test.com`
- Password: `TestPass@2024`

### Người Thuê (Có phòng)
- Email: `tenant1@test.com`
- Password: `TestPass@2024`

### Người Thuê (Chưa có phòng)
- Email: `test1@example.com`
- Password: `TestPass@2024`

## 📁 Cấu Trúc Thư Mục

```
housesea/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── buildings/       # Building management
│   │   ├── rooms/           # Room management
│   │   ├── tenants/         # Tenant management
│   │   ├── contracts/       # Contract management
│   │   ├── invoices/        # Invoice management
│   │   ├── notifications/   # Notification system
│   │   └── maintenance/     # Maintenance requests
│   ├── landlord/            # Landlord dashboard pages
│   ├── tenant/              # Tenant dashboard pages
│   ├── login/               # Login page
│   └── register/            # Registration page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── landlord-sidebar.tsx
│   └── tenant-sidebar.tsx
├── lib/                     # Utility functions
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helper functions
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
└── public/                  # Static files
```

## 🗄️ Database Schema

### Models
- **User**: Người dùng (chủ nhà hoặc người thuê)
- **Landlord**: Thông tin chủ nhà
- **Tenant**: Thông tin người thuê
- **Building**: Tòa nhà
- **Room**: Phòng trọ
- **Contract**: Hợp đồng thuê
- **Invoice**: Hóa đơn
- **Notification**: Thông báo
- **MaintenanceRequest**: Yêu cầu bảo trì

## 🛠️ Scripts

```bash
# Development
npm run dev          # Chạy dev server

# Database
npx prisma studio    # Mở Prisma Studio
npx prisma db push   # Đồng bộ schema với database
npm run seed         # Seed dữ liệu mẫu

# Build
npm run build        # Build production
npm start            # Chạy production server
```

## 🎨 Design System

HouseSea sử dụng design system hiện đại với:
- **Colors**: Gradient xanh dương đến indigo
- **Typography**: Inter font family
- **Components**: shadcn/ui components
- **Icons**: Lucide React icons
- **Responsive**: Mobile-first design

## 📝 License

© 2026 HouseSea. All rights reserved.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For support or questions, please contact us at support@housesea.com
