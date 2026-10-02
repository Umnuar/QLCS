# Danh Sách Các Luồng Người Dùng Kiểm Thử (User Flows) — QLCS v3.0.0

Tài liệu này định nghĩa chi tiết các kịch bản và luồng thao tác người dùng (User Flows) để phục vụ kiểm thử trực tiếp trên trình duyệt theo quy trình QA Pha 1.

---

## Danh Mục Phân Hệ & Luồng Kiểm Thử

### FLOW-01: Xác thực & Đăng nhập (Authentication Flow)
- **Mục đích**: Kiểm tra cơ chế đăng nhập với các vai trò (Admin, Cán bộ thôn), kiểm tra xác thực form, xử lý lỗi đăng nhập sai thông tin và cơ chế bảo lưu phiên làm việc.
- **Các bước thực hiện**:
  1. Tải trang gốc `http://localhost:5173/` (trạng thái chưa đăng nhập).
  2. Để trống tài khoản/mật khẩu và nhấn nút "Đăng Nhập" $\rightarrow$ Kiểm tra thông báo lỗi validation.
  3. Nhập tài khoản không tồn tại (vd: `invalid_user`) $\rightarrow$ Kiểm tra thông báo lỗi từ server ("Tài khoản hoặc mật khẩu không chính xác").
  4. Nhập đúng tài khoản Cán bộ thôn (vd: `thon1`) $\rightarrow$ Xác nhận đăng nhập thành công, điều hướng thẳng tới tab Thống kê của thôn tương ứng.
  5. Đăng xuất và đăng nhập lại bằng tài khoản Quản trị viên (`admin`) $\rightarrow$ Xác nhận hiển thị danh sách thôn tại màn hình `VillagesPage`.
- **Kết quả mong đợi**:
  - Giao diện form hiển thị đúng nhãn a11y, focus rõ ràng, báo lỗi đúng vị trí.
  - Sau khi đăng nhập, JWT access token & refresh token được lưu bảo mật, giao diện chuyển tab tương ứng với quyền (RBAC).

---

### FLOW-02: Điều hướng & Quản lý Thôn (Navigation & Village Selection)
- **Mục đích**: Kiểm tra luồng điều hướng giữa các phân hệ, chọn thôn làm việc và chuyển đổi ngữ cảnh.
- **Các bước thực hiện**:
  1. Từ màn hình `VillagesPage` (Admin), kiểm tra danh sách các thôn (Thôn 1, Thôn 2, Thôn 3, Thôn 4, Kon Trang Long Loi, Kon Tu Dơ 1, Kon Tu Dơ 2).
  2. Bấm vào một thôn cụ thể (vd: Thôn 1) $\rightarrow$ Kiểm tra Sidebar cập nhật hiển thị các mục "Hồ Sơ Chúc Thọ", "Hưu Trí Xã Hội" của thôn đó.
  3. Bấm vào nút "Quản Lý Thôn" (hoặc thẻ Village Indicator trên Header) $\rightarrow$ Quay trở lại màn hình chọn thôn.
  4. Bấm nút "Xem Báo Cáo Đối Soát" trên Banner $\rightarrow$ Chuyển thẳng tới tab Thống Kê toàn xã.
- **Kết quả mong đợi**:
  - Thẻ thôn hỗ trợ điều hướng chuột và phím (`Tab`, `Enter`, `Space`).
  - Không có giật layout hay delay hiển thị khi đổi ngữ cảnh thôn.

---

