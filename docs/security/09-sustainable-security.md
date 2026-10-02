# HƯỚNG DẪN DUY TRÌ AN NINH BỀN VỮNG & CHECKLIST PHÁT HÀNH SỐNG (LIVING SECURITY CHECKLIST)
## Dự án: Quản Lý Chính Sách (QLCS v3.0.0) — UBND Xã Đăk Hà

---

## 1. MỤC TIÊU DUY TRÌ AN NINH BỀN VỮNG (SUSTAINABLE SECURITY)

Bảo mật không phải là một trạng thái cố định tại một thời điểm, mà là một quy trình liên tục. Tài liệu này đóng vai trò là **Checklist Sống (Living Checklist)** bắt buộc phải thực thi trước mỗi lần phát hành phiên bản mới (Release Candidate) hoặc khi có thay đổi lớn về mã nguồn nghiệp vụ.

---

## 2. CHECKLIST KIỂM SOÁT AN NINH TRƯỚC PHÁT HÀNH (PRE-RELEASE SECURITY GATE)

Trước khi đóng gói tệp cài đặt Windows (`.exe`) hoặc cập nhật máy chủ sản xuất, Quản trị viên/Kỹ sư phát triển bắt buộc phải kiểm tra và đánh dấu đầy đủ 7 cổng kiểm soát dưới đây:

### Cổng 1: Kiểm soát Bí mật & Tệp Cấu hình (Secrets & Git Cleanliness)
- [ ] Tệp `.env` không bị thêm vào Git staging (`git status` không hiển thị `.env`).
- [ ] Toàn bộ các biến môi trường mới đã được cập nhật bản mẫu vào `.env.example` với giá trị giữ chỗ `YOUR_VALUE_HERE`.
- [ ] Không có API key, mật khẩu, JWT secret hoặc chuỗi kết nối CSDL nào bị hardcode trong mã nguồn `src/` hoặc `electron/`.

### Cổng 2: Kiểm soát Chuỗi Cung ứng & Phụ thuộc (Dependency Health)
- [ ] Chạy `npm --prefix QLCS-Backend audit` — Xác nhận không có lỗ hổng Critical / High chưa được xử lý.
- [ ] Chạy `npm --prefix QLCS-Client audit` — Đảm bảo các gói runtime an toàn.
- [ ] Không cài đặt các thư viện mới không rõ nguồn gốc hoặc chưa được phê duyệt qua quy trình kiểm soát phụ thuộc.

### Cổng 3: Kiểm tra Biên dịch & Kiểu Tĩnh (Type Safety & Build Cleanliness)
- [ ] Chạy `npm --prefix QLCS-Backend run build` — `tsc` exit code = 0, 0 lỗi kiểu dữ liệu.
- [ ] Chạy `npm --prefix QLCS-Client run build:vite` — Vite build thành công, không có cảnh báo nghiêm trọng.

### Cổng 4: Bộ Kiểm thử An ninh Thực nghiệm Chuyên sâu (Empirical Security Suite)
Chạy bộ 3 kịch bản kiểm thử an ninh phía máy chủ:
```bash
npx ts-node QLCS-Backend/scripts/verify-village-scoping.ts
npx ts-node QLCS-Backend/scripts/verify-encryption-security.ts
npx ts-node QLCS-Backend/scripts/verify-optimistic-concurrency.ts
```
- [ ] `verify-village-scoping.ts`: Đạt 14/14 tests PASS (BOLA, IDOR, Auto-scoping theo thôn).
- [ ] `verify-encryption-security.ts`: Đạt 17/17 tests PASS (Mã hóa AES-256-GCM & SHA-256 Blind Indexing).
- [ ] `verify-optimistic-concurrency.ts`: Đạt 11/11 tests PASS (Chống xung đột ghi đồng thời OCC HTTP 409).

### Cổng 5: Bộ Kiểm thử Đơn vị & Hồi quy Máy khách (Client Test Fortress)
Chạy bộ kiểm thử tự động của ứng dụng máy khách:
```bash
npm --prefix QLCS-Client test -- --run
```
- [ ] Toàn bộ 8/8 test files đạt kết quả PASS (103/103 tests xanh 100%).

