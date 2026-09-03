# Dedicated Sponsors Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated Sponsors & Partners Directory page (`/sponsors`) showcasing 6 official festival sponsors with logos, role tags, briefs, and external links, integrated into desktop and mobile navigation.

**Architecture:** A centralized data module (`sponsorsData.js`) feeds both desktop (`SponsorsPage.jsx`) and mobile (`MobileSponsorsPage.jsx`) pages. The page is routed conditionally via `App.jsx` based on `useIsMobile()`. Navigation entry points are added to the home page marquee header (`SponsorsSection.jsx`), desktop footer (`HomePage.jsx`), and mobile drawer (`MobileHamburger.jsx`).

**Tech Stack:** React 18, React Router v6, Vitest + Testing Library, Vite, CSS Modules / Pure CSS with cyberpunk styling tokens.

## Global Constraints

- Sponsor official names: `StudyIn`, `n8n`, `.xyz`, `91.9 Friends FM`, `The Telegraph: Young Metro`, `React Kolkata`.
- Sponsor URLs:
  - StudyIn: `https://gostudyin.com/`
  - n8n: `https://n8n.io/`
  - .xyz: `https://gen.xyz/`
  - 91.9 Friends FM: `https://www.youtube.com/919friendsfm`
  - The Telegraph: Young Metro: `https://www.telegraphindia.com/topic/the-telegraph-young-metro`
  - React Kolkata: `https://reactkolkata.com/en`
- Logos from `sponsor-logos/` must be imported and displayed with dark-contrast containers.
- All external links must have `target="_blank"` and `rel="noopener noreferrer"`.
- Must support desktop and mobile viewports with responsive cybernetic UI.

---

### Task 1: Sponsor Data Model

**Files:**
- Create: `src/lib/sponsorsData.js`
- Test: `src/lib/sponsorsData.test.js`

**Interfaces:**
- Produces: `SPONSORS` array with items: `{ id, name, role, logo, website, description }`.

- [ ] **Step 1: Write the failing test**

```javascript
// src/lib/sponsorsData.test.js
import { describe, it, expect } from 'vitest';
import { SPONSORS } from './sponsorsData';

describe('sponsorsData', () => {
  it('contains exactly 6 official sponsors', () => {
    expect(SPONSORS).toHaveLength(6);
  });

  it('has all required fields for each sponsor', () => {
    SPONSORS.forEach((sponsor) => {
      expect(sponsor.id).toBeDefined();
      expect(sponsor.name).toBeDefined();
      expect(sponsor.role).toBeDefined();
      expect(sponsor.logo).toBeDefined();
      expect(sponsor.website).toMatch(/^https:\/\//);
      expect(sponsor.description).toBeTruthy();
    });
  });

  it('includes exact official names', () => {
    const names = SPONSORS.map((s) => s.name);
    expect(names).toContain('StudyIn');
    expect(names).toContain('n8n');
    expect(names).toContain('.xyz');
    expect(names).toContain('91.9 Friends FM');
    expect(names).toContain('The Telegraph: Young Metro');
    expect(names).toContain('React Kolkata');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/sponsorsData.test.js`
Expected: FAIL ("Cannot find module './sponsorsData'")

- [ ] **Step 3: Implement data module**