### FLOW-03: Quản lý Hồ sơ Chúc Thọ (Chuctho Profile CRUD Flow)
- **Mục đích**: Kiểm tra toàn bộ vòng đời hồ sơ chúc thọ: Thêm mới, Sửa, Đánh dấu nhận quà, Xóa mềm vào Thùng rác.
- **Các bước thực hiện**:
  1. Vào phân hệ "Hồ Sơ Chúc Thọ".
  2. Bấm nút `[+ Thêm Hồ Sơ]` $\rightarrow$ Mở `ProfileModal`.
  3. Thử submit form rỗng hoặc nhập ngày sinh không hợp lệ $\rightarrow$ Kiểm tra form validation.
  4. Nhập đầy đủ thông tin mẫu: Họ tên ("NGUYỄN VĂN TEST"), Ngày sinh ("01/01/1956" - 70 tuổi), CCCD 12 số, Dân tộc ("Kinh"), Thôn $\rightarrow$ Bấm "Lưu Hồ Sơ".
  5. Xác nhận hồ sơ xuất hiện trong bảng với đúng mốc tuổi (70 tuổi) và CCCD được che `••••••••1234`.
  6. Bấm nút "Sửa" trên hàng $\rightarrow$ Cập nhật thông tin ghi chú $\rightarrow$ Bấm "Lưu" $\rightarrow$ Xác nhận dữ liệu cập nhật.
  7. Bấm nút "Đánh dấu nhận quà" $\rightarrow$ Trạng thái chuyển đổi ngay lập tức.
  8. Bấm nút "Xóa" $\rightarrow$ Xác nhận trong hộp thoại xác nhận $\rightarrow$ Hồ sơ biến mất khỏi bảng chính.
- **Kết quả mong đợi**:
  - Modal có Focus Trap, không bị mất tiêu điểm, hỗ trợ phím `Escape`.
  - Dữ liệu lưu thành công không làm mất form khi có lỗi.
  - OCC version được kiểm soát chặt chẽ.

---

### FLOW-04: Quản lý Trợ cấp Hưu trí Xã hội (HTXH CRUD Flow)
- **Mục đích**: Kiểm tra thao tác với hồ sơ Hưu trí Xã hội theo diện trợ cấp.
- **Các bước thực hiện**:
  1. Vào phân hệ "Hưu Trí Xã Hội" (`htxh`).
  2. Bấm nút `[+ Thêm Hồ Sơ]` $\rightarrow$ Kiểm tra các trường đặc thù của HTXH (diện trợ cấp, mức hưởng, quyết định hưởng).
  3. Thêm mới một hồ sơ HTXH thử nghiệm $\rightarrow$ Xác nhận hiển thị trên bảng.
  4. Lọc theo từng diện trợ cấp $\rightarrow$ Xác nhận danh sách lọc chính xác.
  5. Xóa mềm hồ sơ thử nghiệm $\rightarrow$ Xác nhận chuyển vào thùng rác.
- **Kết quả mong đợi**:
  - Dữ liệu tính toán diện hưởng và mức trợ cấp khớp với nghiệp vụ.

---

### FLOW-05: Tìm kiếm, Bộ lọc & Phân trang (Search, Filter & Pagination Flow)
- **Mục đích**: Kiểm tra tốc độ tìm kiếm không dấu, debounce, AbortController chống stale UI, và tính nhất quán khi đổi phân trang.
- **Các bước thực hiện**:
  1. Gõ tìm kiếm họ tên bằng tiếng Việt không dấu (vd: "nguyen van") $\rightarrow$ Kiểm tra bảng cập nhật kết quả tương ứng.
  2. Lọc theo mốc tuổi (70, 75, 80...).
  3. Lọc theo trạng thái nhận quà (Đã nhận / Chưa nhận).
  4. Dùng `YearSelector`: Chọn năm dự báo tương lai (vd: 2027) $\rightarrow$ Xác nhận mốc tuổi và thống kê tính toán lại theo năm đó.
  5. Đang ở trang 2 hoặc 3, đổi số bản ghi hiển thị (từ 10 lên 50) $\rightarrow$ Kiểm tra trang tự động reset về trang 1 (TASK-P1-01).
- **Kết quả mong đợi**:
  - Không có hiện tượng giật màn hình hoặc request cũ đè request mới.
  - Phân trang tính toán chính xác tổng số bản ghi và tổng số trang.

---

### FLOW-06: Nhập Excel & Bảng Đối Soát Xem Trước (Excel Import Flow)
- **Mục đích**: Kiểm tra tính năng kéo thả file Excel, parse dữ liệu qua Web Worker, kiểm tra bảng preview đối soát 10 cột, phát hiện dòng lỗi và nhập dữ liệu.
- **Các bước thực hiện**:
  1. Bấm nút `[📄 Nhập Excel]` trên Header Island $\rightarrow$ Mở `ImportModal`.
  2. Bấm "Tải Biểu Mẫu Chuẩn (.xlsx)" $\rightarrow$ Xác nhận tệp tải về máy.
  3. Kéo thả file Excel thử nghiệm có chứa cả dòng hợp lệ và dòng sai ngày sinh $\rightarrow$ Xác nhận bảng đối soát hiển thị:
     - 3 cột đầu sticky cố định (STT, Thôn/Diện, Họ và Tên).
     - Dòng lỗi ngày sinh được tô đỏ cảnh báo.
     - Số lượng bản ghi hợp lệ / lỗi được thống kê chính xác.
  4. Bấm "Xác Nhận Nhập" $\rightarrow$ Kiểm tra quá trình bulk insert và thông báo kết quả.
