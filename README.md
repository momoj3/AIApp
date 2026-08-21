# นับสินค้าด้วยกล้อง (Stock Count AI)

เว็บแอปสำหรับมือถือ — ถ่ายรูปสินค้า แล้วให้ OpenAI Vision นับว่ามีสินค้าอะไร กี่ชิ้น
พร้อมบันทึกประวัติการนับแต่ละครั้งไว้ใน `localStorage` ของเครื่อง

## ความสามารถ

- **ถ่ายรูป** เปิดกล้องหลังของมือถือโดยตรง หรือเลือกรูปจากคลังภาพ
- **นับด้วย AI** ส่งรูปให้ OpenAI (โมเดล vision) แล้วได้ชื่อสินค้าภาษาไทย + จำนวน + ระดับความมั่นใจ
- **แก้จำนวนเองได้** ปุ่ม `+` / `−` ตัวใหญ่ กดด้วยนิ้วโป้งได้สะดวก ถ้าแก้ระบบจะทำเครื่องหมาย "แก้ด้วยมือ" ไว้
- **ประวัติ (transaction)** เก็บวัน-เวลา รูปย่อ รายการสินค้า จำนวน และยอดรวม ดูย้อนหลัง / ลบทีละรายการ / ลบทั้งหมดได้
- **UI ตัวใหญ่** ฐานตัวอักษร 18px ปุ่มสูงอย่างน้อย 68px เลขจำนวนขนาด 48–72px
- **PWA** เพิ่มลงหน้าจอโฮมของมือถือได้ (`display: standalone`)

## เริ่มใช้งาน

1. ติดตั้ง dependency

   ```bash
   npm install
   ```

2. ตั้งค่าคีย์ OpenAI — คัดลอก `.env.example` เป็น `.env.local` แล้วใส่คีย์ของคุณ

   ```bash
   cp .env.example .env.local
   ```

   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o
   ```

   คีย์อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น (ใช้ใน `app/api/analyze/route.ts`) ไม่หลุดไปที่เบราว์เซอร์

3. รัน dev server

   ```bash
   npm run dev
   ```

   เปิด http://localhost:3000

## เปิดจากมือถือจริง

เบราว์เซอร์จะยอมให้เปิดกล้องเฉพาะบน `localhost` หรือ `https` เท่านั้น
ถ้าจะทดสอบบนมือถือในวง Wi-Fi เดียวกัน ให้ทำ tunnel เป็น https เช่น

```bash
npx localtunnel --port 3000
```

หรือ deploy ขึ้น Vercel (ตั้ง `OPENAI_API_KEY` ใน Environment Variables ของโปรเจกต์)

## โครงสร้างไฟล์

```
app/
  layout.tsx              metadata, viewport, ฟอนต์
  page.tsx                หน้าหลัก — จัดการ state ทั้งหมด (แท็บ / รูป / ผลลัพธ์ / ประวัติ)
  globals.css             CI สีม่วง + ฟอนต์ LINE Seed Sans TH (Tailwind v4 @theme)
  api/analyze/route.ts    เรียก OpenAI พร้อม JSON schema บังคับรูปแบบผลลัพธ์
components/
  Button.tsx              ปุ่มขนาดใหญ่ 3 แบบ (primary / secondary / danger)
  CaptureScreen.tsx       หน้าถ่ายรูป + พรีวิว
  ResultScreen.tsx        หน้าผลลัพธ์ + stepper แก้จำนวน
  HistoryScreen.tsx       หน้าประวัติ + ลบรายการ
lib/
  types.ts                ชนิดข้อมูล DetectedItem / AnalysisResult / Transaction
  storage.ts              อ่าน-เขียน localStorage (จำกัด 60 รายการ + กันโควตาเต็ม)
  image.ts                ย่อรูปด้วย canvas (1280px สำหรับส่ง AI, 320px สำหรับเก็บประวัติ)
  format.ts               จัดรูปแบบวันที่ไทย + ป้ายความมั่นใจ
```

## หมายเหตุเรื่องข้อมูล

- ประวัติเก็บใน `localStorage` คีย์ `stockcount.transactions.v1` — อยู่แค่ในเบราว์เซอร์เครื่องนั้น
  ล้าง cache หรือเปลี่ยนเครื่อง = ข้อมูลหาย และไม่ sync ข้ามอุปกรณ์
- จำกัดไว้ 60 รายการล่าสุด เพราะโควตา `localStorage` ปกติราว 5 MB และแต่ละรายการมีรูปย่อ base64 อยู่ด้วย
- รูปที่ถ่ายจะถูกส่งไปที่ OpenAI API เพื่อวิเคราะห์ (ไม่ได้เก็บบนเซิร์ฟเวอร์ของแอปนี้)

## ธีม

สีและฟอนต์ทั้งหมดมาจาก CI ธนาคารสีม่วง — primary `#4E2E7F`, secondary `#2D1B4E`,
accent `#8B5CF6`, ฟอนต์ LINE Seed Sans TH (น้ำหนัก 400/700/800) มีโทเคน dark mode ครบ

### เรื่องฟอนต์ที่ต้องรู้

`LINE Seed Sans TH` ตาม CI **ไม่มีบน Google Fonts** จึงต้อง self-host เอง
ตอนนี้แอปโหลด `Noto Sans Thai` (fallback ตาม CI) ไว้ให้ก่อน ซึ่งอ่านไทยได้ดีอยู่แล้ว
ถ้าต้องการฟอนต์จริง ทำตาม [public/fonts/README.md](public/fonts/README.md) — วางไฟล์ `.woff2`
แล้วเอาคอมเมนต์ `@font-face` ท้าย `app/globals.css` ออก เท่านั้น

## หมายเหตุตอน dev

อย่ารัน `npm run build` ขณะที่ `npm run dev` กำลังทำงานอยู่ — ทั้งสองใช้โฟลเดอร์ `.next` ร่วมกัน
ตัว build จะเขียนทับทำให้ dev server พัง ถ้าเผลอทำแล้ว ให้หยุด dev server, ลบ `.next`, แล้วรัน `npm run dev` ใหม่
