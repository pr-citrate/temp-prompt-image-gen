// src/app/result/page.tsx
import prisma from '@/lib/prisma';
import Link from 'next/link';
import SimilarityClient from '@/components/SimilarityClient';

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export const dynamic = 'force-dynamic';

export default async function ResultPage({searchParams}: Props) {
  const {id} = await searchParams;

  if (!id) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center">
        <p>id 파라미터가 없습니다.</p>
      </main>
    );
  }

  const result = await prisma.result.findUnique({
    where: {id},
    include: {user: true},
  });

  if (!result) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center">
        <p>결과를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const originalUrl = '/dev-image.png';
  const generatedUrl = result.imageUrl; // dataURL 저장됨

  return (
    <main className="min-h-screen w-full flex flex-col items-center py-16 px-4 gap-10">
      <h1 className="text-2xl font-semibold">{result.user.name}님의 결과</h1>


      <p className="text-gray-500">유사도 {Math.round(result.similarity)}%</p>

      <Link
        href="/leaderboard"
        className="mt-6 underline text-sm text-gray-500 hover:text-gray-300"
      >
        리더보드 보러가기
      </Link>

      {/* 정사각형 겹침 & 슬라이더 */}
      <SimilarityClient
        originalPath={originalUrl}
        imageUrl={generatedUrl}
      />
    </main>
  );
}
