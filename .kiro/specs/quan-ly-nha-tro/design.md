# Tài Liệu Thiết Kế - HomeLink

## Tổng Quan

HomeLink là một ứng dụng web SaaS multi-tenant được xây dựng trên Next.js 14 (App Router), TypeScript, Prisma ORM và PostgreSQL. Hệ thống cho phép nhiều chủ nhà độc lập quản lý tòa nhà, phòng trọ, người thuê, hợp đồng và hóa đơn với data isolation hoàn toàn. Người thuê có thể đăng nhập để xem thông tin phòng, hóa đơn và giao tiếp với chủ nhà.

**Slogan**: "Kết nối ngôi nhà của bạn"

### Công Nghệ Sử Dụng

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL với Prisma ORM
- **Authentication**: NextAuth.js với JWT
- **Validation**: Zod
- **State Management**: React Server Components + Client Components
- **Form Handling**: React Hook Form

### Đặc Điểm Chính

1. **Multi-tenant Architecture**: Mỗi landlord có không gian dữ liệu riêng biệt
2. **Data Isolation**: Query luôn filter theo landlordId để đảm bảo bảo mật
3. **Role-Based Access Control**: Phân quyền rõ ràng giữa LANDLORD và TENANT
4. **Responsive Design**: Hỗ trợ desktop, tablet và mobile
5. **Real-time Validation**: Form validation với feedback tức thì
6. **Server-Side Rendering**: Tận dụng RSC để tối ưu performance

## Kiến Trúc

### Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │    Tablet    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js App Router (React Server Components)        │   │
│  │  - Pages (app/)                                       │   │
│  │  - Layouts                                            │   │
│  │  - Components (components/)                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js API Routes (app/api/)                        │   │
│  │  - Authentication (/api/auth)                         │   │
│  │  - Buildings (/api/buildings)                         │   │
│  │  - Rooms (/api/rooms)                                 │   │
│  │  - Tenants (/api/tenants)                             │   │
│  │  - Contracts (/api/contracts)                         │   │
│  │  - Invoices (/api/invoices)                           │   │
│  │  - Notifications (/api/notifications)                 │   │
│  │  - Maintenance (/api/maintenance)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services (lib/services/)                             │   │
│  │  - AuthService                                        │   │
│  │  - BuildingService                                    │   │
│  │  - RoomService                                        │   │
│  │  - TenantService                                      │   │
│  │  - ContractService                                    │   │
│  │  - InvoiceService                                     │   │
│  │  - NotificationService                                │   │
│  │  - MaintenanceService                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Prisma Client (lib/prisma.ts)                        │   │
│  │  - Database Models                                    │   │
│  │  - Query Builder                                      │   │
│  │  - Transaction Support                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                  │   │
│  │  - Multi-tenant data with landlordId isolation        │   │
│  │  - Indexed queries for performance                    │   │
│  │  - Foreign key constraints                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Luồng Xử Lý Request

#### Landlord Request Flow
```
User Request → Middleware (Auth Check) → Page/API Route → 
Service Layer (với landlordId filter) → Prisma Client → 
PostgreSQL → Response
```

#### Tenant Request Flow
```
User Request → Middleware (Auth Check) → Page/API Route → 
Service Layer (với tenantId filter) → Prisma Client → 
PostgreSQL → Response
```

### Multi-Tenant Data Isolation

Mọi query đều phải filter theo ownership:

**Landlord queries:**
```typescript
// Luôn filter theo landlordId
prisma.building.findMany({
  where: { landlordId: session.user.landlordId }
})

prisma.room.findMany({
  where: { 
    building: { 
      landlordId: session.user.landlordId 
    }
  }
})
```

**Tenant queries:**
```typescript
// Luôn filter theo tenantId
prisma.invoice.findMany({
  where: { tenantId: session.user.tenantId }
})

prisma.contract.findMany({
  where: { tenantId: session.user.tenantId }
})
```

## Components và Interfaces

### Branding

**Tên hệ thống**: HomeLink
**Slogan**: "Kết nối ngôi nhà của bạn"
**Logo**: Icon Building2 với gradient blue-to-indigo
**Color scheme**: 
- Primary: Blue (from-blue-600 to-indigo-600)
- Background: Gradient (from-blue-50 to-indigo-100)

### UI/UX Improvements

#### Login Form Enhancements

**Error Display Strategy:**
- Errors hiển thị ngay dưới form inputs (không dùng toast cho login errors)
- Error box có background đỏ nhạt (bg-red-50) với border đỏ (border-red-200)
- Icon cảnh báo bên cạnh error message
- Input fields có border đỏ khi có lỗi (border-red-300)

**Shake Animation:**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s;
}
```

**Error Scenarios:**
1. Sai mật khẩu → "Mật khẩu không đúng"
2. Email không tồn tại → "Tài khoản không tồn tại"
3. Sai role → "Tài khoản này không phải là [chủ nhà/người thuê]"
4. Network error → "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại."

#### Dashboard Improvements

**Landlord Dashboard:**
- Modern card-based layout
- Statistics cards với icons và colors
- Gradient backgrounds cho headers
- Responsive grid layout

**Tenant Dashboard:**
- Simplified view focusing on essential info
- Room info prominently displayed
- Quick access to unpaid invoices
- Notification badges

### Authentication Components

#### AuthService
```typescript
interface AuthService {
  // Đăng ký chủ nhà mới
  registerLandlord(data: RegisterLandlordInput): Promise<User>
  
