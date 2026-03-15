/**
 * ZenPlanner — Quiz Data (Thai)
 * 20+ questions covering all 6 axes: Energy, Planning, Social, Decision, Focus, Drive
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
  // ENERGY RHYTHM questions
  {
    id: 1,
    question: "เช้าวันเสาร์ ตื่นขึ้นมาคุณคิดอะไรก่อน?",
    scenario: "เสียงนาฬิกาปลุกดังตอน 6 โมงเช้า คุณ...",
    axisFocus: "energy",
    options: [
      { label: "พร้อมลุย! มีลิสต์รอเลย!", score: { energy: 90, planning: 90, social: 40, decision: 60, focus: 70, drive: 80 } },
      { label: "ปล่อยให้วันพา�ไปเอง ไม่รีบ", score: { energy: 20, planning: 20, social: 50, decision: 40, focus: 20, drive: 30 } },
      { label: "กาแฟก่อน แผนมาวันหลัง", score: { energy: 50, planning: 40, social: 30, decision: 40, focus: 40, drive: 40 } },
      { label: "อยากชวนเพื่อนไปเที่ยว ใครตื่นบ้าง?", score: { energy: 80, planning: 30, social: 90, decision: 30, focus: 30, drive: 60 } },
    ],
  },
  {
    id: 2,
    question: "ช่วงเวลาที่คุณทำงานได้ดีที่สุดคือ?",
    scenario: "ถ้าให้คุณเลือกช่วงเวลาในการทำงานที่สำคัญ...",
    axisFocus: "energy",
    options: [
      { label: "ตอนเช้ามืด ก่อนใครตื่น", score: { energy: 90, planning: 70, social: 20, decision: 60, focus: 80, drive: 70 } },
      { label: "ตอนพระอาทิตย์ตก คนเงียบแล้ว", score: { energy: 30, planning: 60, social: 20, decision: 70, focus: 80, drive: 60 } },
      { label: "ทุกช่วงเวลา ขึ้นกับอารมณ์", score: { energy: 50, planning: 30, social: 50, decision: 40, focus: 40, drive: 50 } },
      { label: "ช่วงบ่าย หลังอาหารกลางวัน", score: { energy: 60, planning: 50, social: 40, decision: 50, focus: 50, drive: 50 } },
    ],
  },
  {
    id: 3,
    question: "เมื่อต้องทำงานที่ต้องใช้พลังงานมากๆ คุณจะ?",
    scenario: "มีงานยาวที่ต้องทำต่อเนื่องหลายชั่วโมง...",
    axisFocus: "energy",
    options: [
      { label: "ทำตอนเช้าให้เสร็จ พักทีหลัง", score: { energy: 85, planning: 80, social: 30, decision: 60, focus: 70, drive: 80 } },
      { label: "แบ่งทำเป็นรอบๆ พักบ้างทำบ้าง", score: { energy: 50, planning: 50, social: 40, decision: 50, focus: 50, drive: 50 } },
      { label: "รอจนถึงตอนกลางคืน จะมีแรงบันดาลใจ", score: { energy: 20, planning: 40, social: 20, decision: 70, focus: 70, drive: 60 } },
      { label: "ทำเมื่อไหร่ก็ได้ ไม่กำหนด", score: { energy: 40, planning: 20, social: 50, decision: 30, focus: 30, drive: 40 } },
    ],
  },
  // PLANNING STYLE questions
  {
    id: 4,
    question: "มีโปรเจกต์ใหญ่ต้องทำใน 1 สัปดาห์ คุณจะเริ่มอย่างไร?",
    scenario: "คุณได้รับมอบหมายให้ทำโปรเจกต์สำคัญที่มีกำหนดส่ง 7 วัน...",
    axisFocus: "planning",
    options: [
      { label: "แบ่งเป็นงานรายวัน ทำทีละอย่าง", score: { energy: 70, planning: 95, social: 30, decision: 50, focus: 80, drive: 70 } },
      { label: "รอจนใกล้ค่อยทำ ตื่นเครียดจะทำได้เร็ว", score: { energy: 80, planning: 10, social: 30, decision: 30, focus: 30, drive: 60 } },
      { label: "ชวนทีมมาประชุม แบ่งงานกัน", score: { energy: 70, planning: 80, social: 90, decision: 40, focus: 60, drive: 60 } },
      { label: "คิดทบทวนให้รอบคอบก่อน แล้วค่อยลงมือ", score: { energy: 40, planning: 90, social: 20, decision: 90, focus: 90, drive: 70 } },
    ],
  },
  {
    id: 5,
    question: "คุณมีวิธีจัดการความยุ่งเหยิงในชีวิตอย่างไร?",
    scenario: "เมื่อรู้สึกว่ามีเรื่องต้องทำเยอะเกินไป...",
    axisFocus: "planning",
    options: [
      { label: "ทำ To-Do List ลำดับความสำคัญ", score: { energy: 60, planning: 95, social: 30, decision: 70, focus: 70, drive: 70 } },
      { label: "ปล่อยให้มันอยู่ในหัว ทำไปเรื่อยๆ", score: { energy: 50, planning: 15, social: 50, decision: 40, focus: 30, drive: 40 } },
      { label: "ใช้แอปหรือเครื่องมือช่วยจัดการ", score: { energy: 55, planning: 70, social: 40, decision: 50, focus: 60, drive: 60 } },
      { label: "ขอคนช่วยจัดสรรเวลา", score: { energy: 50, planning: 60, social: 80, decision: 40, focus: 50, drive: 50 } },
    ],
  },
  {
    id: 6,
    question: "ความสัมพันธ์ของคุณกับเวลาเป็นอย่างไร?",
    scenario: "ถ้าต้องบอกความรู้สึกเรื่องเวลาของคุณ...",
    axisFocus: "planning",
    options: [
      { label: "ฉันตรงเวลาเสมอ ไม่เคยสาย", score: { energy: 70, planning: 95, social: 40, decision: 60, focus: 70, drive: 70 } },
      { label: "ทำงานได้ดีตอนใกล้เส้นตาย", score: { energy: 85, planning: 20, social: 30, decision: 40, focus: 40, drive: 70 } },
      { label: "ทำเวลาให้กับสิ่งที่สำคัญ ไม่ยึดติดตาราง", score: { energy: 50, planning: 50, social: 50, decision: 50, focus: 50, drive: 60 } },
      { label: "เวลาเป็นสิ่งลวง ปล่อยให้ไหลไป", score: { energy: 30, planning: 10, social: 50, decision: 30, focus: 20, drive: 30 } },
    ],
  },
  // SOCIAL FUEL questions
  {
    id: 7,
    question: "หลังจากทำงานหนักมาทั้งวัน คุณชอบชาร์จพลังอย่างไร?",
    scenario: "วันที่เหนื่อยจากการทำงาน คุณต้องการ...",
    axisFocus: "social",
    options: [
      { label: "อยู่คนเดียว เงียบๆ คิดสบาย", score: { energy: 30, planning: 40, social: 5, decision: 40, focus: 50, drive: 40 } },
      { label: "ไปปาร์ตี้หรือเจอเพื่อนฝูง", score: { energy: 90, planning: 30, social: 95, decision: 30, focus: 30, drive: 60 } },
      { label: "ทำโปรเจกต์ที่ชอบคนเดียว", score: { energy: 50, planning: 50, social: 15, decision: 50, focus: 80, drive: 70 } },
      { label: "ออกกำลังกาย ขยับร่างกาย", score: { energy: 70, planning: 30, social: 30, decision: 40, focus: 60, drive: 60 } },
    ],
  },
  {
    id: 8,
    question: "เพื่อนๆ ของคุณจะบอกว่าคุณเป็นคนแบบไหน?",
    scenario: "ถ้าให้เพื่อนสนิทบอกลักษณะนิสัยของคุณ...",
    axisFocus: "social",
    options: [
      { label: "คนที่มีทุกอย่างพร้อม วางแผนเก่ง", score: { energy: 70, planning: 90, social: 50, decision: 70, focus: 70, drive: 80 } },
      { label: "คนสนุก ตลก ชวนไปเที่ยวได้ตลอด", score: { energy: 95, planning: 20, social: 95, decision: 30, focus: 30, drive: 60 } },
      { label: "คนฟังเก่ง ให้คำปรึกษาดี", score: { energy: 40, planning: 50, social: 85, decision: 50, focus: 60, drive: 50 } },
      { label: "คนฝันเป็น ชอบคิดเรื่องแปลกๆ", score: { energy: 50, planning: 30, social: 40, decision: 50, focus: 40, drive: 70 } },
    ],
  },
  {
    id: 9,
    question: "เมื่อต้องตัดสินใจสำคัญ คุณมักจะ?",
    scenario: "มีเรื่องที่ต้องตัดสินใจใหญ่ในชีวิต...",
    axisFocus: "decision",
    options: [
      { label: "ตัดสินใจตามใจ พร้อมลงมือเลย", score: { energy: 80, planning: 40, social: 50, decision: 95, focus: 50, drive: 80 } },
      { label: "ชั่งน้ำหนักทุกทางเลือกอย่างรอบคอบ", score: { energy: 40, planning: 70, social: 40, decision: 10, focus: 90, drive: 60 } },
      { label: "ปรึกษาคนที่ไว้ใจก่อน", score: { energy: 50, planning: 50, social: 90, decision: 30, focus: 50, drive: 50 } },
      { label: "ทำรายการข้อดีข้อเสีย แล้ววิเคราะห์", score: { energy: 50, planning: 85, social: 30, decision: 20, focus: 85, drive: 60 } },
    ],
  },
  // DECISION MODE questions
  {
    id: 10,
    question: "เมื่อเจอปัญหาที่ยาก คุณมักจะ?",
    scenario: "เจอปัญหาที่ไม่มีคำตอนตรงๆ...",
    axisFocus: "decision",
    options: [
      { label: "ลองผิดลองถูกไปเรื่อยๆ", score: { energy: 70, planning: 20, social: 50, decision: 90, focus: 30, drive: 60 } },
      { label: "นั่งคิดทบทวนจนเจอทางออก", score: { energy: 30, planning: 60, social: 20, decision: 20, focus: 90, drive: 70 } },
      { label: "ถามคนรอบข้าง หาข้อมูลเพิ่ม", score: { energy: 50, planning: 50, social: 80, decision: 40, focus: 60, drive: 50 } },
      { label: "รอจนเห็นโอกาสที่ชัดเจน แล้วค่อยลงมือ", score: { energy: 30, planning: 60, social: 30, decision: 15, focus: 70, drive: 60 } },
    ],
  },
  // FOCUS PATTERN questions
  {
    id: 11,
    question: "ตอนทำงานที่ต้องใช้สมาธิมากๆ คุณทำอย่างไร?",
    scenario: "มีงานที่ต้องโฟกัสอย่างเข้มข้น...",
    axisFocus: "focus",
    options: [
      { label: "จดจ่ออยู่ที่งานเดียวจนเสร็จ ไม่หยุด", score: { energy: 70, planning: 70, social: 20, decision: 60, focus: 95, drive: 80 } },
      { label: "ทำหลายอย่างพร้อมกัน สลับไปมา", score: { energy: 60, planning: 30, social: 50, decision: 50, focus: 25, drive: 50 } },
      { label: "ใช้เทคนิค Pomodoro หาระหว่างพัก", score: { energy: 60, planning: 80, social: 30, decision: 50, focus: 80, drive: 60 } },
      { label: "ทำเมื่อมีแรงบันดาลใจ ไม่บังคับ", score: { energy: 40, planning: 30, social: 40, decision: 40, focus: 25, drive: 40 } },
    ],
  },
  {
    id: 12,
    question: "เมื่อมีเรื่องน่าสนใจหลายเรื่องพร้อมกัน คุณจะ?",
    scenario: "อยากทำหลายอย่างพร้อมกัน แต่ทำได้ทีละอย่าง...",
    axisFocus: "focus",
    options: [
      { label: "เลือกอันที่สำคัญที่สุด ทำให้เสร็จก่อน", score: { energy: 60, planning: 80, social: 40, decision: 70, focus: 85, drive: 80 } },
      { label: "ทำไปทีละนิด หลายๆ อย่างพร้อมกัน", score: { energy: 70, planning: 30, social: 50, decision: 50, focus: 20, drive: 60 } },
      { label: "เขียนไว้ก่อน ค่อยทำทีละอย่าง", score: { energy: 50, planning: 70, social: 40, decision: 50, focus: 60, drive: 60 } },
      { label: "ปล่อยไว้ก่อน รอจนมีพลังเยอะๆ แล้วค่อยทำ", score: { energy: 30, planning: 20, social: 40, decision: 40, focus: 20, drive: 40 } },
    ],
  },
  // DRIVE SOURCE questions
  {
    id: 13,
    question: "อะไรคือแรงผลักดันที่ทำให้คุณลงมือทำ?",
    scenario: "สิ่งที่ทำให้คุณรู้สึกอยากลงมือทำคือ...",
    axisFocus: "drive",
    options: [
      { label: "เป้าหมายที่ชัดเจน วัดผลได้", score: { energy: 70, planning: 80, social: 40, decision: 60, focus: 70, drive: 95 } },
      { label: "ความสนุกและความรู้สึกที่ดี", score: { energy: 80, planning: 30, social: 60, decision: 50, focus: 40, drive: 30 } },
      { label: "คนที่ต้องพึ่งพาฉัน รับผิดชอบต่อใครบางคน", score: { energy: 60, planning: 60, social: 80, decision: 50, focus: 60, drive: 70 } },
      { label: "การเติบโตและเรียนรู้สิ่งใหม่ๆ", score: { energy: 60, planning: 50, social: 50, decision: 60, focus: 60, drive: 85 } },
    ],
  },
  {
    id: 14,
    question: "คุณมองเห็นความสำเร็จในชีวิตอย่างไร?",
    scenario: "ถ้านึกภาพความสำเร็จในแบบของคุณ...",
    axisFocus: "drive",
    options: [
      { label: "ไต่ระดับขึ้นไปถึงจุดสูงสุด ชนะเลิศ", score: { energy: 80, planning: 70, social: 50, decision: 70, focus: 70, drive: 95 } },
      { label: "มีชีวิตที่สงบ สมดุล ไม่ไล่ตามอะไร", score: { energy: 40, planning: 40, social: 50, decision: 50, focus: 50, drive: 20 } },
      { label: "สร้างผลกระทบให้คนรอบข้าง", score: { energy: 60, planning: 60, social: 80, decision: 50, focus: 60, drive: 80 } },
      { label: "เติบโตอย่างต่อเนื่อง ไม่หยุดยั้ง", score: { energy: 60, planning: 60, social: 40, decision: 60, focus: 70, drive: 85 } },
    ],
  },
  // Additional mixed axis questions
  {
    id: 15,
    question: "วันหยุดยาวของคุณเป็นอย่างไร?",
    scenario: "มีวันหยุด 3 วันติดต่อกัน คุณจะ...",
    axisFocus: "mixed",
    options: [
      { label: "วางแผนทั้ง 3 วันล่วงหน้า ใช้เวลาให้คุ้ม", score: { energy: 75, planning: 95, social: 40, decision: 60, focus: 70, drive: 80 } },
      { label: "ไม่วางแผน ปล่อยให้วันพาไป", score: { energy: 50, planning: 10, social: 50, decision: 30, focus: 20, drive: 30 } },
      { label: "เจอเพื่อน ทำกิจกรรมทางสังคม", score: { energy: 80, planning: 30, social: 95, decision: 30, focus: 30, drive: 50 } },
      { label: "อยู่บ้านเงียบๆ ทำงานอดิเรก", score: { energy: 30, planning: 40, social: 10, decision: 50, focus: 70, drive: 60 } },
    ],
  },
  {
    id: 16,
    question: "เมื่อต้องเผชิญกับความท้าทายใหม่ๆ คุณรู้สึกอย่างไร?",
    scenario: "ได้รับมอบหมายงานที่ไม่เคยทำมาก่อน...",
    axisFocus: "mixed",
    options: [
      { label: "ตื่นเต้น! อยากลองทำทันที", score: { energy: 90, planning: 40, social: 50, decision: 80, focus: 40, drive: 80 } },
      { label: "กังวล ต้องเตรียมตัวให้พร้อมก่อน", score: { energy: 40, planning: 80, social: 30, decision: 30, focus: 80, drive: 60 } },
      { label: "ถามคนที่มีประสบการณ์ก่อน", score: { energy: 50, planning: 60, social: 80, decision: 40, focus: 50, drive: 50 } },
      { label: "มองหาวิธีที่ฉลาดและง่ายที่สุด", score: { energy: 55, planning: 50, social: 40, decision: 80, focus: 50, drive: 70 } },
    ],
  },
  {
    id: 17,
    question: "คุณชอบทำงานในลักษณะไหนมากกว่า?",
    scenario: "ถ้าเลือกได้ในการทำงาน...",
    axisFocus: "mixed",
    options: [
      { label: "ทำคนเดียว โฟกัสได้เต็มที่", score: { energy: 50, planning: 60, social: 10, decision: 60, focus: 85, drive: 70 } },
      { label: "เป็นทีม มีปฏิสัมพันธ์กับคนอื่น", score: { energy: 70, planning: 60, social: 95, decision: 50, focus: 50, drive: 60 } },
      { label: "สลับไปมา ขึ้นกับงาน", score: { energy: 60, planning: 50, social: 50, decision: 50, focus: 50, drive: 60 } },
      { label: "มีหัวหน้าบอกทิศทางชัดๆ", score: { energy: 50, planning: 70, social: 40, decision: 40, focus: 60, drive: 60 } },
    ],
  },
  {
    id: 18,
    question: "เมื่อทำสิ่งที่ไม่ชอบ คุณจะ?",
    scenario: "มีงานที่ต้องทำแต่ไม่ชอบใจ...",
    axisFocus: "mixed",
    options: [
      { label: "ทำให้เสร็จเร็วๆ ไม่ยืดเวลา", score: { energy: 80, planning: 80, social: 30, decision: 60, focus: 70, drive: 70 } },
      { label: "หลีกเลี่ยง หาทางให้คนอื่นทำแทน", score: { energy: 30, planning: 30, social: 50, decision: 40, focus: 20, drive: 30 } },
      { label: "หาวิธีทำให้สนุกขึ้น ผูกกับสิ่งที่ชอบ", score: { energy: 70, planning: 40, social: 50, decision: 60, focus: 50, drive: 60 } },
      { label: "ยอมรับว่าต้องทำ แล้วทำไปเรื่อยๆ", score: { energy: 40, planning: 40, social: 40, decision: 50, focus: 40, drive: 40 } },
    ],
  },
  {
    id: 19,
    question: "คุณคิดว่าอะไรคือสิ่งที่ทำให้ชีวิตดี?",
    scenario: "ถ้าให้คุณนิยามความสำเร็จในชีวิต...",
    axisFocus: "mixed",
    options: [
      { label: "ความสำเร็จที่วัดได้ ตำแหน่ง รายได้", score: { energy: 70, planning: 70, social: 40, decision: 70, focus: 70, drive: 95 } },
      { label: "ความสงบ ความสุขในครอบครัว", score: { energy: 40, planning: 50, social: 70, decision: 50, focus: 50, drive: 40 } },
      { label: "ได้เรียนรู้และเติบโตตลอดเวลา", score: { energy: 60, planning: 50, social: 50, decision: 60, focus: 70, drive: 85 } },
      { label: "ได้ช่วยเหลือคนอื่นและสร้างผลกระทบ", score: { energy: 60, planning: 60, social: 90, decision: 50, focus: 60, drive: 80 } },
    ],
  },
  {
    id: 20,
    question: "เมื่อวางแผนไม่สำเร็จ คุณจะรู้สึกอย่างไร?",
    scenario: "แผนที่วางไว้ไม่เป็นอย่างที่คิด...",
    axisFocus: "mixed",
    options: [
      { label: "ผิดหวัง ต้องแก้ไขทันที", score: { energy: 70, planning: 80, social: 40, decision: 60, focus: 60, drive: 70 } },
      { label: "ยืดหยุ่น ปรับแผนใหม่ทันที", score: { energy: 60, planning: 30, social: 50, decision: 80, focus: 50, drive: 70 } },
      { label: "ไม่เป็นไร ปล่อยวันพาไป", score: { energy: 40, planning: 20, social: 50, decision: 50, focus: 30, drive: 30 } },
      { label: "ดีใจที่ได้เรียนรู้บทเรียนใหม่", score: { energy: 50, planning: 50, social: 40, decision: 60, focus: 60, drive: 70 } },
    ],
  },
  {
    id: 21,
    question: "คุณชอบบรรยากาศในการทำงานแบบไหนมากกว่า?",
    scenario: "เลือกได้ทั้งหมด คุณชอบที่ไหนมากกว่า...",
    axisFocus: "mixed",
    options: [
      { label: "เงียบ สงบ มีสมาธิได้ง่าย", score: { energy: 40, planning: 60, social: 10, decision: 50, focus: 90, drive: 60 } },
      { label: "มีชีวิตชีวา พูดคุยกันได้", score: { energy: 80, planning: 40, social: 95, decision: 40, focus: 40, drive: 60 } },
      { label: "มีเพลงเบาๆ ทำงานได้ดี", score: { energy: 60, planning: 50, social: 40, decision: 50, focus: 60, drive: 60 } },
      { label: "ไม่สำคัญ ขอให้ทำได้ก็พอ", score: { energy: 50, planning: 40, social: 50, decision: 50, focus: 50, drive: 50 } },
    ],
  },
  {
    id: 22,
    question: "เมื่อรู้ว่ามีคนต้องการความช่วยเหลือจากคุณ คุณจะ?",
    scenario: "มีคนในชีวิตที่ต้องการความช่วยเหลือ...",
    axisFocus: "mixed",
    options: [
      { label: "ช่วยทันที ไม่ลังเล", score: { energy: 80, planning: 50, social: 90, decision: 70, focus: 50, drive: 70 } },
      { label: "ชั่งน้ำหนักก่อน ดูว่าพร้อมแค่ไหน", score: { energy: 50, planning: 70, social: 50, decision: 30, focus: 60, drive: 50 } },
      { label: "ปรึกษาคนอื่นก่อน ว่าควรช่วยอย่างไร", score: { energy: 40, planning: 60, social: 70, decision: 40, focus: 50, drive: 50 } },
      { label: "ต้องรู้ก่อนว่าช่วยแล้วจะเป็นอย่างไร", score: { energy: 50, planning: 80, social: 30, decision: 20, focus: 80, drive: 60 } },
    ],
  },
];

export default QUIZ_DATA;
