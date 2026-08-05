-- Migration: 20260802243000_remove_test_schools.sql
-- Description: Remove all test/seeded schools except Newtown School

begin;

delete from public.schools
where lower(name) not like '%newtown%';

commit;
