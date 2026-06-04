# Hướng dẫn Deploy lên Vercel

## Bước 1: Thêm Environment Variables trên Vercel

Truy cập **Vercel Dashboard** > **Project Settings** > **Environment Variables** và thêm các biến sau:

### Database (Required)
```
DATABASE_URL=postgresql://postgres:Ihatemyjob1@db.cckkqhkbuuotvzxctekv.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:Ihatemyjob1@db.cckkqhkbuuotvzxctekv.supabase.co:5432/postgres
```

### NextAuth (Required)
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=RBmRcnJDZot6dj3eaw9NFmKxGlLxnajL/v97Gwc2dg0=
```

### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://cckkqhkbuuotvzxctekv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNja3FoaGtidXVvdHZ6eGN0ZWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMjE2MzAsImV4cCI6MjA5MzY5NzYzMH0.IzfMEOJjUm2byZRK39SO72Ed9yGgRjf9zqCEa2heErI
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_PUBLISHABLE_KEY=sb_publishable_u4i3mQLTfZuv0rsi72jhhw_k0dyOcqaS
SUPABASE_SECRET_KEY=sb_secret_VIMafWKoBLiCmHr67QueSw_MPj8MsawL
```

### Supabase S3 Storage (Required)
```
SUPABASE_S3_ACCESS_KEY_ID=98537e252304851f4aa5ffafff8dc4466f7b000e0f8639d1322f3eb6104eb988
SUPABASE_S3_SECRET_ACCESS_KEY=your-s3-secret-access-key-here
SUPABASE_S3_ENDPOINT=https://cckkqhkbuuotvzxctekv.supabase.co/storage/v1/s3
SUPABASE_S3_REGION=ap-southeast-1
```

### AI Chatbot (Optional)
```
GEMINI_API_KEY=your-gemini-api-key-here
```

### Email SMTP (Optional)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=viethoangpham1204@gmail.com
SMTP_PASS=kjks kync rzgz iwxm
```

### Test Accounts (Optional)
```
TEST_LANDLORD_EMAIL=test@gmail.com
TEST_LANDLORD_PASSWORD=665209Az@
TEST_TENANT_EMAIL=test2@gmail.com
TEST_TENANT_PASSWORD=665209Az@
```

## Bước 2: Cấu hình trên Vercel Dashboard

1. Vào **Project Settings** > **General**
2. Chọn **Framework Preset**: Next.js
3. Chọn **Node.js Version**: 20.x

## Bước 3: Redeploy

Sau khi thêm environment variables:
1. Vào **Deployments** tab
2. Click vào deployment bị lỗi
3. Click nút **Redeploy**

Hoặc push code mới lên GitHub để trigger deployment tự động.

## Lưu ý quan trọng

⚠️ **Thay đổi NEXTAUTH_URL**: Sau khi deploy xong, cập nhật biến `NEXTAUTH_URL` thành URL thực của app (ví dụ: `https://motel-manager.vercel.app`)

⚠️ **Bảo mật**: Đảm bảo các biến môi trường nhạy cảm (passwords, API keys) được giữ bí mật và không commit vào Git

⚠️ **Database**: Đảm bảo Supabase database đã được khởi tạo và có thể kết nối được từ Vercel

## Kiểm tra sau khi deploy

- [ ] Website load được
- [ ] Đăng nhập hoạt động
- [ ] Database connection hoạt động
- [ ] Upload files lên Supabase Storage hoạt động
- [ ] Email gửi được (nếu cấu hình)
