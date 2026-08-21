import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'นับสินค้าด้วยกล้อง',
  description: 'ถ่ายรูปสินค้าแล้วให้ AI นับจำนวนให้ พร้อมเก็บประวัติการนับในเครื่อง',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'นับสินค้า',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4E2E7F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        {/*
          ฟอนต์หลักตาม CI คือ LINE Seed Sans TH ซึ่ง "ไม่มี" บน Google Fonts
          ต้อง self-host เอง — ดูวิธีในไฟล์ public/fonts/README.md
          ระหว่างที่ยังไม่ได้ self-host จะใช้ Noto Sans Thai ที่เป็น fallback ตาม CI
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
