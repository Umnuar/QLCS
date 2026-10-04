# CHÍNH SÁCH BẢO MẬT THÔNG TIN (SECURITY POLICY)
## Dự án: Quản Lý Chính Sách Người Cao Tuổi & Hưu Trí Xã Hội (QLCS v3.0.0)
### Cơ quan chủ quản: Ủy ban Nhân dân Xã Đăk Hà, Tỉnh Kon Tum

---

## 1. PHẠM VI & PHIÊN BẢN HỖ TRỢ (SUPPORTED VERSIONS)

Hệ thống QLCS xử lý dữ liệu định danh công dân (Họ tên, ngày sinh, số CCCD, tình trạng sức khỏe, diện hưởng trợ cấp xã hội). Do đó, chỉ các phiên bản chính thức được liệt kê dưới đây mới nhận được các bản vá bảo mật:

| Phiên bản | Môi trường | Hỗ trợ bảo mật | Tình trạng |
| :---: | :---: | :---: | :--- |
| **v3.0.x** (Hiện tại) | Desktop Electron + Express Backend | ✅ Có hỗ trợ đầy đủ | Đã được kiểm toán an ninh toàn diện (OWASP ASVS v4.0.3) |
| **v2.x.x** | Web Local Express v2 | ⚠️ Hạn chế | Chỉ hỗ trợ vá lỗ hổng khẩn cấp P0 |
| **< v2.0.0** | Bản thử nghiệm cũ | ❌ Không hỗ trợ | Khuyến nghị nâng cấp ngay lên phiên bản v3.0.0 |

---

## 2. QUY TRÌNH BÁO CÁO LỖ HỔNG CÓ TRÁCH NHIỆM (REPORTING A VULNERABILITY)

Chúng tôi đánh giá cao sự đóng góp của các cán bộ kỹ thuật, chuyên gia an ninh thông tin trong việc rà soát và củng cố an toàn cho hệ thống dữ liệu công dân.

### 2.1. Kênh tiếp nhận thông tin bảo mật
- **Đầu mối tiếp nhận**: Bộ phận Công nghệ Thông tin & Chuyển đổi số — UBND Xã Đăk Hà.
- **Email an ninh chuyên dụng**: `security@dulieudakha.vn` (hoặc liên hệ trực tiếp Quản trị viên hệ thống).
- **Nguyên tắc tiết lộ có trách nhiệm (Responsible Disclosure)**:
  - **KHÔNG** công khai lỗ hổng hoặc đăng tải thông tin lên mạng xã hội / diễn đàn công cộng trước khi lỗ hổng được vá và kiểm nghiệm.
  - **KHÔNG** khai thác lỗ hổng để đánh cắp, sao chép, chỉnh sửa hoặc xóa dữ liệu công dân thật trong CSDL.
  - Cung cấp mô tả kỹ thuật tối thiểu (PoC) kèm các bước tái hiện an toàn.

### 2.2. Cam kết thời gian phản hồi (SLA)
- **Tiếp nhận & Xác nhận**: Trong vòng **24 giờ** làm việc kể từ khi nhận được báo cáo.
- **Đánh giá & Tái hiện**: Trong vòng **72 giờ** làm việc (xác định mức độ từ P0 đến P3).
- **Phát hành bản vá**:
  + Lỗ hổng **P0 (Khẩn cấp)**: Phát hành bản vá nóng (Hotfix) trong vòng **24 - 48 giờ**.
  + Lỗ hổng **P1 (Cao)**: Phát hành trong vòng **7 ngày**.
  + Lỗ hổng **P2 / P3 (Trung bình / Thấp)**: Khắc phục trong chu kỳ cập nhật định kỳ tiếp theo.

---

## 3. NGUYÊN TẮC BẢO VỆ DỮ LIỆU CÁ NHÂN (NGHỊ ĐỊNH 13/2023/NĐ-CP)

