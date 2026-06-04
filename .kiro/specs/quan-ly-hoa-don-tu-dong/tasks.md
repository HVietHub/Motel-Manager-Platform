# Implementation Plan: Quản Lý Hóa Đơn Tự Động

## Overview

Tính năng này tự động hóa việc tính toán hóa đơn bằng cách lưu trữ giá điện và nước ở cấp độ tòa nhà. Chủ trọ chỉ cần chọn người thuê và nhập số điện tiêu thụ, hệ thống sẽ tự động tính toán tổng tiền dựa trên tiền phòng, giá điện × số điện, và giá nước cố định.

## Tasks

- [x] 1. Cập nhật database schema và migration
  - Thêm trường `electricityPrice` và `waterPrice` vào Building model
  - Thêm trường `electricityUsage` vào Invoice model
  - Tạo migration file với default values (electricityPrice: 3000, waterPrice: 50000)
  - Chạy migration để cập nhật database
  - _Requirements: 1.2, 1.3, 1.6, 1.7, 1.8, 2.8_

- [ ]* 1.1 Write property test for building prices persistence
  - **Property 8: Building Price Persistence Round-Trip**
  - **Validates: Requirements 1.8**

- [x] 2. Implement invoice calculator service
  - [x] 2.1 Tạo invoice calculator service với function calculateInvoiceAmount()
    - Implement calculation logic: electricityAmount = electricityUsage × electricityPrice
    - Implement calculation logic: totalAmount = sum of all amounts
    - Validate all inputs are non-negative
    - Return InvoiceCalculation object
    - _Requirements: 2.5, 2.6, 2.7, 6.1, 6.2, 6.3_
  
  - [ ]* 2.2 Write property test for invoice total calculation
    - **Property 1: Invoice Total Calculation Correctness**
    - **Validates: Requirements 2.7, 6.1**
  
  - [ ]* 2.3 Write property test for electricity amount calculation
    - **Property 2: Electricity Amount Calculation**
    - **Validates: Requirements 2.5, 6.2**
  
  - [ ]* 2.4 Write property test for non-negative amounts
    - **Property 4: Non-Negative Amounts**
    - **Validates: Requirements 4.5, 6.4**
  
  - [ ]* 2.5 Write unit tests for calculator service
    - Test với các giá trị electricity usage khác nhau
    - Test edge cases (0 kWh, 1000 kWh)
    - Test với serviceAmount và otherAmount optional
    - _Requirements: 2.5, 2.6, 2.7_

- [x] 3. Cập nhật Building API và validation
  - [x] 3.1 Cập nhật POST /api/buildings endpoint
    - Accept electricityPrice và waterPrice trong request body
    - Validate electricityPrice >= 0
    - Validate waterPrice >= 0
    - Display warning nếu electricityPrice > 10000
    - Display warning nếu waterPrice > 200000
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 3.2 Cập nhật PUT /api/buildings/[id] endpoint
    - Support update electricityPrice và waterPrice
    - Validate new values
    - Ensure existing invoices không bị ảnh hưởng
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 3.3 Write property test for building prices validation
    - **Property 7: Building Prices Non-Negative**
    - **Validates: Requirements 1.2, 1.3**
  
  - [ ]* 3.4 Write unit tests for building API
    - Test create building với valid prices
    - Test create building với invalid prices
    - Test update building prices
    - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Cập nhật Building Form component
  - [x] 5.1 Thêm input fields cho electricityPrice và waterPrice
    - Add number input cho electricityPrice với label "Giá điện (VNĐ/kWh)"
    - Add number input cho waterPrice với label "Giá nước (VNĐ/tháng)"
    - Set default values: electricityPrice = 3000, waterPrice = 50000
    - Add validation: both fields >= 0
    - Display warning nếu giá trị quá cao
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [x] 5.2 Cập nhật edit building form
    - Display current electricityPrice và waterPrice
    - Allow update values
    - Validate on submit
    - _Requirements: 7.1, 7.2_

