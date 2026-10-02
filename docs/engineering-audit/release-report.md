# BÁO CÁO THẨM TRA ĐÓNG GÓI & PHÁT HÀNH (RELEASE & PACKAGING REPORT)
**Hệ Thống:** Quản Lý Chính Sách Xã Đăk Hà (QLCS)  
**Tác Giả:** AGENT 6 - Test & Release Engineer  
**Thời Điểm Thẩm Tra:** 30/09/2026  
**Nguyên Tắc Bất Biến:** *"Build passes KHÔNG ĐƯỢC đánh đồng với Production runtime verified"*  
**Trạng Thái Đóng Gói:** ⚠️ **TIỀM ẨN 3 RỦI RO SƠ BỘ TRONG PRODUCTION RUNTIME**

---

## 1. THẨM TRA CẤU HÌNH BUILD & PACKAGING

### 1.1. Cấu Hình Tầng Client (`QLCS-Client`)

#### A. Phân tích `package.json`
- **Tên & Phiên bản:** `quan-ly-chinh-sach@3.0.0`
- **Loại Module:** `"type": "module"` (ESM)
- **Main Entry:** `"dist-electron/main.js"` (Trỏ chuẩn xác vào thư mục build của Electron)
- **Các lệnh Build:**
  - `"build:vite": "tsc && vite build"` (Chỉ build code web renderer và electron main/preload)
  - `"build:win": "tsc && vite build && electron-builder --win"` (Đóng gói bộ cài NSIS Windows)
  - `"build": "tsc && vite build && electron-builder"` (Đóng gói đa nền tảng)
- **Đánh giá Dependencies:** Phân tách rõ ràng giữa runtime dependencies (`react`, `axios`, `xlsx`, `zod`, `idb`, `electron-store`, `electron-updater`) và devDependencies (`electron`, `electron-builder`, `vite`, `typescript`).

#### B. Phân tích `vite.config.ts`
- **Plugins tích hợp:**
  1. `nodePolyfills({ include: ['stream', 'buffer', 'util', 'events', 'process'], globals: { Buffer: true, global: true, process: true } })`: Cần thiết để hỗ trợ các thư viện xử lý Excel và crypto.
  2. `react()`: Xử lý JSX/TSX và Fast Refresh.
  3. `electron(...)`: Cấu hình 2 tầng:
     - Main entry: `electron/main.ts` -> sinh ra `dist-electron/main.js`.
     - Preload input: `electron/preload.ts` -> sinh ra `dist-electron/preload.mjs`.
     - Renderer: Vô hiệu hóa polyfill khi chạy test (`process.env.NODE_ENV === 'test' ? undefined : {}`).
- **Module Resolution:** Cấu hình alias `@` trỏ vào `./src`.
- **Cảnh báo:** Chưa định nghĩa `chunkSizeWarningLimit` hoặc chia chunk thủ công (`manualChunks`), dẫn đến file bundle của thư viện `xlsx` vượt quá 600 KB.

#### C. Phân tích `electron-builder.json5`
```json5
{
  "appId": "com.quanly.chinhsach",
  "asar": true,
  "productName": "Quan Ly Chinh Sach",
  "directories": { "output": "release/${version}" },
  "files": [ "dist", "dist-electron" ],
  "publish": [{ "provider": "github", "owner": "Umnuar", "repo": "QLCS" }],
  "win": {
    "target": [{ "target": "nsis", "arch": ["x64"] }],
    "artifactName": "${productName}-Windows-${version}-Setup.${ext}"
  },
  "nsis": {
    "oneClick": false,
    "perMachine": false,
    "allowToChangeInstallationDirectory": true,
    "deleteAppDataOnUninstall": false
  }
}
```
- **Ưu điểm:**
  - `asar: true`: Bảo vệ mã nguồn, đóng gói nguyên khối an toàn.
  - NSIS cấu hình chuẩn nghiệp vụ: Cho phép người dùng tùy chọn thư mục cài đặt (`allowToChangeInstallationDirectory: true`), không xóa dữ liệu người dùng khi gỡ cài đặt (`deleteAppDataOnUninstall: false`).
  - Tích hợp sẵn cơ chế Auto-Update qua GitHub Releases (`Umnuar/QLCS`).
- **Lỗ hổng cấu hình nghiêm trọng:** **Không hề khai báo `icon` trong mục `win`**!

---

