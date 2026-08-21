'use client';

import { useState } from 'react';
import Button from './Button';
import { CONFIDENCE_LABEL, CONFIDENCE_STYLE, formatThaiDateTime } from '@/lib/format';
import { totalOf, type Transaction } from '@/lib/types';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onGoCapture: () => void;
}

function Card({ entry, onDelete }: { entry: Transaction; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left hover:bg-[var(--color-surface)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.thumbnail}
          alt=""
          className="h-20 w-20 shrink-0 rounded-xl bg-primary-50 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[1rem] font-bold text-[var(--color-text-muted)]">
            {formatThaiDateTime(entry.createdAt)}
          </p>
          <p className="text-[1.6rem] leading-tight font-extrabold text-primary-500">
            {totalOf(entry.items)} ชิ้น
          </p>
          <p className="truncate text-[0.95rem] text-[var(--color-text-muted)]">
            {entry.items.length} ประเภท
            {entry.edited && ' · แก้ด้วยมือ'}
            {entry.needsReview && ' · ควรตรวจซ้ำ'}
          </p>
        </div>
        <span aria-hidden className="shrink-0 text-[1.4rem] text-primary-400">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="border-t border-[var(--color-border)] p-5">
          {entry.items.length === 0 ? (
            <p className="text-[1.05rem]">ไม่พบสินค้าในรูปนี้</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {entry.items.map((item, index) => (
                <li
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between gap-3 border-b border-[var(--color-hairline)] pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-[1.15rem] font-bold break-words">{item.name}</p>
                    {item.detail && (
                      <p className="text-[0.9rem] text-[var(--color-text-muted)]">
                        {item.detail}
                      </p>
                    )}
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[0.85rem] font-bold ${CONFIDENCE_STYLE[item.confidence]}`}
                    >
                      {CONFIDENCE_LABEL[item.confidence]}
                    </span>
                  </div>
                  <p className="shrink-0 text-[2rem] leading-none font-extrabold text-primary-500">
                    {item.count}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-[1rem] text-[var(--color-text-muted)]">{entry.summary}</p>

          <div className="mt-5">
            {confirming ? (
              <div className="flex flex-col gap-3">
                <p className="text-center text-[1.05rem] font-bold">ลบรายการนี้ถาวรหรือไม่?</p>
                <Button variant="danger" onClick={onDelete}>
                  ใช่ ลบเลย
                </Button>
                <Button variant="secondary" onClick={() => setConfirming(false)}>
                  ยกเลิก
                </Button>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirming(true)}>
                🗑️ ลบรายการนี้
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export default function HistoryScreen({
  transactions,
  onDelete,
  onClearAll,
  onGoCapture,
}: Props) {
  const [confirmClear, setConfirmClear] = useState(false);

  if (transactions.length === 0) {
    return (
      <div className="surface p-8 text-center">
        <div aria-hidden className="text-[4rem] leading-none">🗂️</div>
        <p className="mt-4 text-[1.3rem] font-bold">ยังไม่มีประวัติการนับ</p>
        <p className="mt-1 text-[1rem] text-[var(--color-text-muted)]">
          ถ่ายรูปสินค้าครั้งแรก แล้วกดบันทึก ประวัติจะมาอยู่ที่นี่
        </p>
        <div className="mt-6">
          <Button onClick={onGoCapture}>📷 ไปถ่ายรูป</Button>
        </div>
      </div>
    );
  }

  const grandTotal = transactions.reduce((sum, t) => sum + totalOf(t.items), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="surface flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-[1rem] text-[var(--color-text-muted)]">บันทึกไว้</p>
          <p className="text-[2rem] leading-none font-extrabold text-primary-500">
            {transactions.length} ครั้ง
          </p>
        </div>
        <div className="text-right">
          <p className="text-[1rem] text-[var(--color-text-muted)]">รวมทุกครั้ง</p>
          <p className="text-[2rem] leading-none font-extrabold text-primary-500">
            {grandTotal} ชิ้น
          </p>
        </div>
      </div>

      <ul className="flex list-none flex-col gap-4 p-0">
        {transactions.map((entry) => (
          <Card key={entry.id} entry={entry} onDelete={() => onDelete(entry.id)} />
        ))}
      </ul>

      {confirmClear ? (
        <div className="surface flex flex-col gap-3 p-5">
          <p className="text-center text-[1.1rem] font-bold">
            ลบประวัติทั้งหมด {transactions.length} รายการ?
          </p>
          <Button
            variant="danger"
            onClick={() => {
              onClearAll();
              setConfirmClear(false);
            }}
          >
            ใช่ ลบทั้งหมด
          </Button>
          <Button variant="secondary" onClick={() => setConfirmClear(false)}>
            ยกเลิก
          </Button>
        </div>
      ) : (
        <Button variant="danger" onClick={() => setConfirmClear(true)}>
          🗑️ ลบประวัติทั้งหมด
        </Button>
      )}
    </div>
  );
}
