/**
 * ZenPlanner — Quiz Data (Thai, Narrative Edition)
 *
 * Design principles:
 * - Scenario-first: put the user IN a situation, never ask "what kind of person are you?"
 * - Behavioral answers: what do you DO, not what you ARE
 * - No emoji in answers — choices stand on their own words
 * - GenZ language: direct, vivid, slightly ironic, never corporate
 * - Answers don't telegraph personality — the "planning" answer shouldn't sound like "I am a planner"
 * - 6 axes: energy, planning, social, decision, focus, drive
 */

export interface QuizOption {
  label: string;
  score: {
    energy: number;
    planning: number;
    social: number;
    decision: number;
    focus: number;
    drive: number;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  scenario: string;
  options: QuizOption[];
  axisFocus: string;
}

export const QUIZ_DATA: QuizQuestion[] = [
  // ─── ENERGY RHYTHM ─────────────────────────────────────────────
  {
    id: 1,
    question: "ตื่นมาวันเสาร์",
    scenario: "ตื่นมาวันเสาร์ โทรศัพท์วางอยู่ข้างหมอน มีนัดสำคัญตอนบ่าย",
    axisFocus: "energy",
    options: [
      { label: "เปิดโน้ตเขียนสิ่งที่ต้องทำก่อนวันนี้จะเริ่ม", score: { energy: 90, planning: 85, social: 30, decision: 65, focus: 75, drive: 80 } },
      { label: "นอนต่ออีกสักพัก บ่ายค่อยคิด", score: { energy: 20, planning: 15, social: 35, decision: 30, focus: 20, drive: 25 } },
      { label: "เช็กข่าว เช็กโซเชียล อย่างน้อยก็ตื่นแล้ว", score: { energy: 50, planning: 30, social: 55, decision: 40, focus: 30, drive: 40 } },
      { label: "ส่งข้อความชวนคนไปกินข้าวหลังนัด", score: { energy: 75, planning: 25, social: 90, decision: 35, focus: 25, drive: 55 } },
    ],
  },
  {
    id: 2,
    question: "เวลาทำงานที่ดีที่สุด",
    scenario: "งานที่ต้องใช้สมองมากที่สุดวันนี้ คุณจะทำตอนไหน",
    axisFocus: "energy",
    options: [
      { label: "ตีห้าถึงแปดโมงเช้า ก่อนโลกตื่น", score: { energy: 90, planning: 70, social: 15, decision: 65, focus: 85, drive: 75 } },
      { label: "บ่ายสอง หลังกาแฟมื้อที่สอง", score: { energy: 65, planning: 50, social: 35, decision: 50, focus: 55, drive: 55 } },
      { label: "ห้าทุ่มถึงเที่ยงคืน ตอนบ้านเงียบแล้ว", score: { energy: 20, planning: 60, social: 15, decision: 70, focus: 80, drive: 65 } },
      { label: "ไม่มีเวลาที่ดีที่สุด แล้วแต่วัน", score: { energy: 45, planning: 25, social: 50, decision: 40, focus: 35, drive: 45 } },
    ],
  },
  {
    id: 3,
    question: "วันเสาร์หลังสัปดาห์หนัก",
    scenario: "เสร็จงานหนักมาทั้งอาทิตย์ วันเสาร์มาถึงแล้ว",
    axisFocus: "energy",
    options: [
      { label: "ตื่นแต่เช้า ออกไปข้างนอก ไม่อยากอยู่บ้าน", score: { energy: 85, planning: 40, social: 65, decision: 55, focus: 35, drive: 65 } },
      { label: "อยู่บ้าน ทำอะไรก็ได้ที่ค้างอยู่ในใจ", score: { energy: 50, planning: 50, social: 15, decision: 55, focus: 75, drive: 65 } },
      { label: "นอนจนตื่นเอง ไม่ตั้งนาฬิกา", score: { energy: 15, planning: 10, social: 30, decision: 35, focus: 20, drive: 20 } },
      { label: "ชวนคนที่ไม่ได้เจอนานไปทำอะไรด้วยกัน", score: { energy: 80, planning: 30, social: 95, decision: 40, focus: 25, drive: 55 } },
    ],
  },

  // ─── PLANNING STYLE ────────────────────────────────────────────
  {
    id: 4,
    question: "เดดไลน์ 7 วัน",
    scenario: "มีงานใหญ่ต้องส่งอีก 7 วัน ยังไม่ได้เริ่มเลย",
    axisFocus: "planning",
    options: [
      { label: "แบ่งเป็นวันๆ กำหนดว่าพรุ่งนี้ทำถึงไหน", score: { energy: 70, planning: 95, social: 25, decision: 55, focus: 80, drive: 75 } },
      { label: "เปิดไฟล์ขึ้นมา เขียนทุกอย่างที่คิดออกก่อน", score: { energy: 55, planning: 60, social: 20, decision: 60, focus: 70, drive: 65 } },
      { label: "โทรหาคนที่เคยผ่านงานแบบนี้มา", score: { energy: 50, planning: 50, social: 85, decision: 40, focus: 50, drive: 55 } },
      { label: "รู้ว่าตัวเองทำได้ดีที่สุดตอนใกล้เส้นตาย ยังไม่รีบ", score: { energy: 80, planning: 10, social: 30, decision: 45, focus: 30, drive: 65 } },
    ],
  },
  {
    id: 5,
    question: "สิบเรื่องในหัว",
    scenario: "มีเรื่องค้างอยู่ในหัวสิบอย่าง ไม่รู้จะจัดการยังไงก่อน",
    axisFocus: "planning",
    options: [
      { label: "เขียนออกมาทั้งหมด แล้วจัดลำดับ", score: { energy: 60, planning: 95, social: 25, decision: 65, focus: 70, drive: 70 } },
      { label: "จัดการอันที่กดดันที่สุดก่อน แล้วค่อยดูต่อ", score: { energy: 75, planning: 50, social: 25, decision: 80, focus: 60, drive: 80 } },
      { label: "ปล่อยให้อยู่ในหัวไปก่อน วันนี้ไม่ไหว", score: { energy: 25, planning: 10, social: 40, decision: 25, focus: 25, drive: 25 } },
      { label: "เล่าให้ใครฟัง ช่วยกันคิด", score: { energy: 50, planning: 55, social: 85, decision: 35, focus: 45, drive: 50 } },
    ],
  },
  {
    id: 6,
    question: "มาก่อนเวลา",
    scenario: "มาถึงนัดก่อนเวลา 15 นาที คนอื่นยังไม่มา",
    axisFocus: "planning",
    options: [
      { label: "นั่งทบทวนสิ่งที่จะพูดในนัดนี้", score: { energy: 60, planning: 90, social: 20, decision: 55, focus: 80, drive: 70 } },
      { label: "เช็กโทรศัพท์ รอปกติ", score: { energy: 50, planning: 35, social: 45, decision: 45, focus: 35, drive: 45 } },
      { label: "ตอบข้อความที่ค้างไว้", score: { energy: 65, planning: 55, social: 70, decision: 50, focus: 50, drive: 60 } },
      { label: "รู้สึกแปลกที่มาก่อน ปกติมาพอดีเวลา", score: { energy: 75, planning: 15, social: 40, decision: 40, focus: 25, drive: 60 } },
    ],
  },

  // ─── SOCIAL FUEL ───────────────────────────────────────────────
  {
    id: 7,
    question: "งานปาร์ตี้คืนนี้",
    scenario: "เพื่อนชวนไปงานปาร์ตี้คืนนี้ รู้จักคนในนั้นไม่กี่คน",
    axisFocus: "social",
    options: [
      { label: "ไป โอกาสเจอคนใหม่ก็ดี", score: { energy: 70, planning: 30, social: 85, decision: 65, focus: 25, drive: 55 } },
      { label: "ถามก่อนว่ามีใครไปบ้าง แล้วค่อยตัดสินใจ", score: { energy: 45, planning: 55, social: 55, decision: 25, focus: 50, drive: 45 } },
      { label: "ขอโทษ วันนี้อยากอยู่บ้าน", score: { energy: 20, planning: 35, social: 10, decision: 50, focus: 55, drive: 35 } },
      { label: "ไปช่วงต้น ออกก่อนสิบ", score: { energy: 55, planning: 65, social: 45, decision: 55, focus: 45, drive: 50 } },
    ],
  },
  {
    id: 8,
    question: "หลังอยู่กับคนเยอะ",
    scenario: "อยู่กับคนเยอะมาทั้งวัน ตอนนี้อยู่คนเดียวแล้ว",
    axisFocus: "social",
    options: [
      { label: "มีพลังดี วันแบบนี้ชอบ", score: { energy: 90, planning: 25, social: 95, decision: 40, focus: 20, drive: 60 } },
      { label: "เหนื่อยดี แต่โอเค พอไหว", score: { energy: 60, planning: 40, social: 60, decision: 45, focus: 45, drive: 50 } },
      { label: "ต้องการเวลาเงียบๆ สักพักก่อน", score: { energy: 35, planning: 50, social: 20, decision: 50, focus: 60, drive: 45 } },
      { label: "เหนื่อยมาก พรุ่งนี้ต้องพักฟื้น", score: { energy: 15, planning: 35, social: 5, decision: 35, focus: 45, drive: 25 } },
    ],
  },
  {
    id: 9,
    question: "ทำคนเดียวหรือชวนคน",
    scenario: "โปรเจกต์นี้ทำคนเดียวได้ หรือจะชวนใครมาช่วยก็ได้",
    axisFocus: "social",
    options: [
      { label: "ทำคนเดียวดีกว่า จะได้ทำตามที่คิด", score: { energy: 50, planning: 65, social: 10, decision: 65, focus: 85, drive: 75 } },
      { label: "ชวนคนมาเลย ทำด้วยกันสนุกกว่า", score: { energy: 70, planning: 45, social: 95, decision: 40, focus: 35, drive: 55 } },
      { label: "แบ่งงาน แต่ละคนรับผิดชอบส่วนตัวเอง", score: { energy: 60, planning: 80, social: 65, decision: 55, focus: 65, drive: 70 } },
      { label: "แล้วแต่งาน ไม่ยึดติดแบบไหน", score: { energy: 55, planning: 50, social: 50, decision: 50, focus: 50, drive: 55 } },
    ],
  },

  // ─── DECISION MODE ─────────────────────────────────────────────
  {
    id: 10,
    question: "ต้องเลือกระหว่างสองอย่าง",
    scenario: "ต้องเลือกระหว่างสองสิ่งที่ดีพอๆ กัน ทางไหนก็ไม่แย่",
    axisFocus: "decision",
    options: [
      { label: "เลือกเร็ว ยังไงก็ถูกอยู่แล้ว", score: { energy: 75, planning: 30, social: 45, decision: 95, focus: 30, drive: 75 } },
      { label: "นั่งเปรียบเทียบข้อดีข้อเสียจนมั่นใจ", score: { energy: 35, planning: 80, social: 20, decision: 10, focus: 90, drive: 60 } },
      { label: "ถามความเห็นคนที่ไว้ใจก่อน", score: { energy: 45, planning: 50, social: 85, decision: 20, focus: 45, drive: 45 } },
      { label: "ปล่อยให้โอกาสตัดสิน อะไรติดใจกว่า", score: { energy: 55, planning: 20, social: 35, decision: 60, focus: 20, drive: 50 } },
    ],
  },
  {
    id: 11,
    question: "แผนไม่ work กลางทาง",
    scenario: "แผนที่วางไว้ดูเหมือนจะไม่ work แล้ว ยังทำได้ครึ่งทาง",
    axisFocus: "decision",
    options: [
      { label: "หยุด ประเมินสถานการณ์ใหม่ทั้งหมด", score: { energy: 40, planning: 80, social: 30, decision: 25, focus: 85, drive: 65 } },
      { label: "ปรับไปเรื่อยๆ ตามที่เห็นหน้างาน", score: { energy: 65, planning: 35, social: 40, decision: 80, focus: 45, drive: 70 } },
      { label: "โทรหาคนที่เชี่ยวชาญกว่า", score: { energy: 50, planning: 55, social: 80, decision: 35, focus: 50, drive: 55 } },
      { label: "ดันต่อ อาจจะ work ถ้าไม่หยุด", score: { energy: 80, planning: 50, social: 20, decision: 65, focus: 60, drive: 85 } },
    ],
  },

  // ─── FOCUS PATTERN ─────────────────────────────────────────────
  {
    id: 12,
    question: "งานยาวหลายชั่วโมง",
    scenario: "มีงานยาวที่ต้องใช้เวลาหลายชั่วโมง คุณเริ่มยังไง",
    axisFocus: "focus",
    options: [
      { label: "ปิดทุกแท็บ เปิดแค่สิ่งที่ต้องใช้ แล้วเริ่มเลย", score: { energy: 65, planning: 70, social: 15, decision: 65, focus: 95, drive: 80 } },
      { label: "ทำไปด้วย เช็กข้อความไปด้วย ยังไงก็เสร็จ", score: { energy: 60, planning: 20, social: 55, decision: 50, focus: 15, drive: 50 } },
      { label: "ตั้ง timer ทำ 25 นาที พัก 5 นาที วนไป", score: { energy: 60, planning: 80, social: 20, decision: 50, focus: 80, drive: 65 } },
      { label: "รอจนได้อารมณ์ก่อน บางทีก็รอนาน", score: { energy: 30, planning: 20, social: 35, decision: 35, focus: 25, drive: 35 } },
    ],
  },
  {
    id: 13,
    question: "สนใจห้าเรื่องพร้อมกัน",
    scenario: "สนใจห้าเรื่องพร้อมกัน ทำได้ทีละอย่าง แต่อยากทำทุกอย่าง",
    axisFocus: "focus",
    options: [
      { label: "เลือกอันเดียวที่สำคัญที่สุด พักที่เหลือไว้ก่อน", score: { energy: 60, planning: 80, social: 30, decision: 70, focus: 90, drive: 80 } },
      { label: "วางแผนว่าแต่ละเดือนจะโฟกัสอะไร", score: { energy: 55, planning: 85, social: 25, decision: 55, focus: 80, drive: 70 } },
      { label: "ทำทีละนิดทุกเรื่อง เดี๋ยวก็คืบหน้า", score: { energy: 65, planning: 20, social: 50, decision: 40, focus: 15, drive: 55 } },
      { label: "จดไว้ก่อน รอดูว่าอะไรตายตัวกว่า", score: { energy: 50, planning: 65, social: 30, decision: 45, focus: 55, drive: 55 } },
    ],
  },

  // ─── DRIVE SOURCE ──────────────────────────────────────────────
  {
    id: 14,
    question: "ทำเต็มที่โดยไม่มีใครขอ",
    scenario: "คุณเคยทุ่มกับบางอย่างมากโดยไม่มีใครสั่ง เพราะอะไร",
    axisFocus: "drive",
    options: [
      { label: "มันพาไปถึงเป้าหมายที่ตั้งไว้", score: { energy: 70, planning: 75, social: 35, decision: 65, focus: 70, drive: 95 } },
      { label: "ทำแล้วสนุก รู้สึกดี ไม่ต้องการเหตุผลอื่น", score: { energy: 80, planning: 25, social: 55, decision: 55, focus: 40, drive: 30 } },
      { label: "มีคนรอผลงาน รู้สึกรับผิดชอบ", score: { energy: 60, planning: 65, social: 80, decision: 50, focus: 60, drive: 70 } },
      { label: "อยากรู้ว่าตัวเองทำได้ไหม", score: { energy: 60, planning: 50, social: 25, decision: 60, focus: 65, drive: 85 } },
    ],
  },
  {
    id: 15,
    question: "วัดความสำเร็จของปีนี้",
    scenario: "ถ้าต้องวัดว่าปีนี้ดีพอไหม คุณดูจากอะไร",
    axisFocus: "drive",
    options: [
      { label: "สิ่งที่ทำได้จริง ตัวเลข ผลลัพธ์ที่จับต้องได้", score: { energy: 70, planning: 75, social: 30, decision: 70, focus: 70, drive: 95 } },
      { label: "เติบโตขึ้นในแบบที่รู้สึกได้เอง", score: { energy: 55, planning: 55, social: 35, decision: 60, focus: 70, drive: 85 } },
      { label: "ความสัมพันธ์กับคนรอบข้างดีขึ้น", score: { energy: 55, planning: 45, social: 85, decision: 45, focus: 50, drive: 65 } },
      { label: "สุขภาพจิตและความสงบในใจ", score: { energy: 30, planning: 35, social: 45, decision: 45, focus: 50, drive: 25 } },
    ],
  },

  // ─── MIXED ─────────────────────────────────────────────────────
  {
    id: 16,
    question: "โอกาสใหม่ ตอบภายใน 24 ชั่วโมง",
    scenario: "มีโอกาสใหม่เข้ามา ต้องตอบภายใน 24 ชั่วโมง ยังไม่ได้ศึกษาละเอียด",
    axisFocus: "mixed",
    options: [
      { label: "รับเลย ค่อยคิดรายละเอียดทีหลัง", score: { energy: 90, planning: 15, social: 50, decision: 85, focus: 25, drive: 80 } },
      { label: "ใช้คืนนี้คิดให้ครบ ตอบพรุ่งนี้เช้า", score: { energy: 50, planning: 80, social: 25, decision: 40, focus: 80, drive: 65 } },
      { label: "ถามคนใกล้ชิดก่อนว่าคิดยังไง", score: { energy: 45, planning: 55, social: 85, decision: 25, focus: 50, drive: 50 } },
      { label: "ปฏิเสธ ถ้าต้องตัดสินใจเร็วขนาดนี้แสดงว่ายังไม่พร้อม", score: { energy: 30, planning: 70, social: 20, decision: 20, focus: 70, drive: 50 } },
    ],
  },
  {
    id: 17,
    question: "เพื่อนมาทักตอนกำลังทำงาน",
    scenario: "กำลังทำงานอยู่ เพื่อนส่งข้อความมาบอกว่าอยากคุย",
    axisFocus: "mixed",
    options: [
      { label: "ปิดงานชั่วคราว ฟังก่อน งานรอได้", score: { energy: 55, planning: 25, social: 90, decision: 55, focus: 15, drive: 45 } },
      { label: "บอกว่าขอจบก่อน แล้วจะมาหา", score: { energy: 60, planning: 70, social: 60, decision: 60, focus: 80, drive: 70 } },
      { label: "ตอบไปด้วย ทำงานไปด้วย", score: { energy: 60, planning: 25, social: 65, decision: 50, focus: 20, drive: 55 } },
      { label: "ส่งข้อความบอกว่าไม่ว่างตอนนี้", score: { energy: 55, planning: 65, social: 20, decision: 65, focus: 85, drive: 75 } },
    ],
  },
  {
    id: 18,
    question: "งานที่ไม่ชอบ แต่ต้องทำ",
    scenario: "มีงานที่ไม่ชอบ แต่ต้องทำให้เสร็จ หลีกเลี่ยงไม่ได้",
    axisFocus: "mixed",
    options: [
      { label: "ทำให้เสร็จเร็วที่สุด ไม่ยืดเวลา", score: { energy: 80, planning: 75, social: 20, decision: 65, focus: 70, drive: 70 } },
      { label: "หาวิธีทำให้มันน่าสนใจขึ้นก่อน", score: { energy: 70, planning: 40, social: 45, decision: 60, focus: 50, drive: 60 } },
      { label: "ทำทีละนิด ไม่บังคับตัวเองมาก", score: { energy: 30, planning: 30, social: 30, decision: 35, focus: 30, drive: 30 } },
      { label: "ชวนคนมาช่วยหรือทำด้วยกัน", score: { energy: 55, planning: 50, social: 80, decision: 45, focus: 35, drive: 50 } },
    ],
  },
  {
    id: 19,
    question: "เวลาว่างโดยไม่ได้ตั้งใจ",
    scenario: "มีเวลาว่างสองชั่วโมงโดยไม่ได้ตั้งใจ ไม่มีแผนอะไรเลย",
    axisFocus: "mixed",
    options: [
      { label: "เริ่มทำอะไรที่อยากทำมานานแล้ว", score: { energy: 70, planning: 55, social: 30, decision: 65, focus: 70, drive: 85 } },
      { label: "นอน ดูซีรีส์ พักจริงๆ", score: { energy: 20, planning: 15, social: 30, decision: 40, focus: 25, drive: 15 } },
      { label: "โทรหาคนที่ไม่ได้คุยนาน", score: { energy: 65, planning: 20, social: 90, decision: 45, focus: 20, drive: 50 } },
      { label: "ทำรายการว่าอยากทำอะไรจากนี้", score: { energy: 55, planning: 85, social: 20, decision: 50, focus: 65, drive: 70 } },
    ],
  },
  {
    id: 20,
    question: "เพิ่งเสร็จโปรเจกต์ใหญ่",
    scenario: "เพิ่งส่งโปรเจกต์ใหญ่เสร็จ วันนี้ไม่มีอะไรต้องทำแล้ว",
    axisFocus: "mixed",
    options: [
      { label: "ออกไปข้างนอก ไม่อยากอยู่บ้าน", score: { energy: 85, planning: 30, social: 70, decision: 55, focus: 25, drive: 60 } },
      { label: "เริ่มคิดโปรเจกต์ต่อไปแล้ว", score: { energy: 70, planning: 80, social: 15, decision: 60, focus: 75, drive: 90 } },
      { label: "นอนยาวๆ ไม่มีความผิด", score: { energy: 15, planning: 15, social: 25, decision: 35, focus: 20, drive: 15 } },
      { label: "จัดบ้าน จัดของ รู้สึกดีเวลาทุกอย่างเป็นระเบียบ", score: { energy: 55, planning: 75, social: 10, decision: 55, focus: 65, drive: 60 } },
    ],
  },
  {
    id: 21,
    question: "ห้องเงียบหรือคาเฟ่",
    scenario: "ต้องเลือกที่ทำงานวันนี้ ห้องเงียบคนเดียว หรือคาเฟ่ที่มีคนอื่น",
    axisFocus: "mixed",
    options: [
      { label: "ห้องเงียบ โฟกัสได้กว่า", score: { energy: 35, planning: 60, social: 10, decision: 60, focus: 95, drive: 65 } },
      { label: "คาเฟ่ มีเสียงพื้นหลังช่วยได้", score: { energy: 65, planning: 40, social: 55, decision: 50, focus: 50, drive: 55 } },
      { label: "คาเฟ่ ใส่หูฟัง ได้บรรยากาศแต่ไม่ถูกรบกวน", score: { energy: 60, planning: 60, social: 30, decision: 60, focus: 70, drive: 65 } },
      { label: "ไม่สำคัญ ขอให้เริ่มได้ก็พอ", score: { energy: 55, planning: 30, social: 50, decision: 55, focus: 40, drive: 55 } },
    ],
  },
  {
    id: 22,
    question: "เป้าหมายที่ยังไม่ได้เริ่ม",
    scenario: "มีเป้าหมายที่อยากทำมาสักพักแล้ว แต่ยังไม่ได้เริ่มเลย",
    axisFocus: "mixed",
    options: [
      { label: "เริ่มเลย เล็กก็ได้ ขอให้ได้เริ่ม", score: { energy: 80, planning: 35, social: 30, decision: 80, focus: 55, drive: 85 } },
      { label: "วางแผนก่อน อยากเริ่มถูกตั้งแต่ต้น", score: { energy: 50, planning: 90, social: 20, decision: 30, focus: 80, drive: 75 } },
      { label: "บอกใครสักคนว่าจะทำ จะได้รู้สึกรับผิดชอบ", score: { energy: 55, planning: 55, social: 80, decision: 45, focus: 50, drive: 70 } },
      { label: "รอจนรู้สึกพร้อมจริงๆ ยังไม่ใช่เวลา", score: { energy: 25, planning: 50, social: 25, decision: 15, focus: 55, drive: 35 } },
    ],
  },
];

export default QUIZ_DATA;