```javascript
// src/lib/sponsorsData.js
import n8nLogo from '../../sponsor-logos/n8n_pink+white_logo.png';
import studyinLogo from '../../sponsor-logos/study-in-removebg-preview.png';
import friendsfmLogo from '../../sponsor-logos/91-9-fm-removebg-preview.png';
import xyzLogo from '../../sponsor-logos/xyz-logo-color.png';
import reactkolkataLogo from '../../sponsor-logos/raact-kolkata-logo-full-light.png';
import youngmetroLogo from '../../sponsor-logos/young-metro-removebg-preview.png';

export const SPONSORS = [
  {
    id: 'studyin',
    name: 'StudyIn',
    role: 'GLOBAL EDUCATION PARTNER',
    logo: studyinLogo,
    website: 'https://gostudyin.com/',
    description: 'Premier global education and overseas admissions consultancy, guiding ambitious students through end-to-end university applications and career pathways worldwide.',
  },
  {
    id: 'n8n',
    name: 'n8n',
    role: 'AUTOMATION & AI WORKFLOW PARTNER',
    logo: n8nLogo,
    website: 'https://n8n.io/',
    description: 'Fair-code workflow automation platform giving technical builders the power of code with the speed of no-code to orchestrate multi-step AI agents and connect modern APIs.',
  },
  {
    id: 'xyz',
    name: '.xyz',
    role: 'GLOBAL DOMAIN REGISTRY PARTNER',
    logo: xyzLogo,
    website: 'https://gen.xyz/',
    description: 'The boundary-pushing domain registry powering the next generation of internet innovators, web3 builders, and digital pioneers across 230+ countries.',
  },
  {
    id: 'friendsfm',
    name: '91.9 Friends FM',
    role: 'OFFICIAL RADIO BROADCAST PARTNER',
    logo: friendsfmLogo,
    website: 'https://www.youtube.com/919friendsfm',
    description: "Kolkata's iconic radio station and youth frequency, amplifying event buzz, live student stories, and musical energy across the city's airwaves.",
  },
  {
    id: 'youngmetro',
    name: 'The Telegraph: Young Metro',
    role: 'OFFICIAL STUDENT MEDIA PARTNER',
    logo: youngmetroLogo,
    website: 'https://www.telegraphindia.com/topic/the-telegraph-young-metro',
    description: 'The premier youth and student tabloid by The Telegraph, chronicling school excellence, creative talent, and grassroots campus innovation across Eastern India.',
  },
  {
    id: 'reactkolkata',
    name: 'React Kolkata',
    role: 'COMMUNITY & ECOSYSTEM PARTNER',
    logo: reactkolkataLogo,
    website: 'https://reactkolkata.com/en',
    description: "Kolkata's premier developer community uniting web engineers, open-source contributors, and tech enthusiasts through deep-dive meetups and workshops.",
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/sponsorsData.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/sponsorsData.js src/lib/sponsorsData.test.js
git commit -m "feat: add sponsorsData model and unit tests"
```

---

### Task 2: Desktop Sponsors Page

**Files:**
- Create: `src/pages/SponsorsPage.jsx`
- Create: `src/pages/SponsorsPage.css`
- Test: `src/pages/SponsorsPage.test.jsx`

**Interfaces:**
- Consumes: `SPONSORS` from `src/lib/sponsorsData.js`
- Produces: `default export SponsorsPage`

- [ ] **Step 1: Write the failing test**

```javascript
// src/pages/SponsorsPage.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import SponsorsPage from './SponsorsPage';

describe('SponsorsPage (Desktop)', () => {
  const renderComponent = () =>
    render(
      <BrowserRouter>
        <SponsorsPage />
      </BrowserRouter>
    );

  it('renders page heading and subtitle', () => {
    renderComponent();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/sponsors & partners/i);
  });

  it('renders all 6 sponsor names and briefs', () => {
    renderComponent();
    expect(screen.getByText('StudyIn')).toBeInTheDocument();
    expect(screen.getByText('n8n')).toBeInTheDocument();
    expect(screen.getByText('.xyz')).toBeInTheDocument();
    expect(screen.getByText('91.9 Friends FM')).toBeInTheDocument();
    expect(screen.getByText('The Telegraph: Young Metro')).toBeInTheDocument();
    expect(screen.getByText('React Kolkata')).toBeInTheDocument();
  });

  it('renders external links with target="_blank" and rel="noopener noreferrer"', () => {
    renderComponent();
    const link = screen.getByRole('link', { name: /visit studyin official website/i });
    expect(link).toHaveAttribute('href', 'https://gostudyin.com/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders partner CTA banner linking to /partnerships', () => {
    renderComponent();
    const partnerCta = screen.getByRole('link', { name: /become a partner/i });
    expect(partnerCta).toHaveAttribute('href', '/partnerships');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/SponsorsPage.test.jsx`
Expected: FAIL ("Cannot find module './SponsorsPage'")

- [ ] **Step 3: Implement SponsorsPage component and CSS**

Implement `src/pages/SponsorsPage.jsx` with:
- `SEO` component configured for `/sponsors`.
- `NeuralBackground`, grid overlays, HUD brackets.
- Header with return home link.
- Cyber hero section.
- 3-column responsive card grid rendering each sponsor with index `// SPONSOR.0N`, role badge, recessed logo box, display title, description, and external website link button.
- Bottom "BECOME A PARTNER" call-to-action banner linking to `/partnerships`.

Implement `src/pages/SponsorsPage.css` with dark cyber glass aesthetics, hover transformations, accent colors, and HUD corners.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/SponsorsPage.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/SponsorsPage.jsx src/pages/SponsorsPage.css src/pages/SponsorsPage.test.jsx
git commit -m "feat: implement desktop SponsorsPage component and styling"
```

---

### Task 3: Mobile Sponsors Page

**Files:**
- Create: `src/pages/mobile/MobileSponsorsPage.jsx`
- Create: `src/pages/mobile/MobileSponsorsPage.css`
- Test: `src/pages/mobile/MobileSponsorsPage.test.jsx`

**Interfaces:**
- Consumes: `SPONSORS` from `src/lib/sponsorsData.js`
- Produces: `default export MobileSponsorsPage`

- [ ] **Step 1: Write the failing test**

```javascript
// src/pages/mobile/MobileSponsorsPage.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import MobileSponsorsPage from './MobileSponsorsPage';

