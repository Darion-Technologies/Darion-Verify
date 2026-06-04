# Darion Verify

Darion Verify is a simple employee ID verification system for Darion Technologies. HR/Admin users can create employees, generate employee IDs and secure verification tokens, upload photos, preview ID cards with QR codes, and review verification scan logs. Public verification pages are token-based and do not require login.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style local UI components
- Supabase PostgreSQL
- Supabase Storage for employee photos
- Supabase Auth email/password for admin login
- `qrcode` for QR generation

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and run the SQL in `supabase/schema.sql`.

3. Create an admin user in Supabase Auth.

4. Copy `.env.example` to `.env.local` and fill in the values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_EMPLOYEE_PHOTOS_BUCKET=employee-photos
ADMIN_ACCESS_KEY=change-this-long-random-admin-gate-key
COMPLETE_VERIFICATION_CODE=change-this-internal-complete-verification-code
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000/admin/login`.

`NEXT_PUBLIC_APP_URL` is only used as a fallback. ID card QR codes derive the deployed domain from the incoming request, so they should use your production host automatically after deployment.

## Admin Gate

Set `ADMIN_ACCESS_KEY` in production to hide every `/admin/*` route from public visitors. Without the key, admin routes show the locked access page before any login form is shown.

Admin access flow:

```text
https://your-domain.com/admin/login?access_key=YOUR_ADMIN_ACCESS_KEY
```

The app stores a secure HTTP-only gate cookie for 8 hours and redirects to the clean `/admin/login` URL. Admin sign-in is still required after this gate.

## Main Routes

- `/admin/login`
- `/admin/employees`
- `/admin/employees/new`
- `/admin/employees/[id]`
- `/admin/employees/[id]/id-card`
- `/verify/[token]`

## API Routes

- `POST /api/employees`
- `GET /api/employees`
- `GET /api/employees/[id]`
- `PATCH /api/employees/[id]`
- `DELETE /api/employees/[id]`
- `GET /api/verify/[token]`
- `POST /api/verification-logs`
- `POST /api/employees/[id]/regenerate-token`

## Verification Rules

- `Active`, `Intern`, `Probation`: Verified Employee
- `Exited`: No longer active
- `Suspended`: Verification restricted
- `Under Review`: Verification under review
- `Expired ID`: ID expired
- Invalid token: Invalid verification link

The public verification response intentionally includes only safe employee fields: company name in UI, verification title, employee photo, full name, employee ID, role, department, employment type, joining date, status, and result.

Complete Verification on the public verification page requires `COMPLETE_VERIFICATION_CODE`. A valid code reveals only non-sensitive employee details and recent QR verification scan history on the same page. It does not return verification tokens or sensitive personal, identity, bank, contact, salary, address, emergency contact, or document data.

## ID Cards

ID cards include the Darion Technologies logo placeholder, employee photo, full name, role, department, employee ID, QR code, “Scan to verify”, and `© 2026 Darion Technologies.`

The card page supports PNG download and browser print/save-as-PDF.

## Checks

```bash
npm run typecheck
npm run build
```
