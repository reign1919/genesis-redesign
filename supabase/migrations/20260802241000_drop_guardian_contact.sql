-- Migration: 20260802241000_drop_guardian_contact.sql
-- Description: Drop obsolete guardian_contact column from public.participants table

begin;

alter table public.participants
  drop column if exists guardian_contact;

commit;
