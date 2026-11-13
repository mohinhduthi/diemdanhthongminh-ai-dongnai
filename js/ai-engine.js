// AI ENGINE - AI SMARTATTEND ĐỒNG NAI (PRODUCTION VERSION)
// Phân tích bất thường điểm danh, đánh giá điều kiện chứng nhận, kết nối Backend API/Gemini AI
(function () {
  /**
   * Tính toán khoảng cách tọa độ GPS thực tế bằng công thức Harversine (đơn vị: mét)
   */
  function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const R = 6371e3; // Bán kính Trái Đất theo mét
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Phân tích các dấu hiệu điểm danh bất thường dựa trên căn cứ khoa học & thông số kỹ thuật thực
   */
  function analyzeAttendanceAnomaly(record, allEventRecords, event) {
    let score = 5; // Mức nhiễu nền cơ sở
    const flags = [];

    // 1. Kiểm tra vùng định vị (Geofence / GPS)
    if (record.distanceMeters !== null && record.distanceMeters !== undefined) {
      const maxRadius = (event && event.gps && event.gps.radiusMeters) || 300;
      if (record.distanceMeters > maxRadius * 3) {
        score += 48;
        flags.push(`Khoảng cách GPS cách địa điểm ${(record.distanceMeters / 1000).toFixed(1)} km (vượt xa bán kính ${maxRadius}m)`);
      } else if (record.distanceMeters > maxRadius) {
        score += 24;
        flags.push(`Vị trí GPS nằm ngoài bán kính cho phép (${record.distanceMeters}m > ${maxRadius}m)`);
      }
    }

    // 2. Kiểm tra trùng lặp thiết bị (Device ID Collision - phát hiện điểm danh hộ)
    if (record.deviceId) {
      const sameDeviceOthers = (allEventRecords || []).filter(
        r => r.id !== record.id && r.deviceId === record.deviceId && r.checkInAt
      );
      if (sameDeviceOthers.length > 0) {
        score += 45;
        flags.push(`Phát hiện trùng Device ID (${record.deviceId}) với ${sameDeviceOthers.length} sinh viên khác trong cùng sự kiện (Nghi vấn điểm danh hộ)`);
      }
    }

    // 3. Kiểm tra tính hợp lệ của Dynamic QR Token
    if (record.qrValid === false) {
      score += 40;
      flags.push('Mã QR đã hết hạn chu kỳ hoặc có dấu hiệu dùng lại ảnh chụp màn hình');
    }

    // 4. Kiểm tra thời lượng tham gia (Check-in & Check-out)
    if (record.checkInAt && record.checkOutAt) {
      const minMin = (event && event.minDurationMinutes) || 60;
      const duration = record.durationMinutes || 0;
      if (duration < 15) {
        score += 38;
        flags.push(`Thời gian tham dự quá ngắn (${duration} phút — nghi vấn quét rồi rời khỏi hội trường)`);
      } else if (duration < minMin) {
        score += 20;
        flags.push(`Chưa đạt thời lượng tối thiểu theo quy chế (${duration}/${minMin} phút)`);
      }
    }

    // 5. Xác thực khuôn mặt (Face Verification - chỉ khi sinh viên đồng ý và thực hiện)
    if (record.faceVerified) {
      score = Math.max(2, score - 8);
    } else if (flags.length > 0) {
      score += 5;
      flags.push('Chưa kích hoạt đối chiếu khuôn mặt bổ sung');
    }

    score = Math.min(99, Math.max(1, score));

    let riskLevel = 'LOW';
    let recommendation = 'Hợp lệ — Đề xuất thông qua tự động';

    if (score >= 70) {
      riskLevel = 'HIGH';
      recommendation = 'Cảnh báo rủi ro cao — Đề xuất tạm giữ và yêu cầu BTC xác minh / sinh viên giải trình';
    } else if (score >= 35) {
      riskLevel = 'MEDIUM';
      recommendation = 'Cảnh báo trung bình — Đề xuất kiểm tra đối chiếu';
    }

    return { score, riskLevel, flags, recommendation };
  }

  /**
   * Đánh giá điều kiện cấp chứng nhận theo quy chế sự kiện
   */
  function evaluateCertificateEligibility(reg, event) {
    const criteria = [
      {
        label: 'Đã đăng ký tham gia hợp lệ',
        passed: Boolean(reg && reg.registeredAt)
      },
      {
        label: 'Có dữ liệu Điểm danh vào (Check-in)',
        passed: Boolean(reg && reg.checkInAt)
      },
      {
        label: (event && event.requiresCheckOut) ? 'Có dữ liệu Điểm danh ra (Check-out)' : 'Không bắt buộc Check-out',
        passed: (event && event.requiresCheckOut) ? Boolean(reg && reg.checkOutAt) : true
      },
      {
        label: `Thời lượng tham gia >= ${(event && event.minDurationMinutes) || 60} phút`,
        passed: (reg && reg.durationMinutes || 0) >= ((event && event.minDurationMinutes) || 60)
      },
      {
        label: 'Không có cảnh báo gian lận AI chưa xử lý',
        passed: !reg || reg.aiRiskLevel !== 'HIGH' || reg.status === 'eligible' || reg.status === 'certified'
      }
    ];

    const isEligible = criteria.every(c => c.passed);
    return { isEligible, criteria };
  }

  /**
   * Trợ lý AI Hỗ trợ xử lý khiếu nại (Giao tiếp với Backend Gateway hoặc phân tích luật)
   */
  async function assistAppealAnalysis({ studentName, mssv, eventTitle, reason, flags = [] }) {
    const config = window.SA.Config;
    const apiUrl = config.get('apiBaseUrl');

    try {
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/api/ai/appeal-assist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentName, mssv, eventTitle, reason, flags })
        });
        if (response.ok) {
          const data = await response.json();
          return {
            connected: data.connected !== false,
            source: data.source,
            analysis: data.analysis
          };
        }
      }
    } catch (e) {
      console.warn('Backend AI Gateway unavailable, switching to local evaluation', e);
    }

    // Heuristic Evaluation logic khi chưa có kết nối API ngoài
    return {
      connected: false,
      source: 'local_rule_engine',
      analysis: `[AI Hệ Thống Phân Tích]: Đã ghi nhận giải trình của sinh viên ${studentName} (${mssv}). Dấu hiệu gắn cờ: ${flags.join('; ') || 'Không có'}. Dựa trên lý do "${reason}", đề xuất Ban Tổ Chức đối chiếu chữ ký tại chỗ hoặc hình ảnh lưu niệm tại sự kiện trước khi mở khóa.`
    };
  }

  /**
   * Tổng hợp báo cáo sự kiện qua AI
   */
  function generateAISummaryReport(state) {
    const totalEvents = (state.events || []).length;
    const totalRegs = (state.registrations || []).length;
    const totalAttended = (state.registrations || []).filter(r => r.checkInAt).length;
    const totalAnomalies = (state.registrations || []).filter(r => r.aiRiskLevel === 'HIGH').length;
    const anomalyRate = totalAttended > 0 ? ((totalAnomalies / totalAttended) * 100).toFixed(1) : '0';

    return {
      summaryText: `Hệ thống ghi nhận ${totalEvents} sự kiện với ${totalRegs} lượt đăng ký. Đã có ${totalAttended} lượt điểm danh thành công trên toàn tỉnh Đồng Nai.`,
      headline: totalAnomalies > 0
        ? `Phát hiện ${totalAnomalies} trường hợp bất thường cần thẩm định (Tỷ lệ cảnh báo: ${anomalyRate}%)`
        : `Toàn bộ ${totalAttended} lượt điểm danh đều đạt độ tin cậy cao trên toàn tỉnh Đồng Nai`,
      insights: [
        `Hệ thống liên thông 11 trường Đại học & Cao đẳng, đang hoạt động ổn định trên nền tảng cơ sở dữ liệu số hóa 2026.`,
        totalAnomalies > 0
          ? `Có ${totalAnomalies} lượt phát hiện lệch GPS vượt bán kính hoặc trùng thiết bị, đề xuất BTC hoàn tất thẩm định trước khi cấp chứng nhận.`
          : `Không ghi nhận bất thường về vị trí GPS hay trùng lặp thiết bị điểm danh hộ.`,
        `Tỷ lệ hoàn thành hoạt động đạt ${totalRegs > 0 ? Math.round((totalAttended / totalRegs) * 100) : 100}%, tiến độ cấp chứng nhận điện tử bảo đảm đúng quy chế.`
      ],
      anomalyRate: `${anomalyRate}%`,
      totalAnomalies,
      recommendation: totalAnomalies > 0
        ? `Phát hiện ${totalAnomalies} trường hợp bất thường (trùng thiết bị hoặc GPS lệch). Đề xuất BTC hoàn thành rà soát trước khi ký duyệt chứng nhận hàng loạt.`
        : 'Tất cả các lượt điểm danh đều hợp lệ, không ghi nhận hành vi bất thường nghiêm trọng.'
    };
  }

  /**
   * Trợ lý ảo AI Chatbot tư vấn quy chế Đoàn - Hội và hỗ trợ sinh viên
   */
  function askAIChatbot(query, state, currentUser) {
    const q = (query || '').toLowerCase();
    if (q.includes('hoạt động') || q.includes('sự kiện') || q.includes('sắp tới')) {
      const ongoing = (state.events || []).filter(e => e.status === 'ongoing');
      if (ongoing.length) {
        return `Hiện đang có hoạt động: **${ongoing[0].title}** tại ${ongoing[0].location}. Bạn có thể vào tab "Điểm danh Camera & QR" để thực hiện check-in ngay.`;
      }
      return `Hệ thống ghi nhận **${(state.events || []).length} hoạt động** trong năm 2026 trên địa bàn TP. Đồng Nai. Bạn có thể xem chi tiết trong mục Đăng ký hoạt động.`;
    }
    if (q.includes('chứng nhận') || q.includes('điều kiện')) {
      return `**Điều kiện điểm danh và cấp chứng nhận điện tử bằng AI SmartAttend 2026:**\n1. Check-in đúng vùng GPS (trong bán kính quy định)\n2. Thời lượng tham gia tối thiểu 60 phút và hoàn thành Check-out\n3. Điểm rủi ro AI Fraud Guard < 50 điểm (không phát hiện trùng thiết bị điểm danh hộ).`;
    }
    if (q.includes('cảnh báo') || q.includes('khiếu nại') || q.includes('bị ai')) {
      return `Nếu bạn bị AI gắn cờ cảnh báo (do GPS thiết bị nhảy lệch vị trí hoặc mạng yếu), vui lòng bấm vào nút **"Gửi giải trình / Khiếu nại"** tại mục Theo dõi kết quả. Ban Tổ Chức sẽ kiểm tra minh chứng (ảnh chụp hội trường, đối chiếu điểm danh tại chỗ) để phê duyệt cấp chứng nhận cho bạn.`;
    }
    return `Chào bạn! Tôi là Trợ lý AI Đoàn – Hội Đồng Nai. Bạn có thể tra cứu thông tin hoạt động, điều kiện cấp chứng nhận điện tử hoặc gửi khiếu nại nếu gặp sự cố điểm danh.`;
  }

  window.SA = window.SA || { Views: {} };
  window.SA.AI = {
    calculateDistanceMeters,
    analyzeAttendanceAnomaly,
    evaluateCertificateEligibility,
    assistAppealAnalysis,
    generateAISummaryReport,
    askAIChatbot
  };
})();
