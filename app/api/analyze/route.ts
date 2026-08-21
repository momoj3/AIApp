import { NextResponse } from 'next/server';
import type { AnalysisResult, DetectedItem } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const DEFAULT_MODEL = 'gpt-4o';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `คุณเป็นผู้ช่วยตรวจนับสินค้าคงคลังจากรูปถ่าย

หน้าที่ของคุณ:
1. ดูรูปแล้วระบุว่ามีสินค้าประเภทใดอยู่ในรูป
2. นับจำนวนชิ้นของแต่ละประเภทให้แม่นยำที่สุด
3. ตอบเป็นภาษาไทยเท่านั้น

กฎการนับ:
- นับเฉพาะสินค้า/วัตถุที่เป็นของนับได้ ไม่ต้องนับพื้น โต๊ะ ผนัง มือคน หรือฉากหลัง
- จัดกลุ่มสิ่งที่เป็นชนิดเดียวกันเข้าเป็นรายการเดียว แล้วใส่จำนวนรวม
- ถ้าต่างยี่ห้อ ต่างขนาด หรือต่างสีอย่างชัดเจน ให้แยกเป็นรายการต่างหาก และเขียนความต่างไว้ในช่อง detail
- ชื่อสินค้าใช้คำไทยสั้น กระชับ เข้าใจง่าย เช่น "ขวดน้ำดื่ม" "กล่องนม" "ซองบะหมี่กึ่งสำเร็จรูป"
- ห้ามเดาจำนวนแบบสุ่ม ถ้าของซ้อนทับกันจนเห็นไม่ครบ ให้นับเท่าที่เห็นจริง แล้วตั้ง confidence เป็น "low" หรือ "medium"
- confidence: "high" = เห็นชัดครบทุกชิ้น, "medium" = เห็นเกือบครบ อาจคลาดเคลื่อน 1-2 ชิ้น, "low" = ซ้อนกันมาก/เบลอ/มืด
- needsReview ให้เป็น true เมื่อรูปไม่ชัด ของซ้อนกันหนัก หรือมีรายการใดได้ confidence เป็น "low"
- ถ้าในรูปไม่มีสินค้าที่นับได้เลย ให้คืน items เป็นลิสต์ว่าง และอธิบายเหตุผลใน summary

summary: สรุปสั้น 1-2 ประโยคภาษาไทย บอกภาพรวมว่าเห็นอะไร รวมกี่ชิ้น และมีอะไรที่ควรตรวจซ้ำ`;

const RESPONSE_SCHEMA = {
  name: 'product_count',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['items', 'summary', 'needsReview'],
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'count', 'confidence', 'detail'],
          properties: {
            name: { type: 'string', description: 'ชื่อสินค้าภาษาไทย สั้น กระชับ' },
            count: { type: 'integer', minimum: 0, description: 'จำนวนชิ้นที่นับได้' },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
            detail: {
              type: 'string',
              description: 'รายละเอียดเพิ่มเติม เช่น ยี่ห้อ ขนาด สี — ถ้าไม่มีให้ใส่สตริงว่าง',
            },
          },
        },
      },
      summary: { type: 'string', description: 'สรุปภาพรวม 1-2 ประโยคภาษาไทย' },
      needsReview: { type: 'boolean', description: 'true ถ้าควรให้คนตรวจซ้ำ' },
    },
  },
} as const;

interface ModelPayload {
  items: Array<{ name: string; count: number; confidence: string; detail: string }>;
  summary: string;
  needsReview: boolean;
}

function fail(message: string, status: number, hint?: string) {
  return NextResponse.json({ error: message, hint }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fail(
      'ยังไม่ได้ตั้งค่า OPENAI_API_KEY',
      500,
      'คัดลอก .env.example เป็น .env.local ใส่คีย์ของคุณ แล้วรีสตาร์ต npm run dev',
    );
  }

  let imageDataUrl: string;
  try {
    const body = (await request.json()) as { image?: unknown };
    if (typeof body.image !== 'string' || !body.image.startsWith('data:image/')) {
      return fail('ไม่พบรูปภาพในคำขอ', 400);
    }
    imageDataUrl = body.image;
  } catch {
    return fail('รูปแบบคำขอไม่ถูกต้อง', 400);
  }

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  let response: Response;
  try {
    response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_completion_tokens: 1500,
        response_format: { type: 'json_schema', json_schema: RESPONSE_SCHEMA },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'ช่วยนับสินค้าในรูปนี้ให้ครบทุกชิ้น' },
              { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
            ],
          },
        ],
      }),
    });
  } catch {
    return fail('เชื่อมต่อ OpenAI ไม่สำเร็จ', 502, 'ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง');
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error('OpenAI error', response.status, detail);
    if (response.status === 401) {
      return fail('คีย์ OpenAI ไม่ถูกต้องหรือหมดอายุ', 401, 'ตรวจสอบค่าใน .env.local');
    }
    if (response.status === 429) {
      return fail('เรียกใช้ถี่เกินไปหรือเครดิตหมด', 429, 'รอสักครู่แล้วลองอีกครั้ง');
    }
    return fail(`OpenAI ตอบกลับผิดพลาด (${response.status})`, 502);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string; refusal?: string } }>;
  };
  const message = completion.choices?.[0]?.message;
  if (message?.refusal) {
    return fail('โมเดลปฏิเสธการวิเคราะห์รูปนี้', 422, message.refusal);
  }
  if (!message?.content) {
    return fail('โมเดลไม่ส่งผลลัพธ์กลับมา', 502);
  }

  let payload: ModelPayload;
  try {
    payload = JSON.parse(message.content) as ModelPayload;
  } catch {
    return fail('อ่านผลลัพธ์จากโมเดลไม่ได้', 502);
  }

  const items: DetectedItem[] = (payload.items ?? []).map((raw) => ({
    name: raw.name?.trim() || 'สินค้าไม่ระบุชนิด',
    count: Number.isFinite(raw.count) ? Math.max(0, Math.round(raw.count)) : 0,
    confidence:
      raw.confidence === 'high' || raw.confidence === 'medium' ? raw.confidence : 'low',
    detail: raw.detail?.trim() || undefined,
  }));

  const result: AnalysisResult = {
    items,
    summary: payload.summary?.trim() || 'ไม่มีสรุปจากระบบ',
    needsReview: Boolean(payload.needsReview) || items.some((i) => i.confidence === 'low'),
    model,
  };

  return NextResponse.json(result);
}
