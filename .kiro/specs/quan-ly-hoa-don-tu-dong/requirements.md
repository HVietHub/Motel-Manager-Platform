# Requirements Document: Quản Lý Hóa Đơn Tự Động

## Introduction

Tính năng Quản Lý Hóa Đơn Tự Động cho phép chủ trọ tạo hóa đơn một cách nhanh chóng và chính xác bằng cách lưu trữ giá điện và giá nước ở cấp độ tòa nhà. Hệ thống tự động tính toán tổng tiền dựa trên tiền phòng, số điện tiêu thụ, và giá nước cố định, giảm thiểu sai sót nhập liệu và đảm bảo tính nhất quán.

## Glossary

- **System**: Hệ thống quản lý nhà trọ HouseSea
- **Building**: Tòa nhà/nhà trọ do chủ trọ quản lý
- **Invoice**: Hóa đơn thanh toán hàng tháng cho người thuê
- **Tenant**: Người thuê trọ
- **Room**: Phòng trọ trong tòa nhà
- **Landlord**: Chủ trọ/người quản lý tòa nhà
- **Calculator**: Module tính toán hóa đơn
- **Building_Form**: Form nhập liệu thông tin tòa nhà
- **Invoice_Form**: Form tạo hóa đơn
- **Database**: Cơ sở dữ liệu lưu trữ thông tin hệ thống

## Requirements

### Requirement 1: Quản Lý Giá Điện Nước Theo Tòa Nhà

**User Story:** Là chủ trọ, tôi muốn thiết lập giá điện và giá nước cho mỗi tòa nhà, để có thể tính toán hóa đơn tự động và nhất quán cho tất cả phòng trong tòa nhà đó.

#### Acceptance Criteria

1. WHEN a landlord creates a new building, THE Building_Form SHALL accept electricityPrice and waterPrice as input fields
2. WHEN a landlord submits building data, THE System SHALL validate that electricityPrice is greater than or equal to 0
3. WHEN a landlord submits building data, THE System SHALL validate that waterPrice is greater than or equal to 0
4. WHEN electricityPrice exceeds 10000 VND per kWh, THE System SHALL display a warning message
5. WHEN waterPrice exceeds 200000 VND per month, THE System SHALL display a warning message
6. WHEN a building is created without electricityPrice, THE System SHALL use default value of 3000 VND per kWh
7. WHEN a building is created without waterPrice, THE System SHALL use default value of 50000 VND per month
8. THE Database SHALL store electricityPrice and waterPrice for each building

### Requirement 2: Tạo Hóa Đơn Với Tính Toán Tự Động

**User Story:** Là chủ trọ, tôi muốn tạo hóa đơn bằng cách chỉ chọn người thuê và nhập số điện tiêu thụ, để hệ thống tự động tính toán tổng tiền mà không cần nhập thủ công từng khoản phí.

#### Acceptance Criteria

1. WHEN a landlord creates an invoice, THE Invoice_Form SHALL require tenantId, month, year, and electricityUsage as input
2. WHEN a landlord selects a tenant, THE System SHALL retrieve the tenant's room and building information
3. WHEN a tenant has no assigned room, THE System SHALL return error message "Người thuê chưa được gán phòng"
4. WHEN invoice data is submitted, THE Calculator SHALL set rentAmount equal to the room price
5. WHEN invoice data is submitted, THE Calculator SHALL calculate electricityAmount as electricityUsage multiplied by building electricityPrice
6. WHEN invoice data is submitted, THE Calculator SHALL set waterAmount equal to building waterPrice
7. WHEN invoice data is submitted, THE Calculator SHALL calculate totalAmount as the sum of rentAmount, electricityAmount, waterAmount, serviceAmount, and otherAmount
8. WHEN an invoice is created, THE System SHALL store electricityUsage in the invoice record
9. WHEN an invoice is created, THE System SHALL set status to "UNPAID"

### Requirement 3: Ngăn Chặn Hóa Đơn Trùng Lặp

**User Story:** Là chủ trọ, tôi muốn hệ thống ngăn chặn việc tạo nhiều hóa đơn cho cùng một người thuê trong cùng một tháng, để tránh nhầm lẫn và sai sót trong quản lý.

#### Acceptance Criteria

1. WHEN an invoice is created, THE System SHALL check if an invoice already exists for the combination of tenantId, month, and year
2. IF an invoice already exists for tenantId, month, and year, THEN THE System SHALL return error message "Hóa đơn đã tồn tại cho tháng này"
3. THE Database SHALL enforce unique constraint on the combination of tenantId, month, and year

### Requirement 4: Xác Thực Dữ Liệu Đầu Vào