- [x] 6. Implement invoice creation với auto-calculation
  - [x] 6.1 Tạo createInvoiceWithAutoCalculation service function
    - Validate input data (tenantId, month, year, electricityUsage)
    - Fetch tenant with room and building (single query với include)
    - Check tenant has assigned room, return error nếu không
    - Check duplicate invoice (tenantId, month, year)
    - Calculate amounts using calculator service
    - Create invoice với status "UNPAID"
    - Use database transaction
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 6.2 Write property test for tenant must have room
    - **Property 6: Tenant Must Have Room**
    - **Validates: Requirement 2.3**
  
  - [ ]* 6.3 Write property test for invoice uniqueness
    - **Property 5: Invoice Uniqueness**
    - **Validates: Requirements 3.1, 3.3**
  
  - [ ]* 6.4 Write property test for rent amount assignment
    - **Property 13: Rent Amount Assignment**
    - **Validates: Requirement 2.4**
  
  - [ ]* 6.5 Write property test for initial invoice status
    - **Property 14: Initial Invoice Status**
    - **Validates: Requirement 2.9**
  
  - [ ]* 6.6 Write unit tests for invoice creation service
    - Test successful invoice creation
    - Test error: tenant has no room
    - Test error: duplicate invoice
    - Test calculation correctness
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [x] 7. Cập nhật Invoice API endpoint
  - [x] 7.1 Cập nhật POST /api/invoices endpoint
    - Accept tenantId, month, year, electricityUsage (không còn electricityAmount)
    - Validate electricityUsage >= 0
    - Validate month between 1-12
    - Validate year between 2020-2100
    - Display warning nếu electricityUsage > 1000
    - Call createInvoiceWithAutoCalculation service
    - Return created invoice với all relations
    - Handle errors với descriptive messages
    - _Requirements: 2.1, 4.1, 4.2, 4.3, 4.4, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 7.2 Implement authorization checks
    - Verify tenant belongs to landlord
    - Verify landlord owns building
    - Return authorization error nếu không hợp lệ
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 7.3 Write property test for authorization enforcement
    - **Property 12: Authorization Enforcement**
    - **Validates: Requirements 8.1, 8.2**
  
  - [ ]* 7.4 Write property test for input validation boundaries
    - **Property 10: Input Validation Boundaries**
    - **Validates: Requirements 4.1, 4.3, 4.4**
  
  - [ ]* 7.5 Write integration tests for invoice API
    - Test end-to-end invoice creation flow
    - Test error scenarios
    - Test authorization
    - _Requirements: 2.1, 2.2, 2.3, 8.1, 8.2_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Cập nhật Invoice Form component
  - [x] 9.1 Simplify invoice form inputs
    - Remove electricityAmount input field
    - Add electricityUsage input field với label "Số điện tiêu thụ (kWh)"
    - Keep tenantId, month, year, serviceAmount, otherAmount fields
    - Validate electricityUsage >= 0
    - Display warning nếu electricityUsage > 1000
    - _Requirements: 2.1, 4.1, 4.2_
  
  - [x] 9.2 Implement real-time calculation preview
    - Fetch tenant's room and building khi tenant được chọn
    - Display roomPrice từ tenant's room
    - Calculate và display electricityAmount = electricityUsage × building.electricityPrice
    - Display waterAmount từ building.waterPrice
    - Calculate và display totalAmount real-time khi values change
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 9.3 Write property test for UI calculation reactivity
    - **Property 15: UI Calculation Reactivity**
    - **Validates: Requirements 5.2, 5.4**
  
  - [ ]* 9.4 Write unit tests for invoice form
    - Test form validation
    - Test preview calculation
    - Test form submission
    - _Requirements: 2.1, 4.1, 5.1, 5.2, 5.3, 5.4_

- [x] 10. Cập nhật Invoice display components
  - [x] 10.1 Update invoice list/detail views
    - Display electricityUsage trong invoice details
    - Display breakdown: rentAmount, electricityAmount, waterAmount
    - Show calculation formula trong tooltip hoặc expandable section
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 10.2 Update invoice table columns
    - Add electricityUsage column nếu cần
    - Ensure totalAmount hiển thị chính xác
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 11. Implement error handling và user feedback
  - [x] 11.1 Add error messages cho các scenarios
    - "Người thuê chưa được gán phòng" khi tenant has no room
    - "Hóa đơn đã tồn tại cho tháng này" khi duplicate invoice
    - "Số điện không hợp lệ" khi electricityUsage < 0
    - Validation errors cho month/year
    - Authorization errors
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 11.2 Add success notifications
    - Success message khi invoice created
    - Success message khi building prices updated
    - _Requirements: 10.1_

- [ ]* 12. Write property test for building price update isolation
  - **Property 11: Building Price Update Isolation**
  - **Validates: Requirement 7.4**

- [ ]* 13. Write property test for electricity usage persistence
  - **Property 9: ElectricityUsage Persistence Round-Trip**
  - **Validates: Requirements 2.8, 9.1**

- [ ]* 14. Write property test for water amount assignment
  - **Property 3: Water Amount Assignment**
  - **Validates: Requirements 2.6, 6.3**

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional và có thể skip cho faster MVP
- Mỗi task references specific requirements để traceability
- Checkpoints đảm bảo incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples và edge cases
- Implementation sử dụng TypeScript với Next.js 14, Prisma ORM, React Hook Form, và Zod validation
