import type { Confidence } from './types';

/** วัน-เวลาแบบไทย เช่น "21 ส.ค. 2569 15:42" */
export function formatThaiDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: 'มั่นใจสูง',
  medium: 'มั่นใจกลาง',
  low: 'ควรตรวจซ้ำ',
};

/** สีป้ายความมั่นใจ — อยู่ในกรอบ CI ทั้งหมด */
export const CONFIDENCE_STYLE: Record<Confidence, string> = {
  high: 'bg-primary-100 text-primary-700',
  medium: 'bg-accent-300/50 text-primary-800',
  low: 'bg-[#FDECEC] text-[#9B1C1C]',
};
