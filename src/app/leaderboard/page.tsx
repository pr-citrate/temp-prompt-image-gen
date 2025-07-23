import LeaderboardCard from '@/components/LeaderboardCard';
import prisma from '@/lib/prisma';

export default async function LeaderboardPage() {
  const results = await prisma.result.findMany({
    orderBy: [{ similarity: 'desc' }, { createdAt: 'asc' }],
    include: { user: true },
    take: 50,
  });

  return (
    <main className="min-h-screen w-full flex flex-col items-center py-16 px-4 gap-10">
      <h1 className="text-2xl font-semibold">Leaderboard</h1>
      <div className="grid gap-12 max-w-4xl w-full">
        {results.map((r, i) => (
          <LeaderboardCard
            key={r.id}
            rank={i + 1}
            name={r.user.name}
            imageUrl={r.imageUrl}
            similarity={Math.round(r.similarity)}
          />
        ))}
      </div>
    </main>
  );
}