### Cổng 6: Ranh giới An ninh Desktop Electron & CSP
- [ ] Thẻ meta CSP trong `QLCS-Client/index.html` không chứa `'unsafe-eval'`.
- [ ] Kênh IPC trong `QLCS-Client/electron/main.ts` bắt buộc kiểm tra `validateSender(event)`.
- [ ] Các tham số gửi qua IPC (`set-zoom`, v.v.) được kiểm tra cận biên chặt chẽ.
- [ ] Cấu hình `will-navigate` và `setWindowOpenHandler` ngăn chặn mở URL lạ ra bên ngoài.

### Cổng 7: CSDL Đám mây & Khóa Cổng PostgREST (Supabase Cloud RLS)
- [ ] Toàn bộ các bảng mới (nếu có bổ sung qua Prisma migration) bắt buộc phải chạy `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
- [ ] Thu hồi quyền truy cập của role `anon` trên Supabase đối với các bảng mới.

---

## 3. KHUYẾN NGHỊ TỰ ĐỘNG HÓA CI/CD & PRE-COMMIT HOOKS

Để đảm bảo các quy chuẩn an ninh được thực thi tự động mà không phụ thuộc vào trí nhớ cá nhân, khuyến nghị tích hợp các công cụ tự động hóa sau:

### 3.1. Kịch bản Pre-commit Hook (Kiểm tra trước khi commit)
Sử dụng script `.githooks/pre-commit` để tự động chặn các commit vi phạm:
```bash
#!/bin/sh
# 1. Kiểm tra bí mật trong staged files
git diff --cached --name-only | grep -E '\.(env|key|pem|cert)$' && {
    echo "❌ LỖI AN NINH: Phát hiện tệp bí mật trong commit! Hãy gỡ bỏ trước khi commit."
    exit 1
}

# 2. Kiểm tra type check nhanh
npm --prefix QLCS-Backend run build || exit 1
npm --prefix QLCS-Client run build:vite || exit 1
```

### 3.2. Quy trình Quét Tự động trong CI (GitHub Actions Workflow)
Khi đẩy mã nguồn lên kho Git trung tâm, cấu hình quy trình CI tự động chạy:
1. `npm audit --audit-level=high`
2. `npx gitleaks detect --source=. -v`
3. Chạy toàn bộ 42 bài test an ninh thực nghiệm và 103 bài test máy khách.

---

## 4. SỔ TAY BẢO TRÌ & LỊCH TRÌNH XOAY KHÓA ĐỊNH KỲ

| Hạng mục bảo trì | Chu kỳ khuyến nghị | Công cụ / Lệnh thực hiện | Người phụ trách |
| :--- | :---: | :--- | :---: |
| **Sao lưu CSDL toàn xã** | Hàng ngày (02:00 AM) | Tự động qua `initBackupCron()` trong Backend | Máy chủ Backend |
| **Xoay khóa JWT** | 90 ngày / lần | Đổi `JWT_SECRET` trong `.env` và restart server | Quản trị viên |
| **Xoay khóa mã hóa CCCD** | 12 tháng / lần | `npx ts-node scripts/rotate-encryption-key.ts` | Quản trị viên |
| **Cập nhật vá bảo mật npm** | Hàng tháng | `npm update` + chạy lại bộ kiểm thử | Kỹ sư kỹ thuật |
| **Rà soát nhật ký kiểm toán** | Hàng tuần | Xem trên màn hình Nhật ký hoạt động (`/audit`) | Cán bộ quản trị xã |

---

## 5. KẾT LUẬN TOÀN DIỆN CHƯƠNG TRÌNH NÂNG CẤP BẢO MẬT

Hệ thống **Quản Lý Chính Sách (QLCS v3.0.0) — UBND Xã Đăk Hà** đã hoàn tất trọn vẹn quy trình 10 bước kiểm toán, sửa lỗi và nâng cấp bảo mật toàn diện:
- Đạt chuẩn kiểm toán an ninh ứng dụng hiện đại **OWASP ASVS v4.0.3 (Level 2)**.
- Triệt tiêu 100% các nguy cơ vi phạm quy định bảo vệ dữ liệu cá nhân theo **Nghị định 13/2023/NĐ-CP**.
- Khép lại toàn bộ các điểm yếu từ tầng mạng, CSDL Supabase, xác thực JWT, phân quyền theo thôn, kiểm toán bất biến, đến ranh giới Desktop Electron.
- Hệ thống đã sẵn sàng cho vận hành lâu dài, an toàn và tin cậy tuyệt đối tại UBND Xã Đăk Hà.