describe('MobileSponsorsPage', () => {
  const renderComponent = () =>
    render(
      <BrowserRouter>
        <MobileSponsorsPage />
      </BrowserRouter>
    );

  it('renders mobile sponsor page header and title', () => {
    renderComponent();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/sponsors/i);
  });

  it('renders all 6 sponsor cards with visit buttons', () => {
    renderComponent();
    expect(screen.getByText('StudyIn')).toBeInTheDocument();
    expect(screen.getByText('n8n')).toBeInTheDocument();
    expect(screen.getByText('.xyz')).toBeInTheDocument();
    expect(screen.getByText('91.9 Friends FM')).toBeInTheDocument();
    expect(screen.getByText('The Telegraph: Young Metro')).toBeInTheDocument();
    expect(screen.getByText('React Kolkata')).toBeInTheDocument();

    const links = screen.getAllByRole('link', { name: /visit.*website/i });
    expect(links).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/mobile/MobileSponsorsPage.test.jsx`
Expected: FAIL ("Cannot find module './MobileSponsorsPage'")

- [ ] **Step 3: Implement MobileSponsorsPage component and CSS**

Implement `src/pages/mobile/MobileSponsorsPage.jsx` with:
- `SEO` component.
- `MobileBackground` & `MobileHamburger`.
- Mobile top header bar.
- Stacked single-column cyber sponsor cards with touch-friendly visit buttons.
- Mobile partnership banner linking to `/partnerships`.
- Footer copyright.

Implement `src/pages/mobile/MobileSponsorsPage.css` with single-column layouts, touch target dimensions (44px min height), and high contrast text.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/mobile/MobileSponsorsPage.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/mobile/MobileSponsorsPage.jsx src/pages/mobile/MobileSponsorsPage.css src/pages/mobile/MobileSponsorsPage.test.jsx
git commit -m "feat: implement MobileSponsorsPage component and mobile styles"
```

---

### Task 4: Router Registration & Navigation Integration

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/SponsorsSection.jsx`
- Modify: `src/components/SponsorsSection.css`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/components/mobile/MobileHamburger.jsx`

**Interfaces:**
- Consumes: `SponsorsPage`, `MobileSponsorsPage`
- Connects: `/sponsors` route and links throughout the application

- [ ] **Step 1: Update App.jsx with route `/sponsors` and `/sponsor` redirect**

Add lazy imports for `SponsorsPage` and `MobileSponsorsPage`.
Add routes:
```jsx
<Route path="/sponsors" element={isMobile ? <MobileSponsorsPage /> : <SponsorsPage />} />
<Route path="/sponsor" element={<Navigate to="/sponsors" replace />} />
```

- [ ] **Step 2: Update SponsorsSection.jsx to add a "VIEW SPONSOR DIRECTORY →" link**

In `src/components/SponsorsSection.jsx`, add a styled `<Link to="/sponsors" className="sponsors-view-directory-btn">VIEW ALL SPONSORS & BRIEFS →</Link>` under or beside the section title, and update `SponsorsSection.css` to style the button.

- [ ] **Step 3: Update HomePage.jsx footer with link to `/sponsors`**

In `src/pages/HomePage.jsx` footer, add:
```jsx
<Link to="/sponsors" className="docs-link-btn">
  <span style={{ color: '#FD625F', fontWeight: 'bold' }}>★</span>
  <span>SPONSORS</span>
</Link>
```

- [ ] **Step 4: Update MobileHamburger.jsx with SPONSORS link**

Add `{ to: '/sponsors', label: 'SPONSORS', icon: '★' }` into `navItems` in `src/components/mobile/MobileHamburger.jsx`.

- [ ] **Step 5: Run all test suites**

Run: `npm test`
Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/components/SponsorsSection.jsx src/components/SponsorsSection.css src/pages/HomePage.jsx src/components/mobile/MobileHamburger.jsx
git commit -m "feat: connect /sponsors routing and navigation entry points"
```

---

### Task 5: Full Build & Verification

**Files:**
- All touched files

- [ ] **Step 1: Run full Vitest suite**

Run: `npm test`
Expected: All tests pass cleanly.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Vite build succeeds with zero errors in `dist/`.

- [ ] **Step 3: Verify git status and clean working tree**

Run: `git status`
Expected: Clean working tree.
