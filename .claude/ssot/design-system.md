# ZenPlanner — Zen Design System (SSOT)

> All agents MUST use ONLY these tokens. No ad-hoc colors, values, or fonts allowed.

---

## CSS Variables

```css
:root {
  /* Core Palette — Zen Garden */
  --zen-bg: #FAFAF7;               /* Warm paper */
  --zen-surface: #FFFFFF;           /* White cards */
  --zen-surface-alt: #F5F3EE;      /* Parchment */
  --zen-border: #E8E4DB;           /* Sand */
  --zen-border-hover: #D4CFC3;    /* Clay */

  /* Text */
  --zen-text: #2C2C2C;             /* Charcoal ink */
  --zen-text-secondary: #6B6560;   /* Warm gray */
  --zen-text-muted: #A8A098;       /* Faded stone */

  /* Accent Colors — Nature */
  --zen-sage: #7C9A82;             /* Primary — sage green */
  --zen-sage-light: #A8C5AE;       /* Light sage */
  --zen-earth: #B38B6D;            /* Warm earth/wood */
  --zen-sky: #89A4C7;              /* Calm sky blue */
  --zen-blossom: #D4837F;          /* Muted cherry blossom */
  --zen-gold: #C9A96E;             /* Aged gold */
  --zen-indigo: #6B7AA1;           /* Deep calm indigo */
  --zen-stone: #8B8680;            /* Neutral stone */

  /* Spirit Animal Gradients (for reveal animations) */
  --zen-gradient-lion:      linear-gradient(135deg, #C9A96E, #D4837F);
  --zen-gradient-whale:     linear-gradient(135deg, #1B3A4B, #89A4C7);
  --zen-gradient-dolphin:   linear-gradient(135deg, #89C4E1, #FFE0B2);
  --zen-gradient-owl:       linear-gradient(135deg, #2C2C54, #8E7CC3);
  --zen-gradient-fox:       linear-gradient(135deg, #B38B6D, #E8C99B);
  --zen-gradient-turtle:    linear-gradient(135deg, #5D7B6F, #A8C5AE);
  --zen-gradient-eagle:     linear-gradient(135deg, #F5F5F0, #89A4C7);
  --zen-gradient-octopus:   linear-gradient(135deg, #6B5B95, #D4BEE4);
  --zen-gradient-mountain:  linear-gradient(135deg, #6B6560, #A8A098);
  --zen-gradient-wolf:      linear-gradient(135deg, #4A4A4A, #A0522D);
  --zen-gradient-sakura:    linear-gradient(135deg, #FFD1DC, #F5E6CC);
  --zen-gradient-cat:       linear-gradient(135deg, #F5F3EE, #D4CFC3);
  --zen-gradient-crocodile: linear-gradient(135deg, #2D4739, #6B8F71);
  --zen-gradient-dove:      linear-gradient(135deg, #FEFEFE, #C9E4CA);
  --zen-gradient-butterfly: linear-gradient(135deg, #FFE0B2, #90CAF9);
  --zen-gradient-bamboo:    linear-gradient(135deg, #C8E6C9, #66BB6A);

  /* Shadows */
  --zen-shadow-sm: 0 1px 3px rgba(44, 44, 44, 0.06);
  --zen-shadow-md: 0 4px 12px rgba(44, 44, 44, 0.08);
  --zen-shadow-lg: 0 8px 24px rgba(44, 44, 44, 0.10);

  /* Borders */
  --zen-radius-sm:   6px;
  --zen-radius-md:   10px;
  --zen-radius-lg:   14px;
  --zen-radius-xl:   20px;
  --zen-radius-full: 9999px;

  /* Typography */
  --zen-font-display: 'Cormorant Garamond', 'Georgia', serif;
  --zen-font-body:    'Nunito', 'Noto Sans Thai', sans-serif;
  --zen-font-mono:    'JetBrains Mono', monospace;

  /* Mobile First — Touch & Safe Area */
  --zen-touch-target:     44px;
  --zen-bottom-nav-height: 64px;
  --zen-safe-bottom: env(safe-area-inset-bottom, 0px);
  --zen-safe-top:    env(safe-area-inset-top, 0px);
}
```

---

## Tailwind v4 Theme Mapping

```css
@theme inline {
  --color-zen-bg:             var(--zen-bg);
  --color-zen-surface:        var(--zen-surface);
  --color-zen-surface-alt:    var(--zen-surface-alt);
  --color-zen-border:         var(--zen-border);
  --color-zen-text:           var(--zen-text);
  --color-zen-text-secondary: var(--zen-text-secondary);
  --color-zen-text-muted:     var(--zen-text-muted);
  --color-zen-sage:           var(--zen-sage);
  --color-zen-sage-light:     var(--zen-sage-light);
  --color-zen-earth:          var(--zen-earth);
  --color-zen-sky:            var(--zen-sky);
  --color-zen-blossom:        var(--zen-blossom);
  --color-zen-gold:           var(--zen-gold);
  --color-zen-indigo:         var(--zen-indigo);
  --color-zen-stone:          var(--zen-stone);
}
```

