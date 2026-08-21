export type Confidence = 'high' | 'medium' | 'low';

/** สินค้าหนึ่งรายการที่ AI นับได้จากรูป */
export interface DetectedItem {
  /** ชื่อสินค้าภาษาไทย เช่น "ขวดน้ำดื่ม" */
  name: string;
  /** จำนวนชิ้นที่นับได้ */
  count: number;
  /** ความมั่นใจของ AI ต่อรายการนี้ */
  confidence: Confidence;
  /** รายละเอียดเพิ่มเติม เช่น ยี่ห้อ ขนาด สี */
  detail?: string;
}

/** ผลลัพธ์ที่ได้จาก /api/analyze */
export interface AnalysisResult {
  items: DetectedItem[];
  /** สรุปภาพรวมสั้น ๆ ที่ AI เขียนให้ */
  summary: string;
  /** true เมื่อ AI มองว่ารูปไม่ชัด/ซ้อนกันจนนับได้ไม่แน่นอน */
  needsReview: boolean;
  model: string;
}

/** 1 ครั้งของการถ่ายรูป + นับ ที่บันทึกลง localStorage */
export interface Transaction {
  id: string;
  /** ISO string เวลาที่บันทึก */
  createdAt: string;
  items: DetectedItem[];
  summary: string;
  needsReview: boolean;
  model: string;
  /** รูปย่อ (data URL) เก็บไว้ดูย้อนหลัง */
  thumbnail: string;
  /** true ถ้าผู้ใช้แก้จำนวนด้วยมือหลัง AI นับ */
  edited: boolean;
}

export const totalOf = (items: DetectedItem[]): number =>
  items.reduce((sum, item) => sum + item.count, 0);
