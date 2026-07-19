# Performance Audit: Genesis Redesign Website

Based on a detailed analysis of the React codebase, several critical performance bottlenecks and inefficient patterns have been identified. These are causing significant lag, high CPU/GPU usage, and jankiness across the application. 

Here is a comprehensive breakdown of the issues and how to resolve them.

---

## 1. CRITICAL: Global `onMouseMove` State Updates (The "React Render Death Spiral")
**Severity: 🔴 High**
**Files Affected:** `src/pages/HomePage.jsx`, `src/pages/LoginPage.jsx`, `src/pages/ContactPage.jsx`

### The Issue
Across all major pages, a global `onMouseMove` event listener is attached to the root wrapper. It captures the mouse coordinates and triggers a React state update using `setMousePos`:

```jsx
const handleMouseMove = (e) => {
  if (rafRef.current) return;
  const x = `${e.clientX}px`;
  const y = `${e.clientY}px`;
  rafRef.current = requestAnimationFrame(() => {
    setMousePos({ x, y }); // ❌ THIS IS KILLING PERFORMANCE
    rafRef.current = null;
  });
};
```

**Why it lags:** 
Updating state (`setMousePos`) tells React to re-render the *entire* page component (and all its children) on every single frame where the mouse moves (up to 60-120 times per second). This means heavy components like `<NeuralBackground />`, `<CountdownTimer />`, and `<CompassNav />` are being destroyed and recreated constantly just because the user moved their mouse.

### The Fix
Bypass React state entirely for this effect. Use a React `useRef` to target the DOM node directly and update its CSS variables. This offloads the work to the browser's CSS engine and skips the React render cycle completely.

```jsx
// 1. Remove `mousePos` state.
// 2. Add a ref to the wrapper div.
const wrapperRef = useRef(null);

const handleMouseMove = (e) => {
  if (wrapperRef.current) {
    // Directly mutate the DOM CSS variables without triggering a React re-render
    wrapperRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
    wrapperRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
  }
};

// 3. Attach the ref to your wrapper
<div className="homepage-wrapper" ref={wrapperRef} onMouseMove={handleMouseMove}>
```

---

## 2. VERY HIGH: `NeuralBackground.jsx` Canvas Loop Complexity
**Severity: 🔴 High**
**Files Affected:** `src/components/NeuralBackground.jsx`

### The Issue
The `NeuralBackground` component runs a continuous `requestAnimationFrame` loop on a `<canvas>`. While the math has been slightly optimized (using `distSq` instead of `Math.sqrt`), there are still major GPU/CPU drains:
1. **O(N²) Nested Loops:** For 50 nodes, it calculates distances between every single pair every frame (1,225 checks per frame).
2. **Radial Gradients in Loop:** Inside the drawing loop, it creates a new radial gradient (`ctx.createRadialGradient`) for glowing nodes near the cursor. Creating gradients every frame is highly expensive.
3. **No Unmount/Cleanup Handling for Multiple Instances:** If a user navigates between Home, Login, and Contact pages, React might render multiple overlapping `NeuralBackground` canvas instances if the unmounting lifecycle isn't perfectly respected, though React Router typically handles this, it's a risk.

### The Fix
1. **Cache the Glow Gradient:** Don't recreate the gradient every frame. Create a separate glowing canvas off-screen once, or use a pre-rendered glowing PNG image and use `ctx.drawImage()`. 
2. **Reduce Node Count:** Consider dropping `NODE_COUNT` from 50 to 30 or 40.
3. **Hardware Acceleration Check:** Wrap the drawing logic in a check for `window.matchMedia('(prefers-reduced-motion: reduce)')`. If true, either stop the animation entirely or reduce the frame rate.
4. **Pause when out of viewport:** Use `IntersectionObserver` to pause the `requestAnimationFrame` loop when the background is not visible.

---

## 3. HIGH: Lack of Component Memoization
**Severity: 🟠 Medium-High**
**Files Affected:** `src/components/*.jsx`

### The Issue
None of the heavy child components (like `BrandBlock`, `FAQCompass`, `CountdownTimer`, `CompassNav`) are wrapped in `React.memo()`. 
Because of this, any minor state change in a parent component (like the `sysReady` loading counter in `HomePage.jsx` that ticks every 40ms) forces all these complex SVG and layout components to re-render needlessly.

### The Fix
Wrap static or purely prop-driven components in `React.memo`.

```jsx
// In src/components/CompassSVG.jsx
import React, { memo } from 'react';

const CompassSVG = ({ ...props }) => { ... }

export default memo(CompassSVG); 
```
Do this for `CompassNav`, `BrandBlock`, `CommitteeSection`, and `FAQCompass`.

---

## 4. MEDIUM: Intervals triggering rapid updates
**Severity: 🟠 Medium**
**Files Affected:** `src/pages/HomePage.jsx`

### The Issue
In `HomePage.jsx`, there is a "dopamine count-up" effect for the `sysReady` state:
```jsx
const interval = setInterval(() => {
  progress += Math.floor(Math.random() * 15) + 5;
  if (progress >= 100) { ... }
  setSysReady(progress); // Triggers re-render of entire HomePage
}, 40); 
```
Running a `setInterval` at 40ms forces the entire `HomePage` to re-render 25 times a second until it hits 100%.

### The Fix
Extract this loading ticker into its own tiny component (`<SysReadyCounter />`). This ensures that only the small text element re-renders rapidly, isolating the performance hit from the rest of the massive `HomePage`.

---

## Summary of Action Plan
To completely eliminate the lag on the website, prioritize the tasks in this order:

1. **Refactor the `onMouseMove` events** on all Page wrappers to use `useRef` and `.style.setProperty` instead of React state. (This will fix 80% of the lag immediately).
2. **Memoize heavy components** (`React.memo`) so they don't re-render unless their specific props change.
3. **Optimize Canvas Operations** in `NeuralBackground` by removing the per-frame `ctx.createRadialGradient` call.
4. **Isolate rapid state updates** (like the `sysReady` counter or `CountdownTimer`) into their own tiny, self-contained components.
