// src/components/LeaderboardCard.tsx
type Props = {
  rank: number;
  name: string;
  imageUrl: string;
  similarity: number;
};

export default function LeaderboardCard({ rank, name, imageUrl, similarity }: Props) {
  return (
    <div className="rounded-2xl p-4 glass border border-white/10 flex gap-4 items-center">
      <div className="text-xl font-semibold w-10 text-center">{rank}</div>
      <div className="w-24 h-24 overflow-hidden rounded-xl shrink-0">
        {/* data URL or /dev-image.png 모두 정상 */}
        <img
          src={imageUrl}
          alt={`${name} image`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-gray-500 mt-1">유사도 {similarity}%</p>
      </div>
    </div>
  );
}
