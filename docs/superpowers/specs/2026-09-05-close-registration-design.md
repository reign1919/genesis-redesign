# Design Spec: School Registration Closure for Genesis '26

**Date:** 2026-09-05  
**Topic:** Close School Registration, Block Registration Feature, and Display Closure Notice

---

## 1. Objective & Context
Genesis '26 registration has concluded. New schools must no longer be able to submit registrations, but schools that are already registered must continue to be able to log in with their credentials (school code and password).

When navigating to or selecting the **REGISTER** tab on the login portal (both desktop and mobile), users will see a dedicated closure notice:
> *"Registration for Genesis '26 has closed, see you in '27! Contact thegenesiscouncil@ivws.org for any discrepancies."*

---

## 2. User Experience & Component Architecture

### 2.1 Desktop View (`src/pages/LoginPage.jsx`)
- **Mode Toggle:** The top toggle (`LOGIN` / `REGISTER` buttons and interactive compass needle) remains functional so users can switch between Login and the Closure Notice.
- **Login Mode (`mode === 'login'`):**
  - Keeps the School Code and Password inputs intact.
  - Keeps form submission using `signInSchool(schoolCode, password)` intact.
  - Updates the helper notice:
    - *Old:* `"No school credentials yet? Register your school first."`
    - *New:* `"School registration for Genesis '26 is closed. Already registered? Sign in with your school credentials below."` with an action link to view registration info if needed.
- **Register Mode (`mode === 'register'`):**
  - Completely removes input fields (`schoolName`, `teacherWhatsapp`) and the submit button.
  - Renders a clean status panel (`.registration-closed-card`):
    - Monospace tag / eyebrow: `// SYSTEM NOTICE: REGISTRATION CLOSED`
    - Heading: `REGISTRATION CLOSED`
    - Primary message: `Registration for Genesis '26 has closed, see you in '27!`
    - Discrepancy email link: `Contact thegenesiscouncil@ivws.org for any discrepancies.` (linked to `mailto:thegenesiscouncil@ivws.org`)
    - Action button / link: `Already registered? Return to Login →` which calls `toggleMode()` to return to the login form.

### 2.2 Mobile View (`src/pages/mobile/MobileLoginPage.jsx`)
- Mirrors desktop behavior:
  - When `mode === 'login'`, login fields remain fully functional. The helper notice reflects that registration is closed.
  - When `mode === 'register'`, input fields and submit button are replaced by the mobile-adapted `.m-registration-closed-card` containing the exact same closure message, mailto link, and return-to-login button.

---

## 3. Security, Data Flow & Submission Blocking
1. **Form Removal:** In `register` mode, the registration `<input>` fields and submit button are removed from the DOM.
2. **Client-side Submission Guard:** In `handleSubmit`:
   ```javascript
   if (mode === 'register') {
     return;
   }
   ```
   This strictly guarantees that no registration payload can be sent to `submitRegistration` or the backend from the UI.
3. **Login Continuity:** `signInSchool` flow remains 100% operational for existing schools.

---

## 4. Styling & Visual Design

### 4.1 Desktop (`src/pages/LoginPage.css`)
- Style `.registration-closed-card`:
  - Background with subtle glassmorphism: `rgba(25, 10, 10, 0.6)`.
  - Border with subtle oxblood accent: `1px solid rgba(172, 50, 46, 0.4)`.
  - Clean padding and text hierarchy matching existing editorial cyberpunk styling.
  - Accent color for links and highlight text (`var(--accent, #ac322e)` / `#e63946`).

### 4.2 Mobile (`src/pages/mobile/MobileLoginPage.css`)
- Style `.m-registration-closed-card` matching mobile container padding and typography.

---

## 5. Testing & Verification
1. **Unit / Integration Tests:**
   - Add tests verifying that `LoginPage` and `MobileLoginPage` in register mode:
     - Render the text `"Registration for Genesis '26 has closed, see you in '27!"`
     - Render the contact link `thegenesiscouncil@ivws.org`
     - Do not render registration input fields (`school-name`, `teacher-whatsapp`) or a registration submission button.
     - Login form continues to render School Code and Password inputs and submit button.
2. **Regression Testing:**
   - Run `npm test` across all suites to confirm no regressions.
   - Run `npm run build` to confirm production build cleanliness.
