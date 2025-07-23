// src/lib/similarity.ts
'use client';

import { FilesetResolver, ImageEmbedder, ImageEmbedderResult } from '@mediapipe/tasks-vision';

let embedderPromise: Promise<ImageEmbedder> | null = null;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      if (typeof self !== 'undefined') {
        (self as any).Module = (self as any).Module || {};
        (self as any).Module.print = () => {};
        (self as any).Module.printErr = () => {};
      }

      const filesets = await FilesetResolver.forVisionTasks('/models'); // wasm/js 경로
      const taskBuf = await fetch('/models/image_embedder.task').then(r => r.arrayBuffer());
      return await ImageEmbedder.createFromOptions(filesets, {
        baseOptions: {
          modelAssetBuffer: new Uint8Array(taskBuf),
        },
        runningMode: 'IMAGE',
        quantize: false,
      });
    })();
  }
  return embedderPromise;
}

function cosineSimilarity(a: Float32Array | number[], b: Float32Array | number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function embedFromUrl(url: string): Promise<number[]> {
  const img = await loadImage(url);
  const embedder = await getEmbedder();
  const res: ImageEmbedderResult = embedder.embed(img);
  return Array.from(res.embeddings[0].floatEmbedding as any);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}

/** -1~1 cosine → 0~100% 로 변환 */
export async function calcSimilarityPercent(originalUrl: string, generatedUrl: string) {
  const [e1, e2] = await Promise.all([embedFromUrl(originalUrl), embedFromUrl(generatedUrl)]);
  const cos = cosineSimilarity(e1, e2);
  return Math.round(((cos + 1) / 2) * 100);
}
