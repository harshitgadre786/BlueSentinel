# BlueSentinel Security Architecture & Access Isolation Audit

This document details the security posture, access isolation model, and verification protocols for **BlueSentinel**.

---

## 🛡️ 1. Row Level Security (RLS) Matrix

Every database table in BlueSentinel has Row Level Security explicitly enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`). Private data is strictly scoped to the authenticated operator (`auth.uid() = user_id`).

| Table | Sensitivity | Allowed Roles | Select Policy | Insert Policy | Update Policy | Delete Policy |
|---|---|---|---|---|---|---|
| `profiles` | Private | `authenticated` | `auth.uid() = id` | `auth.uid() = id` | `auth.uid() = id` | `auth.uid() = id` |
| `port_rules` | Reference | `anon`, `authenticated` | `true` (Read-only) | `service_role` only | `service_role` only | `service_role` only |
| `vessels` | Reference | `anon`, `authenticated` | `true` (Read-only) | `service_role` only | `service_role` only | `service_role` only |
| `voyages` | Private | `authenticated` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `recommendations` | Private | `authenticated` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `uploaded_documents`| Private | `authenticated` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `document_chunks` | Private | `authenticated` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `reports` | Private | `authenticated` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |

> **Strict Anonymous Denial**: Anonymous callers attempting to select, insert, update, or delete rows in `voyages`, `recommendations`, `uploaded_documents`, `document_chunks`, or `reports` receive `HTTP 401 / 403` or an empty dataset from Supabase PostgREST.

---

## 🗄️ 2. Supabase Storage User-Folder Isolation

All uploaded charterparties, vessel specifications, and port notices are stored in a private bucket named `documents` (`public = false`).

### Storage Isolation Rules:
1. **Object Path Convention**: Every file must be uploaded under the path prefix:
   ```
   documents/{auth.uid()}/{timestamp}_{filename}
   ```
2. **Storage Policies**:
   - `SELECT`: `bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text`
   - `INSERT`: `bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text`
   - `UPDATE`: `bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text`
   - `DELETE`: `bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text`

**Cross-Tenant Isolation Guarantee**: Even if User A knows the filename or exact URL of User B's file, User A cannot read, download, overwrite, or delete it because the storage folder check `(storage.foldername(name))[1] = auth.uid()::text` will fail.

---

## 🔑 3. Credential Protection & Zero-Leak Policy

1. **Client Bundle Safety**:
   - Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are exposed to the browser.
   - `SUPABASE_SERVICE_ROLE_KEY` is **NEVER** imported in `"use client"` components and is completely omitted from browser bundles.
2. **Protected API Routes (`/api/seed`)**:
   - Anonymous requests to `/api/seed` in production are strictly rejected with `HTTP 401 Unauthorized`.
   - Seeding or altering database tables requires an administrative bearer token or `x-admin-key` header.
3. **Demo Mode Isolation**:
   - Offline demo mode operates entirely within the user's browser sandbox and local storage, preventing any unauthorized write access to production database tables.

---

## 📋 4. Step-by-Step Manual Verification Checklist

Run these manual or automated curl checks to verify access isolation in production or staging:

### Test 1: Verify Anonymous Rejection on Private Tables
```bash
# Attempt to read voyages anonymously using public anon key
curl -X GET "https://<YOUR_SUPABASE_PROJECT>.supabase.co/rest/v1/voyages?select=*" \
  -H "apikey: <NEXT_PUBLIC_SUPABASE_ANON_KEY>"
# Expected: [] (Empty array — zero rows returned due to RLS)
```

### Test 2: Verify Cross-User Isolation
1. Log in as **User A** via `/login` and create a voyage in `/workspace/voyage-planner`.
2. Inspect the database: The new row in `voyages` has `user_id = <USER_A_UUID>`.
3. Log out and log in as **User B**.
4. Navigate to `/workspace` and check recent activity:
   - User B sees **0** voyages from User A.
   - User B's audit log only displays User B's own voyages.

### Test 3: Verify Storage Folder Traversal Prevention
1. As **User A**, upload `vessel_spec.pdf` in `/workspace/blueai`.
   - The file is saved at `documents/<USER_A_UUID>/..._vessel_spec.pdf`.
2. As **User B**, attempt to download User A's file:
```bash
curl -X GET "https://<YOUR_SUPABASE_PROJECT>.supabase.co/storage/v1/object/authenticated/documents/<USER_A_UUID>/..._vessel_spec.pdf" \
  -H "Authorization: Bearer <USER_B_JWT_TOKEN>"
# Expected: 403 Forbidden or 404 Not Found (Denied by storage RLS)
```

### Test 4: Verify Protection on `/api/seed`
```bash
# Attempt unauthenticated access to /api/seed
curl -i -X GET "http://localhost:3000/api/seed"
# Expected response when Supabase is configured:
# HTTP/1.1 401 Unauthorized
# {"error":"Unauthorized","message":"Anonymous access to database seeding is strictly prohibited. Production database mutations require admin authorization."}
```

### Test 5: Automated Static Security Suite
Run the built-in automated security audit:
```bash
npm run test:security
```
Expected output:
```
Audit Summary: 81 passed, 0 failed.
All access isolation and security checks PASSED cleanly.
```
