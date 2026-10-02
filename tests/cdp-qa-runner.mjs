/**
 * Browser QA Runner using Chrome DevTools Protocol (CDP)
 * Project: QLCS v3.0.0
 * Location: tests/cdp-qa-runner.mjs (Permitted standard test location per Rule 1.1)
 */

import fs from 'node:fs';
import path from 'node:path';

const CDP_HTTP = 'http://127.0.0.1:9222';
const APP_URL = 'http://localhost:5173/';
const SCREENSHOT_DIR = path.resolve('docs/qa/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
    this.consoleMessages = [];
    this.networkRequests = [];
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve, reject } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
            else resolve(msg.result);
          } else if (msg.method) {
            this.handleEvent(msg.method, msg.params);
          }
        } catch (e) {
          console.error('[CDP WS Parse Error]', e);
        }
      };
    });
  }

  handleEvent(method, params) {
    if (method === 'Runtime.consoleAPICalled') {
      const text = params.args ? params.args.map(a => a.value || a.description || '').join(' ') : '';
      this.consoleMessages.push({
        type: params.type,
        text,
        timestamp: params.timestamp,
        stackTrace: params.stackTrace
      });
    } else if (method === 'Log.entryAdded') {
      this.consoleMessages.push({
        type: params.entry.level,
        text: params.entry.text,
        timestamp: params.entry.timestamp,
        source: params.entry.source
      });
    } else if (method === 'Network.requestWillBeSent') {
      this.networkRequests.push({
        requestId: params.requestId,
        url: params.request.url,
        method: params.request.method,
        timestamp: params.timestamp,
        status: 'pending'
      });
    } else if (method === 'Network.responseReceived') {
      const req = this.networkRequests.find(r => r.requestId === params.requestId);
      if (req) {
        req.status = params.response.status;
        req.statusText = params.response.statusText;
        req.mimeType = params.response.mimeType;
      }
    } else if (method === 'Network.loadingFailed') {
      const req = this.networkRequests.find(r => r.requestId === params.requestId);
      if (req) {
        req.status = 'failed';
        req.errorText = params.errorText;
        req.canceled = params.canceled;
      }
    }
  }

  async send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async enableDomains() {
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Console.enable');
    await this.send('Log.enable');
    await this.send('Network.enable');
    await this.send('DOM.enable');
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await this.wait(1500);
  }

  async wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async screenshot(name) {
    const filePath = path.join(SCREENSHOT_DIR, name.endsWith('.png') ? name : `${name}.png`);
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`  📸 Screenshot saved: docs/qa/screenshots/${path.basename(filePath)}`);
    return filePath;
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || res.exceptionDetails.exception?.description);
    }
    return res.result?.value;
  }

  async click(selector) {
    const found = await this.eval(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return false;
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        el.click();
        return true;
      })()
    `);
    if (!found) throw new Error(`Element not found for click: ${selector}`);
    await this.wait(400);
  }

  async fill(selector, value) {
    const found = await this.eval(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return false;
        el.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(el, ${JSON.stringify(value)});
        } else {
          el.value = ${JSON.stringify(value)};
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })()
    `);
    if (!found) throw new Error(`Element not found for fill: ${selector}`);
    await this.wait(200);
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile
    });
    await this.wait(500);
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function getOrCreateTab() {
  const res = await fetch(`${CDP_HTTP}/json/list`);
  const tabs = await res.json();
  const qlcsTab = tabs.find(t => t.url && t.url.includes('localhost:5173'));
  if (qlcsTab) {
    return qlcsTab;
  }
  const createRes = await fetch(`${CDP_HTTP}/json/new?${APP_URL}`, { method: 'PUT' });
  return await createRes.json();
}

