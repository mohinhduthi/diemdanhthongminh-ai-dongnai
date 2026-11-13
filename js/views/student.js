(function () {
  'use strict';

  const store = window.SA.Store;
  const {
    showToast,
    openModal,
    closeModal,
    renderStatusBadge,
    renderEventStatusBadge,
    openCertificateModal
  } = window.SA.UI;
  const { evaluateCertificateEligibility } = window.SA.AI;

  let activeTab = 'overview'; // overview | register | attend | face | tracking | certificates
  let selectedEventForAttend = 'EVT-01';
  let qrVideoStream = null;
  let qrScannerRunning = false;
  let qrScanInterval = null;

  // Trạng thái cục bộ cho mô-đun AI Face Verification
  let faceActiveSubTab = 'overview'; // 'overview' | 'enroll' | 'verify' | 'history' | 'privacy'
  let faceStream = null;
  let faceFacingMode = 'user'; // 'user' (camera trước) | 'environment' (camera sau)
  let faceQualityInterval = null;
  let faceLivenessFrames = [];
  let faceSessionVerifiedEvent = null; // Ghi nhận sự kiện đã xác minh khuôn mặt trong phiên
  let lastFaceVerificationVerdict = null;

  function renderStudentView(state) {
    const user = state.currentUser;
    // Tìm sinh viên tương ứng hoặc tạo đối tượng hồ sơ sinh viên
    let sv = state.students.find(s => s.id === user.studentId || (user.mssv && s.mssv === user.mssv));
    if (!sv) {
      sv = {
        id: user.studentId || 'SV-CURRENT',
        mssv: user.mssv || '231150001',
        fullName: user.displayName || 'Sinh viên Đồng Nai',
        universityName: 'Trường Đại học Lạc Hồng',
        faculty: 'Công nghệ thông tin',
        major: 'Kỹ thuật phần mềm',
        deviceId: 'DEV-' + (user.username || 'USER').toUpperCase()
      };
    }

    const myRegs = state.registrations.filter(r => 
      r.studentId === sv.id || 
      (user.id && r.studentId === user.id) || 
      (user.studentId && r.studentId === user.studentId)
    );
    const myCerts = state.certificates.filter(c => 
      c.studentId === sv.id || 
      c.student_id === sv.id || 
      (user.id && (c.studentId === user.id || c.student_id === user.id || c.userId === user.id || c.user_id === user.id)) ||
      (user.studentId && (c.studentId === user.studentId || c.student_id === user.studentId)) ||
      (sv.mssv && (c.mssv === sv.mssv)) ||
      (user.mssv && (c.mssv === user.mssv))
    );
    const myAppeals = state.appeals.filter(a => a.studentId === sv.id || (user.id && a.studentId === user.id));
    const faceProfile = store.getFaceProfile(sv.id);

    const tabs = [
      { id: 'overview', label: 'Tổng quan cá nhân', icon: 'user-check' },
      { id: 'register', label: 'Đăng ký hoạt động', icon: 'calendar-plus' },
      { id: 'attend', label: 'Điểm danh Camera & QR Thực', icon: 'qr-code' },
      { 
        id: 'face', 
        label: 'AI Face Verification', 
        icon: 'scan-face', 
        badge: faceProfile ? 'Đã bật' : 'Chưa đăng ký' 
      },
      { id: 'tracking', label: 'Theo dõi kết quả', icon: 'activity', badge: myRegs.filter(r => r.status === 'ai_review').length },
      { id: 'certificates', label: 'Kho chứng nhận', icon: 'award', badge: myCerts.length }
    ];

    const html = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">AI SMARTATTEND ĐỒNG NAI</h1>
            <p class="text-xs text-brand-700 font-semibold flex items-center gap-1.5 mt-0.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Điểm danh và cấp chứng nhận điện tử bằng AI – Cổng Sinh viên
            </p>
          </div>
        </div>
        <!-- Sub-navigation Tabs -->
        <div class="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          ${tabs.map(t => `
            <button onclick="window.studentUI.setTab('${t.id}')" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === t.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }">
              <i data-lucide="${t.icon}" class="w-4 h-4"></i>
              <span>${t.label}</span>
              ${t.badge ? `<span class="px-1.5 py-0.5 text-[11px] rounded-full ${activeTab === t.id ? 'bg-white/20 text-white' : (t.badge === 'Đã bật' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}">${t.badge}</span>` : ''}
            </button>
          `).join('')}
        </div>

        ${activeTab === 'overview' ? renderOverview(sv, myRegs, myCerts, state.events) : ''}
        ${activeTab === 'register' ? renderRegister(sv, myRegs, state) : ''}
        ${activeTab === 'attend' ? renderAttend(sv, myRegs, state) : ''}
        ${activeTab === 'face' ? renderFace(sv, myRegs, state) : ''}
        ${activeTab === 'tracking' ? renderTracking(sv, myRegs, myAppeals, state.events) : ''}
        ${activeTab === 'certificates' ? renderCertificates(myCerts) : ''}
      </div>
    `;

    return html;
  }

  function renderOverview(sv, myRegs, myCerts, events) {
    const completedCount = myRegs.filter(r => r.checkInAt).length;
    const reviewCount = myRegs.filter(r => r.status === 'ai_review').length;
    const faceProfile = store.getFaceProfile(sv.id);

    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Hồ sơ sinh viên số -->
        <div class="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div class="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-4 mb-5">
              <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-extrabold border border-white/30">
                ${(sv.fullName || 'SV').split(' ').pop().charAt(0)}
              </div>
              <div>
                <span class="inline-block px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200 text-[11px] font-semibold border border-emerald-300/30 mb-1">Thẻ Sinh viên Số • Đã xác thực</span>
                <h2 class="text-xl font-bold">${sv.fullName}</h2>
                <p class="text-sm text-brand-100 font-mono">MSSV: ${sv.mssv}</p>
              </div>
            </div>

            <div class="space-y-2.5 text-sm border-t border-white/15 pt-4">
              <div class="flex justify-between gap-2">
                <span class="text-brand-200">Trường:</span>
                <span class="font-semibold text-right">${sv.universityName || 'ĐH/CĐ Đồng Nai'}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-brand-200">Khoa:</span>
                <span class="font-semibold text-right">${sv.faculty || 'Công nghệ'}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-brand-200">Ngành:</span>
                <span class="font-semibold text-right">${sv.major || 'Kỹ thuật'}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-brand-200">Địa chỉ (2026):</span>
                <span class="font-semibold text-right text-xs">
                  ${sv.detailed_address ? sv.detailed_address + ', ' : ''}${sv.ward_name || 'Phường Bửu Long'}, ${sv.province_name || 'Tỉnh Đồng Nai'}
                </span>
              </div>
              <div class="flex justify-between items-center gap-2">
                <span class="text-brand-200">Mã đơn vị HC:</span>
                <span class="font-mono text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-2 py-0.5 rounded font-bold">
                  [Tỉnh: ${sv.province_code || '75'} • Xã/Phường: ${sv.ward_code || '26176'}]
                </span>
              </div>
              <div class="flex justify-between items-center gap-2">
                <span class="text-brand-200">AI Face Verification:</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded ${faceProfile ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30' : 'bg-amber-400/20 text-amber-200 border border-amber-300/30'}">
                  ${faceProfile ? 'Đã kích hoạt' : 'Chưa đăng ký'}
                </span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-brand-200">Mã thiết bị:</span>
                <span class="font-mono text-xs bg-white/10 px-2 py-0.5 rounded">${sv.deviceId}</span>
              </div>
              <div class="pt-2 flex gap-2">
                <button onclick="window.studentUI.openEditProfileModal('${sv.id}')" class="flex-1 py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/30 shadow-sm">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  <span>Hồ sơ</span>
                </button>
                <button onclick="window.studentUI.setTab('face')" class="flex-1 py-2 px-3 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-emerald-300/40 shadow-sm">
                  <i data-lucide="scan-face" class="w-3.5 h-3.5"></i>
                  <span>Face AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2 Thẻ tóm tắt hoạt động -->
        <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span class="text-xs font-bold text-slate-400 uppercase">Hoạt động đã đăng ký</span>
              <p class="text-3xl font-extrabold text-brand-700 mt-2">${myRegs.length}</p>
            </div>
            <p class="text-[11px] text-slate-500 mt-2">Tổng số sự kiện tham gia</p>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span class="text-xs font-bold text-slate-400 uppercase">Điểm danh thành công</span>
              <p class="text-3xl font-extrabold text-emerald-600 mt-2">${completedCount}</p>
            </div>
            <p class="text-[11px] text-slate-500 mt-2">Đã hoàn thành check-in</p>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span class="text-xs font-bold text-slate-400 uppercase">Chứng nhận đã cấp</span>
              <p class="text-3xl font-extrabold text-brand-900 mt-2">${myCerts.length}</p>
            </div>
            <p class="text-[11px] text-slate-500 mt-2">Chứng nhận có mã QR xác thực</p>
          </div>

          ${reviewCount > 0 ? `
            <div class="sm:col-span-3 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                </div>
                <div>
                  <p class="text-xs font-bold text-amber-900">Có ${reviewCount} hoạt động cần xử lý giải trình với Ban Tổ Chức</p>
                  <p class="text-[11px] text-amber-700">AI phát hiện sai lệch vị trí hoặc trùng thiết bị. Bạn có thể gửi giải trình trực tiếp.</p>
                </div>
              </div>
              <button onclick="window.studentUI.setTab('tracking')" class="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition">
                Xem giải trình
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderRegister(sv, myRegs, state) {
    return `
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Danh sách hoạt động Đoàn – Hội Tỉnh Đồng Nai</h2>
            <p class="text-xs text-slate-500">Đăng ký tham gia để được điểm danh và cấp chứng nhận điện tử bằng AI chính quy</p>
          </div>
          <span class="text-xs font-semibold px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-100">
            Tổng cộng ${state.events.length} chương trình
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${state.events.map(evt => {
            const isReg = myRegs.some(r => r.eventId === evt.id);
            const count = state.registrations.filter(r => r.eventId === evt.id).length;
            const mode = evt.faceVerificationMode || 'QR_ONLY';
            return `
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <span class="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700">${evt.category}</span>
                    <div class="flex items-center gap-1.5">
                      ${window.SA.FaceVerification ? window.SA.FaceVerification.renderModeBadge(mode) : ''}
                      ${renderEventStatusBadge(evt.status)}
                    </div>
                  </div>
                  <h3 class="text-base font-bold text-slate-900 mb-1.5">${evt.title}</h3>
                  <p class="text-xs text-slate-600 line-clamp-2 mb-3">${evt.description}</p>

                  <div class="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div class="flex items-center gap-2"><i data-lucide="building-2" class="w-3.5 h-3.5 text-brand-600"></i> <strong>Đơn vị:</strong> ${evt.organizer}</div>
                    <div class="flex items-center gap-2"><i data-lucide="clock" class="w-3.5 h-3.5 text-brand-600"></i> <strong>Thời gian:</strong> ${evt.date} (${evt.startTime} - ${evt.endTime})</div>
                    <div class="flex items-center gap-2"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-brand-600"></i> <strong>Địa điểm:</strong> ${evt.location}</div>
                    <div class="flex items-center gap-2"><i data-lucide="users" class="w-3.5 h-3.5 text-brand-600"></i> <strong>Đã đăng ký:</strong> ${count}/${evt.capacity} sinh viên • Tối thiểu ${evt.minDurationMinutes} phút</div>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  ${isReg ? `
                    <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <i data-lucide="check-circle-2" class="w-4 h-4"></i> Đã đăng ký
                    </span>
                    <button onclick="window.studentUI.goAttend('${evt.id}')" class="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition">Điểm danh ngay</button>
                  ` : `
                    <span class="text-xs text-slate-400">${evt.status === 'completed' ? 'Đã kết thúc' : 'Còn chỗ'}</span>
                    <button ${evt.status === 'completed' ? 'disabled' : ''} onclick="window.studentUI.register('${evt.id}')" class="px-4 py-2 rounded-xl text-xs font-bold transition ${
                      evt.status === 'completed'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                    }">
                      Đăng ký tham gia
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ========================================================
  // RENDER ATTEND: TÍCH HỢP 4 CHẾ ĐỘ SỰ KIỆN (KHÔNG CHECKBOX)
  // ========================================================
  function renderAttend(sv, myRegs, state) {
    const activeEvents = state.events.filter(e => e.status === 'ongoing' || e.status === 'upcoming');
    const currentEvt = state.events.find(e => e.id === selectedEventForAttend) || activeEvents[0] || state.events[0];
    const currentReg = myRegs.find(r => r.eventId === currentEvt.id);
    const eventMode = currentEvt?.faceVerificationMode || 'QR_ONLY';
    const faceProfile = store.getFaceProfile(sv.id);
    const isFaceVerifiedThisSession = (faceSessionVerifiedEvent === currentEvt.id);

    return `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Cột trái: Camera Quét QR Thực + Tích hợp 4 chế độ xác minh -->
        <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="camera" class="w-5 h-5 text-brand-600"></i>
                Trạm Quét QR Điểm Danh &amp; Cảm Biến AI
              </h2>
              <p class="text-xs text-slate-500">Quét mã QR động của Ban Tổ Chức tại hội trường bằng Camera sau</p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> AI Guard Active
            </span>
          </div>

          <!-- Chọn sự kiện -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Hoạt động đang diễn ra:</label>
            <select id="attend-event-select" onchange="window.studentUI.selectAttendEvent(this.value)" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none">
              ${state.events.map(e => `<option value="${e.id}" ${e.id === currentEvt.id ? 'selected' : ''}>[${e.status === 'ongoing' ? 'ĐANG DIỄN RA' : e.status === 'upcoming' ? 'SẮP TỚI' : 'ĐÃ KẾT THÚC'}] ${e.title}</option>`).join('')}
            </select>
          </div>

          <!-- Camera Stream & Quét QR Thật -->
          <div class="space-y-3">
            <div class="relative bg-slate-900 rounded-2xl overflow-hidden min-h-[260px] flex flex-col items-center justify-center text-white border-2 border-slate-800">
              <video id="qr-video" class="w-full h-64 object-cover hidden" playsinline></video>
              <canvas id="qr-canvas" class="hidden"></canvas>

              <div id="camera-placeholder" class="text-center p-6 space-y-3">
                <div class="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-brand-400">
                  <i data-lucide="video" class="w-8 h-8"></i>
                </div>
                <div>
                  <p class="text-sm font-bold text-white">Camera Quét Mã QR</p>
                  <p class="text-xs text-slate-400 mt-1 max-w-sm">Mở camera sau của thiết bị để quét mã QR động được chiếu trên màn hình chính.</p>
                </div>
                <button onclick="window.studentUI.startRealCamera()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition inline-flex items-center gap-2">
                  <i data-lucide="camera" class="w-4 h-4"></i> Mở Camera Quét QR
                </button>
              </div>

              <div id="camera-overlay" class="absolute inset-0 border-2 border-brand-400/80 rounded-2xl pointer-events-none hidden flex items-center justify-center">
                <div class="w-48 h-48 border-2 border-brand-400 rounded-xl relative">
                  <div class="scanner-laser"></div>
                </div>
              </div>
            </div>

            <!-- Nút điều khiển camera khi đang mở -->
            <div id="camera-controls" class="hidden flex items-center justify-between bg-slate-100 p-2.5 rounded-xl text-xs">
              <span class="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Camera đang hoạt động, hướng vào mã QR
              </span>
              <button onclick="window.studentUI.stopRealCamera()" class="px-3 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold transition">
                Tắt Camera
              </button>
            </div>
          </div>

          <!-- KHU VỰC CẤU HÌNH 4 CHẾ ĐỘ XÁC THỰC SỰ KIỆN (THAY THẾ HOÀN TOÀN CHECKBOX CŨ) -->
          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <i data-lucide="shield" class="w-4 h-4 text-brand-600"></i>
                Quy Chế Xác Minh Của Sự Kiện Này
              </span>
              ${window.SA.FaceVerification ? window.SA.FaceVerification.renderModeBadge(eventMode) : ''}
            </div>

            ${eventMode === 'QR_ONLY' ? `
              <div class="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                <p class="font-bold text-slate-800 flex items-center gap-1.5">
                  <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i> Chế độ QR Đơn thuần (QR Only)
                </p>
                <p class="text-[11px] text-slate-500">
                  Sự kiện này chỉ yêu cầu quét mã QR động và xác thực tọa độ GPS. Không đòi hỏi xác thực khuôn mặt.
                </p>
              </div>
            ` : eventMode === 'QR_OPTIONAL_FACE' ? `
              <div class="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs space-y-2">
                <div class="flex items-center justify-between">
                  <p class="font-bold text-sky-900 flex items-center gap-1.5">
                    <i data-lucide="sparkles" class="w-4 h-4 text-sky-600"></i> QR + Tùy chọn Face AI (Optional)
                  </p>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isFaceVerifiedThisSession ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">
                    ${isFaceVerifiedThisSession ? 'Đã xác thực 1:1' : 'Chưa đối chiếu'}
                  </span>
                </div>
                <p class="text-[11px] text-sky-800 leading-relaxed">
                  Sinh viên có thể chủ động xác thực khuôn mặt để nâng điểm số tin cậy AI lên <strong>100/100</strong> và mở khóa cấp chứng nhận ngay lập tức.
                </p>
                <div class="pt-1 flex items-center justify-between">
                  <span class="text-[11px] text-slate-500">
                    ${faceProfile ? 'Đã có mẫu khuôn mặt AI' : 'Chưa đăng ký mẫu khuôn mặt'}
                  </span>
                  <button type="button" onclick="window.studentUI.setTab('face')" class="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition">
                    ${faceProfile ? 'Xác thực Face AI ngay' : 'Đăng ký mẫu Face AI'}
                  </button>
                </div>
              </div>
            ` : eventMode === 'QR_REQUIRED_FACE' ? `
              <div class="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-2.5">
                <div class="flex items-center justify-between">
                  <p class="font-bold text-purple-900 flex items-center gap-1.5">
                    <i data-lucide="shield-alert" class="w-4 h-4 text-purple-700"></i> Bắt buộc xác thực khuôn mặt AI 1:1
                  </p>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isFaceVerifiedThisSession ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-200 text-purple-900'}">
                    ${isFaceVerifiedThisSession ? 'Đã khớp khuôn mặt' : 'Bắt buộc'}
                  </span>
                </div>
                <p class="text-[11px] text-purple-800 leading-relaxed">
                  Sự kiện quan trọng đòi hỏi kiểm tra danh tính 1:1. Nếu bạn <strong>chưa kịp đăng ký khuôn mặt hoặc camera máy bị hỏng</strong>, bạn hoàn toàn có thể yêu cầu Ban Tổ Chức duyệt thủ công tại chỗ mà <strong>không bị trừ điểm hay gắn cờ gian lận</strong>.
                </p>
                <div class="pt-1 flex flex-wrap gap-2">
                  <button type="button" onclick="window.studentUI.setTab('face')" class="flex-1 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
                    <i data-lucide="scan-face" class="w-3.5 h-3.5"></i>
                    <span>${faceProfile ? 'Mở Xác Thực Face 1:1' : 'Đăng Ký Khuôn Mặt Nhanh'}</span>
                  </button>
                  <button type="button" onclick="window.studentUI.openManualRequestModal('${currentEvt.id}')" class="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-purple-800 border border-purple-300 text-xs font-bold transition flex items-center gap-1.5">
                    <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
                    <span>Yêu Cầu BTC Duyệt Thủ Công (0đ phạt)</span>
                  </button>
                </div>
              </div>
            ` : `
              <!-- QR_CONDITIONAL -->
              <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                <div class="flex items-center justify-between">
                  <p class="font-bold text-amber-900 flex items-center gap-1.5">
                    <i data-lucide="sliders" class="w-4 h-4 text-amber-700"></i> Xác thực có điều kiện (Conditional)
                  </p>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Kích hoạt khi có cảnh báo
                  </span>
                </div>
                <p class="text-[11px] text-amber-800 leading-relaxed">
                  Hệ thống cho phép điểm danh bằng QR bình thường. Chỉ khi phát hiện sai lệch vị trí GPS hoặc nghi vấn thiết bị, AI mới yêu cầu đối chiếu khuôn mặt để giải tỏa nghi vấn.
                </p>
                <div class="pt-1 flex items-center justify-between">
                  <span class="text-[11px] text-amber-900 font-medium">Trạng thái an toàn: Sẵn sàng</span>
                  <button type="button" onclick="window.studentUI.setTab('face')" class="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition">
                    Kiểm tra trạng thái Face AI
                  </button>
                </div>
              </div>
            `}
          </div>

          <!-- Nhập mã QR Token hoặc Quét trực tiếp -->
          <div class="space-y-3 pt-2 border-t border-slate-100">
            <label class="block text-xs font-bold text-slate-700">Mã Token điểm danh (Nhận dạng từ Camera hoặc nhập):</label>
            <div class="flex gap-2">
              <input id="qr-token-input" type="text" placeholder="Quét QR camera hoặc nhập mã token..." class="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              <button onclick="window.studentUI.submitWithRealSensors('checkin')" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5">
                <i data-lucide="log-in" class="w-4 h-4"></i> Check-in
              </button>
              <button onclick="window.studentUI.submitWithRealSensors('checkout')" class="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5">
                <i data-lucide="log-out" class="w-4 h-4"></i> Check-out
              </button>
            </div>
            <p class="text-[11px] text-slate-400">Hệ thống sẽ lấy tọa độ GPS thực của thiết bị (khi người dùng bấm cho phép) để đối chiếu bán kính hội trường.</p>
          </div>
        </div>

        <!-- Cột phải: Kết quả điểm danh & Phân tích AI -->
        <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 class="font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="shield-alert" class="w-5 h-5 text-brand-600"></i>
            Trạng thái &amp; Căn cứ Đánh giá AI
          </h3>

          ${!currentReg ? `
            <div class="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p class="text-sm text-slate-600 mb-2">Bạn chưa có dữ liệu điểm danh cho sự kiện này.</p>
              <p class="text-xs text-slate-400">Hãy hướng camera quét mã QR hoặc bấm nút Check-in để bắt đầu.</p>
            </div>
          ` : `
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span class="text-xs font-semibold text-slate-600">Trạng thái hiện tại:</span>
                ${renderStatusBadge(currentReg.status)}
              </div>

              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-slate-400 block mb-0.5">Giờ Check-in</span>
                  <span class="font-bold text-slate-800">${currentReg.checkInAt || 'Chưa có'}</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-slate-400 block mb-0.5">Giờ Check-out</span>
                  <span class="font-bold text-slate-800">${currentReg.checkOutAt || 'Chưa có'}</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-slate-400 block mb-0.5">Khoảng cách GPS thực</span>
                  <span class="font-bold text-slate-800">${currentReg.distanceMeters !== null && currentReg.distanceMeters !== undefined ? currentReg.distanceMeters + ' m' : 'Không có GPS'}</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-slate-400 block mb-0.5">Thời lượng tham dự</span>
                  <span class="font-bold text-slate-800">${currentReg.durationMinutes || 0} phút</span>
                </div>
              </div>

              <!-- AI Risk Meter -->
              <div class="p-4 rounded-xl border ${
                currentReg.aiRiskLevel === 'HIGH' ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200'
              }">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold ${currentReg.aiRiskLevel === 'HIGH' ? 'text-amber-900' : 'text-emerald-900'}">
                    Điểm số rủi ro AI: ${currentReg.aiScore || 5}/100
                  </span>
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    currentReg.aiRiskLevel === 'HIGH' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                  }">
                    ${currentReg.aiRiskLevel === 'HIGH' ? 'CẦN XÁC MINH' : 'HỢP LỆ'}
                  </span>
                </div>
                ${(currentReg.aiFlags && currentReg.aiFlags.length > 0) ? `
                  <ul class="text-xs text-amber-800 space-y-1 list-disc list-inside mb-3">
                    ${currentReg.aiFlags.map(f => `<li>${f}</li>`).join('')}
                  </ul>
                  <div class="flex gap-2">
                    <button onclick="window.studentUI.openAppealModal('${currentReg.eventId}')" class="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition">
                      Gửi giải trình lên BTC
                    </button>
                    ${currentEvt.faceVerificationMode === 'QR_CONDITIONAL' ? `
                      <button onclick="window.studentUI.setTab('face')" class="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition">
                        Mở Face AI Mở Khóa
                      </button>
                    ` : ''}
                  </div>
                ` : `
                  <p class="text-xs text-emerald-700">Dữ liệu điểm danh của bạn đã được AI thẩm định là hợp lệ và an toàn.</p>
                `}
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // ========================================================
  // MÔ-ĐUN AI FACE VERIFICATION ĐỘC LẬP (DEDICATED MODULE)
  // ========================================================
  function renderFace(sv, myRegs, state) {
    const profile = store.getFaceProfile(sv.id);
    const logs = store.getFaceLogsByStudent(sv.id);

    return `
      <div class="space-y-6">
        <!-- Header Mô-đun -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[11px] font-bold border border-brand-400/30 flex items-center gap-1">
                <i data-lucide="scan-face" class="w-3.5 h-3.5"></i> MÔ-ĐUN ĐỘC LẬP
              </span>
              <span class="text-xs text-slate-400">Chuẩn ISO/IEC 19794 • Quyền riêng tư số</span>
            </div>
            <h2 class="text-xl font-black tracking-tight text-white">AI FACE VERIFICATION &amp; BIOMETRICS</h2>
            <p class="text-xs text-slate-300 mt-1 max-w-2xl">
              Hệ thống xác thực khuôn mặt độc lập, tách biệt hoàn toàn với logic điểm danh QR. Bảo mật sinh trắc học với cơ chế chỉ lưu trữ vector đặc trưng 128D mã hóa băm salt (Không lưu ảnh chụp khuôn mặt).
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3.5 py-1.5 rounded-xl text-xs font-bold border ${profile ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border-amber-400/40'} flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full ${profile ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse"></span>
              ${profile ? 'Đã kích hoạt mẫu khuôn mặt' : 'Chưa đăng ký mẫu'}
            </span>
          </div>
        </div>

        <!-- Điều hướng các phân khu bên trong Mô-đun -->
        <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button onclick="window.studentUI.setFaceSubTab('overview')" class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${faceActiveSubTab === 'overview' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <i data-lucide="shield-check" class="w-4 h-4"></i> Trạng thái sinh trắc học
          </button>
          <button onclick="window.studentUI.setFaceSubTab('enroll')" class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${faceActiveSubTab === 'enroll' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <i data-lucide="user-plus" class="w-4 h-4"></i> ${profile ? 'Cập nhật mẫu khuôn mặt' : 'Đăng ký khuôn mặt AI'}
          </button>
          <button onclick="window.studentUI.setFaceSubTab('verify')" class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${faceActiveSubTab === 'verify' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <i data-lucide="scan-face" class="w-4 h-4"></i> Xác thực 1:1 độc lập
          </button>
          <button onclick="window.studentUI.setFaceSubTab('history')" class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${faceActiveSubTab === 'history' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <i data-lucide="history" class="w-4 h-4"></i> Lịch sử xác minh (${logs.length})
          </button>
          <button onclick="window.studentUI.setFaceSubTab('privacy')" class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${faceActiveSubTab === 'privacy' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
            <i data-lucide="lock" class="w-4 h-4"></i> Cài đặt quyền riêng tư
          </button>
        </div>

        <!-- 1. PHÂN KHU TỔNG QUAN TRẠNG THÁI SINH TRẮC HỌC -->
        ${faceActiveSubTab === 'overview' ? `
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Thẻ hồ sơ mẫu khuôn mặt -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase text-slate-400">Trạng thái hồ sơ</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${profile ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ${profile ? 'ACTIVE (Sẵn sàng)' : 'CHƯA ĐĂNG KÝ'}
                </span>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                  <i data-lucide="scan-face" class="w-8 h-8 text-brand-600"></i>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">${sv.fullName}</h3>
                  <p class="text-xs text-slate-500 font-mono">MSSV: ${sv.mssv}</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">${sv.universityName}</p>
                </div>
              </div>
              <div class="text-xs space-y-2 pt-3 border-t border-slate-100">
                <div class="flex justify-between">
                  <span class="text-slate-500">Mã băm an toàn:</span>
                  <span class="font-mono text-[10px] text-slate-700 font-bold truncate max-w-[170px]" title="${profile ? profile.templateHash : 'Chưa có'}">${profile ? profile.templateHash : 'Chưa tạo'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Kích thước mẫu vector:</span>
                  <span class="font-bold text-slate-700">${profile ? '128 Chiều (L2 Norm 1.0)' : '0'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Ngày đăng ký:</span>
                  <span class="text-slate-700">${profile ? profile.enrolledAt : 'Chưa đăng ký'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Quyền đồng ý (Consent):</span>
                  <span class="font-bold ${profile && profile.consentFaceAI ? 'text-emerald-700' : 'text-slate-400'}">
                    ${profile && profile.consentFaceAI ? 'Đã chấp thuận' : 'Chưa cấp'}
                  </span>
                </div>
              </div>
              <button onclick="window.studentUI.setFaceSubTab('verify')" class="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm">
                <i data-lucide="check-circle-2" class="w-4 h-4"></i> Thử nghiệm xác thực 1:1
              </button>
            </div>

            <!-- Cam kết bảo mật Zero Raw Photo -->
            <div class="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 class="font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="shield-check" class="w-5 h-5 text-emerald-600"></i>
                Cam kết Bảo mật &amp; Quyền Riêng tư Sinh trắc học SmartAttend
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p class="font-bold text-slate-900 flex items-center gap-1.5">
                    <i data-lucide="eye-off" class="w-4 h-4 text-brand-600"></i> Không lưu trữ ảnh gốc
                  </p>
                  <p class="text-slate-500 text-[11px] leading-relaxed">
                    Camera chỉ xử lý trên bộ nhớ tạm của trình duyệt. Không có bất kỳ bức ảnh hay video khuôn mặt nào được truyền lên máy chủ.
                  </p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p class="font-bold text-slate-900 flex items-center gap-1.5">
                    <i data-lucide="hash" class="w-4 h-4 text-brand-600"></i> Mã hóa vector 128 chiều
                  </p>
                  <p class="text-slate-500 text-[11px] leading-relaxed">
                    Đặc trưng khuôn mặt được chuyển đổi thành vector số học và mã hóa băm một chiều (Salted SHA-256). Không thể tái tạo lại ảnh từ vector.
                  </p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p class="font-bold text-slate-900 flex items-center gap-1.5">
                    <i data-lucide="user-check" class="w-4 h-4 text-brand-600"></i> Đối chiếu 1:1 có định danh
                  </p>
                  <p class="text-slate-500 text-[11px] leading-relaxed">
                    Hệ thống chỉ so khớp 1:1 với chính tài khoản của bạn. Không tìm kiếm tùy tiện trong toàn bộ cơ sở dữ liệu để dò danh tính.
                  </p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p class="font-bold text-slate-900 flex items-center gap-1.5">
                    <i data-lucide="trash-2" class="w-4 h-4 text-brand-600"></i> Quyền được lãng quên
                  </p>
                  <p class="text-slate-500 text-[11px] leading-relaxed">
                    Sinh viên có quyền thu hồi sự đồng ý hoặc yêu cầu xóa vĩnh viễn toàn bộ dữ liệu sinh trắc học bất cứ lúc nào trong mục Cài đặt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 2. PHÂN KHU ĐĂNG KÝ / CẬP NHẬT MẪU KHUÔN MẶT ĐỘC LẬP -->
        ${faceActiveSubTab === 'enroll' ? `
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Viewfinder Camera Đăng ký -->
            <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-bold text-slate-900 flex items-center gap-2">
                    <i data-lucide="camera" class="w-5 h-5 text-brand-600"></i>
                    ${profile ? 'Cập Nhật Lại Mẫu Khuôn Mặt AI' : 'Đăng Ký Mẫu Khuôn Mặt AI Lần Đầu'}
                  </h3>
                  <p class="text-xs text-slate-500">Giữ khuôn mặt thẳng, nằm gọn trong khung hình bầu dục và giữ yên</p>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" onclick="window.studentUI.flipFaceCamera()" class="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition" title="Đổi camera trước / sau">
                    <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <!-- Camera Viewport with Oval Guide Overlay -->
              <div class="relative bg-slate-900 rounded-2xl overflow-hidden min-h-[340px] flex items-center justify-center text-white border-2 border-slate-800">
                <video id="face-enroll-video" class="w-full h-80 object-cover hidden" playsinline muted></video>
                <canvas id="face-enroll-canvas" class="hidden"></canvas>

                <div id="face-enroll-placeholder" class="text-center p-6 space-y-3">
                  <div class="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-brand-400">
                    <i data-lucide="scan-face" class="w-8 h-8"></i>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-white">Camera Xác Thực Khuôn Mặt</p>
                    <p class="text-xs text-slate-400 mt-1 max-w-sm">Nhấn "Mở Camera Trước" để căn chỉnh khuôn mặt trong khung hình chuẩn.</p>
                  </div>
                  <button onclick="window.studentUI.startFaceCamera('enroll')" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition inline-flex items-center gap-2">
                    <i data-lucide="camera" class="w-4 h-4"></i> Mở Camera Trước
                  </button>
                </div>

                <!-- Khung Bầu Dục Căn Chỉnh (Oval Guide HUD) -->
                <div id="face-enroll-oval" class="face-guide-oval hidden"></div>
                <div id="face-enroll-radar" class="liveness-radar hidden"></div>
              </div>

              <!-- Thanh thước đo chất lượng hình ảnh trực tiếp (Live Quality HUD) -->
              <div id="face-quality-meters" class="hidden bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-700">Đánh giá chất lượng khung hình:</span>
                  <span id="face-status-text" class="font-bold text-slate-500">Đang quét...</span>
                </div>
                <div class="space-y-2">
                  <div>
                    <div class="flex justify-between text-[11px] mb-1">
                      <span class="text-slate-500">Độ sáng (Luminance):</span>
                      <span id="meter-brightness-text" class="font-mono font-bold text-slate-700">--</span>
                    </div>
                    <div class="face-meter-bar">
                      <div id="meter-brightness-fill" class="face-meter-fill bg-brand-500" style="width: 0%;"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-[11px] mb-1">
                      <span class="text-slate-500">Độ sắc nét (Sharpness / Anti-blur):</span>
                      <span id="meter-sharpness-text" class="font-mono font-bold text-slate-700">--</span>
                    </div>
                    <div class="face-meter-bar">
                      <div id="meter-sharpness-fill" class="face-meter-fill bg-emerald-500" style="width: 0%;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Nút điều khiển -->
              <div class="flex items-center justify-between gap-3 pt-2">
                <button type="button" onclick="window.studentUI.stopFaceCamera()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
                  Tắt Camera
                </button>
                <button id="btn-capture-enroll" onclick="window.studentUI.captureAndEnrollFace()" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2">
                  <i data-lucide="check" class="w-4 h-4"></i> Chụp &amp; Tạo Mẫu Khuôn Mặt AI
                </button>
              </div>
            </div>

            <!-- Điều khoản đồng ý rõ ràng (Consent Opt-in) -->
            <div class="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 class="font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="file-check-2" class="w-5 h-5 text-brand-600"></i>
                Thỏa Thuận Đồng Ý Sử Dụng Sinh Trắc Học
              </h3>
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-3 leading-relaxed">
                <p>
                  Nhằm nâng cao tính minh bạch, hạn chế gian lận điểm danh hộ và hỗ trợ cấp chứng nhận điện tử tự động, hệ thống SmartAttend AI ứng dụng mô hình trích xuất đặc trưng khuôn mặt 128D chuẩn hóa.
                </p>
                <div class="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 font-medium">
                  <div class="flex items-center gap-2 text-emerald-800">
                    <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i> Hoàn toàn tự nguyện đăng ký trước sự kiện.
                  </div>
                  <div class="flex items-center gap-2 text-emerald-800">
                    <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i> Không lưu trữ hình ảnh gốc dưới bất kỳ hình thức nào.
                  </div>
                  <div class="flex items-center gap-2 text-emerald-800">
                    <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i> Có thể thu hồi sự đồng ý hoặc xóa dữ liệu bất kỳ lúc nào.
                  </div>
                </div>
                <label class="flex items-start gap-2 pt-2 cursor-pointer">
                  <input type="checkbox" id="enroll-consent-checkbox" checked class="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span class="text-[11px] text-slate-700 font-semibold select-none">
                    Tôi đã đọc, hiểu rõ mục đích sử dụng và đồng ý để hệ thống AI SmartAttend trích xuất mẫu vector sinh trắc học phục vụ đối chiếu điểm danh.
                  </span>
                </label>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 3. PHÂN KHU XÁC THỰC KHUÔN MẶT 1:1 ĐỘC LẬP (STANDALONE VERIFICATION) -->
        ${faceActiveSubTab === 'verify' ? `
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-bold text-slate-900 flex items-center gap-2">
                    <i data-lucide="scan-face" class="w-5 h-5 text-brand-600"></i>
                    Xác Thực 1:1 Với Tài Khoản Đang Đăng Nhập
                  </h3>
                  <p class="text-xs text-slate-500">Đối chiếu trực tiếp với mẫu đã đăng ký của: <strong>${sv.fullName} (${sv.mssv})</strong></p>
                </div>
                <button type="button" onclick="window.studentUI.flipFaceCamera()" class="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition" title="Đổi camera">
                  <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                </button>
              </div>

              <!-- Viewport Live Verification -->
              <div class="relative bg-slate-900 rounded-2xl overflow-hidden min-h-[340px] flex items-center justify-center text-white border-2 border-slate-800">
                <video id="face-verify-video" class="w-full h-80 object-cover hidden" playsinline muted></video>
                <canvas id="face-verify-canvas" class="hidden"></canvas>

                <div id="face-verify-placeholder" class="text-center p-6 space-y-3">
                  <div class="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-brand-400">
                    <i data-lucide="camera" class="w-8 h-8"></i>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-white">Bắt đầu Xác thực Khuôn mặt 1:1</p>
                    <p class="text-xs text-slate-400 mt-1 max-w-sm">Hệ thống sẽ đối chiếu với mẫu sinh trắc học đã lưu của chính bạn.</p>
                  </div>
                  ${profile ? `
                    <button onclick="window.studentUI.startFaceCamera('verify')" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition inline-flex items-center gap-2">
                      <i data-lucide="scan-face" class="w-4 h-4"></i> Mở Camera Xác Thực 1:1
                    </button>
                  ` : `
                    <p class="text-xs text-amber-400 font-semibold">Bạn chưa có mẫu khuôn mặt trong hệ thống.</p>
                    <button onclick="window.studentUI.setFaceSubTab('enroll')" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition">
                      Đăng ký mẫu khuôn mặt trước
                    </button>
                  `}
                </div>

                <div id="face-verify-oval" class="face-guide-oval hidden"></div>
                <div id="face-verify-radar" class="liveness-radar hidden"></div>
              </div>

              <!-- Liveness & Cosine Similarity Real-time Meters -->
              <div id="face-verify-hud" class="hidden bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-700">Kiểm tra người thật (Anti-spoofing):</span>
                  <span id="verify-liveness-badge" class="px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-700">Đang quét</span>
                </div>
                <div>
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-slate-500">Độ tương đồng Cosine Similarity (Ngưỡng đạt: $\ge$ 85%):</span>
                    <span id="verify-similarity-text" class="font-mono font-bold text-slate-800">0%</span>
                  </div>
                  <div class="face-meter-bar">
                    <div id="verify-similarity-fill" class="face-meter-fill bg-brand-600" style="width: 0%;"></div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between gap-3 pt-2">
                <button type="button" onclick="window.studentUI.stopFaceCamera()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
                  Tắt Camera
                </button>
                <button id="btn-execute-verify" ${!profile ? 'disabled' : ''} onclick="window.studentUI.executeFaceVerification()" class="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed">
                  <i data-lucide="shield-check" class="w-4 h-4"></i> Tiến Hành Xác Thực 1:1
                </button>
              </div>
            </div>

            <!-- Kết quả đối chiếu & Phân loại lỗi -->
            <div class="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 class="font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="clipboard-check" class="w-5 h-5 text-brand-600"></i>
                Kết Quả Xác Minh Gần Nhất
              </h3>

              ${lastFaceVerificationVerdict ? `
                <div class="p-5 rounded-2xl border ${
                  lastFaceVerificationVerdict.result === 'SUCCESS' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
                  lastFaceVerificationVerdict.result === 'BORDERLINE' ? 'bg-amber-50 border-amber-300 text-amber-900' :
                  'bg-rose-50 border-rose-300 text-rose-900'
                } space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold uppercase tracking-wide">
                      ${lastFaceVerificationVerdict.result === 'SUCCESS' ? 'XÁC THỰC THÀNH CÔNG' : lastFaceVerificationVerdict.result === 'BORDERLINE' ? 'CẦN KIỂM TRA BỔ SUNG' : 'XÁC THỰC THẤT BẠI'}
                    </span>
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      lastFaceVerificationVerdict.result === 'SUCCESS' ? 'bg-emerald-200 text-emerald-950' :
                      lastFaceVerificationVerdict.result === 'BORDERLINE' ? 'bg-amber-200 text-amber-950' :
                      'bg-rose-200 text-rose-950'
                    }">
                      Khớp: ${Math.round(lastFaceVerificationVerdict.similarityScore * 100)}%
                    </span>
                  </div>
                  <p class="text-xs leading-relaxed">
                    ${lastFaceVerificationVerdict.verdict}
                  </p>
                  ${lastFaceVerificationVerdict.suggestion ? `
                    <div class="text-[11px] p-2.5 rounded-xl bg-white/70 border border-current space-y-1">
                      <strong>Gợi ý khắc phục:</strong>
                      <p>${lastFaceVerificationVerdict.suggestion}</p>
                    </div>
                  ` : ''}
                  ${lastFaceVerificationVerdict.result === 'SUCCESS' ? `
                    <div class="pt-2">
                      <button onclick="window.studentUI.setTab('attend')" class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm">
                        Chuyển sang Quét QR để hoàn tất điểm danh
                      </button>
                    </div>
                  ` : ''}
                </div>
              ` : `
                <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <i data-lucide="scan" class="w-10 h-10 text-slate-300 mx-auto"></i>
                  <p class="text-xs text-slate-500">Chưa có kết quả xác minh trong phiên làm việc này.</p>
                  <p class="text-[11px] text-slate-400">Nhấn "Mở Camera Xác Thực 1:1" để bắt đầu đối chiếu mẫu khuôn mặt.</p>
                </div>
              `}
            </div>
          </div>
        ` : ''}

        <!-- 4. PHÂN KHU LỊCH SỬ XÁC THỰC (AUDIT TRAIL) -->
        ${faceActiveSubTab === 'history' ? `
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900">Nhật Ký Xác Thực Sinh Trắc Học Cá Nhân</h3>
                <p class="text-xs text-slate-500">Minh bạch hóa mọi lần thử nghiệm, đăng ký và đối chiếu khuôn mặt</p>
              </div>
              <span class="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                ${logs.length} bản ghi
              </span>
            </div>

            ${logs.length === 0 ? `
              <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p class="text-xs text-slate-500">Chưa có nhật ký xác thực sinh trắc học nào.</p>
              </div>
            ` : `
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th class="p-3">Thời gian</th>
                      <th class="p-3">Hành động</th>
                      <th class="p-3">Độ khớp Cosine</th>
                      <th class="p-3">Kiểm tra người thật</th>
                      <th class="p-3">Kết quả</th>
                      <th class="p-3">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${logs.map(log => `
                      <tr class="hover:bg-slate-50/80">
                        <td class="p-3 font-mono text-[11px] text-slate-500">${log.timestamp}</td>
                        <td class="p-3 font-bold text-slate-800">${log.action}</td>
                        <td class="p-3 font-mono font-bold ${log.similarityScore >= 0.85 ? 'text-emerald-600' : 'text-slate-700'}">
                          ${log.similarityScore ? Math.round(log.similarityScore * 100) + '%' : '--'}
                        </td>
                        <td class="p-3">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${log.livenessPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
                            ${log.livenessPassed ? 'Đạt' : 'Không áp dụng'}
                          </span>
                        </td>
                        <td class="p-3">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.result === 'SUCCESS' || log.result === 'ENROLLED' ? 'bg-emerald-100 text-emerald-800' :
                            log.result === 'CONSENT_REVOKED' || log.result === 'DATA_DELETED' ? 'bg-slate-100 text-slate-700' :
                            'bg-rose-100 text-rose-800'
                          }">
                            ${log.result}
                          </span>
                        </td>
                        <td class="p-3 text-slate-600">${log.verdict || log.eventTitle || '--'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        ` : ''}

        <!-- 5. PHÂN KHU CÀI ĐẶT QUYỀN RIÊNG TƯ (PRIVACY SETTINGS) -->
        ${faceActiveSubTab === 'privacy' ? `
          <div class="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 class="font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="lock" class="w-5 h-5 text-brand-600"></i>
                Cài Đặt Quyền Riêng Tư &amp; Dữ Liệu Sinh Trắc Học
              </h3>
              <p class="text-xs text-slate-500 mt-1">
                Bạn hoàn toàn làm chủ dữ liệu của mình. Bạn có thể thu hồi sự đồng ý hoặc xóa vĩnh viễn mẫu khuôn mặt bất cứ lúc nào.
              </p>
            </div>

            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <h4 class="font-bold text-slate-800 text-sm">Thu hồi sự đồng ý (Revoke Consent)</h4>
                  <p class="text-xs text-slate-500 mt-0.5">Tạm dừng tính năng xác thực khuôn mặt nhưng vẫn giữ lại mẫu để kích hoạt lại sau nếu muốn.</p>
                </div>
                <button onclick="window.studentUI.revokeConsentConfirm()" class="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition shrink-0">
                  Thu hồi đồng ý
                </button>
              </div>

              <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
                <div>
                  <h4 class="font-bold text-rose-900 text-sm">Xóa toàn bộ dữ liệu khuôn mặt (Right to be Forgotten)</h4>
                  <p class="text-xs text-rose-700 mt-0.5">Xóa vĩnh viễn vector 128 chiều và mã băm sinh trắc học khỏi hệ thống. Thao tác không thể hoàn tác.</p>
                </div>
                <button onclick="window.studentUI.deleteBiometricDataConfirm()" class="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shrink-0 shadow-sm">
                  Xóa vĩnh viễn
                </button>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderTracking(sv, myRegs, myAppeals, events) {
    return `
      <div class="space-y-4">
        <div class="bg-white p-4 rounded-2xl border border-slate-200">
          <h2 class="text-lg font-bold text-slate-900">Theo dõi tiến độ &amp; Trạng thái giải trình</h2>
          <p class="text-xs text-slate-500">Minh bạch hóa toàn bộ quy trình từ đăng ký, điểm danh đến thẩm định</p>
        </div>

        <div class="space-y-4">
          ${myRegs.length === 0 ? `
            <div class="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p class="text-slate-500 text-sm">Chưa có hoạt động nào được ghi nhận.</p>
            </div>
          ` : myRegs.map(r => {
            const evt = events.find(e => e.id === r.eventId);
            if (!evt) return '';
            const appeal = myAppeals.find(a => a.eventId === r.eventId);

            return `
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm sm:text-base">${evt.title}</h3>
                    <p class="text-xs text-slate-500">${evt.date} • ${evt.location}</p>
                  </div>
                  <div>${renderStatusBadge(r.status)}</div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                  <div><span class="text-slate-400 block">Check-in</span><strong>${r.checkInAt || 'Chưa có'}</strong></div>
                  <div><span class="text-slate-400 block">Check-out</span><strong>${r.checkOutAt || 'Chưa có'}</strong></div>
                  <div><span class="text-slate-400 block">Thời lượng</span><strong>${r.durationMinutes || 0} phút</strong></div>
                  <div><span class="text-slate-400 block">Đánh giá AI</span><strong class="${r.aiRiskLevel === 'HIGH' ? 'text-amber-600' : 'text-emerald-600'}">${r.aiRiskLevel === 'HIGH' ? 'Cảnh báo' : 'Hợp lệ'}</strong></div>
                </div>

                ${appeal ? `
                  <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                    <div class="flex items-center justify-between font-bold">
                      <span class="text-slate-700">Đơn giải trình (${appeal.id}):</span>
                      <span class="px-2 py-0.5 rounded text-[10px] ${
                        appeal.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        appeal.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }">${appeal.status === 'approved' ? 'Đã chấp thuận' : appeal.status === 'rejected' ? 'Đã từ chối' : 'Đang chờ duyệt'}</span>
                    </div>
                    <p class="text-slate-600 italic">"${appeal.reason}"</p>
                    ${appeal.resolutionNote ? `<p class="text-brand-800 font-semibold pt-1">Phản hồi của BTC: ${appeal.resolutionNote}</p>` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderCertificates(myCerts) {
    return `
      <div class="space-y-4">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Kho Chứng Nhận Điện Tử Chính Quy</h2>
            <p class="text-xs text-slate-500">Hệ thống điểm danh và cấp chứng nhận điện tử bằng AI – Mỗi chứng nhận tích hợp mã xác thực duy nhất, QR đối soát công khai và mã băm SHA-256 chống làm giả</p>
          </div>
          <span class="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            Tổng cộng: ${myCerts.length} chứng nhận
          </span>
        </div>

        ${myCerts.length === 0 ? `
          <div class="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <i data-lucide="award" class="w-10 h-10 text-slate-300 mx-auto"></i>
            <p class="text-slate-600 font-semibold text-sm">Bạn chưa có chứng nhận nào trong tài khoản.</p>
            <p class="text-xs text-slate-400">Tham gia các hoạt động Đoàn – Hội, hoàn tất điểm danh Check-in &amp; Check-out đúng quy định để nhận chứng nhận điện tử tự động.</p>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${myCerts.map(cert => {
              const isRevoked = Boolean(cert.isRevoked || cert.is_revoked || cert.status === 'revoked');
              const cId = cert.id || cert.certificate_code || cert.certificate_id;
              return `
              <div class="bg-white rounded-2xl border ${isRevoked ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200'} shadow-sm p-5 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-xs font-mono font-bold ${isRevoked ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-brand-700 bg-brand-50 border border-brand-200'} px-2.5 py-0.5 rounded-full">${cId}</span>
                    ${isRevoked ? `
                      <span class="text-xs text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <i data-lucide="alert-octagon" class="w-3.5 h-3.5"></i> Đã thu hồi
                      </span>
                    ` : `
                      <span class="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <i data-lucide="badge-check" class="w-3.5 h-3.5"></i> Hợp lệ
                      </span>
                    `}
                  </div>
                  <h3 class="font-bold text-slate-900 text-sm mb-1">${cert.eventTitle || cert.certificate_name}</h3>
                  <p class="text-xs text-slate-500 mb-3">${cert.organizer || 'Tỉnh Đoàn Đồng Nai'}</p>

                  <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div><span class="text-slate-400">Người nhận:</span> <strong>${cert.studentName || 'Sinh viên'}</strong> (${cert.mssv || 'N/A'})</div>
                    <div><span class="text-slate-400">Ngày cấp:</span> <strong>${cert.issuedDate || cert.issued_at}</strong></div>
                    <div><span class="text-slate-400">Người ký:</span> <strong>${cert.signerName || 'Bùi Quốc Tuấn'}</strong></div>
                    <div class="truncate font-mono text-[10px] text-slate-500">Hash: ${cert.digitalHash}</div>
                    ${isRevoked ? `<div class="text-rose-700 font-medium">Lý do thu hồi: ${cert.revokedReason || 'Vi phạm'}</div>` : ''}
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button onclick="window.studentUI.viewCert('${cId}')" class="flex-1 min-w-[120px] py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
                    <i data-lucide="award" class="w-4 h-4"></i> Xem chứng nhận
                  </button>
                  <button onclick="window.studentUI.downloadCertPDF('${cId}')" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1" title="Tải PDF">
                    <i data-lucide="download" class="w-4 h-4"></i> Tải PDF
                  </button>
                  <button onclick="window.app.openPublicVerify('${cId}')" class="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1" title="Xác thực công khai qua QR">
                    <i data-lucide="shield-check" class="w-4 h-4"></i> QR
                  </button>
                </div>
              </div>
            `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  // ========================================================
  // XỬ LÝ CAMERA QR CODE CHO TAB ĐIỂM DANH
  // ========================================================
  function startCameraScanner() {
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    const placeholder = document.getElementById('camera-placeholder');
    const overlay = document.getElementById('camera-overlay');
    const controls = document.getElementById('camera-controls');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Trình duyệt không hỗ trợ truy cập Camera trực tiếp.', 'error');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        qrVideoStream = stream;
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        video.play();
        video.classList.remove('hidden');
        placeholder.classList.add('hidden');
        overlay.classList.remove('hidden');
        controls.classList.remove('hidden');
        qrScannerRunning = true;

        const ctx = canvas.getContext('2d');
        qrScanInterval = setInterval(() => {
          if (!qrScannerRunning || video.readyState !== video.HAVE_ENOUGH_DATA) return;
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          if (window.jsQR) {
            const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });
            if (code && code.data) {
              const tokenInput = document.getElementById('qr-token-input');
              if (tokenInput) tokenInput.value = code.data;
              showToast('Đã quét được mã QR thành công!', 'success');
              stopCameraScanner();
            }
          }
        }, 300);
      })
      .catch(err => {
        showToast('Không thể mở Camera: ' + err.message, 'warning');
      });
  }

  function stopCameraScanner() {
    qrScannerRunning = false;
    if (qrScanInterval) {
      clearInterval(qrScanInterval);
      qrScanInterval = null;
    }
    if (qrVideoStream) {
      qrVideoStream.getTracks().forEach(track => track.stop());
      qrVideoStream = null;
    }
    const video = document.getElementById('qr-video');
    const placeholder = document.getElementById('camera-placeholder');
    const overlay = document.getElementById('camera-overlay');
    const controls = document.getElementById('camera-controls');
    if (video) video.classList.add('hidden');
    if (placeholder) placeholder.classList.remove('hidden');
    if (overlay) overlay.classList.add('hidden');
    if (controls) controls.classList.add('hidden');
  }

  // ========================================================
  // XỬ LÝ CAMERA VÀ COMPUTER VISION CHO FACE VERIFICATION
  // ========================================================
  async function startFaceCameraStream(purpose = 'enroll') {
    const videoId = purpose === 'enroll' ? 'face-enroll-video' : 'face-verify-video';
    const placeholderId = purpose === 'enroll' ? 'face-enroll-placeholder' : 'face-verify-placeholder';
    const ovalId = purpose === 'enroll' ? 'face-enroll-oval' : 'face-verify-oval';
    const radarId = purpose === 'enroll' ? 'face-enroll-radar' : 'face-verify-radar';
    const hudId = purpose === 'enroll' ? 'face-quality-meters' : 'face-verify-hud';

    const video = document.getElementById(videoId);
    const placeholder = document.getElementById(placeholderId);
    const oval = document.getElementById(ovalId);
    const radar = document.getElementById(radarId);
    const hud = document.getElementById(hudId);

    if (!video) return;

    try {
      const camMgr = window.SA.FaceVerification.CameraManager;
      await camMgr.startCamera(video, faceFacingMode);
      faceStream = camMgr.currentStream;

      video.classList.remove('hidden');
      if (placeholder) placeholder.classList.add('hidden');
      if (oval) oval.classList.remove('hidden');
      if (radar) radar.classList.remove('hidden');
      if (hud) hud.classList.remove('hidden');

      // Vòng lặp phân tích chất lượng khung hình thời gian thực (250ms)
      if (faceQualityInterval) clearInterval(faceQualityInterval);
      faceLivenessFrames = [];

      faceQualityInterval = setInterval(() => {
        if (!faceStream || video.readyState < 2) return;
        const cv = window.SA.FaceVerification.CV;
        const q = cv.analyzeFrameQuality(video);

        if (purpose === 'enroll') {
          updateEnrollQualityHUD(q, oval);
        } else {
          updateVerifyQualityHUD(video, cv, q, oval);
        }
      }, 250);

    } catch (err) {
      console.error('[FaceCamera] startFaceCameraStream error:', err);
      showToast(err.message || 'Không thể mở camera thiết bị', 'error');
    }
  }

  function updateEnrollQualityHUD(q, oval) {
    const statusText = document.getElementById('face-status-text');
    const bFill = document.getElementById('meter-brightness-fill');
    const bText = document.getElementById('meter-brightness-text');
    const sFill = document.getElementById('meter-sharpness-fill');
    const sText = document.getElementById('meter-sharpness-text');

    if (bFill && bText) {
      const bPct = Math.min(100, Math.round((q.metrics.brightness / 255) * 100));
      bFill.style.width = bPct + '%';
      bText.textContent = `${q.metrics.brightness}/255 ${q.metrics.isLightingOk ? '(Chuẩn)' : '(Kém)'}`;
      bFill.className = `face-meter-fill ${q.metrics.isLightingOk ? 'bg-emerald-500' : 'bg-amber-500'}`;
    }

    if (sFill && sText) {
      const sPct = Math.min(100, Math.round((q.metrics.sharpness / 30) * 100));
      sFill.style.width = sPct + '%';
      sText.textContent = `${q.metrics.sharpness} ${q.metrics.isSharpnessOk ? '(Rõ nét)' : '(Bị mờ)'}`;
      sFill.className = `face-meter-fill ${q.metrics.isSharpnessOk ? 'bg-emerald-500' : 'bg-rose-500'}`;
    }

    if (statusText) {
      statusText.textContent = q.message;
      statusText.className = `font-bold ${q.valid ? 'text-emerald-600' : 'text-amber-600'}`;
    }

    if (oval) {
      oval.className = `face-guide-oval ${q.valid ? 'ready' : q.metrics.faceDetected ? 'warning' : 'danger'}`;
    }
  }

  function updateVerifyQualityHUD(video, cv, q, oval) {
    const livenessBadge = document.getElementById('verify-liveness-badge');
    const simFill = document.getElementById('verify-similarity-fill');
    const simText = document.getElementById('verify-similarity-text');

    // Đánh giá Liveness thời gian thực
    const liveness = cv.evaluateLiveness(video, faceLivenessFrames);
    if (liveness.currentFrameBuffer) {
      faceLivenessFrames.push(liveness.currentFrameBuffer);
      if (faceLivenessFrames.length > 5) faceLivenessFrames.shift();
    }

    if (livenessBadge) {
      livenessBadge.textContent = liveness.passed ? 'Người thật (Live OK)' : 'Đang phân tích vân/chuyển động...';
      livenessBadge.className = `px-2 py-0.5 rounded font-bold text-[10px] ${liveness.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`;
    }

    // Ước tính độ tương đồng nhanh với mẫu đã lưu
    const svId = store.state.currentUser.studentId || store.state.currentUser.id;
    const profile = store.getFaceProfile(svId);
    if (profile && profile.embedding && q.metrics.faceDetected) {
      const candidateEmbedding = cv.extractFaceEmbedding(video);
      const sim = cv.computeCosineSimilarity(candidateEmbedding, profile.embedding);
      const simPct = Math.max(0, Math.min(100, Math.round(sim * 100)));

      if (simFill && simText) {
        simFill.style.width = simPct + '%';
        simText.textContent = `${simPct}%`;
        simFill.className = `face-meter-fill ${sim >= 0.85 ? 'bg-emerald-500' : sim >= 0.72 ? 'bg-amber-500' : 'bg-rose-500'}`;
      }

      if (oval) {
        oval.className = `face-guide-oval ${sim >= 0.85 ? 'ready' : sim >= 0.72 ? 'warning' : 'danger'}`;
      }
    }
  }

  function stopFaceCameraStream() {
    if (faceQualityInterval) {
      clearInterval(faceQualityInterval);
      faceQualityInterval = null;
    }
    window.SA.FaceVerification.CameraManager.stopCurrentTracks();
    faceStream = null;
    faceLivenessFrames = [];

    ['face-enroll-video', 'face-verify-video'].forEach(id => {
      const v = document.getElementById(id);
      if (v) v.classList.add('hidden');
    });
    ['face-enroll-placeholder', 'face-verify-placeholder'].forEach(id => {
      const p = document.getElementById(id);
      if (p) p.classList.remove('hidden');
    });
    ['face-enroll-oval', 'face-verify-oval', 'face-enroll-radar', 'face-verify-radar', 'face-quality-meters', 'face-verify-hud'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  }

  // ========================================================
  // WINDOW.STUDENTUI PUBLIC INTERACTION API
  // ========================================================
  window.studentUI = {
    setTab(t) {
      stopCameraScanner();
      stopFaceCameraStream();
      activeTab = t;
      window.app.render();
    },
    setFaceSubTab(st) {
      stopFaceCameraStream();
      faceActiveSubTab = st;
      window.app.render();
    },
    selectAttendEvent(id) {
      selectedEventForAttend = id;
      window.app.render();
    },
    goAttend(id) {
      selectedEventForAttend = id;
      activeTab = 'attend';
      window.app.render();
    },
    register(evtId) {
      const svId = store.state.currentUser.studentId || store.state.currentUser.id;
      const res = store.registerEvent(svId, evtId);
      showToast(res.message, res.ok ? 'success' : 'warning');
    },

    // Camera QR Code
    startRealCamera() {
      startCameraScanner();
    },
    stopRealCamera() {
      stopCameraScanner();
    },

    // Camera Face Verification
    startFaceCamera(purpose = 'enroll') {
      startFaceCameraStream(purpose);
    },
    stopFaceCamera() {
      stopFaceCameraStream();
    },
    flipFaceCamera() {
      faceFacingMode = (faceFacingMode === 'user' ? 'environment' : 'user');
      stopFaceCameraStream();
      startFaceCameraStream(faceActiveSubTab === 'enroll' ? 'enroll' : 'verify');
    },

    // Chụp & Đăng ký khuôn mặt AI
    async captureAndEnrollFace() {
      const consentCb = document.getElementById('enroll-consent-checkbox');
      if (consentCb && !consentCb.checked) {
        showToast('Vui lòng tích chọn đồng ý thỏa thuận sinh trắc học trước khi tiếp tục.', 'warning');
        return;
      }

      const video = document.getElementById('face-enroll-video');
      if (!video || !faceStream) {
        showToast('Vui lòng mở camera trước khi chụp.', 'warning');
        return;
      }

      const cv = window.SA.FaceVerification.CV;
      const quality = cv.analyzeFrameQuality(video);
      if (!quality.valid) {
        showToast(quality.message, 'warning');
        return;
      }

      const user = store.state.currentUser;
      const svId = user.studentId || user.id;
      const sv = store.state.students.find(s => s.id === svId) || {
        fullName: user.displayName || 'Sinh viên Đồng Nai',
        mssv: user.mssv || '231150001'
      };

      // Trích xuất vector 128D chuẩn hóa
      const embedding = cv.extractFaceEmbedding(video);
      const hash = await window.SA.FaceVerification.ProfileManager.generateTemplateHash(svId, embedding);

      const saveRes = store.saveFaceProfile({
        studentId: svId,
        mssv: sv.mssv,
        fullName: sv.fullName,
        embedding,
        templateHash: hash,
        qualityScore: Math.round((quality.metrics.brightness + quality.metrics.sharpness * 3) / 2)
      });

      stopFaceCameraStream();
      showToast(`🎉 Đăng ký khuôn mặt AI thành công! Mã băm: ${hash.substring(0, 18)}...`, 'success');
      faceActiveSubTab = 'overview';
      window.app.render();
    },

    // Xác thực 1:1 độc lập
    async executeFaceVerification() {
      const video = document.getElementById('face-verify-video');
      if (!video || !faceStream) {
        showToast('Vui lòng mở camera để đối chiếu khuôn mặt.', 'warning');
        return;
      }

      const cv = window.SA.FaceVerification.CV;
      const user = store.state.currentUser;
      const svId = user.studentId || user.id;
      const profile = store.getFaceProfile(svId);

      if (!profile || !profile.embedding) {
        showToast('Tài khoản chưa có mẫu khuôn mặt AI. Vui lòng chuyển sang tab Đăng ký trước.', 'error');
        return;
      }

      // Kiểm tra chất lượng hình ảnh
      const quality = cv.analyzeFrameQuality(video);
      if (!quality.metrics.faceDetected) {
        lastFaceVerificationVerdict = {
          result: 'FAILED',
          errorCode: 'NO_FACE_DETECTED',
          similarityScore: 0,
          verdict: 'Không phát hiện khuôn mặt trong khung hình.',
          suggestion: 'Hãy tháo khẩu trang, kính râm và đưa mặt vào giữa khung bầu dục.'
        };
        showToast(lastFaceVerificationVerdict.verdict, 'error');
        window.app.render();
        return;
      }

      // Kiểm tra liveness / anti-spoofing
      const liveness = cv.evaluateLiveness(video, faceLivenessFrames);
      if (!liveness.passed) {
        lastFaceVerificationVerdict = {
          result: 'FAILED',
          errorCode: 'LIVENESS_FAILED',
          similarityScore: 0.35,
          verdict: 'Không vượt qua kiểm tra người thật (Anti-spoofing phát hiện nghi vấn ảnh in/màn hình).',
          suggestion: 'Vui lòng chớp mắt tự nhiên hoặc nghiêng nhẹ đầu.'
        };
        showToast(lastFaceVerificationVerdict.verdict, 'error');
        window.app.render();
        return;
      }

      // Trích xuất vector ứng viên & Tính Cosine Similarity
      const candidateEmbedding = cv.extractFaceEmbedding(video);
      const similarity = cv.computeCosineSimilarity(candidateEmbedding, profile.embedding);

      let resultStatus = 'FAILED';
      let verdictMessage = '';
      let suggestion = null;

      if (similarity >= window.SA.FaceVerification.THRESHOLDS.MATCH_SUCCESS) {
        resultStatus = 'SUCCESS';
        verdictMessage = `Xác thực thành công 1:1! Khuôn mặt khớp tuyệt đối với hồ sơ của ${profile.fullName} (Độ tương đồng: ${Math.round(similarity * 100)}%).`;
        faceSessionVerifiedEvent = selectedEventForAttend;
        showToast(verdictMessage, 'success');
      } else if (similarity >= window.SA.FaceVerification.THRESHOLDS.MANUAL_REVIEW) {
        resultStatus = 'BORDERLINE';
        verdictMessage = `Độ tương đồng đạt ${Math.round(similarity * 100)}% (Mức trung gian). Đề xuất kiểm tra trực tiếp hoặc thực hiện lại trong điều kiện ánh sáng tốt hơn.`;
        suggestion = 'Di chuyển ra khu vực đủ sáng, giữ yên máy và tháo phụ kiện che mặt.';
        showToast(verdictMessage, 'warning');
      } else {
        resultStatus = 'FAILED';
        verdictMessage = `Khuôn mặt không khớp với mẫu đăng ký của tài khoản ${profile.fullName} (Độ tương đồng chỉ đạt ${Math.round(similarity * 100)}% < 85%).`;
        suggestion = 'Đảm bảo bạn đang đăng nhập đúng tài khoản sinh viên của mình.';
        showToast(verdictMessage, 'error');
      }

      lastFaceVerificationVerdict = {
        result: resultStatus,
        similarityScore: similarity,
        verdict: verdictMessage,
        suggestion
      };

      // Ghi nhật ký vào Store
      store.addFaceVerificationLog({
        studentId: svId,
        studentName: profile.fullName,
        mssv: profile.mssv,
        action: 'VERIFY_1TO1',
        eventId: selectedEventForAttend,
        eventTitle: 'Xác thực khuôn mặt độc lập',
        similarityScore: similarity,
        livenessPassed: liveness.passed,
        result: resultStatus,
        verdict: verdictMessage,
        deviceId: store.state.currentUser.username || 'DEVICE_REAL'
      });

      stopFaceCameraStream();
      window.app.render();
    },

    // Thu hồi quyền đồng ý
    revokeConsentConfirm() {
      const svId = store.state.currentUser.studentId || store.state.currentUser.id;
      const res = store.revokeFaceConsent(svId);
      showToast(res.message, 'info');
      window.app.render();
    },

    // Xóa vĩnh viễn dữ liệu sinh trắc học (Right to be Forgotten)
    deleteBiometricDataConfirm() {
      openModal(`
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3 text-rose-600">
            <div class="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
              <i data-lucide="trash-2" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">Xác nhận xóa vĩnh viễn dữ liệu sinh trắc học</h3>
              <p class="text-xs text-slate-500">Quyền được lãng quên (Right to be Forgotten) – ISO/IEC 19794</p>
            </div>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Hành động này sẽ xóa hoàn toàn vector đặc trưng 128 chiều và mã băm khuôn mặt của bạn khỏi cơ sở dữ liệu. Sau khi xóa, bạn sẽ cần đăng ký lại nếu muốn sử dụng tính năng Face AI.
          </p>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button onclick="window.app.closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Hủy</button>
            <button onclick="window.studentUI.executeDeleteBiometrics()" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">Xác nhận xóa ngay</button>
          </div>
        </div>
      `, 'max-w-md');
    },

    executeDeleteBiometrics() {
      const svId = store.state.currentUser.studentId || store.state.currentUser.id;
      store.deleteFaceProfile(svId);
      closeModal();
      showToast('Đã xóa vĩnh viễn toàn bộ dữ liệu khuôn mặt theo yêu cầu.', 'success');
      faceActiveSubTab = 'overview';
      window.app.render();
    },

    // Phương án dự phòng cho Mode C & D: Yêu cầu BTC duyệt thủ công không trừ điểm
    openManualRequestModal(eventId) {
      const evt = store.state.events.find(e => e.id === eventId);
      openModal(`
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="user-check" class="w-5 h-5 text-purple-600"></i>
              Yêu Cầu Ban Tổ Chức Xác Minh Thủ Công (Dự Phòng)
            </h3>
            <button onclick="window.app.closeModal()" class="p-1 text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Sự kiện <strong>${evt ? evt.title : ''}</strong> áp dụng phương án dự phòng <strong>0 điểm phạt</strong> dành cho sinh viên chưa kịp đăng ký mẫu khuôn mặt hoặc camera máy gặp sự cố.
          </p>
          <div class="space-y-2 text-xs">
            <label class="block font-bold text-slate-700">Lý do yêu cầu hỗ trợ trực tiếp:</label>
            <select id="manual-reason-select" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs">
              <option value="Sinh viên chưa đăng ký mẫu khuôn mặt trước sự kiện">Chưa đăng ký mẫu khuôn mặt trước sự kiện</option>
              <option value="Camera thiết bị bị hỏng hoặc trình duyệt không mở được camera">Camera thiết bị bị hỏng / không mở được camera</option>
              <option value="Ánh sáng hội trường bị chói hoặc ngược sáng không đối chiếu được">Ánh sáng hội trường bị chói / ngược sáng</option>
              <option value="Đã ký tên trực tiếp vào danh sách dự phòng của Ban Tổ Chức">Đã ký tên trực tiếp vào danh sách dự phòng tại cửa hội trường</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button onclick="window.app.closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Hủy</button>
            <button onclick="window.studentUI.submitManualReviewRequest('${eventId}')" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold">
              Gửi yêu cầu tới Ban Tổ Chức
            </button>
          </div>
        </div>
      `, 'max-w-lg');
    },

    submitManualReviewRequest(eventId) {
      const select = document.getElementById('manual-reason-select');
      const reason = select ? select.value : 'Yêu cầu Ban Tổ Chức hỗ trợ thủ công tại chỗ';
      const user = store.state.currentUser;
      const svId = user.studentId || user.id;

      const res = store.requestManualVerification({
        eventId,
        studentId: svId,
        studentName: user.displayName,
        mssv: user.mssv,
        reason
      });

      closeModal();
      showToast('Đã gửi yêu cầu xác minh tới hàng đợi của Ban Tổ Chức. Cán bộ sẽ hỗ trợ bạn ngay tại hội trường!', 'success');
      window.app.render();
    },

    // Điểm danh cảm biến thực
    submitWithRealSensors(type) {
      const svId = store.state.currentUser.studentId || store.state.currentUser.id;
      const tokenInput = document.getElementById('qr-token-input')?.value?.trim();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            this.executeAttendance(svId, type, tokenInput, coords);
          },
          err => {
            console.warn('Geolocation denied or unavailable', err);
            this.executeAttendance(svId, type, tokenInput, null);
          },
          { timeout: 6000 }
        );
      } else {
        this.executeAttendance(svId, type, tokenInput, null);
      }
    },

    executeAttendance(studentId, type, token, coords) {
      const currentEvt = store.state.events.find(e => e.id === selectedEventForAttend);
      const isVerified = (faceSessionVerifiedEvent === selectedEventForAttend);

      const res = store.submitAttendance({
        studentId,
        eventId: selectedEventForAttend,
        type,
        qrValid: Boolean(token),
        gpsCoords: coords,
        deviceId: store.state.currentUser.username || 'DEVICE_REAL',
        faceVerified: isVerified
      });

      if (!res.ok) {
        showToast(res.message, 'error');
        return;
      }

      if (res.registration.status === 'pending_face_or_manual') {
        showToast('Sự kiện yêu cầu Face AI. Bạn có thể mở tab Face AI để xác thực, hoặc bấm [Yêu cầu BTC Duyệt Thủ Công (0đ phạt)].', 'warning');
      } else if (res.aiEvaluation.riskLevel === 'HIGH') {
        showToast(`AI Cảnh báo rủi ro (${res.aiEvaluation.score}/100): Hồ sơ chuyển sang chế độ Thẩm tra / Giải trình!`, 'warning');
      } else if (res.registration.status === 'certified' && (res.certificate || res.registration.certificateId)) {
        const certId = (res.certificate && res.certificate.id) || res.registration.certificateId;
        showToast(`🎉 Chúc mừng bạn đã hoàn thành hoạt động! Giấy chứng nhận điện tử [${certId}] đã được cấp tự động.`, 'success');
      } else if (res.registration.status === 'pending_approval') {
        showToast(`Điểm danh thành công! Sự kiện yêu cầu Ban Tổ Chức phê duyệt trước khi cấp chứng nhận chính thức.`, 'info');
      } else {
        showToast(`${type === 'checkin' ? 'Check-in' : 'Check-out'} thành công! AI Score: ${res.aiEvaluation.score}/100 (Hợp lệ)`, 'success');
      }
    },

    viewCert(certId) {
      const cert = store.state.certificates.find(c => 
        c.id === certId || c.certificate_id === certId || c.certificate_code === certId || c.verification_code === certId
      );
      if (cert) openCertificateModal(cert);
    },
    downloadCertPDF(certId) {
      const cert = store.state.certificates.find(c => 
        c.id === certId || c.certificate_id === certId || c.certificate_code === certId || c.verification_code === certId
      );
      if (cert) {
        window.SA.UI.downloadCertificatePDF(cert);
      } else {
        showToast('Không tìm thấy thông tin chứng nhận để tải PDF', 'error');
      }
    },
    openAppealModal(eventId) {
      openModal(`
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">Gửi giải trình điểm danh lên Ban Tổ Chức</h3>
            <button onclick="window.app.closeModal()" class="p-1 text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>
          <p class="text-xs text-slate-500">
            Hệ thống AI chỉ đóng vai trò phân tích hỗ trợ. Quyết định cuối cùng thuộc về Ban Tổ Chức để bảo vệ quyền lợi sinh viên.
          </p>
          <textarea id="appeal-reason-input" rows="4" class="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="Nhập lý do chi tiết (VD: Định vị GPS bị che khuất trong hội trường, camera máy gặp sự cố, đã ký tên vào danh sách dự phòng...)"></textarea>
          <div class="flex justify-end gap-2">
            <button onclick="window.app.closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Hủy</button>
            <button onclick="window.studentUI.submitAppeal('${eventId}')" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold">Gửi giải trình</button>
          </div>
        </div>
      `, 'max-w-lg');
    },
    submitAppeal(eventId) {
      const reason = document.getElementById('appeal-reason-input')?.value?.trim();
      if (!reason) {
        showToast('Vui lòng nhập lý do giải trình.', 'warning');
        return;
      }
      const svId = store.state.currentUser.studentId || store.state.currentUser.id;
      const res = store.submitAppeal({
        studentId: svId,
        eventId,
        reason
      });

      closeModal();
      showToast(res.message, 'success');
      activeTab = 'tracking';
      window.app.render();
    },
    openEditProfileModal(studentId) {
      const sv = store.state.students.find(s => s.id === studentId);
      if (!sv) return;

      const adminSvc = window.SA?.Administrative;
      const provinces = adminSvc ? adminSvc.getProvinces() : [];
      const currentProv = sv.province_code || '75';
      const wards = adminSvc ? adminSvc.getWardsByProvince(currentProv) : [];

      openModal(`
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <div>
              <h3 class="text-lg font-bold text-slate-900">Cập nhật Hồ sơ Sinh viên Số</h3>
              <p class="text-xs text-brand-700 font-semibold">Chuẩn hóa địa giới hành chính theo QĐ 19/2025/QĐ-TTg của Thủ tướng Chính phủ</p>
            </div>
            <button type="button" onclick="window.app.closeModal()" class="p-1 text-slate-400 hover:text-slate-600">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="edit-profile-form" onsubmit="event.preventDefault(); window.studentUI.saveProfile('${studentId}', this);" class="space-y-4 text-xs">
            <div class="space-y-1">
              <label class="block font-bold text-slate-700">Họ và tên sinh viên:</label>
              <input type="text" name="fullName" value="${sv.fullName || ''}" required class="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block font-bold text-slate-700">Mã số sinh viên (MSSV):</label>
                <input type="text" value="${sv.mssv || ''}" disabled class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-mono" />
              </div>
              <div class="space-y-1">
                <label class="block font-bold text-slate-700">Trường Đại học / Cao đẳng:</label>
                <input type="text" value="${sv.universityName || ''}" disabled class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs truncate" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block font-bold text-slate-700">Email:</label>
                <input type="email" name="email" value="${sv.email || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>
              <div class="space-y-1">
                <label class="block font-bold text-slate-700">Số điện thoại:</label>
                <input type="text" name="phone" value="${sv.phone || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>
            </div>

            <div class="p-3.5 bg-brand-50/60 rounded-xl border border-brand-200 space-y-3">
              <div class="flex items-center gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-brand-600"></i>
                <span class="font-bold text-brand-900 text-xs">Địa chỉ thường trú 2 cấp (Không dùng cấp Huyện/Thị xã cũ)</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="block font-bold text-slate-700">Tỉnh / Thành phố:</label>
                  <select id="modal-edit-province" name="province_code" onchange="window.studentUI.handleModalProvinceChange(this.value)" class="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white font-medium">
                    ${provinces.map(p => `<option value="${p.code}" ${p.code === currentProv ? 'selected' : ''}>${p.name} (Mã: ${p.code})</option>`).join('')}
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="block font-bold text-slate-700">Xã / Phường / Đặc khu:</label>
                  <select id="modal-edit-ward" name="ward_code" class="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white font-medium">
                    ${wards.map(w => `<option value="${w.code}" ${w.code === (sv.ward_code || '') ? 'selected' : ''}>${w.name} (${w.type || 'Xã/Phường'} - Mã: ${w.code})</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="space-y-1">
                <label class="block font-bold text-slate-700">Số nhà, tên đường / Khu phố / Ấp:</label>
                <input type="text" name="detailed_address" value="${sv.detailed_address || ''}" placeholder="Số nhà, tên đường, khu phố, ấp..." required class="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>

              ${sv.legacy_address ? `
                <div class="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                  <span class="font-bold text-slate-700">Địa chỉ lưu trữ lịch sử (trước sắp xếp):</span>
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
                <span>Lưu địa chỉ &amp; Hồ sơ</span>
              </button>
            </div>
          </form>
        </div>
      `, 'max-w-xl');

      if (window.lucide) window.lucide.createIcons();
    },
    handleModalProvinceChange(provCode) {
      const wardSelect = document.getElementById('modal-edit-ward');
      if (wardSelect && window.SA?.Administrative) {
        const wards = window.SA.Administrative.getWardsByProvince(provCode);
        wardSelect.innerHTML = wards.length > 0
          ? wards.map((w, idx) => `<option value="${w.code}" ${idx === 0 ? 'selected' : ''}>${w.name} (${w.type || 'Xã/Phường'} - Mã: ${w.code})</option>`).join('')
          : '<option value="">-- Vui lòng chọn Tỉnh/Thành phố --</option>';
      }
    },
    saveProfile(studentId, form) {
      const fd = new FormData(form);
      const fullName = fd.get('fullName')?.trim();
      const email = fd.get('email')?.trim();
      const phone = fd.get('phone')?.trim();
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

      const res = store.updateStudentProfile(studentId, {
        fullName,
        email,
        phone,
        province_code,
        ward_code,
        detailed_address
      });

      if (res.ok) {
        closeModal();
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  window.SA.Views.Student = { renderStudentView };
})();
