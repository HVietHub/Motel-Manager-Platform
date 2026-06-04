# Kế Hoạch Triển Khai - Hệ Thống Quản Lý Nhà Trọ

## Tổng Quan

Kế hoạch triển khai này chia nhỏ việc xây dựng hệ thống quản lý nhà trọ thành các bước coding cụ thể, có thể thực hiện tuần tự. Mỗi task tập trung vào việc implement một phần chức năng và validate nó thông qua tests.

## Tasks

- [x] 1. Setup dự án và cấu hình cơ bản
  - Khởi tạo Next.js 14 project với TypeScript
  - Cài đặt dependencies: Prisma, NextAuth.js, Tailwind CSS, shadcn/ui, Zod, bcrypt, fast-check
  - Cấu hình Prisma với PostgreSQL
  - Setup Tailwind CSS và shadcn/ui theme
  - Tạo file .env.example với các biến môi trường cần thiết
  - _Requirements: 21.1, 22.1_

- [x] 2. Tạo database schema và migrations
  - [x] 2.1 Tạo Prisma schema với tất cả models
    - Implement User, Landlord, Building, Room, Tenant, Contract, Invoice, Notification, MaintenanceRequest models
    - Định nghĩa relationships và indexes theo design
    - Thêm enums: Role, RoomStatus, ContractStatus, MaintenanceRequestStatus
    - _Requirements: 21.2, 21.3_
  
  - [x] 2.2 Tạo và chạy migrations
    - Generate Prisma client
    - Chạy migration để tạo database schema
    - Verify schema trong database
    - _Requirements: 21.1_
  
  - [x]* 2.3 Write property test cho auto-generated fields
    - **Property 39: Auto-generated ID and Timestamp**
    - **Validates: Requirements 21.4**

- [ ]* 3. Implement Authentication Service
  - [x]* 3.1 Tạo AuthService với password hashing
    - Implement hashPassword() sử dụng bcrypt
    - Implement verifyPassword()
    - Implement registerLandlord()
    - _Requirements: 1.1, 1.5_
  
  - [x]* 3.2 Write property tests cho authentication
    - **Property 3: Password Security**
    - **Property 4: Authentication Round Trip**
    - **Property 5: Duplicate Email Rejection**
    - **Property 6: Invalid Credentials Rejection**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
  
  - [x]* 3.3 Setup NextAuth.js configuration
    - Tạo [...nextauth]/route.ts với credentials provider
    - Implement login logic
    - Configure session strategy (JWT)
    - _Requirements: 1.3, 1.4_
  
  - [x]* 3.4 Tạo middleware cho authentication check
    - Implement middleware.ts để protect routes
    - Redirect unauthenticated users đến login page
    - _Requirements: 11.1_

- [ ]* 4. Implement Building Management
  - [ ]* 4.1 Tạo BuildingService
    - Implement createBuilding() với landlordId filter
    - Implement getBuildingsByLandlord() với data isolation
    - Implement getBuildingById() với authorization check
    - Implement updateBuilding() với ownership validation
    - Implement deleteBuilding() với room check
    - Implement hasBuildingRooms() helper
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 4.2 Write property tests cho building management
    - **Property 7: Building Creation and Ownership**
    - **Property 8: Building Update Authorization**
    - **Property 9: Building Deletion with Rooms Protection**
    - **Validates: Requirements 2.1, 2.3, 2.4, 2.5**
  
  - [ ]* 4.3 Tạo API routes cho buildings
    - POST /api/buildings - Create building
    - GET /api/buildings - List buildings
    - GET /api/buildings/[id] - Get building detail
    - PUT /api/buildings/[id] - Update building
    - DELETE /api/buildings/[id] - Delete building
    - Implement error handling và validation với Zod
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 22.2, 22.3, 22.4_

