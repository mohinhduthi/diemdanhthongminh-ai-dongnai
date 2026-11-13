// DỮ LIỆU MÔ PHỎNG PHỤC VỤ TRÌNH DIỄN - KHÔNG SỬ DỤNG THÔNG TIN CÁ NHÂN THẬT
(function () {
  const UNIVERSITIES = [
  // Nhóm Đại học
  {
    id: 'LHU',
    group: 'Đại học',
    name: 'Trường Đại học Lạc Hồng',
    shortName: 'ĐH Lạc Hồng',
    address: 'Số 10 Huỳnh Văn Nghệ, P. Bửu Long, TP. Biên Hòa, Đồng Nai',
    faculties: ['Công nghệ Thông tin', 'Quản trị - Kinh tế Quốc tế', 'Kỹ thuật Công trình', 'Dược']
  },
  {
    id: 'DNTU',
    group: 'Đại học',
    name: 'Trường Đại học Công nghệ Đồng Nai (DNTU)',
    shortName: 'ĐH CN Đồng Nai (DNTU)',
    address: 'Đường Nguyễn Khuyến, KP5, P. Trảng Dài, TP. Biên Hòa, Đồng Nai',
    faculties: ['Công nghệ Thông tin', 'Kinh tế - Quản trị', 'Ngoại ngữ', 'Kỹ thuật']
  },
  {
    id: 'DNU',
    group: 'Đại học',
    name: 'Trường Đại học Đồng Nai',
    shortName: 'ĐH Đồng Nai',
    address: 'Số 4 Lê Quý Đôn, P. Tân Hiệp, TP. Biên Hòa, Đồng Nai',
    faculties: ['Sư phạm Tự nhiên', 'Kinh tế', 'Ngoại ngữ', 'Khoa học Xã hội']
  },
  {
    id: 'MIT',
    group: 'Đại học',
    name: 'Trường Đại học Công nghệ Miền Đông',
    shortName: 'ĐH CN Miền Đông',
    address: 'QL1A, Xã Hưng Thịnh, H. Trảng Bom, Đồng Nai',
    faculties: ['Công nghệ Thông tin', 'Kỹ thuật Ô tô', 'Logistics & Quản lý Chuỗi cung ứng', 'Dược học']
  },
  {
    id: 'VNUF2',
    group: 'Đại học',
    name: 'Trường Đại học Lâm nghiệp – Phân hiệu Đồng Nai',
    shortName: 'ĐH Lâm nghiệp PH2',
    address: 'Thị trấn Trảng Bom, H. Trảng Bom, Đồng Nai',
    faculties: ['Quản lý Tài nguyên Rừng', 'Kinh tế & Quản trị Kinh doanh', 'Công nghệ Sinh học']
  },
  // Nhóm Cao đẳng
  {
    id: 'DTTC',
    group: 'Cao đẳng',
    name: 'Trường Cao đẳng Kỹ thuật Công nghệ Đồng Nai',
    shortName: 'CĐ KTCN Đồng Nai',
    address: 'Khu phố 1, P. Tam Hiệp, TP. Biên Hòa, Đồng Nai',
    faculties: ['Cơ khí - Chế tạo máy', 'Điện - Điện tử', 'Công nghệ Thông tin', 'Kinh tế']
  },
  {
    id: 'LILAMA2',
    group: 'Cao đẳng',
    name: 'Trường Cao đẳng Công nghệ Quốc tế Lilama 2',
    shortName: 'CĐ QT Lilama 2',
    address: 'QL51, Xã Long Phước, H. Long Thành, Đồng Nai',
    faculties: ['Cơ điện tử', 'Hàn công nghệ cao', 'Điện công nghiệp', 'Cơ khí chế tạo']
  },
  {
    id: 'DNMC',
    group: 'Cao đẳng',
    name: 'Trường Cao đẳng Y tế Đồng Nai',
    shortName: 'CĐ Y tế Đồng Nai',
    address: 'KP9, P. Tân Biên, TP. Biên Hòa, Đồng Nai',
    faculties: ['Điều dưỡng', 'Dược', 'Kỹ thuật Xét nghiệm Y học', 'Hộ sinh']
  },
  {
    id: 'DNAC',
    group: 'Cao đẳng',
    name: 'Trường Cao đẳng Mỹ thuật Trang trí Đồng Nai',
    shortName: 'CĐ Mỹ thuật TT ĐN',
    address: 'Số 368 đường 30/4, P. Trung Dũng, TP. Biên Hòa, Đồng Nai',
    faculties: ['Thiết kế Đồ họa', 'Thiết kế Nội thất', 'Gốm mỹ nghệ', 'Điêu khắc']
  },
  {
    id: 'SONADEZI',
    group: 'Cao đẳng',
    name: 'Trường Cao đẳng Công nghệ và Quản trị Sonadezi',
    shortName: 'CĐ Sonadezi',
    address: 'Số 1 đường 6A, KCN Biên Hòa II, TP. Biên Hòa, Đồng Nai',
    faculties: ['Quản trị Kinh doanh', 'Công nghệ Thông tin', 'Tiếng Anh thương mại', 'Kế toán']
  },
  {
    id: 'VCMI',
    group: 'Cao đẳng',
    name: 'Trường Cao đẳng Cơ giới và Thủy lợi',
    shortName: 'CĐ Cơ giới & Thủy lợi',
    address: 'Xã Hố Nai 3, H. Trảng Bom, Đồng Nai',
    faculties: ['Công nghệ Ô tô', 'Vận hành máy thi công', 'Kỹ thuật Thủy lợi', 'Điện công nghiệp']
  }
];

const DEMO_ACCOUNTS = [
  {
    id: 'ACC-SV-01',
    username: 'sv001',
    mssv: '122001001',
    password: '123',
    role: 'student',
    studentId: 'SV-001',
    fullName: 'Nguyễn Minh Khang',
    displayName: 'Nguyễn Minh Khang (Sinh viên)',
    email: 'khang.nm.demo@smartattend.edu.vn',
    phone: '0901 *** 101',
    universityId: 'LHU',
    universityName: 'Trường Đại học Lạc Hồng',
    province_code: '75',
    province_name: 'Tỉnh Đồng Nai',
    ward_code: '26176',
    ward_name: 'Phường Bửu Long',
    detailed_address: 'Số 10 Huỳnh Văn Nghệ',
    legacy_address: 'Số 10 Huỳnh Văn Nghệ, P. Bửu Long, TP. Biên Hòa, Đồng Nai',
    status: 'active',
    createdAt: '2026-11-01 08:00',
    description: 'Sinh viên ĐH Lạc Hồng — Có đầy đủ chứng nhận, lịch sử & ca mẫu'
  },
  {
    id: 'ACC-SV-02',
    username: 'sv002',
    mssv: '223004012',
    password: '123',
    role: 'student',
    studentId: 'SV-002',
    fullName: 'Trần Thảo Vy',
    displayName: 'Trần Thảo Vy (Sinh viên có cảnh báo AI)',
    email: 'vy.tt.demo@smartattend.edu.vn',
    phone: '0902 *** 202',
    universityId: 'DNU',
    universityName: 'Trường Đại học Đồng Nai',
    province_code: '75',
    province_name: 'Tỉnh Đồng Nai',
    ward_code: '26179',
    ward_name: 'Phường Tân Hiệp',
    detailed_address: 'Số 4 Lê Quý Đôn',
    legacy_address: 'Số 4 Lê Quý Đôn, P. Tân Hiệp, TP. Biên Hòa, Đồng Nai',
    status: 'active',
    createdAt: '2026-11-01 08:15',
    description: 'Sinh viên ĐH Đồng Nai — Có 1 ca bị AI gắn cờ để test khiếu nại'
  },
  {
    id: 'ACC-BTC-01',
    username: 'btc',
    mssv: 'BTC-001',
    password: '123',
    role: 'organizer',
    fullName: 'Lê Hoàng Nam',
    displayName: 'Lê Hoàng Nam (Cán bộ Thành Đoàn / BTC)',
    email: 'nam.lh.btc@smartattend.edu.vn',
    phone: '0903 *** 303',
    universityId: 'LHU',
    universityName: 'Thành Đoàn TP. Đồng Nai',
    province_code: '75',
    province_name: 'Tỉnh Đồng Nai',
    ward_code: '26206',
    ward_name: 'Phường Quyết Thắng',
    detailed_address: 'Số 31 Võ Thị Sáu',
    unit: 'Thành Đoàn TP. Đồng Nai',
    status: 'active',
    createdAt: '2026-11-01 07:30',
    description: 'Quản lý sự kiện, quét QR động, duyệt cảnh báo AI & cấp chứng nhận'
  },
  {
    id: 'ACC-ADMIN-01',
    username: 'admin',
    mssv: 'ADMIN-001',
    password: '123',
    role: 'admin',
    fullName: 'Phạm Quốc Bảo',
    displayName: 'Phạm Quốc Bảo (Quản trị viên Hệ thống)',
    email: 'admin.demo@smartattend.edu.vn',
    phone: '0909 *** 999',
    universityId: 'DNU',
    universityName: 'Ban Thường vụ Thành Đoàn TP. Đồng Nai',
    province_code: '75',
    province_name: 'Tỉnh Đồng Nai',
    ward_code: '26209',
    ward_name: 'Phường Thống Nhất',
    detailed_address: 'Số 15 Cách Mạng Tháng 8',
    unit: 'Ban Thường vụ Thành Đoàn & Hội Sinh viên TP. Đồng Nai',
    status: 'active',
    createdAt: '2026-11-01 07:00',
    description: 'Dashboard thống kê toàn thành phố, kiểm toán bảo mật & quản lý dữ liệu'
  }
];

const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô'];
const MIDDLE_NAMES = ['Minh', 'Thảo', 'Gia', 'Quốc', 'Thanh', 'Ngọc', 'Anh', 'Bảo', 'Hữu', 'Phương', 'Khánh', 'Tấn'];
const FIRST_NAMES = ['Khang', 'Vy', 'Huy', 'Linh', 'Tài', 'Anh', 'Nhi', 'Phúc', 'Trâm', 'Đạt', 'Khoa', 'Thư', 'Bình', 'Long', 'My', 'Tú'];

// Tạo danh sách 100 sinh viên mẫu (dữ liệu mô phỏng chuẩn hóa địa chỉ 2026)
function generateStudents() {
  const adminSvc = window.SA?.Administrative;
  const dnWards = adminSvc ? adminSvc.getWardsByProvince('75') : [
    { code: '26176', name: 'Phường Bửu Long' },
    { code: '26179', name: 'Phường Tân Hiệp' },
    { code: '26182', name: 'Phường Tam Hiệp' },
    { code: '26185', name: 'Phường Trảng Dài' }
  ];

  const sampleDistributions = [
    { pCode: '75', pName: 'Tỉnh Đồng Nai', wCode: '26176', wName: 'Phường Bửu Long', street: '10 Huỳnh Văn Nghệ' },
    { pCode: '75', pName: 'Tỉnh Đồng Nai', wCode: '26179', wName: 'Phường Tân Hiệp', street: '4 Lê Quý Đôn' },
    { pCode: '75', pName: 'Tỉnh Đồng Nai', wCode: '26182', wName: 'Phường Tam Hiệp', street: '128 Phạm Văn Thuận' },
    { pCode: '75', pName: 'Tỉnh Đồng Nai', wCode: '26185', wName: 'Phường Trảng Dài', street: '85 Nguyễn Khuyến' },
    { pCode: '75', pName: 'Tỉnh Đồng Nai', wCode: '26344', wName: 'Thị trấn Trảng Bom', street: 'QL1A Khu phố 3' },
    { pCode: '75', pName: 'Tỉnh Đồng Nai', wCode: '26410', wName: 'Thị trấn Long Thành', street: 'Lê Duẩn' },
    { pCode: '79', pName: 'Thành phố Hồ Chí Minh', wCode: '26734', wName: 'Phường Bến Nghé', street: '12 Lê Duẩn' },
    { pCode: '79', pName: 'Thành phố Hồ Chí Minh', wCode: '26830', wName: 'Phường Thảo Điền', street: '24 Xuân Thủy' },
    { pCode: '79', pName: 'Thành phố Hồ Chí Minh', wCode: '25720', wName: 'Phường Dĩ An', street: 'Đại lộ Bình Dương' },
    { pCode: '01', pName: 'Thành phố Hà Nội', wCode: '00019', wName: 'Phường Giảng Võ', street: '18 Giảng Võ' },
    { pCode: '01', pName: 'Thành phố Hà Nội', wCode: '00157', wName: 'Phường Dịch Vọng', street: '32 Xuân Thủy' },
    { pCode: '46', pName: 'Thành phố Huế', wCode: '19900', wName: 'Phường Phú Hội', street: '5 Hùng Vương' },
    { pCode: '48', pName: 'Thành phố Đà Nẵng', wCode: '20194', wName: 'Phường Hải Châu 1', street: '42 Bạch Đằng' },
    { pCode: '68', pName: 'Tỉnh Lâm Đồng', wCode: '24800', wName: 'Phường 1 (Đà Lạt)', street: '10 Trần Phú' },
    { pCode: '92', pName: 'Thành phố Cần Thơ', wCode: '31100', wName: 'Phường Tân An', street: '15 Hòa Bình' }
  ];

  const students = [
    {
      id: 'SV-001',
      mssv: '122001001',
      fullName: 'Nguyễn Minh Khang',
      universityId: 'LHU',
      universityName: 'Trường Đại học Lạc Hồng',
      faculty: 'Công nghệ Thông tin',
      major: 'Kỹ thuật Phần mềm',
      email: 'khang.nm.demo@smartattend.edu.vn',
      phone: '0901 *** 101',
      province_code: '75',
      province_name: 'Tỉnh Đồng Nai',
      ward_code: '26176',
      ward_name: 'Phường Bửu Long',
      detailed_address: 'Số 10 Huỳnh Văn Nghệ',
      legacy_address: 'Số 10 Huỳnh Văn Nghệ, P. Bửu Long, TP. Biên Hòa, Đồng Nai',
      deviceId: 'DEV-LHU-9821A',
      consentFaceAI: true
    },
    {
      id: 'SV-002',
      mssv: '223004012',
      fullName: 'Trần Thảo Vy',
      universityId: 'DNU',
      universityName: 'Trường Đại học Đồng Nai',
      faculty: 'Kinh tế',
      major: 'Quản trị Kinh doanh',
      email: 'vy.tt.demo@smartattend.edu.vn',
      phone: '0902 *** 202',
      province_code: '75',
      province_name: 'Tỉnh Đồng Nai',
      ward_code: '26179',
      ward_name: 'Phường Tân Hiệp',
      detailed_address: 'Số 4 Lê Quý Đôn',
      legacy_address: 'Số 4 Lê Quý Đôn, P. Tân Hiệp, TP. Biên Hòa, Đồng Nai',
      deviceId: 'DEV-DNU-4410B',
      consentFaceAI: true
    }
  ];

  for (let i = 3; i <= 100; i++) {
    const uniIdx = (i - 1) % UNIVERSITIES.length;
    const uni = UNIVERSITIES[uniIdx];
    const faculty = uni.faculties[(i * 3) % uni.faculties.length];
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const mid = MIDDLE_NAMES[(i * 5) % MIDDLE_NAMES.length];
    const first = FIRST_NAMES[(i * 11) % FIRST_NAMES.length];
    const numStr = String(i).padStart(3, '0');
    const mssvPrefix = String(110 + uniIdx * 11);

    const dist = sampleDistributions[i % sampleDistributions.length];

    students.push({
      id: `SV-${numStr}`,
      mssv: `${mssvPrefix}00${100 + i}`,
      fullName: `${last} ${mid} ${first}`,
      universityId: uni.id,
      universityName: uni.name,
      faculty,
      major: faculty,
      email: `sv${numStr}.demo@smartattend.edu.vn`,
      phone: `09${(i % 8) + 1}***${numStr}`,
      province_code: dist.pCode,
      province_name: dist.pName,
      ward_code: dist.wCode,
      ward_name: dist.wName,
      detailed_address: `${10 + (i * 3)} ${dist.street}`,
      legacy_address: `${10 + (i * 3)} ${dist.street}, ${dist.wName}, ${dist.pName}`,
      deviceId: `DEV-${uni.id}-${1000 + i * 7}`,
      consentFaceAI: i % 4 !== 0
    });
  }
  return students;
}

const INITIAL_EVENTS = [
  {
    id: 'EVT-01',
    title: 'Hội thảo Khởi nghiệp Đổi mới Sáng tạo Trẻ Đồng Nai 2026',
    organizer: 'Hội Sinh viên TP. Đồng Nai',
    category: 'Học thuật & Khởi nghiệp',
    date: '2026-11-12',
    startTime: '08:00',
    endTime: '11:30',
    location: 'Hội trường A - Trường ĐH Lạc Hồng, TP. Biên Hòa',
    gps: { lat: 10.9574, lng: 106.8427, radiusMeters: 300 },
    capacity: 250,
    minDurationMinutes: 60,
    requiresCheckOut: true,
    status: 'ongoing',
    faceVerificationMode: 'QR_ONLY',
    qrSecret: 'DNAI-EVT01-LIVE',
    description: 'Diễn đàn kết nối sinh viên với hệ sinh thái khởi nghiệp công nghệ AI, chuyển đổi số và quỹ hỗ trợ ý tưởng sáng tạo thanh niên Đồng Nai.'
  },
  {
    id: 'EVT-02',
    title: 'Hội thi Tin học Trẻ & AI Hackathon Sinh viên Đồng Nai',
    organizer: 'Thành Đoàn TP. Đồng Nai',
    category: 'Công nghệ & Chuyển đổi số',
    date: '2026-11-12',
    startTime: '13:30',
    endTime: '17:30',
    location: 'Trung tâm Hội nghị & Tổ chức Sự kiện tỉnh Đồng Nai',
    gps: { lat: 10.9522, lng: 106.8358, radiusMeters: 350 },
    capacity: 180,
    minDurationMinutes: 90,
    requiresCheckOut: true,
    status: 'ongoing',
    faceVerificationMode: 'QR_OPTIONAL_FACE',
    qrSecret: 'DNAI-EVT02-LIVE',
    description: 'Sân chơi lập trình ứng dụng Trí tuệ nhân tạo giải quyết bài toán đô thị thông minh, hành chính công và giáo dục tại địa phương.'
  },
  {
    id: 'EVT-03',
    title: 'Chiến dịch Mùa Hè Xanh Đồng Nai 2026 - Mặt trận Biên Hòa',
    organizer: 'Thành Đoàn & Hội Sinh viên TP. Đồng Nai',
    category: 'Tình nguyện vì cộng đồng',
    date: '2026-10-18',
    startTime: '06:30',
    endTime: '11:30',
    location: 'Phường Bửu Long & Công viên Biên Hùng, TP. Biên Hòa',
    gps: { lat: 10.9491, lng: 106.8245, radiusMeters: 500 },
    capacity: 300,
    minDurationMinutes: 120,
    requiresCheckOut: true,
    status: 'completed',
    faceVerificationMode: 'QR_REQUIRED_FACE',
    qrSecret: 'DNAI-EVT03-END',
    description: 'Ra quân dọn dẹp vệ sinh môi trường, phổ cập kỹ năng số cho người dân và hỗ trợ chuyển đổi số cộng đồng.'
  },
  {
    id: 'EVT-04',
    title: 'Ngày hội Hiến máu Tình nguyện "Giọt hồng Biên Hòa"',
    organizer: 'Hội Sinh viên TP. Đồng Nai',
    category: 'Tình nguyện vì cộng đồng',
    date: '2026-11-20',
    startTime: '07:00',
    endTime: '11:30',
    location: 'Nhà Văn hóa Thanh niên Đồng Nai',
    gps: { lat: 10.9511, lng: 106.8390, radiusMeters: 250 },
    capacity: 400,
    minDurationMinutes: 45,
    requiresCheckOut: true,
    status: 'upcoming',
    faceVerificationMode: 'QR_CONDITIONAL',
    qrSecret: 'DNAI-EVT04-UP',
    description: 'Chương trình hiến máu nhân đạo thường niên dành cho đoàn viên, sinh viên các trường Đại học, Cao đẳng trên địa bàn.'
  },
  {
    id: 'EVT-05',
    title: 'Giải chạy Sinh viên Khỏe - Đồng Nai Run 2026',
    organizer: 'Thành Đoàn TP. Đồng Nai',
    category: 'Thể dục thể thao',
    date: '2026-11-28',
    startTime: '05:30',
    endTime: '09:30',
    location: 'Quảng trường Sông Phố - Đường Nguyễn Văn Trị',
    gps: { lat: 10.9465, lng: 106.8190, radiusMeters: 600 },
    capacity: 500,
    minDurationMinutes: 60,
    requiresCheckOut: true,
    status: 'upcoming',
    faceVerificationMode: 'QR_OPTIONAL_FACE',
    qrSecret: 'DNAI-EVT05-UP',
    description: 'Lan tỏa tinh thần rèn luyện thể chất, phấn đấu đạt danh hiệu "Sinh viên 5 Tốt" tiêu chí Thể lực tốt.'
  },
  {
    id: 'EVT-06',
    title: 'Tập huấn Cán bộ Đoàn - Hội Sinh viên chủ chốt năm 2026',
    organizer: 'Thành Đoàn TP. Đồng Nai',
    category: 'Kỹ năng & Nghiệp vụ',
    date: '2026-09-25',
    startTime: '08:00',
    endTime: '16:30',
    location: 'Hội trường Trường ĐH Đồng Nai',
    gps: { lat: 10.9612, lng: 106.8542, radiusMeters: 300 },
    capacity: 150,
    minDurationMinutes: 180,
    requiresCheckOut: true,
    status: 'completed',
    faceVerificationMode: 'QR_REQUIRED_FACE',
    qrSecret: 'DNAI-EVT06-END',
    description: 'Bồi dưỡng kỹ năng tổ chức phong trào, nghiệp vụ công tác Hội và ứng dụng công nghệ số trong quản lý đoàn viên.'
  },
  {
    id: 'EVT-07',
    title: 'Chương trình Tiếp sức Mùa thi Đồng Nai 2026',
    organizer: 'Hội Sinh viên TP. Đồng Nai',
    category: 'Tình nguyện vì cộng đồng',
    date: '2026-12-05',
    startTime: '06:30',
    endTime: '11:30',
    location: 'Các điểm thi THPT tại TP. Biên Hòa',
    gps: { lat: 10.9550, lng: 106.8400, radiusMeters: 800 },
    capacity: 220,
    minDurationMinutes: 120,
    requiresCheckOut: true,
    status: 'upcoming',
    qrSecret: 'DNAI-EVT07-UP',
    description: 'Đội hình sinh viên tình nguyện hỗ trợ thí sinh, phân luồng giao thông và hướng dẫn thủ tục dự thi.'
  },
  {
    id: 'EVT-08',
    title: 'Diễn đàn Thanh niên với Chuyển đổi số & An toàn mạng',
    organizer: 'Thành Đoàn TP. Đồng Nai',
    category: 'Công nghệ & Chuyển đổi số',
    date: '2026-08-19',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Hội trường Trường ĐH Công nghệ Miền Đông',
    gps: { lat: 10.9401, lng: 107.0112, radiusMeters: 300 },
    capacity: 200,
    minDurationMinutes: 90,
    requiresCheckOut: true,
    status: 'completed',
    qrSecret: 'DNAI-EVT08-END',
    description: 'Nâng cao nhận thức phòng chống lừa đảo trực tuyến và ứng dụng AI an toàn trong học tập, nghiên cứu.'
  },
  {
    id: 'EVT-09',
    title: 'Ngày Chủ nhật Xanh - Bảo vệ lưu vực Sông Đồng Nai',
    organizer: 'Hội Sinh viên TP. Đồng Nai',
    category: 'Môi trường & Cộng đồng',
    date: '2026-10-04',
    startTime: '07:00',
    endTime: '10:30',
    location: 'Công viên Bờ sông Nguyễn Văn Trị, TP. Biên Hòa',
    gps: { lat: 10.9462, lng: 106.8178, radiusMeters: 400 },
    capacity: 260,
    minDurationMinutes: 90,
    requiresCheckOut: true,
    status: 'completed',
    qrSecret: 'DNAI-EVT09-END',
    description: 'Thu gom rác thải nhựa, trồng cây xanh ven sông và tuyên truyền phân loại rác tại nguồn.'
  },
  {
    id: 'EVT-10',
    title: 'Lễ Tuyên dương "Sinh viên 5 Tốt" cấp Thành phố năm 2026',
    organizer: 'Hội Sinh viên TP. Đồng Nai',
    category: 'Tuyên dương & Phong trào',
    date: '2026-12-18',
    startTime: '18:00',
    endTime: '21:00',
    location: 'Nhà hát Truyền hình Đồng Nai',
    gps: { lat: 10.9535, lng: 106.8371, radiusMeters: 250 },
    capacity: 350,
    minDurationMinutes: 90,
    requiresCheckOut: true,
    status: 'upcoming',
    qrSecret: 'DNAI-EVT10-UP',
    description: 'Vinh danh các gương mặt sinh viên tiêu biểu đạt danh hiệu Sinh viên 5 Tốt, Sao Tháng Giêng và Cán bộ Hội xuất sắc.'
  }
];

// Tạo dữ liệu đăng ký, điểm danh (gồm hợp lệ và các ca bất thường)
function generateInitialRegistrations(students) {
  const regs = [];

  // Các ca cụ thể cho SV-001 (Nguyễn Minh Khang) để demo ngay
  regs.push(
    {
      id: 'REG-0001',
      eventId: 'EVT-03',
      studentId: 'SV-001',
      registeredAt: '2026-10-12 09:15',
      checkInAt: '2026-10-18 06:35',
      checkOutAt: '2026-10-18 11:25',
      durationMinutes: 290,
      distanceMeters: 45,
      deviceId: 'DEV-LHU-9821A',
      ipAddress: '14.232.118.45',
      qrValid: true,
      faceVerified: true,
      aiScore: 6,
      aiRiskLevel: 'LOW',
      aiFlags: [],
      status: 'certified', // registered | checked_in | ai_review | eligible | certified | rejected
      certificateId: 'CERT-DN-2026-0001'
    },
    {
      id: 'REG-0002',
      eventId: 'EVT-06',
      studentId: 'SV-001',
      registeredAt: '2026-09-20 14:20',
      checkInAt: '2026-09-25 08:02',
      checkOutAt: '2026-09-25 16:20',
      durationMinutes: 498,
      distanceMeters: 30,
      deviceId: 'DEV-LHU-9821A',
      ipAddress: '14.232.118.45',
      qrValid: true,
      faceVerified: true,
      aiScore: 4,
      aiRiskLevel: 'LOW',
      aiFlags: [],
      status: 'certified',
      certificateId: 'CERT-DN-2026-0002'
    },
    {
      id: 'REG-0003',
      eventId: 'EVT-08',
      studentId: 'SV-001',
      registeredAt: '2026-08-15 10:00',
      checkInAt: '2026-08-19 14:05',
      checkOutAt: '2026-08-19 16:55',
      durationMinutes: 170,
      distanceMeters: 62,
      deviceId: 'DEV-LHU-9821A',
      ipAddress: '14.232.118.45',
      qrValid: true,
      faceVerified: true,
      aiScore: 8,
      aiRiskLevel: 'LOW',
      aiFlags: [],
      status: 'certified',
      certificateId: 'CERT-DN-2026-0003'
    },
    {
      id: 'REG-0004',
      eventId: 'EVT-01',
      studentId: 'SV-001',
      registeredAt: '2026-11-10 19:30',
      checkInAt: null,
      checkOutAt: null,
      durationMinutes: 0,
      distanceMeters: null,
      deviceId: 'DEV-LHU-9821A',
      ipAddress: null,
      qrValid: true,
      faceVerified: false,
      aiScore: 0,
      aiRiskLevel: 'LOW',
      aiFlags: [],
      status: 'registered',
      certificateId: null
    }
  );

  // Các ca bất thường cho SV-002 (Trần Thảo Vy) & một số sinh viên khác để BTC kiểm tra
  regs.push(
    {
      id: 'REG-0005',
      eventId: 'EVT-01',
      studentId: 'SV-002',
      registeredAt: '2026-11-10 20:05',
      checkInAt: '2026-11-12 08:12',
      checkOutAt: '2026-11-12 08:17',
      durationMinutes: 5,
      distanceMeters: 4200,
      deviceId: 'DEV-DNU-4410B',
      ipAddress: '113.161.72.19',
      qrValid: true,
      faceVerified: false,
      aiScore: 86,
      aiRiskLevel: 'HIGH',
      aiFlags: [
        'Vị trí GPS cách địa điểm tổ chức 4.2 km (vượt bán kính 300m)',
        'Thời lượng tham gia chỉ 5 phút (yêu cầu tối thiểu 60 phút)',
        'Chưa xác thực khuôn mặt bổ sung'
      ],
      status: 'ai_review',
      certificateId: null
    },
    {
      id: 'REG-0006',
      eventId: 'EVT-03',
      studentId: 'SV-002',
      registeredAt: '2026-10-14 11:00',
      checkInAt: '2026-10-18 06:40',
      checkOutAt: '2026-10-18 11:20',
      durationMinutes: 280,
      distanceMeters: 50,
      deviceId: 'DEV-DNU-4410B',
      ipAddress: '113.161.72.19',
      qrValid: true,
      faceVerified: true,
      aiScore: 7,
      aiRiskLevel: 'LOW',
      aiFlags: [],
      status: 'certified',
      certificateId: 'CERT-DN-2026-0004'
    }
  );

  // Sinh thêm dữ liệu phong phú cho 10 sự kiện từ 100 sinh viên
  const completedEvents = ['EVT-03', 'EVT-06', 'EVT-08', 'EVT-09'];
  const ongoingEvents = ['EVT-01', 'EVT-02'];
  const upcomingEvents = ['EVT-04', 'EVT-05', 'EVT-07', 'EVT-10'];

  let regCounter = 7;

  // Mỗi sự kiện đã kết thúc có ~25-35 lượt tham gia
  completedEvents.forEach((evtId, eIdx) => {
    for (let i = 3; i <= 32; i++) {
      const sv = students[(i + eIdx * 7) % students.length];
      if (!sv || sv.id === 'SV-001' || sv.id === 'SV-002') continue;
      const idStr = `REG-${String(regCounter++).padStart(4, '0')}`;

      // Tạo 1 vài ca vắng mặt, 1 vài ca đủ điều kiện chưa cấp, 1 vài ca bất thường
      if (i % 9 === 0) {
        regs.push({
          id: idStr,
          eventId: evtId,
          studentId: sv.id,
          registeredAt: '2026-09-15 10:10',
          checkInAt: null,
          checkOutAt: null,
          durationMinutes: 0,
          distanceMeters: null,
          deviceId: sv.deviceId,
          ipAddress: null,
          qrValid: true,
          faceVerified: false,
          aiScore: 0,
          aiRiskLevel: 'LOW',
          aiFlags: [],
          status: 'registered', // Vắng mặt
          certificateId: null
        });
      } else if (i === 14 || i === 25) {
        // Ca trùng thiết bị (điểm danh hộ)
        regs.push({
          id: idStr,
          eventId: evtId,
          studentId: sv.id,
          registeredAt: '2026-09-15 11:00',
          checkInAt: '2026-09-25 08:10',
          checkOutAt: '2026-09-25 16:00',
          durationMinutes: 470,
          distanceMeters: 40,
          deviceId: 'DEV-SHARED-CLONE-999',
          ipAddress: '171.244.10.88',
          qrValid: true,
          faceVerified: false,
          aiScore: 82,
          aiRiskLevel: 'HIGH',
          aiFlags: [
            'Phát hiện trùng Device ID (DEV-SHARED-CLONE-999) với sinh viên khác trong cùng sự kiện',
            'Nghi vấn điểm danh hộ qua thiết bị dùng chung'
          ],
          status: 'ai_review',
          certificateId: null
        });
      } else if (i % 5 === 0) {
        // Đủ điều kiện nhưng chờ BTC bấm cấp hàng loạt
        regs.push({
          id: idStr,
          eventId: evtId,
          studentId: sv.id,
          registeredAt: '2026-09-15 10:15',
          checkInAt: '2026-09-25 08:05',
          checkOutAt: '2026-09-25 16:10',
          durationMinutes: 485,
          distanceMeters: 55,
          deviceId: sv.deviceId,
          ipAddress: '14.232.118.90',
          qrValid: true,
          faceVerified: true,
          aiScore: 10,
          aiRiskLevel: 'LOW',
          aiFlags: [],
          status: 'eligible',
          certificateId: null
        });
      } else {
        const certId = `CERT-DN-2026-${String(regCounter).padStart(4, '0')}`;
        regs.push({
          id: idStr,
          eventId: evtId,
          studentId: sv.id,
          registeredAt: '2026-09-15 09:30',
          checkInAt: '2026-09-25 08:00',
          checkOutAt: '2026-09-25 16:15',
          durationMinutes: 495,
          distanceMeters: 25 + (i % 60),
          deviceId: sv.deviceId,
          ipAddress: `14.232.119.${10 + i}`,
          qrValid: true,
          faceVerified: true,
          aiScore: 5 + (i % 12),
          aiRiskLevel: 'LOW',
          aiFlags: [],
          status: 'certified',
          certificateId: certId
        });
      }
    }
  });

  // Sự kiện đang diễn ra
  ongoingEvents.forEach((evtId, eIdx) => {
    for (let i = 3; i <= 26; i++) {
      const sv = students[(i * 2 + eIdx * 5) % students.length];
      if (!sv || sv.id === 'SV-001' || sv.id === 'SV-002') continue;
      const idStr = `REG-${String(regCounter++).padStart(4, '0')}`;

      if (i === 8 || i === 18) {
        // Bất thường vị trí hoặc trùng thiết bị
        regs.push({
          id: idStr,
          eventId: evtId,
          studentId: sv.id,
          registeredAt: '2026-11-10 15:00',
          checkInAt: '2026-11-12 08:15',
          checkOutAt: null,
          durationMinutes: 0,
          distanceMeters: i === 8 ? 12400 : 35,
          deviceId: i === 18 ? 'DEV-SHARED-CLONE-999' : sv.deviceId,
          ipAddress: '115.79.44.12',
          qrValid: true,
          faceVerified: false,
          aiScore: i === 8 ? 91 : 84,
          aiRiskLevel: 'HIGH',
          aiFlags: i === 8
            ? ['Vị trí GPS cách hội trường 12.4 km (Bất thường định vị / Nghi vấn fake GPS)', 'Chưa xác thực khuôn mặt']
            : ['Trùng lặp dấu vân tay thiết bị (DEV-SHARED-CLONE-999) với 2 tài khoản khác trong 60 giây'],
          status: 'ai_review',
          certificateId: null
        });
      } else if (i % 3 === 0) {
        // Đã check-in và check-out đủ điều kiện
        regs.push({
          id: idStr,
          eventId: evtId,
          studentId: sv.id,
          registeredAt: '2026-11-10 12:00',
          checkInAt: '2026-11-12 08:05',
          checkOutAt: '2026-11-12 11:20',
          durationMinutes: 195,
          distanceMeters: 42,
          deviceId: sv.deviceId,
          ipAddress: `14.161.20.${i}`,
          qrValid: true,
          faceVerified: true,
          aiScore: 9,
          aiRiskLevel: 'LOW',
          aiFlags: [],
          status: 'eligible',
          certificateId: null
        });
      } else if (i % 2 === 0) {
        // Đã check-in, đang tham gia
        regs.push({
          id: idStr,
          eventId: evtId,
          studentId: sv.id,
          registeredAt: '2026-11-10 13:00',
          checkInAt: '2026-11-12 08:08',
          checkOutAt: null,
          durationMinutes: 0,
          distanceMeters: 38,
          deviceId: sv.deviceId,
          ipAddress: `14.161.20.${i}`,
          qrValid: true,
          faceVerified: true,
          aiScore: 11,
          aiRiskLevel: 'LOW',
          aiFlags: [],
          status: 'checked_in',
          certificateId: null
        });
      } else {
        // Mới đăng ký
        regs.push({
          id: idStr,
          eventId: evtId,
          studentId: sv.id,
          registeredAt: '2026-11-11 08:45',
          checkInAt: null,
          checkOutAt: null,
          durationMinutes: 0,
          distanceMeters: null,
          deviceId: sv.deviceId,
          ipAddress: null,
          qrValid: true,
          faceVerified: false,
          aiScore: 0,
          aiRiskLevel: 'LOW',
          aiFlags: [],
          status: 'registered',
          certificateId: null
        });
      }
    }
  });

  // Sự kiện sắp diễn ra
  upcomingEvents.forEach((evtId, eIdx) => {
    for (let i = 3; i <= 15; i++) {
      const sv = students[(i * 3 + eIdx * 4) % students.length];
      if (!sv) continue;
      regs.push({
        id: `REG-${String(regCounter++).padStart(4, '0')}`,
        eventId: evtId,
        studentId: sv.id,
        registeredAt: '2026-11-11 16:00',
        checkInAt: null,
        checkOutAt: null,
        durationMinutes: 0,
        distanceMeters: null,
        deviceId: sv.deviceId,
        ipAddress: null,
        qrValid: true,
        faceVerified: false,
        aiScore: 0,
        aiRiskLevel: 'LOW',
        aiFlags: [],
        status: 'registered',
        certificateId: null
      });
    }
  });

  return regs;
}

function generateInitialCertificates(registrations, events, students) {
  const certs = [];
  registrations
    .filter(r => r.status === 'certified' && r.certificateId)
    .forEach(r => {
      const sv = students.find(s => s.id === r.studentId);
      const evt = events.find(e => e.id === r.eventId);
      if (!sv || !evt) return;
      certs.push({
        id: r.certificateId,
        studentId: sv.id,
        studentName: sv.fullName,
        mssv: sv.mssv,
        universityName: sv.universityName,
        eventId: evt.id,
        eventTitle: evt.title,
        organizer: evt.organizer,
        eventDate: evt.date,
        issuedDate: evt.status === 'completed' ? evt.date : '2026-11-12',
        signerName: 'Đồng chí Nguyễn Minh Tuấn',
        signerTitle: 'Bí thư Thành Đoàn TP. Đồng Nai',
        digitalHash: `SHA256-${r.certificateId.replace(/[^A-Z0-9]/g, '')}F9A2`,
        status: 'valid'
      });
    });
  return certs;
}

const INITIAL_APPEALS = [
  {
    id: 'APL-001',
    regId: 'REG-0005',
    studentId: 'SV-002',
    eventId: 'EVT-01',
    submittedAt: '2026-11-12 09:00',
    reason: 'Em có mặt tại Hội trường A ĐH Lạc Hồng nhưng điện thoại bị lỗi định vị GPS nhảy sang khu vực khác và em bấm nhầm Check-out sớm. Em có ảnh chụp tại hội trường.',
    status: 'pending', // pending | approved | rejected
    reviewerNote: ''
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG-001',
    timestamp: '2026-11-12 08:18:04',
    actor: 'AI Anomaly Engine v2.4',
    role: 'system',
    action: 'Gắn cờ cảnh báo rủi ro cao (86/100)',
    target: 'REG-0005 (SV-002 - Trần Thảo Vy)',
    detail: 'Phát hiện sai lệch GPS 4.2km và thời lượng tham gia 5 phút < 60 phút.'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-10-18 14:00:12',
    actor: 'Lê Hoàng Nam (BTC)',
    role: 'organizer',
    action: 'Phê duyệt & Cấp chứng nhận hàng loạt',
    target: 'EVT-03 (Chiến dịch Mùa Hè Xanh 2026)',
    detail: 'Đã phát hành tự động 25 chứng nhận điện tử có mã QR xác thực.'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-11-12 09:00:22',
    actor: 'Trần Thảo Vy (SV-002)',
    role: 'student',
    action: 'Gửi khiếu nại xác minh điểm danh',
    target: 'APL-001 / EVT-01',
    detail: 'Yêu cầu Ban Tổ Chức xem xét lại trường hợp lỗi GPS thiết bị.'
  }
];

// DỮ LIỆU KHỞI TẠO CHO MÔ-ĐUN AI FACE VERIFICATION
function generateSeedEmbeddingVector(seed) {
  const vec = [];
  let sumSq = 0;
  for (let i = 0; i < 128; i++) {
    const v = Math.sin((i + 1) * seed * 0.35) * Math.cos(i * 0.2);
    vec.push(v);
    sumSq += v * v;
  }
  const norm = Math.sqrt(sumSq) || 1.0;
  return vec.map(val => Math.round((val / norm) * 10000) / 10000);
}

const INITIAL_FACE_PROFILES = [
  {
    studentId: 'SV-001',
    mssv: '122001001',
    fullName: 'Nguyễn Minh Khang',
    enrolled: true,
    consentFaceAI: true,
    enrolledAt: '2026-11-05 09:15:20',
    templateHash: 'SHA256:FACE_SV001_8F92A1B7E43D0921C2B4',
    embedding: generateSeedEmbeddingVector(1),
    qualityScore: 96,
    status: 'active'
  }
];

const INITIAL_FACE_LOGS = [
  {
    id: 'FCLOG-001',
    timestamp: '2026-11-12 08:05:14',
    studentId: 'SV-001',
    studentName: 'Nguyễn Minh Khang',
    mssv: '122001001',
    action: 'VERIFY_1TO1',
    eventId: 'EVT-01',
    eventTitle: 'Hội thảo Khởi nghiệp Đổi mới Sáng tạo Trẻ Đồng Nai 2026',
    similarityScore: 0.94,
    livenessPassed: true,
    result: 'SUCCESS',
    verdict: 'Xác minh thành công 1:1 (Khớp 94%)',
    deviceId: 'DEV-LHU-9821A'
  },
  {
    id: 'FCLOG-002',
    timestamp: '2026-11-05 09:15:20',
    studentId: 'SV-001',
    studentName: 'Nguyễn Minh Khang',
    mssv: '122001001',
    action: 'ENROLLMENT',
    eventId: null,
    eventTitle: 'Đăng ký nhận diện độc lập',
    similarityScore: 1.0,
    livenessPassed: true,
    result: 'ENROLLED',
    verdict: 'Đăng ký mẫu khuôn mặt AI thành công (Chất lượng 96/100)',
    deviceId: 'DEV-LHU-9821A'
  }
];

const INITIAL_MANUAL_QUEUE = [
  {
    id: 'MNL-001',
    studentId: 'SV-002',
    studentName: 'Trần Thảo Vy',
    mssv: '223004012',
    universityName: 'Trường Đại học Đồng Nai',
    eventId: 'EVT-03',
    eventTitle: 'Chiến dịch Mùa Hè Xanh Đồng Nai 2026 - Mặt trận Biên Hòa',
    createdAt: '2026-11-12 07:10:00',
    reason: 'Sinh viên chưa đăng ký mẫu khuôn mặt trước sự kiện (Phương án dự phòng duyệt thủ công không trừ điểm)',
    status: 'pending',
    requestedMode: 'QR_REQUIRED_FACE'
  }
];

window.SA.Data = {
  UNIVERSITIES,
  DEMO_ACCOUNTS,
  generateStudents,
  INITIAL_EVENTS,
  generateInitialRegistrations,
  generateInitialCertificates,
  INITIAL_APPEALS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FACE_PROFILES,
  INITIAL_FACE_LOGS,
  INITIAL_MANUAL_QUEUE
};
})();
