-- ============================================================================
-- AI SMARTATTEND ĐỒNG NAI - PRODUCTION POSTGRESQL SCHEMA (SUPABASE)
-- Hệ thống Điểm danh Thông minh & Cấp Chứng nhận Số hóa
-- ============================================================================

-- Bật các tiện ích mở rộng cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BẢNG universities (11 Trường Đại học / Cao đẳng Đồng Nai + mở rộng)
CREATE TABLE IF NOT EXISTS public.universities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    group_type VARCHAR(50) NOT NULL DEFAULT 'Đại học', -- 'Đại học', 'Cao đẳng', 'Trường khác'
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. BẢNG organizations (Đơn vị tổ chức Đoàn - Hội, Khoa, CLB)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    university_id VARCHAR(50) REFERENCES public.universities(id) ON DELETE SET NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. BẢNG users (Tài khoản người dùng liên kết với Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'organizer', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'locked')),
    phone VARCHAR(50),
    avatar_url TEXT,
    university_id VARCHAR(50) REFERENCES public.universities(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    province_code VARCHAR(10),
    province_name VARCHAR(100),
    ward_code VARCHAR(10),
    ward_name VARCHAR(100),
    detailed_address TEXT,
    legacy_address TEXT,
    trusted_device_id VARCHAR(100),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. BẢNG student_profiles (Thông tin chi tiết hồ sơ Sinh viên)
CREATE TABLE IF NOT EXISTS public.student_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    mssv VARCHAR(50) UNIQUE NOT NULL,
    university_id VARCHAR(50) NOT NULL REFERENCES public.universities(id) ON DELETE RESTRICT,
    faculty VARCHAR(255) NOT NULL,
    major VARCHAR(255) NOT NULL,
    academic_year VARCHAR(50),
    province_code VARCHAR(10),
    province_name VARCHAR(100),
    ward_code VARCHAR(10),
    ward_name VARCHAR(100),
    detailed_address TEXT,
    legacy_address TEXT,
    face_enrolled BOOLEAN DEFAULT FALSE NOT NULL,
    face_enrolled_at TIMESTAMPTZ,
    face_embedding_hash VARCHAR(255), -- Hash an toàn của khuôn mặt (không lưu ảnh raw tùy tiện)
    total_activities_attended INT DEFAULT 0 NOT NULL,
    total_certificates_received INT DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. BẢNG events (Hoạt động / Sự kiện Đoàn - Hội)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Học thuật & Công nghệ',
    organizer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    organizer_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    gps_lat DOUBLE PRECISION,
    gps_lng DOUBLE PRECISION,
    gps_radius_meters INT DEFAULT 300 NOT NULL,
    capacity INT DEFAULT 200 NOT NULL,
    min_duration_minutes INT DEFAULT 60 NOT NULL,
    requires_checkout BOOLEAN DEFAULT TRUE NOT NULL,
    allow_manual_override BOOLEAN DEFAULT TRUE NOT NULL,
    description TEXT,
    banner_url TEXT,
    status VARCHAR(20) DEFAULT 'upcoming' NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. BẢNG event_registrations (Đăng ký tham gia hoạt động)
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status VARCHAR(30) DEFAULT 'registered' NOT NULL CHECK (status IN ('registered', 'attended', 'ai_review', 'eligible', 'certified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_event_student UNIQUE (event_id, student_id)
);

-- 7. BẢNG attendance_sessions (Phiên điểm danh phát QR động có thời hạn)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('checkin', 'checkout')),
    current_token VARCHAR(255) NOT NULL,
    token_seed VARCHAR(100) NOT NULL,
    rotate_interval_seconds INT DEFAULT 20 NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. BẢNG attendance_records (Bản ghi điểm danh thực tế kèm dữ liệu cảm biến)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE SET NULL,
    
    check_in_at TIMESTAMPTZ,
    check_out_at TIMESTAMPTZ,
    duration_minutes INT DEFAULT 0,
    
    check_in_method VARCHAR(30) DEFAULT 'qr_camera' CHECK (check_in_method IN ('qr_camera', 'manual_organizer', 'appeal_approved')),
    check_out_method VARCHAR(30) DEFAULT 'qr_camera' CHECK (check_out_method IN ('qr_camera', 'manual_organizer', 'appeal_approved')),
    
    device_id VARCHAR(100) NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(50),
    
    gps_lat DOUBLE PRECISION,
    gps_lng DOUBLE PRECISION,
    distance_meters INT,
    
    face_verified BOOLEAN DEFAULT FALSE NOT NULL,
    face_confidence NUMERIC(5,2),
    qr_valid BOOLEAN DEFAULT TRUE NOT NULL,
    
    is_anomaly BOOLEAN DEFAULT FALSE NOT NULL,
    ai_risk_level VARCHAR(20) DEFAULT 'LOW' CHECK (ai_risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    status VARCHAR(30) DEFAULT 'valid' CHECK (status IN ('valid', 'ai_review', 'verified_manual', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_event_student_attendance UNIQUE (event_id, student_id)
);

-- 9. BẢNG ai_risk_assessments (Đánh giá rủi ro và giải trình từ AI)
CREATE TABLE IF NOT EXISTS public.ai_risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_record_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    risk_flags JSONB DEFAULT '[]'::jsonb NOT NULL,
    recommendation TEXT NOT NULL,
    model_version VARCHAR(50) DEFAULT 'SmartAttend-AI-v2.0',
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
    review_note TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. BẢNG appeals (Khiếu nại / Giải trình của Sinh viên)
CREATE TABLE IF NOT EXISTS public.appeals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    attendance_record_id UUID REFERENCES public.attendance_records(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    ai_pre_analysis TEXT,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    resolution_note TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. BẢNG certificates (Chứng nhận điện tử chính quy có hash xác thực)
CREATE TABLE IF NOT EXISTS public.certificates (
    id VARCHAR(50) PRIMARY KEY, -- CERT-DN-2026-XXXX
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    student_name VARCHAR(255) NOT NULL,
    mssv VARCHAR(50) NOT NULL,
    university_id VARCHAR(50) NOT NULL REFERENCES public.universities(id) ON DELETE RESTRICT,
    event_title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    organizer_name VARCHAR(255) NOT NULL,
    signer_name VARCHAR(255) NOT NULL DEFAULT 'Bùi Quốc Tuấn - Phó Bí thư Tỉnh Đoàn Đồng Nai',
    issued_date DATE DEFAULT CURRENT_DATE NOT NULL,
    digital_hash VARCHAR(255) NOT NULL,
    verification_url TEXT NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE NOT NULL,
    revoked_reason TEXT,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. BẢNG audit_logs (Nhật ký kiểm toán an ninh và truy vết hành động)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(100) NOT NULL,
    detail TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Hàm trợ giúp lấy Role của user hiện tại
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. universities: Công khai đọc cho tất cả
CREATE POLICY "Public read universities" ON public.universities FOR SELECT USING (true);
CREATE POLICY "Admin manage universities" ON public.universities FOR ALL USING (public.current_user_role() = 'admin');

-- 2. organizations: Công khai đọc
CREATE POLICY "Public read organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Admin manage organizations" ON public.organizations FOR ALL USING (public.current_user_role() = 'admin');

-- 3. users: Sinh viên xem thông tin mình, Admin & Organizer xem danh sách
CREATE POLICY "Users read own profile" ON public.users FOR SELECT USING (
    id = auth.uid() OR public.current_user_role() IN ('admin', 'organizer')
);
CREATE POLICY "Users update own profile" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin manage users" ON public.users FOR ALL USING (public.current_user_role() = 'admin');

-- 4. student_profiles
CREATE POLICY "Student read own profile" ON public.student_profiles FOR SELECT USING (
    user_id = auth.uid() OR public.current_user_role() IN ('admin', 'organizer')
);
CREATE POLICY "Student update own profile" ON public.student_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin manage student profiles" ON public.student_profiles FOR ALL USING (public.current_user_role() = 'admin');

-- 5. events: Công khai đọc cho mọi người dùng đã đăng nhập (hoặc khách xem lịch)
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Organizer and Admin manage events" ON public.events FOR ALL USING (
    public.current_user_role() IN ('admin', 'organizer')
);

-- 6. event_registrations: Sinh viên xem/tạo đăng ký của mình, Organizer/Admin quản lý
CREATE POLICY "Student read own registrations" ON public.event_registrations FOR SELECT USING (
    student_id = auth.uid() OR public.current_user_role() IN ('admin', 'organizer')
);
CREATE POLICY "Student create registrations" ON public.event_registrations FOR INSERT WITH CHECK (
    student_id = auth.uid()
);
CREATE POLICY "Organizer manage registrations" ON public.event_registrations FOR ALL USING (
    public.current_user_role() IN ('admin', 'organizer')
);

-- 7. attendance_sessions: Đọc được khi xác thực, Organizer/Admin tạo phiên
CREATE POLICY "Public read active sessions" ON public.attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Organizer manage sessions" ON public.attendance_sessions FOR ALL USING (
    public.current_user_role() IN ('admin', 'organizer')
);

-- 8. attendance_records: Sinh viên xem bản ghi của mình, chỉ insert qua backend hoặc chính chủ có phiên hợp lệ
CREATE POLICY "Student read own records" ON public.attendance_records FOR SELECT USING (
    student_id = auth.uid() OR public.current_user_role() IN ('admin', 'organizer')
);
CREATE POLICY "Student submit attendance" ON public.attendance_records FOR INSERT WITH CHECK (
    student_id = auth.uid()
);
CREATE POLICY "Organizer manage attendance records" ON public.attendance_records FOR ALL USING (
    public.current_user_role() IN ('admin', 'organizer')
);

-- 9. ai_risk_assessments: Sinh viên xem đánh giá sự kiện của mình, Organizer/Admin xử lý
CREATE POLICY "Student read own risk assessments" ON public.ai_risk_assessments FOR SELECT USING (
    student_id = auth.uid() OR public.current_user_role() IN ('admin', 'organizer')
);
CREATE POLICY "Organizer manage risk assessments" ON public.ai_risk_assessments FOR ALL USING (
    public.current_user_role() IN ('admin', 'organizer')
);

-- 10. appeals: Sinh viên xem/tạo khiếu nại của mình, Organizer/Admin xử lý
CREATE POLICY "Student read own appeals" ON public.appeals FOR SELECT USING (
    student_id = auth.uid() OR public.current_user_role() IN ('admin', 'organizer')
);
CREATE POLICY "Student create appeal" ON public.appeals FOR INSERT WITH CHECK (
    student_id = auth.uid()
);
CREATE POLICY "Organizer resolve appeals" ON public.appeals FOR UPDATE USING (
    public.current_user_role() IN ('admin', 'organizer')
);

-- 11. certificates: Mọi người tra cứu xác thực được (Public Verify), Admin/Organizer cấp
CREATE POLICY "Public verify certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Organizer issue certificates" ON public.certificates FOR ALL USING (
    public.current_user_role() IN ('admin', 'organizer')
);

-- 12. audit_logs: Chỉ Admin xem toàn bộ, ghi nhật ký bằng Security Definer function
CREATE POLICY "Admin read audit logs" ON public.audit_logs FOR SELECT USING (
    public.current_user_role() = 'admin'
);
CREATE POLICY "Insert audit log" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ============================================================================
-- DỮ LIỆU BAN ĐẦU: 11 TRƯỜNG ĐH/CĐ ĐỒNG NAI
-- ============================================================================

INSERT INTO public.universities (id, name, short_name, group_type, address) VALUES
('LHU', 'Trường Đại học Lạc Hồng', 'ĐH Lạc Hồng', 'Đại học', 'Số 10 Huỳnh Văn Nghệ, P. Bửu Long, TP. Biên Hòa, Đồng Nai'),
('DNU', 'Trường Đại học Đồng Nai', 'ĐH Đồng Nai', 'Đại học', 'Số 04 Lê Quý Đôn, P. Tân Hiệp, TP. Biên Hòa, Đồng Nai'),
('DNTU', 'Trường Đại học Công nghệ Đồng Nai', 'ĐH Công nghệ Đồng Nai', 'Đại học', 'Đường Nguyễn Khuyến, KP.5, P. Trảng Dài, TP. Biên Hòa, Đồng Nai'),
('AU', 'Trường Đại học Công nghệ Miền Đông (MIT Uni)', 'ĐH Miền Đông', 'Đại học', 'QL1A, TT. Dầu Giây, Huyện Thống Nhất, Đồng Nai'),
('LMU', 'Trường Đại học Lâm nghiệp - Phân hiệu Đồng Nai', 'ĐH Lâm nghiệp Đồng Nai', 'Đại học', 'TT. Trảng Bom, Huyện Trảng Bom, Đồng Nai'),
('BKDN', 'Trường Cao đẳng Kỹ thuật Công nghệ Đồng Nai', 'CĐ Kỹ thuật CN Đồng Nai', 'Cao đẳng', 'Đường Nguyễn Văn Hoa, P. Thống Nhất, TP. Biên Hòa, Đồng Nai'),
('MDIT', 'Trường Cao đẳng Công nghệ Y - Dược Đồng Nai', 'CĐ Y - Dược Đồng Nai', 'Cao đẳng', 'Số 21, Đ. 30/4, P. Thanh Bình, TP. Biên Hòa, Đồng Nai'),
('CDMY', 'Trường Cao đẳng Mỹ thuật Trang trí Đồng Nai', 'CĐ Mỹ thuật Trang trí', 'Cao đẳng', 'Số 368, Đ. 30/4, P. Quyết Thắng, TP. Biên Hòa, Đồng Nai'),
('CDVH', 'Trường Cao đẳng Văn hóa Nghệ thuật Đồng Nai', 'CĐ VHNT Đồng Nai', 'Cao đẳng', 'P. Tân Hiệp, TP. Biên Hòa, Đồng Nai'),
('LILAMA2', 'Trường Cao đẳng Công nghệ Quốc tế Lilama 2', 'CĐ Quốc tế Lilama 2', 'Cao đẳng', 'Km 32, QL51, Long Phước, Huyện Long Thành, Đồng Nai'),
('SONADEZI', 'Trường Cao đẳng Công nghệ và Quản trị Sonadezi', 'CĐ Sonadezi', 'Cao đẳng', 'Số 01, Đ. 1, KCN Biên Hòa 2, TP. Biên Hòa, Đồng Nai')
ON CONFLICT (id) DO NOTHING;