1. **Mã hóa lưu trữ (Encryption at Rest)**: Toàn bộ số Căn cước công dân (CCCD) phải được mã hóa bằng thuật toán `AES-256-GCM` với IV ngẫu nhiên trước khi lưu vào CSDL.
2. **Che giấu dữ liệu trên giao diện (Data Masking)**: Mặc định trên toàn bộ bảng biểu chỉ hiển thị 4 số cuối `••••••••1234`. Thao tác giải mã xem số đầy đủ bắt buộc phải ghi nhận vào `profile_audit_log`.
3. **Phân quyền truy cập tối thiểu (Least Privilege)**: Cán bộ thôn chỉ được phép truy cập và quản lý hồ sơ thuộc địa bàn thôn mình phụ trách. Cán bộ cấp xã (Admin) mới có quyền tổng hợp dữ liệu toàn xã.
4. **Bảo tồn tính toàn vẹn kiểm toán (Audit Immutability)**: Không cho phép bất kỳ hành vi xóa sạch lịch sử kiểm toán `profile_audit_log`, kể cả khi xóa vĩnh viễn hồ sơ.

---

## 4. CHÍNH SÁCH QUẢN LÝ & XOAY KHÓA BÍ MẬT (KEY MANAGEMENT & ROTATION)

- **`ENCRYPTION_KEY` (Khóa AES-256 mã hóa CCCD)**:
  + Lưu trữ độc lập trong biến môi trường máy chủ backend (`.env`), không commit vào Git.
  + Chu kỳ xoay khóa định kỳ: **12 tháng/lần** hoặc ngay khi phát hiện nghi vấn lộ lọt.
  + Sử dụng công cụ xoay khóa an toàn đã tích hợp: `npx ts-node scripts/rotate-encryption-key.ts`.
- **`JWT_SECRET` & `JWT_REFRESH_SECRET`**:
  + Chu kỳ xoay khóa: **90 ngày/lần**.
  + Khi xoay khóa JWT, toàn bộ phiên làm việc cũ sẽ hết hạn và người dùng chỉ cần đăng nhập lại.
- **Mật khẩu quản trị**:
  + Bắt buộc đổi mật khẩu mặc định ngay trong lần đăng nhập đầu tiên.
  + Độ dài tối thiểu 8 ký tự, khuyến nghị bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.

---

## 5. QUY TRÌNH ỨNG PHÓ SỰ CỐ AN NINH (INCIDENT RESPONSE PLAN)

Khi phát hiện sự cố an ninh (truy cập trái phép, tấn công từ chối dịch vụ, nghi vấn rò rỉ dữ liệu):

1. **Bước 1: Cách ly & Kiểm soát (Containment)**:
   - Tạm dừng kết nối mạng máy chủ Backend hoặc kích hoạt chế độ bảo trì.
   - Ngắt kết nối socket và thu hồi toàn bộ token đăng nhập hiện hành.
2. **Bước 2: Đánh giá & Điều tra (Investigation)**:
   - Trích xuất nhật ký hoạt động từ `profile_audit_log` và log HTTP để xác định phạm vi bị ảnh hưởng.
   - Xác định địa chỉ IP nguồn, tài khoản bị xâm nhập và dữ liệu bị truy vấn.
3. **Bước 3: Khắc phục & Xoay khóa (Remediation)**:
   - Khóa hoặc đổi mật khẩu các tài khoản bị lộ.
   - Kích hoạt xoay khóa mã hóa `ENCRYPTION_KEY` và `JWT_SECRET`.
   - Cập nhật quy tắc firewall và siết chặt CORS whitelist.
4. **Bước 4: Phục hồi & Kiểm thử (Recovery)**:
   - Khởi động lại dịch vụ trên môi trường an toàn.
   - Chạy bộ kịch bản kiểm thử bảo mật 42 bài test để bảo đảm hệ thống vận hành chuẩn xác.
5. **Bước 5: Báo cáo & Lưu trữ hồ sơ (Post-Incident)**:
   - Lập biên bản sự cố gửi Lãnh đạo UBND xã và các cơ quan chuyên môn theo quy định.
   - Cập nhật quy trình kiểm toán để ngăn chặn sự cố tương tự tái diễn.

---

## 6. BẢN QUYỀN & GIẤY PHÉP (COPYRIGHT & PROPRIETARY NOTICE)

- Hệ thống QLCS là giải pháp phần mềm chuyên dụng của UBND Xã Đăk Hà.
- **Dự án KHÔNG áp dụng giấy phép mã nguồn mở MIT hay bất kỳ giấy phép mở tự do nào khác.**
- Toàn bộ bản quyền thuộc về UBND Xã Đăk Hà và Tác giả (Umnuar). Toàn bộ quyền được bảo lưu (**All Rights Reserved**).

