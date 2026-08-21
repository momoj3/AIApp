'use client';

import Button from './Button';
import { CONFIDENCE_LABEL, CONFIDENCE_STYLE } from '@/lib/format';
import { totalOf, type AnalysisResult, type DetectedItem } from '@/lib/types';

interface Props {
  result: AnalysisResult;
  previewUrl: string | null;
  edited: boolean;
  saved: boolean;
  /** delta = +1 / -1 — ส่งเป็นส่วนต่างเพื่อให้กดรัว ๆ ไม่ตกหล่น */
  onChangeCount: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onSave: () => void;
  onRestart: () => void;
}

function Stepper({
  item,
  onChange,
  onRemove,
}: {
  item: DetectedItem;
  onChange: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[1.35rem] leading-snug font-bold break-words">{item.name}</p>
          {item.detail && (
            <p className="mt-1 text-[0.95rem] text-[var(--color-text-muted)]">{item.detail}</p>
          )}
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-[0.9rem] font-bold ${CONFIDENCE_STYLE[item.confidence]}`}
          >
            {CONFIDENCE_LABEL[item.confidence]}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`ลบรายการ ${item.name}`}
          className="shrink-0 rounded-xl px-3 py-2 text-[1.4rem] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
        >
          🗑️
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onChange(-1)}
          disabled={item.count <= 0}
          aria-label={`ลดจำนวน ${item.name}`}
          className="h-16 w-16 shrink-0 rounded-2xl border-2 border-primary-500 text-[2rem] font-bold text-primary-500 hover:bg-primary-50 disabled:border-primary-200 disabled:text-primary-200"
        >
          −
        </button>
        <div className="text-center">
          <p className="text-[3rem] leading-none font-extrabold text-primary-500">{item.count}</p>
          <p className="text-[0.9rem] text-[var(--color-text-muted)]">ชิ้น</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(1)}
          aria-label={`เพิ่มจำนวน ${item.name}`}
          className="h-16 w-16 shrink-0 rounded-2xl bg-primary-500 text-[2rem] font-bold text-white hover:bg-primary-600"
        >
          +
        </button>
      </div>
    </li>
  );
}

export default function ResultScreen({
  result,
  previewUrl,
  edited,
  saved,
  onChangeCount,
  onRemoveItem,
  onSave,
  onRestart,
}: Props) {
  const total = totalOf(result.items);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl bg-linear-[135deg,#2D1B4E_0%,#4E2E7F_55%,#8B5CF6_100%] p-7 text-center text-white">
        <p className="text-[1.1rem] font-bold text-primary-100">นับได้ทั้งหมด</p>
        <p className="mt-1 text-[4.5rem] leading-none font-extrabold">{total}</p>
        <p className="text-[1.2rem] font-bold">ชิ้น</p>
        <p className="mt-2 text-[1rem] text-primary-100">
          {result.items.length} ประเภทสินค้า
        </p>
      </div>

      {result.needsReview && (
        <div className="rounded-2xl border-2 border-[#F0C486] bg-[#FEF6E7] p-5 text-[#8A4B08]">
          <p className="text-[1.1rem] font-bold">⚠️ ควรตรวจนับซ้ำด้วยตาอีกครั้ง</p>
          <p className="mt-1 text-[0.95rem]">
            รูปอาจไม่ชัดหรือสินค้าซ้อนกัน ปรับจำนวนด้วยปุ่ม + / − ได้เลย
          </p>
        </div>
      )}

      <div className="surface p-5">
        <p className="text-[1.05rem] font-bold text-primary-700">สรุปจากระบบ</p>
        <p className="mt-1 text-[1.05rem]">{result.summary}</p>
      </div>

      {previewUrl && (
        <div className="surface overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="รูปที่ใช้นับ" className="max-h-64 w-full object-contain" />
        </div>
      )}

      {result.items.length === 0 ? (
        <div className="surface p-7 text-center">
          <p className="text-[1.2rem] font-bold">ไม่พบสินค้าที่นับได้ในรูปนี้</p>
          <p className="mt-1 text-[1rem] text-[var(--color-text-muted)]">
            ลองถ่ายให้ใกล้ขึ้น แสงสว่างขึ้น หรือจัดสินค้าไม่ให้ซ้อนกัน
          </p>
        </div>
      ) : (
        <ul className="flex list-none flex-col gap-4 p-0">
          {result.items.map((item, index) => (
            <Stepper
              key={`${item.name}-${index}`}
              item={item}
              onChange={(delta) => onChangeCount(index, delta)}
              onRemove={() => onRemoveItem(index)}
            />
          ))}
        </ul>
      )}

      {edited && (
        <p className="text-center text-[0.95rem] text-[var(--color-text-muted)]">
          ✏️ จำนวนถูกแก้ด้วยมือ — ระบบจะบันทึกว่ามีการแก้ไข
        </p>
      )}

      <Button onClick={onSave} disabled={saved}>
        {saved ? '✅ บันทึกลงประวัติแล้ว' : '💾 บันทึกลงประวัติ'}
      </Button>
      <Button variant="secondary" onClick={onRestart}>
        📷 ถ่ายรูปถัดไป
      </Button>
    </div>
  );
}