  // Đăng nhập
  login(email: string, password: string): Promise<Session>
  
  // Đăng xuất
  logout(): Promise<void>
  
  // Lấy session hiện tại
  getSession(): Promise<Session | null>
  
  // Hash password
  hashPassword(password: string): Promise<string>
  
  // Verify password
  verifyPassword(password: string, hash: string): Promise<boolean>
}

interface RegisterLandlordInput {
  email: string
  password: string
  name: string
  phone: string
  address?: string
}

interface Session {
  user: {
    id: string
    email: string
    name: string
    role: Role
    landlordId?: string
    tenantId?: string
  }
  expires: string
}
```

### Building Management Components

#### BuildingService
```typescript
interface BuildingService {
  // Tạo tòa nhà mới
  createBuilding(landlordId: string, data: CreateBuildingInput): Promise<Building>
  
  // Lấy danh sách tòa nhà của landlord
  getBuildingsByLandlord(landlordId: string): Promise<Building[]>
  
  // Lấy chi tiết tòa nhà
  getBuildingById(landlordId: string, buildingId: string): Promise<Building | null>
  
  // Cập nhật tòa nhà
  updateBuilding(landlordId: string, buildingId: string, data: UpdateBuildingInput): Promise<Building>
  
  // Xóa tòa nhà (chỉ khi không có phòng)
  deleteBuilding(landlordId: string, buildingId: string): Promise<void>
  
  // Kiểm tra tòa nhà có phòng không
  hasBuildingRooms(buildingId: string): Promise<boolean>
}

interface CreateBuildingInput {
  name: string
  address: string
  description?: string
}

interface UpdateBuildingInput {
  name?: string
  address?: string
  description?: string
}

interface Building {
  id: string
  landlordId: string
  name: string
  address: string
  description: string | null
  rooms: Room[]
  createdAt: Date
  updatedAt: Date
}
```

### Room Management Components

#### RoomService
```typescript
interface RoomService {
  // Tạo phòng mới
  createRoom(landlordId: string, data: CreateRoomInput): Promise<Room>
  
  // Lấy danh sách phòng của landlord
  getRoomsByLandlord(landlordId: string, filters?: RoomFilters): Promise<Room[]>
  
  // Lấy chi tiết phòng
  getRoomById(landlordId: string, roomId: string): Promise<Room | null>
  
  // Cập nhật phòng
  updateRoom(landlordId: string, roomId: string, data: UpdateRoomInput): Promise<Room>
  
  // Xóa phòng (chỉ khi không có hợp đồng active)
  deleteRoom(landlordId: string, roomId: string): Promise<void>
  
  // Cập nhật trạng thái phòng
  updateRoomStatus(roomId: string, status: RoomStatus): Promise<Room>
  
  // Kiểm tra phòng có hợp đồng active không
  hasActiveContract(roomId: string): Promise<boolean>
  
  // Smart building selection helper
  shouldAutoSelectBuilding(landlordId: string): Promise<{ autoSelect: boolean, buildingId?: string }>
}

interface CreateRoomInput {
  buildingId: string
  name: string
  area: number
  price: number
  description?: string
}

interface UpdateRoomInput {
  name?: string
  area?: number
  price?: number
  description?: string
  status?: RoomStatus
}

interface RoomFilters {
  buildingId?: string
  status?: RoomStatus
  search?: string
}

interface Room {
  id: string
  buildingId: string
  name: string
  area: number
  price: number
  description: string | null
  status: RoomStatus
  building: Building
  tenant: Tenant | null
  contracts: Contract[]
  createdAt: Date
  updatedAt: Date
}

enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED'
}
```

#### Smart Building Selection Logic

Hệ thống tự động điều chỉnh UI dựa trên số lượng tòa nhà:

**Case 1: Không có tòa nhà (0 buildings)**
- Hiển thị cảnh báo: "⚠️ Chưa có tòa nhà - Vui lòng tạo tòa nhà trước"
- Disable nút "Tạo Phòng"

**Case 2: Có 1 tòa nhà (1 building)**
- Tự động chọn tòa nhà duy nhất
- Hiển thị thông tin tòa nhà dạng info box (không có dropdown)
- Format: "🏢 Tòa nhà: [Tên] - 📍 [Địa chỉ]"

**Case 3: Có nhiều tòa nhà (2+ buildings)**
- Hiển thị dropdown để chọn tòa nhà
- Label: "Tòa Nhà / Dãy Trọ"
- Mỗi option hiển thị tên và địa chỉ

```typescript
// Implementation example
const shouldAutoSelectBuilding = async (landlordId: string) => {
  const buildings = await prisma.building.findMany({
    where: { landlordId }
  })
  
  if (buildings.length === 0) {
    return { autoSelect: false }
  }
  
  if (buildings.length === 1) {
    return { autoSelect: true, buildingId: buildings[0].id }
  }
  
  return { autoSelect: false }
}
```
```

### Tenant Management Components

