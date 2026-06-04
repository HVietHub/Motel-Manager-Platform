# Tài Liệu Yêu Cầu - HomeLink

## Giới Thiệu

HomeLink là một nền tảng SaaS multi-tenant cho phép nhiều chủ nhà quản lý tòa nhà, phòng trọ, người thuê, hóa đơn và hợp đồng của riêng mình. Người thuê có thể đăng nhập để xem thông tin phòng, hóa đơn và giao tiếp với chủ nhà. Slogan: "Kết nối ngôi nhà của bạn".

## Thuật Ngữ

- **System**: Hệ thống Quản Lý Nhà Trọ
- **Landlord**: Chủ nhà - người sở hữu và quản lý tòa nhà/phòng trọ
- **Tenant**: Người thuê - người thuê phòng trọ
- **Building**: Tòa nhà/dãy trọ
- **Room**: Phòng trọ
- **Contract**: Hợp đồng thuê phòng
- **Invoice**: Hóa đơn thanh toán hàng tháng
- **Notification**: Thông báo
- **MaintenanceRequest**: Yêu cầu bảo trì/sửa chữa
- **User**: Người dùng hệ thống (có thể là Landlord hoặc Tenant)
- **Authentication**: Xác thực người dùng
- **Authorization**: Phân quyền truy cập

## Yêu Cầu

### Yêu Cầu 1: Đăng Ký và Xác Thực Chủ Nhà

**User Story:** Là một chủ nhà, tôi muốn đăng ký tài khoản và đăng nhập vào hệ thống, để tôi có thể quản lý nhà trọ của mình.

#### Tiêu Chí Chấp Nhận

1. WHEN một chủ nhà cung cấp email, mật khẩu, tên và số điện thoại hợp lệ, THEN THE System SHALL tạo tài khoản mới với vai trò LANDLORD
2. WHEN một chủ nhà cung cấp email đã tồn tại, THEN THE System SHALL từ chối đăng ký và trả về thông báo lỗi
3. WHEN một chủ nhà cung cấp thông tin đăng nhập hợp lệ, THEN THE System SHALL xác thực và tạo phiên đăng nhập
4. WHEN một chủ nhà cung cấp thông tin đăng nhập không hợp lệ, THEN THE System SHALL từ chối đăng nhập và trả về thông báo lỗi
5. THE System SHALL mã hóa mật khẩu bằng bcrypt trước khi lưu vào cơ sở dữ liệu

### Yêu Cầu 2: Quản Lý Tòa Nhà

**User Story:** Là một chủ nhà, tôi muốn tạo và quản lý nhiều tòa nhà/dãy trọ, để tôi có thể tổ chức các phòng trọ theo từng tòa nhà.

#### Tiêu Chí Chấp Nhận

1. WHEN một chủ nhà tạo tòa nhà mới với tên và địa chỉ hợp lệ, THEN THE System SHALL tạo tòa nhà và liên kết với chủ nhà đó
2. WHEN một chủ nhà xem danh sách tòa nhà, THEN THE System SHALL chỉ hiển thị các tòa nhà thuộc sở hữu của chủ nhà đó
3. WHEN một chủ nhà cập nhật thông tin tòa nhà, THEN THE System SHALL lưu thay đổi nếu chủ nhà là người sở hữu tòa nhà
4. WHEN một chủ nhà xóa tòa nhà không có phòng trọ nào, THEN THE System SHALL xóa tòa nhà khỏi cơ sở dữ liệu
5. IF một chủ nhà cố gắng xóa tòa nhà có phòng trọ, THEN THE System SHALL từ chối và trả về thông báo lỗi

### Yêu Cầu 3: Quản Lý Phòng Trọ

**User Story:** Là một chủ nhà, tôi muốn tạo và quản lý phòng trọ trong các tòa nhà của mình, để tôi có thể cho thuê và theo dõi trạng thái phòng.

#### Tiêu Chí Chấp Nhận

