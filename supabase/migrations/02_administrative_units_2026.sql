-- ============================================================================
-- AI SMARTATTEND ĐỒNG NAI - MIGRATION: 02_administrative_units_2026.sql
-- Danh mục Đơn vị Hành chính Việt Nam hiện hành năm 2026
-- Căn cứ pháp lý: Quyết định số 19/2025/QĐ-TTg ngày 30/06/2025 của Thủ tướng Chính phủ
-- Ban hành Bảng danh mục và mã số các đơn vị hành chính Việt Nam (hiệu lực từ 01/07/2025)
-- ============================================================================

-- 1. BẢNG administrative_provinces (34 Tỉnh / Thành phố trực thuộc Trung ương)
CREATE TABLE IF NOT EXISTS public.administrative_provinces (
    code VARCHAR(10) PRIMARY KEY, -- Mã 2 chữ số (VD: '01', '75', '79')
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Tỉnh', -- 'Tỉnh', 'Thành phố Trung ương'
    region VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. BẢNG administrative_wards (Xã / Phường / Đặc khu trực thuộc)
CREATE TABLE IF NOT EXISTS public.administrative_wards (
    code VARCHAR(10) PRIMARY KEY, -- Mã 5 chữ số chính thức
    province_code VARCHAR(10) NOT NULL REFERENCES public.administrative_provinces(code) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Xã', -- 'Phường', 'Xã', 'Đặc khu', 'Thị trấn'
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index tăng tốc truy vấn địa giới hành chính
CREATE INDEX IF NOT EXISTS idx_administrative_wards_province_code ON public.administrative_wards(province_code);
CREATE INDEX IF NOT EXISTS idx_administrative_wards_type ON public.administrative_wards(type);

-- 3. BỔ SUNG CÁC CỘT ĐỊA CHỈ HÀNH CHÍNH VÀO BẢNG student_profiles VÀ users
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS province_code VARCHAR(10) REFERENCES public.administrative_provinces(code) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS province_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS ward_code VARCHAR(10) REFERENCES public.administrative_wards(code) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ward_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS detailed_address TEXT,
ADD COLUMN IF NOT EXISTS legacy_address TEXT, -- Bảo lưu địa chỉ lịch sử trước sắp xếp
ADD COLUMN IF NOT EXISTS address_updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS province_code VARCHAR(10) REFERENCES public.administrative_provinces(code) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS province_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS ward_code VARCHAR(10) REFERENCES public.administrative_wards(code) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ward_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS detailed_address TEXT,
ADD COLUMN IF NOT EXISTS legacy_address TEXT;

-- 4. NẠP DỮ LIỆU 34 TỈNH / THÀNH PHỐ TRỰC THUỘC TRUNG ƯƠNG (QĐ 19/2025/QĐ-TTg)
INSERT INTO public.administrative_provinces (code, name, type, region) VALUES
('01', 'Thành phố Hà Nội', 'Thành phố Trung ương', 'Đồng bằng sông Hồng'),
('04', 'Tỉnh Cao Bằng', 'Tỉnh', 'Đông Bắc Bộ'),
('08', 'Tỉnh Tuyên Quang', 'Tỉnh', 'Đông Bắc Bộ'),
('10', 'Tỉnh Lào Cai', 'Tỉnh', 'Tây Bắc Bộ'),
('11', 'Tỉnh Điện Biên', 'Tỉnh', 'Tây Bắc Bộ'),
('12', 'Tỉnh Lai Châu', 'Tỉnh', 'Tây Bắc Bộ'),
('14', 'Tỉnh Sơn La', 'Tỉnh', 'Tây Bắc Bộ'),
('19', 'Tỉnh Thái Nguyên', 'Tỉnh', 'Đông Bắc Bộ'),
('20', 'Tỉnh Lạng Sơn', 'Tỉnh', 'Đông Bắc Bộ'),
('22', 'Tỉnh Quảng Ninh', 'Tỉnh', 'Đông Bắc Bộ'),
('25', 'Tỉnh Phú Thọ', 'Tỉnh', 'Đông Bắc Bộ'),
('27', 'Tỉnh Bắc Ninh', 'Tỉnh', 'Đồng bằng sông Hồng'),
('31', 'Thành phố Hải Phòng', 'Thành phố Trung ương', 'Đồng bằng sông Hồng'),
('33', 'Tỉnh Hưng Yên', 'Tỉnh', 'Đồng bằng sông Hồng'),
('37', 'Tỉnh Ninh Bình', 'Tỉnh', 'Đồng bằng sông Hồng'),
('38', 'Tỉnh Thanh Hóa', 'Tỉnh', 'Bắc Trung Bộ'),
('40', 'Tỉnh Nghệ An', 'Tỉnh', 'Bắc Trung Bộ'),
('42', 'Tỉnh Hà Tĩnh', 'Tỉnh', 'Bắc Trung Bộ'),
('45', 'Tỉnh Quảng Trị', 'Tỉnh', 'Bắc Trung Bộ'),
('46', 'Thành phố Huế', 'Thành phố Trung ương', 'Bắc Trung Bộ'),
('48', 'Thành phố Đà Nẵng', 'Thành phố Trung ương', 'Duyên hải Nam Trung Bộ'),
('51', 'Tỉnh Quảng Ngãi', 'Tỉnh', 'Duyên hải Nam Trung Bộ'),
('56', 'Tỉnh Khánh Hòa', 'Tỉnh', 'Duyên hải Nam Trung Bộ'),
('64', 'Tỉnh Gia Lai', 'Tỉnh', 'Tây Nguyên'),
('66', 'Tỉnh Đắk Lắk', 'Tỉnh', 'Tây Nguyên'),
('68', 'Tỉnh Lâm Đồng', 'Tỉnh', 'Tây Nguyên'),
('72', 'Tỉnh Tây Ninh', 'Tỉnh', 'Đông Nam Bộ'),
('75', 'Tỉnh Đồng Nai', 'Tỉnh', 'Đông Nam Bộ'),
('79', 'Thành phố Hồ Chí Minh', 'Thành phố Trung ương', 'Đông Nam Bộ'),
('86', 'Tỉnh Vĩnh Long', 'Tỉnh', 'Đồng bằng sông Cửu Long'),
('87', 'Tỉnh Đồng Tháp', 'Tỉnh', 'Đồng bằng sông Cửu Long'),
('89', 'Tỉnh An Giang', 'Tỉnh', 'Đồng bằng sông Cửu Long'),
('92', 'Thành phố Cần Thơ', 'Thành phố Trung ương', 'Đồng bằng sông Cửu Long'),
('96', 'Tỉnh Cà Mau', 'Tỉnh', 'Đồng bằng sông Cửu Long')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    region = EXCLUDED.region,
    updated_at = TIMEZONE('utc'::text, NOW());

-- 5. NẠP DỮ LIỆU ĐẠI DIỆN XÃ, PHƯỜNG, ĐẶC KHU VỚI MÃ CHÍNH THỨC
-- A. Tỉnh Đồng Nai (75)
INSERT INTO public.administrative_wards (code, province_code, name, type) VALUES
('26176', '75', 'Phường Bửu Long', 'Phường'),
('26179', '75', 'Phường Tân Hiệp', 'Phường'),
('26182', '75', 'Phường Tam Hiệp', 'Phường'),
('26185', '75', 'Phường Trảng Dài', 'Phường'),
('26188', '75', 'Phường Tân Biên', 'Phường'),
('26191', '75', 'Phường Hố Nai', 'Phường'),
('26194', '75', 'Phường Tân Hòa', 'Phường'),
('26197', '75', 'Phường Quang Vinh', 'Phường'),
('26200', '75', 'Phường Thanh Bình', 'Phường'),
('26203', '75', 'Phường Hòa Bình', 'Phường'),
('26206', '75', 'Phường Quyết Thắng', 'Phường'),
('26209', '75', 'Phường Thống Nhất', 'Phường'),
('26212', '75', 'Phường Trung Dũng', 'Phường'),
('26215', '75', 'Phường Hiệp Hòa', 'Phường'),
('26218', '75', 'Phường An Bình', 'Phường'),
('26221', '75', 'Phường Bình Đa', 'Phường'),
('26224', '75', 'Phường An Hòa', 'Phường'),
('26227', '75', 'Phường Long Bình', 'Phường'),
('26230', '75', 'Phường Long Bình Tân', 'Phường'),
('26233', '75', 'Phường Tân Mai', 'Phường'),
('26236', '75', 'Phường Tân Vạn', 'Phường'),
('26239', '75', 'Phường Tam Phước', 'Phường'),
('26242', '75', 'Phường Phước Tân', 'Phường'),
('26245', '75', 'Xã Long Hưng', 'Xã'),
('26344', '75', 'Thị trấn Trảng Bom', 'Thị trấn'),
('26347', '75', 'Xã Hố Nai 3', 'Xã'),
('26350', '75', 'Xã Bắc Sơn', 'Xã'),
('26371', '75', 'Xã Hưng Thịnh', 'Xã'),
('26410', '75', 'Thị trấn Long Thành', 'Thị trấn'),
('26437', '75', 'Xã Long Phước', 'Xã')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    province_code = EXCLUDED.province_code,
    updated_at = TIMEZONE('utc'::text, NOW());

-- B. Thành phố Hồ Chí Minh (79)
INSERT INTO public.administrative_wards (code, province_code, name, type) VALUES
('26734', '79', 'Phường Bến Nghé', 'Phường'),
('26737', '79', 'Phường Bến Thành', 'Phường'),
('26749', '79', 'Phường Đa Kao', 'Phường'),
('26761', '79', 'Phường Tân Định', 'Phường'),
('26830', '79', 'Phường Thảo Điền', 'Phường'),
('26833', '79', 'Phường An Phú', 'Phường'),
('25660', '79', 'Phường Phú Cường', 'Phường'),
('25720', '79', 'Phường Dĩ An', 'Phường'),
('26470', '79', 'Phường 1 (Vũng Tàu)', 'Phường'),
('26680', '79', 'Đặc khu Côn Đảo', 'Đặc khu')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    province_code = EXCLUDED.province_code,
    updated_at = TIMEZONE('utc'::text, NOW());

-- C. Thành phố Hà Nội (01)
INSERT INTO public.administrative_wards (code, province_code, name, type) VALUES
('00001', '01', 'Phường Phúc Xá', 'Phường'),
('00019', '01', 'Phường Giảng Võ', 'Phường'),
('00022', '01', 'Phường Thành Công', 'Phường'),
('00064', '01', 'Phường Tràng Tiền', 'Phường'),
('00070', '01', 'Phường Bạch Đằng', 'Phường'),
('00157', '01', 'Phường Dịch Vọng', 'Phường'),
('00247', '01', 'Phường Mỹ Đình 1', 'Phường'),
('00298', '01', 'Phường Hoàng Liệt', 'Phường')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    province_code = EXCLUDED.province_code,
    updated_at = TIMEZONE('utc'::text, NOW());

-- D. Các đơn vị đặc khu hải đảo & đô thị tiêu biểu khác
INSERT INTO public.administrative_wards (code, province_code, name, type) VALUES
('07033', '22', 'Đặc khu Vân Đồn', 'Đặc khu'),
('07060', '22', 'Đặc khu Cô Tô', 'Đặc khu'),
('11800', '31', 'Đặc khu Bạch Long Vĩ', 'Đặc khu'),
('19900', '46', 'Phường Phú Hội', 'Phường'),
('20194', '48', 'Phường Hải Châu 1', 'Phường'),
('20499', '48', 'Đặc khu Hoàng Sa', 'Đặc khu'),
('20980', '51', 'Đặc khu Lý Sơn', 'Đặc khu'),
('22300', '56', 'Phường Lộc Thọ', 'Phường'),
('22420', '56', 'Đặc khu Trường Sa', 'Đặc khu'),
('23130', '68', 'Đặc khu Phú Quý', 'Đặc khu'),
('30800', '89', 'Đặc khu Phú Quốc', 'Đặc khu'),
('31100', '92', 'Phường Tân An', 'Phường'),
('32200', '96', 'Phường 1 (Cà Mau)', 'Phường')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    province_code = EXCLUDED.province_code,
    updated_at = TIMEZONE('utc'::text, NOW());

-- Bật bảo mật Row Level Security (RLS)
ALTER TABLE public.administrative_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrative_wards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc công khai danh mục tỉnh 2026"
    ON public.administrative_provinces FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Cho phép đọc công khai danh mục xã 2026"
    ON public.administrative_wards FOR SELECT
    USING (is_active = TRUE);