- [ ]* 5. Implement Room Management
  - [ ]* 5.1 Tạo RoomService
    - Implement createRoom() với building ownership check
    - Implement getRoomsByLandlord() với filters và data isolation
    - Implement getRoomById() với authorization
    - Implement updateRoom() với ownership validation
    - Implement deleteRoom() với active contract check
    - Implement updateRoomStatus()
    - Implement hasActiveContract() helper
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 5.2 Write property tests cho room management
    - **Property 10: Room Creation with Default Status**
    - **Property 11: Room Update Authorization**
    - **Property 12: Room Status Transition on Assignment**
    - **Property 13: Room Deletion with Active Contract Protection**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5, 3.6**
  
  - [ ]* 5.3 Tạo API routes cho rooms
    - POST /api/rooms - Create room
    - GET /api/rooms - List rooms với filters
    - GET /api/rooms/[id] - Get room detail
    - PUT /api/rooms/[id] - Update room
    - DELETE /api/rooms/[id] - Delete room
    - Implement validation và error handling
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [ ]* 6. Checkpoint - Verify building và room management
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 7. Implement Tenant Management
  - [ ]* 7.1 Tạo TenantService
    - Implement createTenant() với auto-generate password
    - Implement getTenantsByLandlord() với data isolation
    - Implement getTenantById() với authorization
    - Implement updateTenant()
    - Implement assignTenantToRoom() với room status update
    - Implement removeTenantFromRoom()
    - Implement sendLoginCredentials() (mock email service)
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  
  - [ ]* 7.2 Write property tests cho tenant management
    - **Property 14: Tenant Creation with Role**
    - **Property 15: Occupied Room Assignment Rejection**
    - **Validates: Requirements 4.1, 4.4**
  
  - [ ]* 7.3 Tạo API routes cho tenants
    - POST /api/tenants - Create tenant
    - GET /api/tenants - List tenants
    - GET /api/tenants/[id] - Get tenant detail
    - PUT /api/tenants/[id] - Update tenant
    - POST /api/tenants/[id]/assign-room - Assign to room
    - POST /api/tenants/[id]/remove-room - Remove from room
    - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 8. Implement Contract Management
  - [ ]* 8.1 Tạo ContractService
    - Implement createContract() với date validation
    - Implement getContractsByLandlord() với filters
    - Implement getContractsByTenant()
    - Implement getContractById()
    - Implement updateContract()
    - Implement terminateContract() với room release
    - Implement updateExpiredContracts() (cron job logic)
    - Implement validateContractDates()
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 8.2 Write property tests cho contract management
    - **Property 16: Contract Creation with Active Status**
    - **Property 17: Contract Date Validation**
    - **Property 18: Contract Termination and Room Release**
    - **Validates: Requirements 5.1, 5.4, 5.5**
  
  - [ ]* 8.3 Tạo API routes cho contracts
    - POST /api/contracts - Create contract
    - GET /api/contracts - List contracts với filters
    - GET /api/contracts/[id] - Get contract detail
    - PUT /api/contracts/[id] - Update contract
    - POST /api/contracts/[id]/terminate - Terminate contract
    - _Requirements: 5.1, 5.2, 5.4_

- [ ]* 9. Implement Invoice Management
  - [ ]* 9.1 Tạo InvoiceService
    - Implement createInvoice() với duplicate check
    - Implement getInvoicesByLandlord() với filters
    - Implement getInvoicesByTenant() với sorting
    - Implement getInvoiceById()
    - Implement updateInvoice()
    - Implement markInvoiceAsPaid()
    - Implement calculateInvoiceTotal()
    - Implement validateInvoiceMonthYear()
    - Implement checkDuplicateInvoice()
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 8.1, 8.4_
  
  - [ ]* 9.2 Write property tests cho invoice management
    - **Property 19: Invoice Creation with Unpaid Status**
    - **Property 20: Invoice Total Calculation**
    - **Property 21: Invoice Month/Year Validation**
    - **Property 22: Duplicate Invoice Rejection**
    - **Property 23: Invoice Payment Status Update**
    - **Property 24: Invoice Sorting Order**
    - **Validates: Requirements 6.1, 6.3, 6.4, 6.5, 6.6, 8.4**
  
  - [ ]* 9.3 Tạo API routes cho invoices
    - POST /api/invoices - Create invoice
    - GET /api/invoices - List invoices với filters
    - GET /api/invoices/[id] - Get invoice detail
    - PUT /api/invoices/[id] - Update invoice
    - POST /api/invoices/[id]/mark-paid - Mark as paid
    - _Requirements: 6.1, 6.2, 6.3, 8.1_

