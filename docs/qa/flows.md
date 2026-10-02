# DANH SÁCH CÁC LUỒNG NGƯỜI DÙNG KIỂM THỬ TRỰC TIẾP TRÊN TRÌNH DUYỆT (USER TEST FLOWS)
## Dự án: Quản Lý Chính Sách (QLCS v3.0.0) — UBND Xã Đăk Hà
## Phục vụ: Chiến dịch Browser QA, Phân tích Lỗi & Khắc phục Toàn diện

---

## 1. TỔNG QUAN MA TRẬN 7 LUỒNG NGƯỜI DÙNG

| Mã Luồng | Tên Luồng Kiểm Thử | Phân Hệ / Route | Mục Tiêu Chính | Mức Độ Ưu Tiên |
| :---: | :--- | :--- | :--- | :---: |
| **FLOW-01** | Xác thực, Quản lý Phiên & Phân quyền RBAC | `/login` $\rightarrow$ Auth Gate | Đăng nhập Admin/Thôn, sai pass, logout, refresh token | **P0** |
| **FLOW-02** | Khảo Sát & Lựa Chọn Thôn Làm Việc | Tab `villages` | Điều hướng 7 thôn, phím Tab+Enter, indicator Header | **P1** |
| **FLOW-03** | Quản Lý Hồ Sơ Chúc Thọ Người Cao Tuổi | Tab `chuctho` | Lọc 10 mốc tuổi, tìm kiếm unaccented, YearSelector | **P1** |
| **FLOW-04** | Quản Lý Trợ Cấp Hưu Trí Xã Hội (HTXH) | Tab `htxh` | Diện trợ cấp, mốc 75+, chuyển tab nhanh AbortController | **P1** |
| **FLOW-05** | Thao Tác Modal Hồ Sơ (Thêm, Sửa & OCC) | Modal `ProfileModal` | Focus trap, validate ngày sinh, chống mất data, OCC 409 | **P0** |
| **FLOW-06** | Vòng Đời Xóa Hồ Sơ & Thùng Rác | Tab `recycle-bin` | Xóa mềm, khôi phục, xóa vĩnh viễn, bảo tồn audit log | **P0** |
| **FLOW-07** | Nhật Ký Hoạt Động, Cài Đặt & Theme / Responsive | Tab `audit`, `settings` | Timeline log, Dark/Light mode, 3 viewports (360/768/1280) | **P2** |

---

## 2. CHI TIẾT KỊCH BẢN TỪNG LUỒNG KIỂM THỬ

### FLOW-01: Xác thực, Quản lý Phiên & Phân quyền RBAC
- **Mục đích**: Xác nhận luồng đăng nhập an toàn, phân quyền hiển thị theo vai trò (Admin toàn xã vs Cán bộ thôn), kiểm tra bảo vệ token và cơ chế thoát phiên.
- **Dữ liệu thử**:
  - Tài khoản Admin: `admin`
  - Tài khoản Thôn: `daklang` (hoặc tài khoản thôn tương đương trong CSDL)
- **Các bước thực hiện**:
  1. Mở trình duyệt tại `http://localhost:5173/`.
  2. Để trống tên đăng nhập và mật khẩu, nhấn nút `[Đăng Nhập]` $\rightarrow$ Kiểm tra thông báo yêu cầu nhập đầy đủ.
  3. Nhập username `admin`, mật khẩu sai bất kỳ $\rightarrow$ Bấm `[Đăng Nhập]` $\rightarrow$ Kiểm tra hiển thị thông báo lỗi từ server, không làm sập giao diện.
  4. Nhập username `admin` và mật khẩu đúng $\rightarrow$ Bấm `[Đăng Nhập]` $\rightarrow$ Ứng dụng chuyển sang màn hình Quản lý Thôn (`VillagesPage`).
  5. Kiểm tra Header: hiển thị đúng tên đăng nhập `admin` và huy hiệu "Quản trị viên".
  6. Mở DevTools Console & Application: kiểm tra `localStorage`/`sessionStorage` không lưu mật khẩu trần.
  7. Bấm nút `[Đăng Xuất]` $\rightarrow$ Xác nhận token bị xóa khỏi storage và quay trở về màn hình đăng nhập.
  8. Đăng nhập bằng tài khoản Cán bộ thôn (`daklang`) $\rightarrow$ Kiểm tra tự động chuyển thẳng vào tab Thống kê của thôn Đăk Lăng, Sidebar bị giới hạn chỉ hiển thị dữ liệu của thôn đó.
- **Kết quả mong đợi**: Luồng đăng nhập mượt mà, phân quyền tuyệt đối, không có lỗi console unhandled.

---

