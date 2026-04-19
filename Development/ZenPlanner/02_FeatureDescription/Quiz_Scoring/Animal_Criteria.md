# Spirit Animal Scoring Criteria

**Source of truth:** `lib/archetype-map.ts` (`getDominantAnimal`) + `app/quiz/[mode]/page.tsx` (`calculateScores`)
**Last updated:** 2026-04-07

---

## How a User Lands on an Animal

### Step 1 — Compute the user's 6-axis profile
Discriminator-based weighted average across all 22 quiz answers (see `calculateScores`):

- **Discrimination** = stdDev of option values per axis per question. High spread → diagnostic.
- **Signal** = how far the chosen value sits from the question's median for that axis.
- **Focus boost** = 1.0 for the question's `axisFocus`, 0.5 for off-focus axes.
- `weight = discrimination × (0.4 + 0.6 × signal) × focusBoost`
- Per-axis result = `Σ(chosenValue × weight) / Σ(weight)`, clamped to `[0,100]`.

### Step 2 — Match against all 16 archetypes
For each animal, compute the **Manhattan distance** between the user's profile and the animal's reference profile:

```
distance = |userEnergy   - animalEnergy|
         + |userPlanning - animalPlanning|
         + |userSocial   - animalSocial|
         + |userDecision - animalDecision|
         + |userFocus    - animalFocus|
         + |userDrive    - animalDrive|
```

The animal with the **smallest distance** wins. Ties resolve to whichever animal appears first in the registry.

---

## The 6 Axes (0–100 scale)

| Axis | 0 (low) | 50 (mid) | 100 (high) |
|---|---|---|---|
| **energy** | Night Owl — peak late, slow morning | Flexible | Early Riser — peak early, dawn ignited |
| **planning** | Spontaneous — no structure | Adaptive | Plans Ahead — calendar-driven |
| **social** | Solo Best — drained by people | Selective | Energized by Others — recharged in groups |
| **decision** | Deliberate — slow, thorough | Balanced | Decisive — fast, intuitive |
| **focus** | Multi-Track — many parallel threads | Contextual | Deep Focus — one thing at a time |
| **drive** | Process-Focused — enjoys the work | Progress-Minded | Goal-Driven — outcome obsessed |

---

## Animal Reference Profiles & Criteria

> Profile order: `[energy, planning, social, decision, focus, drive]`

### 🦁 Lion — The Leader
**Profile:** `[85, 85, 70, 75, 80, 85]`
**You match if you are:** Early-rising, structured, sociable, decisive, deeply focused, and goal-driven. The textbook high-performer archetype.
**Distinctive marker:** Highest combined score across all axes — no weakness, no introvert traits.

### 🐋 Whale — The Deep Thinker
**Profile:** `[25, 20, 20, 25, 30, 25]`
**You match if you are:** Night owl, low-structure, highly introverted, deliberate, multi-tracking, process-focused. The mirror image of Lion.
**Distinctive marker:** Lowest scores across the board — quiet, unhurried, internal.

### 🐬 Dolphin — The Creative
**Profile:** `[75, 25, 70, 30, 25, 30]`
**You match if you are:** High energy, low planning, social, indecisive (in a playful way), distractible, process-focused. Improvises with people.
**Distinctive marker:** High energy + high social paired with low planning + low focus.

### 🦉 Owl — The Night Scholar
**Profile:** `[20, 80, 20, 75, 85, 25]`
**You match if you are:** Night owl, highly structured, introverted, decisive, deeply focused, process-driven. The studious solo planner.
**Distinctive marker:** Highest focus (85) combined with very low energy and very low social.

### 🦊 Fox — The Adaptive Strategist
**Profile:** `[55, 35, 50, 70, 40, 70]`
**You match if you are:** Mid energy, low-to-mid planning, ambivalent socially, decisive, multi-tracking, goal-driven. Improvises toward outcomes.
**Distinctive marker:** Decisive + goal-driven without being structured — wins through adaptability.

### 🐢 Turtle — The Steady Builder
**Profile:** `[30, 75, 25, 30, 65, 30]`
**You match if you are:** Low energy, structured, introverted, deliberate, fairly focused, process-focused. Slow and steady wins the race.
**Distinctive marker:** High planning + low everything else aggressive.

### 🦅 Eagle — The Visionary
**Profile:** `[80, 85, 20, 80, 85, 90]`
**You match if you are:** Early riser, highly structured, introverted, decisive, deeply focused, goal-obsessed. The solo apex performer.
**Distinctive marker:** Highest drive (90) + highest focus (85) + very low social (20). Lone-wolf top scorer.

### 🐙 Octopus — The Multi-Tasker
**Profile:** `[50, 30, 65, 35, 35, 35]`
**You match if you are:** Mid energy, low planning, social-leaning, deliberate, multi-tracking, process-focused. Juggles many things at once.
**Distinctive marker:** Mid-to-high social with low focus and low drive — the casual juggler.

### ⛰️ Mountain — The Long-Term Architect
**Profile:** `[35, 90, 20, 70, 70, 75]`
**You match if you are:** Low energy, EXTREMELY structured, introverted, decisive, focused, goal-driven. Plans years ahead.
**Distinctive marker:** Highest planning score (90) — the most structured archetype in the entire registry.