- [ ]* 10. Checkpoint - Verify core business logic
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 11. Implement Notification System
  - [ ]* 11.1 Tạo NotificationService
    - Implement createNotification()
    - Implement createBroadcastNotification()
    - Implement getNotificationsByTenant()
    - Implement markNotificationAsRead()
    - Implement countUnreadNotifications()
    - Implement getTenantIdsByLandlord() helper
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 11.2 Write property tests cho notifications
    - **Property 25: Notification Creation with Unread Status**
    - **Property 26: Broadcast Notification Coverage**
    - **Property 27: Notification Read Status Update**
    - **Property 28: Unread Notification Count Accuracy**
    - **Validates: Requirements 9.1, 9.2, 9.4, 9.5**
  
  - [ ]* 11.3 Tạo API routes cho notifications
    - POST /api/notifications - Create notification
    - POST /api/notifications/broadcast - Broadcast notification
    - GET /api/notifications - List notifications (tenant)
    - POST /api/notifications/[id]/mark-read - Mark as read
    - GET /api/notifications/unread-count - Get unread count
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 12. Implement Maintenance Request System
  - [ ]* 12.1 Tạo MaintenanceService
    - Implement createMaintenanceRequest()
    - Implement getMaintenanceRequestsByLandlord() với filters
    - Implement getMaintenanceRequestsByTenant()
    - Implement getMaintenanceRequestById()
    - Implement updateMaintenanceStatus()
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 12.2 Write property tests cho maintenance requests
    - **Property 29: Maintenance Request Creation with Pending Status**
    - **Property 30: Maintenance Request Status Update**
    - **Validates: Requirements 10.1, 10.3**
  
  - [ ]* 12.3 Tạo API routes cho maintenance requests
    - POST /api/maintenance - Create request (tenant)
    - GET /api/maintenance - List requests
    - GET /api/maintenance/[id] - Get request detail
    - PUT /api/maintenance/[id]/status - Update status (landlord)
    - _Requirements: 10.1, 10.2, 10.4_

- [ ]* 13. Implement Report và Statistics
  - [ ]* 13.1 Tạo ReportService
    - Implement getRevenueReport()
    - Implement getDebtReport()
    - Implement getRoomStatistics()
    - Implement getMonthlyRevenue()
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ]* 13.2 Write property tests cho reports
    - **Property 32: Revenue Calculation Accuracy**
    - **Property 33: Debt Calculation Accuracy**
    - **Property 34: Room Statistics Accuracy**
    - **Validates: Requirements 12.1, 12.2, 12.3**
  
  - [ ]* 13.3 Tạo API routes cho reports
    - GET /api/reports/revenue - Revenue report
    - GET /api/reports/debt - Debt report
    - GET /api/reports/room-statistics - Room statistics
    - GET /api/reports/monthly-revenue - Monthly revenue
    - _Requirements: 12.1, 12.2, 12.3_

- [ ]* 14. Implement Data Isolation và Authorization
  - [ ]* 14.1 Write property tests cho data isolation
    - **Property 1: Data Isolation - Landlord Access Control**
    - **Property 2: Data Isolation - Tenant Access Control**
    - **Property 31: Unauthorized Access Rejection**
    - **Validates: Requirements 2.2, 3.2, 4.3, 5.2, 6.2, 7.2, 7.3, 8.1, 9.3, 10.2, 10.4, 11.2, 11.3, 11.4**
  
  - [ ]* 14.2 Implement authorization helpers
    - Tạo lib/auth/authorization.ts với helper functions
    - checkLandlordOwnership()
    - checkTenantOwnership()
    - Integrate vào tất cả API routes
    - _Requirements: 11.2, 11.3, 11.4_

- [ ]* 15. Checkpoint - Verify security và authorization
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 16. Implement Validation Utilities
  - [ ]* 16.1 Tạo validation schemas với Zod
    - Email validation schema
    - Phone number validation schema
    - Date range validation schema
    - Invoice month/year validation schema
    - Schemas cho tất cả entities
    - _Requirements: 15.4, 15.5, 22.6_
  
  - [ ]* 16.2 Write property tests cho validation
    - **Property 35: Email Validation**
    - **Property 36: Phone Number Validation**
    - **Validates: Requirements 15.4, 15.5**

- [ ]* 17. Implement API Error Handling
  - [ ]* 17.1 Write property tests cho API responses
    - **Property 40: API Success Response Format**
    - **Property 41: API Client Error Response**
    - **Property 42: API Authentication Error Response**
    - **Property 43: API Server Error Response**
    - **Validates: Requirements 22.2, 22.3, 22.4, 22.5**
  
  - [ ]* 17.2 Tạo error handling utilities
    - Tạo lib/errors/api-errors.ts
    - Implement error response formatters
    - Implement error logging
    - _Requirements: 22.3, 22.4, 22.5_