#### TenantService
```typescript
interface TenantService {
  // Tạo tài khoản tenant mới
  createTenant(landlordId: string, data: CreateTenantInput): Promise<Tenant>
  
  // Lấy danh sách tenant của landlord
  getTenantsByLandlord(landlordId: string): Promise<Tenant[]>
  
  // Lấy chi tiết tenant
  getTenantById(landlordId: string, tenantId: string): Promise<Tenant | null>
  
  // Cập nhật tenant
  updateTenant(landlordId: string, tenantId: string, data: UpdateTenantInput): Promise<Tenant>
  
  // Gán tenant vào phòng
  assignTenantToRoom(landlordId: string, tenantId: string, roomId: string): Promise<Tenant>
  
  // Gỡ tenant khỏi phòng
  removeTenantFromRoom(landlordId: string, tenantId: string): Promise<Tenant>
  
  // Gửi thông tin đăng nhập cho tenant
  sendLoginCredentials(tenantId: string, password: string): Promise<void>
}

interface CreateTenantInput {
  email: string
  name: string
  phone: string
  idCard: string
  dateOfBirth: Date
  roomId?: string
}

interface UpdateTenantInput {
  name?: string
  phone?: string
  idCard?: string
  dateOfBirth?: Date
}

interface Tenant {
  id: string
  userId: string
  phone: string
  idCard: string
  dateOfBirth: Date
  roomId: string | null
  user: User
  room: Room | null
  contracts: Contract[]
  invoices: Invoice[]
  createdAt: Date
  updatedAt: Date
}
```

### Contract Management Components

#### ContractService
```typescript
interface ContractService {
  // Tạo hợp đồng mới
  createContract(landlordId: string, data: CreateContractInput): Promise<Contract>
  
  // Lấy danh sách hợp đồng của landlord
  getContractsByLandlord(landlordId: string, filters?: ContractFilters): Promise<Contract[]>
  
  // Lấy danh sách hợp đồng của tenant
  getContractsByTenant(tenantId: string): Promise<Contract[]>
  
  // Lấy chi tiết hợp đồng
  getContractById(landlordId: string, contractId: string): Promise<Contract | null>
  
  // Cập nhật hợp đồng
  updateContract(landlordId: string, contractId: string, data: UpdateContractInput): Promise<Contract>
  
  // Kết thúc hợp đồng sớm
  terminateContract(landlordId: string, contractId: string): Promise<Contract>
  
  // Tự động cập nhật hợp đồng hết hạn
  updateExpiredContracts(): Promise<number>
  
  // Validate ngày hợp đồng
  validateContractDates(startDate: Date, endDate: Date): boolean
}

interface CreateContractInput {
  roomId: string
  tenantId: string
  startDate: Date
  endDate: Date
  price: number
}

interface UpdateContractInput {
  startDate?: Date
  endDate?: Date
  price?: number
}

interface ContractFilters {
  status?: ContractStatus
  roomId?: string
  tenantId?: string
}

interface Contract {
  id: string
  roomId: string
  tenantId: string
  landlordId: string
  startDate: Date
  endDate: Date
  price: number
  status: ContractStatus
  room: Room
  tenant: Tenant
  invoices: Invoice[]
  createdAt: Date
  updatedAt: Date
}

enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED'
}
```

### Invoice Management Components

#### InvoiceService
```typescript
interface InvoiceService {
  // Tạo hóa đơn mới
  createInvoice(landlordId: string, data: CreateInvoiceInput): Promise<Invoice>
  
  // Lấy danh sách hóa đơn của landlord
  getInvoicesByLandlord(landlordId: string, filters?: InvoiceFilters): Promise<Invoice[]>
  
  // Lấy danh sách hóa đơn của tenant
  getInvoicesByTenant(tenantId: string): Promise<Invoice[]>
  
  // Lấy chi tiết hóa đơn
  getInvoiceById(landlordId: string, invoiceId: string): Promise<Invoice | null>
  
  // Cập nhật hóa đơn
  updateInvoice(landlordId: string, invoiceId: string, data: UpdateInvoiceInput): Promise<Invoice>
  
  // Đánh dấu hóa đơn đã thanh toán
  markInvoiceAsPaid(landlordId: string, invoiceId: string): Promise<Invoice>
  
  // Tính tổng tiền hóa đơn
  calculateInvoiceTotal(data: InvoiceCalculationInput): number
  
  // Validate tháng/năm hóa đơn
  validateInvoiceMonthYear(month: number, year: number): boolean
  
  // Kiểm tra hóa đơn trùng
  checkDuplicateInvoice(contractId: string, month: number, year: number): Promise<boolean>
}

interface CreateInvoiceInput {
  contractId: string
  tenantId: string
  month: number
  year: number
  roomPrice: number
  electricityPrice: number
  waterPrice: number
  otherFees: number
}

interface UpdateInvoiceInput {
  roomPrice?: number
  electricityPrice?: number
  waterPrice?: number
  otherFees?: number
}

interface InvoiceFilters {
  paid?: boolean
  month?: number
  year?: number
  tenantId?: string
}

interface InvoiceCalculationInput {
  roomPrice: number
  electricityPrice: number
  waterPrice: number
  otherFees: number
}

interface Invoice {
  id: string
  contractId: string
  tenantId: string
  landlordId: string
  month: number
  year: number
  roomPrice: number
  electricityPrice: number
  waterPrice: number
  otherFees: number
  total: number
  paid: boolean
  paidDate: Date | null
  contract: Contract
  tenant: Tenant
  createdAt: Date
  updatedAt: Date
}
```

### Notification Components

