#!/usr/bin/env node
// Page weight analyzer. Runs all reports in one pass:
//   1. Per-page totals (local + external)
//   2. Per-asset rollup (size × pages used)
//   3. Per-page asset breakdown
//
// External assets are fetched (GET) to measure real transfer size. CSS
// responses are parsed and their url(...) deps are fetched too (so Google
// Fonts CSS pulls in the woff2 files it loads).
//
// Usage: node scripts/page-weight.mjs [dist]

import { readFileSync, statSync, existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, resolve, dirname, relative } from "node:path";
import { gzipSync } from "node:zlib";

const DIST = resolve(process.argv[2] || "dist");

const ATTR_RE = /\b(?:src|href|poster|data-src)\s*=\s*["']([^"']+)["']/gi;
const SRCSET_RE = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
const CSS_URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
const ASSET_EXT = /\.(css|js|mjs|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp4|webm|mp3|wav|json|xml|pdf)(\?|#|$)/i;

// Pretend to be a real browser so Google Fonts returns woff2 (not ttf).
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

function extractRefs(html) {
  const refs = new Set();
  for (const m of html.matchAll(ATTR_RE)) refs.add(m[1]);
  for (const m of html.matchAll(SRCSET_RE))
    for (const part of m[1].split(",")) refs.add(part.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(CSS_URL_RE)) refs.add(m[1]);
  return [...refs];
}

function isAssetRef(ref) {
  if (!ref) return false;
  if (ref.startsWith("data:") || ref.startsWith("#") || ref.startsWith("mailto:")) return false;
  return ASSET_EXT.test(ref);
}

// Heuristic: the absence of a file extension on an external URL doesn't mean
// it's not an asset (e.g. Google Fonts /css2?... returns CSS). For external
// refs we accept based on context (script/link tag) rather than extension.
function isExternalAssetRef(ref) {
  if (!ref) return false;
  return /^https?:\/\//i.test(ref) || ref.startsWith("//");
}

function resolveLocal(ref, htmlPath) {
  if (!ref) return null;
  if (/^https?:\/\//i.test(ref) || ref.startsWith("//")) return null;
  const clean = ref.split("?")[0].split("#")[0];
  if (!clean) return null;
  const path = clean.startsWith("/")
    ? join(DIST, clean)
    : join(dirname(htmlPath), clean);
  return existsSync(path) && statSync(path).isFile() ? path : null;
}

function walkCss(cssPath, seen, collected) {
  if (seen.has(cssPath)) return;
  seen.add(cssPath);
  const buf = readFileSync(cssPath);
  collected.push({ path: cssPath, size: buf.length });
  const css = buf.toString("utf8");
  for (const m of css.matchAll(CSS_URL_RE)) {
    const r = resolveLocal(m[1], cssPath);
    if (!r || seen.has(r)) continue;
    if (r.endsWith(".css")) walkCss(r, seen, collected);
    else {
      seen.add(r);
      collected.push({ path: r, size: statSync(r).size });
    }
  }
}

// Fetch a URL and return { size, body, contentType }. Caches by URL.
const fetchCache = new Map();
async function fetchUrl(url) {
  if (fetchCache.has(url)) return fetchCache.get(url);
  const promise = (async () => {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA, accept: "*/*" } });
      const buf = Buffer.from(await res.arrayBuffer());
      return {
        size: buf.length,
        contentType: res.headers.get("content-type") || "",
        body: buf,
      };
    } catch (e) {
      return { size: 0, contentType: "", body: null, error: e.message };
    }
  })();
  fetchCache.set(url, promise);
  return promise;
}

