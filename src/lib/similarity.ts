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
      const fileset = await FilesetResolver.forVisionTasks('/models'); // wasm 경로
      // 1) tflite 직접 로드
      const modelUrl = '/models/mobilenet_v3_small.tflite'
      const buf = await fetch(modelUrl).then(async (r) => {
        const ab = await r.arrayBuffer();
        // XML 방어 (404 등)
        const head = new TextDecoder().decode(ab.slice(0, 30)).trim();
        if (head.startsWith('<')) {
          throw new Error('Model file is XML (wrong URL).');
        }
        return new Uint8Array(ab);
      });

      return await ImageEmbedder.createFromOptions(fileset, {
        baseOptions: {
          modelAssetBuffer: buf,
        },
        runningMode: 'IMAGE',
        quantize: false,
      });
    })();
  }
  return embedderPromise;
}

function cosineSimilarity(a: number[] | Float32Array, b: number[] | Float32Array) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
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

async function embedFromUrl(url: string): Promise<number[]> {
  const img = await loadImage(url);
  const embedder = await getEmbedder();
  const res: ImageEmbedderResult = embedder.embed(img);
  return Array.from(res.embeddings[0].floatEmbedding);
}

/** 0~100 (%) */
export async function calcSimilarityPercent(originalUrl: string, generatedUrl: string) {
  const [e1, e2] = await Promise.all([embedFromUrl(originalUrl), embedFromUrl(generatedUrl)]);
  const cos = cosineSimilarity(e1, e2);
  return Math.round(((cos + 1) / 2) * 100);
}
