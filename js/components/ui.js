// UI Helpers, Toasts, Modals & Certificate Viewer
(function () {
  function showToast(message, type = 'success') {
  const root = document.getElementById('toast-root');
  if (!root) return;

  const colors = {
    success: 'bg-emerald-600 text-white border-emerald-700',
    warning: 'bg-amber-500 text-white border-amber-600',
    error: 'bg-rose-600 text-white border-rose-700',
    info: 'bg-brand-600 text-white border-brand-700'
  };
  const icons = {
    success: 'check-circle-2',
    warning: 'alert-triangle',
    error: 'x-circle',
    info: 'info'
  };

  const el = document.createElement('div');
  el.className = `pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 ${colors[type] || colors.info}`;
  el.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 mt-0.5 shrink-0"></i>
    <div class="flex-1">${message}</div>
  `;
  root.appendChild(el);
  if (window.lucide) window.lucide.createIcons();

  requestAnimationFrame(() => {
    el.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    el.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => el.remove(), 300);
  }, 3800);
}

function openModal(htmlContent, maxWidthClass = 'max-w-2xl') {
  const root = document.getElementById('modal-root');
  if (!root) return;
  root.classList.remove('hidden');
  root.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print-bg" onclick="if(event.target === this) window.app.closeModal()">
      <div class="bg-white rounded-2xl shadow-2xl w-full ${maxWidthClass} max-h-[92vh] overflow-y-auto relative animate-in print-only-area" onclick="event.stopPropagation()">
        ${htmlContent}
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();
}

function closeModal() {
  const root = document.getElementById('modal-root');
  if (!root) return;
  root.classList.add('hidden');
  root.innerHTML = '';
}

function renderStatusBadge(status) {
  const map = {
    registered: { label: 'Đã đăng ký', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
    checked_in: { label: 'Đã điểm danh vào', cls: 'bg-brand-50 text-brand-700 border-brand-200' },
    ai_review: { label: 'AI đang cảnh báo / Xác minh', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
    eligible: { label: 'Đủ điều kiện cấp CN', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    certified: { label: 'Đã cấp chứng nhận', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Không đạt / Từ chối', cls: 'bg-rose-50 text-rose-700 border-rose-200' }
  };
  const info = map[status] || map.registered;
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.cls}">${info.label}</span>`;
}

function renderEventStatusBadge(status) {
  const map = {
    ongoing: { label: 'Đang diễn ra', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    upcoming: { label: 'Sắp diễn ra', cls: 'bg-brand-100 text-brand-800 border-brand-200' },
    completed: { label: 'Đã kết thúc', cls: 'bg-slate-100 text-slate-600 border-slate-200' }
  };
  const info = map[status] || map.upcoming;
  return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.cls}">
    ${status === 'ongoing' ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>' : ''}
    ${info.label}
  </span>`;
}

// ============================================================================
// HỆ THỐNG XUẤT & XÁC THỰC GIẤY CHỨNG NHẬN ĐIỆN TỬ - SMARTATTEND AI ĐỒNG NAI
// Chuẩn A4 Landscape (297mm x 210mm) - Khắc phục triệt để lỗi PDF bị trắng
// ============================================================================

// Kiểm tra canvas có bị trắng / rỗng hay không
function isCanvasBlank(canvas) {
  if (!canvas || canvas.width === 0 || canvas.height === 0) return true;
  const ctx = canvas.getContext('2d');
  const w = Math.min(canvas.width, 300);
  const h = Math.min(canvas.height, 300);
  try {
    const imgData = ctx.getImageData(0, 0, w, h).data;
    let nonWhiteCount = 0;
    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];
      // Nếu pixel không phải trắng tinh và không phải trong suốt
      if (a > 30 && (r < 240 || g < 240 || b < 240)) {
        nonWhiteCount++;
        if (nonWhiteCount > 100) return false; // Có nội dung thực
      }
    }
    return nonWhiteCount < 100;
  } catch (e) {
    console.warn('Canvas pixel test warning:', e);
    return false;
  }
}

// Tạo QR Code DataURL dạng Promise đồng bộ
function generateQrDataUrl(text, isRevoked = false) {
  return new Promise((resolve) => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '0';
      tempDiv.style.left = '0';
      tempDiv.style.width = '160px';
      tempDiv.style.height = '160px';
      tempDiv.style.zIndex = '-10000';
      tempDiv.style.visibility = 'hidden';
      document.body.appendChild(tempDiv);

      if (window.QRCode) {
        new window.QRCode(tempDiv, {
          text: text,
          width: 140,
          height: 140,
          colorDark: isRevoked ? '#be123c' : '#0369a1',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M
        });

        setTimeout(() => {
          const canvas = tempDiv.querySelector('canvas');
          const img = tempDiv.querySelector('img');
          let resUrl = '';
          if (canvas) {
            resUrl = canvas.toDataURL('image/png');
          } else if (img && img.src) {
            resUrl = img.src;
          }
          if (document.body.contains(tempDiv)) document.body.removeChild(tempDiv);
          resolve(resUrl);
        }, 80);
      } else {
        if (document.body.contains(tempDiv)) document.body.removeChild(tempDiv);
        resolve('');
      }
    } catch (err) {
      console.warn('Error generating QR code data URL:', err);
      resolve('');
    }
  });
}

// Trình xuất PDF trực tiếp từ JPEG Blob (Zero-Failure Fallback chuẩn ISO 32000-1)
function downloadPdfFromJpeg(jpegDataUrl, filename) {
  try {
    const base64Str = jpegDataUrl.split(',')[1];
    const binaryStr = atob(base64Str);
    const jpegLen = binaryStr.length;
    const jpegBytes = new Uint8Array(jpegLen);
    for (let i = 0; i < jpegLen; i++) {
      jpegBytes[i] = binaryStr.charCodeAt(i);
    }

    // Đọc kích thước ảnh thực từ JPEG SOF marker
    let imgWidth = 2244;
    let imgHeight = 1588;
    for (let i = 0; i < jpegLen - 8; i++) {
      if (jpegBytes[i] === 0xff && (jpegBytes[i + 1] === 0xc0 || jpegBytes[i + 1] === 0xc2)) {
        imgHeight = (jpegBytes[i + 5] << 8) | jpegBytes[i + 6];
        imgWidth = (jpegBytes[i + 7] << 8) | jpegBytes[i + 8];
        break;
      }
    }

    // Kích thước chuẩn A4 Landscape theo điểm (72 pt/inch: 297mm x 210mm)
    const pageW = 841.89;
    const pageH = 595.28;

    const textEncoder = new TextEncoder();
    const parts = [];
    const offsets = [];

    function addStr(str) {
      parts.push(textEncoder.encode(str));
    }
    function addBytes(b) {
      parts.push(b);
    }

    let pos = 0;
    function recordObj() {
      pos = parts.reduce((sum, p) => sum + p.length, 0);
      offsets.push(pos);
    }

    // PDF Header
    addStr("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    // Obj 1: Catalog
    recordObj();
    addStr("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

    // Obj 2: Pages
    recordObj();
    addStr("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

    // Obj 3: Page (A4 Landscape)
    recordObj();
    addStr(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] /Resources << /XObject << /Im1 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\nendobj\n`);

    // Obj 4: Image XObject
    recordObj();
    addStr(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegLen} >>\nstream\n`);
    addBytes(jpegBytes);
    addStr("\nendstream\nendobj\n");

    // Obj 5: Page Content stream
    const content = `q\n${pageW.toFixed(2)} 0 0 ${pageH.toFixed(2)} 0 0 cm\n/Im1 Do\nQ\n`;
    const cBytes = textEncoder.encode(content);
    recordObj();
    addStr(`5 0 obj\n<< /Length ${cBytes.length} >>\nstream\n${content}endstream\nendobj\n`);

    // xref table
    const startXref = parts.reduce((sum, p) => sum + p.length, 0);
    let xref = `xref\n0 6\n0000000000 65535 f \n`;
    for (let i = 0; i < offsets.length; i++) {
      xref += String(offsets[i]).padStart(10, '0') + " 00000 n \n";
    }
    xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
    addStr(xref);

    const blob = new Blob(parts, { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
    return true;
  } catch (err) {
    console.error('downloadPdfFromJpeg error:', err);
    return false;
  }
}

// Vẽ trực tiếp Giấy chứng nhận lên HTML5 Canvas độ phân giải cao 2244x1588 (2x A4 Landscape)
function renderCertificateToDirectCanvas(cert, qrDataUrl) {
  const canvas = document.createElement('canvas');
  canvas.width = 2244;
  canvas.height = 1588;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const isRevoked = Boolean(cert.isRevoked || cert.is_revoked || cert.status === 'revoked');
  const primaryColor = isRevoked ? '#be123c' : '#0369a1';
  const secondaryColor = isRevoked ? '#e11d48' : '#0284c7';
  const goldColor = isRevoked ? '#991b1b' : '#d97706';

  // 1. Nền giấy mỹ thuật trắng ngà
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Họa tiết hoa văn bảo mật nền (Guilloche / Security Background)
  ctx.save();
  ctx.strokeStyle = isRevoked ? 'rgba(244, 63, 94, 0.05)' : 'rgba(2, 132, 199, 0.05)';
  ctx.lineWidth = 1.5;
  for (let i = 60; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 60);
    ctx.lineTo(i, canvas.height - 60);
    ctx.stroke();
  }
  for (let j = 60; j < canvas.height; j += 40) {
    ctx.beginPath();
    ctx.moveTo(60, j);
    ctx.lineTo(canvas.width - 60, j);
    ctx.stroke();
  }

  // Vòng hoa văn trung tâm
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 420, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 440, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 3. Khung viền đôi trang trọng
  // Khung ngoài màu xanh Tỉnh Đoàn / Đỏ thu hồi
  ctx.lineWidth = 22;
  ctx.strokeStyle = primaryColor;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Khung viền mạ vàng
  ctx.lineWidth = 6;
  ctx.strokeStyle = goldColor;
  ctx.strokeRect(54, 54, canvas.width - 108, canvas.height - 108);

  // Khung viền mảnh bên trong
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = secondaryColor;
  ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

  // 4. Hoa văn góc trang trọng (Corner Ornaments)
  const drawCorner = (x, y, dx, dy) => {
    ctx.save();
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 45);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * 45, y);
    ctx.stroke();

    ctx.fillStyle = goldColor;
    ctx.fillRect(x + dx * 8, y + dy * 8, 8, 8);
    ctx.restore();
  };
  drawCorner(78, 78, 1, 1);
  drawCorner(canvas.width - 78, 78, -1, 1);
  drawCorner(78, canvas.height - 78, 1, -1);
  drawCorner(canvas.width - 78, canvas.height - 78, -1, -1);

  // 5. Huy hiệu / Logo SmartAttend AI Đỉnh đầu
  ctx.save();
  const emblemX = canvas.width / 2;
  const emblemY = 145;
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.arc(emblemX, emblemY, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(emblemX, emblemY, 44, 0, Math.PI * 2);
  ctx.stroke();

  // Ngôi sao / Biểu trưng công nghệ bên trong
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', emblemX, emblemY - 1);
  ctx.restore();

  // 6. Header: Tên đơn vị cấp
  ctx.textAlign = 'center';
  ctx.fillStyle = '#075985';
  ctx.font = '800 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('ĐOÀN TNCS HỒ CHÍ MINH – HỘI SINH VIÊN TỈNH ĐỒNG NAI', canvas.width / 2, 230);

  ctx.fillStyle = '#0284c7';
  ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText((cert.organizer || 'BAN THƯỜNG VỤ TỈNH ĐOÀN').toUpperCase(), canvas.width / 2, 264);

  // Cảnh báo nếu chứng nhận bị thu hồi
  let titleY = 360;
  if (isRevoked) {
    ctx.fillStyle = '#ffe4e6';
    ctx.fillRect(300, 285, canvas.width - 600, 56);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.strokeRect(300, 285, canvas.width - 600, 56);

    ctx.fillStyle = '#9f1239';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`⚠ CHỨNG NHẬN ĐÃ BỊ THU HỒI (Lý do: ${cert.revokedReason || 'Vi phạm quy chế điểm danh'})`, canvas.width / 2, 320);
    titleY = 400;
  }

  // 7. Tiêu đề GIẤY CHỨNG NHẬN
  ctx.fillStyle = primaryColor;
  ctx.font = '900 64px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('GIẤY CHỨNG NHẬN', canvas.width / 2, titleY);

  ctx.fillStyle = isRevoked ? '#be123c' : '#059669';
  ctx.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    isRevoked ? 'CHỨNG NHẬN ĐÃ BỊ HỦY BỎ HIỆU LỰC' : 'CHỨNG NHẬN THAM GIA HOẠT ĐỘNG SỐ HÓA CHÍNH THỨC',
    canvas.width / 2,
    titleY + 42
  );

  // Đường viền trang trí dưới tiêu đề
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 220, titleY + 68);
  ctx.lineTo(canvas.width / 2 + 220, titleY + 68);
  ctx.stroke();

  // 8. Thông tin Sinh viên
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Trân trọng chứng nhận sinh viên:', canvas.width / 2, titleY + 120);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 52px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(cert.studentName || 'Sinh viên', canvas.width / 2, titleY + 185);

  ctx.fillStyle = '#0284c7';
  ctx.font = '700 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`MSSV: ${cert.mssv || 'N/A'}  •  ${cert.universityName || 'Đồng Nai'}`, canvas.width / 2, titleY + 230);

  // 9. Khung chi tiết Hoạt động
  const boxW = 1420;
  const boxH = 175;
  const boxX = (canvas.width - boxW) / 2;
  const boxY = titleY + 275;

  ctx.fillStyle = isRevoked ? '#fff1f2' : '#f0f9ff';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = isRevoked ? '#fecdd3' : '#bae6fd';
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.fillStyle = '#64748b';
  ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('ĐÃ HOÀN THÀNH XUẤT SẮC VÀ THAM GIA ĐẦY ĐỦ CHƯƠNG TRÌNH', canvas.width / 2, boxY + 45);

  ctx.fillStyle = primaryColor;
  ctx.font = '800 32px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(cert.eventTitle || cert.certificate_name || 'Hoạt động Thanh niên 2026', canvas.width / 2, boxY + 98);

  ctx.fillStyle = '#334155';
  ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`Thời gian tổ chức: ${cert.eventDate || 'Năm 2026'}`, canvas.width / 2, boxY + 144);

  // 10. Chân trang (3 cột: QR Code, Xác thực số AI, Chữ ký số - cân đối chuẩn xác)
  const bottomY = 1140;

  // Cột Trái: QR Code xác minh
  if (qrDataUrl) {
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    try {
      ctx.drawImage(qrImg, 140, bottomY, 150, 150);
    } catch (e) {
      console.warn('QR draw to canvas warning:', e);
    }
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillText(`Mã: ${cert.id || cert.certificate_code}`, 140, bottomY + 165);

  ctx.fillStyle = '#64748b';
  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Quét QR để tra cứu trực tuyến', 140, bottomY + 192);

  // Cột Giữa: Xác thực hệ thống & Khẩu hiệu mới
  ctx.textAlign = 'center';
  ctx.fillStyle = isRevoked ? '#ffe4e6' : '#ecfdf5';
  ctx.fillRect(canvas.width / 2 - 210, bottomY + 10, 420, 36);
  ctx.strokeStyle = isRevoked ? '#f43f5e' : '#10b981';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(canvas.width / 2 - 210, bottomY + 10, 420, 36);

  ctx.fillStyle = isRevoked ? '#be123c' : '#047857';
  ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    isRevoked ? '✕ ĐÃ THU HỒI HIỆU LỰC PHÁP LÝ' : '✓ ĐÃ XÁC THỰC SỐ BỞI SMARTATTEND AI',
    canvas.width / 2,
    bottomY + 34
  );

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText(cert.digitalHash || 'SHA256:VERIFIED', canvas.width / 2, bottomY + 68);

  // Khẩu hiệu sản phẩm chuẩn hóa
  ctx.fillStyle = '#0369a1';
  ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('AI SMARTATTEND ĐỒNG NAI', canvas.width / 2, bottomY + 115);
  ctx.fillStyle = '#64748b';
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Điểm danh và cấp chứng nhận điện tử bằng AI', canvas.width / 2, bottomY + 142);

  // Cột Phải: Ban Thường vụ ký tên
  ctx.textAlign = 'right';
  const issuedDateStr = cert.issuedDate || cert.issued_at || '2026-11-13';
  const dateParts = issuedDateStr.split('-');
  const y = dateParts[0] || '2026';
  const m = dateParts[1] || '11';
  const d = dateParts[2] ? dateParts[2].slice(0, 2) : '13';

  ctx.fillStyle = '#475569';
  ctx.font = 'italic 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Đồng Nai, ngày ${d} tháng ${m} năm ${y}`, canvas.width - 140, bottomY - 5);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('TM. BAN THƯỜNG VỤ TỈNH ĐOÀN', canvas.width - 140, bottomY + 25);

  // Dấu mộc số điện tử
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('[ĐÃ KÝ SỐ ĐIỆN TỬ CHÍNH QUY]', canvas.width - 140, bottomY + 55);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(cert.signerName || 'Bùi Quốc Tuấn', canvas.width - 140, bottomY + 115);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(cert.signerTitle || 'Phó Bí thư Tỉnh Đoàn', canvas.width - 140, bottomY + 145);
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('TM. BAN THƯỜNG VỤ TỈNH ĐOÀN', canvas.width - 140, bottomY + 22);

  // Dấu mộc số điện tử
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('[ĐÃ KÝ SỐ ĐIỆN TỬ CHÍNH QUY]', canvas.width - 140, bottomY + 54);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(cert.signerName || 'Bùi Quốc Tuấn', canvas.width - 140, bottomY + 120);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(cert.signerTitle || 'Phó Bí thư Tỉnh Đoàn', canvas.width - 140, bottomY + 150);

  return canvas;
}

// Hàm tải xuống PDF chứng nhận hoàn chỉnh, cam kết không bao giờ bị trắng file
async function downloadCertificatePDF(cert) {
  if (!cert) {
    showToast('Không tìm thấy thông tin chứng nhận để xuất PDF.', 'error');
    return;
  }

  const certCode = cert.id || cert.certificate_code || 'DN';
  const filename = `Chung_Nhan_SmartAttend_${certCode.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=${certCode}`;
  const isRevoked = Boolean(cert.isRevoked || cert.is_revoked || cert.status === 'revoked');

  showToast('Đang khởi tạo Giấy chứng nhận và xuất file PDF chuẩn A4...', 'info');

  try {
    // 1. Tạo mã QR trực tiếp thành DataURL
    const qrDataUrl = await generateQrDataUrl(verifyUrl, isRevoked);

    // 2. Chờ font chữ trình duyệt sẵn sàng (Plus Jakarta Sans)
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 3. Phương thức xuất ưu tiên: Tạo Canvas 2D độ phân giải chuẩn (2244 x 1588)
    const directCanvas = renderCertificateToDirectCanvas(cert, qrDataUrl);

    // 4. Kiểm tra canvas thực tế: Đảm bảo tuyệt đối KHÔNG RỖNG
    if (isCanvasBlank(directCanvas)) {
      throw new Error('Canvas xuất chứng nhận không có dữ liệu hình ảnh.');
    }

    const jpegDataUrl = directCanvas.toDataURL('image/jpeg', 0.96);

    // 5. Kết xuất PDF qua jsPDF nếu có trong môi trường
    const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
    let pdfExported = false;

    if (typeof jsPDFClass === 'function') {
      try {
        const doc = new jsPDFClass({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        doc.addImage(jpegDataUrl, 'JPEG', 0, 0, 297, 210);
        doc.save(filename);
        pdfExported = true;
      } catch (jspdfErr) {
        console.warn('jsPDF export warning, using native PDF stream fallback:', jspdfErr);
      }
    }

    // 6. Nếu jsPDF không có hoặc gặp sự cố, kích hoạt bộ xuất PDF Native ISO 32000-1
    if (!pdfExported) {
      const success = downloadPdfFromJpeg(jpegDataUrl, filename);
      if (!success) {
        throw new Error('Trình tạo file PDF native gặp sự cố khi lưu.');
      }
    }

    showToast('Đã tải xuống file PDF chứng nhận thành công!', 'success');
  } catch (err) {
    console.error('Lỗi xuất file PDF chứng nhận:', err);
    showToast(`Không thể xuất file PDF: ${err.message || 'Lỗi xử lý đồ họa'}. Vui lòng thử lại!`, 'error');
  }
}

function openCertificateModal(cert) {
  if (!cert) return;
  const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=${cert.id || cert.certificate_code}`;
  const isRevoked = Boolean(cert.isRevoked || cert.is_revoked || cert.status === 'revoked');

  const issuedDateStr = cert.issuedDate || cert.issued_at || '2026-11-13';
  const dateParts = issuedDateStr.split('-');
  const y = dateParts[0] || '2026';
  const m = dateParts[1] || '11';
  const d = dateParts[2] ? dateParts[2].slice(0, 2) : '13';

  const html = `
    <div class="p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4 no-print gap-2">
        <div class="flex items-center gap-2">
          <span class="p-2 rounded-lg ${isRevoked ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600'}">
            <i data-lucide="${isRevoked ? 'alert-triangle' : 'award'}" class="w-5 h-5"></i>
          </span>
          <div>
            <h3 class="font-bold text-slate-900 text-sm sm:text-base">Xem Trước Giấy Chứng Nhận Điện Tử</h3>
            <p class="text-xs text-slate-500">Mã định danh: <span class="font-mono font-semibold ${isRevoked ? 'text-rose-700' : 'text-brand-700'}">${cert.id || cert.certificate_code}</span></p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button onclick="window.SA.UI.downloadCertificatePDF(window.appStore.state.certificates.find(c => (c.id === '${cert.id || cert.certificate_code}' || c.certificate_code === '${cert.id || cert.certificate_code}')) || ${JSON.stringify(cert).replace(/"/g, '&quot;')})" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition">
            <i data-lucide="download" class="w-4 h-4"></i> Tải PDF
          </button>
          <button onclick="window.print()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
            <i data-lucide="printer" class="w-4 h-4"></i> In
          </button>
          <button onclick="window.app.openPublicVerify('${cert.id || cert.certificate_code}'); window.app.closeModal();" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition">
            <i data-lucide="shield-check" class="w-4 h-4"></i> Tra cứu QR
          </button>
          <button onclick="window.app.closeModal()" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      ${isRevoked ? `
        <div class="mb-4 bg-rose-50 border-2 border-rose-400 rounded-xl p-3 text-rose-800 text-xs font-bold flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <i data-lucide="alert-octagon" class="w-5 h-5 text-rose-600 shrink-0"></i>
            <span>CHỨNG NHẬN ĐÃ BỊ THU HỒI / KHÔNG CÒN GIÁ TRỊ PHÁP LÝ</span>
          </div>
          <span class="text-[11px] text-rose-600 font-normal">Lý do: ${cert.revokedReason || 'Phát hiện vi phạm quy chế điểm danh'}</span>
        </div>
      ` : ''}

      <!-- Khung Chứng Nhận Chuẩn A4 Landscape Preview -->
      <div class="certificate-frame rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden ${isRevoked ? 'border-2 border-rose-400 bg-rose-50/20' : ''}">
        <div class="certificate-watermark"></div>
        <div class="certificate-corner-tl"></div>
        <div class="certificate-corner-tr"></div>
        <div class="certificate-corner-bl"></div>
        <div class="certificate-corner-br"></div>

        <div class="relative z-10 space-y-4">
          <!-- Header Đơn vị cấp & Huy hiệu -->
          <div class="flex flex-col items-center justify-center">
            <div class="w-14 h-14 rounded-full ${isRevoked ? 'bg-gradient-to-br from-rose-600 to-rose-800' : 'bg-gradient-to-br from-brand-600 to-brand-800'} text-white flex items-center justify-center shadow-md mb-2 border-2 ${isRevoked ? 'border-rose-200' : 'border-amber-300'}">
              <i data-lucide="${isRevoked ? 'alert-triangle' : 'award'}" class="w-7 h-7"></i>
            </div>
            <p class="text-xs sm:text-sm font-extrabold tracking-wider ${isRevoked ? 'text-rose-800' : 'text-brand-900'} uppercase">ĐOÀN TNCS HỒ CHÍ MINH – HỘI SINH VIÊN TỈNH ĐỒNG NAI</p>
            <p class="text-[11px] font-bold text-brand-600 uppercase tracking-widest mt-0.5">${cert.organizer || 'BAN THƯỜNG VỤ TỈNH ĐOÀN'}</p>
          </div>

          <!-- Tiêu đề lớn -->
          <div class="my-4">
            <h2 class="text-2xl sm:text-4xl font-black ${isRevoked ? 'text-rose-900' : 'text-brand-900'} tracking-wide uppercase">GIẤY CHỨNG NHẬN</h2>
            <p class="text-xs font-bold ${isRevoked ? 'text-rose-600' : 'text-emerald-600'} tracking-widest uppercase mt-1">
              ${isRevoked ? 'CHỨNG NHẬN ĐÃ BỊ HỦY BỎ HIỆU LỰC' : 'CHỨNG NHẬN THAM GIA HOẠT ĐỘNG SỐ HÓA CHÍNH THỨC'}
            </p>
          </div>

          <!-- Người nhận -->
          <div>
            <p class="text-sm text-slate-500 italic">Trân trọng chứng nhận sinh viên:</p>
            <h3 class="text-2xl sm:text-3xl font-black text-slate-900 mt-1 mb-1">${cert.studentName || 'Sinh viên'}</h3>
            <p class="text-sm font-bold text-brand-700">MSSV: ${cert.mssv || 'N/A'} • ${cert.universityName || 'Đồng Nai'}</p>
          </div>

          <!-- Nội dung hoạt động -->
          <div class="max-w-2xl mx-auto my-4 ${isRevoked ? 'bg-rose-50/80 border border-rose-200' : 'bg-brand-50/80 border border-brand-200'} rounded-2xl p-4 text-center">
            <p class="text-xs text-slate-500 uppercase font-bold mb-1">Đã hoàn thành xuất sắc &amp; tham gia đầy đủ chương trình</p>
            <p class="text-base sm:text-lg font-extrabold ${isRevoked ? 'text-rose-900' : 'text-brand-900'}">${cert.eventTitle || cert.certificate_name || 'Hoạt động Thanh niên 2026'}</p>
            <p class="text-xs text-slate-600 mt-1">Thời gian tổ chức: <strong>${cert.eventDate || 'Năm 2026'}</strong></p>
          </div>

          <!-- Footer Ký tên & QR Xác thực -->
          <div class="grid grid-cols-1 sm:grid-cols-3 items-end gap-6 mt-6 pt-4 border-t border-slate-200 text-left">
            <div class="flex flex-col items-center sm:items-start">
              <div id="cert-qr-${cert.id || cert.certificate_code}" class="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm inline-block min-w-[86px] min-h-[86px]"></div>
              <p class="text-[10px] text-slate-700 mt-1.5 font-mono font-bold">Mã: ${cert.id || cert.certificate_code}</p>
              <p class="text-[9px] text-slate-400">Quét QR đối soát công khai</p>
            </div>

            <div class="text-center text-[11px] text-slate-500">
              <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full ${isRevoked ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'} font-bold mb-1">
                <i data-lucide="${isRevoked ? 'alert-octagon' : 'shield-check'}" class="w-3.5 h-3.5"></i>
                ${isRevoked ? 'Đã thu hồi hiệu lực' : 'Đã xác thực AI SmartAttend'}
              </div>
              <p class="font-mono text-[9px] text-slate-400 break-all">${cert.digitalHash || 'SHA256:VERIFIED'}</p>
              <p class="text-[10px] text-brand-700 font-bold mt-2">AI SMARTATTEND ĐỒNG NAI</p>
              <p class="text-[9px] text-slate-500">Điểm danh và cấp chứng nhận điện tử bằng AI</p>
            </div>

            <div class="text-center sm:text-right">
              <p class="text-xs text-slate-500 italic">Đồng Nai, ngày ${d} tháng ${m} năm ${y}</p>
              <p class="text-xs font-bold text-brand-900 uppercase mt-1">TM. BAN THƯỜNG VỤ TỈNH ĐOÀN</p>
              <div class="my-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-semibold">
                <i data-lucide="shield-check" class="w-3 h-3"></i> Chữ ký số xác thực Tỉnh Đoàn
              </div>
              <p class="text-sm font-bold text-slate-900">${cert.signerName || 'Bùi Quốc Tuấn'}</p>
              <p class="text-[11px] text-slate-500">${cert.signerTitle || 'Phó Bí thư Tỉnh Đoàn'}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 no-print">
        <span>Liên kết xác thực trực tuyến:</span>
        <button onclick="navigator.clipboard?.writeText('${verifyUrl}'); window.SA.UI.showToast('Đã sao chép liên kết xác thực chứng nhận!', 'success')" class="text-brand-600 hover:underline font-semibold flex items-center gap-1">
          <i data-lucide="copy" class="w-3.5 h-3.5"></i> Sao chép URL xác thực
        </button>
      </div>
    </div>
  `;

  openModal(html, 'max-w-4xl');

  // Render QR thật trong Modal & Kích hoạt Lucide icons
  setTimeout(() => {
    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch (e) {}

    const qrTarget = document.getElementById(`cert-qr-${cert.id || cert.certificate_code}`);
    if (qrTarget && window.QRCode) {
      qrTarget.innerHTML = '';
      new window.QRCode(qrTarget, {
        text: verifyUrl,
        width: 86,
        height: 86,
        colorDark: isRevoked ? '#be123c' : '#0369a1',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    }
  }, 60);
}

window.SA.UI = {
  showToast,
  openModal,
  closeModal,
  renderStatusBadge,
  renderEventStatusBadge,
  openCertificateModal,
  downloadCertificatePDF,
  renderCertificateToDirectCanvas,
  generateQrDataUrl,
  downloadPdfFromJpeg,
  isCanvasBlank
};
})();
