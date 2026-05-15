const SOURCES = [
  { file: "/data/faq.json", prefix: "faq" },
  { file: "/data/me.json", prefix: "me" },
  { file: "/data/website.json", prefix: "website" },
];

export async function loadKnowledge() {
  const entries = [];
  for (const { file, prefix } of SOURCES) {
    let json;
    try {
      const res = await fetch(file);
      if (!res.ok) {
        console.warn(`skipping ${file}: ${res.status}`);
        continue;
      }
      json = await res.json();
    } catch (err) {
      console.warn(`skipping ${file}:`, err.message);
      continue;
    }
    if (!Array.isArray(json)) {
      console.warn(`${file} is not a JSON array, skipping`);
      continue;
    }
    for (const row of json) {
      if (!row || !row.id || !row.answer || !Array.isArray(row.questions)) continue;
      entries.push({
        classId: `${prefix}:${row.id}`,
        category: row.category || prefix,
        answer: row.answer,
        questions: row.questions,
      });
    }
  }
  return entries;
}

export function buildVariantIndex(entries) {
  const variants = [];
  for (const entry of entries) {
    for (const q of entry.questions) {
      variants.push({ classId: entry.classId, text: q });
    }
  }
  return variants;
}

export function indexByClassId(entries) {
  const map = new Map();
  for (const e of entries) map.set(e.classId, e);
  return map;
}
