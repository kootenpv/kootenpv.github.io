import { loadModel, embed, classify } from "./classifier.js";
import { loadKnowledge, buildVariantIndex, indexByClassId } from "./data.js";

const CONFIDENCE_THRESHOLD = 0.45;

let classIndex = null;
let classVectors = null;
let ready = false;

export async function init({ onProgress } = {}) {
  if (ready) return;
  const report = (ev) => { try { onProgress?.(ev); } catch {} };

  report({ phase: "knowledge" });
  const entries = await loadKnowledge();
  if (entries.length === 0) {
    throw new Error("no knowledge entries loaded");
  }
  classIndex = indexByClassId(entries);
  const variants = buildVariantIndex(entries);

  report({ phase: "model", classes: entries.length, variants: variants.length });
  await loadModel((p) => {
    if (p && p.status === "progress" && p.file) {
      const pct = Math.round((p.loaded / (p.total || 1)) * 100);
      report({ phase: "download", file: p.file, pct, loaded: p.loaded, total: p.total });
    } else if (p && p.status === "ready") {
      report({ phase: "model_ready" });
    }
  });

  report({ phase: "encoding", total: variants.length });
  const texts = variants.map((v) => v.text);
  const BATCH = 64;
  const allVectors = new Array(texts.length);
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    const vecs = await embed(slice);
    for (let j = 0; j < vecs.length; j++) allVectors[i + j] = vecs[j];
    report({ phase: "encoding_progress", done: Math.min(i + BATCH, texts.length), total: texts.length });
    await new Promise((r) => setTimeout(r, 0));
  }
  classVectors = variants.map((v, i) => ({ ...v, vector: allVectors[i] }));

  ready = true;
  report({ phase: "ready" });
}

export async function ask(query) {
  if (!ready) throw new Error("distilltiny not initialized");
  const [qVec] = await embed([query]);
  const top = classify(qVec, classVectors, 5);
  const best = top[0];
  if (!best || best.score < CONFIDENCE_THRESHOLD) {
    return {
      answer: "I'm not sure — could you rephrase?",
      confident: false,
      top,
    };
  }
  const entry = classIndex.get(best.classId);
  return {
    answer: entry.answer,
    confident: true,
    classId: best.classId,
    score: best.score,
    top,
  };
}

export function isReady() {
  return ready;
}
