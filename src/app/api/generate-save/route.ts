// src/app/api/generate-save/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs'; // Buffer 쓰려면 node 런타임 보장

function toDataUrl(b64: string, mime = 'image/png') {
  return `data:${mime};base64,${b64}`;
}

// 외부 URL을 받아 dataURL로 변환
async function downloadToDataUrl(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('download fail ' + res.status);
  const arrayBuf = await res.arrayBuffer();
  const b64 = Buffer.from(arrayBuf).toString('base64');
  // 간단히 png 가정. 필요하면 res.headers.get('content-type') 확인
  return toDataUrl(b64);
}

export async function POST(req: Request) {
  try {
    const { name, prompt } = await req.json();

    let imageDataUrl = '';
    const similarity = Math.floor(Math.random() * 101); // TODO: mediapipe로 교체

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      // response_format 제거
      const gen = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: '512x512',
        // quality: 'high', // (필요 시)
        // n: 1, // 기본 1 이라 생략 가능
      });

      const first = gen.data?.[0];
      if (first?.b64_json) {
        imageDataUrl = toDataUrl(first.b64_json);
      } else if (first?.url) {
        imageDataUrl = await downloadToDataUrl(first.url);
      }
    } catch (err) {
      console.error('OpenAI gen fail → fallback', err);
      imageDataUrl = '/dev-image.png';
    }

    if (!imageDataUrl) imageDataUrl = '/dev-image.png';

    // DB 저장 (제출 시점 1회)
    const user =
      (await prisma.user.findFirst({ where: { name } })) ??
      (await prisma.user.create({ data: { name } }));

    const result = await prisma.result.create({
      data: { prompt, imageUrl: imageDataUrl, similarity, userId: user.id },
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