- **Kết quả mong đợi**:
  - Web Worker xử lý mượt mà, không làm đơ UI client.
  - Bảng preview cuộn ngang mượt mà, 3 cột đầu ghim cố định chuẩn QLHK.

---

### FLOW-07: Xuất Báo Cáo Excel (Excel Export Flow)
- **Mục đích**: Kiểm tra tính năng xuất danh sách hồ sơ chúc thọ và HTXH ra tệp `.xlsx` có định dạng chuẩn (tiêu đề, khung viền, căn lề, công thức tuổi).
- **Các bước thực hiện**:
  1. Bấm nút `[📥 Xuất Excel]`.
  2. Kiểm tra tệp `.xlsx` được tạo và tải về máy.
  3. Xác nhận tên tệp có chứa tên thôn và năm tính toán.
- **Kết quả mong đợi**:
  - Tệp Excel xuất đúng format tiếng Việt UTF-8, không bị lỗi font hay mất cột.

---

### FLOW-08: Thùng Rác & Khôi phục Dữ liệu (Recycle Bin Flow)
- **Mục đích**: Kiểm tra cơ chế Soft Delete: xem danh sách đã xóa, khôi phục hồ sơ và xóa vĩnh viễn.
- **Các bước thực hiện**:
  1. Chuyển sang tab "Thùng Rác" (`recycle-bin`).
  2. Xác nhận các hồ sơ đã xóa ở FLOW-03 và FLOW-04 xuất hiện tại đây.
  3. Bấm "Khôi phục" 1 hồ sơ $\rightarrow$ Xác nhận hồ sơ quay lại bảng chính `chuctho`.
  4. Bấm "Xóa vĩnh viễn" hồ sơ còn lại $\rightarrow$ Xác nhận modal cảnh báo xuất hiện $\rightarrow$ Đồng ý xóa $\rightarrow$ Xác nhận bản ghi bị xóa hoàn toàn khỏi DB.
- **Kết quả mong đợi**:
  - Dữ liệu khôi phục nguyên vẹn thuộc tính và audit log ghi nhận hành động `RESTORE` / `PERMANENT_DELETE`.

---

### FLOW-09: Thống Kê & Báo Cáo Tổng Hợp (Analytics Dashboard Flow)
- **Mục đích**: Kiểm tra trang Thống Kê số liệu đối soát toàn xã và từng thôn.
- **Các bước thực hiện**:
  1. Mở tab "Thống Kê" (`analytics`).
  2. Kiểm tra các thẻ KPI: Tổng số người cao tuổi, Đã nhận quà, Chưa nhận quà, Kinh phí dự kiến.
  3. Đổi bộ lọc thôn và năm $\rightarrow$ Xác nhận biểu đồ và số liệu thay đổi tương ứng.
- **Kết quả mong đợi**:
  - Truy vấn tối ưu qua `groupBy` (TASK-P1-04), thời gian nạp < 300ms, không có vòng lặp 28 queries.

---

### FLOW-10: Cài Đặt Hệ Thống, Quản Trị & Sao Lưu (Settings & Backup Flow)
- **Mục đích**: Kiểm tra trang Cài đặt: thông tin tài khoản, danh sách người dùng, chức năng tạo bản sao lưu DB.
- **Các bước thực hiện**:
  1. Mở tab "Cài Đặt Hệ Thống" (`settings`).
  2. Kiểm tra thông tin tài khoản hiện tại.
  3. Thử tạo bản sao lưu dữ liệu (Backup) $\rightarrow$ Xác nhận tải về tệp json/sql sao lưu an toàn.
- **Kết quả mong đợi**:
  - Không lộ secret key hay chuỗi nhạy cảm.