1. WHEN một chủ nhà tạo phòng mới với tên, diện tích, giá thuê và tòa nhà hợp lệ, THEN THE System SHALL tạo phòng với trạng thái AVAILABLE
2. WHEN một chủ nhà xem danh sách phòng, THEN THE System SHALL chỉ hiển thị các phòng thuộc tòa nhà của chủ nhà đó
3. WHEN một chủ nhà cập nhật thông tin phòng, THEN THE System SHALL lưu thay đổi nếu phòng thuộc tòa nhà của chủ nhà
4. WHEN một phòng được gán cho người thuê, THEN THE System SHALL cập nhật trạng thái phòng thành OCCUPIED
5. WHEN một chủ nhà xóa phòng không có hợp đồng đang hoạt động, THEN THE System SHALL xóa phòng khỏi cơ sở dữ liệu
6. IF một chủ nhà cố gắng xóa phòng có hợp đồng đang hoạt động, THEN THE System SHALL từ chối và trả về thông báo lỗi
7. WHEN chủ nhà chưa có tòa nhà nào (0 buildings), THEN THE System SHALL hiển thị cảnh báo và disable nút "Tạo Phòng"
8. WHEN chủ nhà có đúng 1 tòa nhà, THEN THE System SHALL tự động chọn tòa nhà đó và không hiển thị dropdown chọn tòa nhà
9. WHEN chủ nhà có 2 tòa nhà trở lên, THEN THE System SHALL hiển thị dropdown để chủ nhà chọn tòa nhà
10. THE System SHALL hỗ trợ linh hoạt cả nhà nhiều tầng (101, 102, 201...) và dãy phòng trọ ngang (P1, P2, A, B...)

### Yêu Cầu 4: Quản Lý Người Thuê

**User Story:** Là một chủ nhà, tôi muốn tạo tài khoản cho người thuê và gán họ vào phòng, để họ có thể đăng nhập và xem thông tin của mình.

#### Tiêu Chí Chấp Nhận

1. WHEN một chủ nhà tạo tài khoản người thuê với email, tên, số điện thoại và CMND hợp lệ, THEN THE System SHALL tạo tài khoản với vai trò TENANT
2. WHEN một chủ nhà gán người thuê vào phòng trống, THEN THE System SHALL cập nhật roomId của người thuê và trạng thái phòng thành OCCUPIED
3. WHEN một chủ nhà xem danh sách người thuê, THEN THE System SHALL chỉ hiển thị người thuê trong các phòng thuộc tòa nhà của chủ nhà đó
4. IF một chủ nhà cố gắng gán người thuê vào phòng đã có người ở, THEN THE System SHALL từ chối và trả về thông báo lỗi
5. WHEN một người thuê được tạo, THEN THE System SHALL gửi thông tin đăng nhập cho người thuê qua email

### Yêu Cầu 5: Quản Lý Hợp Đồng

**User Story:** Là một chủ nhà, tôi muốn tạo và quản lý hợp đồng thuê phòng, để có bằng chứng pháp lý về quan hệ thuê trọ.

#### Tiêu Chí Chấp Nhận

1. WHEN một chủ nhà tạo hợp đồng với phòng, người thuê, ngày bắt đầu, ngày kết thúc và giá thuê hợp lệ, THEN THE System SHALL tạo hợp đồng với trạng thái ACTIVE
2. WHEN một chủ nhà xem danh sách hợp đồng, THEN THE System SHALL chỉ hiển thị hợp đồng liên quan đến tòa nhà của chủ nhà đó
3. WHEN ngày hiện tại vượt quá ngày kết thúc hợp đồng, THEN THE System SHALL tự động cập nhật trạng thái hợp đồng thành EXPIRED
4. WHEN một chủ nhà kết thúc hợp đồng sớm, THEN THE System SHALL cập nhật trạng thái hợp đồng thành TERMINATED và giải phóng phòng
5. FOR ALL hợp đồng, ngày bắt đầu phải nhỏ hơn ngày kết thúc

### Yêu Cầu 6: Quản Lý Hóa Đơn

**User Story:** Là một chủ nhà, tôi muốn tạo hóa đơn hàng tháng cho người thuê, để thu tiền phòng, điện, nước và các phí khác.

#### Tiêu Chí Chấp Nhận

