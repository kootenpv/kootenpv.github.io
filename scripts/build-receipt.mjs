#!/usr/bin/env node
// Emits dist/receipt.txt — a fixed-width, mobile-friendly summary of every
// asset shipped in the build, categorised by kind. Linked from /llms.txt and
// surfaced via the in-browser CLI as `cat receipt.txt`.
//
// Local files only: no network fetches. Reads dist/ recursively.
//
// Usage: node scripts/build-receipt.mjs [dist]

import { readdir } from "node:fs/promises";
import { writeFileSync, statSync } from "node:fs";
import { join, resolve, extname } from "node:path";

const DIST = resolve(process.argv[2] || "dist");

const KIND_BY_EXT = {
  html: "HTML",
  css: "CSS",
  js: "JS",
  mjs: "JS",
  cjs: "JS",
  map: "JS",
  png: "IMG",
  jpg: "IMG",
  jpeg: "IMG",
  gif: "IMG",
  webp: "IMG",
  avif: "IMG",
  svg: "IMG",
  ico: "IMG",
  woff: "FONT",
  woff2: "FONT",
  ttf: "FONT",
  otf: "FONT",
  xml: "DATA",
  json: "DATA",
  txt: "DATA",
  md: "DATA",
  webmanifest: "DATA",
};

const ORDER = ["HTML", "CSS", "JS", "IMG", "FONT", "DATA", "OTHER"];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

function fmt(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function kindOf(file) {
  const ext = extname(file).slice(1).toLowerCase();
  return KIND_BY_EXT[ext] || "OTHER";
}

const files = await walk(DIST);

const buckets = new Map(ORDER.map((k) => [k, { n: 0, size: 0 }]));
let total = { n: 0, size: 0 };

for (const f of files) {
  const size = statSync(f).size;
  const kind = kindOf(f);
  const b = buckets.get(kind);
  b.n += 1;
  b.size += size;
  total.n += 1;
  total.size += size;
}

const today = new Date().toISOString().slice(0, 10);

// Render the table as a fixed-width grid so it lines up in any monospace
// renderer — tabs render unevenly in our in-browser CLI (and most plain text
// viewers) when cell contents straddle the 8-column tab stop.
const rows = [["KIND", "N", "SIZE"]];
for (const kind of ORDER) {
  const b = buckets.get(kind);
  if (b.n === 0) continue;
  rows.push([kind, String(b.n), fmt(b.size)]);
}
const totalRow = ["TOTAL", String(total.n), fmt(total.size)];
const widths = [0, 0, 0];
for (const r of [...rows, totalRow]) {
  for (let i = 0; i < r.length; i++) {
    if (r[i].length > widths[i]) widths[i] = r[i].length;
  }
}
const fmtRow = (r) =>
  r[0].padEnd(widths[0]) + "  " +
  r[1].padStart(widths[1]) + "  " +
  r[2].padStart(widths[2]);

const lines = [];
lines.push("== vks.ai · RECEIPT ==");
lines.push(`built  ${today}`);
lines.push("");
for (const r of rows) lines.push(fmtRow(r));
const rowWidth = widths[0] + 2 + widths[1] + 2 + widths[2];
lines.push("-".repeat(rowWidth));
lines.push(fmtRow(totalRow));
lines.push("");
lines.push("thank you for your bytes.");
lines.push("");

const out = lines.join("\n");
const outPath = join(DIST, "receipt.txt");
writeFileSync(outPath, out, "utf8");
console.log(`receipt: wrote ${outPath} (${total.n} files, ${fmt(total.size)})`);
