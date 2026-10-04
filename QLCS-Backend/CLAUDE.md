# QLCS-Backend - Project Rules

## Commands
- `npm run dev` — Chạy server phát triển (Port 5000)
- `npm run build` — Biên dịch TypeScript sang `dist/`
- `npm run seed` — Tạo tài khoản Admin và các Trưởng thôn
- `npx prisma studio` — Mở giao diện quản trị CSDL Supabase

## Architecture
- Node.js + Express + Prisma + PostgreSQL (Supabase)
- Domain production: https://dulieudakha.com/api
- Socket.io for real-time events
- Đóng vai trò **Auth & Identity Provider trung tâm** cho Hệ sinh thái Đăk Hà (cung cấp SSO cho `QLNN` qua `GET /api/auth/me`).

## Security Rules (CRITICAL)
1. **CCCD Encryption**: Field `cccd` is AES-256-GCM encrypted via Prisma Client Extension in `src/config/prisma.ts`. 
   - `cccd_hash` (SHA-256) is used for exact match search
   - `cccd_last4` stores last 4 digits for partial display
   - NEVER search by encrypted `cccd` directly — always use `cccd_hash`
2. **No Fallback Keys**: `ENCRYPTION_KEY`, `JWT_SECRET`, `JWT_REFRESH_SECRET` MUST be set in .env. Server throws on startup if missing.
3. **Village Scope**: `authorizeVillageScope` middleware auto-filters data by `req.user.village_id`. Admin (village_id=null) sees all.
4. **Client MUST NOT send village_id**: Backend parses it from JWT token. Never trust client-submitted village_id.

## RBAC & Accounts
- `admin`: Full access, village_id = null (Tài khoản mẫu: `admin` / `admin123456`)
- `user` (Trưởng thôn): Scoped to their village_id (Tài khoản mẫu: `thon1` / `qlcs2025`, `thon2` / `qlcs2025`)

## API Conventions  
- All responses: `{ data: ... }` or `{ error: '...' }`
- Mandatory Health Check: `GET /api/health`
- Auth errors: Generic "Sai thông tin đăng nhập" (no username/password leak)
- Soft delete: `is_deleted: true, deleted_at: timestamp`
- Optimistic locking: `version` field, 409 on conflict

## Database
- 9 tables: users, refresh_tokens, villages, profiles, htxh_profiles, audit_logs, profile_audit_log, settings, stats_cache
- pg_trgm + GIN index on name_unaccented for Vietnamese fuzzy search
- Cursor-based pagination for profiles/htxh