1. WHEN một chủ nhà tạo hóa đơn với hợp đồng, tháng, năm, tiền phòng, tiền điện, tiền nước và phí khác hợp lệ, THEN THE System SHALL tạo hóa đơn với trạng thái chưa thanh toán
2. WHEN một chủ nhà xem danh sách hóa đơn, THEN THE System SHALL chỉ hiển thị hóa đơn liên quan đến tòa nhà của chủ nhà đó
3. WHEN một chủ nhà đánh dấu hóa đơn đã thanh toán, THEN THE System SHALL cập nhật trạng thái paid thành true và lưu ngày thanh toán
4. THE System SHALL tự động tính tổng tiền hóa đơn bằng tổng của tiền phòng, tiền điện, tiền nước và phí khác
5. FOR ALL hóa đơn, tháng phải nằm trong khoảng 1-12 và năm phải là số dương
6. IF một chủ nhà cố gắng tạo hóa đơn trùng tháng/năm cho cùng một hợp đồng, THEN THE System SHALL từ chối và trả về thông báo lỗi

### Yêu Cầu 7: Xem Thông Tin Người Thuê

**User Story:** Là một người thuê, tôi muốn đăng nhập và xem thông tin phòng của mình, để biết chi tiết về nơi tôi đang thuê.

#### Tiêu Chí Chấp Nhận

1. WHEN một người thuê đăng nhập với thông tin hợp lệ, THEN THE System SHALL xác thực và tạo phiên đăng nhập với vai trò TENANT
2. WHEN một người thuê xem thông tin phòng, THEN THE System SHALL chỉ hiển thị thông tin phòng mà người thuê đang thuê
3. WHEN một người thuê xem thông tin hợp đồng, THEN THE System SHALL chỉ hiển thị hợp đồng của người thuê đó
4. THE System SHALL hiển thị tên phòng, diện tích, giá thuê, tên tòa nhà và địa chỉ cho người thuê

### Yêu Cầu 8: Xem Hóa Đơn Người Thuê

**User Story:** Là một người thuê, tôi muốn xem danh sách hóa đơn và chi tiết hóa đơn của mình, để biết số tiền cần thanh toán hàng tháng.

#### Tiêu Chí Chấp Nhận

1. WHEN một người thuê xem danh sách hóa đơn, THEN THE System SHALL chỉ hiển thị hóa đơn của người thuê đó
2. WHEN một người thuê xem chi tiết hóa đơn, THEN THE System SHALL hiển thị tháng, năm, tiền phòng, tiền điện, tiền nước, phí khác, tổng tiền và trạng thái thanh toán
3. WHEN một người thuê xem lịch sử thanh toán, THEN THE System SHALL hiển thị danh sách các hóa đơn đã thanh toán với ngày thanh toán
4. THE System SHALL sắp xếp hóa đơn theo thứ tự từ mới nhất đến cũ nhất

### Yêu Cầu 9: Quản Lý Thông Báo

**User Story:** Là một chủ nhà, tôi muốn gửi thông báo cho người thuê, để thông tin họ về các vấn đề quan trọng.

#### Tiêu Chí Chấp Nhận

1. WHEN một chủ nhà tạo thông báo với tiêu đề, nội dung và người thuê hợp lệ, THEN THE System SHALL tạo thông báo với trạng thái chưa đọc
2. WHEN một chủ nhà gửi thông báo chung, THEN THE System SHALL tạo thông báo cho tất cả người thuê trong các tòa nhà của chủ nhà đó
3. WHEN một người thuê xem danh sách thông báo, THEN THE System SHALL chỉ hiển thị thông báo gửi cho người thuê đó
4. WHEN một người thuê đọc thông báo, THEN THE System SHALL cập nhật trạng thái thông báo thành đã đọc
5. THE System SHALL hiển thị số lượng thông báo chưa đọc cho người thuê

### Yêu Cầu 10: Quản Lý Yêu Cầu Bảo Trì

**User Story:** Là một người thuê, tôi muốn gửi yêu cầu bảo trì/sửa chữa cho chủ nhà, để các vấn đề trong phòng được xử lý kịp thời.

#### Tiêu Chí Chấp Nhận