---

## Zen Animations

```css
@keyframes zen-breathe {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50%       { transform: scale(1.02); opacity: 1; }
}
@keyframes zen-fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes zen-reveal {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}
@keyframes zen-ripple {
  0%   { transform: scale(0); opacity: 0.6; }
  100% { transform: scale(4); opacity: 0; }
}
@keyframes zen-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}
/* Per-animal frame animations */
@keyframes zen-pulse-gold    { 0%,100% { box-shadow: 0 0 8px #C9A96E; }  50% { box-shadow: 0 0 24px #C9A96E; } }
@keyframes zen-wave-slow     { 0%,100% { border-radius: 14px; }    50% { border-radius: 18px 10px 18px 10px; } }
@keyframes zen-bounce-playful{ 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes zen-glow-mystic   { 0%,100% { box-shadow: 0 0 16px #8E7CC3; } 50% { box-shadow: 0 0 32px #8E7CC3; } }
@keyframes zen-shift-clever  { 0%,100% { border-radius: 14px; } 33% { border-radius: 18px 10px 14px 14px; } 66% { border-radius: 14px 14px 10px 18px; } }
@keyframes zen-grow-steady   { 0% { box-shadow: 0 0 0 0 rgba(124,154,130,0); } 100% { box-shadow: 0 0 0 6px rgba(124,154,130,0); } }
@keyframes zen-soar          { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes zen-tentacle-wave { 0%,100% { border-radius: 14px; } 25% { border-radius: 20px 10px 16px 12px; } 75% { border-radius: 12px 16px 10px 20px; } }
@keyframes zen-stone-solid   { 0%,100% { box-shadow: 2px 2px 0 #6B6560; } }
@keyframes zen-howl-pulse    { 0%,100% { box-shadow: 0 0 0 0 rgba(160,82,45,0); } 50% { box-shadow: 0 0 0 8px rgba(160,82,45,0.15); } }
@keyframes zen-petal-fall    { 0%,100% { border-top-color: #FFD1DC; } 50% { border-top-color: #E8A0B1; } }
@keyframes zen-minimal-line  { 0% { border-width: 1px; } 100% { border-width: 1.5px; } }
@keyframes zen-stillness     { 0%,95% { transform: scale(1); } 96%,100% { transform: scale(1.01); } }
@keyframes zen-feather-drift { 0%,100% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } }
@keyframes zen-morph-wings   { 0%,100% { border-radius: 14px; } 50% { border-radius: 30px 10px 30px 10px; } }
@keyframes zen-sway          { 0%,100% { transform: rotate(-0.5deg); } 50% { transform: rotate(0.5deg); } }
```

---

## Utility Classes (FOUNDATION agent must implement all)

```css
.zen-card    { background: var(--zen-surface); border: 1px solid var(--zen-border); border-radius: var(--zen-radius-lg); box-shadow: var(--zen-shadow-md); }
.zen-button  { min-height: var(--zen-touch-target); border-radius: var(--zen-radius-full); font-family: var(--zen-font-body); cursor: pointer; transition: all 0.2s ease; }
.zen-button-primary  { background: var(--zen-sage); color: white; padding: 0 24px; }
.zen-button-ghost    { background: transparent; border: 1px solid var(--zen-border); color: var(--zen-text); padding: 0 24px; }
.zen-input   { min-height: var(--zen-touch-target); font-size: 16px; /* prevents iOS zoom */ border: 1px solid var(--zen-border); border-radius: var(--zen-radius-md); padding: 0 16px; font-family: var(--zen-font-body); background: var(--zen-surface); color: var(--zen-text); }
.zen-bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; height: var(--zen-bottom-nav-height); padding-bottom: var(--zen-safe-bottom); background: var(--zen-surface); border-top: 1px solid var(--zen-border); }
```

---

## Mobile First CSS Rules (Mandatory)

```
- ALL base styles target 375px viewport (mobile)
- Scale UP with min-width only:
  @media (min-width: 640px)  { /* tablet */ }
  @media (min-width: 1024px) { /* desktop */ }
- NEVER use max-width media queries
- Touch targets: min-height/min-width = var(--zen-touch-target) = 44px
- font-size on inputs: 16px minimum (prevents iOS Safari zoom)
- body gets padding-bottom: var(--zen-safe-bottom) and padding-top: var(--zen-safe-top)
```

---

## Fonts (Google Fonts — import in layout.tsx)

```
Cormorant Garamond → display/headings (400, 600, 700)
Nunito             → body/UI (400, 500, 600, 700)
Noto Sans Thai     → Thai body text (400, 500, 700)
JetBrains Mono     → code/mono (400)
```
