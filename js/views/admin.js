(function () {
  const store = window.SA.Store;
  const { showToast } = window.SA.UI;
  const { generateAISummaryReport } = window.SA.AI;

  let activeTab = 'dashboard'; // dashboard | accounts | students | audit
  let chartInstances = [];
  let accSearch = '';
  let accRoleFilter = 'all';
  let accUniFilter = 'all';
  let svSearch = '';
  let svUniFilter = 'all';
  let svProvinceFilter = 'all';
  let svWardFilter = 'all';

  function buildUniFilterOptions(universities, selectedId) {
    const dh = universities.filter(u => u.group === 'Đại học');
    const cd = universities.filter(u => u.group === 'Cao đẳng');
    const other = universities.filter(u => u.group === 'Trường khác');
    return `
      <option value="all" ${selectedId === 'all' ? 'selected' : ''}>Tất cả Trường ĐH/CĐ (${universities.length})</option>
      ${dh.length ? `<optgroup label="Nhóm Đại học">${dh.map(u => `<option value="${u.id}" ${selectedId === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}</optgroup>` : ''}
      ${cd.length ? `<optgroup label="Nhóm Cao đẳng">${cd.map(u => `<option value="${u.id}" ${selectedId === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}</optgroup>` : ''}
      ${other.length ? `<optgroup label="Trường khác">${other.map(u => `<option value="${u.id}" ${selectedId === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}</optgroup>` : ''}
    `;
  }

  function renderAdminView(state) {
    const pendingCount = state.accounts.filter(a => a.status === 'pending').length;
    const tabs = [
      { id: 'dashboard', label: 'Dashboard Thống kê & AI', icon: 'bar-chart-3' },
      { id: 'accounts', label: `Quản lý Tài khoản (${state.accounts.length})`, icon: 'users-cog', badge: pendingCount },
      { id: 'students', label: `Hồ sơ Sinh viên (${state.students.length})`, icon: 'graduation-cap' },
      { id: 'audit', label: `Nhật ký Bảo mật (${state.auditLogs.length})`, icon: 'shield-check' }
    ];

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">AI SMARTATTEND ĐỒNG NAI</h1>
            <p class="text-xs text-brand-700 font-semibold flex items-center gap-1.5 mt-0.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Điểm danh và cấp chứng nhận điện tử bằng AI – Trung tâm Quản trị Toàn tỉnh
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          ${tabs.map(t => `
            <button onclick="window.adminUI.setTab('${t.id}')" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === t.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }">
              <i data-lucide="${t.icon}" class="w-4 h-4"></i>
              <span>${t.label}</span>
              ${t.badge ? `<span class="px-1.5 py-0.5 text-[11px] rounded-full ${activeTab === t.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}">${t.badge} chờ duyệt</span>` : ''}
            </button>
          `).join('')}
        </div>

        ${activeTab === 'dashboard' ? renderDashboard(state) : ''}
        ${activeTab === 'accounts' ? renderAccountsTab(state) : ''}
        ${activeTab === 'students' ? renderStudentsTab(state) : ''}
        ${activeTab === 'audit' ? renderAuditTab(state) : ''}
      </div>
    `;
  }

function renderDashboard(state) {
  const totalEvents = state.events.length;
  const totalRegs = state.registrations.length;
  const totalAttended = state.registrations.filter(r => r.checkInAt).length;
  const successRate = totalRegs > 0 ? Math.round((totalAttended / totalRegs) * 100) : 0;
  const totalCerts = state.certificates.length;
  const totalUnis = state.universities.length;
  const totalAnomalies = state.registrations.filter(r => r.aiRiskLevel === 'HIGH').length;
  const aiSummary = generateAISummaryReport(state);

  const totalAccounts = state.accounts.length;
  const studentAccountsCount = state.accounts.filter(a => a.role === 'student').length;
  const orgAccountsCount = state.accounts.filter(a => a.role === 'organizer').length;
  const pendingOrgCount = state.accounts.filter(a => a.role === 'organizer' && a.status === 'pending').length;
  const newAccounts = state.accounts.filter(a => a.isNew);

  // Thống kê địa bàn hành chính 2026 (QĐ 19/2025/QĐ-TTg)
  const dongNaiCount = state.students.filter(s => s.province_code === '75').length;
  const hcmCount = state.students.filter(s => s.province_code === '79').length;
  const hanoiCount = state.students.filter(s => s.province_code === '01').length;
  const otherCount = state.students.filter(s => s.province_code && !['75', '79', '01'].includes(s.province_code)).length;
  const totalCoded = state.students.filter(s => s.province_code && s.ward_code).length;
  const complianceRate = Math.round((totalCoded / (state.students.length || 1)) * 100);

  return `
    <div class="space-y-6">
      <!-- 7 KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Hoạt động</span>
          <p class="text-2xl font-extrabold text-brand-700 mt-1">${totalEvents}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Đăng ký HĐ</span>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">${totalRegs}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Lượt tham gia</span>
          <p class="text-2xl font-extrabold text-emerald-600 mt-1">${totalAttended}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Tỷ lệ đạt</span>
          <p class="text-2xl font-extrabold text-brand-600 mt-1">${successRate}%</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Chứng nhận</span>
          <p class="text-2xl font-extrabold text-emerald-700 mt-1">${totalCerts}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Số trường</span>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">${totalUnis}</p>
        </div>
        <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm">
          <span class="text-[11px] font-bold text-amber-700 uppercase">Bất thường AI</span>
          <p class="text-2xl font-extrabold text-amber-600 mt-1">${totalAnomalies}</p>
        </div>
      </div>

      <!-- Thống kê Tài khoản đồng bộ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-5 grid grid-cols-3 gap-3">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[11px] font-bold text-slate-400 uppercase block">Tổng tài khoản</span>
            <p class="text-2xl font-extrabold text-brand-700 mt-1">${totalAccounts}</p>
            <button onclick="window.adminUI.setTab('accounts')" class="text-[11px] text-brand-600 hover:underline font-semibold mt-1">Quản lý →</button>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[11px] font-bold text-slate-400 uppercase block">SV hệ thống</span>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">${state.students.length}</p>
            <span class="text-[11px] text-slate-500">${studentAccountsCount} TK đăng nhập</span>
          </div>
          <div class="bg-white p-4 rounded-2xl border ${pendingOrgCount > 0 ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'} shadow-sm">
            <span class="text-[11px] font-bold text-slate-400 uppercase block">Tài khoản BTC</span>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">${orgAccountsCount}</p>
            <span class="text-[11px] font-semibold ${pendingOrgCount > 0 ? 'text-amber-700' : 'text-emerald-600'}">
              ${pendingOrgCount > 0 ? `${pendingOrgCount} chờ duyệt` : 'Đã duyệt hết'}
            </span>
          </div>
        </div>

        <div class="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">Tài khoản mới đăng ký gần đây</h4>
            <button onclick="window.adminUI.setTab('accounts')" class="text-xs font-semibold text-brand-600 hover:underline">Xem tất cả</button>
          </div>
          ${newAccounts.length === 0 ? `
            <p class="text-xs text-slate-400 py-2">Chưa có tài khoản mới đăng ký trong phiên này. Thử đăng ký tài khoản mới ở màn hình Đăng nhập!</p>
          ` : `
            <div class="space-y-1.5 max-h-24 overflow-y-auto">
              ${newAccounts.map(a => `
                <div class="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <div>
                    <span class="font-bold text-slate-900">${a.fullName}</span>
                    <span class="text-slate-500 font-mono ml-1">(${a.username})</span>
                    <span class="text-slate-400 ml-1">• ${a.universityName}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    a.status === 'pending' ? 'bg-amber-100 text-amber-800' : a.status === 'locked' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }">${a.status === 'pending' ? 'Chờ duyệt' : a.status === 'locked' ? 'Bị khóa' : 'Hoạt động'}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- AI Summary Insight -->
      <div class="bg-gradient-to-r from-brand-800 to-brand-600 text-white rounded-2xl p-5 shadow-md">
        <div class="flex items-start gap-3">
          <div class="p-2.5 rounded-xl bg-white/15 shrink-0">
            <i data-lucide="sparkles" class="w-6 h-6 text-amber-300"></i>
          </div>
          <div>
            <h3 class="font-bold text-base">Báo cáo Phân tích Tổng hợp bằng AI</h3>
            <p class="text-sm text-brand-100 mt-1 font-medium">${aiSummary.headline || aiSummary.summaryText || 'Hệ thống AI giám sát liên thông 11 trường ĐH/CĐ Đồng Nai.'}</p>
            <ul class="mt-2.5 space-y-1 text-xs text-brand-50 list-disc list-inside">
              ${((aiSummary.insights && Array.isArray(aiSummary.insights)) ? aiSummary.insights : [aiSummary.summaryText, aiSummary.recommendation].filter(Boolean)).map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <!-- Thống kê Giám sát Sinh trắc học & AI Face Verification (Chuẩn ISO/IEC 19794) -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <h3 class="font-bold text-slate-900 text-sm">Quản Trị An Toàn Sinh Trắc Học &amp; AI Face Verification</h3>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Giám sát việc thực thi quy chế xác thực khuôn mặt 1:1, chống giả mạo liveness và tuân thủ Zero Raw Photo Storage.</p>
          </div>
          <span class="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200 flex items-center gap-1">
            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Tuân thủ Privacy: 100%
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div class="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100">
            <span class="text-[11px] font-bold text-purple-700 uppercase">Mẫu khuôn mặt kích hoạt</span>
            <p class="text-2xl font-extrabold text-purple-900 mt-1">${(state.faceProfiles || []).filter(p => p.status === 'active').length}</p>
            <p class="text-[10px] text-purple-600 mt-0.5">Sinh viên đã tạo mẫu vector 128D</p>
          </div>
          <div class="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span class="text-[11px] font-bold text-emerald-700 uppercase">Lượt xác thực 1:1</span>
            <p class="text-2xl font-extrabold text-emerald-900 mt-1">${(state.faceVerificationLogs || []).length}</p>
            <p class="text-[10px] text-emerald-600 mt-0.5">Tổng số lần đối chiếu điểm danh</p>
          </div>
          <div class="p-3.5 bg-sky-50/60 rounded-xl border border-sky-100">
            <span class="text-[11px] font-bold text-sky-700 uppercase">Tỷ lệ Liveness đạt</span>
            <p class="text-2xl font-extrabold text-sky-900 mt-1">98.5%</p>
            <p class="text-[10px] text-sky-600 mt-0.5">Vượt qua Anti-spoofing người thật</p>
          </div>
          <div class="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
            <span class="text-[11px] font-bold text-amber-700 uppercase">Yêu cầu duyệt thủ công</span>
            <p class="text-2xl font-extrabold text-amber-900 mt-1">${(state.manualVerificationQueue || []).length}</p>
            <p class="text-[10px] text-amber-600 mt-0.5">Dự phòng 0 điểm phạt đã tiếp nhận</p>
          </div>
        </div>

        <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span class="font-bold text-slate-700">Phân bố 4 Chế độ Điểm danh trên toàn tỉnh:</span>
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold text-[11px]">Mode A (QR Only): ${state.events.filter(e => !e.faceVerificationMode || e.faceVerificationMode === 'QR_ONLY').length}</span>
            <span class="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 font-bold text-[11px]">Mode B (Optional Face): ${state.events.filter(e => e.faceVerificationMode === 'QR_OPTIONAL_FACE').length}</span>
            <span class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-bold text-[11px]">Mode C (Required Face): ${state.events.filter(e => e.faceVerificationMode === 'QR_REQUIRED_FACE').length}</span>
            <span class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px]">Mode D (Conditional): ${state.events.filter(e => e.faceVerificationMode === 'QR_CONDITIONAL').length}</span>
          </div>
        </div>
      </div>

      <!-- Thống kê Địa bàn Hành chính theo QĐ 19/2025/QĐ-TTg (34 Tỉnh/Thành phố & Xã/Phường/Đặc khu) -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
              <h3 class="font-bold text-slate-900 text-sm">Phân bố Sinh viên theo Đơn vị Hành chính 2026 (QĐ 19/2025/QĐ-TTg)</h3>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Dữ liệu liên thông 34 tỉnh/thành phố và xã/phường/đặc khu trực thuộc (không dùng danh mục 63 tỉnh cũ).</p>
          </div>
          <span class="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            Chuẩn hóa: ${complianceRate}% (${totalCoded}/${state.students.length} sinh viên)
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div class="p-3.5 bg-brand-50/60 rounded-xl border border-brand-100">
            <span class="text-[11px] font-bold text-brand-700 uppercase">Tỉnh Đồng Nai (Mã: 75)</span>
            <p class="text-2xl font-extrabold text-brand-900 mt-1">${dongNaiCount}</p>
            <p class="text-[10px] text-brand-600 mt-0.5">${state.students.length ? Math.round((dongNaiCount / state.students.length) * 100) : 0}% tổng sinh viên</p>
          </div>
          <div class="p-3.5 bg-sky-50/60 rounded-xl border border-sky-100">
            <span class="text-[11px] font-bold text-sky-700 uppercase">TP. Hồ Chí Minh (Mã: 79)</span>
            <p class="text-2xl font-extrabold text-sky-900 mt-1">${hcmCount}</p>
            <p class="text-[10px] text-sky-600 mt-0.5">${state.students.length ? Math.round((hcmCount / state.students.length) * 100) : 0}% tổng sinh viên</p>
          </div>
          <div class="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <span class="text-[11px] font-bold text-indigo-700 uppercase">TP. Hà Nội (Mã: 01)</span>
            <p class="text-2xl font-extrabold text-indigo-900 mt-1">${hanoiCount}</p>
            <p class="text-[10px] text-indigo-600 mt-0.5">${state.students.length ? Math.round((hanoiCount / state.students.length) * 100) : 0}% tổng sinh viên</p>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[11px] font-bold text-slate-600 uppercase">31 Tỉnh / TP khác</span>
            <p class="text-2xl font-extrabold text-slate-800 mt-1">${otherCount}</p>
            <p class="text-[10px] text-slate-500 mt-0.5">${state.students.length ? Math.round((otherCount / state.students.length) * 100) : 0}% tổng sinh viên</p>
          </div>
        </div>
      </div>

      <!-- Charts Row: Bar Chart & Doughnut Chart -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-900 text-sm mb-4">Biểu đồ Sinh viên, Lượt tham gia &amp; Chứng nhận theo ${state.universities.length} Trường ĐH/CĐ</h3>
          <div class="h-72">
            <canvas id="chart-universities"></canvas>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-900 text-sm mb-4">Cơ cấu trạng thái điểm danh</h3>
          <div class="h-72 flex items-center justify-center">
            <canvas id="chart-status-pie"></canvas>
          </div>
        </div>
      </div>

      <!-- Bảng Thống kê chi tiết theo từng Trường -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-slate-900 text-sm">Thống kê Sinh viên &amp; Tài khoản mới theo Trường ĐH/CĐ Đồng Nai</h3>
            <p class="text-xs text-slate-500">Tổng số trường có sinh viên đăng ký: <strong>${state.universities.filter(u => state.students.some(s => s.universityId === u.id)).length}/${state.universities.length} trường</strong></p>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th class="px-4 py-2.5">Trường Đại học / Cao đẳng</th>
                <th class="px-4 py-2.5">Nhóm</th>
                <th class="px-4 py-2.5 text-center">Tổng Sinh viên</th>
                <th class="px-4 py-2.5 text-center">TK Mới đăng ký</th>
                <th class="px-4 py-2.5 text-center">Lượt tham gia HĐ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${state.universities.map(u => {
                const svList = state.students.filter(s => s.universityId === u.id);
                const svIds = new Set(svList.map(s => s.id));
                const newAccCount = state.accounts.filter(a => a.universityId === u.id && a.isNew).length;
                const attendedCount = state.registrations.filter(r => svIds.has(r.studentId) && r.checkInAt).length;
                return `
                  <tr class="hover:bg-slate-50">
                    <td class="px-4 py-2.5 font-bold text-slate-900">${u.name}</td>
                    <td class="px-4 py-2.5"><span class="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold text-[11px]">${u.group || 'ĐH/CĐ'}</span></td>
                    <td class="px-4 py-2.5 text-center font-bold text-slate-800">${svList.length}</td>
                    <td class="px-4 py-2.5 text-center font-bold ${newAccCount > 0 ? 'text-emerald-600' : 'text-slate-400'}">${newAccCount}</td>
                    <td class="px-4 py-2.5 text-center font-bold text-brand-700">${attendedCount}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Line Chart -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 class="font-bold text-slate-900 text-sm mb-4">Xu hướng hoạt động &amp; lượt sinh viên tham gia theo tháng (Năm 2026)</h3>
        <div class="h-64">
          <canvas id="chart-monthly-line"></canvas>
        </div>
      </div>
    </div>
  `;
}

function renderStudentsTab(state) {
  const adminSvc = window.SA?.Administrative;
  const provinces = adminSvc ? adminSvc.getProvinces() : [];
  const wards = (adminSvc && svProvinceFilter !== 'all') ? adminSvc.getWardsByProvince(svProvinceFilter) : [];

  const q = svSearch.toLowerCase().trim();
  const filtered = state.students.filter(sv => {
    const matchText = !q ||
      (sv.fullName || '').toLowerCase().includes(q) ||
      (sv.mssv || '').toLowerCase().includes(q) ||
      (sv.province_name || '').toLowerCase().includes(q) ||
      (sv.ward_name || '').toLowerCase().includes(q) ||
      (sv.detailed_address || '').toLowerCase().includes(q) ||
      (sv.province_code || '').includes(q) ||
      (sv.ward_code || '').includes(q);
    const matchUni = svUniFilter === 'all' || sv.universityId === svUniFilter;
    const matchProvince = svProvinceFilter === 'all' || sv.province_code === svProvinceFilter;
    const matchWard = svWardFilter === 'all' || sv.ward_code === svWardFilter;
    return matchText && matchUni && matchProvince && matchWard;
  });

  return `
    <div class="space-y-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div class="flex-1 relative">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
          <input id="admin-sv-search" type="text" value="${svSearch}" oninput="window.adminUI.setSvSearch(this.value)" placeholder="Tìm kiếm theo họ tên, MSSV, Xã/Phường, Tỉnh/TP hoặc mã..." class="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none" />
        </div>
        <select onchange="window.adminUI.setSvUniFilter(this.value)" class="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
          ${buildUniFilterOptions(state.universities, svUniFilter)}
        </select>
        <!-- Bộ lọc Tỉnh/Thành phố (34 địa phương) -->
        <select onchange="window.adminUI.setSvProvinceFilter(this.value)" class="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
          <option value="all" ${svProvinceFilter === 'all' ? 'selected' : ''}>Tất cả Tỉnh/TP (34)</option>
          ${provinces.map(p => `
            <option value="${p.code}" ${svProvinceFilter === p.code ? 'selected' : ''}>
              ${p.name} (${p.code})
            </option>
          `).join('')}
        </select>
        <!-- Bộ lọc Xã/Phường/Đặc khu trực thuộc -->
        <select onchange="window.adminUI.setSvWardFilter(this.value)" ${svProvinceFilter === 'all' ? 'disabled' : ''} class="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold ${svProvinceFilter === 'all' ? 'opacity-50 cursor-not-allowed' : ''}">
          <option value="all" ${svWardFilter === 'all' ? 'selected' : ''}>
            ${svProvinceFilter === 'all' ? 'Tất cả Xã/Phường (Chọn Tỉnh trước)' : `Tất cả Xã/Phường (${wards.length})`}
          </option>
          ${wards.map(w => `
            <option value="${w.code}" ${svWardFilter === w.code ? 'selected' : ''}>
              ${w.name} (${w.code})
            </option>
          `).join('')}
        </select>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-slate-900">Danh sách Hồ sơ Sinh viên (${filtered.length}/${state.students.length})</h3>
            <p class="text-xs text-slate-500">Chuẩn hóa danh mục địa giới hành chính theo Quyết định 19/2025/QĐ-TTg (34 Tỉnh/TP và Xã/Phường/Đặc khu).</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Hồ sơ có Mã Đơn vị Hành chính
            </span>
          </div>
        </div>
        <div class="overflow-x-auto max-h-[540px]">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 uppercase font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">MSSV</th>
                <th class="px-4 py-3">Họ và tên</th>
                <th class="px-4 py-3">Trường</th>
                <th class="px-4 py-3">Địa chỉ hành chính 2026</th>
                <th class="px-4 py-3">Khoa / Ngành</th>
                <th class="px-4 py-3">Thiết bị tin cậy</th>
                <th class="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filtered.length === 0 ? `
                <tr><td colspan="7" class="px-4 py-8 text-center text-slate-400">Không tìm thấy sinh viên phù hợp với bộ lọc địa chỉ.</td></tr>
              ` : filtered.map(sv => `
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-2.5 font-mono font-bold text-brand-700">${sv.mssv}</td>
                  <td class="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">${sv.fullName} ${sv.isNew ? '<span class="ml-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">Mới</span>' : ''}</td>
                  <td class="px-4 py-2.5 text-slate-600">${sv.universityName}</td>
                  <td class="px-4 py-2.5 text-slate-700">
                    <p class="font-medium text-slate-900">${sv.detailed_address ? sv.detailed_address + ', ' : ''}${sv.ward_name || 'Phường Bửu Long'}, ${sv.province_name || 'Tỉnh Đồng Nai'}</p>
                    <span class="inline-block mt-0.5 font-mono text-[10px] px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 border border-brand-200">
                      Mã: [${sv.province_code || '75'} - ${sv.ward_code || '26176'}]
                    </span>
                  </td>
                  <td class="px-4 py-2.5 text-slate-600">${sv.faculty}</td>
                  <td class="px-4 py-2.5 font-mono text-slate-500">${sv.deviceId}</td>
                  <td class="px-4 py-2.5 text-right whitespace-nowrap">
                    <button onclick="window.adminUI.openAdminEditAddressModal('${sv.id}')" class="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold transition flex items-center gap-1 text-[11px] ml-auto">
                      <i data-lucide="edit" class="w-3.5 h-3.5"></i> Sửa địa chỉ
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderAccountsTab(state) {
  const q = accSearch.toLowerCase().trim();
  const filtered = state.accounts.filter(a => {
    const matchText = !q ||
      (a.fullName || a.displayName || '').toLowerCase().includes(q) ||
      (a.username || '').toLowerCase().includes(q) ||
      (a.mssv || '').toLowerCase().includes(q);
    const matchRole = accRoleFilter === 'all' || a.role === accRoleFilter;
    const matchUni = accUniFilter === 'all' || a.universityId === accUniFilter;
    return matchText && matchRole && matchUni;
  });

  const statusBadge = (status) => {
    if (status === 'pending') return '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Chờ duyệt</span>';
    if (status === 'locked') return '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Bị khóa</span>';
    return '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Hoạt động</span>';
  };

  const roleLabel = { student: 'Sinh viên', organizer: 'Ban Tổ chức', admin: 'Quản trị viên' };

  return `
    <div class="space-y-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div class="flex-1 relative">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
          <input id="admin-acc-search" type="text" value="${accSearch}" oninput="window.adminUI.setAccSearch(this.value)" placeholder="Tìm kiếm theo họ tên, MSSV hoặc tên đăng nhập..." class="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none" />
        </div>
        <select onchange="window.adminUI.setAccRoleFilter(this.value)" class="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
          <option value="all" ${accRoleFilter === 'all' ? 'selected' : ''}>Tất cả vai trò</option>
          <option value="student" ${accRoleFilter === 'student' ? 'selected' : ''}>Sinh viên</option>
          <option value="organizer" ${accRoleFilter === 'organizer' ? 'selected' : ''}>Ban Tổ chức</option>
          <option value="admin" ${accRoleFilter === 'admin' ? 'selected' : ''}>Quản trị viên</option>
        </select>
        <select onchange="window.adminUI.setAccUniFilter(this.value)" class="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
          ${buildUniFilterOptions(state.universities, accUniFilter)}
        </select>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">Họ và tên</th>
                <th class="px-4 py-3">MSSV / Tên ĐN</th>
                <th class="px-4 py-3">Trường / Đơn vị</th>
                <th class="px-4 py-3">Vai trò</th>
                <th class="px-4 py-3">Ngày đăng ký</th>
                <th class="px-4 py-3">Trạng thái</th>
                <th class="px-4 py-3 text-right">Thao tác quản trị</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filtered.length === 0 ? `
                <tr><td colspan="7" class="px-4 py-8 text-center text-slate-400">Không tìm thấy tài khoản phù hợp.</td></tr>
              ` : filtered.map(acc => `
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3">
                    <p class="font-bold text-slate-900">${acc.fullName || acc.displayName} ${acc.isNew ? '<span class="ml-1 px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 text-[10px]">Mới</span>' : ''}</p>
                    <p class="text-[11px] text-slate-500">${acc.email || ''}</p>
                  </td>
                  <td class="px-4 py-3 font-mono font-semibold text-brand-700">${acc.username}${acc.mssv && acc.mssv !== acc.username ? ` / ${acc.mssv}` : ''}</td>
                  <td class="px-4 py-3 text-slate-600">${acc.universityName || acc.unit || '—'}</td>
                  <td class="px-4 py-3 font-semibold">${roleLabel[acc.role] || acc.role}</td>
                  <td class="px-4 py-3 font-mono text-slate-500">${acc.createdAt || '—'}</td>
                  <td class="px-4 py-3">${statusBadge(acc.status)}</td>
                  <td class="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                    ${acc.status === 'pending' ? `
                      <button onclick="window.adminUI.approve('${acc.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition">
                        Phê duyệt BTC
                      </button>
                    ` : ''}
                    ${acc.id !== state.currentUser?.id ? `
                      <button onclick="window.adminUI.toggleLock('${acc.id}')" class="px-3 py-1.5 rounded-lg ${
                        acc.status === 'locked'
                          ? 'bg-brand-600 hover:bg-brand-700 text-white'
                          : 'bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-700'
                      } font-bold transition">
                        ${acc.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                      </button>
                    ` : '<span class="text-[11px] text-slate-400 italic">Đang đăng nhập</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderAuditTab(state) {
  return `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-200">
        <h3 class="font-bold text-slate-900">Nhật ký thao tác &amp; Kiểm toán Bảo mật (Audit Logs)</h3>
        <p class="text-xs text-slate-500">Mọi thao tác đăng nhập, điểm danh, cảnh báo AI, phê duyệt của BTC và cấp chứng nhận đều được lưu vết minh bạch.</p>
      </div>
      <div class="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
        ${state.auditLogs.map(log => `
          <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="font-mono text-slate-400">${log.timestamp}</span>
                <span class="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold uppercase text-[10px]">${log.role}</span>
                <span class="font-bold text-slate-900">${log.actor}</span>
              </div>
              <p class="font-semibold text-slate-800">${log.action} — <span class="text-brand-700">${log.target}</span></p>
              <p class="text-slate-500">${log.detail}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function initAdminCharts(state) {
  if (activeTab !== 'dashboard' || !window.Chart) return;
  chartInstances.forEach(c => c.destroy());
  chartInstances = [];

  // 1. Bar Chart by University
  const uniLabels = state.universities.map(u => u.shortName);
  const uniStudents = state.universities.map(u => state.students.filter(s => s.universityId === u.id).length);
  const uniAttended = state.universities.map(u => {
    const svIds = new Set(state.students.filter(s => s.universityId === u.id).map(s => s.id));
    return state.registrations.filter(r => svIds.has(r.studentId) && r.checkInAt).length;
  });
  const uniCerts = state.universities.map(u => {
    const svIds = new Set(state.students.filter(s => s.universityId === u.id).map(s => s.id));
    return state.certificates.filter(c => svIds.has(c.studentId || c.student_id)).length;
  });

  const ctxUni = document.getElementById('chart-universities');
  if (ctxUni) {
    chartInstances.push(new window.Chart(ctxUni, {
      type: 'bar',
      data: {
        labels: uniLabels,
        datasets: [
          { label: 'Số Sinh viên', data: uniStudents, backgroundColor: '#94a3b8', borderRadius: 5 },
          { label: 'Lượt tham gia', data: uniAttended, backgroundColor: '#0284c7', borderRadius: 5 },
          { label: 'Chứng nhận đã cấp', data: uniCerts, backgroundColor: '#10b981', borderRadius: 5 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    }));
  }

  // 2. Pie Chart Status
  const validCount = state.registrations.filter(r => r.checkInAt && r.aiRiskLevel !== 'HIGH').length;
  const anomalyCount = state.registrations.filter(r => r.aiRiskLevel === 'HIGH').length;
  const absentCount = state.registrations.filter(r => !r.checkInAt).length;

  const ctxPie = document.getElementById('chart-status-pie');
  if (ctxPie) {
    chartInstances.push(new window.Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Hợp lệ', 'Cảnh báo AI', 'Chưa điểm danh / Vắng'],
        datasets: [{
          data: [validCount, anomalyCount, absentCount],
          backgroundColor: ['#10b981', '#f59e0b', '#cbd5e1'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    }));
  }

  // 3. Monthly Line Chart
  const ctxLine = document.getElementById('chart-monthly-line');
  if (ctxLine) {
    chartInstances.push(new window.Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12 (Dự kiến)'],
        datasets: [
          {
            label: 'Lượt sinh viên tham gia',
            data: [42, 68, 95, 134, state.registrations.filter(r => r.checkInAt).length, 160],
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.12)',
            fill: true,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    }));
  }
}

window.adminUI = {
  setTab(tab) {
    activeTab = tab;
    window.app.render();
  },
  setAccSearch(val) {
    accSearch = val;
    window.app.render();
    const el = document.getElementById('admin-acc-search');
    if (el) {
      el.focus();
      el.setSelectionRange(val.length, val.length);
    }
  },
  setAccRoleFilter(val) {
    accRoleFilter = val;
    window.app.render();
  },
  setAccUniFilter(val) {
    accUniFilter = val;
    window.app.render();
  },
  setSvSearch(val) {
    svSearch = val;
    window.app.render();
    const el = document.getElementById('admin-sv-search');
    if (el) {
      el.focus();
      el.setSelectionRange(val.length, val.length);
    }
  },
  setSvUniFilter(val) {
    svUniFilter = val;
    window.app.render();
  },
  setSvProvinceFilter(val) {
    svProvinceFilter = val;
    svWardFilter = 'all'; // Tự động reset lựa chọn xã cũ khi đổi tỉnh
    window.app.render();
  },
  setSvWardFilter(val) {
    svWardFilter = val;
    window.app.render();
  },
  openAdminEditAddressModal(svId) {
    const sv = store.state.students.find(s => s.id === svId);
    if (!sv) return;

    const adminSvc = window.SA?.Administrative;
    const currentPCode = sv.province_code || '75';
    const currentWCode = sv.ward_code || '26176';
    const provinces = adminSvc ? adminSvc.getProvinces() : [];
    const wards = adminSvc ? adminSvc.getWardsByProvince(currentPCode) : [];

    window.SA.UI.openModal(`
      <div class="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-900">Quản trị: Cập nhật Địa chỉ Hành chính Sinh viên</h3>
            <p class="text-xs text-slate-500">Chuẩn hóa dữ liệu theo QĐ 19/2025/QĐ-TTg cho sinh viên: <strong>${sv.fullName} (${sv.mssv})</strong></p>
          </div>
          <button onclick="window.app.closeModal()" class="p-1 text-slate-400 hover:text-slate-600">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="event.preventDefault(); window.adminUI.saveAdminAddress('${sv.id}', this)" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span class="text-slate-400 block font-medium">Họ và tên:</span>
              <span class="font-bold text-slate-900">${sv.fullName}</span>
            </div>
            <div>
              <span class="text-slate-400 block font-medium">MSSV / Trường:</span>
              <span class="font-mono font-bold text-brand-700">${sv.mssv}</span> - <span>${sv.universityName}</span>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-brand-600"></i>
                Địa chỉ hành chính hiện hành 2026
              </span>
              <span class="text-[10px] bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-full">QĐ 19/2025/QĐ-TTg</span>
            </div>

            <!-- 1. Tỉnh/Thành phố -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">1. Tỉnh / Thành phố *</label>
              <select required id="admin-modal-edit-province" name="province_code" onchange="window.adminUI.handleAdminModalProvinceChange(this.value)" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none">
                ${provinces.map(p => `
                  <option value="${p.code}" ${p.code === currentPCode ? 'selected' : ''}>
                    ${p.name} (Mã: ${p.code})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- 2. Xã/Phường/Đặc khu -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">2. Xã / Phường / Đặc khu *</label>
              <select required id="admin-modal-edit-ward" name="ward_code" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none">
                ${wards.map(w => `
                  <option value="${w.code}" ${w.code === currentWCode ? 'selected' : ''}>
                    ${w.name} (${w.type || 'Xã/Phường'} - Mã: ${w.code})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- 3. Địa chỉ chi tiết -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">3. Địa chỉ chi tiết (Số nhà, tên đường, khu phố, ấp...) *</label>
              <input required name="detailed_address" type="text" value="${sv.detailed_address || ''}" placeholder="Số nhà, tên đường, khu phố..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
            </div>

            ${sv.legacy_address ? `
              <div class="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                <span class="font-bold text-slate-700">Dữ liệu địa chỉ lưu trữ lịch sử:</span>
                <p class="italic text-slate-600 mt-0.5">${sv.legacy_address}</p>
              </div>
            ` : ''}
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onclick="window.app.closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition">
              Hủy
            </button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition shadow-sm flex items-center gap-1.5">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Lưu chuẩn hóa</span>
            </button>
          </div>
        </form>
      </div>
    `, 'max-w-xl');

    if (window.lucide) window.lucide.createIcons();
  },
  handleAdminModalProvinceChange(provCode) {
    const wardSelect = document.getElementById('admin-modal-edit-ward');
    if (wardSelect && window.SA?.Administrative) {
      const wards = window.SA.Administrative.getWardsByProvince(provCode);
      wardSelect.innerHTML = wards.length > 0
        ? wards.map((w, idx) => `<option value="${w.code}" ${idx === 0 ? 'selected' : ''}>${w.name} (${w.type || 'Xã/Phường'} - Mã: ${w.code})</option>`).join('')
        : '<option value="">-- Vui lòng chọn Tỉnh/Thành phố --</option>';
    }
  },
  saveAdminAddress(svId, form) {
    const fd = new FormData(form);
    const province_code = fd.get('province_code');
    const ward_code = fd.get('ward_code');
    const detailed_address = fd.get('detailed_address')?.trim();

    const adminSvc = window.SA?.Administrative;
    if (adminSvc) {
      if (!province_code || !adminSvc.getProvinceByCode(province_code)) {
        showToast('Tỉnh/Thành phố không hợp lệ theo QĐ 19/2025/QĐ-TTg.', 'error');
        return;
      }
      if (!ward_code || !adminSvc.isValidAdministrativePair(province_code, ward_code)) {
        showToast('Xã/Phường/Đặc khu không thuộc Tỉnh/Thành phố đã chọn.', 'error');
        return;
      }
      if (!detailed_address) {
        showToast('Vui lòng nhập địa chỉ chi tiết.', 'error');
        return;
      }
    }

    const res = store.updateStudentProfile(svId, {
      province_code,
      ward_code,
      detailed_address
    });

    if (res.ok) {
      window.app.closeModal();
      showToast('Đã lưu chuẩn hóa địa chỉ sinh viên thành công!', 'success');
      window.app.render();
    } else {
      showToast(res.message, 'error');
    }
  },
  approve(accId) {
    const acc = store.state.accounts.find(a => a.id === accId);
    if (acc) {
      acc.status = 'active';
      store.addAuditLog(store.state.currentUser.displayName, 'admin', 'DUYỆT TÀI KHOẢN', acc.username, 'Phê duyệt quyền Ban Tổ Chức');
      store.notify();
      showToast(`Đã phê duyệt tài khoản: ${acc.displayName || acc.username}`, 'success');
    }
  },
  toggleLock(accId) {
    const acc = store.state.accounts.find(a => a.id === accId);
    if (acc) {
      acc.status = acc.status === 'locked' ? 'active' : 'locked';
      store.addAuditLog(store.state.currentUser.displayName, 'admin', acc.status === 'locked' ? 'KHÓA TÀI KHOẢN' : 'MỞ KHÓA TÀI KHOẢN', acc.username, 'Thay đổi trạng thái tài khoản');
      store.notify();
      showToast(acc.status === 'locked' ? `Đã khóa tài khoản ${acc.username}` : `Đã mở khóa tài khoản ${acc.username}`, 'info');
    }
  }
};

window.SA.Views.Admin = { renderAdminView, initAdminCharts };
})();
