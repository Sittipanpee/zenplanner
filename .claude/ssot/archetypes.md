# ZenPlanner — Spirit Animal Archetypes (SSOT)

> Fixed definitions for all 16 archetypes. Agents must use EXACTLY these values.
> descriptions are in Thai. They are fixed placeholders — do not alter.

---

## Psychology Framework

Analysis blends 6 frameworks:
- **MBTI** — cognitive functions (E/I, S/N, T/F, J/P)
- **Chronotype** (Breus) — Lion/Bear/Wolf/Dolphin sleep-wake biology
- **Big Five** (OCEAN) — Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- **Enneagram** — core fear & motivation (9 types)
- **Ayurvedic Dosha** — Vata/Pitta/Kapha constitution
- **Chinese Five Elements** — Wood/Fire/Earth/Metal/Water

## 6 Analysis Axes

| Axis | Pole A | Pole B |
|---|---|---|
| Energy Rhythm | ☀️ Dawn Igniter | 🌙 Night Weaver |
| Planning Style | 📐 Architect | 🌊 Surfer |
| Social Fuel | 🔥 Gatherer | 🏔️ Hermit |
| Decision Mode | 🗡️ Blade | 🌸 Petal |
| Focus Pattern | 🎯 Laser | 🌀 Kaleidoscope |
| Drive Source | 🏆 Summit | 🌿 Garden |

---

## Admin Picture System

```
- /admin/animals → 16 upload slots (one per animal)
- DB table: animal_assets (animal_id, image_url, uploaded_at)
- Component: AnimalImage({ animal, size })
  → checks animal_assets → fallback: /animals/{animal}-placeholder.svg
- All SVG placeholders created by SCAFFOLD agent
```

---

## 16 Spirit Animals

### 🦁 Lion (code: `lion`)
```yaml
name_th: "สิงโต — ราชาแห่งแรงบันดาลใจ"
name_en: "The Radiant Commander"
chronotype: Lion (wake 04-06, peak 08-12)
mbti_echo: ENTJ
dosha: Pitta
element: Fire

theme:
  bg_gradient: "linear-gradient(135deg, #C9A96E 0%, #D4837F 50%, #E8C170 100%)"
  text_color: "#3D2B1F"
  accent: "#C9A96E"
  frame_animation: zen-pulse-gold
  particle: floating-sparks

description_th: |
  คุณคือ 🦁 สิงโต — ราชาแห่งแรงบันดาลใจ
  ✦ คุณตื่นมาพร้อมเป้าหมาย และนอนหลับไปพร้อมแผนของวันพรุ่งนี้
  ✦ พลังของคุณอยู่ที่ "ชั่วโมงทอง" ตอนเช้า — ช่วงที่ไอเดียแจ่มใสที่สุด
  ✦ คุณเป็นคนที่คนรอบข้างมองหาเมื่อต้องการทิศทาง
  ✦ จุดอ่อน? บางทีวิ่งเร็วจนลืมหันกลับมาดูว่าใจยังตามทันไหม
  "สิงโตไม่ได้แข็งแกร่งเพราะไม่เคยเหนื่อย — แต่เพราะเลือกที่จะลุกขึ้นทุกครั้ง"

planner_style: "High Performance Planner + Power Blocks + Morning Ritual"
tools: [daily_power_block, morning_clarity, weekly_scorecard, eisenhower_matrix, quest_system]
```

