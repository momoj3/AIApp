'use client';

/** ย่อรูปด้วย canvas แล้วคืนเป็น data URL (image/jpeg) */
async function resize(file: Blob, maxEdge: number, quality: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('เบราว์เซอร์นี้ไม่รองรับการย่อรูป');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', quality);
}

/** รูปที่ส่งให้ AI วิเคราะห์ — ใหญ่พอให้เห็นรายละเอียดสินค้า */
export const toAnalysisImage = (file: Blob): Promise<string> => resize(file, 1280, 0.82);

/** รูปย่อสำหรับเก็บในประวัติ (localStorage) — ต้องเล็กเพื่อไม่ให้โควตาเต็ม */
export const toThumbnail = (file: Blob): Promise<string> => resize(file, 320, 0.6);