#### NotificationService
```typescript
interface NotificationService {
  // Tạo thông báo cho một tenant
  createNotification(landlordId: string, data: CreateNotificationInput): Promise<Notification>
  
  // Tạo thông báo cho tất cả tenant của landlord
  createBroadcastNotification(landlordId: string, data: BroadcastNotificationInput): Promise<Notification[]>
  
  // Lấy danh sách thông báo của tenant
  getNotificationsByTenant(tenantId: string): Promise<Notification[]>
  
  // Đánh dấu thông báo đã đọc
  markNotificationAsRead(tenantId: string, notificationId: string): Promise<Notification>
  
  // Đếm số thông báo chưa đọc
  countUnreadNotifications(tenantId: string): Promise<number>
  
  // Lấy tất cả tenant của landlord
  getTenantIdsByLandlord(landlordId: string): Promise<string[]>
}

interface CreateNotificationInput {
  tenantId: string
  title: string
  message: string
}

interface BroadcastNotificationInput {
  title: string
  message: string
}

interface Notification {
  id: string
  landlordId: string
  tenantId: string
  title: string
  message: string
  read: boolean
  tenant: Tenant
  createdAt: Date
}
```

### Maintenance Request Components

#### MaintenanceService
```typescript
interface MaintenanceService {
  // Tạo yêu cầu bảo trì (tenant)
  createMaintenanceRequest(tenantId: string, data: CreateMaintenanceInput): Promise<MaintenanceRequest>
  
  // Lấy danh sách yêu cầu của landlord
  getMaintenanceRequestsByLandlord(landlordId: string, filters?: MaintenanceFilters): Promise<MaintenanceRequest[]>
  
  // Lấy danh sách yêu cầu của tenant
  getMaintenanceRequestsByTenant(tenantId: string): Promise<MaintenanceRequest[]>
  
  // Lấy chi tiết yêu cầu
  getMaintenanceRequestById(id: string): Promise<MaintenanceRequest | null>
  
  // Cập nhật trạng thái yêu cầu (landlord)
  updateMaintenanceStatus(landlordId: string, requestId: string, status: MaintenanceRequestStatus): Promise<MaintenanceRequest>
}

interface CreateMaintenanceInput {
  roomId: string
  title: string
  description: string
}

interface MaintenanceFilters {
  status?: MaintenanceRequestStatus
  roomId?: string
}

interface MaintenanceRequest {
  id: string
  tenantId: string
  roomId: string
  title: string
  description: string
  status: MaintenanceRequestStatus
  tenant: Tenant
  room: Room
  createdAt: Date
  updatedAt: Date
}

enum MaintenanceRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}
```

### Report Components

#### ReportService
```typescript
interface ReportService {
  // Báo cáo doanh thu
  getRevenueReport(landlordId: string, startDate: Date, endDate: Date): Promise<RevenueReport>
  
  // Báo cáo công nợ
  getDebtReport(landlordId: string): Promise<DebtReport>
  
  // Thống kê phòng
  getRoomStatistics(landlordId: string): Promise<RoomStatistics>
  
  // Doanh thu theo tháng
  getMonthlyRevenue(landlordId: string, year: number): Promise<MonthlyRevenue[]>
}

interface RevenueReport {
  totalRevenue: number
  paidInvoices: number
  period: {
    startDate: Date
    endDate: Date
  }
}

interface DebtReport {
  totalDebt: number
  unpaidInvoices: number
  invoices: Invoice[]
}

interface RoomStatistics {
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  occupancyRate: number
}

interface MonthlyRevenue {
  month: number
  revenue: number
  invoiceCount: number
}
```

## Data Models

### Database Schema (Prisma)

Schema đã được cung cấp trong yêu cầu, bao gồm:

- **User**: Người dùng hệ thống (LANDLORD hoặc TENANT)
- **Landlord**: Thông tin chủ nhà
- **Building**: Tòa nhà/dãy trọ
- **Room**: Phòng trọ
- **Tenant**: Thông tin người thuê
- **Contract**: Hợp đồng thuê phòng
- **Invoice**: Hóa đơn thanh toán
- **Notification**: Thông báo
- **MaintenanceRequest**: Yêu cầu bảo trì

### Key Relationships

```
User 1:1 Landlord
User 1:1 Tenant
Landlord 1:N Building
Building 1:N Room
Room 1:1 Tenant (optional)
Room 1:N Contract
Room 1:N MaintenanceRequest
Tenant 1:N Contract
Tenant 1:N Invoice
Tenant 1:N Notification
Tenant 1:N MaintenanceRequest
Contract 1:N Invoice
```

### Indexes

Các index quan trọng để tối ưu performance:

```prisma
// Building
@@index([landlordId])

// Room
@@index([buildingId])
@@index([status])

// Tenant
@@index([roomId])

// Contract
@@index([roomId])
@@index([tenantId])
@@index([landlordId])
@@index([status])

// Invoice
@@index([tenantId])
@@index([landlordId])
@@index([paid])

// Notification
@@index([tenantId])
@@index([landlordId])
@@index([read])

// MaintenanceRequest
@@index([tenantId])
@@index([roomId])
@@index([status])
```


## Correctness Properties

*Property (tính chất) là một đặc điểm hoặc hành vi phải đúng trong tất cả các lần thực thi hợp lệ của hệ thống - về cơ bản, đây là một phát biểu chính thức về những gì hệ thống nên làm. Properties đóng vai trò là cầu nối giữa đặc tả có thể đọc được bởi con người và các đảm bảo tính đúng đắn có thể xác minh được bằng máy.*

### Property Reflection

Sau khi phân tích acceptance criteria, tôi nhận thấy một số patterns lặp lại:

