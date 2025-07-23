// src/components/PromptForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FullScreenLoader from '@/components/FullScreenLoader';
import { setCookie } from 'cookies-next';

const MAX_LEN = 100;
const ORIGINAL = '/dev-image.png';

export default function PromptForm() {
  const [username, setUsername] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (prompt.length > MAX_LEN) return alert('프롬프트는 100자 제한입니다.');

    setLoading(true);
    try {
      // 1) 이미지 생성 (서버)
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const genJson = await genRes.json();
      if (!genJson.ok) throw new Error(genJson.error || 'generate fail');

      const dataUrl: string = genJson.dataUrl;
      if (!dataUrl?.startsWith('data:image')) {
        throw new Error('invalid dataUrl');
      }

      // 2) Mediapipe 유사도 계산 (클라이언트)
      const { calcSimilarityPercent } = await import('@/lib/similarity');
      const s = await calcSimilarityPercent('/dev-image.png', dataUrl);

      const saveRes = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, prompt, dataUrl, similarity: s }),
      });
      const saveJson = await saveRes.json();
      if (!saveJson.ok) throw new Error(saveJson.error || 'save fail');

      // 이름 쿠키
      setCookie('username', username, { maxAge: 60 * 60 * 24 * 365 });

      // 4) 결과 페이지 이동
      router.push(`/result?id=${saveJson.id}`);
    } catch (err: any) {
      console.error(err);
      alert('에러: ' + (err?.message || err));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm mb-1 text-black/70">이름</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="닉네임"
          className="w-full rounded-xl bg-black/5 text-black px-4 py-2 outline-none focus:ring-2 ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-black/70">
          프롬프트 (최대 {MAX_LEN}자)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX_LEN))}
          maxLength={MAX_LEN}
          rows={3}
          placeholder="설명을 입력하세요..."
          className="w-full rounded-xl bg-black/5 text-black px-4 py-3 outline-none focus:ring-2 ring-blue-500 resize-none"
          required
        />
        <div className="text-right text-xs text-black/50">
          {prompt.length}/{MAX_LEN}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold disabled:opacity-50"
      >
        {loading ? '진행 중...' : '생성 시작'}
      </button>

      {loading && <FullScreenLoader />}
    </form>
  );
}