### 1.2. Cấu Hình Tầng Backend (`QLCS-Backend`)

#### A. Phân tích `package.json`
- **Phiên bản:** `qlcs-backend@1.0.0`
- **Main Entry:** `"dist/index.js"`
- **Lệnh Build:** `"build": "tsc"`, `"start": "node dist/index.js"`.
- **Database Scripts:** Tích hợp đầy đủ `prisma:generate`, `prisma:push`, `prisma:studio`, `seed`.

#### B. Phân tích `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "scripts"]
}
```
- **Đánh giá:** Cấu hình chuẩn Enterprise TypeScript backend: `strict: true`, target hiện đại `ES2022`, sinh source maps phục vụ tracing crash log tại production.

---

## 2. KẾT QUẢ THỰC TẾ TYPECHECK & BUILD PHÂN TÍCH

### 2.1. Thử Nghiệm Build Client (`QLCS-Client`)

#### Thử Nghiệm 1: Chạy qua đường dẫn ảo NTFS Junction (`c:\Projects\QLCS`)
- **Lệnh:** `npm --prefix c:\Projects\QLCS\QLCS-Client run build:vite`
- **Kết quả:** ❌ **BUILD THẤT BẠI (Exit Code: 1)**
- **Nhật ký lỗi (Error Log):**
```
error during build:
[vite:build-html] The "fileName" or "name" properties of emitted chunks and assets must be strings that are neither absolute nor relative paths, received "../../../Users/umnuar/Documents/Projects/QLCS/QLCS-Client/index.html".
    at getRollupError (parseAst.js:406:41)
    at FileEmitter.emitFile (node-entry.js:22302:24)
    at Object.generateBundle (dep-BK3b2jBa.js:35646:14)