**Data Isolation Properties**: Nhiều properties về việc landlord/tenant chỉ xem được dữ liệu của mình (2.2, 3.2, 4.3, 5.2, 6.2, 7.2, 7.3, 8.1, 9.3, 10.2, 10.4, 11.2, 11.3, 12.4). Những properties này có thể được nhóm lại thành một property tổng quát về data isolation.

**Creation Properties**: Nhiều properties về việc tạo entity với trạng thái mặc định (1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 9.1, 10.1). Những properties này tương tự nhau nhưng áp dụng cho các entity khác nhau, nên giữ riêng biệt.

**Error Conditions**: Nhiều properties về việc từ chối operations không hợp lệ (1.2, 2.5, 3.6, 4.4, 6.6). Những properties này test các error cases khác nhau, nên giữ riêng biệt.

**State Transitions**: Properties về việc cập nhật trạng thái (3.4, 4.2, 5.4, 6.3, 9.4, 10.3) test các transitions khác nhau, nên giữ riêng biệt.

**Calculation Properties**: Properties về tính toán (6.4, 12.1, 12.2, 12.3) test các calculations khác nhau, nên giữ riêng biệt.

Sau khi reflection, tôi quyết định:
- Nhóm các data isolation properties thành một property tổng quát
- Giữ riêng biệt các creation, error, state transition và calculation properties vì chúng test các aspects khác nhau
- Loại bỏ các properties về UI/CSS (requirements 13-20) vì không testable
- Tập trung vào business logic và data integrity

### Core Properties

#### Property 1: Data Isolation - Landlord Access Control
*For any* landlord và bất kỳ entity nào (building, room, tenant, contract, invoice, maintenance request), khi landlord query dữ liệu, hệ thống chỉ trả về các entities thuộc sở hữu hoặc liên quan đến landlord đó thông qua landlordId hoặc building ownership chain.

**Validates: Requirements 2.2, 3.2, 4.3, 5.2, 6.2, 10.2, 11.2, 12.4**

#### Property 2: Data Isolation - Tenant Access Control
*For any* tenant, khi tenant query dữ liệu (room, contract, invoice, notification, maintenance request), hệ thống chỉ trả về các entities liên quan trực tiếp đến tenant đó thông qua tenantId.

**Validates: Requirements 7.2, 7.3, 8.1, 9.3, 10.4, 11.3**

#### Property 3: Password Security
*For any* user account được tạo, password được lưu trong database phải là bcrypt hash, không phải plaintext, và phải verify được với password gốc.

**Validates: Requirements 1.5**

#### Property 4: Authentication Round Trip
*For any* valid registration data, sau khi đăng ký thành công, login với cùng email và password phải thành công và trả về session với đúng role.

**Validates: Requirements 1.1, 1.3, 7.1**

#### Property 5: Duplicate Email Rejection
*For any* email đã tồn tại trong hệ thống, việc đăng ký với email đó phải bị từ chối và trả về error.

**Validates: Requirements 1.2**

#### Property 6: Invalid Credentials Rejection
*For any* invalid login credentials (wrong email hoặc wrong password), việc đăng nhập phải bị từ chối và trả về error.

**Validates: Requirements 1.4**

#### Property 7: Building Creation and Ownership
*For any* landlord và valid building data, khi tạo building, building phải được tạo với landlordId đúng và landlord phải có thể query được building đó.

**Validates: Requirements 2.1**

#### Property 8: Building Update Authorization
*For any* building update request, update chỉ thành công nếu landlord là owner của building đó, ngược lại phải trả về authorization error.

**Validates: Requirements 2.3**

#### Property 9: Building Deletion with Rooms Protection
*For any* building có rooms, việc xóa building phải bị từ chối. *For any* building không có rooms, việc xóa phải thành công.

**Validates: Requirements 2.4, 2.5**

#### Property 10: Room Creation with Default Status
*For any* valid room data, khi tạo room, room phải được tạo với status AVAILABLE và phải thuộc building của landlord.

**Validates: Requirements 3.1**

#### Property 11: Room Update Authorization
*For any* room update request, update chỉ thành công nếu room thuộc building của landlord đó, ngược lại phải trả về authorization error.

**Validates: Requirements 3.3**

#### Property 12: Room Status Transition on Assignment
*For any* room được gán cho tenant, status của room phải tự động chuyển từ AVAILABLE sang OCCUPIED.

**Validates: Requirements 3.4, 4.2**

#### Property 13: Room Deletion with Active Contract Protection
*For any* room có active contract, việc xóa room phải bị từ chối. *For any* room không có active contract, việc xóa phải thành công.

**Validates: Requirements 3.5, 3.6**

#### Property 14: Tenant Creation with Role
*For any* valid tenant data, khi landlord tạo tenant, tenant account phải được tạo với role TENANT.

**Validates: Requirements 4.1**

#### Property 15: Occupied Room Assignment Rejection
*For any* room đã có tenant (status OCCUPIED), việc gán tenant khác vào room đó phải bị từ chối và trả về error.

**Validates: Requirements 4.4**

#### Property 16: Contract Creation with Active Status
*For any* valid contract data, khi tạo contract, contract phải được tạo với status ACTIVE.

**Validates: Requirements 5.1**

#### Property 17: Contract Date Validation
*For any* contract, startDate phải nhỏ hơn endDate, ngược lại việc tạo/update contract phải bị từ chối.

**Validates: Requirements 5.5**

