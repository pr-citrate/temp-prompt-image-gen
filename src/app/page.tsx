import PromptForm from '@/components/PromptForm';

export default function Home() {
  return (
    <main className="py-16 flex flex-col items-center gap-12">
      {/* 기준 이미지 미리보기 */}
      <div className="relative w-full max-w-[480px] aspect-square rounded-3xl overflow-hidden shadow-xl">
        <img
          src="/dev-image.png"
          alt="기준 이미지"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <p className="text-center text-black/60 text-sm">
        ※ 이 이미지를 기준으로 비슷한 이미지를 생성합니다.
      </p>

      <div className="glass-card w-full max-w-[480px] p-8">
        <PromptForm />
      </div>
    </main>
  );
}
