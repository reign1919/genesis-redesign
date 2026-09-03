# Design Specification: Dedicated Sponsors Page (`/sponsors`)

**Date:** 2026-09-04  
**Status:** Approved  
**Topic:** Dedicated Sponsors Page & Directory  

---

## 1. Overview & Objectives

Create a dedicated, high-impact **Sponsors & Partners Directory page** (`/sponsors`) for the Genesis 2026 Tech Fest. The page showcases all 6 official festival sponsors and partners with high-resolution logos, partner role tags, concise briefs describing their mission and student impact, and direct outbound links to their official websites.

The page integrates seamlessly into the cybernetic design language of Genesis, featuring both full desktop and mobile-optimized experiences, proper SEO and metadata, and clear navigation paths from the home page marquee, the desktop footer, and the mobile hamburger menu.

---

## 2. Sponsor Data & Assets

Centralized in `src/lib/sponsorsData.js`:

| Sponsor Name | Role Tag | Logo Asset Path | Official Website URL | Brief Description |
| :--- | :--- | :--- | :--- | :--- |
| **StudyIn** | `[GLOBAL EDUCATION PARTNER]` | `sponsor-logos/study-in-removebg-preview.png` | `https://gostudyin.com/` | Premier global education and overseas admissions consultancy, guiding ambitious students through end-to-end university applications and career pathways worldwide. |
| **n8n** | `[AUTOMATION & AI WORKFLOW PARTNER]` | `sponsor-logos/n8n_pink+white_logo.png` | `https://n8n.io/` | Fair-code workflow automation platform giving technical builders the power of code with the speed of no-code to orchestrate multi-step AI agents and connect modern APIs. |
| **.xyz** | `[GLOBAL DOMAIN REGISTRY PARTNER]` | `sponsor-logos/xyz-logo-color.png` | `https://gen.xyz/` | The boundary-pushing domain registry powering the next generation of internet innovators, web3 builders, and digital pioneers across 230+ countries. |
| **91.9 Friends FM** | `[OFFICIAL RADIO BROADCAST PARTNER]` | `sponsor-logos/91-9-fm-removebg-preview.png` | `https://www.youtube.com/919friendsfm` | Kolkata’s iconic radio station and youth frequency, amplifying event buzz, live student stories, and musical energy across the city's airwaves. |
| **The Telegraph: Young Metro** | `[OFFICIAL STUDENT MEDIA PARTNER]` | `sponsor-logos/young-metro-removebg-preview.png` | `https://www.telegraphindia.com/topic/the-telegraph-young-metro` | The premier youth and student tabloid by The Telegraph, chronicling school excellence, creative talent, and grassroots campus innovation across Eastern India. |
| **React Kolkata** | `[COMMUNITY & ECOSYSTEM PARTNER]` | `sponsor-logos/raact-kolkata-logo-full-light.png` | `https://reactkolkata.com/en` | Kolkata’s premier developer community uniting web engineers, open-source contributors, and tech enthusiasts through deep-dive meetups and workshops. |

---

## 3. Architecture & Routing

### 3.1 Route Registration (`src/App.jsx`)
* Route `/sponsors` conditionally rendering:
  * Desktop: `SponsorsPage`
  * Mobile: `MobileSponsorsPage`
* Alias redirect: `/sponsor` -> `/sponsors` (redirect with `replace`).

### 3.2 Navigation Entry Points
1. **Home Page Marquee Section (`src/components/SponsorsSection.jsx`)**:
   * Add a secondary cyber CTA link in the section header: `VIEW SPONSOR DIRECTORY →` linking to `/sponsors`.
2. **Desktop Home Page Footer (`src/pages/HomePage.jsx`)**:
   * Add `<Link to="/sponsors" className="docs-link-btn">✦ SPONSORS</Link>`.
3. **Mobile Drawer Menu (`src/components/mobile/MobileHamburger.jsx`)**:
   * Add `{ to: '/sponsors', label: 'SPONSORS', icon: '★' }` to `navItems`.

---

## 4. Component Structure & Visual Design

### 4.1 Desktop View (`src/pages/SponsorsPage.jsx` & `SponsorsPage.css`)
* **Background & Overlays:** `NeuralBackground`, subtle grid overlay, noise overlay, corner HUD brackets.
* **Tech Header:** Breadcrumb navigation `GENESIS TECH FEST // SPONSORS`, with `RETURN TO HOME` link to `/`.
* **Hero Banner:**
  * Eyebrow: `— OFFICIAL PARTNERS & SPONSORS // 2026 DIRECTORY`
  * Title: `Empowering The Next Generation Of Builders` with accented typography.
  * Subhead: Explaining the role of partners in supporting high school developers, hackathons, and challenges.
* **3-Column Responsive Grid:**
  * Cyber card with glass backdrop (`rgba(26, 28, 28, 0.85)` + `backdrop-filter: blur(12px)`).
  * Corner HUD `+` markers.
  * Card header with index indicator (`// PARTNER.01`) and role badge in crimson accent.
  * Recessed logo chamber with dark backing for maximum logo legibility.
  * Display title in Orbitron font.
  * Multi-line readable brief (`line-height: 1.6`, `var(--text-secondary)`).
  * External CTA button: `VISIT OFFICIAL WEBSITE ↗` with `target="_blank"`, `rel="noopener noreferrer"`, and descriptive `aria-label`.
* **Partnership CTA Banner:**
  * Bottom conversion card inviting new potential partners: `"Want to power Eastern India's premier tech fest? [BECOME A PARTNER →]"` linking to `/partnerships`.
* **Footer:** Clean festival copyright and links.

### 4.2 Mobile View (`src/pages/mobile/MobileSponsorsPage.jsx` & `MobileSponsorsPage.css`)
* Uses `MobileBackground` and `MobileHamburger`.
* Single-column stacked cards optimized for touch viewports (360px–480px).
* Touch-friendly external link buttons (min height 44px).
* Quick scroll-to-top button.

---

## 5. SEO & Accessibility

* **SEO Component:**
  * Title: `Official Sponsors & Partners — Genesis 2026 | IVWS Tech Fest`
  * Description: `Meet the official sponsors and partners supporting Genesis 2026 Tech Fest: StudyIn, n8n, .xyz, 91.9 Friends FM, The Telegraph: Young Metro, and React Kolkata.`
  * Canonical: `/sponsors`
* **Accessibility:**
  * High-contrast text on dark backgrounds.
  * Semantic heading structure (`h1`, `h2`, `h3`).
  * Accessible outbound links with screen-reader friendly `aria-label`s announcing external navigation.
  * Keyboard navigation focus outlines.

---

## 6. Testing & Quality Assurance

1. **Unit & Integration Tests (`src/pages/SponsorsPage.test.jsx`)**:
   * Verify all 6 sponsors render with correct official names.
   * Verify all 6 logos render with correct `src` and accessible `alt` text.
   * Verify all 6 outbound links contain exact required target URLs, `target="_blank"`, and `rel="noopener noreferrer"`.
   * Verify navigation links and partnership CTA render.
2. **Build Verification**:
   * Run `npm run build` to ensure zero compilation or bundle errors.
   * Run `npm test` to ensure all existing and new tests pass.