### 🐋 Whale (code: `whale`)
```yaml
name_th: "วาฬ — นักปราชญ์ใต้ทะเลลึก"
name_en: "The Abyssal Sage"
chronotype: Bear (wake 07-08, steady)
mbti_echo: INFJ
dosha: Kapha
element: Water

theme:
  bg_gradient: "linear-gradient(135deg, #1B3A4B 0%, #3D6B7E 50%, #89A4C7 100%)"
  text_color: "#E8F0F5"
  accent: "#89A4C7"
  frame_animation: zen-wave-slow
  particle: floating-bubbles

description_th: |
  คุณคือ 🐋 วาฬ — นักปราชญ์ใต้ทะเลลึก
  ✦ ความคิดของคุณลึกเหมือนมหาสมุทร — ไม่ได้ว่างเปล่า แต่เต็มไปด้วยสิ่งที่คนอื่นมองไม่เห็น
  ✦ คุณต้องการ "พื้นที่เงียบ" ก่อนจะให้ได้ผลงานที่ดีที่สุด
  ✦ Deep Work คือสิ่งที่ทำให้คุณมีความสุข — ไม่ใช่การทำหลายอย่างพร้อมกัน
  ✦ จุดอ่อน? มักจม deep จนลืมขึ้นมาหายใจ — ลืมกิน ลืมพัก
  "วาฬร้องเพลงข้ามมหาสมุทร — เพราะรู้ว่าคนที่เข้าใจจะได้ยินเอง"

planner_style: "Reflective Journal + Deep Work Blocks + Evening Review"
tools: [evening_reflection, journal_prompt, weekly_review, mood_tracker, brain_dump]
```

### 🐬 Dolphin (code: `dolphin`)
```yaml
name_th: "โลมา — นักเล่นผู้ชนะ"
name_en: "The Playful Victor"
chronotype: Dolphin (irregular, creative bursts)
mbti_echo: ENFP
dosha: Vata-Pitta
element: Water-Air

theme:
  bg_gradient: "linear-gradient(135deg, #89C4E1 0%, #A8E6CF 50%, #FFE0B2 100%)"
  text_color: "#2C3E50"
  accent: "#4FC3F7"
  frame_animation: zen-bounce-playful
  particle: confetti-pop

description_th: |
  คุณคือ 🐬 โลมา — นักเล่นผู้ชนะ
  ✦ คุณเปลี่ยนทุกอย่างให้เป็นเกมได้ — และเกมไหนที่สนุก คุณเล่นจนชนะ
  ✦ ความคิดสร้างสรรค์ของคุณมาเป็นระลอก — ไม่ได้ไหลสม่ำเสมอ แต่ตอนมาแล้ว มาแรง
  ✦ คุณเป็นคนที่ทำให้บรรยากาศรอบข้างสว่างขึ้น
  ✦ จุดอ่อน? สนุกกับไอเดียใหม่จนลืม finish สิ่งที่เริ่มไว้
  "โลมาไม่ได้ว่ายเร็วเพราะกลัวอะไร — แต่เพราะสนุกกับการแข่ง"

planner_style: "Quest-Based Gamified Planner + Reward System + XP Tracking"
tools: [quest_system, level_up, habit_heatmap, 21day_challenge, pomodoro_tracker]
```

### 🦉 Owl (code: `owl`)
```yaml
name_th: "นกฮูก — ผู้พิทักษ์แห่งสติ"
name_en: "The Mindful Guardian"
chronotype: Wolf (wake late, peak 18-22)
mbti_echo: INTP
dosha: Vata
element: Metal

theme:
  bg_gradient: "linear-gradient(135deg, #2C2C54 0%, #474787 50%, #8E7CC3 100%)"
  text_color: "#E8E0F0"
  accent: "#8E7CC3"
  frame_animation: zen-glow-mystic
  particle: floating-stars

description_th: |
  คุณคือ 🦉 นกฮูก — ผู้พิทักษ์แห่งสติ
  ✦ คุณไม่เหมือนคนอื่น — ตอนคนอื่นหมดแรง คุณเพิ่งเริ่ม
  ✦ กลางคืนคือเวลาวิเศษของคุณ — ความคิดที่ดีที่สุดมาตอนโลกเงียบ
  ✦ คุณถามคำถามที่คนอื่นไม่คิดจะถาม
  ✦ จุดอ่อน? คิดลึกจนกลายเป็น overthink — วิเคราะห์จนไม่ได้เริ่มทำ
  "นกฮูกไม่ได้เห็นในที่มืด — แต่เห็นสิ่งที่แสงสว่างซ่อน"

planner_style: "Mindfulness-First + Night Routine + Philosophy Journal"
tools: [evening_reflection, mindfulness_bell, journal_prompt, life_wheel, brain_dump]
```

