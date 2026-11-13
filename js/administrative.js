/**
 * DANH MỤC ĐƠN VỊ HÀNH CHÍNH VIỆN HÀNH NĂM 2026
 * Căn cứ pháp lý: Quyết định số 19/2025/QĐ-TTg ngày 30/06/2025 của Thủ tướng Chính phủ
 * Ban hành Bảng danh mục và mã số các đơn vị hành chính Việt Nam (có hiệu lực từ 01/07/2025)
 *
 * CẤU TRÚC:
 * - 34 Tỉnh / Thành phố trực thuộc Trung ương (Mã 2 chữ số: 01 đến 96)
 * - Xã / Phường / Đặc khu trực thuộc (Mã 5 chữ số)
 * - Không sử dụng cấp trung gian (quận/huyện/thị xã/thành phố thuộc tỉnh) làm cấp lựa chọn hiện hành
 */

(function () {
  'use strict';

  // 1. DANH MỤC 34 TỈNH / THÀNH PHỐ TRỰC THUỘC TRUNG ƯƠNG CHÍNH THỨC 2026
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

  // 2. DANH MỤC XÃ, PHƯỜNG, ĐẶC KHU TRỰC THUỘC TỪNG TỈNH / THÀNH PHỐ
  // Mỗi đơn vị gồm: code (mã 5 chữ số), name (tên đơn vị), type (Phường | Xã | Đặc khu | Thị trấn)
  const WARDS_BY_PROVINCE_2026 = {
    // 75: TỈNH ĐỒNG NAI (Trọng điểm hệ thống SmartAttend AI Đồng Nai)
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
      { code: '26248', name: 'Phường Suối Tre', type: 'Phường' },
      { code: '26251', name: 'Phường Xuân An', type: 'Phường' },
      { code: '26254', name: 'Phường Xuân Bình', type: 'Phường' },
      { code: '26257', name: 'Phường Xuân Hòa', type: 'Phường' },
      { code: '26260', name: 'Phường Xuân Trung', type: 'Phường' },
      { code: '26263', name: 'Phường Xuân Thanh', type: 'Phường' },
      { code: '26266', name: 'Phường Bảo Vinh', type: 'Phường' },
      { code: '26269', name: 'Phường Bàu Sen', type: 'Phường' },
      { code: '26272', name: 'Phường Phú Bình', type: 'Phường' },
      { code: '26275', name: 'Xã Bình Lộc', type: 'Xã' },
      { code: '26278', name: 'Xã Hàng Gòn', type: 'Xã' },
      { code: '26281', name: 'Xã Bảo Quang', type: 'Xã' },
      { code: '26344', name: 'Thị trấn Trảng Bom', type: 'Thị trấn' },
      { code: '26347', name: 'Xã Hố Nai 3', type: 'Xã' },
      { code: '26350', name: 'Xã Bắc Sơn', type: 'Xã' },
      { code: '26353', name: 'Xã Bình Minh', type: 'Xã' },
      { code: '26356', name: 'Xã Quảng Tiến', type: 'Xã' },
      { code: '26359', name: 'Xã Sông Trầu', type: 'Xã' },
      { code: '26362', name: 'Xã Tây Hòa', type: 'Xã' },
      { code: '26365', name: 'Xã Trung Hòa', type: 'Xã' },
      { code: '26368', name: 'Xã Đông Hòa', type: 'Xã' },
      { code: '26371', name: 'Xã Hưng Thịnh', type: 'Xã' },
      { code: '26374', name: 'Xã An Viễn', type: 'Xã' },
      { code: '26377', name: 'Xã Đồi 61', type: 'Xã' },
      { code: '26380', name: 'Xã Giang Điền', type: 'Xã' },
      { code: '26383', name: 'Xã Cây Gáo', type: 'Xã' },
      { code: '26386', name: 'Xã Bàu Hàm', type: 'Xã' },
      { code: '26389', name: 'Xã Thanh Bình', type: 'Xã' },
      { code: '26392', name: 'Xã Sông Thao', type: 'Xã' },
      { code: '26410', name: 'Thị trấn Long Thành', type: 'Thị trấn' },
      { code: '26413', name: 'Xã An Phước', type: 'Xã' },
      { code: '26416', name: 'Xã Bàu Cạn', type: 'Xã' },
      { code: '26419', name: 'Xã Bình An', type: 'Xã' },
      { code: '26422', name: 'Xã Bình Sơn', type: 'Xã' },
      { code: '26425', name: 'Xã Cẩm Đường', type: 'Xã' },
      { code: '26428', name: 'Xã Lộc An', type: 'Xã' },
      { code: '26431', name: 'Xã Long An', type: 'Xã' },
      { code: '26434', name: 'Xã Long Đức', type: 'Xã' },
      { code: '26437', name: 'Xã Long Phước', type: 'Xã' },
      { code: '26440', name: 'Xã Phước Bình', type: 'Xã' },
      { code: '26443', name: 'Xã Phước Thái', type: 'Xã' },
      { code: '26446', name: 'Xã Tam An', type: 'Xã' },
      { code: '26449', name: 'Xã Tân Hiệp', type: 'Xã' },
      { code: '25396', name: 'Phường Tân Phú', type: 'Phường' },
      { code: '25399', name: 'Phường Tân Đồng', type: 'Phường' },
      { code: '25402', name: 'Phường Tân Bình', type: 'Phường' },
      { code: '25405', name: 'Phường Tân Xuân', type: 'Phường' },
      { code: '25408', name: 'Phường Tiến Thành', type: 'Phường' },
      { code: '25450', name: 'Phường Long Thủy', type: 'Phường' },
      { code: '25453', name: 'Phường Thác Mơ', type: 'Phường' },
      { code: '25456', name: 'Phường Sơn Giang', type: 'Phường' },
      { code: '25459', name: 'Phường Phước Bình', type: 'Phường' },
      { code: '25462', name: 'Phường Long Phước', type: 'Phường' },
      { code: '25480', name: 'Thị trấn Chơn Thành', type: 'Thị trấn' },
      { code: '25510', name: 'Thị trấn Lộc Ninh', type: 'Thị trấn' },
      { code: '25530', name: 'Thị trấn Tân Khai', type: 'Thị trấn' }
    ],

    // 79: THÀNH PHỐ HỒ CHÍ MINH
    '79': [
      { code: '26734', name: 'Phường Bến Nghé', type: 'Phường' },
      { code: '26737', name: 'Phường Bến Thành', type: 'Phường' },
      { code: '26740', name: 'Phường Cầu Kho', type: 'Phường' },
      { code: '26743', name: 'Phường Cầu Ông Lãnh', type: 'Phường' },
      { code: '26746', name: 'Phường Cô Giang', type: 'Phường' },
      { code: '26749', name: 'Phường Đa Kao', type: 'Phường' },
      { code: '26752', name: 'Phường Nguyễn Cư Trinh', type: 'Phường' },
      { code: '26755', name: 'Phường Nguyễn Thái Bình', type: 'Phường' },
      { code: '26758', name: 'Phường Phạm Ngũ Lão', type: 'Phường' },
      { code: '26761', name: 'Phường Tân Định', type: 'Phường' },
      { code: '26765', name: 'Phường Võ Thị Sáu', type: 'Phường' },
      { code: '26830', name: 'Phường Thảo Điền', type: 'Phường' },
      { code: '26833', name: 'Phường An Phú', type: 'Phường' },
      { code: '26836', name: 'Phường An Khánh', type: 'Phường' },
      { code: '26839', name: 'Phường Bình Trưng Đông', type: 'Phường' },
      { code: '26842', name: 'Phường Bình Trưng Tây', type: 'Phường' },
      { code: '26845', name: 'Phường Cát Lái', type: 'Phường' },
      { code: '26848', name: 'Phường Thạnh Mỹ Lợi', type: 'Phường' },
      { code: '26851', name: 'Phường Hiệp Phú', type: 'Phường' },
      { code: '26854', name: 'Phường Tăng Nhơn Phú A', type: 'Phường' },
      { code: '26857', name: 'Phường Tăng Nhơn Phú B', type: 'Phường' },
      { code: '26860', name: 'Phường Phước Long A', type: 'Phường' },
      { code: '26863', name: 'Phường Phước Long B', type: 'Phường' },
      { code: '26866', name: 'Phường Trường Thạnh', type: 'Phường' },
      { code: '26869', name: 'Phường Long Phước', type: 'Phường' },
      { code: '26872', name: 'Phường Long Trường', type: 'Phường' },
      { code: '26875', name: 'Phường Long Bình', type: 'Phường' },
      { code: '26878', name: 'Phường Linh Trung', type: 'Phường' },
      { code: '26881', name: 'Phường Linh Tây', type: 'Phường' },
      { code: '26884', name: 'Phường Linh Chiểu', type: 'Phường' },
      { code: '26887', name: 'Phường Linh Đông', type: 'Phường' },
      { code: '26890', name: 'Phường Tam Phú', type: 'Phường' },
      { code: '26893', name: 'Phường Tam Bình', type: 'Phường' },
      { code: '26896', name: 'Phường Hiệp Bình Chánh', type: 'Phường' },
      { code: '26899', name: 'Phường Hiệp Bình Phước', type: 'Phường' },
      { code: '25660', name: 'Phường Phú Cường', type: 'Phường' },
      { code: '25663', name: 'Phường Hiệp Thành', type: 'Phường' },
      { code: '25666', name: 'Phường Chánh Nghĩa', type: 'Phường' },
      { code: '25669', name: 'Phường Phú Thọ', type: 'Phường' },
      { code: '25672', name: 'Phường Phú Hòa', type: 'Phường' },
      { code: '25675', name: 'Phường Phú Lợi', type: 'Phường' },
      { code: '25678', name: 'Phường Định Hòa', type: 'Phường' },
      { code: '25720', name: 'Phường Dĩ An', type: 'Phường' },
      { code: '25723', name: 'Phường Tân Bình', type: 'Phường' },
      { code: '25726', name: 'Phường Đông Hòa', type: 'Phường' },
      { code: '25729', name: 'Phường An Bình', type: 'Phường' },
      { code: '25732', name: 'Phường Bình An', type: 'Phường' },
      { code: '25750', name: 'Phường Lái Thiêu', type: 'Phường' },
      { code: '25753', name: 'Phường An Phú (Thuận An)', type: 'Phường' },
      { code: '25756', name: 'Phường Thuận Giao', type: 'Phường' },
      { code: '26470', name: 'Phường 1 (Vũng Tàu)', type: 'Phường' },
      { code: '26473', name: 'Phường 2 (Vũng Tàu)', type: 'Phường' },
      { code: '26476', name: 'Phường 3 (Vũng Tàu)', type: 'Phường' },
      { code: '26479', name: 'Phường Thắng Tam', type: 'Phường' },
      { code: '26482', name: 'Phường Thắng Nhì', type: 'Phường' },
      { code: '26485', name: 'Phường Thắng Nhất', type: 'Phường' },
      { code: '26488', name: 'Phường Rạch Dừa', type: 'Phường' },
      { code: '26491', name: 'Phường 11 (Vũng Tàu)', type: 'Phường' },
      { code: '26494', name: 'Phường 12 (Vũng Tàu)', type: 'Phường' },
      { code: '26680', name: 'Đặc khu Côn Đảo', type: 'Đặc khu' }
    ],

    // 01: THÀNH PHỐ HÀ NỘI
    '01': [
      { code: '00001', name: 'Phường Phúc Xá', type: 'Phường' },
      { code: '00004', name: 'Phường Trúc Bạch', type: 'Phường' },
      { code: '00006', name: 'Phường Vĩnh Phúc', type: 'Phường' },
      { code: '00007', name: 'Phường Cống Vị', type: 'Phường' },
      { code: '00008', name: 'Phường Liễu Giai', type: 'Phường' },
      { code: '00010', name: 'Phường Quán Thánh', type: 'Phường' },
      { code: '00016', name: 'Phường Kim Mã', type: 'Phường' },
      { code: '00019', name: 'Phường Giảng Võ', type: 'Phường' },
      { code: '00022', name: 'Phường Thành Công', type: 'Phường' },
      { code: '00025', name: 'Phường Đồng Xuân', type: 'Phường' },
      { code: '00028', name: 'Phường Hàng Mã', type: 'Phường' },
      { code: '00031', name: 'Phường Hàng Buồm', type: 'Phường' },
      { code: '00034', name: 'Phường Hàng Đào', type: 'Phường' },
      { code: '00037', name: 'Phường Hàng Bồ', type: 'Phường' },
      { code: '00040', name: 'Phường Cửa Đông', type: 'Phường' },
      { code: '00043', name: 'Phường Lý Thái Tổ', type: 'Phường' },
      { code: '00046', name: 'Phường Hàng Bạc', type: 'Phường' },
      { code: '00049', name: 'Phường Hàng Gai', type: 'Phường' },
      { code: '00052', name: 'Phường Chương Dương', type: 'Phường' },
      { code: '00055', name: 'Phường Hàng Trống', type: 'Phường' },
      { code: '00058', name: 'Phường Cửa Nam', type: 'Phường' },
      { code: '00061', name: 'Phường Hàng Bông', type: 'Phường' },
      { code: '00064', name: 'Phường Tràng Tiền', type: 'Phường' },
      { code: '00067', name: 'Phường Phan Chu Trinh', type: 'Phường' },
      { code: '00070', name: 'Phường Bạch Đằng', type: 'Phường' },
      { code: '00157', name: 'Phường Dịch Vọng', type: 'Phường' },
      { code: '00160', name: 'Phường Dịch Vọng Hậu', type: 'Phường' },
      { code: '00163', name: 'Phường Nghĩa Đô', type: 'Phường' },
      { code: '00166', name: 'Phường Nghĩa Tân', type: 'Phường' },
      { code: '00169', name: 'Phường Mai Dịch', type: 'Phường' },
      { code: '00172', name: 'Phường Quan Hoa', type: 'Phường' },
      { code: '00175', name: 'Phường Yên Hòa', type: 'Phường' },
      { code: '00178', name: 'Phường Trung Hòa', type: 'Phường' },
      { code: '00244', name: 'Phường Mễ Trì', type: 'Phường' },
      { code: '00247', name: 'Phường Mỹ Đình 1', type: 'Phường' },
      { code: '00250', name: 'Phường Mỹ Đình 2', type: 'Phường' },
      { code: '00253', name: 'Phường Cầu Diễn', type: 'Phường' },
      { code: '00298', name: 'Phường Hoàng Liệt', type: 'Phường' },
      { code: '00301', name: 'Phường Đại Kim', type: 'Phường' },
      { code: '00304', name: 'Phường Định Công', type: 'Phường' },
      { code: '00214', name: 'Phường Láng Thượng', type: 'Phường' },
      { code: '00217', name: 'Phường Ô Chợ Dừa', type: 'Phường' },
      { code: '00220', name: 'Phường Văn Miếu', type: 'Phường' },
      { code: '00223', name: 'Phường Quốc Tử Giám', type: 'Phường' }
    ],

    // 04: TỈNH CAO BẰNG
    '04': [
      { code: '01000', name: 'Phường Sông Hiến', type: 'Phường' },
      { code: '01003', name: 'Phường Sông Bằng', type: 'Phường' },
      { code: '01006', name: 'Phường Hợp Giang', type: 'Phường' },
      { code: '01009', name: 'Phường Tân Giang', type: 'Phường' },
      { code: '01012', name: 'Phường Ngọc Xuân', type: 'Phường' },
      { code: '01015', name: 'Phường Đề Thám', type: 'Phường' },
      { code: '01018', name: 'Phường Hòa Chung', type: 'Phường' },
      { code: '01021', name: 'Phường Duyệt Trung', type: 'Phường' },
      { code: '01024', name: 'Thị trấn Nước Hai', type: 'Thị trấn' },
      { code: '01027', name: 'Thị trấn Quảng Uyên', type: 'Thị trấn' }
    ],

    // 08: TỈNH TUYÊN QUANG
    '08': [
      { code: '02200', name: 'Phường Phan Thiết', type: 'Phường' },
      { code: '02203', name: 'Phường Minh Xuân', type: 'Phường' },
      { code: '02206', name: 'Phường Tân Quang', type: 'Phường' },
      { code: '02209', name: 'Phường Nông Tiến', type: 'Phường' },
      { code: '02212', name: 'Phường Ỷ La', type: 'Phường' },
      { code: '02215', name: 'Phường Tân Hà', type: 'Phường' },
      { code: '01240', name: 'Phường Trần Phú', type: 'Phường' },
      { code: '01243', name: 'Phường Ngọc Hà', type: 'Phường' },
      { code: '01246', name: 'Phường Nguyễn Trãi', type: 'Phường' },
      { code: '01249', name: 'Phường Minh Khai', type: 'Phường' }
    ],

    // 10: TỈNH LÀO CAI
    '10': [
      { code: '02638', name: 'Phường Duyên Hải', type: 'Phường' },
      { code: '02641', name: 'Phường Lào Cai', type: 'Phường' },
      { code: '02644', name: 'Phường Phố Mới', type: 'Phường' },
      { code: '02647', name: 'Phường Kim Tân', type: 'Phường' },
      { code: '02650', name: 'Phường Bắc Lệnh', type: 'Phường' },
      { code: '02653', name: 'Phường Pom Hán', type: 'Phường' },
      { code: '02656', name: 'Phường Nam Cường', type: 'Phường' },
      { code: '02659', name: 'Phường Sa Pa', type: 'Phường' },
      { code: '03004', name: 'Phường Yên Thịnh', type: 'Phường' },
      { code: '03007', name: 'Phường Đồng Tâm', type: 'Phường' }
    ],

    // 11: TỈNH ĐIỆN BIÊN
    '11': [
      { code: '03100', name: 'Phường Noong Bua', type: 'Phường' },
      { code: '03103', name: 'Phường Him Lam', type: 'Phường' },
      { code: '03106', name: 'Phường Thanh Bình', type: 'Phường' },
      { code: '03109', name: 'Phường Tân Thanh', type: 'Phường' },
      { code: '03112', name: 'Phường Mường Thanh', type: 'Phường' },
      { code: '03115', name: 'Phường Nam Thanh', type: 'Phường' },
      { code: '03118', name: 'Phường Thanh Trường', type: 'Phường' },
      { code: '03121', name: 'Thị trấn Mường Ảng', type: 'Thị trấn' },
      { code: '03124', name: 'Thị trấn Tuần Giáo', type: 'Thị trấn' },
      { code: '03127', name: 'Thị trấn Điện Biên Đông', type: 'Thị trấn' }
    ],

    // 12: TỈNH LAI CHÂU
    '12': [
      { code: '03394', name: 'Phường Quyết Thắng', type: 'Phường' },
      { code: '03397', name: 'Phường Tân Phong', type: 'Phường' },
      { code: '03400', name: 'Phường Quyết Tiến', type: 'Phường' },
      { code: '03403', name: 'Phường Đoàn Kết', type: 'Phường' },
      { code: '03406', name: 'Phường Đông Phong', type: 'Phường' },
      { code: '03409', name: 'Thị trấn Tam Đường', type: 'Thị trấn' },
      { code: '03412', name: 'Thị trấn Phong Thổ', type: 'Thị trấn' },
      { code: '03415', name: 'Thị trấn Mường Tè', type: 'Thị trấn' },
      { code: '03418', name: 'Thị trấn Sìn Hồ', type: 'Thị trấn' },
      { code: '03421', name: 'Thị trấn Tân Uyên', type: 'Thị trấn' }
    ],

    // 14: TỈNH SƠN LA
    '14': [
      { code: '03652', name: 'Phường Chiềng Lề', type: 'Phường' },
      { code: '03655', name: 'Phường Tô Hiệu', type: 'Phường' },
      { code: '03658', name: 'Phường Quyết Thắng', type: 'Phường' },
      { code: '03661', name: 'Phường Quyết Tâm', type: 'Phường' },
      { code: '03664', name: 'Phường Chiềng Cơi', type: 'Phường' },
      { code: '03667', name: 'Phường Chiềng An', type: 'Phường' },
      { code: '03670', name: 'Phường Chiềng Sinh', type: 'Phường' },
      { code: '03673', name: 'Thị trấn Mộc Châu', type: 'Thị trấn' },
      { code: '03676', name: 'Thị trấn Nông trường Mộc Châu', type: 'Thị trấn' },
      { code: '03679', name: 'Thị trấn Hát Lót', type: 'Thị trấn' }
    ],

    // 19: TỈNH THÁI NGUYÊN
    '19': [
      { code: '05785', name: 'Phường Trưng Vương', type: 'Phường' },
      { code: '05788', name: 'Phường Hoàng Văn Thụ', type: 'Phường' },
      { code: '05791', name: 'Phường Phan Đình Phùng', type: 'Phường' },
      { code: '05794', name: 'Phường Tân Thịnh', type: 'Phường' },
      { code: '05797', name: 'Phường Quang Trung', type: 'Phường' },
      { code: '05800', name: 'Phường Gia Sàng', type: 'Phường' },
      { code: '05803', name: 'Phường Sông Công', type: 'Phường' },
      { code: '05806', name: 'Phường Ba Hàng', type: 'Phường' },
      { code: '01519', name: 'Phường Đức Xuân', type: 'Phường' },
      { code: '01522', name: 'Phường Sông Cầu', type: 'Phường' }
    ],

    // 20: TỈNH LẠNG SƠN
    '20': [
      { code: '06247', name: 'Phường Hoàng Văn Thụ', type: 'Phường' },
      { code: '06250', name: 'Phường Tam Thanh', type: 'Phường' },
      { code: '06253', name: 'Phường Vĩnh Trại', type: 'Phường' },
      { code: '06256', name: 'Phường Đông Kinh', type: 'Phường' },
      { code: '06259', name: 'Phường Chi Lăng', type: 'Phường' },
      { code: '06262', name: 'Thị trấn Đồng Đăng', type: 'Thị trấn' },
      { code: '06265', name: 'Thị trấn Cao Lộc', type: 'Thị trấn' },
      { code: '06268', name: 'Thị trấn Hữu Lũng', type: 'Thị trấn' },
      { code: '06271', name: 'Thị trấn Bắc Sơn', type: 'Thị trấn' },
      { code: '06274', name: 'Thị trấn Lộc Bình', type: 'Thị trấn' }
    ],

    // 22: TỈNH QUẢNG NINH
    '22': [
      { code: '06700', name: 'Phường Hồng Gai', type: 'Phường' },
      { code: '06703', name: 'Phường Bạch Đằng', type: 'Phường' },
      { code: '06706', name: 'Phường Bãi Cháy', type: 'Phường' },
      { code: '06709', name: 'Phường Cao Xanh', type: 'Phường' },
      { code: '06712', name: 'Phường Hồng Hà', type: 'Phường' },
      { code: '06715', name: 'Phường Cẩm Phả', type: 'Phường' },
      { code: '06718', name: 'Phường Uông Bí', type: 'Phường' },
      { code: '06721', name: 'Phường Móng Cái', type: 'Phường' },
      { code: '07033', name: 'Đặc khu Vân Đồn', type: 'Đặc khu' },
      { code: '07060', name: 'Đặc khu Cô Tô', type: 'Đặc khu' }
    ],

    // 25: TỈNH PHÚ THỌ
    '25': [
      { code: '07432', name: 'Phường Việt Trì', type: 'Phường' },
      { code: '07435', name: 'Phường Gia Cẩm', type: 'Phường' },
      { code: '07438', name: 'Phường Tiên Cát', type: 'Phường' },
      { code: '07441', name: 'Phường Tân Dân', type: 'Phường' },
      { code: '07444', name: 'Phường Nông Trang', type: 'Phường' },
      { code: '08800', name: 'Phường Vĩnh Yên', type: 'Phường' },
      { code: '08803', name: 'Phường Tích Sơn', type: 'Phường' },
      { code: '08806', name: 'Phường Phúc Yên', type: 'Phường' },
      { code: '04000', name: 'Phường Tân Thịnh', type: 'Phường' },
      { code: '04003', name: 'Phường Đồng Tiến', type: 'Phường' }
    ],

    // 27: TỈNH BẮC NINH
    '27': [
      { code: '09190', name: 'Phường Suối Hoa', type: 'Phường' },
      { code: '09193', name: 'Phường Tiền An', type: 'Phường' },
      { code: '09196', name: 'Phường Ninh Xá', type: 'Phường' },
      { code: '09199', name: 'Phường Vệ An', type: 'Phường' },
      { code: '09202', name: 'Phường Kinh Bắc', type: 'Phường' },
      { code: '09205', name: 'Phường Từ Sơn', type: 'Phường' },
      { code: '07090', name: 'Phường Bắc Giang', type: 'Phường' },
      { code: '07093', name: 'Phường Trần Phú', type: 'Phường' },
      { code: '07096', name: 'Phường Ngô Quyền', type: 'Phường' },
      { code: '07099', name: 'Phường Dĩnh Kế', type: 'Phường' }
    ],

    // 31: THÀNH PHỐ HẢI PHÒNG
    '31': [
      { code: '11000', name: 'Phường Minh Khai', type: 'Phường' },
      { code: '11003', name: 'Phường Hoàng Văn Thụ', type: 'Phường' },
      { code: '11006', name: 'Phường Phan Bội Châu', type: 'Phường' },
      { code: '11009', name: 'Phường Lạc Viên', type: 'Phường' },
      { code: '11012', name: 'Phường Cầu Đất', type: 'Phường' },
      { code: '11015', name: 'Phường Đằng Giang', type: 'Phường' },
      { code: '09700', name: 'Phường Lê Thanh Nghị', type: 'Phường' },
      { code: '09703', name: 'Phường Trần Phú', type: 'Phường' },
      { code: '11776', name: 'Đặc khu Cát Hải', type: 'Đặc khu' },
      { code: '11800', name: 'Đặc khu Bạch Long Vĩ', type: 'Đặc khu' }
    ],

    // 33: TỈNH HƯNG YÊN
    '33': [
      { code: '11833', name: 'Phường Hiến Nam', type: 'Phường' },
      { code: '11836', name: 'Phường Lam Sơn', type: 'Phường' },
      { code: '11839', name: 'Phường An Tảo', type: 'Phường' },
      { code: '11842', name: 'Phường Lê Lợi', type: 'Phường' },
      { code: '11845', name: 'Phường Hồng Châu', type: 'Phường' },
      { code: '11848', name: 'Phường Mỹ Hào', type: 'Phường' },
      { code: '12400', name: 'Phường Lê Hồng Phong', type: 'Phường' },
      { code: '12403', name: 'Phường Bồ Xuyên', type: 'Phường' },
      { code: '12406', name: 'Phường Kỳ Bá', type: 'Phường' },
      { code: '12409', name: 'Phường Trần Hưng Đạo', type: 'Phường' }
    ],

    // 37: TỈNH NINH BÌNH
    '37': [
      { code: '14100', name: 'Phường Đông Thành', type: 'Phường' },
      { code: '14103', name: 'Phường Vân Giang', type: 'Phường' },
      { code: '14106', name: 'Phường Bích Đào', type: 'Phường' },
      { code: '14109', name: 'Phường Nam Bình', type: 'Phường' },
      { code: '14112', name: 'Phường Tam Điệp', type: 'Phường' },
      { code: '12100', name: 'Phường Phủ Lý', type: 'Phường' },
      { code: '12103', name: 'Phường Minh Khai', type: 'Phường' },
      { code: '12800', name: 'Phường Nam Định', type: 'Phường' },
      { code: '12803', name: 'Phường Vị Hoàng', type: 'Phường' },
      { code: '12806', name: 'Phường Hạ Long', type: 'Phường' }
    ],

    // 38: TỈNH THANH HÓA
    '38': [
      { code: '14596', name: 'Phường Ba Đình', type: 'Phường' },
      { code: '14599', name: 'Phường Lam Sơn', type: 'Phường' },
      { code: '14602', name: 'Phường Điện Biên', type: 'Phường' },
      { code: '14605', name: 'Phường Ngọc Trạo', type: 'Phường' },
      { code: '14608', name: 'Phường Đông Thọ', type: 'Phường' },
      { code: '14611', name: 'Phường Đông Sơn', type: 'Phường' },
      { code: '14614', name: 'Phường Sầm Sơn', type: 'Phường' },
      { code: '14617', name: 'Phường Bắc Sơn', type: 'Phường' },
      { code: '14620', name: 'Phường Bỉm Sơn', type: 'Phường' },
      { code: '14623', name: 'Phường Nghi Sơn', type: 'Phường' }
    ],

    // 40: TỈNH NGHỆ AN
    '40': [
      { code: '17000', name: 'Phường Lê Mao', type: 'Phường' },
      { code: '17003', name: 'Phường Quang Trung', type: 'Phường' },
      { code: '17006', name: 'Phường Trường Thi', type: 'Phường' },
      { code: '17009', name: 'Phường Hưng Dũng', type: 'Phường' },
      { code: '17012', name: 'Phường Bến Thủy', type: 'Phường' },
      { code: '17015', name: 'Phường Hà Huy Tập', type: 'Phường' },
      { code: '17018', name: 'Phường Cửa Lò', type: 'Phường' },
      { code: '17021', name: 'Phường Nghi Hương', type: 'Phường' },
      { code: '17024', name: 'Phường Thái Hòa', type: 'Phường' },
      { code: '17027', name: 'Phường Hoàng Mai', type: 'Phường' }
    ],

    // 42: TỈNH HÀ TĨNH
    '42': [
      { code: '18100', name: 'Phường Bắc Hà', type: 'Phường' },
      { code: '18103', name: 'Phường Nam Hà', type: 'Phường' },
      { code: '18106', name: 'Phường Tân Giang', type: 'Phường' },
      { code: '18109', name: 'Phường Trần Phú', type: 'Phường' },
      { code: '18112', name: 'Phường Hà Huy Tập', type: 'Phường' },
      { code: '18115', name: 'Phường Đại Nài', type: 'Phường' },
      { code: '18118', name: 'Phường Kỳ Anh', type: 'Phường' },
      { code: '18121', name: 'Phường Sông Trí', type: 'Phường' },
      { code: '18124', name: 'Phường Hồng Lĩnh', type: 'Phường' },
      { code: '18127', name: 'Phường Bắc Hồng', type: 'Phường' }
    ],

    // 45: TỈNH QUẢNG TRỊ
    '45': [
      { code: '19600', name: 'Phường 1 (Đông Hà)', type: 'Phường' },
      { code: '19603', name: 'Phường 2 (Đông Hà)', type: 'Phường' },
      { code: '19606', name: 'Phường 3 (Đông Hà)', type: 'Phường' },
      { code: '19609', name: 'Phường 4 (Đông Hà)', type: 'Phường' },
      { code: '19612', name: 'Phường 5 (Đông Hà)', type: 'Phường' },
      { code: '19615', name: 'Phường 1 (Quảng Trị)', type: 'Phường' },
      { code: '19618', name: 'Phường 2 (Quảng Trị)', type: 'Phường' },
      { code: '18900', name: 'Phường Đồng Hới', type: 'Phường' },
      { code: '18903', name: 'Phường Đồng Phú', type: 'Phường' },
      { code: '18906', name: 'Phường Hải Thành', type: 'Phường' }
    ],

    // 46: THÀNH PHỐ HUẾ
    '46': [
      { code: '19900', name: 'Phường Phú Hội', type: 'Phường' },
      { code: '19903', name: 'Phường Phú Nhuận', type: 'Phường' },
      { code: '19906', name: 'Phường Vĩnh Ninh', type: 'Phường' },
      { code: '19909', name: 'Phường Thuận Hòa', type: 'Phường' },
      { code: '19912', name: 'Phường Thuận Thành', type: 'Phường' },
      { code: '19915', name: 'Phường Tây Lộc', type: 'Phường' },
      { code: '19918', name: 'Phường Kim Long', type: 'Phường' },
      { code: '19921', name: 'Phường Hương Long', type: 'Phường' },
      { code: '19924', name: 'Phường An Đông', type: 'Phường' },
      { code: '19927', name: 'Phường Thủy Xuân', type: 'Phường' }
    ],

    // 48: THÀNH PHỐ ĐÀ NẴNG
    '48': [
      { code: '20194', name: 'Phường Hải Châu 1', type: 'Phường' },
      { code: '20197', name: 'Phường Hải Châu 2', type: 'Phường' },
      { code: '20200', name: 'Phường Thạch Thang', type: 'Phường' },
      { code: '20203', name: 'Phường Thanh Bình', type: 'Phường' },
      { code: '20206', name: 'Phường Thuận Phước', type: 'Phường' },
      { code: '20209', name: 'Phường Hòa Cường Bắc', type: 'Phường' },
      { code: '20212', name: 'Phường Hòa Cường Nam', type: 'Phường' },
      { code: '20215', name: 'Phường Phước Ninh', type: 'Phường' },
      { code: '20500', name: 'Phường Tam Kỳ', type: 'Phường' },
      { code: '20503', name: 'Phường Hội An', type: 'Phường' },
      { code: '20499', name: 'Đặc khu Hoàng Sa', type: 'Đặc khu' }
    ],

    // 51: TỈNH QUẢNG NGÃI
    '51': [
      { code: '20900', name: 'Phường Trần Phú', type: 'Phường' },
      { code: '20903', name: 'Phường Lê Hồng Phong', type: 'Phường' },
      { code: '20906', name: 'Phường Trần Hưng Đạo', type: 'Phường' },
      { code: '20909', name: 'Phường Nguyễn Nghiêm', type: 'Phường' },
      { code: '20912', name: 'Phường Chánh Lộ', type: 'Phường' },
      { code: '20915', name: 'Phường Nghĩa Chánh', type: 'Phường' },
      { code: '21000', name: 'Phường Kon Tum', type: 'Phường' },
      { code: '21003', name: 'Phường Quang Trung', type: 'Phường' },
      { code: '21006', name: 'Phường Quyết Thắng', type: 'Phường' },
      { code: '20980', name: 'Đặc khu Lý Sơn', type: 'Đặc khu' }
    ],

    // 56: TỈNH KHÁNH HÒA
    '56': [
      { code: '22300', name: 'Phường Lộc Thọ', type: 'Phường' },
      { code: '22303', name: 'Phường Phước Hải', type: 'Phường' },
      { code: '22306', name: 'Phường Vĩnh Hải', type: 'Phường' },
      { code: '22309', name: 'Phường Vĩnh Nguyên', type: 'Phường' },
      { code: '22312', name: 'Phường Vĩnh Phước', type: 'Phường' },
      { code: '22315', name: 'Phường Cam Ranh', type: 'Phường' },
      { code: '22800', name: 'Phường Phan Rang', type: 'Phường' },
      { code: '22803', name: 'Phường Tháp Chàm', type: 'Phường' },
      { code: '22806', name: 'Phường Đô Vinh', type: 'Phường' },
      { code: '22420', name: 'Đặc khu Trường Sa', type: 'Đặc khu' }
    ],

    // 64: TỈNH GIA LAI
    '64': [
      { code: '23200', name: 'Phường Tây Sơn', type: 'Phường' },
      { code: '23203', name: 'Phường Hội Thương', type: 'Phường' },
      { code: '23206', name: 'Phường Hoa Lư', type: 'Phường' },
      { code: '23209', name: 'Phường Diên Hồng', type: 'Phường' },
      { code: '23212', name: 'Phường Ia Kring', type: 'Phường' },
      { code: '23215', name: 'Phường Pleiku', type: 'Phường' },
      { code: '21500', name: 'Phường Quy Nhơn', type: 'Phường' },
      { code: '21503', name: 'Phường Lê Lợi', type: 'Phường' },
      { code: '21506', name: 'Phường Trần Hưng Đạo', type: 'Phường' },
      { code: '21509', name: 'Phường Nguyễn Văn Cừ', type: 'Phường' }
    ],

    // 66: TỈNH ĐẮK LẮK
    '66': [
      { code: '24100', name: 'Phường Buôn Ma Thuột', type: 'Phường' },
      { code: '24103', name: 'Phường Thắng Lợi', type: 'Phường' },
      { code: '24106', name: 'Phường Tân Lợi', type: 'Phường' },
      { code: '24109', name: 'Phường Tân Lập', type: 'Phường' },
      { code: '24112', name: 'Phường Tự An', type: 'Phường' },
      { code: '24115', name: 'Phường Ea Tam', type: 'Phường' },
      { code: '22000', name: 'Phường Tuy Hòa', type: 'Phường' },
      { code: '22003', name: 'Phường 1 (Tuy Hòa)', type: 'Phường' },
      { code: '22006', name: 'Phường 2 (Tuy Hòa)', type: 'Phường' },
      { code: '22009', name: 'Phường Phú Lâm', type: 'Phường' }
    ],

    // 68: TỈNH LÂM ĐỒNG
    '68': [
      { code: '24800', name: 'Phường 1 (Đà Lạt)', type: 'Phường' },
      { code: '24803', name: 'Phường 2 (Đà Lạt)', type: 'Phường' },
      { code: '24806', name: 'Phường 3 (Đà Lạt)', type: 'Phường' },
      { code: '24809', name: 'Phường 4 (Đà Lạt)', type: 'Phường' },
      { code: '24812', name: 'Phường Bảo Lộc', type: 'Phường' },
      { code: '24815', name: 'Phường B\'Lao', type: 'Phường' },
      { code: '23000', name: 'Phường Phan Thiết', type: 'Phường' },
      { code: '23003', name: 'Phường Phú Thủy', type: 'Phường' },
      { code: '24500', name: 'Phường Gia Nghĩa', type: 'Phường' },
      { code: '23130', name: 'Đặc khu Phú Quý', type: 'Đặc khu' }
    ],

    // 72: TỈNH TÂY NINH
    '72': [
      { code: '25200', name: 'Phường 1 (Tây Ninh)', type: 'Phường' },
      { code: '25203', name: 'Phường 2 (Tây Ninh)', type: 'Phường' },
      { code: '25206', name: 'Phường 3 (Tây Ninh)', type: 'Phường' },
      { code: '25209', name: 'Phường Hiệp Ninh', type: 'Phường' },
      { code: '25212', name: 'Phường Trảng Bàng', type: 'Phường' },
      { code: '25215', name: 'Phường Hòa Thành', type: 'Phường' },
      { code: '27700', name: 'Phường Tân An', type: 'Phường' },
      { code: '27703', name: 'Phường 1 (Tân An)', type: 'Phường' },
      { code: '27706', name: 'Phường 2 (Tân An)', type: 'Phường' },
      { code: '27709', name: 'Phường Kiến Tường', type: 'Phường' }
    ],

    // 86: TỈNH VĨNH LONG
    '86': [
      { code: '28600', name: 'Phường 1 (Vĩnh Long)', type: 'Phường' },
      { code: '28603', name: 'Phường 2 (Vĩnh Long)', type: 'Phường' },
      { code: '28606', name: 'Phường 3 (Vĩnh Long)', type: 'Phường' },
      { code: '28609', name: 'Phường 4 (Vĩnh Long)', type: 'Phường' },
      { code: '28612', name: 'Phường Bình Minh', type: 'Phường' },
      { code: '28300', name: 'Phường Bến Tre', type: 'Phường' },
      { code: '28303', name: 'Phường An Hội', type: 'Phường' },
      { code: '29000', name: 'Phường Trà Vinh', type: 'Phường' },
      { code: '29003', name: 'Phường 1 (Trà Vinh)', type: 'Phường' },
      { code: '29006', name: 'Phường Duyên Hải', type: 'Phường' }
    ],

    // 87: TỈNH ĐỒNG THÁP
    '87': [
      { code: '29500', name: 'Phường Cao Lãnh', type: 'Phường' },
      { code: '29503', name: 'Phường 1 (Cao Lãnh)', type: 'Phường' },
      { code: '29506', name: 'Phường 2 (Cao Lãnh)', type: 'Phường' },
      { code: '29509', name: 'Phường Sa Đéc', type: 'Phường' },
      { code: '29512', name: 'Phường 1 (Sa Đéc)', type: 'Phường' },
      { code: '29515', name: 'Phường Hồng Ngự', type: 'Phường' },
      { code: '28000', name: 'Phường Mỹ Tho', type: 'Phường' },
      { code: '28003', name: 'Phường 1 (Mỹ Tho)', type: 'Phường' },
      { code: '28006', name: 'Phường Gò Công', type: 'Phường' },
      { code: '28009', name: 'Phường Cai Lậy', type: 'Phường' }
    ],

    // 89: TỈNH AN GIANG
    '89': [
      { code: '30000', name: 'Phường Mỹ Bình', type: 'Phường' },
      { code: '30003', name: 'Phường Mỹ Long', type: 'Phường' },
      { code: '30006', name: 'Phường Mỹ Xuyên', type: 'Phường' },
      { code: '30009', name: 'Phường Long Xuyên', type: 'Phường' },
      { code: '30012', name: 'Phường Châu Đốc', type: 'Phường' },
      { code: '30015', name: 'Phường Tân Châu', type: 'Phường' },
      { code: '30500', name: 'Phường Rạch Giá', type: 'Phường' },
      { code: '30503', name: 'Phường Vĩnh Thanh Vân', type: 'Phường' },
      { code: '30506', name: 'Phường Hà Tiên', type: 'Phường' },
      { code: '30800', name: 'Đặc khu Phú Quốc', type: 'Đặc khu' },
      { code: '30850', name: 'Đặc khu Kiên Hải', type: 'Đặc khu' }
    ],

    // 92: THÀNH PHỐ CẦN THƠ
    '92': [
      { code: '31100', name: 'Phường Tân An', type: 'Phường' },
      { code: '31103', name: 'Phường An Cư', type: 'Phường' },
      { code: '31106', name: 'Phường An Phú', type: 'Phường' },
      { code: '31109', name: 'Phường Xuân Khánh', type: 'Phường' },
      { code: '31112', name: 'Phường Hưng Lợi', type: 'Phường' },
      { code: '31115', name: 'Phường An Hòa', type: 'Phường' },
      { code: '31118', name: 'Phường Cái Khế', type: 'Phường' },
      { code: '31121', name: 'Phường Trà Nóc', type: 'Phường' },
      { code: '31124', name: 'Phường Bình Thủy', type: 'Phường' },
      { code: '31127', name: 'Phường Cái Răng', type: 'Phường' },
      { code: '31130', name: 'Phường Ô Môn', type: 'Phường' },
      { code: '31133', name: 'Phường Thốt Nốt', type: 'Phường' },
      { code: '31600', name: 'Phường Vị Thanh', type: 'Phường' },
      { code: '31603', name: 'Phường Ngã Bảy', type: 'Phường' },
      { code: '32000', name: 'Phường Sóc Trăng', type: 'Phường' }
    ],

    // 96: TỈNH CÀ MAU
    '96': [
      { code: '32200', name: 'Phường 1 (Cà Mau)', type: 'Phường' },
      { code: '32203', name: 'Phường 2 (Cà Mau)', type: 'Phường' },
      { code: '32206', name: 'Phường 4 (Cà Mau)', type: 'Phường' },
      { code: '32209', name: 'Phường 5 (Cà Mau)', type: 'Phường' },
      { code: '32212', name: 'Phường 6 (Cà Mau)', type: 'Phường' },
      { code: '32215', name: 'Phường 7 (Cà Mau)', type: 'Phường' },
      { code: '32218', name: 'Phường 8 (Cà Mau)', type: 'Phường' },
      { code: '32221', name: 'Phường 9 (Cà Mau)', type: 'Phường' },
      { code: '32224', name: 'Phường Tân Xuyên', type: 'Phường' },
      { code: '31900', name: 'Phường Bạc Liêu', type: 'Phường' },
      { code: '31903', name: 'Phường 1 (Bạc Liêu)', type: 'Phường' },
      { code: '31906', name: 'Phường Giá Rai', type: 'Phường' }
    ]
  };

  // 3. HELPER FUNCTIONS & API XỬ LÝ ĐỊA CHỈ HÀNH CHÍNH
  const AdministrativeService = {
    legalReference: 'Quyết định 19/2025/QĐ-TTg ngày 30/06/2025 của Thủ tướng Chính phủ',
    version: '2026.1-Official',

    /**
     * Lấy toàn bộ danh sách 34 Tỉnh / Thành phố
     */
    getProvinces() {
      return PROVINCES_2026;
    },

    /**
     * Lấy thông tin Tỉnh / Thành phố theo mã (2 chữ số)
     */
    getProvinceByCode(code) {
      if (!code) return null;
      const cleanCode = String(code).trim().padStart(2, '0');
      return PROVINCES_2026.find(p => p.code === cleanCode) || null;
    },

    /**
     * Lấy danh sách Xã / Phường / Đặc khu trực thuộc Tỉnh / Thành phố
     */
    getWardsByProvince(provinceCode) {
      if (!provinceCode) return [];
      const cleanCode = String(provinceCode).trim().padStart(2, '0');
      return WARDS_BY_PROVINCE_2026[cleanCode] || [];
    },

    /**
     * Lấy thông tin Xã / Phường theo mã Tỉnh và mã Xã
     */
    getWardByCode(provinceCode, wardCode) {
      if (!provinceCode || !wardCode) return null;
      const wards = this.getWardsByProvince(provinceCode);
      const cleanWardCode = String(wardCode).trim();
      return wards.find(w => w.code === cleanWardCode) || null;
    },

    /**
     * Kiểm tra cặp mã Tỉnh và mã Xã/Phường có hợp lệ theo QĐ 19/2025/QĐ-TTg hay không
     */
    isValidAdministrativePair(provinceCode, wardCode) {
      if (!provinceCode || !wardCode) return false;
      const province = this.getProvinceByCode(provinceCode);
      if (!province) return false;
      const ward = this.getWardByCode(provinceCode, wardCode);
      return Boolean(ward);
    },

    /**
     * Chuẩn hóa và định dạng chuỗi địa chỉ đầy đủ:
     * Thứ tự chuẩn: [Địa chỉ chi tiết], [Xã/Phường/Đặc khu], [Tỉnh/Thành phố]
     */
    formatFullAddress({ detailed_address, ward_name, province_name, ward_code, province_code, legacy_address }) {
      const parts = [];
      if (detailed_address && detailed_address.trim()) {
        parts.push(detailed_address.trim());
      }
      if (ward_name && ward_name.trim()) {
        parts.push(ward_name.trim());
      }
      if (province_name && province_name.trim()) {
        parts.push(province_name.trim());
      }

      if (parts.length > 0) {
        return parts.join(', ');
      }
      return legacy_address || 'Chưa cập nhật địa chỉ';
    },

    /**
     * Phương án xử lý hồ sơ cũ: Phân tích địa chỉ trước sắp xếp (có chứa quận/huyện/thị xã)
     * và chuyển đổi tương ứng sang danh mục 2026 mà KHÔNG làm mất dữ liệu gốc.
     */
    migrateLegacyAddress(legacyText) {
      if (!legacyText || typeof legacyText !== 'string') {
        return {
          province_code: '75',
          province_name: 'Tỉnh Đồng Nai',
          ward_code: '26176',
          ward_name: 'Phường Bửu Long',
          detailed_address: '',
          legacy_address: legacyText || ''
        };
      }

      const text = legacyText.trim();
      let matchedProvince = null;
      let matchedWard = null;

      // 1. Dò tìm Tỉnh / Thành phố
      if (text.includes('Đồng Nai') || text.includes('Biên Hòa') || text.includes('Trảng Bom') || text.includes('Long Thành')) {
        matchedProvince = this.getProvinceByCode('75');
      } else if (text.includes('Hồ Chí Minh') || text.includes('TP.HCM') || text.includes('TP HCM') || text.includes('Sài Gòn') || text.includes('Bình Dương') || text.includes('Vũng Tàu')) {
        matchedProvince = this.getProvinceByCode('79');
      } else if (text.includes('Hà Nội')) {
        matchedProvince = this.getProvinceByCode('01');
      } else {
        // Dò theo tên tỉnh khác
        for (const p of PROVINCES_2026) {
          const rawName = p.name.replace('Tỉnh ', '').replace('Thành phố ', '');
          if (text.includes(rawName)) {
            matchedProvince = p;
            break;
          }
        }
      }

      if (!matchedProvince) {
        matchedProvince = this.getProvinceByCode('75'); // Mặc định Đồng Nai nếu không xác định
      }

      // 2. Dò tìm Xã / Phường trong tỉnh tìm được
      const wards = this.getWardsByProvince(matchedProvince.code);
      for (const w of wards) {
        const simpleName = w.name.replace('Phường ', '').replace('Xã ', '').replace('Thị trấn ', '').replace('Đặc khu ', '');
        if (text.includes(w.name) || (simpleName.length > 3 && text.includes(simpleName))) {
          matchedWard = w;
          break;
        }
      }

      // Nếu không tìm thấy xã cụ thể, chọn xã trung tâm/đầu tiên của tỉnh đó
      if (!matchedWard && wards.length > 0) {
        matchedWard = wards[0];
      }

      // Tách địa chỉ chi tiết (loại bỏ phần tỉnh/huyện/xã đã nhận diện)
      let detailed = text;
      if (matchedProvince) detailed = detailed.replace(matchedProvince.name, '').replace('Tỉnh ' + matchedProvince.name, '');
      if (matchedWard) detailed = detailed.replace(matchedWard.name, '');
      detailed = detailed.replace(/TP\.\s*Biên Hòa/gi, '')
                         .replace(/H\.\s*Trảng Bom/gi, '')
                         .replace(/H\.\s*Long Thành/gi, '')
                         .replace(/Quận\s*\d+/gi, '')
                         .replace(/,\s*,/g, ',')
                         .replace(/^\s*,\s*|\s*,\s*$/g, '')
                         .trim();

      return {
        province_code: matchedProvince.code,
        province_name: matchedProvince.name,
        ward_code: matchedWard ? matchedWard.code : '',
        ward_name: matchedWard ? matchedWard.name : '',
        detailed_address: detailed || text,
        legacy_address: text // Bảo lưu nguyên vẹn địa chỉ cũ
      };
    },

    /**
     * Cơ chế cập nhật danh mục linh hoạt khi Nhà nước có quyết định sửa đổi, bổ sung
     */
    updateCatalog(patch = {}) {
      if (patch.provinces && Array.isArray(patch.provinces)) {
        patch.provinces.forEach(newP => {
          const idx = PROVINCES_2026.findIndex(p => p.code === newP.code);
          if (idx >= 0) PROVINCES_2026[idx] = Object.assign(PROVINCES_2026[idx], newP);
          else PROVINCES_2026.push(newP);
        });
      }
      if (patch.wards && typeof patch.wards === 'object') {
        Object.keys(patch.wards).forEach(pCode => {
          if (!WARDS_BY_PROVINCE_2026[pCode]) WARDS_BY_PROVINCE_2026[pCode] = [];
          const newWards = patch.wards[pCode];
          newWards.forEach(nw => {
            const wIdx = WARDS_BY_PROVINCE_2026[pCode].findIndex(w => w.code === nw.code);
            if (wIdx >= 0) WARDS_BY_PROVINCE_2026[pCode][wIdx] = Object.assign(WARDS_BY_PROVINCE_2026[pCode][wIdx], nw);
            else WARDS_BY_PROVINCE_2026[pCode].push(nw);
          });
        });
      }
      return { success: true, totalProvinces: PROVINCES_2026.length };
    }
  };

  // Xuất ra namespace toàn cục
  window.SA = window.SA || {};
  window.SA.Administrative = AdministrativeService;
  window.VIETNAM_ADMINISTRATIVE_2026 = AdministrativeService;

})();
