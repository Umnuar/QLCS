# Chính Sách An Toàn Thông Tin (SECURITY.md)

Tài liệu này quy định phạm vi, nguyên tắc và quy trình tiếp nhận, xử lý báo cáo lỗ hổng an toàn thông tin cho hệ thống Quản Lý Chính Sách (QLCS) — Xã Đăk Hà.

---

## 1. Phiên bản được hỗ trợ

Chỉ các phiên bản chính thức được liệt kê dưới đây mới nhận được các bản cập nhật và vá lỗi an toàn thông tin:

| Phiên bản | Môi trường | Hỗ trợ bảo mật | Tình trạng |
| :---: | :--- | :---: | :--- |
| **v3.0.x** | Desktop Electron & Local Web | Có | Phiên bản hoạt động chính thức |
| **< v3.0.0** | Các bản thử nghiệm cũ | Không | Không nhận bản vá, khuyến nghị nâng cấp |

---

## 2. Cách báo cáo lỗ hổng

Nếu bạn phát hiện vấn đề an toàn thông tin hoặc nguy cơ lộ lọt dữ liệu trong hệ thống, vui lòng thông báo theo các kênh sau:

- **Kênh GitHub (Ưu tiên)**: Sử dụng tính năng [Báo cáo lỗ hổng](../../security/advisories/new) trong mục Security của kho lưu trữ.
- **Email an ninh chuyên trách**: Gửi trực tiếp tới địa chỉ `baotruongminh201@gmail.com`.
- **Tiêu đề thư mẫu**: `[BÁO CÁO LỖ HỔNG - QLCS] <Tóm tắt ngắn gọn vấn đề>`

> [!WARNING]
> **Nguyên tắc tiết lộ có trách nhiệm**: **Không** công khai chi tiết lỗ hổng trên GitHub Issues, Pull Requests, diễn đàn hoặc mạng xã hội trước khi bản vá được phát hành và kiểm chứng an toàn.

---

## 3. Nội dung cần cung cấp

Để quá trình đánh giá và xác minh diễn ra thuận lợi, báo cáo nên bao gồm:

- **Mô tả chi tiết**: Tóm tắt bản chất lỗ hổng và rủi ro tiềm ẩn.
- **Vị trí ảnh hưởng**: Đường dẫn tệp, hàm hoặc API endpoint liên quan.
- **Các bước tái hiện**: Kịch bản tối thiểu để tái hiện lỗi trên môi trường local (kèm mã kiểm thử PoC nếu có).
- **Mức độ tác động**: Đánh giá sơ bộ về tính bảo mật, tính toàn vẹn hoặc tính sẵn sàng của dữ liệu.
- **Gợi ý khắc phục**: Đề xuất phương án sửa lỗi hoặc giảm thiểu rủi ro (nếu có).

---

## 4. Mục tiêu thời gian phản hồi

Đội ngũ phát triển và bộ phận phụ trách an toàn thông tin áp dụng các mốc mục tiêu xử lý như sau:

- **Xác nhận tiếp nhận**: Mục tiêu trong vòng **2 ngày làm việc** kể từ khi nhận được báo cáo.
- **Đánh giá & xác minh**: Mục tiêu trong vòng **5 ngày làm việc** nhằm phân loại mức độ nghiêm trọng.
- **Phát hành bản vá**: Đội ngũ sẽ nỗ lực tối đa để phát triển và kiểm thử bản vá trong thời gian sớm nhất; không cam kết thời hạn cố định do phụ thuộc mức độ phức tạp kỹ thuật.

---

## 5. Chính sách công bố thông tin

- **Công bố phối hợp**: Mọi thông tin về lỗ hổng chỉ được công bố sau khi bản vá đã được hoàn thiện và triển khai an toàn trên hệ thống.
- **Ghi nhận đóng góp**: Tên hoặc bí danh của người phát hiện sẽ được ghi nhận trong danh sách cảm ơn tại bản phát hành (nếu người báo cáo đồng ý).

---

## 6. Phạm vi kiểm thử