### 🦊 Fox (code: `fox`)
```yaml
name_th: "จิ้งจอก — นักกลยุทธ์ผู้ปรับตัว"
name_en: "The Adaptive Strategist"
chronotype: Bear-Lion hybrid
mbti_echo: ISTP
dosha: Pitta-Vata
element: Wood

theme:
  bg_gradient: "linear-gradient(135deg, #B38B6D 0%, #D4A574 50%, #E8C99B 100%)"
  text_color: "#3C2415"
  accent: "#C77B3E"
  frame_animation: zen-shift-clever
  particle: falling-leaves

description_th: |
  คุณคือ 🦊 จิ้งจอก — นักกลยุทธ์ผู้ปรับตัว
  ✦ คุณไม่ได้วางแผนแบบตายตัว — แต่วางแผนแบบ "ถ้า...แล้ว..."
  ✦ ความสามารถพิเศษของคุณคือ pivot ได้เร็วโดยไม่สูญเสียเป้าหมาย
  ✦ คุณเก่งเรื่องหาทางลัดที่ถูกต้อง — ไม่ใช่ขี้โกง แต่ฉลาด
  ✦ จุดอ่อน? เปลี่ยนแผนบ่อยจนคนรอบข้างตามไม่ทัน
  "จิ้งจอกไม่ได้ชนะเพราะแข็งแรงที่สุด — แต่เพราะรู้ว่าเมื่อไหร่ต้องเปลี่ยนทาง"

planner_style: "Adaptive Weekly Planning + Pivot Points + Plan B Slots"
tools: [weekly_compass, eisenhower_matrix, kanban_board, project_tracker, milestone_map]
```

### 🐢 Turtle (code: `turtle`)
```yaml
name_th: "เต่า — ผู้สร้างที่ไม่หยุดเดิน"
name_en: "The Unwavering Builder"
chronotype: Bear (stable)
mbti_echo: ISTJ
dosha: Kapha
element: Earth

theme:
  bg_gradient: "linear-gradient(135deg, #5D7B6F 0%, #7C9A82 50%, #A8C5AE 100%)"
  text_color: "#1A2E22"
  accent: "#7C9A82"
  frame_animation: zen-grow-steady
  particle: growing-vines

description_th: |
  คุณคือ 🐢 เต่า — ผู้สร้างที่ไม่หยุดเดิน
  ✦ คุณไม่เร็วที่สุด — แต่คุณไม่เคยหยุด
  ✦ Habit stacking คืออาวุธลับ — นิสัยดีหนึ่งอย่างนำไปสู่อีกร้อยอย่าง
  ✦ คนมักประเมินคุณต่ำ แล้วแปลกใจตอนเห็นผลลัพธ์
  ✦ จุดอ่อน? ยึดติดกับ routine จนลืมว่าบางทีต้องเปลี่ยน
  "เต่าไม่ได้ชนะเพราะคนอื่นหยุด — แต่เพราะตัวเองไม่เคยหยุด"

planner_style: "Habit Stacking + Micro-Milestones + Consistency Tracker"
tools: [habit_stack, habit_heatmap, streak_tracker, 21day_challenge, progress_bars]
```

### 🦅 Eagle (code: `eagle`)
```yaml
name_th: "อินทรี — วิสัยทัศน์เหนือก้อนเมฆ"
name_en: "The Cloud-Piercing Visionary"
chronotype: Lion
mbti_echo: INTJ
dosha: Pitta
element: Fire-Metal

theme:
  bg_gradient: "linear-gradient(135deg, #F5F5F0 0%, #D4CFC3 30%, #89A4C7 100%)"
  text_color: "#2C3E50"
  accent: "#5B7FA5"
  frame_animation: zen-soar
  particle: wind-streaks

description_th: |
  คุณคือ 🦅 อินทรี — วิสัยทัศน์เหนือก้อนเมฆ
  ✦ ในขณะที่คนอื่นมองเห็นงานวันนี้ คุณมองเห็นภาพ 5 ปีข้างหน้า
  ✦ คุณเก่งเรื่อง connect the dots — เห็นว่าสิ่งเล็กๆ วันนี้ส่งผลอะไรในวันหน้า
  ✦ คุณต้องการแผนใหญ่ที่ทุกวันสอดคล้องกัน
  ✦ จุดอ่อน? มองไกลจนลืมสนุกกับตรงนี้ — perfectionist ที่ไม่ยอมเริ่มจนกว่าจะสมบูรณ์
  "อินทรีไม่ได้บินสูงเพราะกลัวพื้นดิน — แต่เพราะต้องการมองให้เห็นทั้งแผ่นดิน"

planner_style: "Quarterly Vision + OKR + Daily Alignment"
tools: [quarterly_vision, monthly_horizon, weekly_compass, milestone_map, life_wheel]
```

