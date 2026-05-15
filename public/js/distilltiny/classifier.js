import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js";

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

let extractor = null;

export async function loadModel(onProgress) {
  if (extractor) return extractor;
  extractor = await pipeline("feature-extraction", MODEL_ID, {
    quantized: true,
    progress_callback: onProgress,
  });
  return extractor;
}

export async function embed(texts) {
  const out = await extractor(texts, { pooling: "mean", normalize: true });
  const [n, d] = out.dims;
  const vectors = [];
  for (let i = 0; i < n; i++) {
    vectors.push(out.data.subarray(i * d, (i + 1) * d));
  }
  return vectors;
}

export function cosineSim(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function classify(queryVec, classVecs, topK = 5) {
  const scored = classVecs.map((cv, i) => ({
    index: i,
    score: cosineSim(queryVec, cv.vector),
    classId: cv.classId,
    questionVariant: cv.text,
  }));
  scored.sort((a, b) => b.score - a.score);

  const byClass = new Map();
  for (const s of scored) {
    if (!byClass.has(s.classId) || byClass.get(s.classId).score < s.score) {
      byClass.set(s.classId, s);
    }
  }
  const aggregated = [...byClass.values()].sort((a, b) => b.score - a.score);
  return aggregated.slice(0, topK);
}
