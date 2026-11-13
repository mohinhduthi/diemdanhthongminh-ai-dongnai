(function () {
  const store = window.SA.Store;
  const {
    showToast,
    openModal,
    closeModal,
    renderStatusBadge,
    renderEventStatusBadge,
    openCertificateModal
  } = window.SA.UI;

  let activeTab = 'events'; // events | monitor | ai_alerts | certificates
  let selectedEventId = 'EVT-01';
  let qrIntervalId = null;

  function renderOrganizerView(state) {
    const evt = state.events.find(e => e.id === selectedEventId) || state.events[0];
    const eventRegs = state.registrations.filter(r => r.eventId === (evt ? evt.id : ''));
    const aiAlertCount = state.registrations.filter(r => r.status === 'ai_review').length;
    const pendingAppeals = state.appeals.filter(a => a.status === 'pending').length;
    const pendingManualCount = (state.manualVerificationQueue || []).filter(q => q.status === 'pending').length;

    const tabs = [
      { id: 'events', label: 'Quản lý sự kiện & QR Động', icon: 'calendar-range' },
      { id: 'monitor', label: 'Giám sát điểm danh thời gian thực', icon: 'users' },
      { id: 'face_queue', label: 'Hàng Đợi Duyệt Face AI', icon: 'scan-face', badge: pendingManualCount },
      { id: 'ai_alerts', label: 'Cảnh báo AI & Xử lý Khiếu nại', icon: 'shield-alert', badge: aiAlertCount + pendingAppeals },
      { id: 'certificates', label: 'Cấp chứng nhận & Xuất báo cáo', icon: 'award' }
    ];

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">AI SMARTATTEND ĐỒNG NAI</h1>
            <p class="text-xs text-brand-700 font-semibold flex items-center gap-1.5 mt-0.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Điểm danh và cấp chứng nhận điện tử bằng AI – Cổng Ban Tổ Chức
            </p>
          </div>
        </div>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex flex-wrap gap-2">
            ${tabs.map(t => `
              <button onclick="window.orgUI.setTab('${t.id}')" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === t.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }">
                <i data-lucide="${t.icon}" class="w-4 h-4"></i>
                <span>${t.label}</span>
                ${t.badge ? `<span class="px-1.5 py-0.5 text-[11px] rounded-full ${activeTab === t.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}">${t.badge}</span>` : ''}
              </button>
            `).join('')}
          </div>
          <button onclick="window.orgUI.openCreateEventModal()" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition">
            <i data-lucide="plus-circle" class="w-4 h-4"></i> Tạo sự kiện mới
          </button>
        </div>

        ${activeTab === 'events' ? renderEventsTab(state, evt) : ''}
        ${activeTab === 'monitor' ? renderMonitorTab(state, evt, eventRegs) : ''}
        ${activeTab === 'face_queue' ? renderFaceQueueTab(state) : ''}
        ${activeTab === 'ai_alerts' ? renderAIAlertsTab(state) : ''}
        ${activeTab === 'certificates' ? renderCertificatesTab(state, evt, eventRegs) : ''}
      </div>
    `;
  }

  function renderEventsTab(state, currentEvt) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${state.events.map(evt => {
          const regs = state.registrations.filter(r => r.eventId === evt.id);
          const attended = regs.filter(r => r.checkInAt).length;
          const flagged = regs.filter(r => r.status === 'ai_review').length;

          return `
            <div class="bg-white rounded-2xl border ${evt.id === (currentEvt ? currentEvt.id : '') ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'} shadow-sm p-5 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="text-[11px] font-mono font-bold text-slate-500">${evt.id}</span>
                  <div class="flex items-center gap-1.5">
                    ${window.SA.FaceVerification ? window.SA.FaceVerification.renderModeBadge(evt.faceVerificationMode || 'QR_ONLY') : ''}
                    ${renderEventStatusBadge(evt.status)}
                  </div>
                </div>
                <h3 class="font-bold text-slate-900 text-sm mb-2">${evt.title}</h3>
                <p class="text-xs text-slate-500 mb-3">${evt.date} (${evt.startTime} - ${evt.endTime}) • ${evt.location}</p>

                <!-- Cấu hình Chế độ Face AI trực tiếp cho sự kiện -->
                <div class="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2">
                  <span class="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                    <i data-lucide="scan-face" class="w-3.5 h-3.5 text-brand-600"></i> Chế độ Face AI:
                  </span>
                  <select onchange="window.orgUI.changeEventFaceMode('${evt.id}', this.value)" class="text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-brand-500">
                    <option value="QR_ONLY" ${evt.faceVerificationMode === 'QR_ONLY' ? 'selected' : ''}>A. QR Only</option>
                    <option value="QR_OPTIONAL_FACE" ${evt.faceVerificationMode === 'QR_OPTIONAL_FACE' ? 'selected' : ''}>B. QR + Optional Face</option>
                    <option value="QR_REQUIRED_FACE" ${evt.faceVerificationMode === 'QR_REQUIRED_FACE' ? 'selected' : ''}>C. QR + Required Face</option>
                    <option value="QR_CONDITIONAL" ${evt.faceVerificationMode === 'QR_CONDITIONAL' ? 'selected' : ''}>D. QR + Conditional</option>
                  </select>
                </div>

                <div class="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span class="block text-slate-400 text-[10px]">Đăng ký</span>
                    <span class="font-bold text-slate-800">${regs.length}/${evt.capacity}</span>
                  </div>
                  <div>
                    <span class="block text-slate-400 text-[10px]">Tham gia</span>
                    <span class="font-bold text-emerald-600">${attended}</span>
                  </div>
                  <div>
                    <span class="block text-slate-400 text-[10px]">Cảnh báo AI</span>
                    <span class="font-bold ${flagged > 0 ? 'text-amber-600' : 'text-slate-600'}">${flagged}</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button onclick="window.orgUI.openDynamicQRModal('${evt.id}')" class="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
                  <i data-lucide="qr-code" class="w-4 h-4"></i> Chiếu QR Động (20s)
                </button>
                <button onclick="window.orgUI.inspectEvent('${evt.id}')" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
                  Giám sát
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderMonitorTab(state, evt, eventRegs) {
    if (!evt) return '<div class="p-8 text-center text-slate-500">Chưa có sự kiện nào.</div>';
    const registered = eventRegs.length;
    const checkedIn = eventRegs.filter(r => r.checkInAt).length;
    const eligible = eventRegs.filter(r => r.status === 'eligible' || r.status === 'certified').length;

    return `
      <div class="space-y-5">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex-1">
            <label class="text-xs font-bold text-slate-500 block mb-1">Đang giám sát sự kiện:</label>
            <select onchange="window.orgUI.selectEvent(this.value)" class="w-full sm:max-w-xl px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-800">
              ${state.events.map(e => `<option value="${e.id}" ${e.id === evt.id ? 'selected' : ''}>[${e.id}] ${e.title}</option>`).join('')}
            </select>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.orgUI.openManualCheckInModal('${evt.id}')" class="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition flex items-center gap-1.5">
              <i data-lucide="user-plus" class="w-4 h-4"></i> Điểm danh thủ công
            </button>
            <button onclick="window.orgUI.exportCSV('${evt.id}')" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5">
              <i data-lucide="download" class="w-4 h-4"></i> Xuất Excel (CSV)
            </button>
          </div>
        </div>

        <!-- 3 Thẻ thống kê giám sát -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-xs font-bold text-slate-400 uppercase">Tổng sinh viên đăng ký</span>
            <p class="text-2xl font-extrabold text-slate-800 mt-1">${registered}</p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-xs font-bold text-slate-400 uppercase">Đã Check-in vào</span>
            <p class="text-2xl font-extrabold text-emerald-600 mt-1">${checkedIn}</p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-xs font-bold text-slate-400 uppercase">Đủ điều kiện nhận chứng nhận</span>
            <p class="text-2xl font-extrabold text-brand-700 mt-1">${eligible}</p>
          </div>
        </div>

        <!-- Bảng danh sách sinh viên điểm danh -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-sm">Danh sách điểm danh thực tế</h3>
            <span class="text-xs text-slate-500">Tự động đồng bộ</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3">MSSV</th>
                  <th class="px-4 py-3">Họ và tên</th>
                  <th class="px-4 py-3">Trường</th>
                  <th class="px-4 py-3">Check-in</th>
                  <th class="px-4 py-3">Check-out</th>
                  <th class="px-4 py-3">Thời lượng</th>
                  <th class="px-4 py-3">Định vị GPS</th>
                  <th class="px-4 py-3">Đánh giá AI</th>
                  <th class="px-4 py-3">Trạng thái</th>
                  <th class="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${eventRegs.length === 0 ? `
                  <tr>
                    <td colspan="10" class="px-4 py-8 text-center text-slate-400">Chưa có sinh viên nào điểm danh cho hoạt động này.</td>
                  </tr>
                ` : eventRegs.map(r => {
                  const sv = state.students.find(s => s.id === r.studentId) || {
                    mssv: 'N/A',
                    fullName: 'Sinh viên',
                    universityName: 'Đồng Nai'
                  };
                  return `
                    <tr class="hover:bg-slate-50 transition">
                      <td class="px-4 py-3 font-mono font-bold text-brand-700">${sv.mssv}</td>
                      <td class="px-4 py-3 font-semibold text-slate-900">${sv.fullName}</td>
                      <td class="px-4 py-3 text-slate-600">${sv.universityName}</td>
                      <td class="px-4 py-3 font-mono">${r.checkInAt || '<span class="text-slate-300">—</span>'}</td>
                      <td class="px-4 py-3 font-mono">${r.checkOutAt || '<span class="text-slate-300">—</span>'}</td>
                      <td class="px-4 py-3 font-mono">${r.durationMinutes || 0}m</td>
                      <td class="px-4 py-3">${r.distanceMeters != null ? r.distanceMeters + 'm' : '—'}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex items-center gap-1 font-bold ${r.aiRiskLevel === 'HIGH' ? 'text-amber-600' : 'text-emerald-600'}">
                          ${r.aiScore || 5}/100 (${r.aiRiskLevel || 'LOW'})
                        </span>
                      </td>
                      <td class="px-4 py-3">${renderStatusBadge(r.status)}</td>
                      <td class="px-4 py-3 text-right space-x-1">
                        ${r.status === 'ai_review' ? `
                          <button onclick="window.orgUI.quickResolve('${r.id}', true)" class="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200" title="Chấp thuận điểm danh">Duyệt</button>
                          <button onclick="window.orgUI.quickResolve('${r.id}', false)" class="px-2 py-1 rounded bg-rose-100 text-rose-800 font-bold hover:bg-rose-200" title="Từ chối">Bác</button>
                        ` : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ========================================================
  // TAB HÀNG ĐỢI XÁC MINH FACE AI THỦ CÔNG (DỰ PHÒNG 0 ĐIỂM PHẠT)
  // ========================================================
  function renderFaceQueueTab(state) {
    const queue = state.manualVerificationQueue || [];
    const pendingList = queue.filter(q => q.status === 'pending');
    const resolvedList = queue.filter(q => q.status !== 'pending');

    return `
      <div class="space-y-6">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                PHƯƠNG ÁN DỰ PHÒNG 0 ĐIỂM PHẠT
              </span>
              <span class="text-xs text-slate-400">Mode C (Required Face) &amp; Mode D (Conditional)</span>
            </div>
            <h2 class="text-lg font-bold text-slate-900">Hàng Đợi Xác Minh Thủ Công Khuôn Mặt</h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Duyệt điểm danh tại chỗ cho sinh viên chưa đăng ký mẫu khuôn mặt hoặc camera máy bị lỗi – Đảm bảo quyền lợi công bằng cho sinh viên.
            </p>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 max-w-sm">
            <span class="font-bold text-slate-700 flex items-center gap-1 mb-0.5">
              <i data-lucide="eye-off" class="w-3.5 h-3.5 text-brand-600"></i> Zero Biometric Exposure
            </span>
            <p class="text-[11px] text-slate-500">
              Ban Tổ Chức chỉ xem xét thông tin sinh viên &amp; lý do, tuyệt đối không nhìn thấy ảnh chụp hay vector sinh trắc học cá nhân.
            </p>
          </div>
        </div>

        <!-- Danh sách yêu cầu đang chờ xử lý -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i data-lucide="clock" class="w-4 h-4 text-purple-600"></i>
              Yêu Cầu Đang Chờ Duyệt Tại Hội Trường (${pendingList.length})
            </h3>
          </div>

          ${pendingList.length === 0 ? `
            <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p class="text-xs text-slate-500">Không có yêu cầu xác minh thủ công nào đang chờ.</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Toàn bộ sinh viên đã hoàn thành xác thực tự động qua camera.</p>
            </div>
          ` : `
            <div class="space-y-3">
              ${pendingList.map(q => `
                <div class="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2.5">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div>
                      <strong class="text-slate-900 text-sm">${q.studentName}</strong> 
                      <span class="font-mono text-slate-600 font-bold">(${q.mssv})</span> • 
                      <span class="text-slate-600">${q.universityName || 'Đồng Nai'}</span>
                    </div>
                    <span class="text-slate-400 font-mono text-[11px]">${q.createdAt}</span>
                  </div>

                  <div class="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-slate-700">Sự kiện: ${q.eventTitle}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">${q.requestedMode || 'QR_REQUIRED_FACE'}</span>
                    </div>
                    <p class="text-slate-600 italic mt-1">
                      <strong>Lý do sinh viên yêu cầu:</strong> "${q.reason}"
                    </p>
                  </div>

                  <div class="flex justify-end gap-2 pt-1">
                    <button onclick="window.orgUI.resolveManualQueue('${q.id}', false)" class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
                      Từ chối
                    </button>
                    <button onclick="window.orgUI.resolveManualQueue('${q.id}', true)" class="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5">
                      <i data-lucide="check" class="w-3.5 h-3.5"></i>
                      <span>Chấp Thuận &amp; Hoàn Tất Điểm Danh</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Lịch sử đã xử lý -->
        ${resolvedList.length > 0 ? `
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 class="font-bold text-slate-900 text-sm">Lịch sử yêu cầu đã giải quyết (${resolvedList.length})</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 border-b uppercase text-[10px]">
                  <tr>
                    <th class="p-2.5">Thời gian</th>
                    <th class="p-2.5">Sinh viên</th>
                    <th class="p-2.5">Sự kiện</th>
                    <th class="p-2.5">Trạng thái</th>
                    <th class="p-2.5">Người xử lý</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${resolvedList.map(item => `
                    <tr>
                      <td class="p-2.5 font-mono text-[11px] text-slate-500">${item.resolvedAt || item.createdAt}</td>
                      <td class="p-2.5 font-semibold text-slate-800">${item.studentName} (${item.mssv})</td>
                      <td class="p-2.5 text-slate-600">${item.eventTitle}</td>
                      <td class="p-2.5">
                        <span class="px-2 py-0.5 rounded font-bold text-[10px] ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                          ${item.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                        </span>
                      </td>
                      <td class="p-2.5 text-slate-500">${item.resolver || 'Ban Tổ Chức'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderAIAlertsTab(state) {
    const alerts = state.registrations.filter(r => r.status === 'ai_review');
    const appeals = state.appeals.filter(a => a.status === 'pending');

    return `
      <div class="space-y-6">
        <div class="bg-white p-4 rounded-2xl border border-slate-200">
          <h2 class="text-lg font-bold text-slate-900">Trung Tâm Thẩm Định Cảnh Báo AI &amp; Xử Lý Giải Trình</h2>
          <p class="text-xs text-slate-500">Đảm bảo tính nhân văn và công bằng: AI chỉ đề xuất, Ban Tổ Chức ra quyết định cuối cùng.</p>
        </div>

        <!-- Hàng đợi giải trình của sinh viên -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i data-lucide="message-square" class="w-4 h-4 text-brand-600"></i>
              Đơn Giải Trình Chờ Xử Lý (${appeals.length})
            </h3>
          </div>

          ${appeals.length === 0 ? `
            <p class="text-xs text-slate-400 italic">Không có đơn giải trình nào đang chờ xử lý.</p>
          ` : `
            <div class="space-y-3">
              ${appeals.map(a => `
                <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div>
                      <strong class="text-slate-900">${a.studentName}</strong> (${a.mssv}) • <em>${a.eventTitle}</em>
                    </div>
                    <span class="text-slate-400 font-mono">${a.submittedAt}</span>
                  </div>
                  <p class="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                    <strong>Nội dung giải trình:</strong> "${a.reason}"
                  </p>
                  <div class="flex justify-end gap-2 pt-1">
                    <button onclick="window.orgUI.resolveAppealModal('${a.id}', false)" class="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs">Từ chối</button>
                    <button onclick="window.orgUI.resolveAppealModal('${a.id}', true)" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm">Chấp thuận &amp; Mở khóa</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Danh sách cảnh báo AI tự động -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-500"></i>
            Hồ sơ AI gắn cờ rủi ro cao (${alerts.length})
          </h3>

          ${alerts.length === 0 ? `
            <p class="text-xs text-slate-400 italic">Hiện tại không có trường hợp bất thường nào bị gắn cờ.</p>
          ` : `
            <div class="space-y-3">
              ${alerts.map(r => {
                const sv = state.students.find(s => s.id === r.studentId) || { fullName: 'Sinh viên', mssv: 'N/A' };
                const evt = state.events.find(e => e.id === r.eventId) || { title: 'Sự kiện' };
                return `
                  <div class="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p class="font-bold text-slate-900">${sv.fullName} (${sv.mssv}) - ${evt.title}</p>
                      <ul class="text-amber-800 list-disc list-inside mt-1 space-y-0.5">
                        ${(r.aiFlags || []).map(f => `<li>${f}</li>`).join('')}
                      </ul>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <button onclick="window.orgUI.quickResolve('${r.id}', true)" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Xác nhận hợp lệ</button>
                      <button onclick="window.orgUI.quickResolve('${r.id}', false)" class="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold">Loại bỏ</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  function renderCertificatesTab(state, evt, eventRegs) {
    if (!evt) return '<div class="p-8 text-center text-slate-500">Chưa có sự kiện nào.</div>';
    const eligibleRegs = eventRegs.filter(r => r.status === 'eligible');
    const certifiedRegs = eventRegs.filter(r => r.status === 'certified');

    return `
      <div class="space-y-5">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Phát Hành &amp; Quản Lý Chứng Nhận Điện Tử</h2>
            <p class="text-xs text-slate-500">Điểm danh và cấp chứng nhận điện tử bằng AI theo tiêu chuẩn Tỉnh Đoàn – Hội Sinh viên Tỉnh Đồng Nai</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.orgUI.issueBatch('${evt.id}')" class="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5">
              <i data-lucide="award" class="w-4 h-4"></i> Phê duyệt &amp; Cấp tự động (${eligibleRegs.length} SV đủ ĐK)
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 class="font-bold text-slate-900 text-sm">Danh sách chứng nhận đã cấp cho sự kiện (${certifiedRegs.length})</h3>

          ${certifiedRegs.length === 0 ? `
            <p class="text-xs text-slate-400 italic">Chưa có chứng nhận nào được cấp cho hoạt động này.</p>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${state.certificates.filter(c => c.eventId === evt.id || c.event_id === evt.id).map(cert => {
                const cId = cert.id || cert.certificate_code || cert.certificate_id;
                const isRevoked = Boolean(cert.isRevoked || cert.is_revoked || cert.status === 'revoked');
                return `
                <div class="p-4 rounded-xl border ${isRevoked ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200 bg-slate-50'} flex items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-brand-700 block">${cId}</span>
                      ${isRevoked ? '<span class="text-[10px] text-rose-700 bg-rose-100 font-bold px-1.5 py-0.5 rounded">Đã thu hồi</span>' : ''}
                    </div>
                    <p class="text-sm font-bold text-slate-900">${cert.studentName} (${cert.mssv})</p>
                    <p class="text-xs text-slate-500">Cấp ngày: ${cert.issuedDate || cert.issued_at}</p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button onclick="window.orgUI.previewCert('${cId}')" class="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs">Xem</button>
                    <button onclick="window.SA.UI.downloadCertificatePDF(window.appStore.state.certificates.find(c => c.id === '${cId}' || c.certificate_code === '${cId}' || c.certificate_id === '${cId}'))" class="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1" title="Tải PDF"><i data-lucide="download" class="w-3.5 h-3.5"></i> <span>PDF</span></button>
                    <button onclick="window.app.openPublicVerify('${cId}')" class="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs" title="Tra cứu">QR</button>
                  </div>
                </div>
              `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  window.orgUI = {
    setTab(t) {
      activeTab = t;
      window.app.render();
    },
    selectEvent(id) {
      selectedEventId = id;
      window.app.render();
    },
    inspectEvent(id) {
      selectedEventId = id;
      activeTab = 'monitor';
      window.app.render();
    },
    quickResolve(regId, isApprove) {
      const reg = store.state.registrations.find(r => r.id === regId);
      if (reg) {
        reg.status = isApprove ? 'eligible' : 'rejected';
        if (isApprove) reg.aiRiskLevel = 'LOW';
        store.notify();
        showToast(isApprove ? 'Đã xác nhận điểm danh hợp lệ!' : 'Đã loại bỏ bản ghi.', isApprove ? 'success' : 'info');
      }
    },
    resolveAppealModal(appealId, isApprove) {
      const note = prompt(`Nhập ghi chú ${isApprove ? 'chấp thuận' : 'từ chối'}:`, isApprove ? 'Hợp lệ theo xác nhận tại hội trường' : 'Không có căn cứ minh chứng');
      if (note != null) {
        store.resolveAppeal(appealId, isApprove, note, store.state.currentUser.displayName);
        showToast('Đã hoàn tất xử lý giải trình.', 'success');
      }
    },
    issueBatch(evtId) {
      const eligible = store.state.registrations.filter(r => r.eventId === evtId && r.status === 'eligible');
      if (eligible.length === 0) {
        showToast('Không có sinh viên nào ở trạng thái "Đủ điều kiện" để cấp.', 'info');
        return;
      }
      let count = 0;
      eligible.forEach(r => {
        const res = store.issueCertificate(r.id, store.state.currentUser.displayName);
        if (res.ok) count++;
      });
      showToast(`Đã cấp thành công ${count} chứng nhận điện tử kèm mã QR!`, 'success');
    },
    previewCert(certId) {
      const cert = store.state.certificates.find(c => 
        c.id === certId || c.certificate_id === certId || c.certificate_code === certId || c.verification_code === certId
      );
      if (cert) openCertificateModal(cert);
    },
    openDynamicQRModal(evtId) {
      const evt = store.state.events.find(e => e.id === evtId);
      if (!evt) return;
      if (qrIntervalId) clearInterval(qrIntervalId);

      let secondsLeft = 20;
      const renderQR = () => {
        // Dynamic Token có chu kỳ thực tế
        const windowIdx = Math.floor(Date.now() / 20000);
        const token = `SMARTATTEND:${evt.id}:${windowIdx}:SEC${evt.id}`;
        const qrEl = document.getElementById('dynamic-qr-box');
        const tokenEl = document.getElementById('dynamic-qr-token');
        if (qrEl && window.QRCode) {
          qrEl.innerHTML = '';
          new window.QRCode(qrEl, {
            text: token,
            width: 220,
            height: 220,
            colorDark: '#0369a1',
            colorLight: '#ffffff'
          });
        }
        if (tokenEl) tokenEl.textContent = token;
      };

      openModal(`
        <div class="p-6 text-center space-y-4">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> QR ĐỘNG CHỐNG GIAN LẬN
            </span>
            <button onclick="window.orgUI.closeQRModal()" class="p-1 text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>
          <h3 class="text-lg font-bold text-slate-900">${evt.title}</h3>
          <p class="text-xs text-slate-500">${evt.location}</p>
          <div class="flex justify-center py-2">
            <div id="dynamic-qr-box" class="p-4 bg-white border-4 border-brand-200 rounded-2xl shadow-inner inline-block"></div>
          </div>
          <div class="bg-brand-50 rounded-xl p-3 text-xs text-brand-900">
            <p>Mã Token chu kỳ hiện tại: <strong id="dynamic-qr-token" class="font-mono">...</strong></p>
            <p class="mt-1">Tự động xoay mã sau: <strong id="qr-countdown" class="text-brand-700 text-sm">${secondsLeft}s</strong> (Ngăn chụp ảnh gửi điểm danh hộ)</p>
          </div>
        </div>
      `, 'max-w-md');

      renderQR();
      qrIntervalId = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
          secondsLeft = 20;
          renderQR();
        }
        const cd = document.getElementById('qr-countdown');
        if (cd) cd.textContent = `${secondsLeft}s`;
        else clearInterval(qrIntervalId);
      }, 1000);
    },
    closeQRModal() {
      if (qrIntervalId) clearInterval(qrIntervalId);
      closeModal();
    },
    openManualCheckInModal(evtId) {
      const evt = store.state.events.find(e => e.id === evtId);
      openModal(`
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">Điểm danh thủ công dự phòng</h3>
            <button onclick="window.app.closeModal()" class="p-1 text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>
          <p class="text-xs text-slate-500">Áp dụng khi camera hoặc kết nối mạng của sinh viên gặp lỗi tại sự kiện: <strong>${evt ? evt.title : ''}</strong></p>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Mã số sinh viên (MSSV):</label>
            <input id="manual-mssv-input" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono" placeholder="Nhập MSSV (VD: 231150001)" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button onclick="window.app.closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Hủy</button>
            <button onclick="window.orgUI.submitManualCheckIn('${evtId}')" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold">Xác nhận điểm danh</button>
          </div>
        </div>
      `, 'max-w-md');
    },
    submitManualCheckIn(evtId) {
      const mssv = document.getElementById('manual-mssv-input')?.value?.trim();
      if (!mssv) {
        showToast('Vui lòng nhập MSSV.', 'warning');
        return;
      }
      let student = store.state.students.find(s => s.mssv === mssv);
      if (!student) {
        // Tạo hồ sơ sinh viên tạm nếu chưa có
        student = {
          id: 'SV-' + Date.now().toString(36).toUpperCase(),
          mssv,
          fullName: 'Sinh viên ' + mssv,
          universityName: 'Trường Đại học Lạc Hồng',
          deviceId: 'MANUAL_BTC'
        };
        store.state.students.push(student);
      }

      const res = store.submitAttendance({
        studentId: student.id,
        eventId: evtId,
        type: 'checkin',
        qrValid: true,
        gpsCoords: null,
        deviceId: 'MANUAL_ORGANIZER',
        faceVerified: false,
        isManualOverride: true
      });

      closeModal();
      showToast(`Đã điểm danh thủ công thành công cho sinh viên MSSV ${mssv}!`, 'success');
    },
    openCreateEventModal() {
      openModal(`
        <form id="create-event-form" class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">Tạo hoạt động Đoàn – Hội mới</h3>
            <button type="button" onclick="window.app.closeModal()" class="p-1 text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>
          <div class="space-y-3 text-sm">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Tên hoạt động *</label>
              <input required name="title" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300" placeholder="VD: Chiến dịch Tình nguyện Mùa hè xanh 2026" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Ngày tổ chức *</label>
                <input required name="date" type="date" value="2026-11-25" class="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Bán kính GPS (mét)</label>
                <input name="radiusMeters" type="number" value="300" class="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Địa điểm tổ chức *</label>
              <input required name="location" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300" placeholder="VD: Hội trường Trung tâm Văn hóa Tỉnh Đồng Nai" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Chế độ Xác thực Khuôn mặt AI (Face AI Mode) *</label>
              <select name="faceVerificationMode" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium">
                <option value="QR_ONLY">A. QR Only - Chỉ quét QR, không đòi hỏi khuôn mặt</option>
                <option value="QR_OPTIONAL_FACE" selected>B. QR + Optional Face - Tự nguyện xác thực để đạt 100/100 điểm tin cậy</option>
                <option value="QR_REQUIRED_FACE">C. QR + Required Face - Bắt buộc khuôn mặt 1:1 (Có phương án dự phòng duyệt thủ công)</option>
                <option value="QR_CONDITIONAL">D. QR + Conditional - Xác thực có điều kiện khi có cảnh báo AI</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="window.app.closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Hủy</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold">Tạo sự kiện &amp; Kích hoạt QR</button>
          </div>
        </form>
      `, 'max-w-lg');

      document.getElementById('create-event-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newEvt = {
          id: 'EVT-' + String(store.state.events.length + 1).padStart(2, '0'),
          title: fd.get('title'),
          organizer: store.state.currentUser.displayName || 'Tỉnh Đoàn Đồng Nai',
          category: 'Đoàn - Hội Đồng Nai',
          date: fd.get('date'),
          startTime: '08:00',
          endTime: '11:30',
          location: fd.get('location'),
          capacity: 250,
          minDurationMinutes: 60,
          status: 'ongoing',
          requiresCheckOut: true,
          faceVerificationMode: fd.get('faceVerificationMode') || 'QR_OPTIONAL_FACE',
          gps: { lat: 10.9574, lng: 106.8427, radiusMeters: parseInt(fd.get('radiusMeters') || 300, 10) }
        };
        store.state.events.unshift(newEvt);
        store.addAuditLog(store.state.currentUser.displayName, 'organizer', 'TẠO HOẠT ĐỘNG MỚI', newEvt.id, newEvt.title);
        store.notify();
        closeModal();
        showToast('Đã tạo hoạt động mới thành công!', 'success');
      });
    },
    changeEventFaceMode(evtId, mode) {
      store.updateEventFaceMode(evtId, mode);
      showToast(`Đã cập nhật sự kiện [${evtId}] sang chế độ: ${mode}`, 'success');
    },
    resolveManualQueue(queueId, approved) {
      const res = store.resolveManualVerification(
        queueId, 
        approved, 
        approved ? 'Ban Tổ Chức đã xác minh sinh viên trực tiếp tại hội trường' : 'Từ chối yêu cầu do không khớp thông tin'
      );
      if (res.ok) {
        showToast(
          approved ? 'Đã phê duyệt thủ công và hoàn tất điểm danh thành công!' : 'Đã từ chối yêu cầu.',
          approved ? 'success' : 'info'
        );
      }
    },
    exportCSV(evtId) {
      const evt = store.state.events.find(e => e.id === evtId);
      const regs = store.state.registrations.filter(r => r.eventId === evtId);
      let csv = '\uFEFFMSSV,Họ và tên,Trường,Check-in,Check-out,Thời lượng (phút),AI Risk Score,Trạng thái\n';
      regs.forEach(r => {
        const sv = store.state.students.find(s => s.id === r.studentId) || { mssv: 'N/A', fullName: 'SV', universityName: 'Đồng Nai' };
        csv += `"${sv.mssv}","${sv.fullName}","${sv.universityName}","${r.checkInAt || ''}","${r.checkOutAt || ''}",${r.durationMinutes || 0},${r.aiScore || 5},"${r.status}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bao_cao_diem_danh_${evt?.id || 'DongNai'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Đã xuất báo cáo Excel (.CSV UTF-8 Tiếng Việt) thành công!', 'success');
    }
  };

  window.SA.Views.Organizer = { renderOrganizerView };
})();