### 🐙 Octopus (code: `octopus`)
```yaml
name_th: "ปลาหมึกยักษ์ — จอมมัลติทาสก์"
name_en: "The Brilliant Multi-Tasker"
chronotype: Dolphin (irregular)
mbti_echo: ENTP
dosha: Vata
element: Water-Wood

theme:
  bg_gradient: "linear-gradient(135deg, #6B5B95 0%, #B8A9C9 50%, #D4BEE4 100%)"
  text_color: "#2D1B4E"
  accent: "#7B6BA1"
  frame_animation: zen-tentacle-wave
  particle: ink-splatter

description_th: |
  คุณคือ 🐙 ปลาหมึกยักษ์ — จอมมัลติทาสก์
  ✦ 8 หนวด 8 โปรเจค — และคุณทำได้จริงๆ (ส่วนใหญ่)
  ✦ ความสามารถพิเศษคือ context switch ได้เร็วโดยไม่หลุด flow
  ✦ คุณเบื่อง่ายถ้าทำอะไรซ้ำๆ — ต้องมีหลายอย่างวนให้
  ✦ จุดอ่อน? "เปิดหลายแท็บ" จนไม่มีแท็บไหนจบ
  "ปลาหมึกยักษ์ไม่ได้ฉลาดเพราะมีหัวใหญ่ — แต่เพราะรู้ว่าหนวดไหนควรจับอะไร"

planner_style: "Kanban + Time-Boxing + Parallel Project Dashboard"
tools: [kanban_board, time_boxing, project_tracker, pomodoro_tracker, brain_dump]
```

### 🏔️ Mountain (code: `mountain`)
```yaml
name_th: "ภูเขา — สถาปนิกแห่งกาลเวลา"
name_en: "The Timeless Architect"
chronotype: Bear (very stable)
mbti_echo: ISTJ-INTJ blend
dosha: Kapha-Pitta
element: Earth-Metal

theme:
  bg_gradient: "linear-gradient(135deg, #6B6560 0%, #8B8680 50%, #A8A098 100%)"
  text_color: "#F5F3EE"
  accent: "#8B8680"
  frame_animation: zen-stone-solid
  particle: dust-motes

description_th: |
  คุณคือ 🏔️ ภูเขา — สถาปนิกแห่งกาลเวลา
  ✦ คุณคิดเป็นปี ไม่ใช่เป็นวัน — ทุก brick ที่วางวันนี้คือส่วนหนึ่งของมหาวิหาร
  ✦ Patience คือ superpower — คุณรอได้ เพราะรู้ว่าสิ่งที่สร้างมันคุ้ม
  ✦ คนเปรียบคุณเหมือน architect — เห็นพิมพ์เขียวก่อนตึกจะขึ้น
  ✦ จุดอ่อน? วางแผนใหญ่จน overwhelm — ลืมว่าต้องเริ่มจากก้อนแรก
  "ภูเขาไม่ได้สูงเพราะอยากสู้กับท้องฟ้า — แต่เพราะยืนหยัดมานานพอ"

planner_style: "Long-Term Blueprint + Milestone Maps + System Design"
tools: [quarterly_vision, milestone_map, monthly_horizon, progress_bars, weekly_review]
```