- [x] 18. Build Landlord Dashboard UI
  - [x] 18.1 Tạo layout và navigation
    - Implement app/(dashboard)/layout.tsx với sidebar
    - Implement components/sidebar.tsx với menu items
    - Implement responsive sidebar (drawer on mobile)
    - Implement header với user dropdown
    - Update branding to "HomeLink" với slogan "Kết nối ngôi nhà của bạn"
    - _Requirements: 13.1, 13.2, 13.3, 14.3, 14.5_
  
  - [x] 18.2 Implement dashboard page
    - Tạo app/(dashboard)/dashboard/page.tsx
    - Fetch và display statistics (total rooms, available rooms, revenue, debt)
    - Implement loading states với skeleton
    - Cải thiện UI với modern card-based layout
    - _Requirements: 14.1_
  
  - [x] 18.3 Implement buildings page
    - Tạo app/(dashboard)/buildings/page.tsx
    - Display buildings table với search và sort
    - Implement create/edit/delete modals
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 17.2, 17.4, 18.1, 18.2_
  
  - [x] 18.4 Implement rooms page
    - Tạo app/(dashboard)/rooms/page.tsx
    - Display rooms table với filters (building, status)
    - Implement create/edit/delete modals
    - Implement smart building selection (auto-select when 1 building, hide when 0, dropdown when 2+)
    - Support flexible room numbering (101, P1, A, B...)
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_
  
  - [x] 18.5 Implement tenants page
    - Tạo app/(dashboard)/tenants/page.tsx
    - Display tenants table
    - Implement create/edit modals
    - Implement assign/remove room actions
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 18.6 Implement contracts page
    - Tạo app/(dashboard)/contracts/page.tsx
    - Display contracts table với filters
    - Implement create/edit modals
    - Implement terminate action
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [x] 18.7 Implement invoices page
    - Tạo app/(dashboard)/invoices/page.tsx
    - Display invoices table với filters
    - Implement create/edit modals
    - Implement mark as paid action
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 18.8 Implement notifications page
    - Tạo app/(dashboard)/notifications/page.tsx
    - Implement create notification form
    - Implement broadcast notification
    - _Requirements: 9.1, 9.2_
  
  - [x] 18.9 Implement maintenance requests page
    - Tạo app/(dashboard)/maintenance/page.tsx
    - Display maintenance requests table
    - Implement status update action
    - _Requirements: 10.2, 10.3_

- [x] 19. Build Tenant Dashboard UI
  - [x] 19.1 Implement tenant dashboard page
    - Tạo app/(tenant)/dashboard/page.tsx
    - Display room info, unpaid invoices, new notifications
    - _Requirements: 14.2_
  
  - [x] 19.2 Implement tenant room info page
    - Tạo app/(tenant)/room/page.tsx
    - Display room details, building info
    - Fix API error handling for tenant room data
    - _Requirements: 7.2, 7.4_
  
  - [x] 19.3 Implement tenant contracts page
    - Tạo app/(tenant)/contracts/page.tsx
    - Display tenant's contracts
    - _Requirements: 7.3_
  
  - [x] 19.4 Implement tenant invoices page
    - Tạo app/(tenant)/invoices/page.tsx
    - Display invoices với payment history
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 19.5 Implement tenant notifications page
    - Tạo app/(tenant)/notifications/page.tsx
    - Display notifications với unread count
    - Implement mark as read
    - _Requirements: 9.3, 9.4, 9.5_
  
  - [x] 19.6 Implement tenant maintenance requests page
    - Tạo app/(tenant)/maintenance/page.tsx
    - Display tenant's requests
    - Implement create request form
    - _Requirements: 10.1, 10.4, 10.5_

- [ ]* 20. Checkpoint - Verify UI functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 20.1 Write property tests for new UI features
  - [ ]* 20.1.1 Property test for smart building selection
    - **Property 44: Smart Building Selection - Auto-select Single Building**
    - **Property 45: Smart Building Selection - Disable When No Buildings**
    - **Property 46: Smart Building Selection - Show Dropdown For Multiple Buildings**
    - **Validates: Requirements 3.7, 3.8, 3.9**
  
  - [ ]* 20.1.2 Property test for login error handling
    - **Property 47: Login Error Display Below Input**
    - **Property 48: Login Shake Animation On Error**
    - **Validates: Requirements 15.7, 15.8**

