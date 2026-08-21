import type { NextConfig } from 'next';

// Route Handler ใน App Router ไม่มีลิมิต body ในตัว จึงไม่ต้องตั้งค่าเพิ่ม
// รูปถูกย่อเหลือ ~1280px ที่ฝั่งเบราว์เซอร์ก่อนส่งอยู่แล้ว (lib/image.ts)
const nextConfig: NextConfig = {};

export default nextConfig;