### 🐺 Wolf — The Pack Leader
**Profile:** `[75, 70, 85, 70, 65, 80]`
**You match if you are:** High energy, structured, EXTREMELY social, decisive, focused, goal-driven. Leads through people.
**Distinctive marker:** Highest social score (85) — leads from the front of the pack.

### 🌸 Sakura — The Flow Artist
**Profile:** `[50, 25, 60, 30, 25, 25]`
**You match if you are:** Mid energy, unstructured, sociable, deliberate, multi-tracking, process-focused. Lives in the moment.
**Distinctive marker:** Low planning + low drive + low focus — pure presence over outcome.

### 🐱 Cat — The Independent
**Profile:** `[50, 30, 15, 25, 30, 25]`
**You match if you are:** Mid energy, unstructured, EXTREMELY introverted, deliberate, multi-tracking, process-focused. Solo and self-directed.
**Distinctive marker:** Lowest social score (15) in the entire registry — the truest solo.

### 🐊 Crocodile — The Patient Hunter
**Profile:** `[45, 65, 20, 80, 75, 70]`
**You match if you are:** Mid energy, structured, introverted, very decisive, focused, goal-driven. Waits patiently then strikes hard.
**Distinctive marker:** Very high decision (80) paired with low social — kills alone.

### 🕊️ Dove — The Harmony Keeper
**Profile:** `[35, 30, 75, 25, 50, 25]`
**You match if you are:** Low energy, unstructured, sociable, deliberate, mid focus, process-focused. Holds groups together gently.
**Distinctive marker:** High social + low everything aggressive — the peacekeeper.

### 🦋 Butterfly — The Explorer
**Profile:** `[65, 20, 55, 25, 20, 30]`
**You match if you are:** High energy, completely unstructured, sociable, indecisive, multi-tracking, process-focused. Flits between curiosities.
**Distinctive marker:** High energy paired with the lowest planning + lowest focus combo — kinetic but scattered.

### 🎍 Bamboo — The Resilient
**Profile:** `[30, 25, 50, 30, 35, 35]`
**You match if you are:** Low energy, unstructured, neutrally social, deliberate, mid focus, mid drive. Bends without breaking.
**Distinctive marker:** All axes sit close to 30 — the most "balanced low" archetype. The default fallback for users with no strong signal.

---

## Per-Animal Distinctive Marker Cheat Sheet

| Animal | Wins When… |
|---|---|
| **Lion** | All axes score ≥75 |
| **Whale** | All axes score ≤30 |
| **Dolphin** | High `energy` + high `social` + low `planning`/`focus` |
| **Owl** | `focus ≥80` + `planning ≥75` + `social ≤30` + `energy ≤30` |
| **Fox** | `decision ≥65` + `drive ≥65` without high `planning` |
| **Turtle** | `planning ≥70` + everything else low/mid |
| **Eagle** | `drive ≥85` + `focus ≥80` + `social ≤30` |
| **Octopus** | `social ≥60` + `focus ≤40` + `drive ≤40` |
| **Mountain** | `planning ≥85` (the highest planning marker) |
| **Wolf** | `social ≥80` + `energy ≥70` + `drive ≥75` |
| **Sakura** | `planning ≤30` + `focus ≤30` + `drive ≤30` (mid-energy version of Whale) |
| **Cat** | `social ≤20` + everything else mid-to-low |
| **Crocodile** | `decision ≥75` + `focus ≥70` + `social ≤25` |
| **Dove** | `social ≥70` + `decision ≤30` + low aggressiveness everywhere |
| **Butterfly** | `energy ≥60` + `planning ≤25` + `focus ≤25` |
| **Bamboo** | All axes cluster around 25–40 (no strong signal anywhere) |

---

## Worked Example

User answers Q1=A on every question, where every "A" option scores high on its question's `axisFocus`. After the discriminator-weighted average:

```
energy: 84, planning: 84, social: 72, decision: 67, focus: 67, drive: 72
```

Manhattan distances to top candidates:
- **Lion**     `[85,85,70,75,80,85]` → `1+1+2+8+13+13 = 38`
- **Wolf**     `[75,70,85,70,65,80]` → `9+14+13+3+2+8 = 49`
- **Eagle**    `[80,85,20,80,85,90]` → `4+1+52+13+18+18 = 106`

→ **Lion wins** with distance 38.

Compare a Whale-type user with profile `[23, 24, 21, 39, 47, 31]`:
- **Whale**    `[25,20,20,25,30,25]` → `2+4+1+14+17+6 = 44`
- **Bamboo**   `[30,25,50,30,35,35]` → `7+1+29+9+12+4 = 62`
- **Cat**      `[50,30,15,25,30,25]` → `27+6+6+14+17+6 = 76`

→ **Whale wins** with distance 44.

---

## Maintenance Notes

- **Never** edit a profile without re-running the synthetic test matrix in `app/quiz/[mode]/page.tsx`. Small changes to one profile can shift which animal "wins" for a wide swath of users.
- Profiles are intentionally clustered — many sit in the 25–35 range — because most real users land in mid territory, and the closest-match algorithm needs nearby anchors to avoid everyone collapsing onto Lion or Whale.
- If a new animal is added: pick a profile that occupies an underserved corner of the 6D space (use the cheat sheet above to find gaps).
- The matcher is **deterministic**. The LLM is **not** involved in selecting an animal — it only writes the narrative insight on the reveal page after the animal has been chosen.
