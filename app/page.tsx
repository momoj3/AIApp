'use client';

import { useCallback, useEffect, useState } from 'react';
import CaptureScreen from '@/components/CaptureScreen';
import HistoryScreen from '@/components/HistoryScreen';
import ResultScreen from '@/components/ResultScreen';
import { toAnalysisImage, toThumbnail } from '@/lib/image';
import {
  addTransaction,
  clearTransactions,
  deleteTransaction,
  loadTransactions,
  newId,
} from '@/lib/storage';
import type { AnalysisResult, Transaction } from '@/lib/types';

type Tab = 'capture' | 'history';
interface AppError {
  message: string;
  hint?: string;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('capture');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [edited, setEdited] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // โหลดประวัติจาก localStorage หลัง mount (เลี่ยง hydration mismatch)
  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  const resetCapture = useCallback(() => {
    setAnalysisImage(null);
    setThumbnail(null);
    setResult(null);
    setError(null);
    setEdited(false);
    setSavedId(null);
  }, []);

  const handlePick = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setSavedId(null);
    setEdited(false);
    try {
      const [full, thumb] = await Promise.all([toAnalysisImage(file), toThumbnail(file)]);
      setAnalysisImage(full);
      setThumbnail(thumb);
    } catch {
      setError({
        message: 'เปิดรูปนี้ไม่ได้',
        hint: 'ลองถ่ายใหม่ หรือเลือกไฟล์รูปแบบ JPG / PNG',
      });
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!analysisImage) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: analysisImage }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const err = payload as { error?: string; hint?: string };
        setError({ message: err.error ?? 'วิเคราะห์รูปไม่สำเร็จ', hint: err.hint });
        return;
      }
      setResult(payload as AnalysisResult);
      setEdited(false);
    } catch {
      setError({
        message: 'ติดต่อเซิร์ฟเวอร์ไม่ได้',
        hint: 'ตรวจสอบอินเทอร์เน็ตแล้วกดนับอีกครั้ง',
      });
    } finally {
      setBusy(false);
    }
  }, [analysisImage]);

  const handleChangeCount = useCallback((index: number, delta: number) => {
    setResult((current) => {
      if (!current) return current;
      const items = current.items.map((item, i) =>
        i === index ? { ...item, count: Math.max(0, item.count + delta) } : item,
      );
      return { ...current, items };
    });
    setEdited(true);
    setSavedId(null);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setResult((current) =>
      current ? { ...current, items: current.items.filter((_, i) => i !== index) } : current,
    );
    setEdited(true);
    setSavedId(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!result || !thumbnail) return;
    const entry: Transaction = {
      id: newId(),
      createdAt: new Date().toISOString(),
      items: result.items,
      summary: result.summary,
      needsReview: result.needsReview,
      model: result.model,
      thumbnail,
      edited,
    };
    setTransactions(addTransaction(entry));
    setSavedId(entry.id);
  }, [result, thumbnail, edited]);

  const handleDelete = useCallback((id: string) => {
    setTransactions(deleteTransaction(id));
  }, []);

  const handleClearAll = useCallback(() => {
    setTransactions(clearTransactions());
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[560px] flex-col">
      <header className="sticky top-0 z-10 bg-linear-[135deg,#2D1B4E_0%,#4E2E7F_100%] px-5 py-4 text-white">
        <h1 className="m-0 text-[1.5rem] leading-tight font-extrabold">นับสินค้าด้วยกล้อง</h1>
        <p className="m-0 text-[0.95rem] text-primary-200">
          ถ่ายรูป → AI นับให้ → บันทึกเก็บประวัติ
        </p>
      </header>

      <nav className="grid grid-cols-2 gap-0 border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">
        {(
          [
            ['capture', '📷 ถ่ายรูป / นับ'],
            ['history', `🗂️ ประวัติ (${transactions.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-current={tab === key ? 'page' : undefined}
            className={`min-h-[64px] px-3 text-[1.05rem] font-bold ${
              tab === key
                ? 'border-b-4 border-accent-500 bg-primary-50 text-primary-700'
                : 'border-b-4 border-transparent text-[var(--color-text-muted)]'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-5 pb-10">
        {tab === 'capture' ? (
          result ? (
            <ResultScreen
              result={result}
              previewUrl={analysisImage}
              edited={edited}
              saved={savedId !== null}
              onChangeCount={handleChangeCount}
              onRemoveItem={handleRemoveItem}
              onSave={handleSave}
              onRestart={resetCapture}
            />
          ) : (
            <CaptureScreen
              previewUrl={analysisImage}
              busy={busy}
              error={error}
              onPick={handlePick}
              onAnalyze={handleAnalyze}
              onReset={resetCapture}
            />
          )
        ) : (
          <HistoryScreen
            transactions={transactions}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            onGoCapture={() => {
              resetCapture();
              setTab('capture');
            }}
          />
        )}
      </main>

      <footer className="px-5 pb-6 text-center text-[0.9rem] text-[var(--color-text-muted)]">
        ประวัติทั้งหมดเก็บอยู่ในเครื่องนี้เท่านั้น (localStorage)
      </footer>
    </div>
  );
}
