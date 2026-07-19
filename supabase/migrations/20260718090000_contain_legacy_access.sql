begin;

-- Deny first. This migration is intentionally separate so it can be deployed
-- before any destructive transformation of exposed legacy data.
do $containment$
begin
  if to_regclass('public.registrations') is not null then
    execute 'alter table public.registrations enable row level security';
    execute 'alter table public.registrations force row level security';
    execute 'revoke all privileges on table public.registrations from public, anon, authenticated';
  end if;

  if to_regclass('public.profiles') is not null then
    execute 'alter table public.profiles enable row level security';
    execute 'alter table public.profiles force row level security';
    execute 'revoke all privileges on table public.profiles from public, anon, authenticated';
  end if;
end
$containment$;

commit;
