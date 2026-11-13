(function () {
  const { openCertificateModal } = window.SA.UI;

  function renderVerifyView(state, initialCode = '') {
    const query = (window.verifySearchQuery ?? initialCode ?? '').trim().toUpperCase();
    const matchedCert = query ? state.certificates.find(c => 
      (c.id && c.id.toUpperCase() === query) || 
      (c.certificate_id && c.certificate_id.toUpperCase() === query) ||
      (c.certificate_code && c.certificate_code.toUpperCase() === query) ||
      (c.verification_code && c.verification_code.toUpperCase() === query)
    ) : null;
    const sampleCerts = state.certificates.slice(0, 3);
    const isRevoked = matchedCert ? Boolean(matchedCert.isRevoked || matchedCert.is_revoked || matchedCert.status === 'revoked') : false;
    window.currentVerifyCert = matchedCert;

    return `
      <div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div class="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 text-center space-y-5">
          <div class="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-100">
            <i data-lucide="shield-check" class="w-9 h-9"></i>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-slate-900">Cổng Xác Thực Chứng Nhận Điện Tử Chính Quy</h2>
            <p class="text-sm text-slate-500 mt-1">Hệ thống AI SMARTATTEND ĐỒNG NAI – Điểm danh và cấp chứng nhận điện tử bằng AI dành cho Nhà trường, Nhà tuyển dụng và Đơn vị thứ ba tra cứu, đối soát tính xác thực của Giấy chứng nhận.</p>
          </div>

          <form onsubmit="event.preventDefault(); window.verifyUI.search(document.getElementById('verify-code-input').value)" class="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <input id="verify-code-input" type="text" value="${query}" placeholder="Nhập mã chứng nhận (VD: CERT-DN-2026-0001)" class="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none" />
            <button type="submit" class="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-sm transition">
              Kiểm tra ngay
            </button>
          </form>

          <div class="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>Thử nhanh mã mẫu:</span>
            ${sampleCerts.map(c => `
              <button onclick="window.verifyUI.search('${c.id || c.certificate_code}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 font-mono font-semibold transition">${c.id || c.certificate_code}</button>
            `).join('')}
          </div>
        </div>

        ${query ? (matchedCert ? (isRevoked ? `
          <div class="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 space-y-4 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-rose-800 font-extrabold text-base">
                <i data-lucide="alert-octagon" class="w-6 h-6 text-rose-600"></i>
                CHỨNG NHẬN ĐÃ BỊ THU HỒI / KHÔNG CÒN GIÁ TRỊ PHÁP LÝ
              </div>
              <span class="px-3 py-1 rounded-full bg-rose-200 text-rose-900 text-xs font-mono font-bold">${matchedCert.id || matchedCert.certificate_code}</span>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
              <div><strong>Lý do thu hồi:</strong> ${matchedCert.revokedReason || 'Phát hiện sai lệch dữ liệu điểm danh / Vi phạm quy chế'}</div>
              <div><span class="text-slate-500">Thời gian thu hồi:</span> ${matchedCert.revokedAt || '2026-11-13'}</div>
              ${matchedCert.revokedBy ? `<div><span class="text-slate-500">Đơn vị thu hồi:</span> ${matchedCert.revokedBy}</div>` : ''}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-rose-200 text-sm">
              <div><span class="text-slate-400 text-xs block">Họ và tên sinh viên</span><strong>${matchedCert.studentName}</strong></div>
              <div><span class="text-slate-400 text-xs block">MSSV / Trường</span><strong>${matchedCert.mssv} • ${matchedCert.universityName}</strong></div>
              <div class="sm:col-span-2"><span class="text-slate-400 text-xs block">Hoạt động tham gia</span><strong class="text-slate-800">${matchedCert.eventTitle || matchedCert.certificate_name}</strong></div>
              <div><span class="text-slate-400 text-xs block">Đơn vị cấp ban đầu</span><strong>${matchedCert.organizer}</strong></div>
              <div><span class="text-slate-400 text-xs block">Ngày cấp ban đầu</span><strong>${matchedCert.issuedDate || matchedCert.issued_at}</strong></div>
              <div class="sm:col-span-2"><span class="text-slate-400 text-xs block">Mã băm đối soát</span><span class="font-mono text-xs text-slate-500">${matchedCert.digitalHash}</span></div>
            </div>

            <div class="flex justify-end gap-2">
              <button onclick="window.verifyUI.openFull('${matchedCert.id || matchedCert.certificate_code}')" class="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition">
                Xem chi tiết hồ sơ
              </button>
            </div>
          </div>
        ` : `
          <div class="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 space-y-4 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-emerald-800 font-extrabold text-base">
                <i data-lucide="badge-check" class="w-6 h-6 text-emerald-600"></i>
                CHỨNG NHẬN HỢP LỆ &amp; ĐÃ ĐỐI SOÁT XÁC THỰC
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 text-xs font-mono font-bold">${matchedCert.id || matchedCert.certificate_code}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-emerald-200 text-sm">
              <div><span class="text-slate-400 text-xs block">Họ và tên sinh viên</span><strong>${matchedCert.studentName}</strong></div>
              <div><span class="text-slate-400 text-xs block">MSSV / Trường</span><strong>${matchedCert.mssv} • ${matchedCert.universityName}</strong></div>
              <div class="sm:col-span-2"><span class="text-slate-400 text-xs block">Hoạt động đã tham gia</span><strong class="text-brand-800">${matchedCert.eventTitle || matchedCert.certificate_name}</strong></div>
              <div><span class="text-slate-400 text-xs block">Đơn vị cấp</span><strong>${matchedCert.organizer}</strong></div>
              <div><span class="text-slate-400 text-xs block">Ngày cấp</span><strong>${matchedCert.issuedDate || matchedCert.issued_at}</strong></div>
              <div class="sm:col-span-2"><span class="text-slate-400 text-xs block">Mã băm xác thực bảo mật (SHA-256)</span><span class="font-mono text-xs text-slate-600">${matchedCert.digitalHash}</span></div>
            </div>

            <div class="flex flex-wrap justify-end gap-2">
              <button onclick="window.SA.UI.downloadCertificatePDF(window.appStore.state.certificates.find(c => c.id === '${matchedCert.id || matchedCert.certificate_code}' || c.certificate_code === '${matchedCert.id || matchedCert.certificate_code}') || window.currentVerifyCert)" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                <i data-lucide="download" class="w-4 h-4"></i> Tải file PDF bản gốc
              </button>
              <button onclick="window.verifyUI.openFull('${matchedCert.id || matchedCert.certificate_code}')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition">
                Xem bản chứng nhận số đầy đủ
              </button>
            </div>
          </div>
        `) : `
          <div class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 space-y-1">
            <i data-lucide="x-circle" class="w-8 h-8 text-rose-500 mx-auto mb-1"></i>
            <p class="font-bold">Không tìm thấy chứng nhận có mã "${query}"</p>
            <p class="text-xs text-rose-600">Vui lòng kiểm tra lại mã định danh hoặc liên hệ Ban Thường vụ Tỉnh Đoàn Đồng Nai để được hỗ trợ.</p>
          </div>
        `) : ''}

        <div class="text-center">
          <button onclick="window.app.closePublicVerify()" class="text-sm font-semibold text-brand-700 hover:underline">← Quay lại ứng dụng chính</button>
        </div>
      </div>
    `;
  }

  window.verifyUI = {
    search(code) {
      window.verifySearchQuery = code;
      window.app.render();
    },
    openFull(certId) {
      const cert = window.appStore.state.certificates.find(c => 
        c.id === certId || c.certificate_id === certId || c.certificate_code === certId || c.verification_code === certId
      );
      if (cert) openCertificateModal(cert);
    }
  };

  window.SA.Views.Verify = { renderVerifyView };
})();
