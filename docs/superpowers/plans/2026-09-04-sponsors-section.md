# Sponsors Moving Banner Section Implementation Plan

> **For agentic workers:** Implementation plan for adding the continuous moving banner sponsors section to Genesis Tech Fest home page.

**Goal:** Create a "MEET OUR SPONSORS" moving banner section with 2 rows of 3 columns, placed between FAQ and Committee on both desktop and mobile home pages, featuring seamless infinite marquee motion and subtle hover interactions.

**Architecture:** Pure CSS GPU-accelerated marquee ribbon (`SponsorsSection.jsx` and `SponsorsSection.css`) using `translate3d` and edge fade masks. Direct asset imports from `sponsor-logos/`.

**Tech Stack:** React, CSS3 Keyframes & Variables, Vitest, React Testing Library.

## Global Constraints
- Do not move, rename, convert, or delete assets in `sponsor-logos/`.
- 3 columns and 2 rows:
  - Row 1: n8n, studyin, friendsfm
  - Row 2: xyz, reactkolkata, youngmetro
- Headline: "MEET OUR SPONSORS", positioned below FAQ compass and above Genesis Council.
- Basic hover animation max: pause track on hover, subtle lift, border glow.
- Accessible and responsive across desktop and mobile.

---

### Task 1: Create SponsorsSection Component, Styles, and Unit Tests

**Files:**
- Create: `src/components/SponsorsSection.jsx`
- Create: `src/components/SponsorsSection.css`
- Create: `src/components/SponsorsSection.test.jsx`

**Interfaces:**
- Produces: `SponsorsSection` default export React component.

- [ ] **Step 1: Write failing unit tests for SponsorsSection**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement SponsorsSection.jsx and SponsorsSection.css**
- [ ] **Step 4: Run tests to verify pass**
- [ ] **Step 5: Commit Task 1**

---

### Task 2: Integrate SponsorsSection into Desktop & Mobile Home Pages

**Files:**
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/pages/HomePage.css`
- Modify: `src/pages/mobile/MobileHomePage.jsx`
- Modify: `src/pages/mobile/MobileHomePage.css`

**Interfaces:**
- Consumes: `SponsorsSection` from `../components/SponsorsSection`

- [ ] **Step 1: Add SponsorsSection between FAQ and Committee in HomePage.jsx & MobileHomePage.jsx**
- [ ] **Step 2: Add page section wrappers and spacing in HomePage.css and MobileHomePage.css**
- [ ] **Step 3: Run Vitest test suite and verify HomePage integration**
- [ ] **Step 4: Commit Task 2**

---

### Task 3: Full Suite Verification & Build Confirmation

**Files:** None

- [ ] **Step 1: Run full Vitest suite (`npm test`)**
- [ ] **Step 2: Run production Vite build (`npm run build`)**
- [ ] **Step 3: Verify all outputs cleanly pass**