### Được phép
- Rà soát mã nguồn công khai trên kho lưu trữ.
- Thực hiện kiểm thử an toàn trên môi trường máy trạm cá nhân hoặc môi trường phát triển local.

### Nghiêm cấm
- Tấn công từ chối dịch vụ (DoS / DDoS) hoặc làm gián đoạn hạ tầng máy chủ vận hành thực tế.
- Tấn công vét cạn (brute-force) tài khoản thật hoặc thử nghiệm trên dữ liệu công dân thật.
- Khai thác lỗ hổng nhằm xem trộm, sao chép, chỉnh sửa hoặc xóa dữ liệu công dân.
- Sử dụng các hình thức lừa đảo xã hội (phishing, social engineering) đối với cán bộ và người dùng.

---

## 7. Điều khoản miễn trừ (Safe Harbor)

Ủy ban Nhân dân Xã Đăk Hà ghi nhận thiện chí và tạo điều kiện thuận lợi cho các hoạt động nghiên cứu an ninh thông tin có trách nhiệm. Khi người nghiên cứu tuân thủ đúng phạm vi kiểm thử, thực hiện báo cáo theo quy trình trong tài liệu này và không gây ảnh hưởng tới dữ liệu hay tính liên tục của hệ thống, đơn vị sẽ không khởi kiện hoặc yêu cầu cơ quan pháp luật xử lý trách nhiệm dân sự đối với hoạt động nghiên cứu đó.

---

## 8. Tổng quan thiết kế an toàn

Hệ thống được thiết kế với các tầng bảo vệ kỹ thuật cơ bản:

- **Xác thực phiên làm việc**: Sử dụng JSON Web Token (JWT) gồm Access Token ngắn hạn và Refresh Token riêng biệt.
- **Phân quyền truy cập theo địa bàn**: Cán bộ Xã (Admin) quản trị toàn bộ dữ liệu xã; Trưởng Thôn chỉ có quyền xem và xử lý dữ liệu thuộc thôn được phân công.
- **Mã hóa dữ liệu nhạy cảm**: Số Căn cước công dân (CCCD) được mã hóa tại tầng lưu trữ cơ sở dữ liệu bằng thuật toán `AES-256-GCM` kèm vector khởi tạo ngẫu nhiên (IV).
- **Che mờ dữ liệu trên giao diện**: Mặc định hiển thị 4 chữ số cuối `••••••••1234` trên bảng biểu để giảm thiểu rủi ro lộ lọt qua màn hình làm việc.
- **Nhật ký kiểm toán**: Lưu vết thao tác thêm, sửa, xóa, khôi phục và giải mã dữ liệu phục vụ đối soát và giám sát hoạt động.

---

## 9. Khuyến nghị cho đơn vị triển khai

- **Đổi mật khẩu mặc định**: Thay đổi mật khẩu tài khoản quản trị ngay sau khi khởi tạo hệ thống lần đầu.
- **Bảo mật biến môi trường**: Tách biệt tệp `.env`, không chia sẻ khóa bí mật qua các kênh truyền thông điệp không an toàn.
- **Bảo mật kênh truyền**: Kích hoạt giao thức mã hóa HTTPS/TLS khi triển khai ứng dụng trên mạng nội bộ hoặc máy chủ dùng chung.
- **Sao lưu định kỳ**: Thực hiện sao lưu cơ sở dữ liệu thường xuyên và lưu trữ bản sao lưu tại vị trí an toàn.
- **Cập nhật hệ thống**: Thường xuyên theo dõi và áp dụng các bản vá lỗi phần mềm và gói phụ thuộc mới nhất.

---

## 10. Bảo vệ dữ liệu cá nhân

Hệ thống được thiết kế hướng tới việc phù hợp các quy định tại Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Khi đưa vào vận hành thực tế tại địa phương, đơn vị triển khai cần xác minh chi tiết các quy trình quản lý, lưu trữ và xử lý dữ liệu với cơ quan chuyên môn pháp lý có thẩm quyền.

---

## 11. Bản quyền

Chính sách bảo mật này là một phần của hệ thống QLCS. Chi tiết về bản quyền và quyền sở hữu xem tại mục [Giấy phép trong README.md](README.md#giấy-phép).