```
- **Phân tích nguyên nhân kỹ thuật:** Thư mục `c:\Projects` trên máy Windows 11 thực chất là một NTFS Junction trỏ đến `C:\Users\umnuar\Documents\Projects`. Khi Rollup phân tích đường dẫn `index.html`, do sự khác biệt giữa đường dẫn logic (`C:\Projects\...`) và đường dẫn vật lý thực tế được `fs.realpath` giải quyết (`C:\Users\umnuar\Documents\Projects\...`), hàm tính toán đường dẫn tương đối sinh ra chuỗi `../../../Users/...`. Rollup từ chối các chuỗi bắt đầu bằng `..` khi emit chunk HTML.
- **Khuyến nghị Release Engineer:** Quy trình CI/CD và script đóng gói trên Windows phải luôn `Set-Location` vào đường dẫn vật lý thực tế trước khi gọi lệnh build.

#### Thử Nghiệm 2: Chạy từ đường dẫn vật lý chuẩn (`C:\Users\umnuar\Documents\Projects\QLCS\QLCS-Client`)
- **Lệnh:** `npm run build:vite`
- **Kết quả:** ✅ **BUILD THÀNH CÔNG (Exit Code: 0)**
- **Thời gian thực thi:** 22.48 giây
- **Chi tiết các artifacts được sinh ra:**
  - `tsc`: Hoàn thành kiểm tra kiểu dữ liệu với **0 lỗi TypeScript**.
  - **Renderer Assets (`dist/`):**
    - `dist/index.html` (1.34 kB │ gzip: 0.71 kB)
    - `dist/assets/index-rW5FpfUI.js` (537.98 kB │ gzip: 143.77 kB) - Core React bundle.
    - `dist/assets/xlsx.min-kjsiDkRm.js` (626.73 kB │ gzip: 322.83 kB) - Thư viện xử lý Excel.
    - `dist/assets/xlsx-CvjPjjyd.js` (428.92 kB │ gzip: 143.13 kB) - Thư viện định dạng Excel styling.
    - `dist/assets/index-CXOUdUcP.css` (106.80 kB │ gzip: 15.19 kB) - Tailwind CSS v4 bundle.
    - `dist/assets/importCutriWorker-rA25MiWc.js` (5.94 kB) - Web Worker Cử tri.
    - `dist/assets/importChucthoWorker-BWmXFQVD.js` (6.85 kB) - Web Worker Chúc thọ.
    - `dist/assets/importHtxhWorker-CLjQ3k0h.js` (7.05 kB) - Web Worker HTXH.
  - **Electron Main & Preload (`dist-electron/`):**
    - `dist-electron/main.js` (714.75 kB │ gzip: 193.19 kB)
    - `dist-electron/preload.mjs` (1.01 kB │ gzip: 0.47 kB)
- **Cảnh báo kích thước (Bundle Bloat Warning):**
  > `(!) Some chunks are larger than 500 kB after minification.`
  File `xlsx.min` (626 kB) và `index.js` (538 kB) làm tăng thời gian khởi động ban đầu. Cần áp dụng Dynamic Import (`lazy load`) cho module Excel để chỉ nạp khi người dùng mở `ImportModal` hoặc `ExportModal`.

---

### 2.2. Thử Nghiệm Build Backend (`QLCS-Backend`)
- **Lệnh:** `npm --prefix c:\Projects\QLCS\QLCS-Backend run build`
- **Kết quả:** ✅ **BUILD THÀNH CÔNG (Exit Code: 0)**
- **Thời gian thực thi:** 3.12 giây
- **Kiểm tra `dist/`:** Biên dịch hoàn tất 100% mã nguồn TypeScript sang JavaScript CommonJS (`index.js`, controllers, middlewares, routes, utils) kèm theo các file khai báo kiểu `.d.ts` và source maps `.map`. **0 lỗi kiểu dữ liệu**.

---

## 3. KIỂM TRA TÀI NGUYÊN & ĐƯỜNG DẪN ĐÓNG GÓI (ASSET & RUNTIME PATHS)

### 3.1. Đường Dẫn Preload Script trong Production
- Trong `electron/main.ts` (dòng 38):
  ```typescript
  webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
  }
  ```
- Kết quả kiểm tra artifact: `vite-plugin-electron` xuất ra file `dist-electron/preload.mjs` (do package.json có `"type": "module"`).
- Khi chạy ứng dụng, `__dirname` trong `main.js` trỏ tới `dist-electron`. Do đó `path.join(__dirname, "preload.mjs")` trỏ **hoàn toàn chính xác** vào file preload đã build.

### 3.2. Đường Dẫn Tài Nguyên Tĩnh (Relative Paths trong `dist/index.html`)
- Kiểm tra file `dist/index.html` sau khi build:
  ```html
  <link rel="icon" type="image/svg+xml" href="./vite.svg" />
  <script type="module" crossorigin src="./assets/index-rW5FpfUI.js"></script>
  <link rel="stylesheet" crossorigin href="./assets/index-CXOUdUcP.css">
  ```
- **Đánh giá:** Các đường dẫn tài nguyên đều được chuẩn hóa thành đường dẫn tương đối (`./assets/...`). Khi Electron nạp qua giao thức tệp tin `win.loadFile(path.join(RENDERER_DIST, "index.html"))` (tức `file:///.../dist/index.html`), ứng dụng sẽ nạp đúng tài nguyên mà không bị lỗi 404 (White Screen of Death) như trường hợp dùng đường dẫn tuyệt đối `/assets/...`.

### 3.3. Lỗ Hổng Tài Nguyên Icon Ứng Dụng (Application Icon Defect)
- **Thực trạng phát hiện:** Trong toàn bộ dự án `QLCS-Client`, **HOÀN TOÀN KHÔNG CÓ** bất kỳ file icon dạng `.ico` (dành cho Windows) hoặc `.png` (dành cho Linux/Mac). Thư mục `public/` chỉ có 2 file SVG: `electron-vite.svg` và `vite.svg`.
- **Hệ quả runtime:**
  1. Trong `electron/main.ts` (dòng 36):
     ```typescript
     icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
     ```
     Hệ điều hành Windows (Win32 API) **không hỗ trợ định dạng SVG** cho icon cửa sổ và thanh Taskbar! Khi truyền file SVG vào `BrowserWindow`, Electron trên Windows sẽ bỏ qua thuộc tính này. Cửa sổ ứng dụng và thanh Taskbar sẽ hiển thị icon rỗng hoặc icon mặc định của Electron.
  2. Trong `electron-builder.json5`: Không chỉ định thuộc tính `icon`. Khi tạo bộ cài NSIS, `electron-builder` sẽ dùng icon mặc định của framework Electron thay vì logo nhận diện thương hiệu của xã Đăk Hà.
- **Khắc phục cấp thiết:** Tạo file `icon.ico` (kích thước đa lớp 16x16, 32x32, 48x48, 256x256) đặt tại `build/icon.ico` và cập nhật cấu hình `electron-builder.json5`.

---