#### Property 18: Contract Termination and Room Release
*For any* active contract, khi terminate contract, status phải chuyển thành TERMINATED và room phải được giải phóng (status về AVAILABLE, roomId của tenant về null).

**Validates: Requirements 5.4**

#### Property 19: Invoice Creation with Unpaid Status
*For any* valid invoice data, khi tạo invoice, invoice phải được tạo với paid = false.

**Validates: Requirements 6.1**

#### Property 20: Invoice Total Calculation
*For any* invoice, total phải luôn bằng roomPrice + electricityPrice + waterPrice + otherFees.

**Validates: Requirements 6.4**

#### Property 21: Invoice Month/Year Validation
*For any* invoice, month phải nằm trong khoảng 1-12 và year phải là số dương, ngược lại việc tạo invoice phải bị từ chối.

**Validates: Requirements 6.5**

#### Property 22: Duplicate Invoice Rejection
*For any* contract và month/year combination đã có invoice, việc tạo invoice mới với cùng contract và month/year phải bị từ chối.

**Validates: Requirements 6.6**

#### Property 23: Invoice Payment Status Update
*For any* invoice, khi mark as paid, paid phải chuyển thành true và paidDate phải được set là thời điểm hiện tại.

**Validates: Requirements 6.3**

#### Property 24: Invoice Sorting Order
*For any* danh sách invoices của tenant, invoices phải được sắp xếp theo thứ tự từ mới nhất đến cũ nhất (year desc, month desc).

**Validates: Requirements 8.4**

#### Property 25: Notification Creation with Unread Status
*For any* valid notification data, khi tạo notification, notification phải được tạo với read = false.

**Validates: Requirements 9.1**

#### Property 26: Broadcast Notification Coverage
*For any* landlord broadcast notification, notification phải được tạo cho tất cả tenants trong các buildings của landlord đó, không thiếu không thừa.

**Validates: Requirements 9.2**

#### Property 27: Notification Read Status Update
*For any* notification, khi tenant đánh dấu đã đọc, read phải chuyển thành true.

**Validates: Requirements 9.4**

#### Property 28: Unread Notification Count Accuracy
*For any* tenant, số lượng unread notifications phải bằng số lượng notifications có read = false của tenant đó.

**Validates: Requirements 9.5**

#### Property 29: Maintenance Request Creation with Pending Status
*For any* valid maintenance request data, khi tenant tạo request, request phải được tạo với status PENDING.

**Validates: Requirements 10.1**

#### Property 30: Maintenance Request Status Update
*For any* maintenance request, khi landlord update status, status mới phải được lưu chính xác (IN_PROGRESS, COMPLETED, hoặc REJECTED).

**Validates: Requirements 10.3**

#### Property 31: Unauthorized Access Rejection
*For any* user cố gắng truy cập dữ liệu không thuộc quyền của mình (landlord access data của landlord khác, tenant access data của tenant khác), request phải bị từ chối với status code 403.

**Validates: Requirements 11.4**

#### Property 32: Revenue Calculation Accuracy
*For any* landlord và time period, tổng revenue phải bằng tổng total của tất cả paid invoices trong period đó thuộc các buildings của landlord.

**Validates: Requirements 12.1**

#### Property 33: Debt Calculation Accuracy
*For any* landlord, tổng debt phải bằng tổng total của tất cả unpaid invoices thuộc các buildings của landlord.

**Validates: Requirements 12.2**

#### Property 34: Room Statistics Accuracy
*For any* landlord, tổng số available rooms + occupied rooms phải bằng tổng số rooms thuộc các buildings của landlord.

**Validates: Requirements 12.3**

#### Property 35: Email Validation
*For any* email input, email phải match regex pattern hợp lệ (có @ và domain), ngược lại phải bị từ chối.

**Validates: Requirements 15.4**

#### Property 36: Phone Number Validation
*For any* phone number input, phone phải có 10-11 chữ số, ngược lại phải bị từ chối.

**Validates: Requirements 15.5**

#### Property 37: Table Sorting Consistency
*For any* table column được sort, dữ liệu phải được sắp xếp đúng theo column đó (ascending hoặc descending) và consistent across multiple sorts.

**Validates: Requirements 17.2**

#### Property 38: Search Filter Accuracy
*For any* search keyword, kết quả filter phải chỉ chứa các items có field nào đó chứa keyword (case-insensitive).

**Validates: Requirements 17.4**

#### Property 39: Auto-generated ID and Timestamp
*For any* entity được tạo, entity phải có id unique và createdAt timestamp được set tự động.

**Validates: Requirements 21.4**

#### Property 40: API Success Response Format
*For any* successful API request, response phải có status code 200 hoặc 201 và body phải là valid JSON.

**Validates: Requirements 22.2**

#### Property 41: API Client Error Response
*For any* API request với invalid input, response phải có status code 400 và error message rõ ràng.

**Validates: Requirements 22.3**

#### Property 42: API Authentication Error Response
*For any* API request không có authentication hoặc không có authorization, response phải có status code 401 hoặc 403.

**Validates: Requirements 22.4**

#### Property 43: API Server Error Response
*For any* API request gây ra server error, response phải có status code 500 và error phải được log.

**Validates: Requirements 22.5**

#### Property 44: Smart Building Selection - Auto-select Single Building
*For any* landlord có đúng 1 building, khi tạo room, system phải tự động chọn building đó và không hiển thị dropdown.

