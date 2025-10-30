# Baseline UI Audit (30/10/2025)

## Current Pain Points
- Visual noise dominates content: the full-viewport purple–magenta gradient (`body` background plus `::before`/`::after` overlays in `assets/css/main.css`) reduces contrast against text and code, especially on lighter sections.
- Excessive glassmorphism: repeated translucent cards (`backdrop-filter: blur(20px)`, heavy box shadows) create halation and undermine hierarchy between hero, post cards, and article panels.
- Animation overload: scroll reveal observers, persistent background pulses, and hero particle trails from `assets/js/site.js` compete with copy and risk motion sickness without respecting `prefers-reduced-motion`.
- Typographic inconsistency: headings use extreme gradients and large letter-spacing, whilst body copy (1.05rem) is comparatively cramped, yielding poor rhythm for long-form technical prose.
- Navigation affordance: mobile menu relies on `max-height` transitions without explicit focus management or ARIA labelling beyond `aria-expanded`, making keyboard traversal brittle.
- Code readability: gradient code backgrounds and `Fira Code` captions inherit saturated borders, diminishing legibility for multi-line snippets and tabled output.
- Layout cohesion: hero, posts grid, and projects grid reuse disparate spacing scales (16px–40px) with no consistent vertical rhythm, leading to cramped gutters on 768px breakpoints.
- Performance footprint: layered backgrounds, particle DOM churn, and unthrottled scroll listeners increase paint work and battery drain on lower-powered devices.

## Desired Aesthetic
- Adopt a calm, high-contrast neutral canvas (off-white light mode, slate dark mode) with accent colours reserved for interactive states and headings.
- Establish a rigorous spacing system (4px base, 12/16/24/32 increments) underpinning grids, vertical rhythm, and modular cards.
- Prioritise typographic clarity: 1.125rem base copy, 64/56/40/32px display ramp, consistent leading (1.6–1.7), and restrained gradient usage.
- Emphasise technical credibility: code blocks with monochromatic themes, subtle inset borders, optional filename ribbons, and generous line height.
- Deliver responsive layouts that preserve comfortable content widths (≈68ch) whilst scaling down gracefully to 320px without overflowing cards or navigation.
- Integrate accessibility-first interactions: respect reduced-motion preference, ensure focus states are visible, and provide keyboard-friendly navigation patterns.

## Reference Inspiration
- [Vercel Engineering Blog](https://vercel.com/blog): disciplined typography, monochrome palette, and confident hero composition for technical storytelling.
- [Linear Method](https://linear.app/method): immaculate spacing scale, muted neutrals, and elegant accent usage that elevates long-form product narratives.
- [Stripe Dev Docs](https://stripe.com/docs): exemplary code presentation, minimal motion, and accessible navigation with robust dark-mode handling.

## Constraints & Opportunities
- Minimal Mistakes still drives structural templates; custom layouts must avoid duplicated includes and respect Liquid defaults for pagination and meta data.
- Dark mode should remain auto-responsive but incorporate an explicit toggle for demos, ensuring deterministic screenshots.
- Existing gradient-heavy brand colours can survive as accent layers (links, tags) once toned down into a secondary role.

