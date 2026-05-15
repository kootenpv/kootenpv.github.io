#!/usr/bin/env node
// Refreshes the four self-referential bot-stat answers in
// public/data/faq.json based on current public/data/*.json contents
// (sizes, class counts, question-variant counts). Mirrors
// distilltiny/scripts/stats.py so the chat data stays in sync without
// reaching outside this repo. Preserves faq.json's one-line-per-entry
// formatting via surgical regex replacement.

import { readFileSync, writeFileSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA = resolve(ROOT, "public/data");
const FILES = ["faq.json", "me.json", "website.json"];
const EMBED_DIM = 384;            // all-MiniLM-L6-v2 hidden size
const MODEL_DOWNLOAD_MB = 23;     // quantized model size

const kb = (n) => `${Math.round(n / 1024)}KB`;
const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ANSWER_FIELD = /"answer"\s*:\s*"(?:[^"\\]|\\.)*"/;

const sizes = {}, counts = {}, variants = {};
for (const f of FILES) {
  const path = resolve(DATA, f);
  sizes[f] = statSync(path).size;
  const entries = JSON.parse(readFileSync(path, "utf8"));
  counts[f] = entries.length;
  variants[f] = entries.reduce((s, e) => s + e.questions.length, 0);
}
const totalClasses = Object.values(counts).reduce((a, b) => a + b, 0);
const totalVariants = Object.values(variants).reduce((a, b) => a + b, 0);
const totalSize = Object.values(sizes).reduce((a, b) => a + b, 0);
const embeddedBytes = totalVariants * EMBED_DIM * 4;

const TARGETS = [
  ["model_size",
    `Model: ~${MODEL_DOWNLOAD_MB}MB quantized. Knowledge base: ~${kb(totalSize)} of JSON (about ${mb(embeddedBytes)} once embedded into ${EMBED_DIM}-dim vectors in RAM). Small enough to run on CPU in a browser.`],
  ["bot_data_size",
    `About ${kb(totalSize)} of JSON across the three files (faq.json ~${kb(sizes["faq.json"])}, me.json ~${kb(sizes["me.json"])}, website.json ~${kb(sizes["website.json"])}). Once embedded into ${EMBED_DIM}-dim float32 vectors at load time, the index is ~${mb(embeddedBytes)} in RAM.`],
  ["bot_total_footprint",
    `First load downloads ~${MODEL_DOWNLOAD_MB}MB for the model + ~${kb(totalSize)} of JSON knowledge. After caching, every subsequent visit is essentially free.`],
  ["bot_classes_count",
    `Around ${totalClasses} answer classes spread across faq.json (general chat), me.json (about Pascal), and website.json (the site itself), with ~${totalVariants} question paraphrases.`],
];

const faqPath = resolve(DATA, "faq.json");
let text = readFileSync(faqPath, "utf8");
const original = text;
const changed = [];

for (const [id, newAnswer] of TARGETS) {
  const objRe = new RegExp(
    `\\{[^{}]*?"id"\\s*:\\s*"${escapeRe(id)}"[^{}]*?\\}`,
    "s"
  );
  const m = text.match(objRe);
  if (!m) {
    console.error(`refresh-chat-stats: entry id "${id}" not found in faq.json`);
    process.exit(1);
  }
  const obj = m[0];
  const af = obj.match(ANSWER_FIELD);
  if (!af) {
    console.error(`refresh-chat-stats: entry "${id}" has no answer field`);
    process.exit(1);
  }
  let currentAnswer = null;
  try {
    currentAnswer = JSON.parse(af[0].slice(af[0].indexOf(":") + 1).trim());
  } catch {}
  if (currentAnswer === newAnswer) continue;
  const newObj = obj.replace(ANSWER_FIELD, () => `"answer": ${JSON.stringify(newAnswer)}`);
  text = text.slice(0, m.index) + newObj + text.slice(m.index + obj.length);
  changed.push(id);
}

if (text !== original) writeFileSync(faqPath, text, "utf8");

console.log(
  `chat-stats: ${totalClasses} classes, ${totalVariants} variants, ${kb(totalSize)} JSON, ~${mb(embeddedBytes)} embedded` +
    (changed.length ? ` (updated: ${changed.join(", ")})` : " (already up to date)")
);
