/**
 * GENESIS TECH FEST — Events Master Data
 * 10 Events across 3 Clusters (Flagship, Technical, Creative)
 * Extracted directly from official GENESIS GUIDELINES PDF documentation.
 */

export const EVENT_CLUSTERS = {
  FLAGSHIP: 'Flagship',
  TECHNICAL: 'Technical',
  CREATIVE: 'Creative',
};

export const eventsData = [
  // ── FLAGSHIP CLUSTER (4 Events) ──────────────────────────────────
  {
    id: 'hackathon',
    reelIndex: '01',
    title: '48HR HACKATHON',
    brief: 'Continuous 48-hour product build sprint to conceptualize, design, and build functional software or hardware prototypes.',
    category: EVENT_CLUSTERS.FLAGSHIP,
    flagship: true,
    gridPosition: { x: 50, y: 18 },
    date: 'SEPTEMBER 24-26, 2026',
    time: '48-HOUR CONTINUOUS SPRINT',
    teamSize: '2 MEMBERS PER TEAM',
    formatMode: '48-Hour Continuous Build',
    keyPolicy: 'AI Assistants Allowed (Coding/Debugging)',
    deliverable: 'Public GitHub Repo + 3m Demo Video + Report',
    visualType: 'NEURAL_QUANTUM_CORE',
    rules: [
      'Fresh Code Only: All project development (coding, design, asset creation) must take place entirely within the 48-hour hackathon window.',
      'No Pre-built Projects: Working on pre-existing projects or submitting pre-started work is strictly prohibited.',
      'Team Constraint: Exactly 2 members per team. All members must register individually prior to kickoff. Solo participation is not permitted.',
      'Open Source & Boilerplates: Use of open-source libraries, frameworks, and public boilerplates is encouraged; all third-party assets must be clearly declared.',
      'Submission Deliverables: Public source code repository link (GitHub/GitLab), max 3-minute demo video, and project report.',
      'Mandatory Report Format: Must include Problem Statement (Challenge + Target Audience), Solution & Core Features (Value Prop + Completed & Incomplete Features), Technical Architecture & Tech Stack (Frontend, Backend, Database, APIs), and System Architecture.',
      'Permitted Tools: Standard IDEs (VS Code, IntelliJ, WebStorm), Version Control (GitHub, GitLab), Design (Figma, Adobe XD, Canva), Cloud (AWS, GCP, Azure, Vercel), APIs (Postman, Insomnia), AI Assistants (GitHub Copilot, ChatGPT, Claude for debugging & code suggestions).',
      'Prohibited Tools: No-Code App Builders (Wix, Bubble), Proprietary/Closed internal tools, Fully Autonomous AI Agents (Devin, AutoGPT), Malicious Software (DDoS tools, network sniffers like Wireshark, Metasploit).'
    ],
    timeline: [
      { time: 'Hour 00:00', event: 'Official Kickoff & Hacking Begins' },
      { time: 'Hour 12:00', event: 'Architecture & Tech Stack Checkpoint' },
      { time: 'Hour 24:00', event: 'Midway Code Freeze Check' },
      { time: 'Hour 48:00', event: 'Portal Lock & Final Deliverables Submission' }
    ]
  },
  {
    id: 'buildathon',
    reelIndex: '02',
    title: 'BUILDATHON',
    brief: 'Week-long game development marathon where teams build a playable game around a secret theme.',
    category: EVENT_CLUSTERS.FLAGSHIP,
    flagship: true,
    gridPosition: { x: 28, y: 32 },
    date: 'SEPTEMBER 19-26, 2026',
    time: '1-WEEK DEV + DAY OF FEST DEMO',
    teamSize: '3 MEMBERS PER TEAM',
    formatMode: '1-Week Dev Window + Fest Day Presentation',
    keyPolicy: 'AI allowed for Code only (Human Narrative Required)',
    deliverable: 'GitHub Repo (w/ Storyboard) + Playable Game',
    visualType: 'GAME_ENGINE_VIEWPORT',
    rules: [
      'Team Composition: Exactly 3 participants per team.',
      'Theme Release: Theme revealed 1 week in advance on Day 1 of the development window via a WhatsApp group.',
      'Pre-Release GitHub Submission: Every team MUST submit an empty GitHub repo link (init/readme allowed) privately to the Event Head BEFORE the theme reveal.',
      'Commit Hygiene: All project code must be stored in a public GitHub repo with a clear commit history. Dumping the entire project in one commit before deadline is penalized.',
      'Engine Freedom: Use of any game engine or development tool (Godot, Unity, GameMaker, Unreal, WebGL).',
      'Storyboard Requirement: Every GitHub repo must include a clear storyboard flowchart in the README.',
      'Original Story/Script: Storyline and narrative must be original human writing. AI tools allowed ONLY for coding/dialogue systems assistance, NOT for narrative generation.',
      'Asset Credits: Any third-party art, audio, or music must be properly licensed and credited in the README.',
      'Live Presentation: 10 minutes to demo playable game to judges + 5 minutes Q&A round on the day of fest.',
      'Prohibited: Pre-built games/templates/asset packs constituting core gameplay, code-sharing between teams, AI-generated script/narrative.'
    ],
    timeline: [
      { time: 'Day -7 (09:00 AM)', event: 'Empty GitHub Repo Submission Deadline' },
      { time: 'Day -7 (10:00 AM)', event: 'Theme Reveal via WhatsApp Group & 1-Week Window Opens' },
      { time: 'Day 0 (09:00 AM)', event: 'Development Freeze & Final Repo Lock' },
      { time: 'Day 0 (11:00 AM)', event: 'Live Game Demo (10m) & Jury Q&A (5m)' }
    ]
  },
  {
    id: 'zero-day',
    reelIndex: '03',
    title: 'ZERO DAY',
    brief: 'Two-phase premier cybersecurity battle featuring Jeopardy CTF followed by Red Team vs. Blue Team attack-defend operations.',
    category: EVENT_CLUSTERS.FLAGSHIP,
    flagship: true,
    gridPosition: { x: 72, y: 32 },
    date: 'SEPTEMBER 26, 2026',
    time: '11:00 AM - 05:00 PM',
    teamSize: '2 MEMBERS PER TEAM',
    formatMode: 'Phase 1 CTF + Phase 2 Red vs Blue',
    keyPolicy: 'AI Assistants Allowed | Payload Scripts Banned',
    deliverable: 'Flag Submissions & Source Code Patches',
    visualType: 'CYBER_ATTACK_MATRIX',
    rules: [
      'Team Composition: Maximum 2 students per team.',
      'Phase 1 (Capture The Flag): Ethical hacking across Web vulnerabilities, Cryptography, Steganography, and Open-Source Intelligence (OSINT) puzzles with weighted scoring.',
      'Phase 2 (Red Team vs. Blue Team): Live attack-and-defend scenario. Segregation into Red and Blue teams conducted on a strict first-come, first-serve basis.',
      'Blue Team (Defend): Provided with website source code; objective is to identify and patch zero-day vulnerabilities. Defense points awarded for every flag NOT found by Red Team.',
      'Red Team (Attack): Provided with target website URL; objective is to find and exploit zero-day vulnerabilities. Attack points awarded for every flag successfully found and submitted.',
      'Allowed Tools: Standard security tools (curl, wget, nmap, wireshark for local traffic), stego/crypto deciphering software, AI assistants (explicitly allowed).',
      'Prohibited Payload Scripts: Pre-written exploit payload scripts are strictly NOT allowed by default. Any requests to use pre-written scripts must be presented in plaintext to event manager >24 hours before the event.'
    ],
    timeline: [
      { time: '11:00 AM', event: 'Phase 1: Jeopardy CTF Access Opened' },
      { time: '01:30 PM', event: 'Phase 1 Scoreboard Freeze' },
      { time: '02:00 PM', event: 'Phase 2: Red vs. Blue Attack/Defend Scenario' },
      { time: '05:00 PM', event: 'Final Flag Verification & Scoring' }
    ]
  },
  {
    id: 'overclocked',
    reelIndex: '04',
    title: 'OVERCLOCKED',
    brief: 'High-octane custom combat robot wars fought inside a circular arena.',
    category: EVENT_CLUSTERS.FLAGSHIP,
    flagship: true,
    gridPosition: { x: 50, y: 44 },
    date: 'SEPTEMBER 26, 2026',
    time: '02:00 PM - 07:00 PM',
    teamSize: '3 MEMBERS PER TEAM',
    formatMode: '3-Minute Circular Arena Battles',
    keyPolicy: 'Bot <= 5kg, 20cm³ | 12V/24V DC Battery (No AC)',
    deliverable: 'Wireless RC Combat Robot (10s Knockout Call)',
    visualType: 'ROBOTIC_ARENA_TELEMETRY',
    rules: [
      'Team Composition: 3 members per team.',
      'Bot Specifications: Weight <= 5.0 kg. Dimensions <= 20 cm length x 20 cm width x 20 cm height.',
      'Power Supply: Battery operated only (12V/24V DC supply, Li-ion or Lead Acid). Direct AC supply is strictly prohibited.',
      'Control System: Wireless remote control only.',
      'Match Duration: Each battle lasts for exactly 3 minutes inside a circular arena.',
      'Knockout Call: Bot is considered knocked out if it fails to show controlled linear movement for 10 consecutive seconds (10-second referee countdown).',
      'Fixture Format: Randomized knockout bracket system (double elimination depending on registration count).',
      'Weapons Allowed: Pushers, Wedges, Rammers, Electric/Servo Flippers & Lifters, Grabbers, Crushers, Electric Axes/Hammers, Spinners.',
      'Prohibited Attachments: Fire/pyrotechnics/explosives, liquids/foams/corrosive chemicals, entanglement nets/tape/strings, untethered projectiles, radio jammers/EMPs/shock weapons, dangerous high-pressure pneumatics/hydraulics.'
    ],
    timeline: [
      { time: '11:00 AM', event: 'Weigh-in, Dimension & Safety Inspection' },
      { time: '02:00 PM', event: 'Randomized Knockout Bracket Battles' },
      { time: '05:30 PM', event: 'Semifinals' },
      { time: '06:30 PM', event: 'Championship Grand Match' }
    ]
  },

  // ── TECHNICAL CLUSTER (3 Events - Left Branch) ────────────────────
  {
    id: 'code-clash',
    reelIndex: '05',
    title: 'CODE CLASH',
    brief: 'Senior-level competitive coding contest on HackerRank testing algorithmic efficiency.',
    category: EVENT_CLUSTERS.TECHNICAL,
    flagship: false,
    gridPosition: { x: 20, y: 62 },
    date: 'SEPTEMBER 26, 2026',
    time: '120 MINUTES (2 HOURS)',
    teamSize: '2 MEMBERS PER TEAM',
    formatMode: '120-Minute HackerRank Contest (4-6 Problems)',
    keyPolicy: 'AI Tools Strictly Blocked on School Wi-Fi',
    deliverable: 'HackerRank Code Submissions (C++, Java, Py)',
    visualType: 'ALGORITHMIC_SORT_WAVE',
    rules: [
      'Platform & Duration: Hosted on HackerRank for 120 Minutes (2 Hours).',
      'Team Composition: 2 participants per team.',
      'Allowed Languages: Any programming language supported on HackerRank (C++, Java, Python 3, C#, Go, etc.).',
      'Problem Set: 4 to 6 algorithmic and logical problem-solving challenges ranging from Easy to Hard.',
      'Scoring & Partial Points: Points awarded based on hidden test cases passed; partial credit for suboptimal solutions passing a subset of test cases.',
      'Tie-Breaker: HackerRank standard time-penalty system (least cumulative submission time ranks higher).',
      'Network Policy: All participants must connect to designated School Wi-Fi.',
      'AI Restriction: AI tools (ChatGPT, GitHub Copilot, Gemini, Claude) are strictly BLOCKED on network. Attempting to bypass is instant disqualification.',
      'Device Constraint: Same primary device must be used for all submissions throughout 120 minutes. Secondary screen/tablet allowed ONLY for rough work/reading.',
      'Integrity: Pen & paper allowed for dry-running code; zero tolerance for communication or code plagiarism.'
    ],
    timeline: [
      { time: '00:00 (Start)', event: 'HackerRank Problem Portal Opens' },
      { time: '01:30 (90m)', event: 'Leaderboard Freeze' },
      { time: '02:00 (120m)', event: 'Contest Window Closes & Automatic Verification' }
    ]
  },
  {
    id: 'merge-conflict',
    reelIndex: '06',
    title: 'MERGE CONFLICT',
    brief: 'Oxford-style technical debate on AI ethics, digital rights, and tech governance.',
    category: EVENT_CLUSTERS.TECHNICAL,
    flagship: false,
    gridPosition: { x: 36, y: 76 },
    date: 'SEPTEMBER 26, 2026',
    time: '10:00 AM - 01:00 PM',
    teamSize: '2 MEMBERS PER TEAM',
    formatMode: 'Oxford-Style Debate (Prelims + Finals)',
    keyPolicy: '45m Computer Lab Prep | No Scripts on Stage',
    deliverable: '3m Speeches + 1m Rebuttal (1 Question Limit)',
    visualType: 'SPECTRUM_DEBATE_RESONATOR',
    rules: [
      'Debate Format: Oxford-style format (audience vote not counted; final decision relies solely on judges votes). Conducted entirely in English.',
      'Team Composition: Exactly 2 participants per team (1 speaker FOR the motion, 1 speaker AGAINST the motion).',
      'Prelims (Elimination Round): Topic provided shortly after registration forms; 3 minutes speaking time per speaker (warning bell at 2m); top teams qualify for Finals.',
      'Finals Prep Window: Topic announced by moderator immediately after prelims; 45 minutes preparation time in Computer Lab with internet research access.',
      'Finals Speaking Format: 3 minutes speaking time per speaker (warning bell at 2m, final bell at 3m; arguments after final bell not evaluated).',
      'Rebuttal Phase: 1-minute rebuttal phase following speeches; teams limited to asking exactly ONE specific question.',
      'Allowed: Pen and paper on stage for reference, internet research during 45-min prep period in Computer Lab.',
      'Prohibited: Reading speeches directly from prepared scripts/paper on stage, unparliamentary language, derogatory statements, teacher assistance during prep, cross-questioning between teammates.'
    ],
    timeline: [
      { time: '10:00 AM', event: 'Prelims Elimination Round (3m speeches)' },
      { time: '11:15 AM', event: 'Finals Topic Drop & 45-Minute Prep Window' },
      { time: '12:00 PM', event: 'Finals Speeches (3m) & 1-Minute Rebuttals' }
    ]
  },
  {
    id: 'cine-tank',
    reelIndex: '07',
    title: 'CINE TANK',
    brief: 'Two-part event introducing a tech product through a short cinematic film followed by a live pitch.',
    category: EVENT_CLUSTERS.TECHNICAL,
    flagship: false,
    gridPosition: { x: 44, y: 88 },
    date: 'SEPTEMBER 26, 2026',
    time: '2M FILM + 3M LIVE PITCH',
    teamSize: '3 MEMBERS PER TEAM',
    formatMode: '2-Minute Film + 3-Minute Live Pitch',
    keyPolicy: 'AI Video Editing Allowed | Narrative Continuity Required',
    deliverable: 'Pre-Made Film Screening + Live Product Pitch',
    visualType: 'CINEMATIC_PROJECTION_BEAM',
    rules: [
      'Team Composition: Exactly 3 participants per team.',
      'Core Concept: Two-part event where teams introduce a tech product/brand through a short cinematic film, immediately followed by a live pitch built upon that film.',
      'Phase 1 (Cinematic Film Screening): 2 minutes duration. Teams screen a short cinematic film introducing their tech product or brand to judges. Film MUST be made before the event.',
      'Phase 2 (Live Pitch): 3 minutes duration. Teams conduct a live pitch of the same product, anchored by the film just screened.',
      'Narrative Continuity: The pitch must be built around and anchored by the film as its core foundation.',
      'Product Focus: Both the film and the pitch must focus on the same tech-based product or service.',
      'Allowed: Use of AI tools for producing and editing the cinematic film, creative narrative-driven filmmaking styles.',
      'Prohibited: Making the film feel like a traditional advertisement/commercial (must be cinematic), standard "Shark Tank" pitches ignoring film narrative, exceeding time limits (2m film, 3m pitch), team size other than 3.'
    ],
    timeline: [
      { time: '10:00 AM', event: 'Team Screenings Begin (2m Film Screening)' },
      { time: '10:02 AM', event: 'Immediate Live Product Pitch (3m Pitch)' },
      { time: '12:30 PM', event: 'Jury Deliberation & Winners Announcement' }
    ]
  },

  // ── CREATIVE CLUSTER (3 Events - Right Branch) ───────────────────
  {
    id: 'pixel-prix',
    reelIndex: '08',
    title: 'PIXEL PRIX',
    brief: 'Rapid-fire digital art challenge to conceptualize and sketch a one-page comic based on a surprise prompt.',
    category: EVENT_CLUSTERS.CREATIVE,
    flagship: false,
    gridPosition: { x: 78, y: 60 },
    date: 'SEPTEMBER 26, 2026',
    time: '15M IDEATION + 90M SKETCHING',
    teamSize: '1 PARTICIPANT PER TEAM (SOLO)',
    formatMode: '15m Ideation + 90m Sketching/Lettering',
    keyPolicy: 'Strictly No AI Image Generation Tools',
    deliverable: 'Single-Page A4 Comic (3 to 7 Panels)',
    visualType: 'VECTOR_CANVAS_GRID',
    rules: [
      'Team Composition: 1 participant per team (Solo).',
      'Theme Release: Surprise prompt revealed on the spot at the beginning of the event.',
      'Phase 1 (Theme Reveal & Ideation): 15 Minutes to brainstorm narrative, draft script, and plan panel layout.',
      'Phase 2 (Sketching & Execution): 90 Minutes to actively draw, ink, and letter the one-page comic.',
      'Format & Panel Layout: Entire story must be contained within a single page. Minimum 3 panels and maximum 7 panels to ensure clear narrative arc.',
      'Canvas Specifications: If Digital, standard A4 size (2480 x 3508 pixels at 300 DPI).',
      'Allowed: Dialogue bubbles, captions, sound effect typography, standard digital brushes & software (Procreate, Photoshop, Clip Studio Paint).',
      'Prohibited: Pre-drawn assets, imported templates, pre-existing character designs, AI-generation tools (all art must be originally crafted during event), plagiarizing existing comics/manga, exceeding 1-page limit.'
    ],
    timeline: [
      { time: '00:00 (15m)', event: 'Surprise Prompt Reveal & Story Ideation' },
      { time: '00:15 (90m)', event: 'Sketching, Inking & Lettering Window' },
      { time: '01:45', event: 'Final Single-Page Export & Submission' }
    ]
  },
  {
    id: 'reel-deal',
    reelIndex: '09',
    title: 'REEL DEAL',
    brief: 'Create a 60-second vertical video capturing the excitement and preparation for Genesis Fest.',
    category: EVENT_CLUSTERS.CREATIVE,
    flagship: false,
    gridPosition: { x: 64, y: 74 },
    date: 'DAYS LEADING UPTO GENESIS',
    time: '60 SECONDS (9:16)',
    teamSize: '3 MEMBERS PER TEAM',
    formatMode: 'Submit Online 48 Hours Prior to Fest',
    keyPolicy: 'Original Footage Only (No Stock Videos)',
    deliverable: '60s Vertical 9:16 Video (MP4/MOV)',
    visualType: 'VERTICAL_REEL_WAVEFORM',
    rules: [
      'Team Composition: 3 members per team.',
      'Task: Capture the excitement, hustle, and spirit of your school preparation for Genesis Fest.',
      'Submission Deadline: Submit online exactly 48 hours before the main event.',
      'Theme: "Preparing for Genesis Fest" (showcase behind-the-scenes action, practice sessions, art creation, general enthusiasm).',
      'Duration: The reel must be 60 seconds in length.',
      'Format & Resolution: Vertical 9:16 aspect ratio (e.g. 1080x1920 pixels), submitted in MP4 or MOV format. English language only.',
      'Allowed: Smartphones, DSLRs, mirrorless/action cameras, any video editing software (Premiere, CapCut, InShot, DaVinci), trending audio tracks, royalty-free music, voiceovers, text overlays, VFX, featuring school banners/teachers with permission.',
      'Prohibited: Using pre-existing footage/stock videos, offensive/discriminatory content, unsafe behavior/property damage, negative targeting of other schools, large distracting watermarks.'
    ],
    timeline: [
      { time: '48 Hours Prior', event: 'Online Vertical Video Submission Deadline' },
      { time: 'Day of Fest', event: 'Public Reel Screening & Winner Announcement' }
    ]
  },
  {
    id: 'focal-point',
    reelIndex: '10',
    title: 'FOCAL POINT',
    brief: 'On-spot photography competition capturing raw moments and atmosphere across the fest campus.',
    category: EVENT_CLUSTERS.CREATIVE,
    flagship: false,
    gridPosition: { x: 56, y: 88 },
    date: 'SEPTEMBER 26, 2026',
    time: 'OPENING TO 1HR BEFORE CLOSING',
    teamSize: '2 MEMBERS PER TEAM',
    formatMode: 'On-Spot Campus Shooting Window',
    keyPolicy: 'Strictly No Generative AI | Campus Venue Only',
    deliverable: 'Up to 5 Photo Entries (RAW/JPEG)',
    visualType: 'APERTURE_SHUTTER_SCOPE',
    rules: [
      'Team Composition: 2 members per team.',
      'Theme: Open theme announced right at the start of the fest.',
      'Timeline: Shooting starts directly after opening ceremony; competition window closes exactly 1 hour before closing ceremony.',
      'Location: All photos must be taken exclusively at the fest venue itself during the designated window.',
      'Submission: Teams must submit up to 5 entries by designated deadline.',
      'Allowed: Participant\'s own camera (DSLR/Mirrorless/Phone), manual editing (color grading, cropping, retouching).',
      'Prohibited: STRICTLY NO AI ALLOWED (generative AI tools for creating, expanding, or altering images banned), no pre-shot material or off-site photography.'
    ],
    timeline: [
      { time: 'Opening Ceremony', event: 'Open Theme Release & Shooting Begins' },
      { time: '-1 Hr Before Closing', event: 'Final Submission Deadline (Up to 5 Photos)' },
      { time: 'Closing Ceremony', event: 'Exhibition & Winner Announcement' }
    ]
  }
];

export const getEventById = (id) => {
  if (!id) return null;
  return eventsData.find((e) => e.id.toLowerCase() === id.toLowerCase()) || null;
};
