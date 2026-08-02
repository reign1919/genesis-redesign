-- Migration: 20260802232000_seed_events_from_master.sql
-- Description: Seed all 10 official Genesis Tech Fest events from eventsData.js

insert into public.events (slug, name, description, participant_limit, is_active, eligibility_note)
values
  ('hackathon', '48HR HACKATHON', 'Continuous 48-hour product build sprint to conceptualize, design, and build functional software or hardware prototypes.', 2, true, 'AI Assistants Allowed'),
  ('buildathon', 'BUILDATHON', 'Week-long game development marathon where teams build a playable game around a secret theme.', 3, true, '1-Week Dev Window'),
  ('zero-day', 'ZERO DAY', 'Two-phase premier cybersecurity battle featuring Jeopardy CTF followed by Red Team vs. Blue Team attack-defend operations.', 2, true, 'CTF + Red/Blue Ops'),
  ('overclocked', 'OVERCLOCKED', 'High-octane custom combat robot wars fought inside a circular arena.', 3, true, 'Bot <= 5kg, 20cm³'),
  ('code-clash', 'CODE CLASH', 'Senior-level competitive coding contest on HackerRank testing algorithmic efficiency.', 2, true, '120-Minute HackerRank'),
  ('merge-conflict', 'MERGE CONFLICT', 'Oxford-style technical debate on AI ethics, digital rights, and tech governance.', 2, true, 'Oxford-Style Debate'),
  ('cine-tank', 'CINE TANK', 'Two-part event introducing a tech product through a short cinematic film followed by a live pitch.', 3, true, '2m Film + 3m Pitch'),
  ('pixel-prix', 'PIXEL PRIX', 'Rapid-fire digital art challenge to conceptualize and sketch a one-page comic based on a surprise prompt.', 1, true, 'Solo A4 Digital Art'),
  ('reel-deal', 'REEL DEAL', 'Create a 60-second vertical video capturing the excitement and preparation for Genesis Fest.', 3, true, '60s Vertical 9:16 Reel'),
  ('focal-point', 'FOCAL POINT', 'On-spot photography competition capturing raw moments and atmosphere across the fest campus.', 2, true, 'On-Spot Campus Shooting')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  participant_limit = excluded.participant_limit,
  is_active = excluded.is_active,
  eligibility_note = excluded.eligibility_note;
