(function () {
  const store = window.SA.Store;
  const config = window.SA.Config;
  const supabase = window.SA.Supabase;
  const { showToast, closeModal, openModal } = window.SA.UI;
  const { renderStudentView } = window.SA.Views.Student;
  const { renderOrganizerView } = window.SA.Views.Organizer;
  const { renderAdminView, initAdminCharts } = window.SA.Views.Admin;
  const { renderVerifyView } = window.SA.Views.Verify;

  window.appStore = store;

  let publicVerifyMode = false;
  let initialVerifyCode = '';
  let authTab = 'login'; // 'login' | 'register'
  let authFeedback = null;
  let prefillLoginUser = '';
  let regUniSearch = '';
  let regSelectedUniId = 'LHU';
  let regSelectedProvince = '75';

  // Kiểm tra URL query ?verify=CERT-...
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('verify')) {
    publicVerifyMode = true;
    initialVerifyCode = urlParams.get('verify');
    window.verifySearchQuery = initialVerifyCode;
  }

  function renderHeader(state) {
    const user = state.currentUser || {};
    const roleNames = {
      student: 'Sinh viên',
      organizer: 'Ban Tổ Chức',
      admin: 'Quản trị viên'
    };

    return `
      <header class="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <i data-lucide="qr-code" class="w-5 h-5"></i>
            </div>
            <div>
              <h1 class="text-sm sm:text-base font-extrabold text-brand-900 tracking-tight leading-none">AI SMARTATTEND ĐỒNG NAI</h1>
              <p class="text-[11px] text-slate-500 hidden sm:block mt-0.5">Điểm danh và cấp chứng nhận điện tử bằng AI</p>
            </div>
          </div>

          ${state.isLoggedIn && !publicVerifyMode ? `
            <div class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <p class="text-xs font-bold text-slate-900">${user.displayName || 'Người dùng'}</p>
                <p class="text-[11px] text-brand-600 font-semibold">${roleNames[user.role] || user.role || 'Thành viên'}</p>
              </div>
              <button onclick="window.app.logout()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
                <i data-lucide="log-out" class="w-3.5 h-3.5"></i> <span class="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          ` : ''}
        </div>
      </header>
    `;
  }

  function renderLoginScreen(state) {
    return `
      <main class="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-brand-50 via-white to-slate-100">
        <div class="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <!-- Giới thiệu nền tảng -->
          <div class="lg:col-span-6 space-y-5">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> HỆ THỐNG VẬN HÀNH CHÍNH THỨC
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Điểm danh và cấp <span class="text-brand-600">chứng nhận điện tử bằng AI</span>
            </h2>
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
              <strong>Liên thông 11 trường Đại học và Cao đẳng trên toàn tỉnh Đồng Nai.</strong> Nền tảng số hóa quản lý hoạt động Đoàn – Hội: Điểm danh và cấp chứng nhận điện tử bằng AI, ngăn chặn gian lận bằng Dynamic QR xoay chu kỳ 20s, cảm biến định vị GPS thực tế và AI Fraud Guard phân tích bất thường. Tự động xét duyệt và cấp chứng nhận điện tử chính quy có mã tra cứu công khai.
            </p>

            <div class="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <p class="font-bold text-brand-700 text-lg">11 Trường ĐH/CĐ</p>
                <p class="text-slate-500">Dữ liệu liên thông tỉnh Đồng Nai</p>
              </div>
              <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <p class="font-bold text-emerald-600 text-lg">AI Fraud Guard</p>
                <p class="text-slate-500">Phát hiện trùng thiết bị &amp; GPS</p>
              </div>
            </div>

            <div class="pt-1 flex flex-wrap gap-4">
              <button onclick="window.app.openPublicVerify()" class="inline-flex items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-800 hover:underline">
                <i data-lucide="shield-check" class="w-4 h-4"></i> Cổng tra cứu chứng nhận điện tử cho nhà tuyển dụng →
              </button>
            </div>
          </div>

          <!-- Khung Đăng nhập & Đăng ký Tài khoản Thực -->
          <div class="lg:col-span-6 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <!-- Auth Tabs -->
            <div class="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-2xl">
              <button onclick="window.app.setAuthTab('login')" class="py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                authTab === 'login' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }">
                Đăng nhập
              </button>
              <button onclick="window.app.setAuthTab('register')" class="py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                authTab === 'register' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }">
                Đăng ký tài khoản
              </button>
            </div>

            ${authFeedback ? `
              <div class="p-3.5 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 ${
                authFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : authFeedback.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
              }">
                <i data-lucide="${authFeedback.type === 'success' ? 'check-circle-2' : authFeedback.type === 'warning' ? 'clock' : 'alert-circle'}" class="w-4 h-4 shrink-0 mt-0.5"></i>
                <span>${authFeedback.text}</span>
              </div>
            ` : ''}

            ${authTab === 'login' ? `
              <div class="space-y-4">
                <form onsubmit="event.preventDefault(); window.app.handleManualLogin()" class="space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Tên đăng nhập hoặc Mã số sinh viên (MSSV)</label>
                    <input id="login-user" type="text" value="${prefillLoginUser}" placeholder="VD: admin, btc hoặc MSSV của bạn" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
                    <div class="relative">
                      <input id="login-pass" type="password" placeholder="Nhập mật khẩu an toàn" class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                      <button type="button" onclick="window.app.togglePass('login-pass', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" title="Hiện/Ẩn mật khẩu">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                  <button type="submit" class="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm">
                    Đăng nhập hệ thống
                  </button>
                </form>

                <div class="pt-3 border-t border-slate-100 space-y-2">
                  <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tài khoản quản trị khởi tạo an toàn:</p>
                  <div class="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                    ${state.accounts.map(acc => `
                      <button onclick="window.app.fillLogin('${acc.username}')" class="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition flex items-center justify-between gap-3 group">
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 uppercase">${acc.role}</span>
                            <span class="text-xs font-bold text-slate-900 group-hover:text-brand-700">${acc.displayName}</span>
                          </div>
                          <p class="text-[10px] text-slate-500 mt-0.5">Tên đăng nhập: <strong>${acc.username}</strong></p>
                        </div>
                        <i data-lucide="arrow-right" class="w-4 h-4 text-slate-400 group-hover:text-brand-600 shrink-0"></i>
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>
            ` : `
              <form id="register-form" onsubmit="event.preventDefault(); window.app.handleRegister(this)" class="space-y-3 text-xs">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                    <input required name="fullName" type="text" placeholder="VD: Nguyễn Văn An" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Tên đăng nhập *</label>
                    <input required name="username" type="text" placeholder="VD: an_nguyen" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">MSSV (nếu là Sinh viên)</label>
                    <input name="mssv" type="text" placeholder="VD: 231150001" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Email *</label>
                    <input required name="email" type="email" placeholder="sinhvien@dongnai.edu.vn" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 mb-1">Trường Đại học / Cao đẳng trực thuộc *</label>
                  <select required name="universityId" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none">
                    ${state.universities.map(u => `<option value="${u.id}">${u.name} (${u.shortName})</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 mb-1">Vai trò đăng ký *</label>
                  <select required name="role" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none">
                    <option value="student">Sinh viên</option>
                    <option value="organizer">Ban Tổ Chức (Cần Quản trị viên duyệt)</option>
                  </select>
                </div>

                <!-- Địa chỉ hành chính Việt Nam hiện hành 2026 (QĐ 19/2025/QĐ-TTg) -->
                <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                      <i data-lucide="map-pin" class="w-3.5 h-3.5 text-brand-600"></i>
                      <span>Địa chỉ thường trú (QĐ 19/2025/QĐ-TTg)</span>
                    </div>
                    <span class="text-[10px] bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-full">Chuẩn 2026</span>
                  </div>

                  <!-- 1. Tỉnh/Thành phố -->
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">1. Tỉnh / Thành phố *</label>
                    <select required id="reg-province" name="province_code" onchange="window.app.handleRegProvinceChange(this.value)" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium">
                      ${window.SA.Administrative.getProvinces().map(p => `
                        <option value="${p.code}" ${regSelectedProvince === p.code ? 'selected' : ''}>
                          ${p.name} (Mã: ${p.code})
                        </option>
                      `).join('')}
                    </select>
                  </div>

                  <!-- 2. Xã/Phường/Đặc khu -->
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">2. Xã / Phường / Đặc khu *</label>
                    <select required id="reg-ward" name="ward_code" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium">
                      ${window.SA.Administrative.getWardsByProvince(regSelectedProvince).map((w, idx) => `
                        <option value="${w.code}" ${idx === 0 ? 'selected' : ''}>
                          ${w.name} (${w.type || 'Xã/Phường'} - Mã: ${w.code})
                        </option>
                      `).join('')}
                    </select>
                  </div>

                  <!-- 3. Địa chỉ chi tiết -->
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">3. Địa chỉ chi tiết *</label>
                    <input required name="detailed_address" type="text" placeholder="Số nhà, tên đường, khu phố, ấp..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Mật khẩu *</label>
                    <div class="relative">
                      <input required id="reg-pass" name="password" type="password" placeholder="Tối thiểu 6 ký tự" class="w-full px-3 py-2 pr-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                      <button type="button" onclick="window.app.togglePass('reg-pass', this)" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Nhập lại mật khẩu *</label>
                    <div class="relative">
                      <input required id="reg-pass-confirm" name="confirmPassword" type="password" placeholder="Khớp mật khẩu" class="w-full px-3 py-2 pr-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                      <button type="button" onclick="window.app.togglePass('reg-pass-confirm', this)" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" class="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm">
                  Tạo tài khoản chính thức
                </button>
              </form>
            `}
          </div>
        </div>
      </main>
    `;
  }

  function renderFooter() {
    return `
      <footer class="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 no-print mt-auto">
        <p><strong>AI SMARTATTEND ĐỒNG NAI</strong> • Điểm danh và cấp chứng nhận điện tử bằng AI – Tỉnh Đồng Nai.</p>
      </footer>
    `;
  }

  function render() {
    try {
      const state = store.state;
      const root = document.getElementById('app-root');
      if (!root) return;

      let bodyHtml = '';
      if (publicVerifyMode) {
        bodyHtml = renderVerifyView(state, initialVerifyCode);
      } else if (!state.isLoggedIn || !state.currentUser) {
        bodyHtml = renderLoginScreen(state);
      } else {
        const role = state.currentUser ? state.currentUser.role : 'student';
        if (role === 'student') bodyHtml = renderStudentView(state);
        else if (role === 'organizer') bodyHtml = renderOrganizerView(state);
        else bodyHtml = renderAdminView(state);
      }

      root.innerHTML = `
        ${renderHeader(state)}
        <div class="flex-1 flex flex-col">${bodyHtml}</div>
        ${renderFooter()}
      `;

      try {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      } catch (e) {
        console.warn('Lucide icons render warning:', e);
      }

      if (state.isLoggedIn && state.currentUser && state.currentUser.role === 'admin' && !publicVerifyMode) {
        setTimeout(() => {
          try {
            if (typeof initAdminCharts === 'function') initAdminCharts(state);
          } catch (e) {
            console.warn('Admin charts init warning:', e);
          }
        }, 40);
      }
    } catch (err) {
      console.error('Lỗi khi render SmartAttend:', err);
      const root = document.getElementById('app-root');
      if (root) {
        root.innerHTML = `
          <div class="max-w-xl mx-auto my-12 p-6 bg-amber-50 border-2 border-amber-300 rounded-3xl text-slate-800 space-y-4 shadow-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0">!</div>
              <div>
                <h3 class="text-base font-bold text-amber-900">Khôi phục Giao diện AI SmartAttend Đồng Nai</h3>
                <p class="text-xs text-amber-700">Đã kích hoạt cơ chế bảo vệ phiên an toàn tự động.</p>
              </div>
            </div>
            <p class="text-xs text-slate-600 bg-white p-3 rounded-xl border border-amber-200 font-mono">${err.message || 'Lỗi hiển thị'}</p>
            <div class="flex gap-2 pt-2">
              <button onclick="localStorage.clear(); location.reload();" class="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition">
                Khôi phục Dữ liệu Chuẩn &amp; Vào Đăng nhập
              </button>
            </div>
          </div>
        `;
      }
    }
  }

  store.subscribe(() => render());

  window.app = {
    render,
    toast: showToast,
    closeModal,
    setAuthTab(tab) {
      authTab = tab;
      authFeedback = null;
      render();
    },
    fillLogin(username) {
      const inp = document.getElementById('login-user');
      if (inp) inp.value = username;
      const pass = document.getElementById('login-pass');
      if (pass) {
        pass.value = (username === 'admin' ? 'admin123' : username === 'btc' ? 'btc123' : '123');
      }
    },
    togglePass(inputId, btn) {
      const input = document.getElementById(inputId);
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      const icon = btn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
        if (window.lucide) window.lucide.createIcons();
      }
    },
    handleRegProvinceChange(provCode) {
      regSelectedProvince = provCode;
      const wardSelect = document.getElementById('reg-ward');
      if (wardSelect && window.SA?.Administrative) {
        const wards = window.SA.Administrative.getWardsByProvince(provCode);
        wardSelect.innerHTML = wards.length > 0
          ? wards.map((w, idx) => `<option value="${w.code}" ${idx === 0 ? 'selected' : ''}>${w.name} (${w.type || 'Xã/Phường'} - Mã: ${w.code})</option>`).join('')
          : '<option value="">-- Vui lòng chọn Tỉnh/Thành phố --</option>';
      }
    },
    async handleRegister(form) {
      const fd = new FormData(form);
      const username = fd.get('username')?.trim();
      const password = fd.get('password');
      const confirmPassword = fd.get('confirmPassword');
      const fullName = fd.get('fullName')?.trim();
      const role = fd.get('role');
      const universityId = fd.get('universityId');
      const mssv = fd.get('mssv')?.trim() || username;
      const email = fd.get('email')?.trim();

      const province_code = fd.get('province_code');
      const ward_code = fd.get('ward_code');
      const detailed_address = fd.get('detailed_address')?.trim();

      if (password !== confirmPassword) {
        authFeedback = { type: 'error', text: 'Mật khẩu xác nhận không trùng khớp.' };
        render();
        return;
      }

      // Kiểm tra tính hợp lệ của đơn vị hành chính theo QĐ 19/2025/QĐ-TTg
      const adminSvc = window.SA?.Administrative;
      if (adminSvc) {
        if (!province_code || !adminSvc.getProvinceByCode(province_code)) {
          authFeedback = { type: 'error', text: 'Vui lòng chọn Tỉnh/Thành phố hợp lệ theo danh mục 2026.' };
          render();
          return;
        }
        if (!ward_code || !adminSvc.isValidAdministrativePair(province_code, ward_code)) {
          authFeedback = { type: 'error', text: 'Xã/Phường/Đặc khu không thuộc Tỉnh/Thành phố đã chọn hoặc mã không hợp lệ.' };
          render();
          return;
        }
        if (!detailed_address) {
          authFeedback = { type: 'error', text: 'Vui lòng nhập số nhà, tên đường hoặc địa chỉ chi tiết.' };
          render();
          return;
        }
      }

      const res = await store.registerUser({
        username,
        password,
        displayName: fullName,
        role,
        mssv,
        universityId,
        email,
        province_code,
        ward_code,
        detailed_address
      });

      if (!res.ok) {
        authFeedback = { type: 'error', text: res.message };
        showToast(res.message, 'error');
        render();
        return;
      }

      prefillLoginUser = username;
      authTab = 'login';
      authFeedback = {
        type: role === 'organizer' ? 'warning' : 'success',
        text: res.message
      };
      showToast(res.message, 'success');
      render();
    },
    async handleManualLogin() {
      const u = document.getElementById('login-user')?.value?.trim();
      const p = document.getElementById('login-pass')?.value?.trim();
      if (!u || !p) {
        showToast('Vui lòng nhập tên đăng nhập và mật khẩu.', 'warning');
        return;
      }

      const res = await store.authenticate(u, p);
      if (!res.ok) {
        authFeedback = { type: 'error', text: res.message };
        showToast(res.message, 'error');
        render();
        return;
      }

      publicVerifyMode = false;
      authFeedback = null;
      showToast(`Đăng nhập thành công: ${res.user.displayName}`, 'success');
    },
    logout() {
      publicVerifyMode = false;
      store.logout();
    },
    openPublicVerify(certCode = '') {
      publicVerifyMode = true;
      window.verifySearchQuery = certCode;
      render();
    },
    closePublicVerify() {
      publicVerifyMode = false;
      render();
    },
    openConnectionModal() {
      openModal(`
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="database" class="w-5 h-5 text-brand-600"></i>
              Cấu hình Kết nối Supabase &amp; Backend API
            </h3>
            <button onclick="window.app.closeModal()" class="p-1 text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>
          <p class="text-xs text-slate-500">
            Hệ thống hỗ trợ kết nối trực tiếp đến PostgreSQL Supabase và Gateway REST API của tỉnh Đồng Nai.
          </p>
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Supabase Project URL</label>
              <input id="cfg-sb-url" type="text" value="${config.get('supabaseUrl') || ''}" placeholder="https://xyzcompany.supabase.co" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Supabase Anon Key</label>
              <input id="cfg-sb-key" type="password" value="${config.get('supabaseAnonKey') || ''}" placeholder="eyJhbGciOiJIUzI1NiIsIn..." class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Backend API Base URL</label>
              <input id="cfg-api-url" type="text" value="${config.get('apiBaseUrl') || 'http://localhost:3001'}" placeholder="http://localhost:3001" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono" />
            </div>
          </div>
          <div class="flex justify-between items-center pt-2">
            <button onclick="window.app.testSupabaseConnection()" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Kiểm tra kết nối
            </button>
            <div class="flex gap-2">
              <button onclick="window.app.closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Đóng</button>
              <button onclick="window.app.saveConfigFromModal()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold">Lưu cấu hình</button>
            </div>
          </div>
        </div>
      `, 'max-w-lg');
    },
    saveConfigFromModal() {
      const u = document.getElementById('cfg-sb-url')?.value?.trim();
      const k = document.getElementById('cfg-sb-key')?.value?.trim();
      const a = document.getElementById('cfg-api-url')?.value?.trim();

      config.set('supabaseUrl', u);
      config.set('supabaseAnonKey', k);
      config.set('apiBaseUrl', a);

      closeModal();
      showToast('Đã lưu cấu hình hệ thống thành công!', 'success');
    },
    async testSupabaseConnection() {
      const u = document.getElementById('cfg-sb-url')?.value?.trim();
      const k = document.getElementById('cfg-sb-key')?.value?.trim();
      config.set('supabaseUrl', u);
      config.set('supabaseAnonKey', k);
      const res = await supabase.testConnection();
      showToast(res.message, res.ok ? 'success' : 'warning');
    }
  };

  render();
})();
