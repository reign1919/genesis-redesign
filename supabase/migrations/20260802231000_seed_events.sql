-- Migration: 20260802231000_seed_events.sql
-- Description: Seed initial active events for Genesis Fest registration

insert into public.events (slug, name, description, participant_limit, is_active, eligibility_note)
values
  ('hackathon', 'Hackathon', '24-hour rapid software development & innovation challenge.', 4, true, 'Grades 9-12'),
  ('web-design', 'Web Design Sprint', 'Modern front-end interface design and development.', 2, true, 'Grades 8-12'),
  ('tech-quiz', 'Tech Quiz', 'Inter-school computer science and technology quiz bowl.', 2, true, 'Grades 9-12'),
  ('line-follower', 'Robotics Line Follower', 'Autonomous robot navigation and speed track course.', 3, true, 'Grades 8-12'),
  ('cyber-security', 'Capture The Flag (CTF)', 'Cybersecurity vulnerabilities identification and ethics challenge.', 2, true, 'Grades 10-12')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  participant_limit = excluded.participant_limit,
  is_active = excluded.is_active;