**Validates: Requirements 3.8**

#### Property 45: Smart Building Selection - Disable When No Buildings
*For any* landlord không có building nào, nút "Tạo Phòng" phải bị disable và hiển thị cảnh báo.

**Validates: Requirements 3.7**

#### Property 46: Smart Building Selection - Show Dropdown For Multiple Buildings
*For any* landlord có 2 buildings trở lên, system phải hiển thị dropdown để chọn building.

**Validates: Requirements 3.9**

#### Property 47: Login Error Display Below Input
*For any* login failure, error message phải hiển thị ngay dưới form inputs (không dùng toast).

**Validates: Requirements 15.7**

#### Property 48: Login Shake Animation On Error
*For any* login failure, form phải có shake animation để thu hút sự chú ý.

**Validates: Requirements 15.8**

## Error Handling

### Error Categories

#### 1. Validation Errors (400 Bad Request)
- Invalid email format
- Invalid phone number format
- Invalid date range (startDate >= endDate)
- Invalid month/year (month not in 1-12, year <= 0)
- Missing required fields
- Invalid data types

**Handling Strategy:**
```typescript
// Sử dụng Zod schema validation
const schema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10,11}$/),
  // ...
})

try {
  const validated = schema.parse(input)
} catch (error) {
  return Response.json(
    { error: 'Validation failed', details: error.errors },
    { status: 400 }
  )
}
```

#### 2. Authentication Errors (401 Unauthorized)
- Invalid credentials
- Expired session
- Missing authentication token

**Handling Strategy:**
```typescript
const session = await getServerSession()
if (!session) {
  return Response.json(
    { error: 'Authentication required' },
    { status: 401 }
  )
}
```

#### 3. Authorization Errors (403 Forbidden)
- Accessing data of other landlord
- Accessing data of other tenant
- Performing action without permission

**Handling Strategy:**
```typescript
// Kiểm tra ownership
const building = await prisma.building.findUnique({
  where: { id: buildingId }
})

if (building.landlordId !== session.user.landlordId) {
  return Response.json(
    { error: 'Access denied' },
    { status: 403 }
  )
}
```

#### 4. Not Found Errors (404 Not Found)
- Entity không tồn tại
- Resource không tìm thấy

**Handling Strategy:**
```typescript
const room = await prisma.room.findUnique({
  where: { id: roomId }
})

if (!room) {
  return Response.json(
    { error: 'Room not found' },
    { status: 404 }
  )
}
```

#### 5. Conflict Errors (409 Conflict)
- Duplicate email
- Duplicate invoice (same contract + month/year)
- Room already occupied
- Building has rooms (cannot delete)
- Room has active contract (cannot delete)

**Handling Strategy:**
```typescript
const existing = await prisma.user.findUnique({
  where: { email }
})

if (existing) {
  return Response.json(
    { error: 'Email already exists' },
    { status: 409 }
  )
}
```

#### 6. Server Errors (500 Internal Server Error)
- Database connection errors
- Unexpected exceptions
- Third-party service failures

**Handling Strategy:**
```typescript
try {
  // Business logic
} catch (error) {
  console.error('Server error:', error)
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### Error Response Format

Tất cả error responses phải follow format nhất quán:

```typescript
interface ErrorResponse {
  error: string // Human-readable error message
  code?: string // Machine-readable error code
  details?: any // Additional error details (validation errors, etc.)
}
```

### Transaction Handling

Các operations liên quan đến nhiều tables phải sử dụng transaction:

```typescript
// Ví dụ: Terminate contract và release room
await prisma.$transaction(async (tx) => {
  // Update contract status
  await tx.contract.update({
    where: { id: contractId },
    data: { status: 'TERMINATED' }
  })
  
  // Update room status
  await tx.room.update({
    where: { id: contract.roomId },
    data: { status: 'AVAILABLE' }
  })
  
  // Update tenant roomId
  await tx.tenant.update({
    where: { id: contract.tenantId },
    data: { roomId: null }
  })
})
```

## Testing Strategy

### Dual Testing Approach

Hệ thống sử dụng kết hợp hai loại testing:

#### 1. Unit Tests
- Test các specific examples và edge cases
- Test integration points giữa các components
- Test error conditions
- Sử dụng Jest hoặc Vitest

**Ví dụ Unit Tests:**
```typescript
describe('InvoiceService', () => {
  it('should calculate invoice total correctly', () => {
    const total = calculateInvoiceTotal({
      roomPrice: 3000000,
      electricityPrice: 500000,
      waterPrice: 100000,
      otherFees: 200000
    })
    expect(total).toBe(3800000)
  })
  
  it('should reject invalid month', () => {
    expect(() => validateInvoiceMonthYear(13, 2024)).toThrow()
    expect(() => validateInvoiceMonthYear(0, 2024)).toThrow()
  })
})
```

#### 2. Property-Based Tests
- Test universal properties across all inputs
- Sử dụng fast-check library cho TypeScript
- Mỗi property test chạy tối thiểu 100 iterations
- Mỗi test phải tag với property number và text

**Ví dụ Property Tests:**
```typescript
import fc from 'fast-check'

