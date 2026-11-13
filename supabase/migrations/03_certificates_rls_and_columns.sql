-- ============================================================================
-- 03_certificates_rls_and_columns.sql
-- NÂNG CẤP BẢNG CERTIFICATES VÀ CHÍNH SÁCH BẢO MẬT RLS (ROW LEVEL SECURITY)
-- Chuẩn hóa các trường: certificate_id, certificate_code, student_id, user_id, 
-- event_id, certificate_name, issued_at, status, verification_code, pdf_url
-- ============================================================================

-- 1. Bổ sung các cột chuẩn hóa nếu chưa có trong bảng certificates
DO $$
BEGIN
    -- certificate_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'certificates' AND column_name = 'certificate_id') THEN
        ALTER TABLE public.certificates ADD COLUMN certificate_id VARCHAR(50);
        UPDATE public.certificates SET certificate_id = id WHERE certificate_id IS NULL;
    END IF;

    -- certificate_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'certificates' AND column_name = 'certificate_code') THEN
        ALTER TABLE public.certificates ADD COLUMN certificate_code VARCHAR(50);
        UPDATE public.certificates SET certificate_code = id WHERE certificate_code IS NULL;
    END IF;

    -- user_id (liên kết auth.users / public.users)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'certificates' AND column_name = 'user_id') THEN
        ALTER TABLE public.certificates ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
        UPDATE public.certificates SET user_id = student_id WHERE user_id IS NULL;
    END IF;

    -- certificate_name (tên chứng nhận / tên hoạt động)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'certificates' AND column_name = 'certificate_name') THEN
        ALTER TABLE public.certificates ADD COLUMN certificate_name VARCHAR(255);
        UPDATE public.certificates SET certificate_name = event_title WHERE certificate_name IS NULL;
    END IF;

    -- issued_at (thời gian cấp)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'certificates' AND column_name = 'issued_at') THEN
        ALTER TABLE public.certificates ADD COLUMN issued_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());
        UPDATE public.certificates SET issued_at = created_at WHERE issued_at IS NULL;
    END IF;

    -- status (trạng thái chứng nhận: 'active', 'revoked', 'pending')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'certificates' AND column_name = 'status') THEN
        ALTER TABLE public.certificates ADD COLUMN status VARCHAR(30) DEFAULT 'active' NOT NULL;
        UPDATE public.certificates SET status = CASE WHEN is_revoked = TRUE THEN 'revoked' ELSE 'active' END WHERE status IS NULL;
    END IF;

    -- verification_code (mã tra cứu nhanh)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'certificates' AND column_name = 'verification_code') THEN
        ALTER TABLE public.certificates ADD COLUMN verification_code VARCHAR(50);
        UPDATE public.certificates SET verification_code = id WHERE verification_code IS NULL;
    END IF;
END $$;

-- 2. Đặt chỉ mục hỗ trợ truy vấn tối ưu
CREATE INDEX IF NOT EXISTS idx_certificates_student_user ON public.certificates(student_id, user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_event ON public.certificates(event_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON public.certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);

-- 3. Cập nhật chính sách Row Level Security (RLS) bảo vệ chứng nhận
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Xóa các policy cũ để thay thế bằng phân quyền chi tiết
DROP POLICY IF EXISTS "Public verify certificates" ON public.certificates;
DROP POLICY IF EXISTS "Organizer issue certificates" ON public.certificates;
DROP POLICY IF EXISTS "Students view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Public verify active certificates" ON public.certificates;
DROP POLICY IF EXISTS "Organizer and Admin issue certificates" ON public.certificates;
DROP POLICY IF EXISTS "Organizer and Admin update certificates" ON public.certificates;

-- Policy 1: Sinh viên chỉ được xem chứng nhận của chính mình (qua student_id hoặc user_id)
-- Admin và Ban Tổ Chức được phép xem danh sách chứng nhận theo thẩm quyền
CREATE POLICY "Students view own certificates" ON public.certificates
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid() 
        OR user_id = auth.uid() 
        OR public.current_user_role() IN ('admin', 'organizer')
    );

-- Policy 2: Cổng tra cứu công khai (Người ngoài / Nhà tuyển dụng chỉ xem chứng nhận có hiệu lực khi tra cứu theo mã)
CREATE POLICY "Public verify active certificates" ON public.certificates
    FOR SELECT TO anon
    USING (
        (status = 'active' AND is_revoked = FALSE)
    );

-- Policy 3: Ban Tổ Chức & Admin có quyền tạo / cấp chứng nhận (ngăn người dùng thường tự cấp)
CREATE POLICY "Organizer and Admin issue certificates" ON public.certificates
    FOR INSERT TO authenticated
    WITH CHECK (
        public.current_user_role() IN ('admin', 'organizer')
    );

-- Policy 4: Ban Tổ Chức & Admin có quyền thu hồi hoặc cập nhật chứng nhận
CREATE POLICY "Organizer and Admin update certificates" ON public.certificates
    FOR UPDATE TO authenticated
    USING (
        public.current_user_role() IN ('admin', 'organizer')
    )
    WITH CHECK (
        public.current_user_role() IN ('admin', 'organizer')
    );