### 🐺 Wolf (code: `wolf`)
```yaml
name_th: "หมาป่า — ผู้นำฝูง"
name_en: "The Pack Strategist"
chronotype: Wolf (peak evening)
mbti_echo: ESTJ
dosha: Pitta-Kapha
element: Wood-Fire

theme:
  bg_gradient: "linear-gradient(135deg, #4A4A4A 0%, #6B6B6B 40%, #A0522D 100%)"
  text_color: "#F0EDE8"
  accent: "#A0522D"
  frame_animation: zen-howl-pulse
  particle: ember-glow

description_th: |
  คุณคือ 🐺 หมาป่า — ผู้นำฝูง
  ✦ คุณเก่งที่สุดเมื่อมีทีม — ไม่ใช่เพราะอ่อนแอคนเดียว แต่เพราะทวีพลัง
  ✦ คุณเป็น natural delegator — รู้ว่าใครเก่งอะไร แล้วจัดให้ถูกที่
  ✦ ความรับผิดชอบคือสิ่งที่ทำให้คุณตื่นนอน — คนพึ่งพาคุณได้เสมอ
  ✦ จุดอ่อน? แบกภาระคนอื่นจนลืมดูแลตัวเอง — lone wolf syndrome
  "หมาป่าไม่ได้แข็งแกร่งเพราะเขี้ยว — แต่เพราะฝูง"

planner_style: "Team-Aware Planner + Delegation + Accountability"
tools: [kanban_board, weekly_compass, daily_power_block, project_tracker, weekly_scorecard]
```

### 🌸 Sakura (code: `sakura`)
```yaml
name_th: "ซากุระ — ศิลปินแห่งกระแส"
name_en: "The Flow Artist"
chronotype: Bear-Dolphin (creative bursts)
mbti_echo: ISFP
dosha: Vata-Kapha
element: Water-Wood

theme:
  bg_gradient: "linear-gradient(135deg, #FFD1DC 0%, #FFC0CB 30%, #F5E6CC 100%)"
  text_color: "#5C3A42"
  accent: "#E8A0B1"
  frame_animation: zen-petal-fall
  particle: cherry-blossoms

description_th: |
  คุณคือ 🌸 ซากุระ — ศิลปินแห่งกระแส
  ✦ คุณไม่ได้ "จัดตาราง" ชีวิต — คุณ "ออกแบบ" มัน
  ✦ Aesthetics สำคัญ — ถ้า planner ไม่สวย คุณจะไม่เปิด
  ✦ Flow state คือสิ่งที่คุณตามหา — ตอนอยู่ใน zone คุณสร้างงานที่ magical
  ✦ จุดอ่อน? รอ inspiration จนลืม action — "ยังไม่รู้สึกอยากทำ"
  "ซากุระไม่ได้สวยเพราะอยู่นาน — แต่เพราะบานเต็มที่ตอนถึงเวลา"

planner_style: "Aesthetic Bujo + Creative Blocks + Inspiration Board"
tools: [bujo_spread, moodboard, mood_tracker, doodle_zone, journal_prompt]
```

### 🐈 Cat (code: `cat`)
```yaml
name_th: "แมว — นักจัดการตัวเอง"
name_en: "The Sovereign Self"
chronotype: Cat (nap master, burst energy)
mbti_echo: ISTP
dosha: Pitta-Vata
element: Metal-Water

theme:
  bg_gradient: "linear-gradient(135deg, #F5F3EE 0%, #E8E4DB 50%, #D4CFC3 100%)"
  text_color: "#3C3C3C"
  accent: "#A8A098"
  frame_animation: zen-minimal-line
  particle: none

description_th: |
  คุณคือ 🐈 แมว — นักจัดการตัวเอง
  ✦ คุณไม่ต้องการ to-do list ยาว — คุณต้องการ "done" list สั้นๆ
  ✦ Minimal is more — ยิ่ง planner ซับซ้อน คุณยิ่งไม่ใช้
  ✦ คุณทำงานเป็น burst — พักเมื่อต้องพัก ทำเมื่อพร้อม
  ✦ จุดอ่อน? "ไม่อยากทำ" กลายเป็น "ไม่ทำเลย" ง่ายมาก
  "แมวไม่ได้ขี้เกียจ — แค่เลือกจะไม่เหนื่อยกับสิ่งที่ไม่คุ้ม"

planner_style: "Minimal Done-List + Energy-Based Scheduling"
tools: [daily_power_block, energy_map, gratitude_log, reading_list, mindfulness_bell]
```

