/**
 * BACKEND ADMINISTRATIVE CATALOG 2026 (QĐ 19/2025/QĐ-TTg)
 * Bảng danh mục và mã số các đơn vị hành chính Việt Nam
 */

const PROVINCES_2026 = [
  { code: '01', name: 'Thành phố Hà Nội', type: 'Thành phố Trung ương', region: 'Đồng bằng sông Hồng' },
  { code: '04', name: 'Tỉnh Cao Bằng', type: 'Tỉnh', region: 'Đông Bắc Bộ' },
  { code: '08', name: 'Tỉnh Tuyên Quang', type: 'Tỉnh', region: 'Đông Bắc Bộ' },
  { code: '10', name: 'Tỉnh Lào Cai', type: 'Tỉnh', region: 'Tây Bắc Bộ' },
  { code: '11', name: 'Tỉnh Điện Biên', type: 'Tỉnh', region: 'Tây Bắc Bộ' },
  { code: '12', name: 'Tỉnh Lai Châu', type: 'Tỉnh', region: 'Tây Bắc Bộ' },
  { code: '14', name: 'Tỉnh Sơn La', type: 'Tỉnh', region: 'Tây Bắc Bộ' },
  { code: '19', name: 'Tỉnh Thái Nguyên', type: 'Tỉnh', region: 'Đông Bắc Bộ' },
  { code: '20', name: 'Tỉnh Lạng Sơn', type: 'Tỉnh', region: 'Đông Bắc Bộ' },
  { code: '22', name: 'Tỉnh Quảng Ninh', type: 'Tỉnh', region: 'Đông Bắc Bộ' },
  { code: '25', name: 'Tỉnh Phú Thọ', type: 'Tỉnh', region: 'Đông Bắc Bộ' },
  { code: '27', name: 'Tỉnh Bắc Ninh', type: 'Tỉnh', region: 'Đồng bằng sông Hồng' },
  { code: '31', name: 'Thành phố Hải Phòng', type: 'Thành phố Trung ương', region: 'Đồng bằng sông Hồng' },
  { code: '33', name: 'Tỉnh Hưng Yên', type: 'Tỉnh', region: 'Đồng bằng sông Hồng' },
  { code: '37', name: 'Tỉnh Ninh Bình', type: 'Tỉnh', region: 'Đồng bằng sông Hồng' },
  { code: '38', name: 'Tỉnh Thanh Hóa', type: 'Tỉnh', region: 'Bắc Trung Bộ' },
  { code: '40', name: 'Tỉnh Nghệ An', type: 'Tỉnh', region: 'Bắc Trung Bộ' },
  { code: '42', name: 'Tỉnh Hà Tĩnh', type: 'Tỉnh', region: 'Bắc Trung Bộ' },
  { code: '45', name: 'Tỉnh Quảng Trị', type: 'Tỉnh', region: 'Bắc Trung Bộ' },
  { code: '46', name: 'Thành phố Huế', type: 'Thành phố Trung ương', region: 'Bắc Trung Bộ' },
  { code: '48', name: 'Thành phố Đà Nẵng', type: 'Thành phố Trung ương', region: 'Duyên hải Nam Trung Bộ' },
  { code: '51', name: 'Tỉnh Quảng Ngãi', type: 'Tỉnh', region: 'Duyên hải Nam Trung Bộ' },
  { code: '56', name: 'Tỉnh Khánh Hòa', type: 'Tỉnh', region: 'Duyên hải Nam Trung Bộ' },
  { code: '64', name: 'Tỉnh Gia Lai', type: 'Tỉnh', region: 'Tây Nguyên' },
  { code: '66', name: 'Tỉnh Đắk Lắk', type: 'Tỉnh', region: 'Tây Nguyên' },
  { code: '68', name: 'Tỉnh Lâm Đồng', type: 'Tỉnh', region: 'Tây Nguyên' },
  { code: '72', name: 'Tỉnh Tây Ninh', type: 'Tỉnh', region: 'Đông Nam Bộ' },
  { code: '75', name: 'Tỉnh Đồng Nai', type: 'Tỉnh', region: 'Đông Nam Bộ' },
  { code: '79', name: 'Thành phố Hồ Chí Minh', type: 'Thành phố Trung ương', region: 'Đông Nam Bộ' },
  { code: '86', name: 'Tỉnh Vĩnh Long', type: 'Tỉnh', region: 'Đồng bằng sông Cửu Long' },
  { code: '87', name: 'Tỉnh Đồng Tháp', type: 'Tỉnh', region: 'Đồng bằng sông Cửu Long' },
  { code: '89', name: 'Tỉnh An Giang', type: 'Tỉnh', region: 'Đồng bằng sông Cửu Long' },
  { code: '92', name: 'Thành phố Cần Thơ', type: 'Thành phố Trung ương', region: 'Đồng bằng sông Cửu Long' },
  { code: '96', name: 'Tỉnh Cà Mau', type: 'Tỉnh', region: 'Đồng bằng sông Cửu Long' }
];

