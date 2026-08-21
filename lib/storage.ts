'use client';

import type { Transaction } from './types';

const STORAGE_KEY = 'stockcount.transactions.v1';
/** เก็บได้สูงสุดกี่รายการ — กัน localStorage เต็ม (โควตาปกติ ~5MB) */
const MAX_ENTRIES = 60;

function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Partial<Transaction>;
  return (
    typeof t.id === 'string' &&
    typeof t.createdAt === 'string' &&
    Array.isArray(t.items)
  );
}

export function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTransaction);
  } catch {
    return [];
  }
}

function persist(list: Transaction[]): Transaction[] {
  const trimmed = list.slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch {
    // โควตาเต็ม — ตัดรายการเก่าออกครึ่งหนึ่งแล้วลองอีกครั้ง
    const halved = trimmed.slice(0, Math.max(1, Math.floor(trimmed.length / 2)));
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(halved));
      return halved;
    } catch {
      return trimmed;
    }
  }
}

/** เพิ่มรายการใหม่ไว้บนสุด แล้วคืนลิสต์ทั้งหมดหลังบันทึก */
export function addTransaction(entry: Transaction): Transaction[] {
  return persist([entry, ...loadTransactions()]);
}

export function updateTransaction(entry: Transaction): Transaction[] {
  return persist(loadTransactions().map((t) => (t.id === entry.id ? entry : t)));
}

export function deleteTransaction(id: string): Transaction[] {
  return persist(loadTransactions().filter((t) => t.id !== id));
}

export function clearTransactions(): Transaction[] {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ไม่มีอะไรต้องทำ */
  }
  return [];
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
