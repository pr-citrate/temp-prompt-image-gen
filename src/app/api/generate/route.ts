// src/app/api/generate/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

function toDataUrl(b64: string, mime = 'image/png') {
  return `data:${mime};base64,${b64}`;
}

async function urlToDataUrl(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('download fail: ' + res.status);
  const mime = res.headers.get('content-type') || 'image/png';
  const buf = Buffer.from(await res.arrayBuffer());
  return toDataUrl(buf.toString('base64'), mime);
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const gen = await openai.images.generate({ prompt, size: '512x512', n: 1 });

    const first = gen.data?.[0];
    let dataUrl = '';

    if (first?.b64_json) {
      dataUrl = toDataUrl(first.b64_json);
    } else if (first?.url) {
      dataUrl = await urlToDataUrl(first.url);
    }

    if (!dataUrl) throw new Error('no image returned');

    return NextResponse.json({ ok: true, dataUrl });
  } catch (e) {
    console.error('[api/generate]', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
