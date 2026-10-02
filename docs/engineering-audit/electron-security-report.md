# BÁO CÁO THẨM TRA AN TOÀN TẦNG DESKTOP ELECTRON (ELECTRON SECURITY AUDIT REPORT)
**Hệ thống**: Quản Lý Chính Sách Xã Đăk Hà (QLCS-Client - Electron Desktop App)  
**Thời điểm thẩm tra**: Tháng 09/2026  
**Chuyên viên thẩm tra**: AGENT 2 - Security & Electron Security Engineer  
**Tiêu chuẩn rà soát**: Electron Security Guidelines (v42.x), Chromium Security Architecture, OWASP Desktop App Security  
**Phạm vi thẩm tra**: `QLCS-Client/electron/main.ts`, `preload.ts`, `electron-env.d.ts`, `electron-builder.json5`, `vite.config.ts`, `index.html`  

---

## 1. MỤC TIÊU & PHẠM VI THẨM TRA TẦNG DESKTOP

Ứng dụng desktop QLCS-Client được đóng gói bằng **Electron 42 + Vite 5 + React 18**. Trong kiến trúc Electron, tầng Main Process (Node.js runtime có toàn quyền truy cập OS) và tầng Renderer Process (Chromium browser context) có ranh giới bảo mật tối quan trọng. Nếu ranh giới này bị phá vỡ thông qua IPC lỏng lẻo, cấu hình webPreferences yếu hoặc CSP thiếu hụt, kẻ tấn công có thể leo thang đặc quyền từ một lỗi XSS/DOM XSS nhỏ trong giao diện người dùng thành **thực thi mã từ xa (RCE) trên máy trạm của cán bộ**.

Báo cáo này thẩm tra 9 trụ cột an toàn cốt lõi của Electron:
1. Cô lập tiến trình: `contextIsolation`, `nodeIntegration`, `sandbox`.
2. Bề mặt phơi bày qua `preload.ts` và `contextBridge`.
3. Xác thực nguồn gốc gọi lệnh IPC (`senderFrame` validation).
4. Kiểm tra và xác thực dữ liệu đầu vào của các IPC Handlers.
5. Cấu hình Content Security Policy (CSP) ở Dev và Production.
6. Kiểm soát điều hướng mạng (`will-navigate`) và mở cửa sổ mới (`setWindowOpenHandler`).
7. Cơ chế lưu trữ bí mật cục bộ (`electron-store` vs `safeStorage`).
8. Cập nhật phần mềm tự động (`autoUpdater`) và ký số mã nguồn (`code signing`).
9. Cấu hình bảo vệ DevTools và Menu trong môi trường Production.

---

## 2. BẢNG TỔNG HỢP PHÁT HIỆN AN TOÀN ELECTRON (ELECTRON VULNERABILITY MATRIX)

