# Events Page Performance & Lag Audit Report (`lagevent.md`)

This document analyzes the primary performance bottlenecks, GPU/CPU bottlenecks, and layout thrashing issues causing lag on the Genesis Events page (`/events`).

---

## 1. Canvas Real-Time Gaussian Blur (`shadowBlur`)
* **Location:** `src/components/events/ProceduralEventVisual.jsx`
* **Severity:** CRITICAL (Primary GPU/CPU Bottleneck)
* **Issue:** 
  The procedural canvas graphic generator uses `ctx.shadowBlur` (values from `4px` to `16px`) and `ctx.shadowColor` extensively across all 10 event animation modes inside a 60 FPS `requestAnimationFrame` loop.
* **Why it lags:**
  In HTML5 2D Canvas, setting `shadowBlur` forces the browser engine to render a software or GPU Gaussian blur pass for **every single stroke or fill call**. Because this is executed dozens of times per frame in an infinite loop, it creates immense GPU fill-rate pressure and frame rendering delays.

---

## 2. Full-Screen Backdrop Filter & Real-Time Masking (`mouse-blur-overlay`)
* **Location:** `src/pages/EventsPage.jsx` & `src/pages/HomePage.css`
* **Severity:** CRITICAL (Compositor & Layer Thrashing)
* **Issue:** 
  `EventsPage.jsx` renders `<div className="mouse-blur-overlay" />`, which applies `backdrop-filter: blur(8px)` across the entire 100vw x 100vh screen with a radial mask linked to `--mouse-x` and `--mouse-y`.
* **Why it lags:**
  Every time the user moves their mouse, `--mouse-x` and `--mouse-y` are updated. The browser compositor is forced to re-rasterize the entire DOM tree underneath, apply an 8px blur shader pass across the viewport, and re-composite the masked area. On high-resolution displays (1080p / 1440p / 4K), this alone can freeze low and mid-tier GPUs.

---

## 3. SVG Filter Blur on Continuous Stroke Animations (`circuitGlow`)
* **Location:** `src/components/events/CircuitBackground.jsx` & `CircuitBackground.css`
* **Severity:** HIGH (Main Thread & CPU Bottleneck)
* **Issue:** 
  The circuit board background uses an SVG `<filter id="circuitGlow">` containing `<feGaussianBlur stdDeviation="3" />`. This filter is attached to a group of 5 pulsing current paths (`.pulse-path`) running an infinite 3.5s CSS keyframe animation (`stroke-dashoffset`).
* **Why it lags:**
  Unlike hardware-accelerated CSS transforms, SVG `<feGaussianBlur>` filters are often computed on the CPU main thread in browser layout engines. Redrawing animated blurred SVG paths every frame puts continuous computational load on the CPU.

---

## 4. Unthrottled Mouse Move Listener
* **Location:** `src/pages/EventsPage.jsx`
* **Severity:** MEDIUM (Main Thread Style Recalculations)
* **Issue:** 
  The `handleMouseMove` callback attached to the main page wrapper updates CSS variables directly on every raw `mousemove` event without throttling or batching via `requestAnimationFrame`.
* **Why it lags:**
  Native `mousemove` events can fire 60–120+ times per second depending on mouse polling rates. Executing `wrapperRef.current.style.setProperty()` on every event forces layout style recalculations at an unnecessary rate.

---

## 5. Heavy Layer Promotion from CSS `filter: drop-shadow()`
* **Location:** `src/components/events/Reel.css` & `CircuitBackground.css`
* **Severity:** MEDIUM (Memory & Stacking Context Overhead)
* **Issue:** 
  CSS `filter: drop-shadow(...)` is used on film reel SVG rim elements, hover states, and active nodes.
* **Why it lags:**
  Applying CSS `filter` on individual SVG sub-elements forces the browser to promote each node into its own separate GPU compositor layer. With 10 interactive reel nodes and circuit traces, the browser creates multiple extra compositing layers, multiplying memory usage and layer blending times.

---

## 6. Unpaused Background Canvas Animation Loop
* **Location:** `src/components/events/ProceduralEventVisual.jsx`
* **Severity:** MEDIUM (Resource Waste)
* **Issue:** 
  The canvas animation loop runs continuously via `requestAnimationFrame` regardless of whether the browser tab is focused, active, or if the canvas is off-screen.
* **Why it lags:**
  Even when the user switches tabs or scrolls past the canvas, the animation loop keeps consuming CPU/GPU resources in the background.

---

## 7. Permanent Full-Viewport Overlay Layer (`scanline-settle-overlay`)
* **Location:** `src/components/events/ProjectorBeamWipe.css`
* **Severity:** LOW–MEDIUM (Compositor Layer Overhead)
* **Issue:** 
  A full-viewport `position: fixed` element with a repeating 4px linear gradient (`.scanline-settle-overlay`) sits over the event details overlay.
* **Why it lags:**
  It forces an additional full-screen texture layer that must be blended over all content during scrolling and animations.