- [x] 21. Implement Shared UI Components
  - [x] 21.1 Tạo reusable components
    - DataTable component với sorting và pagination
    - SearchBox component với debounce
    - Modal component
    - ConfirmDialog component
    - LoadingSpinner và Skeleton components
    - Toast notification component
    - _Requirements: 16.1, 16.2, 16.4, 17.1, 17.2, 17.3, 17.4, 17.6, 18.3, 18.4_
  
  - [ ]* 21.2 Write property tests cho UI utilities
    - **Property 37: Table Sorting Consistency**
    - **Property 38: Search Filter Accuracy**
    - **Validates: Requirements 17.2, 17.4**

- [x] 22. Implement Form Components
  - [x] 22.1 Tạo form components với validation
    - BuildingForm component
    - RoomForm component
    - TenantForm component
    - ContractForm component
    - InvoiceForm component
    - NotificationForm component
    - MaintenanceRequestForm component
    - Integrate React Hook Form và Zod validation
    - _Requirements: 15.1, 15.2, 15.3, 15.6_

- [x] 23. Implement Authentication Pages
  - [x] 23.1 Tạo login page
    - Tạo app/login/page.tsx
    - Implement login form với validation
    - Handle authentication errors
    - Update branding to "HomeLink"
    - Implement error display below input fields (không dùng toast)
    - Implement shake animation on login failure
    - _Requirements: 1.3, 1.4, 15.7, 15.8_
  
  - [x] 23.2 Tạo register page
    - Tạo app/register/page.tsx
    - Implement registration form cho landlord
    - Handle validation và duplicate email errors
    - Update branding to "HomeLink"
    - _Requirements: 1.1, 1.2_

- [x] 24. Styling và Theme
  - [x] 24.1 Configure Tailwind theme
    - Setup color palette (primary, success, danger, warning)
    - Configure typography với Inter font
    - Setup spacing scale
    - Configure border radius và shadows
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.6_
  
  - [x] 24.2 Implement hover effects và transitions
    - Add hover states cho buttons và clickable elements
    - Add focus rings cho accessibility
    - _Requirements: 19.5, 20.5_

- [x] 25. Accessibility Improvements
  - [x] 25.1 Implement semantic HTML
    - Use proper HTML5 tags (header, nav, main, footer, article, section)
    - Add alt text cho images
    - Add aria-labels cho icon buttons
    - _Requirements: 20.1, 20.2, 20.6_
  
  - [x] 25.2 Implement keyboard navigation
    - Ensure Tab navigation works
    - Handle Enter và Escape keys
    - Ensure focus management in modals
    - _Requirements: 20.4_
  
  - [x] 25.3 Verify color contrast
    - Check contrast ratios cho text
    - Adjust colors if needed
    - _Requirements: 20.3_

- [ ]* 26. Final Integration và Testing
  - [ ]* 26.1 Run all property-based tests
    - Verify all 43 properties pass với 100+ iterations
    - Fix any failing tests
  
  - [ ]* 26.2 Run all unit tests
    - Verify test coverage >= 80%
    - Fix any failing tests
  
  - [ ]* 26.3 Integration testing
    - Test complete user flows (landlord và tenant)
    - Test error scenarios
    - Test edge cases

- [ ]* 27. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- **Branding**: Hệ thống đã được đổi tên thành "HomeLink" với slogan "Kết nối ngôi nhà của bạn"
- **Ưu tiên**: Tasks 1, 2, 18-25 (Setup + Frontend UI) đã hoàn thành
- **Tiến độ**: Landlord Dashboard (100%), Tenant Dashboard (100%), Authentication (100%)
- **Cải tiến đã thực hiện**:
  - Smart building selection trong room management
  - Login error display với shake animation
  - Modern UI với gradient và card-based layout
  - Tenant room page API error handling
- Tasks được đánh dấu `*` là optional và có thể skip để tập trung vào frontend
- Backend services (tasks 3-17) có thể implement sau khi UI đã được approve
- Testing tasks có thể thêm sau khi core functionality hoàn thành
- Mỗi task references specific requirements để đảm bảo traceability
- Tất cả code phải follow TypeScript best practices
- Sử dụng Prisma ORM cho database operations
- Sử dụng NextAuth.js cho authentication
- Sử dụng Zod cho validation
- Sử dụng fast-check cho property-based testing