1. WHEN một người thuê tạo yêu cầu bảo trì với tiêu đề và mô tả hợp lệ, THEN THE System SHALL tạo yêu cầu với trạng thái PENDING
2. WHEN một chủ nhà xem danh sách yêu cầu bảo trì, THEN THE System SHALL chỉ hiển thị yêu cầu từ người thuê trong các tòa nhà của chủ nhà đó
3. WHEN một chủ nhà cập nhật trạng thái yêu cầu bảo trì, THEN THE System SHALL lưu trạng thái mới (IN_PROGRESS, COMPLETED, REJECTED)
4. WHEN một người thuê xem danh sách yêu cầu bảo trì, THEN THE System SHALL chỉ hiển thị yêu cầu của người thuê đó
5. THE System SHALL hiển thị thông tin phòng, tiêu đề, mô tả, trạng thái và ngày tạo cho mỗi yêu cầu

### Yêu Cầu 11: Phân Quyền và Bảo Mật Dữ Liệu

**User Story:** Là một người dùng hệ thống, tôi muốn dữ liệu của mình được bảo mật và chỉ người có quyền mới truy cập được, để đảm bảo an toàn thông tin.

#### Tiêu Chí Chấp Nhận

1. WHEN một người dùng truy cập trang yêu cầu xác thực, THEN THE System SHALL kiểm tra phiên đăng nhập và chuyển hướng đến trang đăng nhập nếu chưa xác thực
2. WHEN một chủ nhà truy cập dữ liệu, THEN THE System SHALL chỉ cho phép truy cập dữ liệu thuộc sở hữu của chủ nhà đó
3. WHEN một người thuê truy cập dữ liệu, THEN THE System SHALL chỉ cho phép truy cập dữ liệu liên quan đến người thuê đó
4. IF một người dùng cố gắng truy cập dữ liệu không thuộc quyền của mình, THEN THE System SHALL từ chối và trả về lỗi 403 Forbidden
5. THE System SHALL xác thực vai trò người dùng trước khi cho phép thực hiện các thao tác quan trọng

### Yêu Cầu 12: Báo Cáo và Thống Kê

**User Story:** Là một chủ nhà, tôi muốn xem báo cáo doanh thu và công nợ, để theo dõi tình hình tài chính của nhà trọ.

#### Tiêu Chí Chấp Nhận

1. WHEN một chủ nhà xem báo cáo doanh thu, THEN THE System SHALL tính tổng doanh thu từ các hóa đơn đã thanh toán trong khoảng thời gian được chọn
2. WHEN một chủ nhà xem báo cáo công nợ, THEN THE System SHALL tính tổng số tiền chưa thanh toán từ các hóa đơn chưa thanh toán
3. WHEN một chủ nhà xem thống kê phòng, THEN THE System SHALL hiển thị số lượng phòng trống và phòng đã cho thuê
4. THE System SHALL chỉ tính toán và hiển thị dữ liệu thuộc các tòa nhà của chủ nhà đó
5. THE System SHALL hiển thị biểu đồ doanh thu theo tháng cho năm hiện tại

### Yêu Cầu 13: Giao Diện Người Dùng Responsive

**User Story:** Là một người dùng, tôi muốn giao diện dễ sử dụng và phản hồi nhanh trên mọi thiết bị, để tôi có thể thực hiện các tác vụ một cách hiệu quả.

#### Tiêu Chí Chấp Nhận

1. THE System SHALL hiển thị giao diện responsive trên desktop (>1024px), tablet (768px-1024px) và mobile (<768px)
2. WHEN một người dùng truy cập trên mobile, THEN THE System SHALL hiển thị sidebar dạng drawer có thể đóng/mở
3. WHEN một người dùng truy cập trên desktop, THEN THE System SHALL hiển thị sidebar cố định bên trái
4. THE System SHALL sử dụng Tailwind CSS để styling và shadcn/ui cho các component UI
5. THE System SHALL hiển thị bảng dữ liệu dạng card trên mobile và dạng table trên desktop
6. WHEN một người dùng cuộn trang, THEN THE System SHALL giữ header và navigation bar cố định

### Yêu Cầu 14: Dashboard và Navigation

**User Story:** Là một người dùng, tôi muốn có dashboard rõ ràng và navigation dễ sử dụng, để tôi có thể truy cập nhanh các chức năng quan trọng.

#### Tiêu Chí Chấp Nhận

