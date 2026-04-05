# DS-04 -- Notioneer (Design System): Dark Mode + Accessibility Overhaul

**Phase:** Production Sprint
**Team:** Arcade
**Agent:** DS-04 Notioneer
**Status:** [x] COMPLETE
**Depends on:** None
**Blocks:** QF-07 (quiz components need dark mode vars), FP-08 (all pages need dark mode + theme toggle + language switcher)

## Scope
Complete dark mode variable system, accessibility overhaul (ARIA, reduced-motion, focus management), CSS bug fixes, and two new components (ThemeToggle, LanguageSwitcher).

## Deliverables
1. `app/globals.css` -- full dark mode CSS variable system, reduced-motion, shimmer keyframe, fix invalid CSS
2. `components/ui/zen-button.tsx` -- ARIA labels, aria-disabled, dark mode support
3. `components/ui/zen-card.tsx` -- ARIA role prop, fix double border, dark mode
4. `components/ui/zen-input.tsx` -- aria-invalid, aria-describedby, fix focus ring, dark mode
5. `components/ui/zen-nav.tsx` -- ARIA landmark, dark mode support
6. `components/ui/zen-badge.tsx` -- dark mode contrast
7. `components/ui/theme-toggle.tsx` (NEW) -- sun/moon toggle, next-themes, hydration-safe
8. `components/ui/language-switcher.tsx` (NEW) -- EN/TH/ZH switcher, cookie-based

## Acceptance Criteria
- [x] Every CSS variable in :root has a dark override in html[data-theme="dark"]
- [x] @media (prefers-color-scheme: dark) respects system preference unless user overrode
- [x] @media (prefers-reduced-motion: reduce) kills all animations
- [x] Invalid `ring:` CSS fixed to `outline:`
- [x] animate-shimmer keyframe defined
- [x] All zen-* components have proper ARIA attributes
- [x] ThemeToggle does not flash on hydration (mounted check)
- [x] LanguageSwitcher sets NEXT_LOCALE cookie and refreshes
- [x] Minimum 44px touch targets maintained
- [x] Dark mode colors are thoughtfully designed (not just inverted)

## Boundaries
- Do NOT touch files outside ownership list
- Do NOT add external icon libraries
- Do NOT modify Tailwind config
