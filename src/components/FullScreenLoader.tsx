'use client';

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="h-16 w-16 rounded-full border-4 border-black/20 border-t-black/70 animate-spin" />
    </div>
  );
}