### 🐊 Crocodile (code: `crocodile`)
```yaml
name_th: "จระเข้ — นักล่าผู้อดทน"
name_en: "The Patient Hunter"
chronotype: Wolf-Bear blend
mbti_echo: ENTJ-ISTP blend
dosha: Pitta-Kapha
element: Water-Earth

theme:
  bg_gradient: "linear-gradient(135deg, #2D4739 0%, #476B5C 50%, #6B8F71 100%)"
  text_color: "#E8F0E8"
  accent: "#4A7C59"
  frame_animation: zen-stillness
  particle: water-ripple

description_th: |
  คุณคือ 🐊 จระเข้ — นักล่าผู้อดทน
  ✦ คุณไม่ได้ไล่ทุกโอกาส — คุณรอโอกาสที่ใช่ แล้ว snap ทีเดียว
  ✦ Strategic patience คือ superpower — คุณรู้ว่าเมื่อไหร่ต้องรอ เมื่อไหร่ต้องลุย
  ✦ คุณดูเงียบๆ แต่สังเกตทุกอย่าง
  ✦ จุดอ่อน? รอนานเกินไปจนโอกาสผ่านไป — analysis paralysis
  "จระเข้ไม่ได้ขี้เกียจที่นอนนิ่ง — แค่ยังไม่ถึงเวลาลุก"

planner_style: "Opportunity Tracker + Strategic Patience + High-Impact Actions"
tools: [eisenhower_matrix, quarterly_vision, milestone_map, weekly_review, energy_map]
```

### 🕊️ Dove (code: `dove`)
```yaml
name_th: "นกพิราบ — ผู้รักษาสมดุล"
name_en: "The Harmony Keeper"
chronotype: Bear (gentle)
mbti_echo: ISFJ
dosha: Kapha
element: Earth-Water

theme:
  bg_gradient: "linear-gradient(135deg, #FEFEFE 0%, #E8E4DB 30%, #D4CFC3 60%, #C9E4CA 100%)"
  text_color: "#4A4A4A"
  accent: "#9BC4A0"
  frame_animation: zen-feather-drift
  particle: soft-light

description_th: |
  คุณคือ 🕊️ นกพิราบ — ผู้รักษาสมดุล
  ✦ คุณดูแลทุกมิติของชีวิต — ไม่ใช่แค่งาน แต่สุขภาพ ความสัมพันธ์ จิตใจ
  ✦ Balance wheel คือเครื่องมือที่เกิดมาเพื่อคุณ
  ✦ คุณเป็นคนที่คนรอบข้างมาหาเมื่อต้องการความสงบ
  ✦ จุดอ่อน? ดูแลคนอื่นจนลืมดูแลตัวเอง — self-sacrifice syndrome
  "นกพิราบไม่ได้บินหนีพายุ — แต่รู้ว่าเมื่อไหร่ควรกลับบ้าน"

planner_style: "Life Balance Wheel + Self-Care Scheduling + Gentle Routine"
tools: [life_wheel, meal_planner, fitness_log, gratitude_log, mood_tracker, evening_reflection]
```

