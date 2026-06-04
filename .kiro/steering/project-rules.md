---
inclusion: always
---

# Quy tắc dự án HouseSea

## 🚫 Không tạo tài liệu không cần thiết

**QUAN TRỌNG**: Khi thực hiện các lệnh hoặc tác vụ, KHÔNG tạo các file tài liệu tóm tắt như:
- ❌ KHÔNG tạo file `.md` để tóm tắt công việc đã làm
- ❌ KHÔNG tạo file `SUMMARY.md`, `CHANGES.md`, `NOTES.md`
- ❌ KHÔNG tạo file hướng dẫn trừ khi user yêu cầu rõ ràng

**Ngoại lệ**: Chỉ tạo tài liệu khi:
- ✅ User yêu cầu rõ ràng: "tạo tài liệu", "viết hướng dẫn"
- ✅ Là tài liệu kỹ thuật cần thiết: README.md, API docs
- ✅ Là file cấu hình: .env.example, config files

## 🗑️ Tự động xóa script tạm thời

Khi tạo script để thực thi tác vụ:
1. Tạo script (`.ps1`, `.sh`, `.js`)
2. Thực thi script
3. **XÓA NGAY** script sau khi hoàn thành

**Ví dụ**:
```powershell
# Tạo script
New-Item -Path "temp-script.ps1" -Value "Write-Host 'Done'"

# Chạy script
.\temp-script.ps1

# Xóa ngay sau khi chạy
Remove-Item "temp-script.ps1"
```

## 📝 Phản hồi ngắn gọn

- Chỉ báo cáo kết quả, không giải thích dài dòng
- Không liệt kê lại những gì đã làm trừ khi cần thiết
- Tập trung vào hành động, không phải tài liệu

## 🎯 Ưu tiên

1. **Hành động** > Tài liệu
2. **Kết quả** > Giải thích
3. **Ngắn gọn** > Dài dòng