## 4. THẨM TRA CONTENT SECURITY POLICY (CSP) - LỖ HỔNG CHẶN FONT GOOGLE

Khi kiểm tra `electron/main.ts` (dòng 82-93), cấu hình CSP header dành riêng cho môi trường Production (`if (!VITE_DEV_SERVER_URL)`) được thiết lập như sau:

```typescript
win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
        responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
                "default-src 'self'; connect-src 'self' http://localhost:5000 https://qlcs.dulieudakha.vn https://worldtimeapi.org https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self';",
            ],
        },
    });
});
```

Trong khi đó, file `index.html` của client lại tải Google Fonts qua thẻ link:
```html
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:...&family=JetBrains+Mono:...&display=swap" rel="stylesheet">
```

### PHÂN TÍCH LỖ HỔNG XUNG ĐỘT CSP:
1. **Lỗi chỉ thị `style-src`:**
   - Thẻ `<link rel="stylesheet">` từ `https://fonts.googleapis.com` là một tài nguyên Stylesheet (CSS).
   - Theo đặc tả W3C CSP, tài nguyên Stylesheet chịu sự chi phối duy nhất của chỉ thị **`style-src`**.
   - Tuy nhiên, trong header CSP của `main.ts`, `style-src` chỉ có: `'self' 'unsafe-inline'`. **Hoàn toàn không có `https://fonts.googleapis.com`!**
   - Nhà phát triển đã **đặt nhầm** `https://fonts.googleapis.com` vào `connect-src` (chỉ dùng cho `fetch`/`XMLHttpRequest`/`WebSocket`).
2. **Hậu quả trên Production:**
   - Khi chạy ở Dev mode (`VITE_DEV_SERVER_URL` có giá trị), khối mã này bị bỏ qua nên font chữ tải bình thường qua meta tag của `index.html`.
   - **Nhưng khi đóng gói thành file EXE chạy thật**, header CSP trên sẽ được kích hoạt và Chromium sẽ chặn đứng yêu cầu tải CSS từ Google Fonts:
     > `Refused to load the stylesheet 'https://fonts.googleapis.com/css2?...' because it violates the following Content Security Policy directive: "style-src 'self' 'unsafe-inline'".`
   - Khi file CSS không được tải, trình duyệt sẽ không biết các font `Be Vietnam Pro` và `JetBrains Mono` nằm ở đâu, dẫn đến việc ứng dụng rơi về font chữ thô mặc định của hệ thống Windows (Times New Roman / Arial), làm vỡ căn chỉnh chiều cao bảng dữ liệu và layout số liệu!
3. **Lỗ hổng Whitelist IP trong `connect-src`:**
   - `connect-src` chỉ cho phép `http://localhost:5000` và `https://qlcs.dulieudakha.vn`.
   - Nếu triển khai mạng nội bộ cơ quan qua địa chỉ IP (ví dụ: `http://192.168.1.100:5000`), CSP sẽ lập tức chặn đứng mọi cuộc gọi API từ client đến server!

---

## 5. THẨM TRA TƯƠNG THÍCH NATIVE MODULES (ABI COMPATIBILITY)

- **Kiểm tra `QLCS-Client/package.json`:**
  - `bcryptjs`: Thuần JavaScript (Pure JS). Đây là một quyết định kiến trúc rất đúng đắn, tránh được việc dùng `bcrypt` (C++ native addon) vốn thường xuyên làm crash Electron khi sai lệch Node ABI.
  - `electron-store`: Pure JS (sử dụng thư viện `conf`).
  - `xlsx`, `xlsx-js-style`: Pure JS.
  - `idb`: Pure JS wrapper cho browser IndexedDB.
  - **Kết luận:** Tầng Client **100% thuần JavaScript**, không có native module C++ nào. Nguy cơ lỗi ABI giữa Node và Electron bằng **0%**.
- **Kiểm tra `QLCS-Backend`:**
  - `@prisma/client`: Sử dụng query engine viết bằng Rust biên dịch sẵn theo nền tảng (`query-engine-windows.exe`).
  - Cần đảm bảo khi triển khai server Linux (Ubuntu/Debian) phải chạy lệnh `npx prisma generate` trực tiếp trên máy chủ đích để tải đúng engine nhị phân của Linux.

---

## 6. MA TRẬN RỦI RO CRASH MÀN HÌNH TRẮNG (WHITE SCREEN OF DEATH RISKS)