### 🦋 Butterfly (code: `butterfly`)
```yaml
name_th: "ผีเสื้อ — นักสำรวจผู้ไม่หยุดค้นหา"
name_en: "The Endless Explorer"
chronotype: Dolphin (curiosity-driven)
mbti_echo: ENFP
dosha: Vata
element: Air-Fire

theme:
  bg_gradient: "linear-gradient(135deg, #FFE0B2 0%, #FFAB91 30%, #CE93D8 60%, #90CAF9 100%)"
  text_color: "#3E2723"
  accent: "#FF8A65"
  frame_animation: zen-morph-wings
  particle: sparkle-trail

description_th: |
  คุณคือ 🦋 ผีเสื้อ — นักสำรวจผู้ไม่หยุดค้นหา
  ✦ โลกใบนี้เต็มไปด้วยดอกไม้ที่ยังไม่ได้ลอง — และคุณจะลองทุกดอก
  ✦ ความอยากรู้อยากเห็นคืออาวุธ — คุณเรียนรู้สิ่งใหม่ได้เร็วมาก
  ✦ คุณเปลี่ยนร่างได้ — ไม่ยึดติดกับ version เก่าของตัวเอง
  ✦ จุดอ่อน? สนใจทุกอย่างจนไม่เชี่ยวชาญสักอย่าง — jack of all trades
  "ผีเสื้อไม่ได้สวยเพราะสีปีก — แต่เพราะกล้าออกจากรังไหม"

planner_style: "Interest Map + Discovery Journal + Rotation System"
tools: [brain_dump, mind_map, reading_list, moodboard, 21day_challenge, journal_prompt]
```

### 🌿 Bamboo (code: `bamboo`)
```yaml
name_th: "ไผ่ — ผู้ยืดหยุ่นไม่มีวันหัก"
name_en: "The Unbreakable Reed"
chronotype: Bear (resilient)
mbti_echo: INFP-ISFJ blend
dosha: Kapha-Vata
element: Wood-Earth

theme:
  bg_gradient: "linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 30%, #81C784 60%, #66BB6A 100%)"
  text_color: "#1B5E20"
  accent: "#4CAF50"
  frame_animation: zen-sway
  particle: bamboo-rustle

description_th: |
  คุณคือ 🌿 ไผ่ — ผู้ยืดหยุ่นไม่มีวันหัก
  ✦ คุณโค้งงอได้แต่ไม่มีวันหัก — resilience คือ DNA ของคุณ
  ✦ ปัญหาไม่ใช่สิ่งที่ทำลายคุณ — แต่เป็นสิ่งที่สอนคุณ
  ✦ คุณเติบโตเงียบๆ แต่สม่ำเสมอ — แล้ววันหนึ่งคนจะหันมามอง
  ✦ จุดอ่อน? ใจดีจนยอมรับสถานการณ์ที่ไม่ควรยอม — need boundaries
  "ไผ่ไม่ได้แข็งแกร่งเพราะหนา — แต่เพราะรู้จักโค้ง"

planner_style: "Stoic Reflection + Anti-Fragility Tracker + Growth Log"
tools: [journal_prompt, gratitude_log, streak_tracker, weekly_review, mood_tracker, habit_stack]
```

---

## Quiz Scoring

Mode 1 uses pre-defined multiple-choice questions. Each answer adds points to 1-2 axes:

```typescript
// Axis codes
type Axis = 'energy' | 'planning' | 'social' | 'decision' | 'focus' | 'drive';
type AxisScore = Record<Axis, number>; // range: -10 to +10

// Positive = Pole A (Dawn, Architect, Gatherer, Blade, Laser, Summit)
// Negative = Pole B (Night, Surfer, Hermit, Petal, Kaleidoscope, Garden)

function calculateAnimal(scores: AxisScore): string {
  // Map 6-axis combination to one of 16 animal codes
  // Nearest-neighbor matching (Manhattan distance) against archetype profiles
}
```

## Flex Message Template (LINE sharing)

```json
{
  "type": "bubble",
  "body": {
    "type": "box", "layout": "vertical", "spacing": "md",
    "contents": [
      { "type": "text", "text": "🧘 ZenPlanner", "size": "xs", "color": "#7C9A82" },
      { "type": "text", "text": "ฉันคือ {emoji} {name_th}!", "size": "xl", "weight": "bold", "color": "{text_color}" },
      { "type": "text", "text": "{name_en}", "size": "sm", "color": "#6B6560" },
      { "type": "text", "text": "{quote}", "size": "xs", "color": "#A8A098", "wrap": true },
      { "type": "button", "style": "primary", "color": "{accent}",
        "action": { "type": "uri", "label": "ค้นหาสัตว์ประจำตัวคุณ", "uri": "https://zenplanner.app/quiz" }
      }
    ]
  }
}
```
