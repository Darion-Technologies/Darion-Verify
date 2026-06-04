alter table public.employees
add column if not exists complete_verification_secret text unique;

create table if not exists public.employee_activity_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  created_at timestamp with time zone default now(),
  action text not null,
  details text,
  actor_id uuid
);

create index if not exists employee_activity_logs_employee_id_idx
on public.employee_activity_logs(employee_id);

create index if not exists employee_activity_logs_created_at_idx
on public.employee_activity_logs(created_at desc);

alter table public.employee_activity_logs enable row level security;

drop policy if exists "Authenticated admins can read employee activity logs"
on public.employee_activity_logs;

create policy "Authenticated admins can read employee activity logs"
on public.employee_activity_logs
for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can insert employee activity logs"
on public.employee_activity_logs;

create policy "Authenticated admins can insert employee activity logs"
on public.employee_activity_logs
for insert
to authenticated
with check (true);

notify pgrst, 'reload schema';
