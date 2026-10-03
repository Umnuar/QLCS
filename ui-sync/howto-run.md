# How to Run & Drive Both Apps (Reference: QLHK & Target: QLCS)

Tài liệu hướng dẫn cách vận hành, cổng kết nối, tài khoản kiểm thử và kịch bản điều khiển trình duyệt tự động (Playwright) cho toàn bộ các Subagent.

---

## 1. REFERENCE APP — QLHK (Nguồn Giao Diện Mẫu)

* **Vị trí thư mục**: `C:\Users\umnuar\Documents\Projects\QLHK` (alias: `C:\Projects\QLHK`)
* **Trạng thái**: **READ-ONLY (Tuyệt đối không chỉnh sửa bất kỳ file nào trong thư mục này)**

### 1.1. Chạy Backend (QLHK-Backend)
* **Thư mục**: `C:\Projects\QLHK\QLHK-Backend`
* **Lệnh khởi chạy**:
  ```powershell
  cd "C:\Projects\QLHK\QLHK-Backend"
  npm run dev
  ```
* **Cổng (Port)**: `5002`
* **Health Check**: `http://localhost:5002/api/health` hoặc `http://localhost:5002/health`

### 1.2. Chạy Frontend Client (QLHK-Client)
* **Thư mục**: `C:\Projects\QLHK\QLHK-Client`
* **Lệnh khởi chạy**:
  ```powershell
  cd "C:\Projects\QLHK\QLHK-Client"
  npm run dev
  ```
* **Cổng (Port)**: `5175`
* **Địa chỉ truy cập**: `http://localhost:5175`
* **Tài khoản kiểm thử**:
  * Tên đăng nhập: `admin`
  * Mật khẩu: `admin123456`

---

## 2. TARGET APP — QLCS (Ứng Dụng Cần Đồng Bộ Giao Diện)

* **Vị trí thư mục**: `C:\Users\umnuar\Documents\Projects\QLCS` (alias: `C:\Projects\QLCS`)
* **Branch hiện tại**: `ui/full-sync` (Base tag: `before-ui-sync`)

### 2.1. Chạy Backend (QLCS-Backend)
* **Thư mục**: `C:\Projects\QLCS\QLCS-Backend`
* **Lệnh khởi chạy**:
  ```powershell
  cd "C:\Projects\QLCS\QLCS-Backend"
  npm run dev
  ```
* **Cổng (Port)**: `5000`
* **Health Check**: `http://localhost:5000/api/health`
* **Lệnh build / kiểm tra**: `npm run build`

### 2.2. Chạy Frontend Client (QLCS-Client)
* **Thư mục**: `C:\Projects\QLCS\QLCS-Client`
* **Lệnh khởi chạy**:
  ```powershell
  cd "C:\Projects\QLCS\QLCS-Client"
  npm run dev
  ```
* **Cổng (Port)**: `5173`
* **Địa chỉ truy cập**: `http://localhost:5173`
* **Tài khoản kiểm thử**:
  * Tên đăng nhập: `admin`
  * Mật khẩu: `admin123456`
* **Lệnh kiểm thử tự động**:
  ```powershell
  cd "C:\Projects\QLCS\QLCS-Client"
  npm test          # vitest run (104 tests)
  npm run build:vite # tsc && vite build
  npm run lint      # eslint
  ```

---

## 3. Điều Khiển Trình Duyệt Bằng Playwright & Chụp Ảnh Đối Soát

Để trích xuất giá trị computed styles (`getComputedStyle`), chụp ảnh đối chiếu (`screenshots`) và kiểm thử click-through không lỗi console, subagent sử dụng Node.js script với Playwright cài sẵn:

### 3.1. Đường dẫn thư viện Playwright
* **Module Playwright**: `C:\Users\umnuar\.gemini\antigravity\brain\f236575e-f793-4311-a142-418095f3c8e0\scratch\node_modules\playwright`
* **Chromium Executable**: `C:\Users\umnuar\AppData\Local\ms-playwright\chromium-1187\chrome-win\chrome.exe`

### 3.2. Mẫu script khởi chạy trình duyệt thu thập Design Tokens / Styles
```javascript
const { chromium } = require('C:/Users/umnuar/.gemini/antigravity/brain/f236575e-f793-4311-a142-418095f3c8e0/scratch/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/umnuar/AppData/Local/ms-playwright/chromium-1187/chrome-win/chrome.exe',
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  // Mở Reference App QLHK (port 5175)
  await page.goto('http://localhost:5175');
  await page.waitForLoadState('networkidle');

  // Đăng nhập
  await page.locator('input[type="text"]').fill('admin');
  await page.locator('input[type="password"]').fill('admin123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(1000);

  // Thu thập computed styles phần tử
  const styles = await page.evaluate(() => {
    const el = document.querySelector('button');
    const comp = window.getComputedStyle(el);
    return {
      backgroundColor: comp.backgroundColor,
      borderRadius: comp.borderRadius,
      fontFamily: comp.fontFamily,
      fontSize: comp.fontSize,
      boxShadow: comp.boxShadow,
      padding: comp.padding
    };
  });

  console.log('Computed styles:', styles);
  await browser.close();
})();
```

### 3.3. Quy tắc lưu trữ bằng chứng
* Ảnh chụp từ Reference (QLHK): `ui-sync/shots/ref/`
* Ảnh chụp từ Target (QLCS): `ui-sync/shots/target/`
* Kích thước viewport đối soát chuẩn: `1366x768` (Desktop chính), `1100x700` (Laptop vừa), `768x1024` (Tablet), `360x640` (Mobile).
