-- Migration: 20260802244000_delete_all_schools.sql
-- Description: Delete all schools from public.schools

begin;

delete from public.schools;

commit;
