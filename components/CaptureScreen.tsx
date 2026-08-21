'use client';

import { useRef } from 'react';
import Button from './Button';

interface Props {
  previewUrl: string | null;
  busy: boolean;
  error: { message: string; hint?: string } | null;
  onPick: (file: File) => void;
  onAnalyze: () => void;
  onReset: () => void;
}

export default function CaptureScreen({
  previewUrl,
  busy,
  error,
  onPick,
  onAnalyze,
  onReset,
}: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onPick(file);
    // เคลียร์ค่า เพื่อให้เลือกไฟล์เดิมซ้ำได้
    event.target.value = '';
  };

  return (
    <div className="flex flex-col gap-5">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      <div
        className="surface flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-primary-50"
        aria-live="polite"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="รูปสินค้าที่เพิ่งถ่าย"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="px-8 text-center text-primary-400">
            <div aria-hidden className="text-[5rem] leading-none">📷</div>
            <p className="mt-4 text-[1.2rem] font-bold text-primary-700">
              ยังไม่มีรูป
            </p>
            <p className="mt-1 text-[1rem]">กดปุ่มด้านล่างเพื่อถ่ายรูปสินค้า</p>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border-2 border-[#E7A9A9] bg-[#FDECEC] p-5 text-[#9B1C1C]"
        >
          <p className="text-[1.1rem] font-bold">{error.message}</p>
          {error.hint && <p className="mt-1 text-[0.95rem]">{error.hint}</p>}
        </div>
      )}

      {previewUrl ? (
        <>
          <Button onClick={onAnalyze} disabled={busy}>
            {busy ? (
              <>
                <span
                  aria-hidden
                  className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/40 border-t-white"
                />
                กำลังนับสินค้า...
              </>
            ) : (
              <>🔎 เริ่มนับสินค้า</>
            )}
          </Button>
          <Button variant="secondary" onClick={onReset} disabled={busy}>
            ↺ ถ่ายรูปใหม่
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => cameraRef.current?.click()}>📷 ถ่ายรูปสินค้า</Button>
          <Button variant="secondary" onClick={() => galleryRef.current?.click()}>
            🖼️ เลือกรูปจากเครื่อง
          </Button>
        </>
      )}
    </div>
  );
}
