// src/lib/similarity.ts
'use client';

import {
  FilesetResolver,
  ImageEmbedder,
  ImageEmbedderResult,
} from '@mediapipe/tasks-vision';

let embedderPromise: Promise<ImageEmbedder> | null = null;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks('/models');
      return await ImageEmbedder.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: '/models/image_embedder.task',
        },
        runningMode: 'IMAGE',
        quantize: false,
      });
    })();
  }
  return embedderPromise;
}

function cosineSimilarity(a: Float32Array | number[], b: Float32Array | number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
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
  return Array.from(res.embeddings[0].floatEmbedding);
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

/**
 * 두 이미지 URL을 받아 0~100 사이 유사도(%) 리턴
 */
export async function calcSimilarityPercent(originalUrl: string, generatedUrl: string): Promise<number> {
  const [e1, e2] = await Promise.all([embedFromUrl(originalUrl), embedFromUrl(generatedUrl)]);
  const cos = cosineSimilarity(e1, e2);
  return Math.round(((cos + 1) / 2) * 100); // -1~1 -> 0~100
}
