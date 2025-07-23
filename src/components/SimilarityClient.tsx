'use client';

import { useEffect, useRef, useState, PointerEvent } from 'react';
import { calcSimilarityPercent } from '@/lib/similarity';

type Props = {
  imageUrl: string;
  originalPath?: string; // 기본값 /dev-image.png
};

export default function SimilarityClient({
  imageUrl,
  originalPath = '/dev-image.png',
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50); // 0~100
  const [dragging, setDragging] = useState(false);
  const [similarity, setSimilarity] = useState<number | null>(null);

  useEffect(() => {
    setSimilarity(Math.floor(Math.random() * 101));
  }, [imageUrl]);

  const move = (clientX: number) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newPos = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, newPos)));
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); // ★ 기본 드래그/선택 방지
    setDragging(true);
    move(e.clientX);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    e.preventDefault(); // ★ 이동 중 선택 방지
    move(e.clientX);
  };

  useEffect(() => {
    const stop = () => setDragging(false);
    window.addEventListener('pointerup', stop);
    return () => window.removeEventListener('pointerup', stop);
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative w-[512px] aspect-square rounded-3xl overflow-hidden shadow-2xl select-none"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onDragStart={(e) => e.preventDefault()} // ★ div 전체 드래그 방지
    >
      {/* bottom image */}
      <img
        src={originalPath}
        alt="original"
        className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        draggable={false}                          // ★ 이미지 드래그 비활성화
        onDragStart={(e) => e.preventDefault()}    // ★ 추가 방지
        style={{ WebkitUserSelect: 'none' }}         // ★ 사파리 대응
      />
      {/* top image clipped */}
      <img
        src={imageUrl}
        alt="generated"
        className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        style={{ clipPath: `inset(0 0 0 ${pos}%)`, WebkitUserSelect: 'none' }}
      />

      {/* divider + knob */}
      <div
        className="absolute inset-y-0 pointer-events-none"
        style={{ left: `calc(${pos}% - 1px)` }}
      >
        <div className="h-full w-[2px] bg-white/70" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-5 h-5 rounded-full bg-blue-500 shadow-md" />
      </div>

      {/* similarity badge */}
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md select-none pointer-events-none">
        유사도: {similarity ?? '--'}%
      </div>
    </div>
  );
}