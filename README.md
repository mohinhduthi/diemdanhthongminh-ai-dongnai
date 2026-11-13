# AI SMARTATTEND ĐỒNG NAI — HỆ THỐNG VẬN HÀNH THỰC TẾ

> **Khẩu hiệu hành động:** *"Điểm danh và cấp chứng nhận điện tử bằng AI"*  
> **Đơn vị quản lý:** Tỉnh Đoàn – Hội Sinh viên Tỉnh Đồng Nai  
> **Quy mô triển khai:** 11 trường Đại học, Cao đẳng trên địa bàn Tỉnh Đồng Nai

---

## 1. Giới thiệu tổng quan

Hệ thống **AI SMARTATTEND ĐỒNG NAI** được thiết kế phục vụ quản lý hoạt động Đoàn – Hội sinh viên, tích hợp các công nghệ tiên tiến:
1. **Điểm danh QR Động (Dynamic QR):** Tự động xoay mã và thay đổi HMAC token sau mỗi 20 giây, ngăn chặn triệt để hành vi chụp ảnh màn hình gửi điểm danh hộ.
2. **Camera trực tiếp & Cảm biến vị trí GPS thực tế:** Hỗ trợ sinh viên quét trực tiếp qua camera điện thoại/laptop và tính toán khoảng cách so với tọa độ hội trường (Haversine formula).
3. **AI Fraud Guard:** Đánh giá rủi ro đa chiều dựa trên căn cứ khoa học (trùng mã phần cứng thiết bị, lệch bán kính GPS, thời lượng tham dự quá ngắn, vắng mặt).
4. **Cơ chế Thẩm định & Nhân văn:** AI chỉ đóng vai trò phân tích và đề xuất; Ban Tổ Chức giữ quyền quyết định cuối cùng trong việc phê duyệt giải trình/khiếu nại.
5. **Chứng nhận Điện tử Chính quy:** Tự động phát hành chứng nhận có mã định danh duy nhất (`CERT-DN-2026-XXXX`) kèm mã băm SHA-256 xác thực và mã QR tra cứu công khai cho Nhà tuyển dụng/Bên thứ ba.
6. **Backend Gateway & Supabase PostgreSQL:** Cơ sở dữ liệu quan hệ với đầy đủ 12 bảng chuẩn hóa và chính sách Row Level Security (RLS) bảo mật tuyệt đối.

---

## 2. Danh mục 11 Trường Đại học / Cao đẳng Tích hợp sẵn

1. **Trường Đại học Lạc Hồng** (`LHU`)
2. **Trường Đại học Đồng Nai** (`DNU`)
3. **Trường Đại học Công nghệ Đồng Nai** (`DNTU`)
4. **Trường Đại học Công nghệ Miền Đông (MIT Uni)** (`AU`)
5. **Trường Đại học Lâm nghiệp - Phân hiệu Đồng Nai** (`LMU`)
6. **Trường Cao đẳng Kỹ thuật Công nghệ Đồng Nai** (`BKDN`)
7. **Trường Cao đẳng Công nghệ Y - Dược Đồng Nai** (`MDIT`)
8. **Trường Cao đẳng Mỹ thuật Trang trí Đồng Nai** (`CDMY`)
9. **Trường Cao đẳng Văn hóa Nghệ thuật Đồng Nai** (`CDVH`)
10. **Trường Cao đẳng Công nghệ Quốc tế Lilama 2** (`LILAMA2`)
11. **Trường Cao đẳng Công nghệ và Quản trị Sonadezi** (`SONADEZI`)

---

## 3. Hướng dẫn Khởi chạy và Vận hành

### Cách 1: Chạy nhanh bằng File Batch (Khuyên dùng trên Windows)
- Nhấp đúp chuột vào file: `Mo_Ung_Dung.bat`
- Hệ thống sẽ tự động khởi động Gateway API backend và mở giao diện ứng dụng.

