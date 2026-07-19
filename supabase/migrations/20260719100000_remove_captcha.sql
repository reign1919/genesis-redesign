-- Registration is protected by per-WhatsApp and per-IP rate limits. The
-- external CAPTCHA integration and its one-time token storage are no longer used.

drop function if exists public.create_public_registration(text, text, text, text);

create or replace function public.create_public_registration(
  p_school_name text,
  p_teacher_whatsapp text
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  existing_status text;
begin
  select status into existing_status
  from public.registrations
  where teacher_whatsapp = p_teacher_whatsapp;
  if existing_status is not null then return 'duplicate_' || existing_status; end if;

  begin
    insert into public.registrations (school_name, teacher_whatsapp)
    values (p_school_name, p_teacher_whatsapp);
    return 'created';
  exception when unique_violation then
    select status into existing_status
    from public.registrations
    where teacher_whatsapp = p_teacher_whatsapp;
    return 'duplicate_' || coalesce(existing_status, 'pending');
  end;
end
$function$;

revoke all on function public.create_public_registration(text, text) from public, anon, authenticated;
grant execute on function public.create_public_registration(text, text) to service_role;

drop table if exists public.captcha_redemptions;