// Recurse into external CSS to fetch the fonts/images it references.
async function walkExternal(url, seen, collected) {
  if (seen.has(url)) return;
  seen.add(url);
  const r = await fetchUrl(url);
  collected.push({ url, size: r.size, error: r.error });
  if (!r.body) return;
  if (r.contentType.includes("text/css") || url.endsWith(".css") || url.includes("/css")) {
    const css = r.body.toString("utf8");
    const subUrls = [];
    for (const m of css.matchAll(CSS_URL_RE)) {
      let u = m[1];
      if (u.startsWith("data:") || u.startsWith("#")) continue;
      if (u.startsWith("//")) u = "https:" + u;
      else if (!/^https?:/i.test(u)) {
        try {
          u = new URL(u, url).toString();
        } catch {
          continue;
        }
      }
      subUrls.push(u);
    }
    // Fetch font files in parallel.
    await Promise.all(
      subUrls.map(async (u) => {
        if (seen.has(u)) return;
        seen.add(u);
        const sub = await fetchUrl(u);
        collected.push({ url: u, size: sub.size, error: sub.error });
      })
    );
  }
}

const kb = (n) => (n / 1024).toFixed(1) + " KB";
const hr = (title) => `\n${"═".repeat(72)}\n  ${title}\n${"═".repeat(72)}`;

const files = (await walk(DIST)).filter((f) => f.endsWith(".html"));
const pages = [];

// First pass — collect refs.
for (const html of files) {
  const buf = readFileSync(html);
  const refs = extractRefs(buf.toString("utf8"));
  const seenLocal = new Set();
  const assets = [];
  const externalRefs = [];
  for (const ref of refs) {
    if (isExternalAssetRef(ref)) {
      // Tag-based heuristic: only count refs that look like browser-loaded
      // resources. Skip mailto, anchor, etc. (already filtered). Allow CSS
      // endpoints without extension (Google Fonts) by checking known hosts.
      let url = ref;
      if (url.startsWith("//")) url = "https:" + url;
      const isLikelyAsset =
        isAssetRef(ref) ||
        /fonts\.googleapis\.com|fonts\.gstatic\.com|plausible\.io|cdn\./i.test(url);
      if (isLikelyAsset) externalRefs.push(url);
      continue;
    }
    if (!isAssetRef(ref)) continue;
    const r = resolveLocal(ref, html);
    if (!r || seenLocal.has(r)) continue;
    if (r.endsWith(".css")) walkCss(r, seenLocal, assets);
    else {
      seenLocal.add(r);
      assets.push({ path: r, size: statSync(r).size });
    }
  }
  pages.push({
    page: html.replace(DIST, "") || "/",
    html: buf.length,
    htmlGz: gzipSync(buf).length,
    assets,
    externalRefs,
  });
}

// Second pass — fetch external assets (deduped across pages).
const allExternal = [...new Set(pages.flatMap((p) => p.externalRefs))];
console.error(`Fetching ${allExternal.length} external resources...`);
const externalFetched = []; // { url, size, error }
{
  const seen = new Set();
  await Promise.all(
    allExternal.map((u) => walkExternal(u, seen, externalFetched))
  );
}
const externalSizeMap = new Map(externalFetched.map((e) => [e.url, e]));

// Resolve per-page external bytes (including transitively-loaded font files).
function externalAssetsForPage(page) {
  const seen = new Set();
  const out = [];
  function add(url) {
    if (seen.has(url)) return;
    seen.add(url);
    const e = externalSizeMap.get(url);
    if (!e) return;
    out.push({ url, size: e.size, error: e.error });
    // If this was a CSS, find children we already fetched whose origin URL
    // was discovered during walkExternal — they're keyed by absolute URL too.
  }
  for (const u of page.externalRefs) add(u);
  // Pull in any transitive entries we recorded under any base CSS URL.
  // walkExternal collected children flat into the global map already, but we
  // only want to attribute them to pages that pulled their parent CSS in.
  // Simple approach: for each external CSS the page references, re-derive
  // children by URL prefix (gstatic for googleapis CSS).
  for (const u of page.externalRefs) {
    if (!/fonts\.googleapis\.com/.test(u)) continue;
    for (const e of externalFetched) {
      if (/fonts\.gstatic\.com/.test(e.url)) add(e.url);
    }
  }
  return out;
}