const WARDS_BY_PROVINCE_2026 = {
  '75': [
    { code: '26176', name: 'Phường Bửu Long', type: 'Phường' },
    { code: '26179', name: 'Phường Tân Hiệp', type: 'Phường' },
    { code: '26182', name: 'Phường Tam Hiệp', type: 'Phường' },
    { code: '26185', name: 'Phường Trảng Dài', type: 'Phường' },
    { code: '26188', name: 'Phường Tân Biên', type: 'Phường' },
    { code: '26191', name: 'Phường Hố Nai', type: 'Phường' },
    { code: '26194', name: 'Phường Tân Hòa', type: 'Phường' },
    { code: '26197', name: 'Phường Quang Vinh', type: 'Phường' },
    { code: '26200', name: 'Phường Thanh Bình', type: 'Phường' },
    { code: '26203', name: 'Phường Hòa Bình', type: 'Phường' },
    { code: '26206', name: 'Phường Quyết Thắng', type: 'Phường' },
    { code: '26209', name: 'Phường Thống Nhất', type: 'Phường' },
    { code: '26212', name: 'Phường Trung Dũng', type: 'Phường' },
    { code: '26215', name: 'Phường Hiệp Hòa', type: 'Phường' },
    { code: '26218', name: 'Phường An Bình', type: 'Phường' },
    { code: '26221', name: 'Phường Bình Đa', type: 'Phường' },
    { code: '26224', name: 'Phường An Hòa', type: 'Phường' },
    { code: '26227', name: 'Phường Long Bình', type: 'Phường' },
    { code: '26230', name: 'Phường Long Bình Tân', type: 'Phường' },
    { code: '26233', name: 'Phường Tân Mai', type: 'Phường' },
    { code: '26236', name: 'Phường Tân Vạn', type: 'Phường' },
    { code: '26239', name: 'Phường Tam Phước', type: 'Phường' },
    { code: '26242', name: 'Phường Phước Tân', type: 'Phường' },
    { code: '26245', name: 'Xã Long Hưng', type: 'Xã' },
    { code: '26344', name: 'Thị trấn Trảng Bom', type: 'Thị trấn' },
    { code: '26347', name: 'Xã Hố Nai 3', type: 'Xã' },
    { code: '26350', name: 'Xã Bắc Sơn', type: 'Xã' },
    { code: '26371', name: 'Xã Hưng Thịnh', type: 'Xã' },
    { code: '26410', name: 'Thị trấn Long Thành', type: 'Thị trấn' },
    { code: '26437', name: 'Xã Long Phước', type: 'Xã' },
    { code: '25396', name: 'Phường Tân Phú', type: 'Phường' },
    { code: '25450', name: 'Phường Long Thủy', type: 'Phường' }
  ],
  '79': [
    { code: '26734', name: 'Phường Bến Nghé', type: 'Phường' },
    { code: '26737', name: 'Phường Bến Thành', type: 'Phường' },
    { code: '26749', name: 'Phường Đa Kao', type: 'Phường' },
    { code: '26761', name: 'Phường Tân Định', type: 'Phường' },
    { code: '26830', name: 'Phường Thảo Điền', type: 'Phường' },
    { code: '26833', name: 'Phường An Phú', type: 'Phường' },
    { code: '25660', name: 'Phường Phú Cường', type: 'Phường' },
    { code: '25720', name: 'Phường Dĩ An', type: 'Phường' },
    { code: '26470', name: 'Phường 1 (Vũng Tàu)', type: 'Phường' },
    { code: '26680', name: 'Đặc khu Côn Đảo', type: 'Đặc khu' }
  ],
  '01': [
    { code: '00001', name: 'Phường Phúc Xá', type: 'Phường' },
    { code: '00019', name: 'Phường Giảng Võ', type: 'Phường' },
    { code: '00022', name: 'Phường Thành Công', type: 'Phường' },
    { code: '00064', name: 'Phường Tràng Tiền', type: 'Phường' },
    { code: '00070', name: 'Phường Bạch Đằng', type: 'Phường' },
    { code: '00157', name: 'Phường Dịch Vọng', type: 'Phường' },
    { code: '00247', name: 'Phường Mỹ Đình 1', type: 'Phường' },
    { code: '00298', name: 'Phường Hoàng Liệt', type: 'Phường' }
  ],
  '46': [
    { code: '19900', name: 'Phường Phú Hội', type: 'Phường' },
    { code: '19903', name: 'Phường Phú Nhuận', type: 'Phường' }
  ],
  '48': [
    { code: '20194', name: 'Phường Hải Châu 1', type: 'Phường' },
    { code: '20499', name: 'Đặc khu Hoàng Sa', type: 'Đặc khu' }
  ],
  '56': [
    { code: '22300', name: 'Phường Lộc Thọ', type: 'Phường' },
    { code: '22420', name: 'Đặc khu Trường Sa', type: 'Đặc khu' }
  ],
  '89': [
    { code: '30000', name: 'Phường Mỹ Bình', type: 'Phường' },
    { code: '30800', name: 'Đặc khu Phú Quốc', type: 'Đặc khu' }
  ],
  '92': [
    { code: '31100', name: 'Phường Tân An', type: 'Phường' },
    { code: '31103', name: 'Phường An Cư', type: 'Phường' }
  ]
};

function getProvinces() {
  return PROVINCES_2026;
}

function getProvinceByCode(code) {
  if (!code) return null;
  const clean = String(code).trim().padStart(2, '0');
  return PROVINCES_2026.find(p => p.code === clean) || null;
}

function getWardsByProvince(provinceCode) {
  if (!provinceCode) return [];
  const clean = String(provinceCode).trim().padStart(2, '0');
  return WARDS_BY_PROVINCE_2026[clean] || [];
}

function isValidAdministrativePair(provinceCode, wardCode) {
  if (!provinceCode || !wardCode) return false;
  const wards = getWardsByProvince(provinceCode);
  return wards.some(w => w.code === String(wardCode).trim());
}

module.exports = {
  PROVINCES_2026,
  WARDS_BY_PROVINCE_2026,
  getProvinces,
  getProvinceByCode,
  getWardsByProvince,
  isValidAdministrativePair
};