export async function runAllFlows() {
  console.log('====================================================');
  console.log('🚀 KHỞI CHẠY BROWSER QA TEST SUITE QLCS TRÊN CHROME');
  console.log('====================================================\n');

  const tab = await getOrCreateTab();
  console.log(`Kết nối Tab: [${tab.id}] - ${tab.url}`);

  const client = new CDPClient(tab.webSocketDebuggerUrl);
  await client.connect();
  await client.enableDomains();
  await client.setViewport(1280, 800);

  const findings = [];
  let testNum = 1;

  function recordFinding(finding) {
    findings.push(finding);
    console.log(`  ⚠️ [PHÁT HIỆN] ${finding.id}: ${finding.title} (${finding.severity})`);
  }

  try {
    // ----------------------------------------------------
    // FLOW-01: Xác thực & Điều hướng Phân quyền (RBAC)
    // ----------------------------------------------------
    console.log('\n--- FLOW-01: Xác thực & Điều hướng Phân quyền (RBAC) ---');
    await client.navigate(APP_URL);
    await client.eval('localStorage.clear(); sessionStorage.clear();');
    await client.navigate(APP_URL);
    await client.screenshot('01-login-initial');

    // 1.1 Kiểm tra validation khi để trống
    console.log('1.1. Thử gửi form rỗng...');
    await client.fill('input[type="text"]', '   ');
    await client.fill('input[type="password"]', '   ');
    await client.click('button[type="submit"]');
    await client.wait(500);
    const emptyErrorMsg = await client.eval('document.querySelector(".text-rose-700, .text-rose-300, span.text-rose-500")?.innerText || document.querySelector(".text-rose-500")?.parentElement?.innerText');
    console.log('  -> Thông báo lỗi khi để trống:', emptyErrorMsg || 'Không thấy thông báo!');
    if (!emptyErrorMsg || !emptyErrorMsg.includes('đầy đủ')) {
      recordFinding({
        id: 'BUG-F01-01',
        type: 'Chức năng',
        title: 'Form đăng nhập không hiển thị thông báo lỗi khi để trống',
        severity: 'P2',
        fixLabel: 'TỰ SỬA'
      });
    }
    await client.screenshot('01-login-empty-validation');

    // 1.2 Kiểm tra đăng nhập sai mật khẩu
    console.log('1.2. Thử đăng nhập sai mật khẩu...');
    await client.fill('input[type="text"]', 'admin');
    await client.fill('input[type="password"]', 'WrongPassword123');
    await client.click('button[type="submit"]');
    await client.wait(1000);
    const wrongPassMsg = await client.eval('document.querySelector(".text-rose-700, .text-rose-300, span.text-rose-500")?.innerText || document.querySelector(".text-rose-500")?.parentElement?.innerText');
    console.log('  -> Thông báo lỗi mật khẩu:', wrongPassMsg);
    await client.screenshot('01-login-wrong-password');

    // 1.3 Đăng nhập Admin thành công
    console.log('1.3. Đăng nhập tài khoản Admin chính xác...');
    await client.fill('input[type="text"]', 'admin');
    await client.fill('input[type="password"]', 'Admin@2026');
    await client.click('button[type="submit"]');
    await client.wait(2000);
    await client.screenshot('02-admin-logged-in');

    const adminHeader = await client.eval('document.body.innerText.includes("Quản trị viên") || document.body.innerText.includes("admin")');
    console.log('  -> Admin logged in successfully:', adminHeader);

    // ----------------------------------------------------
    // FLOW-02: Khảo Sát & Lựa Chọn Thôn (VillagesPage)
    // ----------------------------------------------------
    console.log('\n--- FLOW-02: Khảo Sát & Lựa Chọn Thôn (VillagesPage) ---');
    const villageCount = await client.eval('document.querySelectorAll("[role=\'button\']").length');
    console.log(`  -> Số lượng thẻ thôn tương tác: ${villageCount}`);
    await client.screenshot('03-villages-overview');

    // Kiểm tra bàn phím focus trên thẻ thôn
    console.log('2.1. Kiểm tra phím Tab trên thẻ thôn...');
    await client.eval(`
      (() => {
        const cards = document.querySelectorAll("[role='button']");
        if (cards.length > 0) cards[0].focus();
      })()
    `);
    await client.wait(300);
    await client.screenshot('04-village-card-focus');

    // Chọn Thôn 1
    console.log('2.2. Chọn Thôn 1...');
    await client.eval(`
      (() => {
        const cards = Array.from(document.querySelectorAll("[role='button']"));
        const card = cards.find(c => c.innerText.includes("Thôn 1")) || cards[0];
        if (card) card.click();
      })()
    `);
    await client.wait(2000);
    await client.screenshot('05-analytics-village-selected');

    // ----------------------------------------------------
    // FLOW-03: Quản Lý Hồ Sơ Chúc Thọ (Dashboard)
    // ----------------------------------------------------
    console.log('\n--- FLOW-03: Quản Lý Hồ Sơ Chúc Thọ (Dashboard) ---');
    // Chuyển sang tab Chúc thọ trên sidebar
    console.log('3.0. Điều hướng sang phân hệ Hồ Sơ Chúc Thọ...');
    await client.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll("aside button"));
        const btn = buttons.find(b => b.textContent.includes("Chúc Thọ"));
        if (btn) btn.click();
      })()
    `);
    await client.wait(2000);
    await client.screenshot('06-dashboard-chuctho');

    // Kiểm tra YearSelector
    console.log('3.1. Kiểm tra bộ chọn năm YearSelector...');
    await client.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const yearBtn = buttons.find(b => b.textContent.includes("Năm 202"));
        if (yearBtn) yearBtn.click();
      })()
    `);
    await client.wait(500);
    await client.screenshot('07-year-selector-open');

    // Đóng popover
    await client.eval(`document.body.click()`);
    await client.wait(300);

    // Kiểm tra tìm kiếm họ tên
    console.log('3.2. Kiểm tra ô tìm kiếm họ tên...');
    const searchInputExists = await client.eval('Boolean(document.querySelector("input[placeholder*=\'Tìm theo họ tên\']"))');
    console.log('  -> Ô tìm kiếm tồn tại:', searchInputExists);
    if (searchInputExists) {
      await client.fill('input[placeholder*="Tìm theo họ tên"]', 'nguyen');
      await client.wait(1000);
      await client.screenshot('08-search-results');
      await client.fill('input[placeholder*="Tìm theo họ tên"]', '');
      await client.wait(1000);
    }

    // ----------------------------------------------------
    // FLOW-04: Quản Lý Trợ Cấp Hưu Trí Xã Hội (HTXH)
    // ----------------------------------------------------
    console.log('\n--- FLOW-04: Quản Lý Trợ Cấp Hưu Trí Xã Hội (HTXH) ---');
    await client.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll("aside button"));
        const btn = buttons.find(b => b.textContent.includes("Hưu Trí Xã Hội"));
        if (btn) btn.click();
      })()
    `);
    await client.wait(2000);
    await client.screenshot('09-dashboard-htxh');

    // Stress test chuyển tab nhanh để kiểm tra AbortController
    console.log('4.1. Chuyển tab liên tục kiểm tra Stale UI & AbortController...');
    for (let i = 0; i < 4; i++) {
      await client.eval(`
        (() => {
          const buttons = Array.from(document.querySelectorAll("aside button"));
          const target = ${i % 2 === 0} ? "Chúc Thọ" : "Hưu Trí Xã Hội";
          const btn = buttons.find(b => b.textContent.includes(target));
          if (btn) btn.click();
        })()
      `);
      await client.wait(200);
    }
    await client.wait(1500);
    await client.screenshot('10-after-tab-stress');

    // ----------------------------------------------------
    // FLOW-05: Thao Tác Modal Hồ Sơ (Thêm & Sửa)
    // ----------------------------------------------------
    console.log('\n--- FLOW-05: Thao Tác Modal Hồ Sơ (Thêm & Sửa) ---');
    // Chuyển về Chúc thọ
    await client.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll("aside button"));
        const btn = buttons.find(b => b.textContent.includes("Chúc Thọ"));
        if (btn) btn.click();
      })()
    `);
    await client.wait(1000);

    const addBtnFound = await client.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const btn = buttons.find(b => b.textContent.includes("Thêm Hồ Sơ"));
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `);
    console.log('  -> Mở Modal Thêm Hồ Sơ:', addBtnFound);
    await client.wait(1000);
    await client.screenshot('11-modal-add-profile');

    // Kiểm tra Focus Trap
    const activeInputName = await client.eval('document.activeElement?.getAttribute("placeholder") || document.activeElement?.getAttribute("name")');
    console.log('  -> Active element khi modal mở:', activeInputName);

    // Đóng modal bằng Escape
    console.log('5.1. Thử đóng modal bằng phím Escape...');
    await client.eval(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
    `);
    await client.wait(500);
    await client.screenshot('12-modal-closed-escape');

    // ----------------------------------------------------
    // FLOW-06: Vòng Đời Xóa Hồ Sơ & Thùng Rác
    // ----------------------------------------------------
    console.log('\n--- FLOW-06: Vòng Đời Xóa Hồ Sơ & Thùng Rác ---');
    await client.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll("aside button"));
        const btn = buttons.find(b => b.textContent.includes("Thùng Rác"));
        if (btn) btn.click();
      })()
    `);
    await client.wait(2000);
    await client.screenshot('13-recycle-bin-view');

    // ----------------------------------------------------
    // FLOW-07: Nhật Ký Hoạt Động, Cài Đặt & Responsive
    // ----------------------------------------------------
    console.log('\n--- FLOW-07: Nhật Ký Hoạt Động & Cài Đặt ---');
    // Tab Nhật Ký
    await client.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll("aside button"));
        const btn = buttons.find(b => b.textContent.includes("Nhật Ký"));
        if (btn) btn.click();
      })()
    `);
    await client.wait(2000);
    await client.screenshot('14-audit-log-view');

    // Tab Cài Đặt
    await client.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll("aside button"));
        const btn = buttons.find(b => b.textContent.includes("Cài Đặt"));
        if (btn) btn.click();
      })()
    `);
    await client.wait(2000);
    await client.screenshot('15-settings-view');

    // 7.1 Kiểm tra Theme Toggle (Light / Dark)
    console.log('7.1. Kiểm tra chuyển đổi giao diện Sáng / Tối...');
    await client.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const themeBtn = btns.find(b => b.getAttribute("title")?.includes("sáng") || b.getAttribute("title")?.includes("tối") || b.querySelector("svg.lucide-sun, svg.lucide-moon"));
        if (themeBtn) themeBtn.click();
      })()
    `);
    await client.wait(1000);
    await client.screenshot('16-settings-light-theme');

    // Đổi lại Dark mode
    await client.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const themeBtn = btns.find(b => b.getAttribute("title")?.includes("sáng") || b.getAttribute("title")?.includes("tối") || b.querySelector("svg.lucide-sun, svg.lucide-moon"));
        if (themeBtn) themeBtn.click();
      })()
    `);
    await client.wait(500);

    // 7.2 Kiểm tra Responsive Viewports
    console.log('7.2. Kiểm tra Responsive (1280px, 768px, 360px)...');
    // Tablet 768px
    await client.setViewport(768, 1024);
    await client.wait(800);
    await client.screenshot('17-responsive-768px-tablet');

    // Mobile 360px
    await client.setViewport(360, 640, true);
    await client.wait(800);
    await client.screenshot('18-responsive-360px-mobile');

    // Khôi phục Desktop
    await client.setViewport(1280, 800);
    await client.wait(500);

    // ----------------------------------------------------
    // Thu thập Console Errors & Network Failures
    // ----------------------------------------------------
    console.log('\n--- TỔNG HỢP LOG CONSOLE & NETWORK ---');
    const errors = client.consoleMessages.filter(m => m.type === 'error' || m.text.toLowerCase().includes('error'));
    const warnings = client.consoleMessages.filter(m => m.type === 'warning' || m.type === 'warn');
    const failedReqs = client.networkRequests.filter(r => r.status === 'failed' || (typeof r.status === 'number' && r.status >= 400));

    console.log(`  -> Số lượng Console Errors: ${errors.length}`);
    console.log(`  -> Số lượng Console Warnings: ${warnings.length}`);
    console.log(`  -> Số lượng HTTP Failures (>=400): ${failedReqs.length}`);

    errors.forEach((e, idx) => {
      console.log(`     [ERR #${idx + 1}] ${e.text.slice(0, 150)}`);
      recordFinding({
        id: `LOG-ERR-0${idx + 1}`,
        type: 'Console',
        title: `Console Error: ${e.text.slice(0, 80)}`,
        evidence: e.text,
        severity: 'P1',
        fixLabel: 'TỰ SỬA'
      });
    });

    warnings.forEach((w, idx) => {
      if (idx < 5) console.log(`     [WARN #${idx + 1}] ${w.text.slice(0, 150)}`);
    });

    failedReqs.forEach((r, idx) => {
      console.log(`     [HTTP FAIL #${idx + 1}] ${r.method} ${r.url} -> Status: ${r.status}`);
      recordFinding({
        id: `NET-FAIL-0${idx + 1}`,
        type: 'Console',
        title: `HTTP Request Failure: ${r.method} ${r.url}`,
        evidence: `Status ${r.status} ${r.errorText || ''}`,
        severity: 'P2',
        fixLabel: 'TỰ SỬA'
      });
    });

    console.log('\n====================================================');
    console.log('✅ HOÀN THÀNH 7 LUỒNG BROWSER QA TEST TRÊN CHROME');
    console.log(`Tổng cộng ghi nhận: ${findings.length} phát hiện.`);
    console.log('====================================================');

    return { findings, consoleMessages: client.consoleMessages, networkRequests: client.networkRequests };
  } finally {
    await client.close();
  }
}

runAllFlows().catch(console.error);
