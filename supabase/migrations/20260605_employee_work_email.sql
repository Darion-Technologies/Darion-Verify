alter table public.employees
add column if not exists work_email text;

create unique index if not exists employees_work_email_unique_idx
on public.employees(lower(work_email))
where work_email is not null and work_email <> '';

notify pgrst, 'reload schema';