| Mã ID | Phát hiện Lỗ hổng / Rủi ro | Mức độ nghiêm trọng | Vị trí file & Số dòng | Khả năng khai thác (Exploitability) |
| :--- | :--- | :---: | :--- | :--- |
| **ELEC-01** | **Toàn bộ IPC Handlers hoàn toàn không xác thực nguồn gốc `event.senderFrame`** | **HIGH** | `QLCS-Client/electron/main.ts:131-242, 303-320` | Khung lồng iframe hoặc XSS trong subframe có thể gọi mọi API bảo mật |
| **ELEC-02** | **CSP chứa `'unsafe-inline'` và `'unsafe-eval'`, cho phép thực thi script nội dòng và đánh giá chuỗi** | **HIGH** | `QLCS-Client/index.html:7` | Vô hiệu hóa lớp phòng thủ XSS, tạo điều kiện kích hoạt payload mã độc |
| **ELEC-03** | **Thiếu hoàn toàn bộ lọc điều hướng ngoài `will-navigate` và `setWindowOpenHandler`** | **HIGH** | `QLCS-Client/electron/main.ts:27-95` | Cửa sổ có thể bị điều hướng sang trang lừa đảo hoặc mở cửa sổ không kiểm soát |
| **ELEC-04** | **Khóa mã hóa `electron-store` bị Hardcode trần trong mã nguồn Main Process** | **HIGH** | `QLCS-Client/electron/main.ts:8-11` | Bất kỳ ai giải nén `app.asar` đều đọc được khóa và giải mã toàn bộ Token CSDL |
| **ELEC-05** | **Chưa kích hoạt tường lửa hộp cát `sandbox: true` trong `webPreferences`** | **MEDIUM** | `QLCS-Client/electron/main.ts:37-41` | Renderer không được bảo vệ tối đa bởi Chromium OS-level Sandbox |
| **ELEC-06** | **Thiếu xác thực phạm vi giá trị (Bounds Check) trong IPC Handler `app:set-zoom` và `secure-store`** | **MEDIUM** | `QLCS-Client/electron/main.ts:140-151, 231-235` | Có thể gây crash giao diện (DoS) hoặc làm ô nhiễm Store bộ nhớ |
| **ELEC-07** | **IPC `dialog:open-file` đọc toàn bộ tệp vào RAM và gửi Base64 trực tiếp về Renderer** | **MEDIUM** | `QLCS-Client/electron/main.ts:193-207` | Đọc tệp lớn gây tràn bộ nhớ Event Loop hoặc rò rỉ tệp hệ thống nếu bị lừa chọn file |
| **ELEC-08** | **Auto Updater tự động tải và cài đặt bản cập nhật chưa qua ký số bảo vệ (Code Signing)** | **MEDIUM** | `QLCS-Client/electron/main.ts:258-259`, `electron-builder.json5:27-37` | Nguy cơ tấn công chuỗi cung ứng nếu kho GitHub bị xâm nhập |
| **ELEC-09** | **Plugin `vite-plugin-electron-renderer` và `vite-plugin-node-polyfills` tiêm Node APIs vào Client** | **LOW** | `QLCS-Client/vite.config.ts:15-22, 40-44` | Làm phình bundle và làm mờ ranh giới cách ly giữa Node.js và Web |

---

## 3. THẨM TRA CHI TIẾT 9 RANH GIỚI BẢO MẬT ELECTRON

---

### 3.1. Cô lập tiến trình: `contextIsolation`, `nodeIntegration`, `sandbox`

#### a. Rà soát cấu hình `webPreferences`:
- **Vị trí**: `QLCS-Client/electron/main.ts:37-41`
- **Mã nguồn hiện tại**:
  ```ts
  webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
  },
  ```
