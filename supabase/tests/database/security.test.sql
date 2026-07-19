begin;

create extension if not exists pgtap with schema extensions;
select plan(42);

select has_table('public', 'registrations', 'active registrations table exists');
select has_table('public', 'school_credentials', 'final credentials table exists');
select has_table('public', 'school_credential_provisioning', 'approval staging table exists');
select hasnt_column('public', 'registrations', 'password', 'registrations contain no plaintext password');
select hasnt_column('public', 'school_credentials', 'password', 'credentials contain no plaintext password column');
select col_is_unique('public', 'registrations', 'teacher_whatsapp', 'WhatsApp identifies duplicate enrollment');
select col_is_unique('public', 'registrations', 'school_code', 'school codes are unique');
select hasnt_table('public', 'captcha_redemptions', 'obsolete CAPTCHA storage is removed');
select hasnt_function('public', 'handle_new_user', 'legacy duplicate Auth profile trigger function is removed');

insert into auth.users (
  instance_id, id, aud, role, email, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@example.test', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'gen-0001@schools.genesis.invalid', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'unrelated@example.test', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

update public.profiles set is_admin = true
where id = '10000000-0000-0000-0000-000000000001';

select is(
  public.create_public_registration('School A', '+919876543210'),
  'created',
  'public registration creates a pending row'
);
select is(
  public.create_public_registration('School A Again', '+919876543210'),
  'duplicate_pending',
  'repeat WhatsApp reports the pending state'
);
select is(
  public.create_public_registration('School B', '+919876543211'),
  'created',
  'a second unique school can register'
);
select is(
  public.create_public_registration('School B Again', '+919876543211'),
  'duplicate_pending',
  'repeat WhatsApp for the second school is detected'
);
select is(
  public.consume_public_registration_attempt(repeat('3', 64), repeat('4', 64)),
  'ok',
  'first public registration attempt passes quota'
);

select matches(
  public.reserve_registration_approval((select id from public.registrations where school_name = 'School A')),
  '^GEN-[0-9]{4}$',
  'approval reserves a GEN-four-digit code'
);
select is(
  (select status from public.registrations where school_name = 'School A'),
  'provisioning',
  'approval reservation enters the internal provisioning state'
);
select is(
  public.finalize_registration_approval(
    (select id from public.registrations where school_name = 'School A'),
    '10000000-0000-0000-0000-000000000002',
    repeat('x', 24),
    repeat('i', 12)
  ),
  'approved',
  'credential provisioning finalizes approval atomically'
);
select is((select status from public.registrations where school_name = 'School A'), 'approved', 'approved state is persisted');
select is((select count(*) from public.school_credentials), 1::bigint, 'one encrypted credential row is stored');
select lives_ok(
  'update public.registrations set status = ''rejected'' where school_name = ''School B''',
  'privileged review can reject a pending registration'
);
select is((select school_code from public.registrations where school_name = 'School B'), null::text, 'rejection creates no credentials');
select throws_ok(
  'update public.registrations set status = ''pending'' where school_name = ''School B''',
  '23514', null, 'rejection is final'
);

set local role anon;
select throws_ok('select * from public.registrations', '42501', null, 'anonymous clients cannot list registrations');
select throws_ok('insert into public.registrations (school_name, teacher_whatsapp) values (''Attack'', ''+919999999999'')', '42501', null, 'anonymous clients cannot bypass the registration function');
select throws_ok('update public.registrations set status = ''approved''', '42501', null, 'anonymous clients cannot approve schools');
select throws_ok('select * from public.school_credentials', '42501', null, 'anonymous clients cannot read encrypted credentials');
select throws_ok('select public.create_public_registration(''Attack'', ''+919999999999'')', '42501', null, 'anonymous clients cannot call service RPCs directly');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select results_eq('select school_name from public.registrations', array['School A'::text], 'school reads only its own approved registration');
select is(public.current_user_is_admin(), false, 'school cannot claim admin status');
select throws_ok('select * from public.school_credentials', '42501', null, 'school cannot read encrypted credential storage');
select throws_ok('update public.registrations set school_code = ''GEN-9999''', '42501', null, 'school cannot change its code');
select throws_ok('update public.registrations set status = ''rejected''', '42501', null, 'school cannot change review status');
select throws_ok('delete from public.registrations', '42501', null, 'school cannot delete its registration');
select throws_ok('select * from public.school_credential_provisioning', '42501', null, 'school cannot inspect approval staging');
select throws_ok('select public.reserve_registration_approval((select id from public.registrations limit 1))', '42501', null, 'school cannot invoke approval RPCs');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is(public.current_user_is_admin(), true, 'server-backed admin profile is recognized');
select is((select count(*) from public.registrations), 2::bigint, 'admin can list all registrations');
select throws_ok('select * from public.school_credentials', '42501', null, 'admin browser cannot query encrypted credentials directly');
select throws_ok('update public.registrations set status = ''approved''', '42501', null, 'admin browser mutations still require the Edge Function');
select throws_ok('update public.profiles set is_admin = true where id = ''10000000-0000-0000-0000-000000000003''', '42501', null, 'admin browser cannot promote another user');
reset role;

select throws_ok(
  'update public.registrations set school_name = ''Renamed School'' where school_name = ''School A''',
  '23514', null, 'school identity is immutable after submission'
);
select matches((select school_code from public.registrations where school_name = 'School A'), '^GEN-[0-9]{4}$', 'approved code retains the required format');

select * from finish();
rollback;
