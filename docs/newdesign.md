---
name: Technical Editorial System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#58413f'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#8c716e'
  outline-variant: '#e0bfbc'
  surface-tint: '#ac322e'
  primary: '#690008'
  on-primary: '#ffffff'
  primary-container: '#8b1a1a'
  on-primary-container: '#ff9a91'
  inverse-primary: '#ffb3ac'
  secondary: '#b12a2e'
  on-secondary: '#ffffff'
  secondary-container: '#fd625f'
  on-secondary-container: '#65000b'
  tertiary: '#353030'
  on-tertiary: '#ffffff'
  tertiary-container: '#4b4646'
  on-tertiary-container: '#bcb4b3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb3ac'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#8a1a1a'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ae'
  on-secondary-fixed: '#410005'
  on-secondary-fixed-variant: '#8f0d19'
  tertiary-fixed: '#eae0e0'
  tertiary-fixed-dim: '#cdc4c4'
  on-tertiary-fixed: '#1f1b1b'
  on-tertiary-fixed-variant: '#4b4545'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Orbit
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Orbit
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Orbit
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: BJCree
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: BJCree
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: 'EB Garamond'
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  display-lg-mobile:
    fontFamily: Orbit
    fontSize: 36px
    fontWeight: '400'
    lineHeight: '1.1'
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

This design system is built on the intersection of high-end engineering and classical editorial design. It targets a sophisticated technical audience that values precision, historical depth, and functional clarity over fleeting digital trends. 

The aesthetic is **Editorial Minimalism**. It rejects the soft, glowing tropes of modern SaaS in favor of a "physical" presence. The interface should feel like a printed technical manual or a premium broadsheet journal. 

Key attributes:
- **Authoritative:** Uses historical serif typography to command attention and imply legacy.
- **Grounded:** Utilizes a heavy, high-contrast palette of deep reds and structural blacks.
- **Tactile:** Relies on sharp edges, subtle paper-like textures, and hair-line strokes instead of blurs or shadows.
- **Human-Centric:** Focuses on legibility and information density that respects the user's cognitive load.

## Colors

The palette is derived from the provided image, emphasizing a sophisticated, high-contrast relationship between deep oxblood red and monochromatic neutrals.

- **Primary (Oxblood):** Used for key brand moments, critical calls to action, and section headings. It represents the "ink" of a premium journal.
- **Secondary (Cinnabar):** Used for interactive states, alerts, or to draw the eye to specific data points within a technical context.
- **Neutral / Background:** We move away from pure white to a "Paper" off-white (#F9F9F9) to reduce eye strain and reinforce the editorial feel.
- **Black (Ink):** Pure #1A1616 is used for body text and structural borders to maintain maximum legibility and a crisp, engineering-grade finish.

## Typography

Typography is the primary vehicle for the brand's personality. We employ a three-tier system:

<style>
@import url('https://fonts.googleapis.com/css2?family=Orbit&display=swap');
@import url('https://fonts.googleapis.com/css2?family=BJCree:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap');
</style>

1.  **Brand/Display (Headline):** `Orbit` is used for large headings and brand-defining statements.
2.  **Functional/Body:** `BJCree` ensures long-form technical content is easy to digest.
3.  **Technical/Label:** `EB Garamond` is used for metadata, labels, and technical values.

All headings should utilize optical kerning and tight line-heights to maintain a cohesive visual block.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy inspired by technical blueprints and newspaper columns. 

- **Grid:** A 12-column grid on desktop with generous 24px gutters.
- **Rhythm:** All vertical spacing is based on a 4px baseline unit. 
- **Margins:** Desktop layouts utilize significant horizontal margins (64px+) to create a "contained" feel, similar to a page in a book.
- **Density:** High information density is encouraged, provided it is partitioned by clear structural lines rather than empty space alone. 
- **Borders:** Use 1px solid borders (`#1A1616` at 10-20% opacity) to define sections and "table-like" structures.

## Elevation & Depth

This system avoids shadows and blurs entirely. Depth is communicated through:

- **Tonal Layering:** Using different shades of neutral (#F9F9F9 vs #E5E5E5) to separate the background from the foreground content.
- **High-Contrast Outlines:** Interactive elements or containers are defined by sharp, 1px or 2px solid borders.
- **Content Stacking:** "Overlays" do not float with shadows; instead, they appear as solid blocks with a heavy border, often slightly offset to create a mechanical, stacked paper effect.
- **The "Punch-Out" Effect:** Active states may use a solid black background with white text, effectively "cutting through" the page.

## Shapes

The shape language is strictly **Sharp (0)**. 

Every UI element—buttons, input fields, cards, and containers—must have 90-degree corners. This reinforces the engineering aesthetic, suggesting precision, calculation, and a departure from the "friendly" rounded corners of consumer-grade social apps. 

Avoid circles where possible; even "status dots" can be rendered as small squares to maintain the system's geometric integrity.

## Components

**Buttons**
- Primary: Solid Oxblood (#8B1A1A) background, white text, sharp corners.
- Secondary: Solid Paper (#F9F9F9) background, 1px Black (#1A1616) border, sharp corners.
- Interactive: On hover, buttons should shift to a solid Black (#1A1616) with no transition delay, mimicking a physical switch.

**Input Fields**
- Underline style or full 1px border.
- Use `EB Garamond` for input text and `BJCree` for labels.
- Labels are always positioned above the field, never as placeholders.

**Cards & Containers**
- No shadows.
- Use a 1px solid border.
- Header sections of cards should be separated by a horizontal 1px line.

**Lists & Data**
- Use horizontal rules to separate list items.
- Incorporate monospaced numbers for lists to emphasize the "technical log" feel.

**Chips & Tags**
- Small, rectangular boxes with `label-caps` typography. 
- High contrast: black background with white text or vice-versa.