### FLOW-02: Khảo Sát & Lựa Chọn Thôn Làm Việc (VillagesPage)
- **Mục đích**: Kiểm tra giao diện bản đồ số 7 thôn xã Đăk Hà, tính tiếp cận phím và khả năng chuyển ngữ cảnh làm việc cho Admin.
- **Các bước thực hiện**:
  1. Đăng nhập tài khoản `admin`, tại tab `Quản Lý Thôn`.
  2. Rà soát 7 thẻ thôn: Đăk Lăng, Đăk Tin, Kon Gung, Kon Trang Long Loi, Kon Hnong Yôp, Kon Tu Peng, Kon Brain.
  3. Kiểm tra Accessibility: dùng phím `Tab` để di chuyển tiêu điểm qua từng thôn. Xác nhận xuất hiện viền sáng focus `ring-2 ring-emerald-500`. Nhấn phím `Enter` hoặc `Space` trên một thẻ thôn.
  4. Click chuột vào thẻ thôn "Đăk Lăng" $\rightarrow$ Kiểm tra hệ thống chuyển tab sang Thống kê của thôn Đăk Lăng; Header cập nhật badge "Thôn: Đăk Lăng" màu xanh ngọc.
  5. Click vào nút "Quản Lý Thôn" trên Sidebar hoặc nút badge Thôn trên Header $\rightarrow$ Quay trở lại màn hình 7 thôn toàn xã.
- **Kết quả mong đợi**: Điều hướng thôn mượt mà, hỗ trợ 100% bàn phím, chỉ số thống kê trên thẻ thôn hiển thị chính xác.

---

### FLOW-03: Quản Lý Hồ Sơ Chúc Thọ Người Cao Tuổi (Dashboard - Chúc Thọ)
- **Mục đích**: Kiểm tra hiển thị bảng danh sách chúc thọ, bộ lọc mốc tuổi, tìm kiếm unaccented tiếng Việt, thay đổi năm tính toán và phân trang.
- **Các bước thực hiện**:
  1. Tại một thôn đã chọn, bấm tab `Hồ Sơ Chúc Thọ` trên Sidebar.
  2. Kiểm tra `StatsCards`: đếm tổng số hồ sơ, phân bổ theo các mốc tuổi tròn, tỷ lệ trao quà.
  3. Kiểm tra ô tìm kiếm: gõ "nguyen", "thi", tiếng Việt có dấu và không dấu $\rightarrow$ Danh sách cập nhật tức thời sau debounce 300ms.
  4. Kiểm tra bộ lọc mốc tuổi `CustomSelect`: chọn mốc 70 tuổi, 80 tuổi, 90 tuổi $\rightarrow$ Bảng chỉ giữ lại các cụ đúng mốc tuổi đã chọn.
  5. Kiểm tra bộ chọn năm `YearSelector`:
     - Bấm nút năm hiện tại $\rightarrow$ Popover menu mở ra.
     - Nhập năm dự toán `2027` vào ô input $\rightarrow$ Nhấn `Enter` $\rightarrow$ Xác nhận mốc tuổi và danh sách tự động tính lại theo năm 2027.
  6. Kiểm tra phân trang `TablePagination`:
     - Đổi số dòng hiển thị từ `20` sang `50`, rồi sang `10` $\rightarrow$ Xác nhận số trang và chỉ số hiển thị bản ghi tính toán chính xác, tự động đưa về trang 1.
     - Bấm nút `[Sau]` và `[Trước]` để chuyển trang.
- **Kết quả mong đợi**: Bảng dữ liệu không bị giật lag, bộ lọc kết hợp chính xác, không phát sinh memory leak khi đổi năm liên tục.

---

### FLOW-04: Quản Lý Trợ Cấp Hưu Trí Xã Hội (Dashboard - HTXH)
- **Mục đích**: Kiểm tra dữ liệu phân hệ Hưu trí xã hội và khả năng chống Stale UI khi chuyển tab nhanh.
- **Các bước thực hiện**:
  1. Bấm chọn tab `Hưu Trí Xã Hội` trên Sidebar.
  2. Kiểm tra các cột dữ liệu chính sách: Diện trợ cấp (75+, 70-74 nghèo, Bảo trợ xã hội), Ngày bắt đầu hưởng, Mức hưởng hàng tháng, Trạng thái chi trả.
  3. Kiểm tra lọc theo diện chính sách và tìm kiếm họ tên.
  4. Thực hiện chuyển đổi qua lại nhanh liên tục giữa 2 tab `chuctho` và `htxh` (Stress test Stale UI).
  5. Kiểm tra DevTools Network tab: các request đang bay dở khi đổi tab phải được hủy bằng `AbortController` (mã trạng thái `canceled`), không đè chồng dữ liệu lên giao diện.
- **Kết quả mong đợi**: Bảng HTXH hiển thị chuẩn chỉ số liệu, không có lỗi race condition hay gián đoạn hiển thị.

---