describe('Property Tests', () => {
  it('Property 20: Invoice total calculation', () => {
    // Feature: quan-ly-nha-tro, Property 20: Invoice Total Calculation
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100000000 }), // roomPrice
        fc.float({ min: 0, max: 10000000 }),  // electricityPrice
        fc.float({ min: 0, max: 1000000 }),   // waterPrice
        fc.float({ min: 0, max: 5000000 }),   // otherFees
        (roomPrice, electricityPrice, waterPrice, otherFees) => {
          const total = calculateInvoiceTotal({
            roomPrice,
            electricityPrice,
            waterPrice,
            otherFees
          })
          
          const expected = roomPrice + electricityPrice + waterPrice + otherFees
          expect(Math.abs(total - expected)).toBeLessThan(0.01)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('Property 1: Data Isolation - Landlord Access Control', () => {
    // Feature: quan-ly-nha-tro, Property 1: Data Isolation - Landlord Access Control
    fc.assert(
      fc.property(
        fc.uuid(), // landlordId1
        fc.uuid(), // landlordId2
        async (landlordId1, landlordId2) => {
          fc.pre(landlordId1 !== landlordId2) // Different landlords
          
          // Create buildings for landlord1
          const building1 = await createBuilding(landlordId1, {
            name: 'Building 1',
            address: 'Address 1'
          })
          
          // Landlord2 should not see landlord1's buildings
          const buildings = await getBuildingsByLandlord(landlordId2)
          expect(buildings).not.toContainEqual(
            expect.objectContaining({ id: building1.id })
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Test Configuration

**Property-Based Testing Setup:**
- Library: fast-check
- Minimum iterations: 100 per property
- Tag format: `Feature: quan-ly-nha-tro, Property {number}: {property_text}`
- Mỗi correctness property phải có một property-based test tương ứng

**Unit Testing Setup:**
- Framework: Vitest (hoặc Jest)
- Coverage target: 80% cho business logic
- Mock database với Prisma mock hoặc test database
- Mock external services (email, etc.)

### Test Database

Sử dụng separate test database:

```typescript
// prisma/schema.test.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
})

beforeEach(async () => {
  // Clean database before each test
  await prisma.$transaction([
    prisma.invoice.deleteMany(),
    prisma.contract.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.maintenanceRequest.deleteMany(),
    prisma.tenant.deleteMany(),
    prisma.room.deleteMany(),
    prisma.building.deleteMany(),
    prisma.landlord.deleteMany(),
    prisma.user.deleteMany(),
  ])
})
```

### Integration Tests

Test end-to-end flows:

```typescript
describe('Contract Flow Integration', () => {
  it('should create contract, generate invoices, and handle payment', async () => {
    // 1. Create landlord
    const landlord = await registerLandlord({...})
    
    // 2. Create building
    const building = await createBuilding(landlord.id, {...})
    
    // 3. Create room
    const room = await createRoom(landlord.id, {...})
    
    // 4. Create tenant
    const tenant = await createTenant(landlord.id, {...})
    
    // 5. Create contract
    const contract = await createContract(landlord.id, {
      roomId: room.id,
      tenantId: tenant.id,
      ...
    })
    
    // 6. Create invoice
    const invoice = await createInvoice(landlord.id, {
      contractId: contract.id,
      ...
    })
    
    // 7. Mark as paid
    const paidInvoice = await markInvoiceAsPaid(landlord.id, invoice.id)
    
    // Assertions
    expect(paidInvoice.paid).toBe(true)
    expect(paidInvoice.paidDate).toBeDefined()
  })
})
```

## Deployment và Performance

### Database Optimization

1. **Indexes**: Đã định nghĩa indexes cho các queries thường xuyên
2. **Connection Pooling**: Sử dụng Prisma connection pooling
3. **Query Optimization**: Sử dụng `include` và `select` để tối ưu queries

### Caching Strategy

```typescript
// Cache dashboard statistics
const cacheKey = `dashboard:${landlordId}`
const cached = await redis.get(cacheKey)

if (cached) {
  return JSON.parse(cached)
}

const stats = await calculateDashboardStats(landlordId)
await redis.set(cacheKey, JSON.stringify(stats), 'EX', 300) // 5 minutes

return stats
```

### Security Considerations

1. **SQL Injection**: Prisma ORM tự động prevent SQL injection
2. **XSS**: Sanitize user input trước khi render
3. **CSRF**: Sử dụng NextAuth.js CSRF protection
4. **Rate Limiting**: Implement rate limiting cho API endpoints
5. **Password Hashing**: Bcrypt với salt rounds = 10

### Monitoring và Logging

```typescript
// Log all errors
console.error('[ERROR]', {
  timestamp: new Date().toISOString(),
  userId: session?.user?.id,
  action: 'createBuilding',
  error: error.message,
  stack: error.stack
})

// Log important actions
console.info('[INFO]', {
  timestamp: new Date().toISOString(),
  userId: session.user.id,
  action: 'createContract',
  contractId: contract.id
})
```

## Kết Luận

Thiết kế này cung cấp một hệ thống quản lý nhà trọ multi-tenant hoàn chỉnh với:

- **Data Isolation**: Đảm bảo mỗi landlord chỉ truy cập được dữ liệu của mình
- **Role-Based Access Control**: Phân quyền rõ ràng giữa LANDLORD và TENANT
- **Comprehensive Testing**: Kết hợp unit tests và property-based tests
- **Error Handling**: Xử lý lỗi nhất quán và rõ ràng
- **Performance**: Tối ưu với indexes và caching
- **Security**: Bảo mật với authentication, authorization và input validation

Hệ thống sẵn sàng để implement theo task list sẽ được tạo trong bước tiếp theo.