**User Story:** Là chủ trọ, tôi muốn hệ thống xác thực dữ liệu đầu vào, để đảm bảo thông tin hóa đơn chính xác và hợp lệ.

#### Acceptance Criteria

1. WHEN electricityUsage is less than 0, THE System SHALL return validation error "Số điện không hợp lệ"
2. WHEN electricityUsage exceeds 1000 kWh, THE System SHALL display a warning message
3. WHEN month is less than 1 or greater than 12, THE System SHALL return validation error
4. WHEN year is less than 2020 or greater than 2100, THE System SHALL return validation error
5. THE System SHALL validate that all amount fields are non-negative numbers

### Requirement 5: Hiển Thị Preview Tính Toán

**User Story:** Là chủ trọ, tôi muốn xem trước các khoản phí được tính toán trước khi tạo hóa đơn, để có thể kiểm tra tính chính xác trước khi lưu.

#### Acceptance Criteria

1. WHEN a landlord selects a tenant in the invoice form, THE Invoice_Form SHALL display the room price
2. WHEN a landlord enters electricityUsage, THE Invoice_Form SHALL calculate and display electricityAmount in real-time
3. WHEN a landlord selects a tenant, THE Invoice_Form SHALL display the waterAmount from building
4. WHEN any amount field changes, THE Invoice_Form SHALL recalculate and display totalAmount in real-time

### Requirement 6: Đảm Bảo Tính Toàn Vẹn Dữ Liệu

**User Story:** Là quản trị viên hệ thống, tôi muốn đảm bảo tính toàn vẹn của dữ liệu hóa đơn, để thông tin tài chính luôn chính xác và đáng tin cậy.

#### Acceptance Criteria

1. THE System SHALL ensure that totalAmount equals the sum of rentAmount, electricityAmount, waterAmount, serviceAmount, and otherAmount
2. THE System SHALL ensure that electricityAmount equals electricityUsage multiplied by building electricityPrice
3. THE System SHALL ensure that waterAmount equals building waterPrice
4. THE Database SHALL enforce that all amount fields are non-negative
5. WHEN an invoice is created, THE System SHALL use database transaction to ensure atomicity

### Requirement 7: Cập Nhật Giá Điện Nước Cho Tòa Nhà

**User Story:** Là chủ trọ, tôi muốn cập nhật giá điện và giá nước cho tòa nhà, để phản ánh thay đổi giá từ nhà cung cấp dịch vụ.

#### Acceptance Criteria

1. WHEN a landlord edits a building, THE Building_Form SHALL display current electricityPrice and waterPrice
2. WHEN a landlord updates electricityPrice or waterPrice, THE System SHALL validate the new values
3. WHEN building prices are updated, THE System SHALL save the new values to the database
4. WHEN building prices are updated, THE System SHALL not affect existing invoices

### Requirement 8: Phân Quyền Truy Cập

**User Story:** Là quản trị viên hệ thống, tôi muốn đảm bảo chỉ chủ trọ có quyền tạo và quản lý hóa đơn cho người thuê của mình, để bảo vệ dữ liệu và quyền riêng tư.

#### Acceptance Criteria

1. WHEN a landlord creates an invoice, THE System SHALL verify that the tenant belongs to the landlord
2. WHEN a landlord creates an invoice, THE System SHALL verify that the landlord owns the building
3. IF a landlord attempts to create invoice for another landlord's tenant, THEN THE System SHALL return authorization error
4. THE System SHALL prevent cross-landlord data access

### Requirement 9: Lưu Trữ Lịch Sử Tiêu Thụ Điện

**User Story:** Là chủ trọ, tôi muốn lưu trữ lịch sử số điện tiêu thụ của mỗi người thuê, để có thể theo dõi xu hướng và phát hiện bất thường.

#### Acceptance Criteria

1. WHEN an invoice is created, THE System SHALL store electricityUsage value in the invoice record
2. THE Database SHALL maintain electricityUsage for all historical invoices
3. WHEN viewing invoice details, THE System SHALL display electricityUsage along with other invoice information

### Requirement 10: Xử Lý Lỗi Và Thông Báo

**User Story:** Là chủ trọ, tôi muốn nhận thông báo lỗi rõ ràng khi có vấn đề xảy ra, để có thể khắc phục nhanh chóng.

#### Acceptance Criteria

1. WHEN an error occurs during invoice creation, THE System SHALL return a descriptive error message
2. WHEN a tenant has no assigned room, THE System SHALL display error "Người thuê chưa được gán phòng"
3. WHEN a duplicate invoice is detected, THE System SHALL display error "Hóa đơn đã tồn tại cho tháng này"
4. WHEN validation fails, THE System SHALL display specific validation error messages
5. WHEN database operation fails, THE System SHALL log the error and return user-friendly message