### Cách 2: Chạy thủ công qua dòng lệnh
1. **Khởi chạy Backend REST Gateway (Cổng 3001):**
```bash
cd backend
node server.js
```
2. **Mở giao diện Web (Frontend):**
- Mở trực tiếp file `index.html` trên trình duyệt Chrome, Edge, Safari hoặc dùng Python server:
```bash
python -m http.server 8080
```
- Truy cập: `http://localhost:8080`

---

## 4. Danh sách Biến Môi trường (Backend & Supabase)

Tạo file `backend/.env` từ file mẫu `backend/.env.example`:

| Biến môi trường | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| `PORT` | Cổng HTTP Gateway chạy backend | `3001` |
| `JWT_SECRET` | Khóa bí mật ký mã Dynamic QR & Token xác thực | `dongnai_smartattend_2026_secret` |
| `SUPABASE_URL` | Địa chỉ URL project Supabase | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Public Anon Key của Supabase | `eyJhbGciOiJIUzI1NiIsIn...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (chỉ dùng ở backend an toàn) | `eyJhbGciOiJIUzI1NiIsIn...` |
| `GEMINI_API_KEY` | Khóa Google Gemini AI hỗ trợ phân tích khiếu nại | `AIzaSy...` (tùy chọn) |

---

## 5. Hướng dẫn Tạo và Cấu hình Supabase PostgreSQL

1. Đăng nhập [Supabase](https://supabase.com) và tạo một **New Project** mới (ví dụ đặt tên: `smartattend-dongnai`).
2. Vào mục **SQL Editor** trong thanh menu bên trái.
3. Mở file `supabase/migrations/01_initial_schema.sql` trong mã nguồn dự án, copy toàn bộ nội dung và dán vào SQL Editor.
4. Nhấn **Run** để tự động khởi tạo:
   - 12 bảng: `universities`, `organizations`, `users`, `student_profiles`, `events`, `event_registrations`, `attendance_sessions`, `attendance_records`, `ai_risk_assessments`, `appeals`, `certificates`, `audit_logs`.
   - Các ràng buộc khóa ngoại và Row Level Security (RLS) bảo vệ từng vai trò (`Student`, `Organizer`, `Admin`).
   - Nạp sẵn danh mục 11 trường Đại học/Cao đẳng Đồng Nai.
5. Lấy **Project URL** và **anon public key** từ mục `Project Settings -> API` và dán vào menu cấu hình của ứng dụng hoặc file `backend/.env`.

---

## 6. Hướng dẫn Kết nối GitHub Pages

Giao diện frontend của AI SMARTATTEND ĐỒNG NAI được tối ưu 100% Client-Side Pure HTML/CSS/JavaScript (sử dụng Tailwind CDN, Lucide, QRCode, jsQR, Chart.js) nên **hoàn toàn tương thích và chạy mượt mà trên GitHub Pages**:
1. Đẩy mã nguồn dự án lên repository GitHub của bạn:
   ```bash
   git add .
   git commit -m "feat: Upgrade SmartAttend Dong Nai to production system"
   git push origin main
   ```
2. Vào **Settings** của repository trên GitHub -> Chọn tab **Pages** ở cột trái.
3. Tại mục **Build and deployment -> Source**, chọn nhánh `main` (hoặc `master`) và thư mục `/(root)`.
4. Nhấn **Save**. Sau 1-2 phút, GitHub Pages sẽ kích hoạt đường dẫn chính thức dạng:
   `https://mohinhduthi.github.io/diemdanh-ai-dongnai/`

---

## 7. Tài khoản Thử nghiệm An toàn (Khởi tạo sẵn)

| Vai trò | Tên đăng nhập | Mật khẩu mặc định | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin123` | Quản lý toàn bộ 11 trường, phê duyệt tài khoản BTC, theo dõi 7 KPI và nhật ký bảo mật |
| **Ban Tổ Chức** | `btc` | `btc123` | Quản lý sự kiện, chiếu màn hình QR xoay 20s, xử lý khiếu nại, cấp chứng nhận |
| **Sinh viên** | Đăng ký trực tiếp tại tab "Đăng ký" | Mật khẩu tự chọn | Trải nghiệm quét QR camera, đối chiếu GPS, theo dõi kết quả và nhận chứng nhận |