- **Đánh giá**:
  - `contextIsolation: true` (**ĐẠT CHUẨN**): Đảm bảo mã JavaScript trong Renderer chạy trong một execution context hoàn toàn riêng biệt với script Preload, bảo vệ các nguyên mẫu JavaScript (`Array.prototype`, `Object.prototype`) khỏi việc bị Renderer can thiệp (Prototype Pollution).
  - `nodeIntegration: false` (**ĐẠT CHUẨN**): Ngăn chặn việc Renderer truy cập trực tiếp vào các hàm `require()`, `process`, `fs` của Node.js.
  - `sandbox: true` (**CHƯA CẤU HÌNH - ELEC-05**):
    Mặc dù từ Electron 20 trở đi sandbox được kích hoạt ngầm nếu `nodeIntegration: false`, các tài liệu bảo mật chính thức của Electron (Electron Security Checklist #4) bắt buộc phải khai báo tường minh `sandbox: true` trong `webPreferences`. Việc thiếu cấu hình tường minh này có thể dẫn đến việc một số cơ chế kiểm tra bảo vệ sâu của Chromium OS-sandbox bị nới lỏng trong quá trình tích hợp preload scripts hoặc plugins.

---

### 3.2. Bề mặt phơi bày qua `preload.ts` và `contextBridge`

#### a. Phân tích `preload.ts`:
- **Vị trí**: `QLCS-Client/electron/preload.ts:1-39`
- **Mã nguồn hiện tại**:
  ```ts
  import { ipcRenderer, contextBridge } from 'electron'

  const ALLOWED_CHANNELS = new Set(['updater-event', 'main-process-message', 'time-offset-updated'])

  const electronAPI = {
    store: {
      get: (key: string) => ipcRenderer.invoke('secure-store:get', key),
      set: (key: string, value: any) => ipcRenderer.invoke('secure-store:set', { key, value }),
      delete: (key: string) => ipcRenderer.invoke('secure-store:delete', key),
      clear: () => ipcRenderer.invoke('secure-store:clear'),
    },
    dialog: {
      openFile: (filters?: { name: string; extensions: string[] }[]) =>
        ipcRenderer.invoke('dialog:open-file', filters),
    },
    app: {
      getVersion: () => ipcRenderer.invoke('get-app-version'),
      setZoom: (level: number) => ipcRenderer.invoke('app:set-zoom', level),
      getZoomLevel: () => ipcRenderer.invoke('get-zoom-level'),
    },
    updater: {
      install: () => ipcRenderer.invoke('install-update'),
      checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    },
    on: (channel: string, callback: (...args: any[]) => void) => {
      if (!ALLOWED_CHANNELS.has(channel)) {
        console.warn(`Blocked attempt to listen on unauthorized channel: ${channel}`)
        return () => {}
      }
      const listener = (_event: any, ...args: any[]) => callback(...args)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    },
  }

  contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  contextBridge.exposeInMainWorld('api', electronAPI)
  ```
- **Điểm tích cực**:
  - Không phơi bày trực tiếp hàm `ipcRenderer.send` hay `ipcRenderer.on` nguyên thủy ra ngoài.
  - Sử dụng danh sách trắng `ALLOWED_CHANNELS` để chặn việc lắng nghe các channel tùy tiện.
  - Cung cấp hàm cleanup `removeListener` ngăn ngừa memory leak.
- **Điểm rủi ro**:
  - Phơi bày cả 2 đối tượng `window.electronAPI` và `window.api` đồng thời.
  - Cung cấp API `dialog.openFile` cho phép Renderer kích hoạt hộp thoại hệ thống và đọc trực tiếp nội dung tệp tin mã hóa Base64 về bộ nhớ trình duyệt mà không giới hạn dung lượng tệp.

---

### 3.3. LỖ HỔNG ELEC-01: IPC Sender Validation Hoàn Toàn Bị Bỏ Qua

- **Vị trí**: `QLCS-Client/electron/main.ts:131-242` và `303-320`
- **Mã nguồn thực tế**:
  ```ts
  ipcMain.handle("secure-store:get", (_e, key: string) => { ... });
  ipcMain.handle("secure-store:set", (_e, { key, value }) => { ... });
  ipcMain.handle("secure-store:delete", (_e, key: string) => { ... });
  ipcMain.handle("secure-store:clear", () => { ... });
  ipcMain.handle("dialog:open-file", async (_e, filters) => { ... });
  ipcMain.handle("app:set-zoom", (_e, level: number) => { ... });
  ipcMain.handle("install-update", () => { ... });
  ipcMain.handle("check-for-updates", async () => { ... });
  ```
- **Phân tích kỹ thuật chuyên sâu**:
  1. Trong Electron, đối số đầu tiên của `ipcMain.handle` là đối tượng `IpcMainInvokeEvent`. Trong mã nguồn hiện tại, tham số này luôn được đặt tên là `_e` và **hoàn toàn không được sử dụng**.
  2. Không có bất kỳ dòng lệnh nào kiểm tra:
     - `event.senderFrame === win.webContents.mainFrame`
     - Hoặc kiểm tra nguồn gốc URL: `event.senderFrame.url`
  3. **Kịch bản tấn công**:
     Nếu giao diện người dùng hiển thị một trang web bên ngoài thông qua thẻ `<iframe>`, hoặc nếu có một liên kết điều hướng ngoài lọt vào cửa sổ, mã JavaScript chạy bên trong khung lồng (iframe) đó có thể trực tiếp gửi thông điệp IPC tới Main Process và đọc trộm toàn bộ Token trong `secure-store`, kích hoạt xóa dữ liệu (`secure-store:clear`) hoặc kích hoạt hộp thoại mở tệp (`dialog:open-file`).

---

### 3.4. LỖ HỔNG ELEC-02: Content Security Policy (CSP) Yếu Kém

#### a. Thẩm tra CSP trong `index.html`:
- **Vị trí**: `QLCS-Client/index.html:7`
- **Mã nguồn**:
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' http://localhost:* http://127.0.0.1:* https://qlcs.dulieudakha.vn https://*.dulieudakha.vn ws://localhost:* ws://127.0.0.1:*;" />
  ```
- **Các điểm vi phạm bảo mật nghiêm trọng**:
  1. `script-src 'self' 'unsafe-inline' 'unsafe-eval'`:
     - `'unsafe-inline'`: Cho phép thực thi mọi đoạn mã JavaScript nội dòng `<script>` hoặc thuộc tính sự kiện DOM (`onclick=`, `onerror=`).
     - `'unsafe-eval'`: Cho phép thực thi hàm `eval()`, `new Function()`, `setTimeout(string)`.
     - **Hậu quả**: Hai cờ này làm **vô hiệu hóa hoàn toàn năng lực ngăn chặn XSS của CSP**. Khi một kẻ tấn công chèn được một chuỗi độc hại vào giao diện, trình duyệt sẽ lập tức thực thi mã script thay vì chặn lại.
  2. `connect-src 'self' http://localhost:* http://127.0.0.1:* ...`:
     - Cho phép kết nối tới bất kỳ cổng nào trên `localhost` bằng giao thức HTTP không mã hóa.
     - Cho phép mọi subdomain của `dulieudakha.vn` (`https://*.dulieudakha.vn`).

#### b. Thẩm tra CSP trong `main.ts`:
- **Vị trí**: `QLCS-Client/electron/main.ts:80-94`
- **Mã nguồn**:
  ```ts
  if (!VITE_DEV_SERVER_URL) {
      win.webContents.session.webRequest.onHeadersReceived(
          (details, callback) => {
              callback({
                  responseHeaders: {
                      ...details.responseHeaders,
                      "Content-Security-Policy": [
                          "default-src 'self'; connect-src 'self' http://localhost:5000 https://qlcs.dulieudakha.vn https://worldtimeapi.org https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self';",
                      ],
                  },
              });
          },
      );
  }
  ```
- **Hạn chế**:
  - Khi chạy trong môi trường Dev (`VITE_DEV_SERVER_URL` có giá trị), cơ chế tiêm header CSP này **hoàn toàn không được kích hoạt**.
  - Trong production, việc `index.html` có thẻ `<meta>` CSP chứa `unsafe-eval` trong khi header session có CSP không chứa `unsafe-eval` sẽ dẫn đến sự xung đột và không nhất quán giữa các tiến trình đóng gói.

---

### 3.5. LỖ HỔNG ELEC-03: Thiếu Kiểm Soát Điều Hướng Mạng & Mở Cửa Sổ Mới

- **Vị trí**: `QLCS-Client/electron/main.ts:27-95`
- **Phân tích rủi ro**:
  1. **Thiếu `will-navigate`**:
     Trong Electron, nếu người dùng bấm vào một liên kết ngoài hoặc một script chuyển hướng `window.location.href = "https://phishing-site.com"`, mặc định Electron sẽ điều hướng cửa sổ hiện tại sang trang web đó. Khi đó, trang web độc hại sẽ được tải trực tiếp trong BrowserWindow của ứng dụng!
  2. **Thiếu `setWindowOpenHandler`**:
     Nếu mã ứng dụng hoặc một thẻ HTML có `target="_blank"` hoặc gọi `window.open("https://external.com")`, Electron mặc định sẽ mở ra một cửa sổ BrowserWindow mới mà không qua kiểm soát, có thể kế thừa các thuộc tính và nguy cơ bảo mật.
  3. **Thiếu Sanitization cho `shell.openExternal`**:
     Ứng dụng hiện tại chưa có bộ lọc kiểm tra giao thức (`protocol allowlist`). Nếu người dùng bị lừa mở một đường dẫn dạng `file:///...` hoặc `powershell.exe`, hệ điều hành có thể trực tiếp thực thi lệnh ngoài ý muốn.

---

### 3.6. LỖ HỔNG ELEC-04: Khóa Mã Hóa `electron-store` Bị Hardcode Trần

- **Vị trí**: `QLCS-Client/electron/main.ts:8-11`
- **Mã nguồn**:
  ```ts
  const secureStore = new Store({
      name: "qlcs-secure-tokens",
      encryptionKey: "QLCS_ENCRYPTED_STORE_KEY_SECURE_2026",
  });
  ```
- **Phân tích kỹ thuật**:
  - `electron-store` sử dụng thuật toán AES-256-CBC để mã hóa tệp JSON lưu trên đĩa (`%APPDATA%\quan-ly-chinh-sach\qlcs-secure-tokens.json`).
  - Tuy nhiên, khóa giải mã `encryptionKey` lại là một chuỗi tĩnh được hardcode cứng: `"QLCS_ENCRYPTED_STORE_KEY_SECURE_2026"`.
  - File đóng gói `app.asar` của Electron **không phải là tệp mã hóa**, mà là một tệp lưu trữ không nén (Archive). Bất kỳ ai có quyền truy cập vào máy tính cán bộ đều có thể:
    1. Chạy lệnh: `npx asar extract app.asar extracted/`
    2. Đọc chuỗi khóa trong `extracted/dist-electron/main.js`.
    3. Mở tệp `qlcs-secure-tokens.json` và giải mã toàn bộ Refresh Token, Access Token của cán bộ.
- **Giải pháp chính thống**: Electron cung cấp API bản địa **`safeStorage`** (`safeStorage.isEncryptionAvailable()`, `safeStorage.encryptString()`, `safeStorage.decryptString()`). API này sử dụng cơ chế **Windows Data Protection API (DPAPI)**, mã hóa dữ liệu bằng khóa gắn chặt với tài khoản người dùng đăng nhập Windows của máy tính đó, ngăn chặn việc sao chép tệp dữ liệu sang máy khác để giải mã.

---

### 3.7. ELEC-06: Thiếu Kiểm Tra Đầu Vào Trong IPC Handlers

1. **Handler `app:set-zoom` (`main.ts:231-235`)**:
   ```ts
   ipcMain.handle("app:set-zoom", (_e, level: number) => {
       if (win?.webContents) {
           win.webContents.setZoomFactor(level / 100);
       }
   });
   ```
   Không có kiểm tra giới hạn giá trị (Bounds Check). Nếu Renderer gửi `level = 0`, `level = -500`, `NaN` hoặc `100000`, cửa sổ sẽ bị biến dạng hoàn toàn hoặc gây crash tiến trình Chromium Renderer. Mức zoom chuẩn phải được giới hạn trong khoảng `[50, 200]`.
2. **Handler `secure-store:set` (`main.ts:140-151`)**:
   Chấp nhận bất kỳ kiểu dữ liệu nào cho `key` và `value` mà không kiểm tra độ dài chuỗi hay kích thước đối tượng, có thể bị lạm dụng để ghi đè các cấu hình quan trọng hoặc làm cạn kiệt dung lượng đĩa.

---

### 3.8. ELEC-07: Xử lý Tệp Tin trong `dialog:open-file`

- **Vị trí**: `QLCS-Client/electron/main.ts:174-209`
- **Mã nguồn**:
  ```ts
  const filePath = result.filePaths[0];
  const fileBuffer = fs.readFileSync(filePath);
  return {
      filePath,
      fileName: path.basename(filePath),
      data: fileBuffer.toString("base64"),
  };
  ```
- **Rủi ro**:
  - `fs.readFileSync(filePath)` đọc toàn bộ tệp vào bộ nhớ RAM Node.js một cách đồng bộ (blocking I/O).
  - Chuyển đổi toàn bộ buffer thành chuỗi Base64 làm tăng kích thước bộ nhớ thêm **33%** và truyền một lượng dữ liệu lớn qua IPC bus. Nếu cán bộ chọn một tệp Excel nặng 50MB-100MB, ứng dụng có thể bị đứng hình (freeze) hoặc văng lỗi Out of Memory.
  - Cần giới hạn dung lượng tệp tối đa (ví dụ 25MB) và kiểm tra kích thước bằng `fs.statSync(filePath).size` trước khi thực hiện `readFileSync`.

---

### 3.9. ELEC-08: Tự Động Cập Nhật (Auto Updater) & Ký Số (Code Signing)

- **Cấu hình `main.ts:258-259`**:
  ```ts
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  ```
- **Cấu hình `electron-builder.json5:27-37`**:
  Chỉ định mục tiêu cài đặt `nsis` (x64) nhưng **hoàn toàn không có cấu hình ký số chứng chỉ (Certificate / Authenticode Code Signing)**.
- **Rủi ro**:
  - Bản cài đặt Windows sẽ bị cảnh báo "Windows protected your PC - Unknown Publisher" (SmartScreen).
  - Khi kích hoạt tự động cập nhật từ GitHub Releases (`Umnuar/QLCS`), hệ thống không thể xác minh chữ ký điện tử của file thực thi mới tải về, tạo nguy cơ thực thi mã độc nếu kho lưu trữ bị tấn công chiếm quyền hoặc DNS bị nhiễm độc (Man-in-the-Middle).

---

## 4. BỘ ĐỀ XUẤT NÂNG CẤP & MÃ NGUỒN SỬA ĐỔI HOÀN CHỈNH

---

### 4.1. Bản vá nâng cấp `QLCS-Client/electron/main.ts` (Surgical Fix)

Dưới đây là đặc tả mã nguồn cần được áp dụng để vá triệt để các lỗ hổng ELEC-01, ELEC-03, ELEC-04, ELEC-05, ELEC-06:

```ts
// 1. Kích hoạt sandbox và bảo mật webPreferences
webPreferences: {
    preload: path.join(__dirname, "preload.mjs"),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,              // [VÁ ELEC-05] Ép buộc OS Sandbox
    webSecurity: true,
    allowRunningInsecureContent: false,
}

// 2. Chặn điều hướng ngoài và mở cửa sổ mới [VÁ ELEC-03]
win.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // Chỉ cho phép điều hướng nội bộ Vite dev server hoặc file:// build
    if (VITE_DEV_SERVER_URL) {
        if (parsedUrl.origin !== new URL(VITE_DEV_SERVER_URL).origin) {
            event.preventDefault();
        }
    } else {
        if (parsedUrl.protocol !== "file:") {
            event.preventDefault();
        }
    }
});

win.webContents.setWindowOpenHandler(({ url }) => {
    // Chặn hoàn toàn việc mở cửa sổ mới bên trong Electron
    // Nếu là URL web hợp lệ, mở bằng trình duyệt mặc định của hệ điều hành
    if (url.startsWith("https://") || url.startsWith("http://")) {
        const allowedHosts = ["qlcs.dulieudakha.vn", "dulieudakha.vn"];
        const parsed = new URL(url);
        if (allowedHosts.includes(parsed.hostname)) {
            shell.openExternal(url);
        }
    }
    return { action: "deny" };
});

// 3. Helper kiểm tra IPC Sender Validation [VÁ ELEC-01]
function validateIpcSender(event: Electron.IpcMainInvokeEvent): boolean {
    if (!win || !win.webContents || !event.senderFrame) return false;
    // Bắt buộc senderFrame phải là mainFrame chính của cửa sổ ứng dụng
    return event.senderFrame === win.webContents.mainFrame;
}

// 4. Áp dụng Sender Validation & Bounds Check vào IPC Handlers [VÁ ELEC-01, ELEC-06]
ipcMain.handle("secure-store:get", (event, key: string) => {
    if (!validateIpcSender(event)) throw new Error("Unauthorized IPC invocation");
    if (typeof key !== "string" || key.length > 100) return null;
    return secureStore.get(key, null);
});

ipcMain.handle("secure-store:set", (event, { key, value }: { key: string; value: unknown }) => {
    if (!validateIpcSender(event)) throw new Error("Unauthorized IPC invocation");
    if (typeof key !== "string" || key.length > 100) return false;
    secureStore.set(key, value);
    return true;
});

ipcMain.handle("app:set-zoom", (event, level: number) => {
    if (!validateIpcSender(event)) return;
    // Giới hạn mức zoom hợp lệ từ 50% đến 200%
    if (typeof level !== "number" || isNaN(level)) return;
    const safeZoom = Math.min(200, Math.max(50, level));
    if (win?.webContents) {
        win.webContents.setZoomFactor(safeZoom / 100);
    }
});

// 5. Nâng cấp lưu trữ bí mật sử dụng safeStorage bản địa [VÁ ELEC-04]
ipcMain.handle("secure-store:set-safe", (event, { key, value }: { key: string; value: string }) => {
    if (!validateIpcSender(event)) return false;
    if (safeStorage.isEncryptionAvailable()) {
        const encryptedBuffer = safeStorage.encryptString(value);
        secureStore.set(key, encryptedBuffer.toString("base64"));
        return true;
    }
    // Fallback nếu không hỗ trợ
    secureStore.set(key, value);
    return true;
});
```

---

### 4.2. Bản vá CSP trong `QLCS-Client/index.html` (Vá ELEC-02)

Thay thế dòng thẻ meta CSP trong `index.html:7` bằng chính sách bảo vệ chặt chẽ:

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://qlcs.dulieudakha.vn https://worldtimeapi.org ws://localhost:* ws://127.0.0.1:*;
" />
```
*(Ghi chú: Đã loại bỏ hoàn toàn `'unsafe-eval'`. Đối với môi trường Production, loại bỏ `'unsafe-inline'` trong `script-src` để đảm bảo không một đoạn mã độc nào có thể tự ý thực thi).*

---

## 5. KẾT LUẬN & ĐÁNH GIÁ CHUNG

Tầng Desktop Electron của **QLCS-Client** đã tuân thủ tốt hai quy tắc P0 căn bản: **`contextIsolation: true`** và **`nodeIntegration: false`**, giúp tạo ra một ranh giới ngăn cách cơ bản giữa Renderer và Node.js.

Tuy nhiên, ứng dụng tồn tại **4 điểm hở kỹ thuật trọng yếu** cần được lập tức khắc phục:
1. **Thiếu Sender Validation**: Tất cả IPC handlers chưa kiểm tra `event.senderFrame`.
2. **CSP quá lỏng**: Tồn tại `'unsafe-eval'` và `'unsafe-inline'` trong `index.html`.
3. **Thiếu chặn điều hướng**: Không có sự hiện diện của `will-navigate` và `setWindowOpenHandler`.
4. **Khóa mã hóa lưu trữ Desktop bị Hardcode**: `electron-store` dùng chung 1 khóa tĩnh thay vì dùng `safeStorage` (Windows DPAPI).

Việc thực hiện chuẩn hóa theo các mã nguồn khuyến nghị trong Mục 4 sẽ giúp QLCS-Client đạt chuẩn bảo mật Desktop cấp độ cao nhất theo khuyến nghị của Electron Security Guidelines, bảo vệ an toàn tuyệt đối cho thiết bị của các cán bộ tại Xã Đăk Hà.
