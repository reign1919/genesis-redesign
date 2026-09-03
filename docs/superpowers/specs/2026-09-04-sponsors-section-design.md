# Design Specification: Genesis Sponsors Moving Banner Section

**Date:** 2026-09-04  
**Status:** Approved  
**Topic:** Home Page Sponsors Moving Banner Section  

---

## 1. Overview & Objectives

Add a dedicated **"MEET OUR SPONSORS"** section to the Genesis Tech Fest home page directly between the FAQ section (`#about` with `FAQCompass`) and the Core Committee section (`Meet the Genesis Council`).

The section displays 6 sponsors organized into 2 rows of 3 columns, rendered as continuous horizontal moving marquee banners that glide smoothly across the screen, pause and subtly elevate on hover, and maintain high performance and responsiveness across desktop and mobile screens.

---

## 2. Constraints & Asset Ingestion

* **Asset Supply:** Existing assets in `sponsor-logos/` must be used directly without moving, renaming, converting, or modifying the files.
* **Sponsor Mapping:**
  * **Row 1:**
    1. `n8n`: `sponsor-logos/n8n_pink+white_logo.png` (alt: "n8n")
    2. `studyin`: `sponsor-logos/study-in.jpeg` (alt: "Studyin")
    3. `friendsfm`: `sponsor-logos/91-9-fm.jpg` (alt: "91.9 Friends FM")
  * **Row 2:**
    1. `xyz`: `sponsor-logos/xyz-logo-color.png` (alt: ".xyz")
    2. `reactkolkata`: `sponsor-logos/react-kolkata-logo-full-dark.png` (alt: "React Kolkata")
    3. `youngmetro`: `sponsor-logos/young-metro.jpeg` (alt: "Young Metro")
* **Performance & Safety:** Pure CSS hardware-accelerated transforms (`translate3d`) to prevent layout thrashing and maintain 60fps alongside the `NeuralBackground` canvas.

---

## 3. Architecture & Components

### 3.1 Component Hierarchy
* **`src/components/SponsorsSection.jsx`**:
  * Main component rendering the headline, status accent badge, and two continuous marquee tracks.
  * Duplicates track items once (`A-B-C-A-B-C`) to ensure seamless infinite looping.
  * Configured with accessible landmarks (`<section className="sponsors-section" aria-label="Meet Our Sponsors">`).
* **`src/components/SponsorsSection.css`**:
  * Component styling: dark tech theme (`var(--bg-surface)`, `var(--border-accent)`, `var(--accent-bright)`).
  * Keyframes for continuous horizontal translation:
    ```css
    @keyframes marquee-glide {
      from { transform: translate3d(0, 0, 0); }
      to { transform: translate3d(-50%, 0, 0); }
    }
    ```
  * Edge masking using CSS `mask-image` for a smooth fade-in/fade-out at the viewport boundaries:
    ```css
    mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
    ```
  * Pause on hover:
    ```css
    .sponsors-track:hover {
      animation-play-state: paused;
    }
    ```
  * Basic hover interaction on individual cards:
    ```css
    .sponsor-card:hover {
      transform: translateY(-2px) scale(1.02);
      border-color: var(--accent-bright);
      box-shadow: 0 4px 16px rgba(253, 98, 95, 0.25);
    }
    ```
  * Accessibility: respects `@media (prefers-reduced-motion: reduce)`.

### 3.2 Page Placements
* **Desktop:** In `src/pages/HomePage.jsx`, directly inserted between Section 2 (`faq-section`) and Section 3 (`committee-section`).
* **Mobile:** In `src/pages/mobile/MobileHomePage.jsx`, directly inserted between `<MobileFAQ />` and `<MobileCommittee />`.

---

## 4. Visual Design & Sizing

| Element | Desktop | Mobile |
| :--- | :--- | :--- |
| Headline | 44px Orbit (`--font-display`), centered | 28px Orbit, centered |
| Category Badge | `[03 // OFFICIAL PARTNERS & SPONSORS]` | `[PARTNERS & SPONSORS]` |
| Card Dimensions | Width: 260px, Height: 110px | Width: 180px, Height: 80px |
| Card Background | `var(--bg-surface)` (`#1A1C1C`) | `var(--bg-surface)` |
| Card Border | 1px solid `rgba(139, 26, 26, 0.45)` | 1px solid `rgba(139, 26, 26, 0.45)` |
| Image Fit | `max-width: 80%`, `max-height: 60%`, `object-fit: contain` | `max-width: 80%`, `max-height: 60%`, `object-fit: contain` |
| Track Spacing | Gap: 24px between cards, 20px between rows | Gap: 16px between cards, 16px between rows |
| Animation Duration | Track 1: 24s linear infinite; Track 2: 28s linear infinite | Track 1: 18s linear infinite; Track 2: 22s linear infinite |

---

## 5. Testing & Verification

1. **Unit & Integration Test:** `src/components/SponsorsSection.test.jsx`
   * Asserts headline `"MEET OUR SPONSORS"` renders.
   * Asserts all 6 sponsor logos render with accurate alt text and image sources.
   * Asserts aria labels and container structure match specification.
2. **Suite Execution:** Run `npm test` to ensure all tests pass.
3. **Build Check:** Run `npm run build` to guarantee zero bundling errors.
