# Password Validation & Stay Logged In

## Tổng quan

Hệ thống đã được nâng cấp với các tính năng bảo mật mật khẩu và quản lý phiên đăng nhập nâng cao.

## 1. Password Validation (Xác thực mật khẩu)

### Yêu cầu mật khẩu

Mật khẩu phải đáp ứng các tiêu chí sau:

- ✅ **Độ dài tối thiểu**: 8 ký tự
- ✅ **Chữ cái viết hoa**: Ít nhất 1 ký tự (A-Z)
- ✅ **Chữ cái viết thường**: Ít nhất 1 ký tự (a-z)
- ✅ **Chữ số**: Ít nhất 1 số (0-9)
- ✅ **Ký tự đặc biệt**: Ít nhất 1 ký tự (!@#$%^&*()_+-=[]{}...)

### Ví dụ mật khẩu hợp lệ

```
✅ Password123!
✅ MySecure@Pass2024
✅ HomeLink#2026
✅ Landlord$123
```

### Ví dụ mật khẩu không hợp lệ

```
❌ password (thiếu chữ hoa, số, ký tự đặc biệt)
❌ PASSWORD123 (thiếu chữ thường, ký tự đặc biệt)
❌ Pass1! (quá ngắn, dưới 8 ký tự)
❌ Password123 (thiếu ký tự đặc biệt)
```

### Password Strength Indicator (Chỉ báo độ mạnh)

Hệ thống hiển thị độ mạnh của mật khẩu theo thang điểm 0-4:

| Điểm | Mức độ | Màu sắc | Mô tả |
|------|--------|---------|-------|
| 0 | Rất yếu | Đỏ | Mật khẩu rất dễ bị tấn công |
| 1 | Yếu | Cam | Mật khẩu thiếu nhiều yếu tố bảo mật |
| 2 | Trung bình | Vàng | Mật khẩu đáp ứng một số yêu cầu |
| 3 | Mạnh | Xanh dương | Mật khẩu tốt, đáp ứng hầu hết yêu cầu |
| 4 | Rất mạnh | Xanh lá | Mật khẩu xuất sắc, rất an toàn |

### UI Components

#### Trang đăng ký (Register)

- **Real-time validation**: Hiển thị yêu cầu mật khẩu khi người dùng focus vào trường mật khẩu
- **Visual feedback**: Mỗi yêu cầu có icon check/x với màu xanh/xám
- **Strength meter**: Thanh tiến trình hiển thị độ mạnh mật khẩu
- **Error messages**: Thông báo lỗi cụ thể khi submit

## 2. Stay Logged In (Duy trì đăng nhập)

### Tính năng

Người dùng có thể chọn "Duy trì đăng nhập" khi đăng nhập để:

- ✅ Không cần đăng nhập lại trong 30 ngày
- ✅ Phiên làm việc được lưu trữ an toàn
- ✅ Tự động đăng xuất sau 30 ngày

### Thời gian phiên

| Tùy chọn | Thời gian | Mô tả |
|----------|-----------|-------|
| **Không chọn "Duy trì"** | 1 ngày | Phiên hết hạn sau 24 giờ |
| **Chọn "Duy trì"** | 30 ngày | Phiên hết hạn sau 30 ngày |

### Bảo mật

- Sử dụng JWT (JSON Web Token) với thời gian hết hạn động
- Token được mã hóa và lưu trữ an toàn
- Tự động làm mới token khi cần thiết
- Đăng xuất tự động khi token hết hạn

### UI Implementation

```tsx
// Checkbox trong form đăng nhập
<input
  id="rememberMe"
  type="checkbox"
  checked={formData.rememberMe}
  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
/>
<Label htmlFor="rememberMe">
  Duy trì đăng nhập
</Label>
```

## 3. API Implementation

### Register Endpoint

```typescript
POST /api/auth/register

// Request body
{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0901234567",
  "password": "Password123!",  // Phải đáp ứng yêu cầu
  "confirmPassword": "Password123!",
  "role": "LANDLORD"
}

// Response (success)
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "role": "LANDLORD"
  }
}

// Response (error)
{
  "error": "Mật khẩu phải có ít nhất một chữ cái viết hoa"
}
```

### Login with Remember Me

```typescript
// NextAuth signIn
await signIn('credentials', {
  email: 'user@example.com',
  password: 'Password123!',
  rememberMe: true,  // Duy trì đăng nhập
  redirect: false,
});
```

## 4. Utility Functions

### validatePassword()

```typescript
import { validatePassword } from '@/lib/password-validation';

const result = validatePassword('Password123!');
// {
//   isValid: true,
//   errors: []
// }
```

### getPasswordStrength()

```typescript
import { getPasswordStrength } from '@/lib/password-validation';

const strength = getPasswordStrength('Password123!');
// {
//   score: 3,
//   label: 'Mạnh',
//   color: 'bg-blue-500'
// }
```

## 5. Testing

### Unit Tests

```bash
# Chạy test password validation
npm test password-validation.test.ts
```

### Test Cases

- ✅ Reject passwords < 8 characters
- ✅ Reject passwords without uppercase
- ✅ Reject passwords without lowercase
- ✅ Reject passwords without numbers
- ✅ Reject passwords without special characters
- ✅ Accept valid passwords
- ✅ Calculate password strength correctly
- ✅ Handle remember me token expiry

## 6. User Experience

### Đăng ký

1. Người dùng nhập mật khẩu
2. Hệ thống hiển thị yêu cầu real-time
3. Thanh strength meter cập nhật liên tục
4. Submit chỉ thành công khi mật khẩu hợp lệ

### Đăng nhập

1. Người dùng nhập email/password
2. Tùy chọn check "Duy trì đăng nhập"
3. Đăng nhập thành công
4. Phiên được lưu theo lựa chọn (1 ngày hoặc 30 ngày)

## 7. Best Practices

### Cho người dùng

- ✅ Sử dụng mật khẩu dài và phức tạp
- ✅ Không sử dụng thông tin cá nhân trong mật khẩu
- ✅ Không chia sẻ mật khẩu với người khác
- ✅ Chỉ chọn "Duy trì đăng nhập" trên thiết bị cá nhân
- ✅ Đăng xuất khi sử dụng máy tính công cộng

### Cho developers

- ✅ Luôn hash mật khẩu trước khi lưu database
- ✅ Sử dụng bcrypt với salt rounds >= 10
- ✅ Validate mật khẩu ở cả client và server
- ✅ Không log mật khẩu trong console/logs
- ✅ Sử dụng HTTPS cho tất cả requests

## 8. Troubleshooting

### Mật khẩu không được chấp nhận

**Vấn đề**: Form báo lỗi mặc dù mật khẩu có vẻ hợp lệ

**Giải pháp**:
1. Kiểm tra kỹ từng yêu cầu trong danh sách
2. Đảm bảo có ít nhất 8 ký tự
3. Kiểm tra có đủ chữ hoa, chữ thường, số, ký tự đặc biệt

### Phiên đăng nhập hết hạn sớm

**Vấn đề**: Bị đăng xuất trước thời gian dự kiến

**Giải pháp**:
1. Kiểm tra đã chọn "Duy trì đăng nhập" chưa
2. Xóa cookies và đăng nhập lại
3. Kiểm tra cấu hình NEXTAUTH_SECRET trong .env

### Remember Me không hoạt động

**Vấn đề**: Vẫn phải đăng nhập lại sau khi đóng trình duyệt

**Giải pháp**:
1. Đảm bảo checkbox "Duy trì đăng nhập" được check
2. Kiểm tra browser không ở chế độ Private/Incognito
3. Kiểm tra browser không xóa cookies khi đóng

## 9. Configuration

### Environment Variables

```env
# .env.local
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### NextAuth Config

```typescript
// app/api/auth/[...nextauth]/route.ts
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days default
}
```

## 10. Future Enhancements

- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Password history (prevent reuse)
- [ ] Account lockout after failed attempts
- [ ] Email verification for new accounts
- [ ] Social login (Google, Facebook)
