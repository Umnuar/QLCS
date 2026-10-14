# HỆ THỐNG QUẢN LÝ CHÍNH SÁCH (QLCS) - XÃ ĐĂK HÀ

> **Phiên bản:** v2.2.0 (Chính thức)  
> **Nền tảng:** Windows Desktop (Tauri v2 + React 18 + TypeScript)  
> **Đơn vị chủ quản:** Ủy ban Nhân dân Xã Đăk Hà, Huyện Tu Mơ Rông, Tỉnh Kon Tum

---

## 1. GIỚI THIỆU CHUNG
Hệ thống **Quản Lý Chính Sách (QLCS)** là ứng dụng máy tính chuyên dụng được xây dựng nhằm hiện đại hóa và số hóa toàn diện công tác quản lý Nhà nước về chính sách an sinh xã hội trên địa bàn xã Đăk Hà. 

Phần mềm hỗ trợ đắc lực cho cán bộ phụ trách Lao động - Thương binh & Xã hội và Trưởng các thôn, làng trong việc lập danh sách, rà soát đối tượng, theo dõi chi trả chế độ chúc thọ và trợ cấp hưu trí xã hội chính xác, minh bạch và kịp thời.

---

## 2. CÁC TÍNH NĂNG CHÍNH

### 🎂 Quản Lý Hồ Sơ Chúc Thọ
- Tự động tính toán và phân loại đối tượng người cao tuổi đủ tuổi chúc thọ hàng năm theo các mốc quy định: **60, 65, 70, 75, 80, 85, 90, 95, 100 và trên 100 tuổi**.
- Theo dõi trạng thái đã nhận quà / chưa nhận quà, lọc danh sách chi tiết theo từng năm và từng thôn/làng.
- Báo cáo biến động danh sách người cao tuổi qua từng năm phục vụ dự toán ngân sách.

### 🏛️ Quản Lý Hồ Sơ Hưu Trí Xã Hội (HTXH)
- Triển khai đầy đủ các diện thụ hưởng theo quy định hiện hành:
  - Người cao tuổi từ đủ 75 tuổi trở lên không có lương hưu hoặc trợ cấp BHXH.
  - Người từ đủ 70 đến dưới 75 tuổi thuộc hộ nghèo, hộ cận nghèo.
  - Các đối tượng bảo trợ xã hội và hưu tuất bảo hiểm.
- Cơ chế phát hiện và cảnh báo hồ sơ trùng lặp, bảo đảm đối tượng chỉ hưởng đúng một chính sách ưu đãi cao nhất.

### ⏱️ Dịch Vụ Thời Gian Chuẩn & Năm Tính Toán Tập Trung
- Toàn bộ mốc tuổi và năm tính toán được đồng bộ tập trung từ máy chủ thông qua chuỗi fallback 3 cấp (**Internet NTP/HTTP → PostgreSQL → Máy chủ**).
- Khóa tính năng chỉnh sửa ngày giờ thủ công tại máy trạm của người dùng, loại bỏ nguy cơ làm sai lệch mốc tính toán tuổi chúc thọ và hưu trí xã hội.

### 🔒 An Toàn & Bảo Mật Dữ Liệu Cấp Xã
- **Mã hóa CCCD**: Toàn bộ số định danh CCCD được mã hóa đối xứng **AES-256-GCM** khi lưu trữ trong cơ sở dữ liệu và cache ngoại tuyến.
- **HMAC Blind Index**: Hỗ trợ tìm kiếm, tra cứu hồ sơ chính xác mà không cần giải mã hàng loạt.
- **Phân quyền Thôn/Làng (RBAC)**: Trưởng thôn chỉ có quyền xem và quản lý hồ sơ thuộc phạm vi thôn mình phụ trách; Quản trị viên cấp xã có quyền giám sát toàn địa bàn.
- **Khóa lạc quan (OCC)**: Ngăn chặn triệt để tình trạng ghi đè dữ liệu khi nhiều cán bộ cùng chỉnh sửa một hồ sơ tại cùng thời điểm.

### 🔄 Tự Động Cập Nhật (Tauri v2 Auto-Updater)
- Ứng dụng tự động kiểm tra phiên bản mới từ máy chủ mỗi khi khởi động.
- Xác thực tính toàn vẹn và độ tin cậy của bản cập nhật qua chữ ký số **Minisign Ed25519**.
- Nâng cấp mượt mà 1-click, tự động khởi động lại ứng dụng sau khi cài đặt thành công.

### 📊 Nhập / Xuất Excel Chuyên Nghiệp
- Hỗ trợ nhập liệu từ các mẫu danh sách Excel của ngành Lao động - TB&XH với cơ chế nhận diện tiêu đề thông minh.
- Xuất báo cáo, bảng biểu danh sách chi trả định dạng chuẩn Excel (.xlsx) hỗ trợ in ấn và lưu trữ hồ sơ lưu trữ.

---

## 3. HƯỚNG DẪN TẢI VÀ CÀI ĐẶT

### Yêu Cầu Hệ Thống:
- **Hệ điều hành:** Windows 10 (64-bit) hoặc Windows 11.
- **Trình duyệt nền:** Microsoft Edge WebView2 (mặc định có sẵn trên Windows 10/11).
- **RAM:** Tối thiểu 2 GB (khuyến nghị 4 GB trở lên).
- **Ổ cứng:** 100 MB dung lượng trống.

### Các Bước Cài Đặt:
1. Truy cập mục phát hành chính thức: [**QLCS Releases**](https://github.com/Umnuar/QLCS/releases).
2. Tải về tệp cài đặt mới nhất:
   - Bản cài đặt chuẩn: `QLCS-v2.2.0-x64-setup.exe` hoặc `QLCS_2.2.0_x64_en-US.msi`.
3. Nhấp đúp vào tệp vừa tải về để tiến hành cài đặt.
4. Mở ứng dụng từ Desktop hoặc Start Menu, đăng nhập bằng tài khoản do Quản trị viên cấp xã cung cấp.

---

## 4. HỖ TRỢ VÀ BẢN QUYỀN

- **Đơn vị quản lý:** Ủy ban Nhân dân Xã Đăk Hà, Huyện Tu Mơ Rông, Tỉnh Kon Tum.
- **Hỗ trợ kỹ thuật:** Bộ phận Quản trị Cơ sở dữ liệu và Chuyển đổi số Xã Đăk Hà.
- **Bản quyền:** Xem chi tiết tại tệp [LICENSE](./LICENSE). Toàn bộ quyền sở hữu trí tuệ thuộc UBND Xã Đăk Hà.