Bảng đánh giá các nhân tố có thể khiến ứng dụng "Chạy mượt ở Dev Mode nhưng Crash Màn Hình Trắng khi Đóng Gói EXE":

| Mã | Nguy cơ tiềm ẩn | Cơ chế kích hoạt | Mức độ nghiêm trọng | Biện pháp phòng vệ hiện tại | Đề xuất khắc phục |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **WSOD-1** | **Chặn Stylesheet Google Fonts do sai CSP** | Đóng gói EXE chạy production, header CSP thiếu `fonts.googleapis.com` trong `style-src`. | 🟡 **MEDIUM** (Lỗi hiển thị) | Chưa có. Font bị chặn âm thầm, layout bị co giãn. | Bổ sung `https://fonts.googleapis.com` vào `style-src` trong `electron/main.ts`. |
| **WSOD-2** | **Crash do đọc thiếu file `package.json` trong asar** | Hàm IPC `get-app-version` cố gắng đọc `fs.readFileSync(path.join(process.env.APP_ROOT, "package.json"))`. | 🟢 **THẤP** (Đã phòng vệ) | Đã có khối `try...catch` fallback sang `app.getVersion()`. | Đưa `"package.json"` vào danh sách `"files"` của `electron-builder.json5`. |
| **WSOD-3** | **Treo âm thầm do Single Instance Lock** | Người dùng mở app khi đã có một tiến trình `qlcs.exe` chạy ngầm bị treo từ trước. | ⚠️ **HIGH** (Người dùng tưởng app hỏng) | `if (!gotTheLock) app.quit();` tự thoát ngay lập tức mà không có thông báo. | Bổ sung hộp thoại cảnh báo: `dialog.showErrorBox("Ứng dụng đang chạy", "Một cửa sổ QLCS khác đã được mở...")`. |
| **WSOD-4** | **Lỗi API do kết nối IP nội bộ bị CSP chặn** | Cán bộ xã cấu hình biến môi trường kết nối server backend theo IP mạng LAN (`192.168.x.x`). | 🚨 **CRITICAL** (Không đăng nhập được) | CSP chỉ cho phép `localhost:5000` và `qlcs.dulieudakha.vn`. | Cho phép cấu hình CSP động hoặc mở rộng `connect-src` trong mạng LAN. |
| **WSOD-5** | **Không thể debug crash tại hiện trường** | Lỗi runtime JavaScript trong renderer khi đã đóng gói (`app.isPackaged`). | ⚠️ **HIGH** (Mất dấu vết lỗi) | Phím F12 và DevTools bị vô hiệu hóa hoàn toàn trong production. | Tích hợp ghi log renderer ra file `%APPDATA%/qlcs/logs/renderer.log`. |

---

## 7. CHECKLIST PHÁT HÀNH BẢN BUILD WINDOWS (RELEASE CHECKLIST)

Trước khi đóng gói bản phát hành chính thức `v3.0.0-Setup.exe`, bộ phận Release Engineer cần hoàn tất 5 bước kiểm tra sau:

- [ ] **BƯỚC 1 - Sửa Header CSP trong `electron/main.ts`:**
  Thêm `https://fonts.googleapis.com` vào chỉ thị `style-src`:
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`
- [ ] **BƯỚC 2 - Bổ sung Icon Windows Chuẩn:**
  Tạo file `icon.ico` độ phân giải chuẩn, đặt vào `QLCS-Client/build/icon.ico` và khai báo `"icon": "build/icon.ico"` trong `electron-builder.json5`.
- [ ] **BƯỚC 3 - Cảnh báo Single Instance:**
  Hiển thị `dialog.showErrorBox` trước khi `app.quit()` nếu không lấy được single instance lock.
- [ ] **BƯỚC 4 - Build từ Thư Mục Vật Lý Thực:**
  Thực hiện build NSIS từ đường dẫn thực tế để tránh lỗi phân giải đường dẫn tương đối của Rollup trên Windows NTFS Junction.
- [ ] **BƯỚC 5 - Kiểm Thử Khởi Động Bản Cài Đặt (Smoke Test):**
  Cài đặt file `Quan Ly Chinh Sach-Windows-3.0.0-Setup.exe` trên một máy tính Windows sạch (không cài Node.js, không có quyền Administrator) để đảm bảo ứng dụng khởi động trong vòng dưới 3 giây, font hiển thị chuẩn xác và đăng nhập thành công vào Backend.