1. WHEN một chủ nhà đăng nhập, THEN THE System SHALL hiển thị dashboard với thống kê tổng quan (tổng phòng, phòng trống, doanh thu tháng, công nợ)
2. WHEN một người thuê đăng nhập, THEN THE System SHALL hiển thị dashboard với thông tin phòng, hóa đơn chưa thanh toán và thông báo mới
3. THE System SHALL hiển thị sidebar navigation với các menu: Dashboard, Tòa nhà, Phòng, Người thuê, Hợp đồng, Hóa đơn, Thông báo, Yêu cầu bảo trì
4. WHEN một người dùng click vào menu item, THEN THE System SHALL highlight menu đang active và chuyển trang
5. THE System SHALL hiển thị avatar và tên người dùng ở header với dropdown menu (Profile, Đăng xuất)
6. THE System SHALL hiển thị breadcrumb navigation để người dùng biết vị trí hiện tại

### Yêu Cầu 15: Form và Validation

**User Story:** Là một người dùng, tôi muốn form nhập liệu có validation rõ ràng, để tôi biết chính xác lỗi cần sửa.

#### Tiêu Chí Chấp Nhận

1. WHEN một người dùng nhập dữ liệu vào form, THEN THE System SHALL validate real-time và hiển thị lỗi ngay bên dưới field
2. WHEN một người dùng submit form với dữ liệu không hợp lệ, THEN THE System SHALL ngăn submit và focus vào field lỗi đầu tiên
3. THE System SHALL hiển thị required indicator (*) cho các field bắt buộc
4. WHEN một người dùng nhập email, THEN THE System SHALL validate định dạng email hợp lệ
5. WHEN một người dùng nhập số điện thoại, THEN THE System SHALL validate định dạng số điện thoại Việt Nam (10-11 số)
6. THE System SHALL hiển thị placeholder text gợi ý cho mỗi input field
7. WHEN đăng nhập thất bại (sai mật khẩu, tài khoản không tồn tại), THEN THE System SHALL hiển thị thông báo lỗi ngay dưới ô điền thông tin
8. WHEN đăng nhập thất bại, THEN THE System SHALL thêm hiệu ứng rung nhẹ (shake animation) cho form để thu hút sự chú ý

### Yêu Cầu 16: Loading States và Feedback

**User Story:** Là một người dùng, tôi muốn thấy trạng thái loading và feedback rõ ràng, để biết hệ thống đang xử lý yêu cầu của tôi.

#### Tiêu Chí Chấp Nhận

1. WHEN một người dùng thực hiện thao tác tốn thời gian, THEN THE System SHALL hiển thị loading spinner hoặc skeleton screen
2. WHEN một thao tác thành công, THEN THE System SHALL hiển thị toast notification màu xanh với icon success
3. WHEN một thao tác thất bại, THEN THE System SHALL hiển thị toast notification màu đỏ với icon error và thông báo lỗi cụ thể
4. WHEN một người dùng submit form, THEN THE System SHALL disable nút submit và hiển thị loading trong khi xử lý
5. THE System SHALL tự động đóng toast notification sau 3-5 giây
6. WHEN tải danh sách dữ liệu, THEN THE System SHALL hiển thị skeleton loading cho từng row

### Yêu Cầu 17: Bảng Dữ Liệu và Pagination

**User Story:** Là một người dùng, tôi muốn xem danh sách dữ liệu dạng bảng với khả năng tìm kiếm và phân trang, để dễ dàng tìm thông tin cần thiết.

#### Tiêu Chí Chấp Nhận

1. THE System SHALL hiển thị bảng dữ liệu với header cố định khi cuộn
2. WHEN một người dùng click vào header column, THEN THE System SHALL sắp xếp dữ liệu theo column đó (ascending/descending)
3. THE System SHALL hiển thị pagination với số trang và nút Previous/Next khi dữ liệu > 10 items
4. WHEN một người dùng nhập vào search box, THEN THE System SHALL filter dữ liệu real-time theo từ khóa
5. THE System SHALL hiển thị action buttons (Edit, Delete, View) cho mỗi row
6. WHEN một người dùng click Delete, THEN THE System SHALL hiển thị dialog xác nhận trước khi xóa

### Yêu Cầu 18: Modal và Dialog

**User Story:** Là một người dùng, tôi muốn tạo/chỉnh sửa dữ liệu trong modal, để không phải rời khỏi trang hiện tại.

