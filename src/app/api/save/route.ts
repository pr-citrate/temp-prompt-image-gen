// src/app/api/save/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { name, prompt, dataUrl, similarity } = await req.json();

    if (!dataUrl?.startsWith('data:image')) throw new Error('dataUrl invalid');

    const user =
      (await prisma.user.findFirst({ where: { name } })) ??
      (await prisma.user.create({ data: { name } }));

    const result = await prisma.result.create({
      data: {
        prompt,
        imageUrl: dataUrl,
        similarity: typeof similarity === 'number' ? similarity : 0,
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (e) {
    console.error('[api/save]', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
