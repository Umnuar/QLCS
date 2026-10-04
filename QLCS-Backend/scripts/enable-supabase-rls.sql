-- ==============================================================================
-- QLCS v3.0.0 — KỊCH BẢN KHÓA CỔNG POSTGREST & BẬT ROW LEVEL SECURITY (SEC-04-01)
-- Cơ quan: UBND Xã Đăk Hà
-- Mục đích: Khóa cổng truy cập công khai PostgREST của Supabase qua Anon Key,
--           buộc mọi truy vấn phải đi qua máy chủ Backend bảo mật (role: postgres).
-- Cách dùng: Copy toàn bộ nội dung tệp này vào Supabase Cloud Dashboard -> SQL Editor
--            và bấm "RUN".
-- ==============================================================================

-- 1. Kích hoạt Row Level Security (RLS) trên toàn bộ 9 bảng dữ liệu
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.htxh_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profile_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stats_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- 2. Buộc áp dụng RLS cho cả table owners (nếu có role phụ)
ALTER TABLE IF EXISTS public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.htxh_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users FORCE ROW LEVEL SECURITY;

-- 3. Thu hồi toàn bộ quyền truy cập công khai của role 'anon' và 'authenticated'
--    (Chặn đứng việc khai thác PostgREST API từ bên ngoài qua Anon Public Key)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- 4. Cấp đặc quyền toàn phần cho role 'postgres' (Prisma kết nối qua connection string này)
--    và 'service_role' (quản trị viên nội bộ)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

-- 5. Thông báo hoàn tất
DO $$
BEGIN
    RAISE NOTICE '✅ ĐÃ KÍCH HOẠT THÀNH CÔNG ROW LEVEL SECURITY (RLS) TRÊN TOÀN BỘ CSDL QLCS!';
    RAISE NOTICE '🛡️ Cổng PostgREST công khai qua Anon Key đã bị vô hiệu hóa an toàn 100%%.';
END $$;
