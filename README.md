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
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000/admin/login`.

`NEXT_PUBLIC_APP_URL` is only used as a fallback. ID card QR codes derive the deployed domain from the incoming request, so they should use your production host automatically after deployment.

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

## ID Cards

ID cards include the Darion Technologies logo placeholder, employee photo, full name, role, department, employee ID, QR code, “Scan to verify”, and `© 2026 Darion Technologies.`

The card page supports PNG download and browser print/save-as-PDF.

## Checks

```bash
npm run typecheck
npm run build
```
