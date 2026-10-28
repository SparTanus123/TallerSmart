# TallerSmart Design System

This is the persisted source of truth for TallerSmart screens. Follow it when creating or revising pages; add page-specific exceptions under `design-system/tallersmart/pages/` only when a screen needs a documented variation.

**Product:** Work order registration, processing, audit, report review, and vehicle handoff for an automotive workshop.
**Style:** Modern Industrial Bento — mobile-first modular cards, clear grouping, restrained Material-like elevation, rounded corners, and crisp technical details.
**Dials:** Variance 4/10 (balanced and consistent) · Motion 2/10 (subtle) · Density 7/10 (compact operational dashboard, with comfortable touch spacing).
**Implementation:** Existing Next.js, React, TypeScript/JavaScript, and CSS application. The requested Python mention is not a reason to introduce a second UI stack.

## Product and workflow principles

- Make the order journey visible: reception → diagnosis → execution → report review → delivery. Always show the current stage, next responsible role, and pending customer approval where applicable.
- The system records evidence, work, approvals, and audit history. A qualified human owns mechanical diagnosis and a human must review and approve the report before delivery.
- Label generated report content as a template or draft. AI may help organize information, but must not appear to diagnose a vehicle or approve a report.
- Treat persisted business records as API-owned. Do not use browser storage as work-order persistence.
- Prioritize plate, vehicle, order number, status, assigned technician, elapsed time, and next action. Put secondary information behind a clear detail view.
- Use concise Spanish labels and real status text; color is supplementary and never the only status cue.

## Visual tokens

| Role | Token | Value |
|---|---|---|
| Main background | `--color-canvas` | `#F1F3F5` |
| Secondary background | `--color-lane` | `#E8ECF0` |
| Card | `--color-surface` | `#FFFFFF` |
| Raised card / hover | `--color-surface-2` | `#F7F9FB` |
| Divider | `--color-line` | `#DCE2E8` |
| Strong divider | `--color-line-strong` | `#C6CFD8` |
| Main text | `--color-fg` | `#17212B` |
| Secondary text | `--color-fg-2` | `#3E4B59` |
| Muted text | `--color-fg-3` | `#5E6B78` |
| Primary action / focus | `--color-brand-500` | `#F3C744` |
| Primary action hover | `--color-brand-600` | `#E5B92E` |
| Automotive blue | `--color-auto-blue` | `#176B9B` |
| Success | `--color-ok` | `#167044` |
| Attention | `--color-warn` | `#8B5B00` |
| Error | `--color-danger` | `#B42318` |

Use a light ash canvas, white Bento cards, and soft grey dividers throughout the application, including navigation. Yellow is reserved for the main action, keyboard focus, and high-priority highlights. Automotive blue is a secondary accent for navigation and informational states. Keep semantic success, warning, and error colors distinct. Maintain WCAG AA contrast, especially for muted labels and colored status badges.

## Typography

- **Headings:** Montserrat, 600–800; compact, confident, and readable.
- **Body, controls, and status descriptions:** Inter, 400–700; 16px minimum for mobile body copy and form fields.
- **Identifiers and numeric telemetry:** DM Mono, tabular numerals; use sparingly for order IDs, plates, time, and codes.
- Use a clear scale around 12 / 14 / 16 / 20 / 24 / 32px. Do not use uppercase microtext for essential instructions.

## Layout and components

- Design for 375px first, then 768px, 1024px, and 1440px. Avoid horizontal page scroll and keep the primary action reachable on touch screens.
- Use a 4px spacing base with 8px touch-target separation. Keep interactive targets at least 44px high on mobile.
- Compose dashboards from modular Bento cards. Group related metrics and work queues; use one primary action per screen and keep tables scrollable or convert them to stacked cards on narrow screens.
- Cards use `--color-surface`, 12–16px corners, a fine border, and soft grey elevation. Reserve the strongest elevation for sheets and dialogs.
- Inputs have persistent labels, visible focus, clear error text, and a minimum 44px control height on touch screens.
- Use the existing SVG icon set. Never use emoji as interface icons. Every icon-only control needs an accessible name.
- Preserve keyboard navigation, visible focus, reduced-motion preferences, and status text that does not rely on color alone.

## Motion

Keep motion low and functional: 120–180ms hover, press, and state transitions; 180–240ms drawers and dialogs. Avoid continuous decorative motion and scroll-reveal dependencies in operational screens. Respect `prefers-reduced-motion`.

## Acceptance checklist

- [ ] Reception, diagnosis, execution, human report review, approval, and delivery stages are easy to distinguish.
- [ ] Mechanical diagnosis and report approval remain human responsibilities.
- [ ] Light ash surfaces, high-contrast text, yellow primary actions, and blue secondary accents are consistent.
- [ ] Montserrat headings and Inter forms/body copy are applied consistently.
- [ ] Mobile layout fits 375px without page-level horizontal scrolling; primary touch targets are comfortable.
- [ ] Focus, keyboard use, status labels, and reduced motion are supported.