#### Tiêu Chí Chấp Nhận

1. WHEN một người dùng click nút "Thêm mới", THEN THE System SHALL hiển thị modal với form tạo mới
2. WHEN một người dùng click nút "Chỉnh sửa", THEN THE System SHALL hiển thị modal với form đã điền sẵn dữ liệu hiện tại
3. WHEN một người dùng click overlay hoặc nút X, THEN THE System SHALL đóng modal
4. THE System SHALL hiển thị backdrop mờ phía sau modal
5. WHEN modal mở, THEN THE System SHALL focus vào field đầu tiên trong form
6. THE System SHALL hiển thị nút "Hủy" và "Lưu" ở footer của modal

### Yêu Cầu 19: Theme và Styling

**User Story:** Là một người dùng, tôi muốn giao diện đẹp mắt và nhất quán, để có trải nghiệm sử dụng tốt.

#### Tiêu Chí Chấp Nhận

1. THE System SHALL sử dụng color palette nhất quán: primary (blue), success (green), danger (red), warning (yellow)
2. THE System SHALL sử dụng typography nhất quán với font family Inter hoặc tương tự
3. THE System SHALL hiển thị border radius 8px cho card và button
4. THE System SHALL sử dụng shadow nhẹ cho card và modal để tạo độ sâu
5. THE System SHALL hiển thị hover effect cho button và clickable elements
6. THE System SHALL sử dụng spacing nhất quán (4px, 8px, 16px, 24px, 32px)

### Yêu Cầu 20: Accessibility

**User Story:** Là một người dùng, tôi muốn giao diện dễ tiếp cận, để mọi người đều có thể sử dụng hệ thống.

#### Tiêu Chí Chấp Nhận

1. THE System SHALL sử dụng semantic HTML tags (header, nav, main, footer, article, section)
2. THE System SHALL cung cấp alt text cho tất cả images
3. THE System SHALL đảm bảo contrast ratio tối thiểu 4.5:1 cho text
4. THE System SHALL hỗ trợ keyboard navigation (Tab, Enter, Escape)
5. WHEN một người dùng focus vào element, THEN THE System SHALL hiển thị focus ring rõ ràng
6. THE System SHALL sử dụng aria-label cho các icon button không có text

### Yêu Cầu 21: Lưu Trữ và Truy Xuất Dữ Liệu

**User Story:** Là một nhà phát triển, tôi muốn dữ liệu được lưu trữ an toàn và truy xuất hiệu quả, để hệ thống hoạt động ổn định.

#### Tiêu Chí Chấp Nhận

1. WHEN dữ liệu được lưu vào cơ sở dữ liệu, THEN THE System SHALL sử dụng Prisma ORM để tương tác với PostgreSQL
2. THE System SHALL tạo index cho các trường thường xuyên được truy vấn (email, landlordId, tenantId, roomId)
3. FOR ALL quan hệ giữa các bảng, THE System SHALL sử dụng foreign key để đảm bảo tính toàn vẹn dữ liệu
4. WHEN một bản ghi được tạo, THEN THE System SHALL tự động gán id duy nhất và timestamp
5. THE System SHALL sử dụng transaction khi thực hiện các thao tác liên quan đến nhiều bảng

### Yêu Cầu 22: API và Xử Lý Lỗi

**User Story:** Là một nhà phát triển, tôi muốn API được thiết kế rõ ràng và xử lý lỗi đúng cách, để dễ dàng bảo trì và mở rộng.

#### Tiêu Chí Chấp Nhận

1. THE System SHALL sử dụng Next.js API Routes để xây dựng RESTful API
2. WHEN một API request thành công, THEN THE System SHALL trả về status code 200 hoặc 201 với dữ liệu JSON
3. IF một API request thất bại do lỗi client, THEN THE System SHALL trả về status code 400 với thông báo lỗi rõ ràng
4. IF một API request thất bại do lỗi xác thực, THEN THE System SHALL trả về status code 401 hoặc 403
5. IF một API request thất bại do lỗi server, THEN THE System SHALL trả về status code 500 và log lỗi chi tiết
6. THE System SHALL validate tất cả input từ client trước khi xử lý
