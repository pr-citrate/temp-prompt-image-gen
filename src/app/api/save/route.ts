// src/app/api/save/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { name, prompt, dataUrl } = await req.json();

    if (!dataUrl?.startsWith('data:image'))
      throw new Error('dataUrl is invalid');

    const similarity = Math.floor(Math.random() * 101); // TODO: mediapipe로 교체

    const user =
      (await prisma.user.findFirst({ where: { name } })) ??
      (await prisma.user.create({ data: { name } }));

    const result = await prisma.result.create({
      data: {
        prompt,
        imageUrl: dataUrl,
        similarity,
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (e) {
    console.error('[api/generate-save]', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