// Compute totals per page.
for (const p of pages) {
  p.assetBytes = p.assets.reduce((s, a) => s + a.size, 0);
  p.externalAssets = externalAssetsForPage(p);
  p.externalBytes = p.externalAssets.reduce((s, a) => s + a.size, 0);
  p.total = p.html + p.assetBytes + p.externalBytes;
}

// ── 1. Per-page totals ──────────────────────────────────────────────────
console.log(hr(`PER-PAGE TOTALS (${pages.length} pages, includes external)`));
console.log(
  "TOTAL".padStart(10),
  "HTML".padStart(10),
  "LOCAL".padStart(10),
  "EXTERNAL".padStart(10),
  "  PAGE"
);
const byTotal = [...pages].sort((a, b) => b.total - a.total);
for (const r of byTotal) {
  console.log(
    kb(r.total).padStart(10),
    kb(r.html).padStart(10),
    kb(r.assetBytes).padStart(10),
    kb(r.externalBytes).padStart(10),
    "  " + r.page
  );
}
const sumTotal = pages.reduce((s, r) => s + r.total, 0);
console.log(
  `\nAvg: ${kb(sumTotal / pages.length)}   Heaviest: ${kb(byTotal[0].total)} (${byTotal[0].page})   Lightest: ${kb(byTotal.at(-1).total)} (${byTotal.at(-1).page})`
);

// ── 2. Per-asset rollup (local + external combined) ─────────────────────
const byAsset = new Map();
for (const p of pages) {
  for (const a of p.assets) {
    const key = "local:" + a.path;
    let row = byAsset.get(key);
    if (!row) {
      row = { label: "/" + relative(DIST, a.path), size: a.size, pages: new Set(), kind: "local" };
      byAsset.set(key, row);
    }
    row.pages.add(p.page);
  }
  for (const a of p.externalAssets) {
    const key = "ext:" + a.url;
    let row = byAsset.get(key);
    if (!row) {
      row = { label: a.url, size: a.size, pages: new Set(), kind: "ext" };
      byAsset.set(key, row);
    }
    row.pages.add(p.page);
  }
}
const assetRows = [...byAsset.values()]
  .map((v) => ({ ...v, uses: v.pages.size, footprint: v.size * v.pages.size }))
  .sort((a, b) => b.footprint - a.footprint);

console.log(hr(`PER-ASSET ROLLUP (${assetRows.length} unique files; footprint = size × pages)`));
console.log(
  "FOOTPRINT".padStart(12),
  "SIZE".padStart(10),
  "PAGES".padStart(6),
  "KIND".padStart(6),
  "  PATH"
);
for (const r of assetRows) {
  console.log(
    kb(r.footprint).padStart(12),
    kb(r.size).padStart(10),
    String(r.uses).padStart(6),
    r.kind.padStart(6),
    "  " + r.label
  );
}
const localBytes = assetRows.filter((r) => r.kind === "local").reduce((s, r) => s + r.size, 0);
const extBytes = assetRows.filter((r) => r.kind === "ext").reduce((s, r) => s + r.size, 0);
console.log(`\nUnique local: ${kb(localBytes)}   Unique external: ${kb(extBytes)}`);

// ── 3. Per-page asset breakdown ─────────────────────────────────────────
console.log(hr(`PER-PAGE ASSET BREAKDOWN`));
for (const p of byTotal) {
  console.log(
    `\n${p.page}  —  total ${kb(p.total)}  (HTML ${kb(p.html)}, local ${kb(p.assetBytes)}, external ${kb(p.externalBytes)})`
  );
  for (const a of [...p.assets].sort((a, b) => b.size - a.size)) {
    console.log("  " + ("local " + kb(a.size)).padStart(18) + "  /" + relative(DIST, a.path));
  }
  for (const a of [...p.externalAssets].sort((a, b) => b.size - a.size)) {
    const tag = a.error ? "ERR" : "ext";
    console.log("  " + (tag + " " + kb(a.size)).padStart(18) + "  " + a.url);
  }
}
