# ฟอนต์ LINE Seed Sans TH (self-host)

`LINE Seed Sans TH` ไม่ได้อยู่บน Google Fonts จึงต้องโหลดไฟล์มาวางเอง
ระหว่างที่ยังไม่ได้ทำ แอปจะใช้ `Noto Sans Thai` ที่เป็น fallback ตาม CI ซึ่งอ่านภาษาไทยได้ดีอยู่แล้ว

## วิธีทำ

1. ดาวน์โหลดชุดฟอนต์จากเว็บทางการ https://seed.line.me/index_th.html
2. แปลง / คัดลอกไฟล์ `.woff2` มาวางในโฟลเดอร์นี้ โดยตั้งชื่อว่า

   ```
   public/fonts/LINESeedSansTH_W400.woff2
   public/fonts/LINESeedSansTH_W700.woff2
   public/fonts/LINESeedSansTH_W800.woff2
   ```

3. เปิด `app/globals.css` แล้วเอาคอมเมนต์ออกจากบล็อก `@font-face` ที่เตรียมไว้ให้ (ท้ายไฟล์)

เท่านี้ทั้งแอปจะเปลี่ยนไปใช้ LINE Seed Sans TH ทันที เพราะ `--font-sans` วางชื่อฟอนต์นี้ไว้เป็นตัวแรกอยู่แล้ว
