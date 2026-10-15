# PHẦN MỀM QUẢN LÝ CHÍNH SÁCH NGƯỜI CAO TUỔI (QLCS) - UBND XÃ ĐĂK HÀ

> **Phiên bản chính thức:** v1.5.0 (Bản phát hành Desktop ổn định)  
> **Nền tảng hỗ trợ:** Windows 10 / Windows 11 (64-bit)  
> **Đơn vị chủ quản:** Ủy ban Nhân dân Xã Đăk Hà, Huyện Tu Mơ Rông, Tỉnh Kon Tum  
> **Hạ tầng kết nối:** Mạng diện rộng an toàn qua Cloudflare Tunnel (qlcs.dulieudakha.vn)

---

## 1. GIỚI THIỆU TỔNG QUAN
- **Sứ mệnh chuyển đổi số**: Phân hệ Quản lý Chính sách Người cao tuổi (QLCS) là giải pháp phần mềm chuyên dụng trong chương trình Chuyển đổi số của UBND Xã Đăk Hà, số hóa toàn diện quy trình rà soát, đối soát và thực hiện chế độ chính sách an sinh xã hội đối với người cao tuổi trên địa bàn xã.
- **Nghiệp vụ cốt lõi**: Tự động hóa tính tuổi và phân loại mốc chúc thọ theo quy định pháp luật; quản lý chặt chẽ diện đối tượng trợ cấp hưu trí xã hội; hỗ trợ rà soát, chi trả quà và chế độ nhanh chóng, minh bạch và chính xác.
- **Đối tượng người dùng chính**:
  - Cán bộ Văn hóa - Xã hội / Lao động - Thương binh & Xã hội cấp xã phụ trách tổng hợp, quản lý toàn diện hồ sơ và báo cáo cấp trên.
  - Trưởng thôn, Ban Quản lý 8 thôn/làng bản thực hiện rà soát biến động, đối soát thực tế và theo dõi trao tặng quà chúc thọ tại cơ sở.
  - Thường trực UBND Xã theo dõi, giám sát tiến độ thực hiện chế độ chính sách an sinh trên địa bàn.

## 2. TẢI VỀ BẢN PHÁT HÀNH CHÍNH THỨC (.EXE / .MSI)
Cán bộ và các đơn vị trực thuộc tải về bộ cài đặt chính thức tại liên kết sau:

| Loại tệp | Tên tệp phát hành | Dung lượng | Tải trực tiếp |
| :--- | :--- | :---: | :---: |
| **Bộ cài đặt tiêu chuẩn (Installer)** | `QLCS-Setup-v1.5.0.exe` | ~12 MB | [Tải về (.exe)](https://github.com/Umnuar/QLCS/releases/latest/download/QLCS-Setup-v1.5.0.exe) |
| **Gói triển khai hệ thống (MSI Package)** | `QLCS_1.5.0_x64_en-US.msi` | ~15 MB | [Tải về (.msi)](https://github.com/Umnuar/QLCS/releases/latest/download/QLCS_1.5.0_x64_en-US.msi) |

> [!NOTE]
> Tất cả các bản dựng đều được kiểm tra tính toàn vẹn và tích hợp cơ chế tự động nâng cấp phiên bản (Auto-Updater). Cán bộ có thể xem toàn bộ lịch sử các bản vá tại [GitHub Releases](https://github.com/Umnuar/QLCS/releases).

## 3. YÊU CẦU HỆ THỐNG MÁY TRẠM
Để đảm bảo phần mềm hoạt động mượt mà, máy tính cán bộ cần đáp ứng các tiêu chuẩn sau:
- **Hệ điều hành**: Microsoft Windows 10 (Build 19041 trở lên) hoặc Windows 11 (64-bit).
- **Phần cứng tối thiểu**:
  - Bộ vi xử lý (CPU): Intel Core i3 thế hệ 6 / AMD Ryzen 3 trở lên.
  - Dung lượng RAM: Tối thiểu 4GB (Khuyến nghị 8GB để xử lý bảng tính lớn).
  - Dung lượng ổ cứng: Trống tối thiểu 500MB (Khuyến nghị sử dụng ổ cứng SSD).
- **Màn hình hiển thị**: Độ phân giải tối ưu chuẩn 1920x1080 (FullHD Single-Viewport) hoặc tối thiểu 1366x768.
- **Kết nối mạng**: Cần có kết nối Internet để đồng bộ dữ liệu thời gian thực về máy chủ xã (Hệ thống có cơ chế Offline Cache tự động bảo toàn dữ liệu khi đường truyền gián đoạn).

## 4. HƯỚNG DẪN CÀI ĐẶT & NÂNG CẤP
- **Bước 1**: Tải tệp tin `QLCS-Setup-v1.5.0.exe` từ bảng tải về ở Mục 2.
- **Bước 2**: Nhấp đúp chuột vào tệp tin vừa tải về để tiến hành cài đặt tự động. Trình cài đặt được thiết kế chạy trực tiếp trong không gian người dùng, không yêu cầu cấp quyền Administrator phức tạp.
- **Lưu ý Windows SmartScreen**: Đối với lần khởi động đầu tiên, do phần mềm lưu hành nội bộ chính quyền số, Windows có thể hiển thị thông báo bảo vệ màu xanh:
  1. Nhấp chuột vào dòng chữ **"More info"** (hoặc *Thông tin khác*).
  2. Chọn nút **"Run anyway"** (hoặc *Vẫn chạy*) để tiếp tục khởi chạy ứng dụng.
- **Cơ chế cập nhật tự động (Auto-Update)**: Mỗi khi mở ứng dụng, phần mềm tự động kiểm tra phiên bản mới nhất từ máy chủ phát hành qua kênh mã hóa an toàn HTTPS. Khi có bản cập nhật mới, hệ thống tự động tải về ngầm và hiển thị thông báo, cán bộ chỉ cần nhấn 1 cú nhấp chuột để hoàn tất nâng cấp mà không bị mất dữ liệu đang làm việc.

## 5. CÁC TÍNH NĂNG NGHIỆP VỤ NỔI BẬT
1. **Quản lý & Tự động phân loại mốc chúc thọ**: Tự động tính toán độ tuổi chuẩn xác theo năm kế hoạch và ngày tháng năm sinh, phân nhóm theo đúng các mốc quy định (70, 75, 80, 85, 90, 95, 100 và trên 100 tuổi), hỗ trợ đánh dấu trạng thái trao nhận quà trực quan.
2. **Quản lý trợ cấp hưu trí xã hội**: Theo dõi chi tiết từng diện thụ hưởng (từ 75 tuổi trở lên không có lương hưu, từ 70–74 tuổi thuộc diện hộ nghèo/cận nghèo, bảo trợ xã hội, người có công), giúp ngăn ngừa triệt để tình trạng bỏ sót hoặc chi trả trùng lặp chế độ.
3. **Tiếp nhận & Xử lý bảng tính Excel thông minh**: Cho phép kéo thả trực tiếp các tệp danh sách Excel (`.xlsx`, `.xls`) từ các thôn, tự động nhận diện cột nghiệp vụ, đối soát trùng lặp theo mã định danh CCCD và cung cấp giao diện xem trước trước khi lưu vào hệ thống.
4. **Phân quyền truy cập theo địa bàn thôn**: Thiết lập quyền hạn chặt chẽ theo phân cấp hành chính: Cán bộ Xã có thẩm quyền quản trị toàn xã; Trưởng thôn chỉ có quyền tra cứu và cập nhật dữ liệu của người cao tuổi thuộc thôn mình phụ trách.
5. **Thùng rác an toàn & Phục hồi dữ liệu**: Cơ chế xóa mềm dữ liệu đảm bảo không bị mất thông tin do thao tác nhầm, cho phép xem lại chi tiết và phục hồi hồ sơ kèm toàn bộ lịch sử liên quan khi cần thiết.
6. **Báo cáo thống kê & Xuất biểu mẫu đối soát**: Trực quan hóa số liệu tỷ lệ chi trả quà, tỷ lệ đối soát hưu trí xã hội qua biểu đồ KPI đa chiều và xuất bảng kê chi trả theo đúng mẫu biểu quy định của ngành Lao động - Xã hội.

## 6. HƯỚNG DẪN ĐĂNG NHẬP & KẾT NỐI HỆ THỐNG
- **Khởi động ứng dụng**: Nhấp đúp vào biểu tượng lối tắt **"QLCS - UBND Xã Đăk Hà"** trên màn hình Desktop hoặc tìm kiếm trong menu Start của Windows.
- **Máy chủ kết nối**: Ứng dụng đã được tích hợp sẵn cấu hình định tuyến an toàn về trung tâm dữ liệu `qlcs.dulieudakha.vn` qua hệ thống mạng diện rộng Cloudflare Tunnel, cán bộ không cần thiết lập IP hay cổng kết nối thủ công.
- **Tài khoản truy cập**: Cán bộ sử dụng tên đăng nhập và mật khẩu chính thức do Tổ Quản trị Công nghệ thông tin / Văn phòng UBND Xã Đăk Hà cấp phát theo vị trí công tác.

## 7. AN TOÀN THÔNG TIN & BẢN QUYỀN SỞ HỮU
- **Bản quyền phần mềm**: Toàn bộ bản quyền phần mềm, cấu trúc dữ liệu và tài liệu kỹ thuật thuộc quyền sở hữu độc quyền của **Ủy ban Nhân dân Xã Đăk Hà, Huyện Tu Mơ Rông, Tỉnh Kon Tum**. Nghiêm cấm mọi hành vi sao chép, trích xuất mã nguồn, chỉnh sửa, phân phối lại hoặc can thiệp thương mại khi chưa có văn bản chấp thuận chính thức từ UBND Xã.
- **An toàn thông tin dữ liệu công dân**:
  - Toàn bộ thông tin định danh cá nhân nhạy cảm (số Căn cước công dân - CCCD) được bảo vệ bằng thuật toán mã hóa mật mã học đối xứng AES-256-GCM.
  - Ứng dụng áp dụng mã băm một chiều SHA-256 (`cccd_hash`) để phục vụ tìm kiếm đối soát mà không làm lộ dữ liệu gốc.
  - Phân tách phạm vi truy cập dữ liệu đa người thuê (Multi-tenant) triệt để giữa các thôn, loại trừ rủi ro rò rỉ dữ liệu chéo.

## 8. ĐẦU MỐI HỖ TRỢ KỸ THUẬT & LIÊN HỆ
- **Đơn vị phụ trách**: Tổ Công nghệ số cộng đồng & Bộ phận Thống kê - Văn phòng UBND Xã Đăk Hà.
- **Thường trực hỗ trợ kỹ thuật**: `baotruongminh201@gmail.com`
- **Báo cáo sự cố hoặc đề xuất tính năng**: Tạo yêu cầu tại mục [Issues trên GitHub Repository chính thức](https://github.com/Umnuar/QLCS/issues).
