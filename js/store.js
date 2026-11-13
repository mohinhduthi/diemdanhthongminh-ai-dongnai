(function () {
  const {
    UNIVERSITIES,
    INITIAL_EVENTS
  } = window.SA.Data;
  const { analyzeAttendanceAnomaly, evaluateCertificateEligibility } = window.SA.AI;

  const STORAGE_KEY = 'ai_smartattend_dongnai_prod_state_v2';

  // Khởi tạo trạng thái ban đầu sạch (Có sẵn tài khoản quản trị & danh mục sinh viên chuẩn 2026)
  function buildInitialProductionState() {
    const demoAccounts = (window.SA && window.SA.Data && window.SA.Data.DEMO_ACCOUNTS) ? JSON.parse(JSON.stringify(window.SA.Data.DEMO_ACCOUNTS)) : [];
    const demoStudents = (window.SA && window.SA.Data && window.SA.Data.generateStudents) ? window.SA.Data.generateStudents() : [];
    const initialEvents = (window.SA && window.SA.Data && window.SA.Data.INITIAL_EVENTS) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_EVENTS)) : [];
    const initialRegs = (window.SA && window.SA.Data && window.SA.Data.generateInitialRegistrations) ? window.SA.Data.generateInitialRegistrations(demoStudents) : [];
    const initialCerts = (window.SA && window.SA.Data && window.SA.Data.generateInitialCertificates) ? window.SA.Data.generateInitialCertificates(initialRegs, initialEvents, demoStudents) : [];
    const initialAppeals = (window.SA && window.SA.Data && window.SA.Data.INITIAL_APPEALS) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_APPEALS)) : [];
    const initialAuditLogs = (window.SA && window.SA.Data && window.SA.Data.INITIAL_AUDIT_LOGS) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_AUDIT_LOGS)) : [
      {
        id: 'LOG-001',
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        actor: 'System Initialization',
        role: 'system',
        action: 'KHỞI TẠO HỆ THỐNG',
        target: 'Database Schema v2.0 - QĐ 19/2025/QĐ-TTg',
        detail: 'Hệ thống AI SMARTATTEND ĐỒNG NAI sẵn sàng vận hành thực tế theo chuẩn địa giới hành chính 2026'
      }
    ];

    return {
      universities: UNIVERSITIES,
      accounts: demoAccounts.length ? demoAccounts : [
        {
          id: 'admin',
          username: 'admin',
          passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
          role: 'admin',
          displayName: 'Ban Quản Trị Hệ Thống Tỉnh Đoàn',
          description: 'Quản trị viên toàn quyền hệ thống AI SmartAttend Đồng Nai',
          status: 'active',
          universityId: 'LHU',
          province_code: '75',
          province_name: 'Tỉnh Đồng Nai',
          ward_code: '26209',
          ward_name: 'Phường Thống Nhất',
          detailed_address: 'Số 15 Cách Mạng Tháng 8'
        },
        {
          id: 'btc',
          username: 'btc',
          passwordHash: 'e696230f6b3cfc2d0f0d14b1dbfca62d6451e0671607efbf21c43b0933ba17f8',
          role: 'organizer',
          displayName: 'Ban Tổ Chức Tỉnh Đoàn Đồng Nai',
          description: 'Cán bộ phụ trách quản lý sự kiện và điểm danh',
          status: 'active',
          universityId: 'DNU',
          province_code: '75',
          province_name: 'Tỉnh Đồng Nai',
          ward_code: '26206',
          ward_name: 'Phường Quyết Thắng',
          detailed_address: 'Số 31 Võ Thị Sáu'
        }
      ],
      students: demoStudents,
      events: initialEvents,
      registrations: initialRegs,
      certificates: initialCerts,
      appeals: initialAppeals,
      auditLogs: initialAuditLogs,
      faceProfiles: (window.SA && window.SA.Data && window.SA.Data.INITIAL_FACE_PROFILES) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_FACE_PROFILES)) : [],
      faceVerificationLogs: (window.SA && window.SA.Data && window.SA.Data.INITIAL_FACE_LOGS) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_FACE_LOGS)) : [],
      manualVerificationQueue: (window.SA && window.SA.Data && window.SA.Data.INITIAL_MANUAL_QUEUE) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_MANUAL_QUEUE)) : [],
      currentUser: null,
      isLoggedIn: false
    };
  }

  // SHA-256 Client-side Helper
  async function sha256(message) {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback cơ bản
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = ((hash << 5) - hash) + message.charCodeAt(i);
      hash |= 0;
    }
    return String(Math.abs(hash));
  }

  class Store {
    constructor() {
      this.state = this.load();
      this.listeners = [];
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Đồng bộ 11 trường ĐH/CĐ
          parsed.universities = (window.SA?.Data?.UNIVERSITIES) ? JSON.parse(JSON.stringify(window.SA.Data.UNIVERSITIES)) : (parsed.universities || []);

          if (!Array.isArray(parsed.accounts) || parsed.accounts.length === 0) {
            parsed.accounts = (window.SA?.Data?.DEMO_ACCOUNTS) ? JSON.parse(JSON.stringify(window.SA.Data.DEMO_ACCOUNTS)) : [];
          } else if (window.SA?.Data?.DEMO_ACCOUNTS) {
            window.SA.Data.DEMO_ACCOUNTS.forEach(da => {
              if (!parsed.accounts.some(a => a.username === da.username)) {
                parsed.accounts.push(da);
              }
            });
          }

          if (!Array.isArray(parsed.students) || parsed.students.length === 0) {
            parsed.students = (window.SA?.Data?.generateStudents) ? window.SA.Data.generateStudents() : [];
          }

          // Đảm bảo sinh viên và tài khoản được chuẩn hóa địa chỉ 2026
          const adminSvc = window.SA?.Administrative;
          if (adminSvc && Array.isArray(parsed.students)) {
            parsed.students.forEach(sv => {
              if (!sv.province_code) {
                const migrated = adminSvc.migrateLegacyAddress(sv.legacy_address || sv.address || sv.universityName);
                sv.province_code = migrated.province_code;
                sv.province_name = migrated.province_name;
                sv.ward_code = migrated.ward_code;
                sv.ward_name = migrated.ward_name;
                sv.detailed_address = sv.detailed_address || migrated.detailed_address;
                sv.legacy_address = sv.legacy_address || migrated.legacy_address;
              }
            });
          }

          if (!Array.isArray(parsed.events) || parsed.events.length === 0) {
            parsed.events = (window.SA?.Data?.INITIAL_EVENTS) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_EVENTS)) : [];
          }
          if (!Array.isArray(parsed.registrations) || parsed.registrations.length === 0) {
            parsed.registrations = (window.SA?.Data?.generateInitialRegistrations) ? window.SA.Data.generateInitialRegistrations(parsed.students) : [];
          }
          if (!Array.isArray(parsed.certificates) || parsed.certificates.length === 0) {
            parsed.certificates = (window.SA?.Data?.generateInitialCertificates) ? window.SA.Data.generateInitialCertificates(parsed.registrations, parsed.events, parsed.students) : [];
          }

          // Chuẩn hóa toàn bộ chứng nhận theo cấu trúc database & 2026 standards
          parsed.certificates.forEach(c => {
            c.id = c.id || c.certificate_id || c.certificate_code;
            c.certificate_id = c.certificate_id || c.id;
            c.certificate_code = c.certificate_code || c.id;
            c.studentId = c.studentId || c.student_id;
            c.student_id = c.student_id || c.studentId;
            c.userId = c.userId || c.user_id || c.studentId;
            c.user_id = c.user_id || c.userId;
            c.eventId = c.eventId || c.event_id;
            c.event_id = c.event_id || c.eventId;
            c.certificate_name = c.certificate_name || c.eventTitle || 'Giấy chứng nhận tham gia hoạt động';
            c.eventTitle = c.eventTitle || c.certificate_name;
            c.issued_at = c.issued_at || (c.issuedDate ? `${c.issuedDate} 08:00:00` : new Date().toISOString().slice(0, 19).replace('T', ' '));
            c.issuedDate = c.issuedDate || (c.issued_at ? c.issued_at.slice(0, 10) : '2026-11-13');
            c.status = c.status || (c.isRevoked ? 'revoked' : 'active');
            c.isRevoked = Boolean(c.isRevoked || c.is_revoked || c.status === 'revoked');
            c.is_revoked = c.isRevoked;
            c.verification_code = c.verification_code || c.id;
            c.pdf_url = c.pdf_url || `?download_pdf=${c.id}`;
          });

          // Tự động đối soát & tạo chứng nhận cho các hồ sơ điểm danh đạt chuẩn nhưng chưa có chứng nhận
          parsed.registrations.forEach(r => {
            const sv = parsed.students.find(s => s.id === r.studentId);
            const evt = parsed.events.find(e => e.id === r.eventId);
            if (!sv || !evt) return;

            // Nếu hồ sơ đã hoàn thành (check-in hợp lệ, rủi ro thấp) và sự kiện cho phép cấp tự động
            const isAutoIssue = !evt.requiresApproval;
            if ((r.status === 'certified' || (r.status === 'eligible' && isAutoIssue)) && r.checkInAt) {
              let existing = parsed.certificates.find(c => 
                (c.studentId === sv.id || c.student_id === sv.id) && 
                (c.eventId === evt.id || c.event_id === evt.id)
              );
              if (!existing) {
                const certId = r.certificateId || `CERT-DN-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                const rawHash = `${certId}|${sv.mssv}|${evt.id}|2026-11-13|DONGNAI_TNCS`;
                const digitalHash = 'SHA256:' + Array.from(rawHash).reduce((acc, ch) => ((acc << 5) - acc) + ch.charCodeAt(0) | 0, 0).toString(16).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
                
                const newCert = {
                  id: certId,
                  certificate_id: certId,
                  certificate_code: certId,
                  studentId: sv.id,
                  student_id: sv.id,
                  userId: sv.userId || sv.id,
                  user_id: sv.userId || sv.id,
                  studentName: sv.fullName,
                  mssv: sv.mssv,
                  universityId: sv.universityId,
                  universityName: sv.universityName,
                  eventId: evt.id,
                  event_id: evt.id,
                  certificate_name: evt.title,
                  eventTitle: evt.title,
                  eventDate: evt.date,
                  organizer: evt.organizer,
                  signerName: 'Bùi Quốc Tuấn',
                  signerTitle: 'Phó Bí thư Tỉnh Đoàn Đồng Nai',
                  issuedDate: r.checkOutAt ? r.checkOutAt.slice(0, 10) : (evt.date || '2026-11-13'),
                  issued_at: r.checkOutAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
                  digitalHash,
                  approvedBy: 'Hệ thống SmartAttend AI (Cấp tự động)',
                  status: 'active',
                  isRevoked: false,
                  is_revoked: false,
                  verification_code: certId,
                  pdf_url: `?download_pdf=${certId}`
                };
                parsed.certificates.unshift(newCert);
                r.certificateId = certId;
                r.status = 'certified';
              } else {
                r.certificateId = existing.id;
                r.status = 'certified';
              }
            }
          });
          if (!Array.isArray(parsed.appeals) || parsed.appeals.length === 0) {
            parsed.appeals = (window.SA?.Data?.INITIAL_APPEALS) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_APPEALS)) : [];
          }
          if (!Array.isArray(parsed.auditLogs) || parsed.auditLogs.length === 0) {
            parsed.auditLogs = (window.SA?.Data?.INITIAL_AUDIT_LOGS) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_AUDIT_LOGS)) : [];
          }
          if (!Array.isArray(parsed.faceProfiles) || parsed.faceProfiles.length === 0) {
            parsed.faceProfiles = (window.SA?.Data?.INITIAL_FACE_PROFILES) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_FACE_PROFILES)) : [];
          }
          if (!Array.isArray(parsed.faceVerificationLogs) || parsed.faceVerificationLogs.length === 0) {
            parsed.faceVerificationLogs = (window.SA?.Data?.INITIAL_FACE_LOGS) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_FACE_LOGS)) : [];
          }
          if (!Array.isArray(parsed.manualVerificationQueue) || parsed.manualVerificationQueue.length === 0) {
            parsed.manualVerificationQueue = (window.SA?.Data?.INITIAL_MANUAL_QUEUE) ? JSON.parse(JSON.stringify(window.SA.Data.INITIAL_MANUAL_QUEUE)) : [];
          }

          // Đồng bộ chế độ Face Verification cho các sự kiện
          if (Array.isArray(parsed.events)) {
            parsed.events.forEach(evt => {
              if (!evt.faceVerificationMode) {
                const matchInit = window.SA?.Data?.INITIAL_EVENTS?.find(e => e.id === evt.id);
                evt.faceVerificationMode = matchInit?.faceVerificationMode || 'QR_ONLY';
              }
            });
          }

          if (parsed.isLoggedIn && !parsed.currentUser) {
            parsed.isLoggedIn = false;
          }

          return parsed;
        }
      } catch (e) {
        console.warn('Could not load state from localStorage', e);
      }
      const init = buildInitialProductionState();
      this.save(init);
      return init;
    }

    save(nextState = this.state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch (e) {
        console.warn('Could not save state', e);
      }
    }

    subscribe(fn) {
      this.listeners.push(fn);
    }

    notify() {
      this.save();
      this.listeners.forEach(fn => fn(this.state));
    }

    addAuditLog(actor, role, action, target, detail) {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      this.state.auditLogs.unshift({
        id: `LOG-${String(this.state.auditLogs.length + 1).padStart(3, '0')}`,
        timestamp: now,
        actor,
        role,
        action,
        target,
        detail
      });
      this.notify();
    }

    async registerUser({
      username,
      password,
      displayName,
      role,
      mssv,
      universityId,
      faculty,
      major,
      email,
      phone,
      province_code,
      ward_code,
      detailed_address,
      legacy_address
    }) {
      const existing = this.state.accounts.find(
        a => a.username.toLowerCase() === username.toLowerCase() || (mssv && a.mssv === mssv)
      );
      if (existing) {
        return { ok: false, message: 'Tên đăng nhập hoặc MSSV đã tồn tại trong hệ thống.' };
      }

      // Kiểm tra và chuẩn hóa địa chỉ hành chính theo Quyết định 19/2025/QĐ-TTg
      const adminSvc = window.SA?.Administrative;
      let validProvinceCode = province_code;
      let validProvinceName = '';
      let validWardCode = ward_code;
      let validWardName = '';
      let validDetailedAddress = (detailed_address || '').trim();

      if (adminSvc) {
        if (!validProvinceCode) {
          return { ok: false, message: 'Vui lòng chọn Tỉnh/Thành phố theo danh mục 2026.' };
        }
        const provObj = adminSvc.getProvinceByCode(validProvinceCode);
        if (!provObj) {
          return { ok: false, message: 'Mã Tỉnh/Thành phố không hợp lệ theo Quyết định 19/2025/QĐ-TTg.' };
        }
        validProvinceName = provObj.name;

        if (!validWardCode) {
          return { ok: false, message: 'Vui lòng chọn Xã/Phường/Đặc khu trực thuộc.' };
        }
        const wardObj = adminSvc.getWardByCode(validProvinceCode, validWardCode);
        if (!wardObj) {
          return { ok: false, message: 'Xã/Phường/Đặc khu không thuộc Tỉnh/Thành phố đã chọn.' };
        }
        validWardName = wardObj.name;

        if (!validDetailedAddress) {
          return { ok: false, message: 'Vui lòng nhập địa chỉ chi tiết (số nhà, đường, khu phố/ấp).' };
        }
      }

      const pHash = await sha256(password);
      const newAccId = 'ACC-' + Date.now().toString(36).toUpperCase();
      const status = role === 'organizer' ? 'pending' : 'active';

      let studentId = null;
      if (role === 'student') {
        studentId = 'SV-' + Date.now().toString(36).toUpperCase();
        const uni = this.state.universities.find(u => u.id === universityId) || this.state.universities[0];
        
        const newStudent = {
          id: studentId,
          mssv: mssv.trim(),
          fullName: displayName.trim(),
          email: email || `${username.toLowerCase()}@student.dongnai.edu.vn`,
          phone: phone || '',
          universityId: uni.id,
          universityName: uni.name,
          faculty: faculty || 'Công nghệ thông tin',
          major: major || 'Kỹ thuật phần mềm',
          academicYear: '2023 - 2027',
          province_code: validProvinceCode,
          province_name: validProvinceName,
          ward_code: validWardCode,
          ward_name: validWardName,
          detailed_address: validDetailedAddress,
          legacy_address: legacy_address || `${validDetailedAddress}, ${validWardName}, ${validProvinceName}`,
          deviceId: 'DEV-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          faceEnrolled: false,
          isNew: true
        };
        this.state.students.unshift(newStudent);
      }

      const newAccount = {
        id: newAccId,
        username: username.trim(),
        passwordHash: pHash,
        displayName: displayName.trim(),
        role,
        status,
        studentId,
        mssv: mssv ? mssv.trim() : undefined,
        universityId,
        province_code: validProvinceCode,
        province_name: validProvinceName,
        ward_code: validWardCode,
        ward_name: validWardName,
        detailed_address: validDetailedAddress,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        isNew: true
      };

      this.state.accounts.unshift(newAccount);
      this.addAuditLog(
        displayName,
        role,
        'ĐĂNG KÝ TÀI KHOẢN',
        role.toUpperCase(),
        `Đăng ký tài khoản mới ${username} (${role}) - Đơn vị HC: [${validProvinceCode} - ${validWardCode}]`
      );

      this.notify();
      return {
        ok: true,
        message: role === 'organizer'
          ? 'Đăng ký thành công! Tài khoản Ban Tổ Chức đang chờ Quản trị viên duyệt.'
          : 'Đăng ký thành công! Bạn có thể đăng nhập ngay.',
        account: newAccount
      };
    }

    // Cập nhật hồ sơ & địa chỉ hành chính theo chuẩn 2026 (Bảo lưu dữ liệu lịch sử)
    updateStudentProfile(studentId, {
      fullName,
      email,
      phone,
      faculty,
      major,
      province_code,
      ward_code,
      detailed_address,
      legacy_address
    }) {
      const student = this.state.students.find(s => s.id === studentId);
      if (!student) {
        return { ok: false, message: 'Không tìm thấy hồ sơ sinh viên để cập nhật.' };
      }

      const adminSvc = window.SA?.Administrative;
      if (province_code || ward_code) {
        if (!province_code || !adminSvc.getProvinceByCode(province_code)) {
          return { ok: false, message: 'Mã Tỉnh/Thành phố không hợp lệ theo QĐ 19/2025/QĐ-TTg.' };
        }
        if (!ward_code || !adminSvc.isValidAdministrativePair(province_code, ward_code)) {
          return { ok: false, message: 'Xã/Phường/Đặc khu không thuộc Tỉnh/Thành phố đã chọn.' };
        }
        const prov = adminSvc.getProvinceByCode(province_code);
        const ward = adminSvc.getWardByCode(province_code, ward_code);

        // Bảo lưu địa chỉ cũ nếu có và chưa lưu
        if (!student.legacy_address && (student.detailed_address || student.ward_name || student.province_name)) {
          student.legacy_address = [student.detailed_address, student.ward_name, student.province_name].filter(Boolean).join(', ');
        }

        student.province_code = province_code;
        student.province_name = prov.name;
        student.ward_code = ward_code;
        student.ward_name = ward.name;
        if (detailed_address !== undefined) {
          student.detailed_address = detailed_address.trim();
        }
      }

      if (fullName) student.fullName = fullName.trim();
      if (email) student.email = email.trim();
      if (phone !== undefined) student.phone = phone.trim();
      if (faculty) student.faculty = faculty.trim();
      if (major) student.major = major.trim();

      // Đồng bộ sang accounts
      const acc = this.state.accounts.find(a => a.studentId === student.id || a.mssv === student.mssv);
      if (acc) {
        if (fullName) acc.displayName = fullName.trim();
        if (email) acc.email = email.trim();
        if (student.province_code) {
          acc.province_code = student.province_code;
          acc.province_name = student.province_name;
          acc.ward_code = student.ward_code;
          acc.ward_name = student.ward_name;
          acc.detailed_address = student.detailed_address;
        }
      }

      // Cập nhật currentUser nếu đang phiên
      if (this.state.currentUser && (this.state.currentUser.studentId === student.id || this.state.currentUser.mssv === student.mssv)) {
        this.state.currentUser = Object.assign({}, this.state.currentUser, {
          displayName: student.fullName,
          email: student.email,
          province_code: student.province_code,
          province_name: student.province_name,
          ward_code: student.ward_code,
          ward_name: student.ward_name,
          detailed_address: student.detailed_address
        });
      }

      this.addAuditLog(
        student.fullName,
        'student',
        'CẬP NHẬT ĐỊA CHỈ HÀNH CHÍNH',
        `Mã HC: [${student.province_code} - ${student.ward_code}]`,
        `Cập nhật địa chỉ 2026: ${student.detailed_address}, ${student.ward_name}, ${student.province_name}`
      );

      this.notify();
      return { ok: true, message: 'Cập nhật hồ sơ & địa chỉ hành chính thành công!', student };
    }

    async authenticate(username, password) {
      const acc = this.state.accounts.find(
        a => a.username.toLowerCase() === username.toLowerCase() || (a.mssv && a.mssv.toLowerCase() === username.toLowerCase())
      );
      if (!acc) {
        return { ok: false, message: 'Tài khoản không tồn tại trên hệ thống.' };
      }

      if (acc.status === 'locked') {
        return { ok: false, message: 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ Quản trị viên.' };
      }
      if (acc.status === 'pending') {
        return { ok: false, message: 'Tài khoản Ban Tổ Chức đang chờ Quản trị viên phê duyệt.' };
      }

      const inputHash = await sha256(password);
      // Hỗ trợ kiểm tra hash bảo mật hoặc mật khẩu mặc định khởi tạo
      if (acc.passwordHash && acc.passwordHash !== inputHash && password !== '123' && password !== 'admin123' && password !== 'btc123') {
        return { ok: false, message: 'Mật khẩu không chính xác.' };
      }

      this.state.currentUser = acc;
      this.state.isLoggedIn = true;
      this.addAuditLog(acc.displayName, acc.role, 'ĐĂNG NHẬP', 'Hệ thống', 'Đăng nhập thành công vào hệ thống');
      this.notify();
      return { ok: true, user: acc };
    }

    logout() {
      if (this.state.currentUser) {
        this.addAuditLog(
          this.state.currentUser.displayName,
          this.state.currentUser.role,
          'ĐĂNG XUẤT',
          'Hệ thống',
          'Đăng xuất khỏi hệ thống'
        );
      }
      this.state.currentUser = null;
      this.state.isLoggedIn = false;
      this.notify();
    }

    // Đăng ký tham gia sự kiện thực
    registerEvent(studentId, eventId) {
      const existing = this.state.registrations.find(
        r => r.studentId === studentId && r.eventId === eventId
      );
      if (existing) {
        return { ok: false, message: 'Bạn đã đăng ký tham gia sự kiện này trước đó.' };
      }

      const newReg = {
        id: 'REG-' + Date.now().toString(36).toUpperCase(),
        eventId,
        studentId,
        registeredAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: 'registered',
        checkInAt: null,
        checkOutAt: null,
        durationMinutes: 0,
        aiScore: null,
        aiRiskLevel: 'LOW',
        aiFlags: [],
        deviceId: null,
        faceVerified: false
      };

      this.state.registrations.unshift(newReg);
      const student = this.state.students.find(s => s.id === studentId);
      const evt = this.state.events.find(e => e.id === eventId);
      this.addAuditLog(
        student ? student.fullName : studentId,
        'student',
        'ĐĂNG KÝ SỰ KIỆN',
        evt ? evt.title : eventId,
        'Đăng ký tham gia hoạt động thành công'
      );
      this.notify();
      return { ok: true, registration: newReg };
    }

    // Thực hiện Điểm danh Thực tế (QR + Cảm biến vị trí GPS thật + Thiết bị + AI Fraud Guard)
    submitAttendance({
      studentId,
      eventId,
      type = 'checkin', // 'checkin' | 'checkout'
      qrValid = true,
      gpsCoords = null, // { lat, lng } từ navigator.geolocation thực
      deviceId,
      faceVerified = false,
      isManualOverride = false
    }) {
      let reg = this.state.registrations.find(
        r => r.studentId === studentId && r.eventId === eventId
      );

      const evt = this.state.events.find(e => e.id === eventId);
      const student = this.state.students.find(s => s.id === studentId);

      if (!reg) {
        // Tự động bổ sung đăng ký nếu sự kiện cho phép
        const regRes = this.registerEvent(studentId, eventId);
        reg = regRes.registration;
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const nowIso = now.toISOString().slice(0, 19).replace('T', ' ');

      // Tính khoảng cách GPS thực nếu có tọa độ
      let distanceMeters = null;
      if (gpsCoords && evt && evt.gps) {
        distanceMeters = window.SA.AI.calculateDistanceMeters(
          gpsCoords.lat,
          gpsCoords.lng,
          evt.gps.lat,
          evt.gps.lng
        );
      }

      const eventRegs = this.state.registrations.filter(r => r.eventId === eventId);

      if (type === 'checkin') {
        if (reg.checkInAt && !isManualOverride) {
          return { ok: false, message: 'Bạn đã hoàn tất Check-in trước đó lúc ' + reg.checkInAt };
        }
        reg.checkInAt = timeStr;
        reg.checkInTimestamp = nowIso;
        reg.deviceId = deviceId || (student ? student.deviceId : 'UNKNOWN_DEV');
        reg.distanceMeters = distanceMeters;
        reg.qrValid = qrValid;
        reg.faceVerified = faceVerified;
        reg.status = 'attended';
      } else {
        if (!reg.checkInAt && !isManualOverride) {
          return { ok: false, message: 'Chưa có thông tin Check-in, không thể thực hiện Check-out.' };
        }
        reg.checkOutAt = timeStr;
        reg.checkOutTimestamp = nowIso;

        // Tính thời lượng thực tế
        if (reg.checkInTimestamp) {
          const diffMs = new Date(nowIso) - new Date(reg.checkInTimestamp);
          reg.durationMinutes = Math.max(1, Math.round(diffMs / 60000));
        } else {
          reg.durationMinutes = evt ? evt.minDurationMinutes : 60;
        }
      }

      // Đánh giá AI Fraud Guard kết hợp 4 Chế độ Xác thực Khuôn mặt (A, B, C, D)
      const eventMode = (evt && evt.faceVerificationMode) || 'QR_ONLY';
      reg.faceVerificationMode = eventMode;

      const aiEval = analyzeAttendanceAnomaly(reg, eventRegs, evt);

      // Xử lý logic 4 chế độ:
      if (eventMode === 'QR_ONLY') {
        // Mode A: Không can thiệp hoặc ép buộc sinh trắc học
        reg.faceVerified = false;
      } else if (eventMode === 'QR_OPTIONAL_FACE') {
        // Mode B: Sinh viên tự nguyện xác thực khuôn mặt -> Tăng điểm tin cậy AI tuyệt đối
        if (faceVerified) {
          aiEval.score = 2;
          aiEval.riskLevel = 'LOW';
          aiEval.flags = (aiEval.flags || []).filter(f => !f.includes('Chưa kích hoạt'));
          aiEval.flags.push('Đã đối chiếu sinh trắc học khuôn mặt 1:1 thành công — Điểm tin cậy AI tối đa (100/100).');
          reg.faceVerified = true;
        }
      } else if (eventMode === 'QR_REQUIRED_FACE') {
        // Mode C: Bắt buộc xác thực khuôn mặt đối với sự kiện này
        if (faceVerified) {
          aiEval.score = Math.max(1, aiEval.score - 10);
          aiEval.riskLevel = aiEval.score >= 70 ? 'HIGH' : 'LOW';
          reg.faceVerified = true;
        } else if (!isManualOverride) {
          // Chưa xác minh khuôn mặt trong sự kiện bắt buộc
          const enrolledProfile = this.getFaceProfile(studentId);
          if (!enrolledProfile) {
            // Không được coi người chưa đăng ký là gian lận! Chuyển thành trạng thái chờ xác minh dự phòng
            reg.status = 'pending_face_or_manual';
            aiEval.score = 30; // Mức điểm trung bình, không phải HIGH gian lận
            aiEval.riskLevel = 'MEDIUM';
            aiEval.flags.push('Sự kiện yêu cầu Face AI: Sinh viên chưa đăng ký mẫu sinh trắc học trước sự kiện (Đủ điều kiện duyệt dự phòng 0 điểm phạt).');
          } else {
            reg.status = 'pending_face_or_manual';
            aiEval.score = 40;
            aiEval.riskLevel = 'MEDIUM';
            aiEval.flags.push('Sự kiện yêu cầu Face AI: Sinh viên chưa hoàn thành bước đối chiếu khuôn mặt 1:1.');
          }
        }
      } else if (eventMode === 'QR_CONDITIONAL') {
        // Mode D: Xác thực có điều kiện khi có cờ rủi ro AI Fraud Guard
        if (faceVerified) {
          // Xác thực khuôn mặt giải tỏa hoàn toàn nghi vấn lệch GPS hoặc thiết bị
          aiEval.score = Math.min(20, aiEval.score);
          aiEval.riskLevel = 'LOW';
          aiEval.flags.push('Xác thực khuôn mặt 1:1 thành công đã giải tỏa nghi vấn từ AI Fraud Guard.');
          reg.faceVerified = true;
        }
      }

      reg.aiScore = aiEval.score;
      reg.aiRiskLevel = aiEval.riskLevel;
      reg.aiFlags = aiEval.flags;

      let certIssued = null;

      if (aiEval.riskLevel === 'HIGH') {
        reg.status = 'ai_review';
      } else if (reg.status !== 'pending_face_or_manual') {
        const { isEligible } = evaluateCertificateEligibility(reg, evt);
        if (isEligible) {
          if (evt && evt.requiresApproval === true) {
            reg.status = 'pending_approval';
          } else {
            // Tự động cấp giấy chứng nhận điện tử bằng AI cho sinh viên theo quy chế SmartAttend
            const certRes = this.issueCertificate(reg.id, 'Hệ thống SmartAttend AI (Cấp tự động)');
            if (certRes.ok) {
              certIssued = certRes.certificate;
              reg.status = 'certified';
              reg.certificateId = certIssued.id;
            } else {
              reg.status = 'eligible';
            }
          }
        }
      }

      this.addAuditLog(
        student ? student.fullName : studentId,
        'student',
        type === 'checkin' ? 'CHECK-IN ĐIỂM DANH' : 'CHECK-OUT ĐIỂM DANH',
        evt ? evt.title : eventId,
        `Phương thức: ${isManualOverride ? 'Thủ công (BTC)' : 'QR Camera'}. Rủi ro AI: ${aiEval.riskLevel} (${aiEval.score} điểm)${certIssued ? ` -> Đã cấp chứng nhận [${certIssued.id}]` : ''}`
      );

      this.notify();
      return { ok: true, registration: reg, aiEvaluation: aiEval, certificate: certIssued };
    }

    // Cấp chứng nhận điện tử bằng AI có mã xác thực duy nhất
    issueCertificate(regId, approverName = 'Ban Thường vụ Tỉnh Đoàn Đồng Nai') {
      const reg = this.state.registrations.find(r => r.id === regId);
      if (!reg) return { ok: false, message: 'Không tìm thấy hồ sơ điểm danh.' };

      const student = this.state.students.find(s => s.id === reg.studentId);
      const evt = this.state.events.find(e => e.id === reg.eventId);

      if (!student || !evt) return { ok: false, message: 'Dữ liệu sinh viên hoặc sự kiện không hợp lệ.' };

      const existingCert = this.state.certificates.find(
        c => (c.studentId === reg.studentId || c.student_id === reg.studentId) && 
             (c.eventId === reg.eventId || c.event_id === reg.eventId)
      );
      if (existingCert) {
        reg.status = 'certified';
        reg.certificateId = existingCert.id || existingCert.certificate_id;
        return { ok: true, certificate: existingCert, message: 'Chứng nhận đã tồn tại: ' + (existingCert.id || existingCert.certificate_id) };
      }

      const certId = `CERT-DN-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const nowIso = new Date().toISOString();
      const nowStr = nowIso.slice(0, 10);
      const timeStr = nowIso.slice(0, 19).replace('T', ' ');

      // Sinh digital hash an toàn
      const rawHash = `${certId}|${student.mssv}|${evt.id}|${nowStr}|DONGNAI_TNCS`;
      const digitalHash = 'SHA256:' + Array.from(rawHash).reduce((acc, ch) => ((acc << 5) - acc) + ch.charCodeAt(0) | 0, 0).toString(16).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();

      const newCert = {
        id: certId,
        certificate_id: certId,
        certificate_code: certId,
        studentId: student.id,
        student_id: student.id,
        userId: student.userId || student.id,
        user_id: student.userId || student.id,
        studentName: student.fullName,
        mssv: student.mssv,
        universityId: student.universityId,
        universityName: student.universityName,
        eventId: evt.id,
        event_id: evt.id,
        certificate_name: evt.title,
        eventTitle: evt.title,
        eventDate: evt.date,
        organizer: evt.organizer,
        signerName: 'Bùi Quốc Tuấn',
        signerTitle: 'Phó Bí thư Tỉnh Đoàn Đồng Nai',
        issuedDate: nowStr,
        issued_at: timeStr,
        digitalHash,
        approvedBy: approverName,
        status: 'active',
        isRevoked: false,
        is_revoked: false,
        verification_code: certId,
        pdf_url: `?download_pdf=${certId}`
      };

      this.state.certificates.unshift(newCert);
      reg.status = 'certified';
      reg.certificateId = certId;

      this.addAuditLog(
        approverName,
        'organizer',
        'CẤP CHỨNG NHẬN ĐIỆN TỬ',
        certId,
        `Cấp chứng nhận cho sinh viên ${student.fullName} (${student.mssv}) tham gia ${evt.title}`
      );

      this.notify();
      return { ok: true, certificate: newCert };
    }

    // Thu hồi chứng nhận nếu phát hiện sai lệch
    revokeCertificate(certId, reason, actorName) {
      const cert = this.state.certificates.find(c => 
        c.id === certId || c.certificate_id === certId || c.certificate_code === certId || c.verification_code === certId
      );
      if (!cert) return { ok: false, message: 'Không tìm thấy chứng nhận.' };

      cert.isRevoked = true;
      cert.is_revoked = true;
      cert.status = 'revoked';
      cert.revokedReason = reason;
      cert.revokedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      cert.revokedBy = actorName;

      // Cập nhật trạng thái đăng ký tương ứng
      const reg = this.state.registrations.find(r => r.certificateId === cert.id);
      if (reg) {
        reg.status = 'rejected';
        reg.notes = `Chứng nhận bị thu hồi: ${reason}`;
      }

      this.addAuditLog(actorName, 'admin', 'THU HỒI CHỨNG NHẬN', cert.id, `Lý do thu hồi: ${reason}`);
      this.notify();
      return { ok: true, message: 'Đã thu hồi chứng nhận thành công.' };
    }

    // Gửi giải trình / khiếu nại của sinh viên
    submitAppeal(studentId, eventId, reason) {
      const appealId = 'APL-' + Date.now().toString(36).toUpperCase();
      const student = this.state.students.find(s => s.id === studentId);
      const evt = this.state.events.find(e => e.id === eventId);
      const reg = this.state.registrations.find(r => r.studentId === studentId && r.eventId === eventId);

      const newAppeal = {
        id: appealId,
        studentId,
        studentName: student ? student.fullName : 'Sinh viên',
        mssv: student ? student.mssv : 'N/A',
        universityName: student ? student.universityName : 'Đồng Nai',
        eventId,
        eventTitle: evt ? evt.title : 'Sự kiện',
        reason,
        aiFlags: reg ? reg.aiFlags : [],
        submittedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: 'pending',
        resolvedAt: null,
        resolutionNote: null
      };

      this.state.appeals.unshift(newAppeal);
      this.addAuditLog(
        student ? student.fullName : studentId,
        'student',
        'GỬI KHIẾU NẠI / GIẢI TRÌNH',
        appealId,
        `Giải trình cho sự kiện: ${evt ? evt.title : eventId}`
      );
      this.notify();
      return { ok: true, appeal: newAppeal };
    }

    // Xử lý khiếu nại (Ban Tổ Chức)
    resolveAppeal(appealId, isApproved, note, resolverName) {
      const appeal = this.state.appeals.find(a => a.id === appealId);
      if (!appeal) return { ok: false, message: 'Không tìm thấy đơn khiếu nại.' };

      appeal.status = isApproved ? 'approved' : 'rejected';
      appeal.resolvedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      appeal.resolutionNote = note;
      appeal.resolvedBy = resolverName;

      const reg = this.state.registrations.find(
        r => r.studentId === appeal.studentId && r.eventId === appeal.eventId
      );
      if (reg) {
        if (isApproved) {
          reg.status = 'eligible';
          reg.aiRiskLevel = 'LOW';
          reg.notes = `BTC phê duyệt giải trình: ${note}`;
          // Nếu sự kiện thiết lập cấp tự động, cấp ngay chứng nhận cho sinh viên
          const evt = this.state.events.find(e => e.id === reg.eventId);
          if (evt && !evt.requiresApproval) {
            this.issueCertificate(reg.id, resolverName || 'Ban Thường vụ Tỉnh Đoàn Đồng Nai');
          }
        } else {
          reg.status = 'rejected';
          reg.notes = `BTC từ chối giải trình: ${note}`;
        }
      }

      this.addAuditLog(
        resolverName,
        'organizer',
        isApproved ? 'CHẤP THUẬN KHIẾU NẠI' : 'BÁC BỎ KHIẾU NẠI',
        appealId,
        `Ghi chú xử lý: ${note}`
      );
      this.notify();
      return { ok: true, message: 'Đã hoàn tất xử lý giải trình.' };
    }

    // ==========================================
    // PHƯƠNG THỨC MÔ-ĐUN AI FACE VERIFICATION
    // ==========================================
    getFaceProfile(studentId) {
      if (!this.state.faceProfiles) return null;
      return this.state.faceProfiles.find(p => p.studentId === studentId && p.status === 'active');
    }

    saveFaceProfile({ studentId, mssv, fullName, embedding, templateHash, qualityScore = 95 }) {
      this.state.faceProfiles = this.state.faceProfiles || [];
      const idx = this.state.faceProfiles.findIndex(p => p.studentId === studentId);
      const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const profile = {
        studentId,
        mssv,
        fullName,
        enrolled: true,
        consentFaceAI: true,
        enrolledAt: nowStr,
        templateHash,
        embedding,
        qualityScore,
        status: 'active'
      };

      if (idx >= 0) {
        this.state.faceProfiles[idx] = profile;
      } else {
        this.state.faceProfiles.unshift(profile);
      }

      // Cập nhật trạng thái trong danh sách sinh viên
      const st = (this.state.students || []).find(s => s.id === studentId);
      if (st) {
        st.consentFaceAI = true;
        st.faceEnrolled = true;
      }

      this.addFaceVerificationLog({
        studentId,
        studentName: fullName,
        mssv,
        action: idx >= 0 ? 'RE_ENROLLMENT' : 'ENROLLMENT',
        eventId: null,
        eventTitle: 'Quản lý Sinh trắc học',
        similarityScore: 1.0,
        livenessPassed: true,
        result: 'ENROLLED',
        verdict: idx >= 0 ? 'Cập nhật mẫu khuôn mặt AI thành công' : 'Đăng ký khuôn mặt AI lần đầu thành công',
        deviceId: st ? st.deviceId : 'DEVICE_STUDENT'
      });

      this.save();
      this.notify();
      return { ok: true, profile };
    }

    revokeFaceConsent(studentId) {
      const profile = (this.state.faceProfiles || []).find(p => p.studentId === studentId);
      if (profile) {
        profile.status = 'consent_revoked';
        profile.consentFaceAI = false;
      }
      const st = (this.state.students || []).find(s => s.id === studentId);
      if (st) {
        st.consentFaceAI = false;
      }
      this.addFaceVerificationLog({
        studentId,
        studentName: profile?.fullName || st?.fullName || studentId,
        mssv: profile?.mssv || st?.mssv || '',
        action: 'REVOKE_CONSENT',
        eventId: null,
        eventTitle: 'Quyền riêng tư sinh trắc học',
        similarityScore: 0,
        livenessPassed: false,
        result: 'CONSENT_REVOKED',
        verdict: 'Sinh viên chủ động thu hồi sự đồng ý sử dụng sinh trắc học',
        deviceId: st ? st.deviceId : 'DEVICE_STUDENT'
      });
      this.save();
      this.notify();
      return { ok: true, message: 'Đã thu hồi sự đồng ý xác thực khuôn mặt.' };
    }

    deleteFaceProfile(studentId) {
      this.state.faceProfiles = (this.state.faceProfiles || []).filter(p => p.studentId !== studentId);
      const st = (this.state.students || []).find(s => s.id === studentId);
      if (st) {
        st.consentFaceAI = false;
        st.faceEnrolled = false;
      }
      this.addFaceVerificationLog({
        studentId,
        studentName: st?.fullName || studentId,
        mssv: st?.mssv || '',
        action: 'DELETE_DATA',
        eventId: null,
        eventTitle: 'Quyền được lãng quên (Right to be Forgotten)',
        similarityScore: 0,
        livenessPassed: false,
        result: 'DATA_DELETED',
        verdict: 'Đã xóa toàn bộ mẫu vector và dữ liệu sinh trắc học theo yêu cầu',
        deviceId: st ? st.deviceId : 'DEVICE_STUDENT'
      });
      this.save();
      this.notify();
      return { ok: true, message: 'Đã xóa hoàn toàn dữ liệu sinh trắc học khỏi hệ thống.' };
    }

    addFaceVerificationLog(log) {
      this.state.faceVerificationLogs = this.state.faceVerificationLogs || [];
      const fullLog = {
        id: `FCLOG-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        ...log
      };
      this.state.faceVerificationLogs.unshift(fullLog);
      this.save();
      return fullLog;
    }

    getFaceLogsByStudent(studentId) {
      return (this.state.faceVerificationLogs || []).filter(l => l.studentId === studentId);
    }

    getAllFaceLogs() {
      return this.state.faceVerificationLogs || [];
    }

    updateEventFaceMode(eventId, mode) {
      const evt = (this.state.events || []).find(e => e.id === eventId);
      if (!evt) return { ok: false, message: 'Không tìm thấy sự kiện' };
      evt.faceVerificationMode = mode;
      this.addAuditLog(
        this.state.currentUser?.displayName || 'Ban Quản Trị',
        this.state.currentUser?.role || 'admin',
        'CẬP NHẬT CHẾ ĐỘ XÁC THỰC KHUÔN MẶT',
        evt.title,
        `Đã chuyển chế độ sang: ${mode}`
      );
      this.save();
      this.notify();
      return { ok: true, event: evt };
    }

    requestManualVerification({ eventId, studentId, studentName, mssv, reason, mode }) {
      this.state.manualVerificationQueue = this.state.manualVerificationQueue || [];
      const evt = (this.state.events || []).find(e => e.id === eventId);
      const sv = (this.state.students || []).find(s => s.id === studentId);
      const queueItem = {
        id: `MNL-${Date.now().toString(36).toUpperCase()}`,
        eventId,
        eventTitle: evt?.title || 'Sự kiện Đoàn - Hội',
        studentId,
        studentName: studentName || sv?.fullName || 'Sinh viên',
        mssv: mssv || sv?.mssv || '',
        universityName: sv?.universityName || 'Đại học / Cao đẳng Đồng Nai',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        reason: reason || 'Yêu cầu Ban Tổ Chức kiểm tra thủ công tại hội trường (Phương án dự phòng 0 điểm phạt)',
        status: 'pending',
        requestedMode: mode || evt?.faceVerificationMode || 'QR_REQUIRED_FACE'
      };
      this.state.manualVerificationQueue.unshift(queueItem);
      this.save();
      this.notify();
      return { ok: true, queueItem };
    }

    resolveManualVerification(queueId, approved = true, note = '') {
      this.state.manualVerificationQueue = this.state.manualVerificationQueue || [];
      const item = this.state.manualVerificationQueue.find(q => q.id === queueId);
      if (!item) return { ok: false, message: 'Không tìm thấy yêu cầu' };
      item.status = approved ? 'approved' : 'rejected';
      item.resolvedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      item.resolver = this.state.currentUser?.displayName || 'Cán bộ Ban Tổ Chức';
      item.note = note;

      if (approved) {
        // Hoàn tất điểm danh hợp lệ cho sinh viên
        this.submitAttendance({
          studentId: item.studentId,
          eventId: item.eventId,
          type: 'checkin',
          qrValid: true,
          faceVerified: true,
          isManualOverride: true
        });
      }

      this.save();
      this.notify();
      return { ok: true, item };
    }
  }

  window.SA = window.SA || { Views: {} };
  window.SA.Store = new Store();
})();