### FLOW-05: Thao Tác Modal Hồ Sơ (Thêm Mới, Sửa Đổi & OCC)
- **Mục đích**: Kiểm tra hành vi Modal nhập liệu, Focus Trap, validation ngày sinh, xử lý lưu thất bại và khóa lạc quan OCC.
- **Các bước thực hiện**:
  1. Tại Dashboard, bấm nút `[+ Thêm Hồ Sơ]` trên Header Island $\rightarrow$ Modal mở ra.
  2. Xác nhận tiêu điểm chuột tự động rơi vào ô input đầu tiên ("Họ và Tên").
  3. Nhấn phím `Tab` tuần hoàn $\rightarrow$ Xác nhận tiêu điểm giữ nguyên bên trong Modal (Focus Trap), không lọt ra ngoài nền trang.
  4. Nhập họ tên có khoảng trắng thừa đầu/cuối, nhập ngày sinh không hợp lệ (`31/02/1950`, `99/99/9999`) $\rightarrow$ Kiểm tra cảnh báo validation hiển thị rõ ràng.
  5. Bấm phím `Escape` $\rightarrow$ Modal đóng an toàn, tiêu điểm phục hồi về nút `[+ Thêm Hồ Sơ]`.
  6. Bấm nút Sửa trên một hồ sơ thử nghiệm $\rightarrow$ Chỉnh sửa địa chỉ hoặc số CCCD $\rightarrow$ Bấm `[Lưu Thay Đổi]` $\rightarrow$ Xác nhận lưu thành công, modal đóng, toast màu xanh hiện ra.
  7. Kiểm tra phòng vệ mất dữ liệu: Nếu lưu thất bại do mất mạng hoặc lỗi máy chủ, Modal phải giữ nguyên dữ liệu đang nhập dở, tuyệt đối không được tự động đóng xóa sạch form (Silent Data Loss).
- **Kết quả mong đợi**: Trải nghiệm form thân thiện, an toàn tuyệt đối trước nguy cơ mất dữ liệu người dùng.

---

### FLOW-06: Vòng Đời Xóa Hồ Sơ & Thùng Rác (RecycleBin & Audit Preservation)
- **Mục đích**: Kiểm tra xóa mềm, khôi phục hồ sơ và xóa vĩnh viễn bảo tồn lịch sử kiểm toán.
- **Các bước thực hiện**:
  1. Tại danh sách hồ sơ, bấm nút Xóa một hồ sơ thử nghiệm $\rightarrow$ Hộp thoại cảnh báo xuất hiện.
  2. Xác nhận xóa mềm $\rightarrow$ Hồ sơ biến mất khỏi danh sách chính, toast thông báo hoàn tất.
  3. Chuyển sang tab `Thùng Rác` (`recycle-bin`) $\rightarrow$ Tìm kiếm hồ sơ vừa bị xóa mềm.
  4. Bấm nút `[Khôi Phục]` $\rightarrow$ Xác nhận hồ sơ quay lại danh sách quản lý chính.
  5. Thử nghiệm xóa vĩnh viễn một bản ghi rác trong Thùng rác $\rightarrow$ Xác nhận CSDL xóa bản ghi `profiles` nhưng bảo tồn nguyên vẹn bản ghi trong `profile_audit_log`.
- **Kết quả mong đợi**: Vòng đời xóa - khôi phục - dọn thùng rác an toàn, tính bất biến kiểm toán được duy trì 100%.

---

### FLOW-07: Nhật Ký Hoạt Động, Cài Đặt Hệ Thống, Theme & Responsive
- **Mục đích**: Rà soát màn hình Audit Log, Settings, chuyển đổi Light/Dark mode và co giãn responsive đa kích thước màn hình.
- **Các bước thực hiện**:
  1. Mở tab `Nhật Ký Hoạt Động` (`audit`) $\rightarrow$ Rà soát dòng thời gian: hiển thị đúng các thao tác vừa thực hiện ở các luồng trên. Lọc theo loại hành động.
  2. Mở tab `Cài Đặt Hệ Thống` (`settings`) $\rightarrow$ Xem thông tin tài khoản, danh sách thôn, sao lưu CSDL.
  3. Bấm icon chuyển đổi Sáng / Tối trên Header $\rightarrow$ Kiểm tra toàn bộ màn hình chuyển đổi màu sắc, không có chữ chìm hay vỡ tương phản.
  4. Co giãn kích thước màn hình kiểm tra tại 3 độ phân giải chuẩn:
     - `1280px` (Desktop): Đầy đủ sidebar mở rộng, bảng hiển thị thoải mái.
     - `768px` (Tablet): Sidebar tự co gọn icon, bảng có thanh cuộn ngang mượt mà.
     - `360px` (Mobile): Menu chuyển sang dạng drawer/toggle, nút bấm đạt kích thước chạm $\ge 44\text{px}$.
- **Kết quả mong đợi**: Ứng dụng đáp ứng tốt trên mọi kích thước màn hình, độ tương phản màu đạt chuẩn WCAG 2.1 AA.
